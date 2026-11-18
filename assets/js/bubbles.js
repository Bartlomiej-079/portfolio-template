(function () {
  "use strict";

  // Vanilla WebGL port of the hero metaballs on https://henrikkvamme.no
  // (https://github.com/henrikkvamme/portfolio — apps/web/src/components/metaball.tsx).
  // Ray-marched spheres, exponential smooth-min (join/break), and a spring-followed
  // cursor trail. Misses are transparent so the page theme shows through.
  //
  // The field is mathematically the same one the original shader drew; what
  // changed is where the work happens. See "Performance model" below.

  var TRAIL_LENGTH = window.bubblesConfig?.trailLength || 15;
  var TRAIL_SHIFT_INTERVAL_S = 0.03;
  var SPRING_STIFFNESS = 80;
  var SPRING_DAMPING = 7;
  var MAX_LAG_DISTANCE = 0.4;
  var MAX_DT_S = 1 / 30;

  // ── Look: unchanged ─────────────────────────────────────────────
  // Bubble size, trail size, density and every drift frequency below are
  // exactly the values this site has always used. None of the work here
  // retunes the effect — it only makes drawing it cheaper.
  var BUBBLE_SIZE = 0.35;
  var TRAIL_SIZE = 0.18;

  // Ambient floating bubbles (independent of the cursor trail) are sized off
  // the viewport, not the full page, so roughly TARGET_BUBBLES_PER_VIEWPORT
  // are visible in any given screenful — density (bubbles per px of page)
  // then stays constant as the page gets taller, instead of a count that's
  // spread across the whole page and thins out on long pages.
  var TARGET_BUBBLES_PER_VIEWPORT = 5;
  var MIN_BUBBLES = TARGET_BUBBLES_PER_VIEWPORT;
  var MAX_FRAME_BUBBLES = 48;

  /*
   * ── Performance model ───────────────────────────────────────────
   *
   * Three things decide the frame cost, in descending order:
   *
   * 1. HOW MANY PIXELS. The canvas used to be as tall as the whole app frame,
   *    so a long page (the demo page is seven screens) ray-marched seven
   *    screenfuls of framebuffer every frame, six of them permanently
   *    off-screen, and paid for it by scaling the device pixel ratio down to
   *    0.6. It is now viewport-sized and `position: fixed`, with the field
   *    scrolled underneath it via uBias.y and a scissor clipping it back to
   *    the frame. Pixel count no longer depends on page length, so the
   *    resolution can go up instead of down.
   *
   * 2. HOW MUCH WORK PER PIXEL. Each bubble's position and radius used to be
   *    derived inside the shader from a dozen hash1() calls (a sin each) plus
   *    five more sin/cos — recomputed for every bubble on every one of the ~20
   *    map() calls a pixel makes. That is the same arithmetic for every pixel
   *    on the screen, so it belongs on the CPU: buildSpheres() evaluates it
   *    once per frame and uploads the result as uSpheres. What is left in the
   *    inner loop is a subtract, a length and one exp.
   *
   * 3. HOW MANY PIXELS BOTHER MARCHING. Most of the screen is empty. Because
   *    exponential smooth-min is a plain sum (see fieldS), the field along a
   *    ray is bounded below by the same sum evaluated in 2D, which costs one
   *    pass instead of sixteen. If that bound clears the surface the pixel is
   *    a guaranteed miss and returns immediately. This is exact, not a
   *    heuristic — it never rejects a pixel that could have been hit.
   */

  var K = 7.0;           // smooth-min hardness — unchanged from the original
  var MAX_SPHERES = 48;  // shader uniform slots; clamped to the GPU's limit at init

  // A sphere whose nearest visible pixel is this far away contributes less
  // than exp(-K * FADE_NEAR) ≈ 1e-1 … exp(-K * FADE_FAR) ≈ 3e-3 of the sum,
  // i.e. it moves the surface by well under a pixel. Rather than dropping it
  // on a threshold — which would pop as it crossed — its weight is faded out
  // across the band, so it shrinks away smoothly and then costs nothing.
  var FADE_NEAR = 0.35;
  var FADE_FAR = 0.85;

  // Consecutive trail spheres closer together than this are folded into one.
  // Coincident spheres are exactly equivalent to a single sphere carrying the
  // sum of their weights, so a resting cursor costs one sphere instead of
  // fifteen; a moving one spreads them back out.
  var MERGE_TOL = 0.006;
  var MERGE_TOL2 = MERGE_TOL * MERGE_TOL;

  // ── Resolution governor ─────────────────────────────────────────
  // These metaballs are drawn at full opacity here, not as a faint wash, so
  // the floor is kept where the old fixed ladder had it and the ceiling is
  // the old MAX_DPR. The difference is that resolution is now chosen by what
  // the machine can actually sustain rather than by how long the page is.
  var DPR_MIN = 0.6;
  var DPR_MAX = 1.5;
  var DPR_STEP_INTERVAL_MS = 1500;
  // Judged against the display's own refresh interval rather than a fixed
  // millisecond budget: requestAnimationFrame is capped at the refresh rate,
  // so 16.7ms means "keeping up" on a 60Hz panel and "struggling" on a 120Hz
  // one, and there is no absolute number that reads correctly on both.
  var SLOW_FRAME_RATIO = 1.5;   // missing every other frame: back off
  var FAST_FRAME_RATIO = 1.15;  // riding the refresh rate: creep back up

  // ── Idle throttle ───────────────────────────────────────────────
  // With no pointer or scroll activity nothing on screen moves faster than a
  // slow drift, which reads identically at 32fps and costs half as much. Any
  // pointer move or scroll returns it to full rate immediately, so the cursor
  // trail and the scroll parallax are never the thing being throttled.
  var IDLE_AFTER_MS = 1200;
  var IDLE_FRAME_MS = 1000 / 32;

  var VERT = [
    "attribute vec3 position;",
    "void main() {",
    "  gl_Position = vec4(position, 1.0);",
    "}"
  ].join("\n");

  function buildFragShader(maxSpheres) {
    return [
      "precision highp float;",
      "",
      "const int MAX_SPHERES = " + maxSpheres + ";",
      "const float K = " + K.toFixed(1) + ";",
      "const float INV_K = " + (1 / K).toFixed(8) + ";",
      "const float EPS = 1e-4;",
      "const int ITR = 14;",
      "",
      // xyz = centre in shader space, w = exp(K * radius), pre-multiplied by
      // the off-screen fade. Radius never has to reach the shader: the field
      // only ever wants exp(-K * (length(p - c) - r)), and exp(K * r) is the
      // constant half of that.
      "uniform vec4 uSpheres[MAX_SPHERES];",
      "uniform int uCount;",
      "uniform float uScale;",   // shader-space units per device pixel
      "uniform vec2 uBias;",     // scroll offset + centring, folded together
      "uniform float uTime;",
      "uniform float uLight;",
      "",
      // Exponential smooth-min over N spheres is exactly -log(sum)/K: the
      // pairwise form -log(exp(-Ka) + exp(-Kb))/K composes into a single sum,
      // so the whole field costs one log rather than one per sphere, and one
      // exp per sphere rather than two.
      "float fieldS(vec3 p) {",
      "  float s = 0.0;",
      "  for (int i = 0; i < MAX_SPHERES; i++) {",
      "    if (i >= uCount) break;",
      "    vec4 b = uSpheres[i];",
      "    s += b.w * exp(-K * length(p - b.xyz));",
      "  }",
      "  return s;",
      "}",
      "",
      /*
       * The same field flattened into the screen plane.
       *
       * The camera is orthographic down -z, so a ray's closest possible
       * approach to any sphere is its distance to that sphere in xy. Summing
       * those the same way gives a lower bound on the field anywhere along the
       * ray, which retires an empty pixel in one pass instead of the fourteen
       * the march would have spent on it.
       *
       * It is also the silhouette's own distance function, which is what the
       * edge feather needs. The projection of a union of spheres is exactly
       * the union of their discs, so this is signed distance to the outline —
       * negative inside — and unlike the marched residual it is smooth and
       * well conditioned right at the edge, where sphere tracing grazes and
       * stalls. Returns the value in x and its gradient magnitude in y, since
       * turning a field value into a distance in pixels needs both.
       */
      "vec2 lowerBound(vec2 q) {",
      "  float s = 0.0;",
      "  vec2 n = vec2(0.0);",
      "  for (int i = 0; i < MAX_SPHERES; i++) {",
      "    if (i >= uCount) break;",
      "    vec4 b = uSpheres[i];",
      "    vec2 v = q - b.xy;",
      "    float l = max(length(v), 1e-5);",
      "    float e = b.w * exp(-K * l);",
      "    s += e;",
      "    n += (e / l) * v;",
      "  }",
      "  return vec2(-log(max(s, 1e-20)) * INV_K, length(n) / max(s, 1e-20));",
      "}",
      "",
      // Analytic gradient of the same field. d = -log(S)/K gives
      // grad d = (sum of w_i exp(-K d_i) * unit(p - c_i)) / S — a
      // weighted average of the individual sphere normals, exact and in one
      // pass, where the original took four extra full map() calls to
      // difference it numerically.
      "vec3 fieldNormal(vec3 p) {",
      "  vec3 n = vec3(0.0);",
      "  for (int i = 0; i < MAX_SPHERES; i++) {",
      "    if (i >= uCount) break;",
      "    vec4 b = uSpheres[i];",
      "    vec3 v = p - b.xyz;",
      "    float l = max(length(v), 1e-5);",
      "    n += (b.w * exp(-K * l) / l) * v;",
      "  }",
      "  return normalize(n);",
      "}",
      "",
      "float rnd3D(vec3 p) {",
      "  return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453123);",
      "}",
      "",
      "float noise3D(vec3 p) {",
      "  vec3 i = floor(p);",
      "  vec3 f = fract(p);",
      "  float a000 = rnd3D(i);",
      "  float a100 = rnd3D(i + vec3(1.0, 0.0, 0.0));",
      "  float a010 = rnd3D(i + vec3(0.0, 1.0, 0.0));",
      "  float a110 = rnd3D(i + vec3(1.0, 1.0, 0.0));",
      "  float a001 = rnd3D(i + vec3(0.0, 0.0, 1.0));",
      "  float a101 = rnd3D(i + vec3(1.0, 0.0, 1.0));",
      "  float a011 = rnd3D(i + vec3(0.0, 1.0, 1.0));",
      "  float a111 = rnd3D(i + vec3(1.0, 1.0, 1.0));",
      "  vec3 u = f * f * (3.0 - 2.0 * f);",
      "  float k0 = a000;",
      "  float k1 = a100 - a000;",
      "  float k2 = a010 - a000;",
      "  float k3 = a001 - a000;",
      "  float k4 = a000 - a100 - a010 + a110;",
      "  float k5 = a000 - a010 - a001 + a011;",
      "  float k6 = a000 - a100 - a001 + a101;",
      "  float k7 = -a000 + a100 + a010 - a110 + a001 - a101 - a011 + a111;",
      "  return k0 + k1 * u.x + k2 * u.y + k3 * u.z + k4 * u.x * u.y + k5 * u.y * u.z + k6 * u.z * u.x + k7 * u.x * u.y * u.z;",
      "}",
      "",
      "vec3 hsv2rgb(vec3 c) {",
      "  vec4 K4 = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
      "  vec3 p = abs(fract(c.xxx + K4.xyz) * 6.0 - K4.www);",
      "  return c.z * mix(K4.xxx, clamp(p - K4.xxx, 0.0, 1.0), c.y);",
      "}",
      "",
      "vec3 dropletColor(vec3 normal, vec3 rayDir) {",
      "  vec3 reflectDir = reflect(rayDir, normal);",
      "  float n0 = noise3D(reflectDir * 2.0 + uTime);",
      "  float n1 = noise3D(reflectDir * 2.0 - uTime);",
      // Oil-on-water iridescence, but purple is still the fluid's base colour —
      // the rainbow rides on top as a thin film sheen (hue sweeping with
      // viewing angle + the old shimmer noise) rather than replacing the base,
      // and the sparkle highlight is tinted violet instead of blown to white.
      "  vec3 purple = vec3(0.42, 0.20, 0.70);",
      "  float fresnel = 1.0 - max(dot(normal, -rayDir), 0.0);",
      "  float hue = fract(fresnel * 2.4 + n0 * 0.5 - n1 * 0.4 + uTime * 0.035);",
      "  vec3 iridescence = hsv2rgb(vec3(hue, 0.85, 0.9));",
      "  float filmStrength = 0.22 + 0.22 * n0;",
      "  vec3 base = purple * (0.55 + 0.55 * n1);",
      "  vec3 sheen = mix(base, iridescence, filmStrength);",
      "  float sparkle = pow(clamp(n0 * n1 * 4.0, 0.0, 1.0), 6.0);",
      "  return sheen + purple * sparkle * 1.2;",
      "}",
      "",
      "void main() {",
      "  vec2 p = gl_FragCoord.xy * uScale + uBias;",
      "",
      // One pixel measured in shader space — the width the silhouette is
      // feathered over, which is what lets the canvas render below 1x DPR
      // without the blobs going crunchy at the edge.
      "  float px = uScale;",
      "  vec2 lb = lowerBound(p);",
      "  float feather = px * max(lb.y, 1e-3);",
      "  float alpha = clamp(0.5 - lb.x / feather, 0.0, 1.0);",
      "  if (alpha <= 0.0) { gl_FragColor = vec4(0.0); return; }",
      "",
      // Coverage is already decided; the march is only here to find where on
      // the surface this pixel lands, so it can be shaded.
      //
      // The ray direction is (0, 0, -1), so marching only ever moves z and
      // ray.xy stays at p. Everything in the field lives well inside |z| < 1:
      // the deepest a sphere drifts is depthAmp, and smooth-min can push the
      // surface out by at most log(total weight) / K on top of that. Past
      // there the ray has already gone by whatever it came closest to.
      "  vec3 ray = vec3(p, 1.0);",
      "  float dist = 0.0;",
      "  for (int i = 0; i < ITR; ++i) {",
      "    dist = -log(max(fieldS(ray), 1e-20)) * INV_K;",
      "    if (dist < EPS) break;",
      "    ray.z -= dist;",
      "    if (ray.z < -1.2) break;",
      "  }",
      "",
      "  vec3 rayDirection = vec3(0.0, 0.0, -1.0);",
      "  vec3 normal = fieldNormal(ray);",
      "  vec3 color = dropletColor(normal, rayDirection);",
      "  float fresnel = 1.0 - max(dot(normal, -rayDirection), 0.0);",
      "  float rim = pow(fresnel, 2.5);",
      "  // Purple-and-rainbow fill dimmed into a dark violet base, violet rim highlight on top.",
      "  vec3 darkColor = mix(vec3(0.08, 0.05, 0.12), color, 0.8);",
      "  darkColor += vec3(0.65, 0.6, 0.85) * rim * 0.5;",
      "  // Same fill lifted toward a soft lilac for the light theme (analog).",
      "  vec3 lightColor = mix(vec3(0.85, 0.80, 0.92), color, 0.6);",
      "  lightColor += vec3(0.55, 0.50, 0.75) * rim * 0.4;",
      "  gl_FragColor = vec4(mix(darkColor, lightColor, uLight), alpha);",
      "}"
    ].join("\n");
  }

  var canvas, gl, program, frameEl;
  var locSpheres, locCount, locScale, locBias, locTime, locLight;
  var lightTheme = 0;
  var running = false;
  var rafId = null;
  var lastT = null;
  var lastDrawT = 0;
  var trailAccum = 0;
  var dpr = 1;
  var baseDpr = 1;

  var viewport = { x: 0, y: 0 };
  // The app frame's padding box, in page coordinates — the box the canvas used
  // to physically span. The field is still laid out across exactly this box,
  // so the metaballs sit where they always did; the canvas just no longer has
  // to be that tall to draw them.
  var frame = { left: 0, top: 0, width: 1, height: 1 };
  // The divisor the shader normalises by, kept as min(frame width, frame
  // height) the way the old canvas-derived one was.
  var unit = 1;
  var offsetY = 0;

  var target = { x: 0, y: 0 };
  var leader = { x: 0, y: 0 };
  var velocity = { x: 0, y: 0 };
  var trail = [];

  var bubbleParams = [];
  var frameBubbleCount = 0;
  var spheres = new Float32Array(MAX_SPHERES * 4);
  var sphereCount = 0;

  // Visible band in shader space, recomputed per frame for the fade test.
  var halfX = 1, halfY = 1, bandLo = 0, bandHi = 0;

  // Frame-time EMA driving the resolution governor, plus the shortest gap
  // seen so far as a stand-in for the display's refresh interval.
  var frameEma = 0;
  var refreshMs = 16.7;
  var lastGovernT = 0;
  var lastActivityT = -1e9;
  var idleLastFrame = true;

  function compile(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function linkProgram(frag) {
    var vs = compile(gl.VERTEX_SHADER, VERT);
    var fs = compile(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, "position");
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
      return null;
    }
    return prog;
  }

  // ── Geometry ────────────────────────────────────────────────────

  // Viewport CSS pixels -> shader space. The pointer trail lives in the same
  // frame-anchored space the bubbles do, so it stays put on the page as you
  // scroll, exactly as it did when the canvas was pinned to the frame.
  function viewportToShader(x, y, out) {
    out.x = ((x - frame.left) * 2 - frame.width) / unit;
    out.y = (viewport.y - y * 2) / unit + offsetY;
  }

  // The same fract(sin(n) * 43758.5) the shader used, moved to the CPU. The
  // constants differ in the last bits at double precision, which reshuffles
  // which bubble sits where and changes nothing else.
  function hash1(n) {
    var s = Math.sin(n) * 43758.5453123;
    return s - Math.floor(s);
  }

  // Every drift and pulse constant below is the one the shader had inline.
  function buildBubbleParams(count) {
    bubbleParams.length = 0;
    var band = 1 / count;
    for (var i = 0; i < count; i++) {
      var seed = i * 12.9898 + 1.0;
      bubbleParams.push({
        baseX: 0.12 + 0.76 * hash1(seed),
        baseY: band * (i + 0.5) + (hash1(seed + 1) - 0.5) * band * 0.7,
        phase: hash1(seed + 2) * 6.2831853,
        freqX: 0.18 + 0.28 * hash1(seed + 3),
        freqY: 0.14 + 0.26 * hash1(seed + 4),
        ampX: 0.05 + 0.10 * hash1(seed + 5),
        ampY: 0.04 + 0.09 * hash1(seed + 6),
        depthFreq: 0.08 + 0.12 * hash1(seed + 7),
        depthAmp: 0.15 + 0.15 * hash1(seed + 8),
        rBase: 0.22 + 0.16 * hash1(seed + 9),
        rPulseAmp: 0.03 + 0.04 * hash1(seed + 10),
        rPulseFreq: 0.4 + 0.6 * hash1(seed + 11)
      });
    }
    frameBubbleCount = count;
  }

  /*
   * 1 while any part of the sphere is on screen or just outside it, ramping to
   * 0 across the FADE_NEAR…FADE_FAR band. Multiplying the sphere's weight by
   * this shrinks it away as it leaves rather than deleting it outright, so
   * nothing pops, and once it reaches 0 the sphere is dropped from the upload
   * and the shader never loops over it.
   */
  function visibleFade(x, y, r) {
    var dx = x < -halfX ? -halfX - x : (x > halfX ? x - halfX : 0);
    var dy = y < bandLo ? bandLo - y : (y > bandHi ? y - bandHi : 0);
    var edge = Math.sqrt(dx * dx + dy * dy) - r;
    if (edge <= FADE_NEAR) return 1;
    if (edge >= FADE_FAR) return 0;
    var t = 1 - (edge - FADE_NEAR) / (FADE_FAR - FADE_NEAR);
    return t * t * (3 - 2 * t);
  }

  function pushSphere(x, y, z, w) {
    if (sphereCount >= MAX_SPHERES) return -1;
    var o = sphereCount * 4;
    spheres[o] = x;
    spheres[o + 1] = y;
    spheres[o + 2] = z;
    spheres[o + 3] = w;
    return sphereCount++;
  }

  /*
   * Everything the shader used to derive per pixel, evaluated once per frame.
   * Positions come out in shader space; the weight each sphere carries is
   * exp(K * radius) scaled by its off-screen fade.
   */
  function buildSpheres(time) {
    sphereCount = 0;

    halfX = frame.width / unit;
    halfY = viewport.y / unit;
    bandLo = offsetY - halfY;
    bandHi = offsetY + halfY;

    var xSpan = frame.width / unit;
    var ySpan = frame.height / unit;

    for (var i = 0; i < bubbleParams.length; i++) {
      var b = bubbleParams[i];
      // Fractions of frame width / full frame height, exactly as the old
      // normalizedToShader() read them.
      var nx = b.baseX + Math.sin(time * b.freqX + b.phase) * b.ampX;
      var ny = b.baseY + Math.cos(time * b.freqY + b.phase) * b.ampY;
      var r = (b.rBase + b.rPulseAmp * Math.sin(time * b.rPulseFreq + b.phase)) * BUBBLE_SIZE;
      var sx = (nx * 2 - 1) * xSpan;
      var sy = (ny * 2 - 1) * ySpan;
      var fade = visibleFade(sx, sy, r);
      if (fade <= 0) continue;
      var sz = Math.sin(time * b.depthFreq + b.phase) * b.depthAmp;
      pushSphere(sx, sy, sz, Math.exp(K * r) * fade);
    }

    var baseRadius = 4.5e-2 * TRAIL_SIZE;
    var headRadius = baseRadius * TRAIL_LENGTH;
    // Stacked trail spheres fuse into a blob of radius headRadius +
    // log(TRAIL_LENGTH)/K, far wider than any one of them — cull against
    // that, or a resting trail would vanish while its blob was still visible.
    var trailReach = headRadius + Math.log(TRAIL_LENGTH) / K;
    var merged = -1;
    for (i = 0; i < TRAIL_LENGTH; i++) {
      var tr = headRadius - baseRadius * i;
      if (tr <= 0) break;
      var tx = trail[i].x;
      var ty = trail[i].y;
      var tf = visibleFade(tx, ty, trailReach);
      if (tf <= 0) continue;
      var tw = Math.exp(K * tr) * tf;
      if (merged >= 0) {
        var mo = merged * 4;
        var mdx = spheres[mo] - tx;
        var mdy = spheres[mo + 1] - ty;
        if (mdx * mdx + mdy * mdy < MERGE_TOL2) {
          spheres[mo + 3] += tw;
          continue;
        }
      }
      merged = pushSphere(tx, ty, 0, tw);
      if (merged < 0) break;
    }
  }

  // ── Sizing ──────────────────────────────────────────────────────

  function applyCanvasSize() {
    var w = Math.max(1, Math.round(frame.width * dpr));
    var h = Math.max(1, Math.round(viewport.y * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w;
    canvas.height = h;
  }

  /*
   * Cheap now, and no longer reallocating a page-tall framebuffer every time
   * async content grows the page — it only re-derives the box the field is
   * laid out across. The canvas itself is always one viewport.
   */
  function resize() {
    viewport.x = window.innerWidth;
    viewport.y = window.innerHeight;

    // The canvas used to be inset:0 inside the frame, i.e. exactly its padding
    // box. Reproduce that box here so the field keeps the same footprint.
    var scrollY = window.pageYOffset || 0;
    if (frameEl) {
      var rect = frameEl.getBoundingClientRect();
      frame.left = rect.left + frameEl.clientLeft;
      frame.top = rect.top + frameEl.clientTop + scrollY;
      frame.width = Math.max(1, frameEl.clientWidth);
      frame.height = Math.max(viewport.y, frameEl.scrollHeight);
    } else {
      frame.left = 0;
      frame.top = 0;
      frame.width = viewport.x;
      frame.height = viewport.y;
    }
    unit = Math.max(1, Math.min(frame.width, frame.height));

    // Pin the canvas to the viewport over the frame's columns. Both are
    // constant while scrolling, so this never runs mid-scroll.
    canvas.style.left = frame.left + "px";
    canvas.style.top = "0px";
    canvas.style.width = frame.width + "px";
    canvas.style.height = viewport.y + "px";

    baseDpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
    if (dpr === 1) dpr = Math.min(window.devicePixelRatio || 1, 1);
    dpr = Math.max(DPR_MIN, Math.min(baseDpr, dpr));
    applyCanvasSize();

    // Keep ambient bubble density (bubbles per viewport-height of page)
    // constant: more total bubbles on long pages, fewer on short ones, but
    // always ~TARGET_BUBBLES_PER_VIEWPORT visible in any one screenful.
    var screensTall = frame.height / Math.max(1, viewport.y);
    var want = Math.min(MAX_FRAME_BUBBLES, Math.max(MIN_BUBBLES, Math.round(TARGET_BUBBLES_PER_VIEWPORT * screensTall)));
    if (want !== frameBubbleCount) buildBubbleParams(want);
  }

  // ── Draw ────────────────────────────────────────────────────────

  function draw(time) {
    // p = fragCoord * uScale + uBias reproduces the old
    // (fragCoord * 2 - resolution) / min(resolution) with the page's scroll
    // position folded in, so a fixed canvas shows the same slice of the field
    // the frame-tall one did.
    var scale = 2 / (unit * dpr);
    var biasX = -canvas.width / (unit * dpr);
    var biasY = -canvas.height / (unit * dpr) + offsetY;

    gl.disable(gl.SCISSOR_TEST);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // The canvas covers the whole viewport but the frame may not — near the
    // top and bottom of the page its edge is on screen. A scissor keeps the
    // metaballs inside the frame the way being a child of it used to, and
    // saves shading the strip outside at the same time.
    var scrollY = window.pageYOffset || 0;
    var top = frame.top - scrollY;
    var y0 = Math.max(0, top);
    var y1 = Math.min(viewport.y, top + frame.height);
    if (y1 <= y0) return;
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(
      0,
      Math.floor((viewport.y - y1) * dpr),
      canvas.width,
      Math.max(1, Math.ceil((y1 - y0) * dpr))
    );

    gl.useProgram(program);
    gl.uniform1f(locTime, time);
    gl.uniform1f(locLight, lightTheme);
    gl.uniform1f(locScale, scale);
    gl.uniform2f(locBias, biasX, biasY);
    gl.uniform1i(locCount, sphereCount);
    // Uploaded whole rather than sliced to sphereCount: 48 vec4s is nothing to
    // send, and a subarray() view per frame is a small allocation per frame.
    // The shader breaks out of its loop at uCount, so the tail is never read.
    gl.uniform4fv(locSpheres, spheres);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // ── Loop ────────────────────────────────────────────────────────

  function step(dt) {
    var fx = SPRING_STIFFNESS * (target.x - leader.x) - SPRING_DAMPING * velocity.x;
    var fy = SPRING_STIFFNESS * (target.y - leader.y) - SPRING_DAMPING * velocity.y;
    velocity.x += fx * dt;
    velocity.y += fy * dt;
    leader.x += velocity.x * dt;
    leader.y += velocity.y * dt;

    var dx = target.x - leader.x;
    var dy = target.y - leader.y;
    var distSq = dx * dx + dy * dy;
    var maxSq = MAX_LAG_DISTANCE * MAX_LAG_DISTANCE;
    if (distSq > maxSq) {
      var dist = Math.sqrt(distSq);
      var drag = (dist - MAX_LAG_DISTANCE) / dist;
      leader.x += dx * drag;
      leader.y += dy * drag;
    }

    trailAccum += dt;
    while (trailAccum >= TRAIL_SHIFT_INTERVAL_S) {
      trailAccum -= TRAIL_SHIFT_INTERVAL_S;
      for (var i = TRAIL_LENGTH - 1; i > 0; i--) {
        trail[i].x = trail[i - 1].x;
        trail[i].y = trail[i - 1].y;
      }
      trail[0].x = leader.x;
      trail[0].y = leader.y;
    }
  }

  /*
   * Nudge the render resolution to fit the machine.
   *
   * The signal is the gap between consecutive frames, which unlike the time
   * spent inside this callback includes the GPU work — the part that actually
   * costs here. Only back-to-back drawn frames are measured, so the idle
   * throttle's deliberate 32fps is never mistaken for a struggling machine.
   * Frame time is smoothed so one hitch cannot drop the page a step, and moves
   * are rate limited because each reallocates the drawing buffer.
   */
  function govern(t, delta) {
    if (delta > 0 && delta < 100) {
      /*
       * What a healthy frame costs on this display. Tracked as an asymmetric
       * average — quick to follow a faster frame, very slow to follow a
       * slower one — rather than the outright minimum, which one freakishly
       * short frame would peg forever, leaving the governor convinced the
       * machine was permanently behind and winding resolution down to the
       * floor for good.
       */
      refreshMs += (delta - refreshMs) * (delta < refreshMs ? 0.5 : 0.002);
      refreshMs = Math.max(5, Math.min(40, refreshMs));
      frameEma = frameEma ? frameEma + (delta - frameEma) * 0.1 : delta;
    }
    if (!frameEma || t - lastGovernT < DPR_STEP_INTERVAL_MS) return;
    lastGovernT = t;
    var next = dpr;
    if (frameEma > refreshMs * SLOW_FRAME_RATIO) next = Math.max(DPR_MIN, dpr * 0.85);
    else if (frameEma < refreshMs * FAST_FRAME_RATIO) next = Math.min(baseDpr, Math.min(DPR_MAX, dpr * 1.1));
    if (Math.abs(next - dpr) > 0.01) {
      dpr = next;
      applyCanvasSize();
    }
  }

  function frame_(t) {
    if (!running) return;
    rafId = requestAnimationFrame(frame_);

    var idle = (t - lastActivityT) > IDLE_AFTER_MS;
    if (idle && lastDrawT && (t - lastDrawT) < IDLE_FRAME_MS) return;
    var wasIdle = idleLastFrame;
    idleLastFrame = idle;

    if (lastT === null) lastT = t;
    var dt = Math.min((t - lastT) / 1000, MAX_DT_S);
    // Only a gap between two frames that both drew at full rate says anything
    // about how fast this machine is. The first frame after an idle stretch
    // measures the throttle's own 32fps, not the machine's.
    var delta = (!idle && !wasIdle && lastDrawT && lastDrawT === lastT) ? t - lastDrawT : 0;
    lastT = t;
    lastDrawT = t;

    // Fixed canvas: the field is scrolled under it rather than the canvas
    // being as tall as the frame.
    var scrollY = window.pageYOffset || 0;
    offsetY = (frame.height - viewport.y - 2 * (scrollY - frame.top)) / unit;

    step(dt);
    buildSpheres(t / 1000);
    draw(t / 1000);
    govern(t, delta);
  }

  function start() {
    if (running || !program) return;
    running = true;
    lastT = null;
    lastDrawT = 0;
    canvas.classList.add("is-active");
    rafId = requestAnimationFrame(frame_);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    canvas.classList.remove("is-active");
    if (gl) {
      gl.disable(gl.SCISSOR_TEST);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }

  var perfModeOn = false;
  var animationsOn = false;

  // Both flags come from attributes on <html> set by theme.js (and, before
  // any script runs, by an inline bootstrap snippet in each page's <head> —
  // see index.html) so the enabled/disabled state is already resolved by the
  // time this file loads, with no dedicated toggle element of its own to wire.
  function syncGateFlags() {
    perfModeOn = document.documentElement.getAttribute("data-perf-mode") === "on";
    animationsOn = document.documentElement.getAttribute("data-animations") === "on";
  }

  function updateRunningState() {
    if (animationsOn) start(); else stop();
  }

  function markActivity() {
    lastActivityT = performance.now();
  }

  function init() {
    canvas = document.getElementById("bubbles");
    if (!canvas) return;
    // The canvas lives as a sibling of .app-frame (not a descendant), so that
    // .app-frame's backdrop-filter never becomes its fixed-position containing
    // block — see the CSS comment above .bubbles-canvas. Fall back to the
    // parent for shells (.bp-shell/.pp-shell) that never had that problem.
    frameEl = document.querySelector(".app-frame") || canvas.parentElement;

    gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false
    });
    if (!gl) return;

    // GL ES 2.0 only guarantees 16 fragment uniform vectors; real hardware
    // gives hundreds. Size the sphere array to what this GPU actually has,
    // leaving room for the handful of scalars alongside it.
    var maxVec = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) || 64;
    MAX_SPHERES = Math.max(8, Math.min(MAX_SPHERES, maxVec - 8));
    spheres = new Float32Array(MAX_SPHERES * 4);

    program = linkProgram(buildFragShader(MAX_SPHERES));
    if (!program) return;

    locSpheres = gl.getUniformLocation(program, "uSpheres[0]");
    locCount = gl.getUniformLocation(program, "uCount");
    locScale = gl.getUniformLocation(program, "uScale");
    locBias = gl.getUniformLocation(program, "uBias");
    locTime = gl.getUniformLocation(program, "uTime");
    locLight = gl.getUniformLocation(program, "uLight");

    function syncTheme() {
      lightTheme = document.documentElement.getAttribute("data-theme") === "light" ? 1 : 0;
    }
    syncTheme();
    var themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 0,
       3, -1, 0,
      -1,  3, 0
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    for (var i = 0; i < TRAIL_LENGTH; i++) trail.push({ x: 0, y: 0 });

    resize();

    var resizePending = false;
    function scheduleResize() {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(function () {
        resizePending = false;
        resize();
      });
    }

    window.addEventListener("resize", scheduleResize);
    window.addEventListener("load", scheduleResize);
    window.addEventListener("scroll", markActivity, { passive: true });
    window.addEventListener("pointermove", function (e) {
      markActivity();
      viewportToShader(e.clientX, e.clientY, target);
    }, { passive: true });

    // Content (markdown, cards, tab switches) loads asynchronously and can
    // grow the page well after the initial resize(). Only the frame box and
    // the bubble count depend on it now — the drawing buffer does not — so
    // this is a scalar update, not a framebuffer reallocation.
    if (window.ResizeObserver) {
      var contentResizeObserver = new ResizeObserver(scheduleResize);
      contentResizeObserver.observe(document.body);
      if (frameEl) contentResizeObserver.observe(frameEl);
    }

    syncGateFlags();
    var gateObserver = new MutationObserver(function () {
      syncGateFlags();
      updateRunningState();
    });
    gateObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-perf-mode", "data-animations"] });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else updateRunningState();
    });

    updateRunningState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
