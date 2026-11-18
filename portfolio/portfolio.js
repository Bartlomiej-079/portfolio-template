/* ══════════════════════════════════════════════════════════════════
   /portfolio — interaction layer
     · scales the PDF's coordinate system to the viewport (--u)
     · deep scroll parallax, phase-locked to each chapter's copy
     · staggered reveal on load and on scroll
     · pointer tilt + specular glare on every screenshot
     · letter-level hover animation on the headings
     · sparkle bursts on image and link hover
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ── 1. Unit scaling ────────────────────────────────────────────
     --u is "one PDF point, in CSS pixels". Derived from clientWidth
     rather than 100vw so the scrollbar doesn't skew the whole page. */
  var SHEET_MAX = 1120;
  var PAGE_W = 595;
  var REFLOW_AT = 880;
  var u = 1;
  var reflow = false;

  function measure() {
    var vw = root.clientWidth;
    reflow = vw <= REFLOW_AT;
    u = reflow ? 1 : Math.min(vw, SHEET_MAX) / PAGE_W;
    root.style.setProperty("--vw", vw + "px");
    if (!reflow) root.style.setProperty("--u", u + "px");
    else root.style.removeProperty("--u");
  }
  measure();

  /* ── 2. Dice the display type into words and letters ────────────
     Words stay whole so the reflowed column can still wrap; only the
     letters inside them become animatable boxes. */
  function split(el) {
    var text = el.textContent;
    if (!text || el.querySelector(".ch")) return;

    var frag = document.createDocumentFragment();
    var parts = text.split(/(\s+)/);
    var n = 0;

    for (var w = 0; w < parts.length; w++) {
      var part = parts[w];
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        continue;
      }
      var word = document.createElement("span");
      word.className = "wd";
      for (var c = 0; c < part.length; c++) {
        var ch = document.createElement("span");
        ch.className = "ch";
        ch.style.setProperty("--i", String(n++));
        ch.textContent = part.charAt(c);
        word.appendChild(ch);
      }
      frag.appendChild(word);
    }

    /* Headings keep a clean accessible name so assistive tech never
       has to read the text back one <span> at a time. */
    if (el.tagName === "H1" || el.tagName === "H2") el.setAttribute("aria-label", text);

    el.textContent = "";
    el.appendChild(frag);
    el.classList.add("split");
  }

  Array.prototype.forEach.call(
    document.querySelectorAll(".title, .hero-name, .the-end"),
    split
  );

  /* Stagger the idle breathing so the engravings never pulse in sync. */
  Array.prototype.forEach.call(
    document.querySelectorAll(".art:not(.art--hero) img"),
    function (img, i) {
      img.style.setProperty("--bd", (12.5 + ((i * 2.7) % 6)).toFixed(1) + "s");
    }
  );

  /* ── 3. Reveal on load + on scroll ──────────────────────────────
     Each chapter staggers its own layers so a section assembles
     itself rather than everything popping at once. */
  var revealTargets = Array.prototype.slice.call(
    document.querySelectorAll(
      ".shot, .art, .laurel, .title, .prose, .the-end, .reveal"
    )
  );

  revealTargets.forEach(function (el) {
    var d = el.getAttribute("data-delay");
    if (d) {
      el.style.setProperty("--d", d + "ms");
      return;
    }
    var order = { ART: 0, SHOT: 60, LAUREL: 340, TITLE: 150, PROSE: 240 };
    var key = el.classList.contains("art")
      ? "ART"
      : el.classList.contains("shot")
      ? "SHOT"
      : el.classList.contains("laurel")
      ? "LAUREL"
      : el.classList.contains("title")
      ? "TITLE"
      : "PROSE";
    el.style.setProperty("--d", order[key] + "ms");
  });

  if (reduce || !("IntersectionObserver" in window)) {
    revealTargets.forEach(function (el) { el.classList.add("is-in"); });
    var heroArt = document.querySelector(".art--hero");
    if (heroArt) heroArt.classList.add("is-in");
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.02 }
    );
    revealTargets.forEach(function (el) { io.observe(el); });

    /* The hero is above the fold — kick it off on the first frame. */
    requestAnimationFrame(function () {
      var hero = document.querySelector(".art--hero");
      if (hero) hero.classList.add("is-in");
    });
  }

  /* ── 4. Parallax ────────────────────────────────────────────────
     Phase (p) runs -1 → +1 as a chapter crosses the viewport, and is
     measured from that chapter's *copy*, not from each layer's own
     box. So every layer in a section shares one clock and they all
     pass through p = 0 — their exact PDF coordinates — at the moment
     the section's text sits in the middle of the screen. Away from
     that reading position they travel hard: GAIN multiplies the
     authored depth so the engravings and screenshots slide several
     times further than the page beneath them.

     depth is in PDF points. Positive lags behind the scroll (further
     away), negative runs ahead of it (closer). */
  var GAIN = 6;            /* travel multiplier. The engravings and the
                              screenshots pull apart by (26 + 10) * GAIN
                              PDF points across a full sweep — raise it
                              for more separation, lower it for less. */
  var GAIN_REFLOW = 1.8;   /* damped in the single column, where the
                              engravings are a clipped background wash */
  var SPIN_GAIN = 1.6;
  var INNER = 0.035;       /* counter-scroll inside a frame, as a
                              fraction of that frame's height         */

  var layers = Array.prototype.slice
    .call(document.querySelectorAll("[data-depth]"))
    .map(function (el) {
      var chapter = el.closest ? el.closest(".chapter") : null;
      return {
        el: el,
        chapter: chapter,
        /* Anchor the phase on the prose, falling back to the heading
           and then to the chapter box itself. */
        anchor:
          (chapter &&
            (chapter.querySelector(".prose") || chapter.querySelector(".title"))) ||
          chapter ||
          el,
        depth: parseFloat(el.getAttribute("data-depth")) || 0,
        drift: parseFloat(el.getAttribute("data-drift")) || 0,
        spin:
          parseFloat(el.getAttribute("data-spin")) ||
          parseFloat(el.getAttribute("data-rot")) ||
          0,
        inner: el.querySelector(".shot-in img"),
        dev: -1,
        live: false
      };
    });

  var heroLayer = document.querySelector('[data-parallax="hero"]');
  var heroSection = document.querySelector(".chapter--hero");
  var progressBar = document.getElementById("scroll-progress-bar");

  /* Only transform what's actually on screen. The margin is generous
     because a layer can be pushed a long way from its own box. */
  if ("IntersectionObserver" in window) {
    var vis = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          for (var i = 0; i < layers.length; i++) {
            if (layers[i].el !== e.target) continue;
            layers[i].live = e.isIntersecting;
            if (!e.isIntersecting) {
              layers[i].el.style.setProperty("--py", "0px");
              layers[i].el.style.setProperty("--px", "0px");
              layers[i].el.style.setProperty("--rz", "0deg");
              layers[i].el.style.setProperty("--dev", "1");
              layers[i].dev = -1;
            }
            break;
          }
        });
      },
      { rootMargin: "60% 0px 60% 0px" }
    );
    layers.forEach(function (l) { vis.observe(l.el); });
  } else {
    layers.forEach(function (l) { l.live = true; });
  }

  var ticking = false;
  var lastY = window.pageYOffset || 0;
  var skew = 0;

  function frame() {
    ticking = false;

    var y = window.pageYOffset || 0;
    var vh = window.innerHeight || root.clientHeight;
    var mid = vh / 2;
    var gain = reflow ? GAIN_REFLOW : GAIN;

    if (!reduce) {
      /* Scroll velocity, smoothed, as a gentle stretch on the layers. */
      var target = clamp((y - lastY) * 0.05, -1.6, 1.6);
      skew += (target - skew) * 0.2;
      if (Math.abs(skew) < 0.015) skew = 0;
      root.style.setProperty("--skew", skew.toFixed(3) + "deg");
    }
    lastY = y;

    if (!reduce) {
      for (var i = 0; i < layers.length; i++) {
        var l = layers[i];
        if (!l.live) continue;

        var a = l.anchor.getBoundingClientRect();
        var box = l.chapter ? l.chapter.getBoundingClientRect() : a;
        var centre = a.top + a.height / 2;
        var span = (vh + box.height) / 2;
        var p = span ? clamp((mid - centre) / span, -1, 1) : 0;

        l.el.style.setProperty("--py", (p * l.depth * gain * u).toFixed(2) + "px");
        if (l.drift)
          l.el.style.setProperty("--px", (p * l.drift * gain * u).toFixed(2) + "px");
        if (l.spin)
          l.el.style.setProperty("--rz", (p * l.spin * SPIN_GAIN).toFixed(3) + "deg");

        if (l.inner) {
          var r = l.el.getBoundingClientRect();
          /* The picture slides against its frame, and zooms just far
             enough to cover the slide — so at p = 0 it sits back at
             1:1, uncropped and exactly where the PDF puts it. */
          var ap = Math.abs(p);
          l.inner.style.setProperty("--ipy", (-p * INNER * r.height).toFixed(2) + "px");
          l.inner.style.setProperty("--izoom", (1 + ap * 0.095).toFixed(4));

          var dev = Math.round((1 - Math.min(1, ap * 1.35)) * 20) / 20;
          if (dev !== l.dev) {
            l.dev = dev;
            l.el.style.setProperty("--dev", String(dev));
          }
        }
      }

      /* The hero band is clipped, so its image drifts inside the crop
         instead of travelling with the page. */
      if (heroLayer && heroSection) {
        var hh = heroSection.getBoundingClientRect().height || 1;
        var t = clamp(y / hh, 0, 1);
        var slack = hh * 0.16;   /* stays inside the cover budget in CSS */
        heroLayer.style.setProperty("--py", ((0.5 - t) * 2 * slack).toFixed(2) + "px");
      }
    }

    if (progressBar) {
      var max = (document.body.scrollHeight || 1) - vh;
      var pct = max > 0 ? clamp(y / max, 0, 1) : 0;
      progressBar.style.width = (pct * 100).toFixed(3) + "%";
    }

    if (heroSection) {
      var past = heroSection.getBoundingClientRect().bottom < 56;
      document.body.classList.toggle("past-hero", past);
    }

    /* Keep stepping while the stretch unwinds, so it settles to rest
       after the scroll itself has stopped. */
    if (!reduce && skew !== 0 && !ticking) {
      ticking = true;
      requestAnimationFrame(frame);
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener(
    "resize",
    function () {
      measure();
      onScroll();
    },
    { passive: true }
  );
  frame();

  /* ── 5. Pointer tilt + specular glare on the screenshots ────────
     Written as variables on the <figure>; the framed inner span
     composes them into its own transform. */
  if (!reduce) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-tilt]"), function (shot) {
      var max = parseFloat(shot.getAttribute("data-tilt")) || 6;
      var box = null;

      function track(e) {
        if (e.pointerType === "touch") return;
        if (!box) box = shot.getBoundingClientRect();
        var fx = clamp((e.clientX - box.left) / (box.width || 1), 0, 1);
        var fy = clamp((e.clientY - box.top) / (box.height || 1), 0, 1);
        shot.style.setProperty("--tilty", ((fx - 0.5) * 2 * max).toFixed(2) + "deg");
        shot.style.setProperty("--tiltx", ((0.5 - fy) * 2 * max).toFixed(2) + "deg");
        shot.style.setProperty("--glx", (fx * 100).toFixed(1) + "%");
        shot.style.setProperty("--gly", (fy * 100).toFixed(1) + "%");
      }

      shot.addEventListener("pointerenter", function (e) {
        box = shot.getBoundingClientRect();
        track(e);
      });
      shot.addEventListener("pointermove", track, { passive: true });
      shot.addEventListener("pointerleave", function () {
        box = null;
        shot.style.setProperty("--tiltx", "0deg");
        shot.style.setProperty("--tilty", "0deg");
      });
      /* A rect cached across a scroll would send the tilt sideways. */
      window.addEventListener("scroll", function () { box = null; }, { passive: true });
    });
  }

  /* ── 6. Sparkles ────────────────────────────────────────────────
     A short-lived four-point star, spawned around the pointer while
     it rests over an image — or scattered along a link. */
  if (!reduce) {
    var SPARK_SVG =
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="currentColor" d="M12 0c1.05 7.6 4.4 10.95 12 12-7.6 1.05-10.95 4.4-12 12-1.05-7.6-4.4-10.95-12-12C7.6 10.95 10.95 7.6 12 0Z"/>' +
      "</svg>";
    var COLOURS = ["#f2aa83", "#467785", "#ffd9a8", "#ffffff", "#9ec7d3", "#e98f5f"];
    var MAX_LIVE = 30;
    var live = 0;

    function spark(host, x, y) {
      if (live >= MAX_LIVE) return;
      live++;

      var s = document.createElement("span");
      s.className = "spark";
      s.innerHTML = SPARK_SVG;

      var size = rand(7, 20);
      var dur = rand(680, 1180);
      var driftX = rand(-26, 26);
      var driftY = rand(-40, -8);
      var rot = rand(-140, 140);

      s.style.left = x + "px";
      s.style.top = y + "px";
      s.style.setProperty("--sz", size.toFixed(1) + "px");
      s.style.setProperty("--sc", COLOURS[(Math.random() * COLOURS.length) | 0]);
      s.style.setProperty("--dur", dur.toFixed(0) + "ms");
      s.style.setProperty("--tx0", "0px");
      s.style.setProperty("--ty0", "0px");
      s.style.setProperty("--tx1", (driftX * 0.45).toFixed(1) + "px");
      s.style.setProperty("--ty1", (driftY * 0.45).toFixed(1) + "px");
      s.style.setProperty("--tx2", driftX.toFixed(1) + "px");
      s.style.setProperty("--ty2", driftY.toFixed(1) + "px");
      s.style.setProperty("--rot0", "0deg");
      s.style.setProperty("--rot1", (rot * 0.5).toFixed(0) + "deg");
      s.style.setProperty("--rot2", rot.toFixed(0) + "deg");

      host.appendChild(s);
      var kill = function () {
        if (!s.parentNode) return;
        s.parentNode.removeChild(s);
        live--;
      };
      s.addEventListener("animationend", kill);
      setTimeout(kill, dur + 260);
    }

    /* Hosts are already positioned in CSS — forcing it here would beat
       the reflow media query and drag the layout sideways. */
    Array.prototype.forEach.call(document.querySelectorAll(".sparkle"), function (host) {
      var last = 0;
      var idle = null;

      function point(e) {
        var box = host.getBoundingClientRect();
        return e
          ? { x: e.clientX - box.left, y: e.clientY - box.top }
          : { x: rand(0, box.width), y: rand(0, box.height) };
      }

      function burst(n, at) {
        for (var i = 0; i < n; i++) {
          (function (i) {
            setTimeout(function () {
              var b = host.getBoundingClientRect();
              var jx = at ? at.x + rand(-b.width * 0.16, b.width * 0.16) : rand(0, b.width);
              var jy = at ? at.y + rand(-b.height * 0.16, b.height * 0.16) : rand(0, b.height);
              spark(host, clamp(jx, 0, b.width), clamp(jy, 0, b.height));
            }, i * 42);
          })(i);
        }
      }

      host.addEventListener("pointerenter", function (e) {
        if (e.pointerType === "touch") return;
        burst(6, point(e));
        /* Keep a slow shimmer going even if the pointer sits still. */
        clearInterval(idle);
        idle = setInterval(function () { burst(1, null); }, 260);
      });

      host.addEventListener(
        "pointermove",
        function (e) {
          if (e.pointerType === "touch") return;
          var now = e.timeStamp || Date.now();
          if (now - last < 78) return;
          last = now;
          var box = host.getBoundingClientRect();
          spark(host, e.clientX - box.left, e.clientY - box.top);
        },
        { passive: true }
      );

      host.addEventListener("pointerleave", function () {
        clearInterval(idle);
        idle = null;
      });

      /* Keyboard users get the burst too, via the link/figure focus ring. */
      host.addEventListener("focusin", function () { burst(7, null); });
    });

    /* Links scatter a few stars as the pointer arrives. The chapter is
       the host in both layouts — .prose stops being positioned once the
       page reflows into a single column. */
    Array.prototype.forEach.call(
      document.querySelectorAll(".prose a, .hero-meta a"),
      function (a) {
        var host = a.closest ? a.closest(".chapter") : null;
        if (!host) return;

        function scatter() {
          for (var i = 0; i < 5; i++) {
            (function (i) {
              setTimeout(function () {
                var hb = host.getBoundingClientRect();
                var ab = a.getBoundingClientRect();
                spark(
                  host,
                  ab.left - hb.left + rand(0, ab.width),
                  ab.top - hb.top + rand(-3, ab.height + 3)
                );
              }, i * 55);
            })(i);
          }
        }

        a.addEventListener("pointerenter", function (e) {
          if (e.pointerType === "touch") return;
          scatter();
        });
        a.addEventListener("focus", scatter);
      }
    );
  }

  window.__portfolioReady = true;
})();
