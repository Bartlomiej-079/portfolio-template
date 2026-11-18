/* ══════════════════════════════════════════════════════════════════
   /cv — interaction layer, sibling to /portfolio/portfolio.js
     · scales the PDF's coordinate system to the viewport (--u)
     · deep scroll parallax on the watermark crests
     · staggered reveal on load and on scroll
     · letter-level hover animation on the display type
     · sparkle bursts on link and crest hover
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
  var SHEET_MAX = 1240;
  var PAGE_W = 612;
  var REFLOW_AT = 900;
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
     Unlike the portfolio's splitter this one walks child elements as
     well as text, because the section heads carry their oversized
     small-cap initials in their own <span class="cap">. Each letter
     inherits whatever classes its parent carried, so the initials
     stay big once they have been diced. */
  function split(el) {
    if (!el.textContent || el.querySelector(".ch")) return;

    var label = el.textContent;
    var frag = document.createDocumentFragment();
    var n = 0;

    function emit(text, extra) {
      var parts = text.split(/(\s+)/);
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
          ch.className = extra ? "ch " + extra : "ch";
          ch.style.setProperty("--i", String(n++));
          ch.textContent = part.charAt(c);
          word.appendChild(ch);
        }
        frag.appendChild(word);
      }
    }

    for (var i = 0; i < el.childNodes.length; i++) {
      var node = el.childNodes[i];
      if (node.nodeType === 3) emit(node.nodeValue, "");
      else if (node.nodeType === 1) emit(node.textContent, node.className || "");
    }

    /* Keep a clean accessible name so assistive tech never has to read
       the heading back one <span> at a time. */
    if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", label);

    el.textContent = "";
    el.appendChild(frag);
    el.classList.add("split");
  }

  Array.prototype.forEach.call(
    document.querySelectorAll(".rule-head, .sub-head h3, .name, .page-title, .entry-title[data-split]"),
    split
  );

  /* Stagger the idle breathing so the watermarks never pulse in sync. */
  Array.prototype.forEach.call(document.querySelectorAll(".mark img"), function (img, i) {
    img.style.setProperty("--bd", (14 + ((i * 2.9) % 7)).toFixed(1) + "s");
  });

  /* ── 3. Reveal on load + on scroll ──────────────────────────────
     Each section staggers its own layers so a block assembles itself
     rather than everything popping at once. */
  var revealTargets = Array.prototype.slice.call(
    document.querySelectorAll(
      ".reveal, .rule-head, .sub-head, .entry, .prose, .bullets, .chips, .note, .crest, .mark"
    )
  );

  var ORDER = {
    mark: 0,
    "rule-head": 60,
    "sub-head": 90,
    entry: 140,
    prose: 200,
    bullets: 200,
    chips: 200,
    note: 200,
    crest: 320
  };

  revealTargets.forEach(function (el) {
    var d = el.getAttribute("data-delay");
    if (d) {
      el.style.setProperty("--d", d + "ms");
      return;
    }
    var key = null;
    for (var k in ORDER) {
      if (el.classList.contains(k)) { key = k; break; }
    }
    el.style.setProperty("--d", (key === null ? 120 : ORDER[key]) + "ms");
  });

  if (reduce || !("IntersectionObserver" in window)) {
    revealTargets.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.02 }
    );
    revealTargets.forEach(function (el) { io.observe(el); });
  }

  /* ── 4. Parallax ────────────────────────────────────────────────
     Phase (p) runs -1 → +1 as a section crosses the viewport, and is
     measured from that section's *copy*, not from each layer's own
     box — so every layer in a section shares one clock and they all
     pass through p = 0, their authored position, at the moment the
     section's text sits in the middle of the screen.

     depth is in PDF points. Positive lags behind the scroll (further
     away), negative runs ahead of it (closer). */
  var GAIN = 6;
  var GAIN_REFLOW = 2;
  var SPIN_GAIN = 1.6;

  var layers = Array.prototype.slice
    .call(document.querySelectorAll("[data-depth]"))
    .map(function (el) {
      var chapter = el.closest ? el.closest(".chapter") : null;
      return {
        el: el,
        chapter: chapter,
        anchor:
          (chapter &&
            (chapter.querySelector(".prose, .bullets, .chips, .note") ||
              chapter.querySelector(".rule-head, .page-title"))) ||
          chapter ||
          el,
        depth: parseFloat(el.getAttribute("data-depth")) || 0,
        drift: parseFloat(el.getAttribute("data-drift")) || 0,
        spin: parseFloat(el.getAttribute("data-spin")) || 0,
        live: false
      };
    });

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
      }
    }

    if (progressBar) {
      var max = (document.body.scrollHeight || 1) - vh;
      var pct = max > 0 ? clamp(y / max, 0, 1) : 0;
      progressBar.style.width = (pct * 100).toFixed(3) + "%";
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

  /* ── 5. Sparkles ────────────────────────────────────────────────
     A short-lived four-point star, scattered along a link or thrown
     off a crest as the pointer arrives. */
  if (!reduce) {
    var SPARK_SVG =
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="currentColor" d="M12 0c1.05 7.6 4.4 10.95 12 12-7.6 1.05-10.95 4.4-12 12-1.05-7.6-4.4-10.95-12-12C7.6 10.95 10.95 7.6 12 0Z"/>' +
      "</svg>";
    var COLOURS = ["#f2aa83", "#467785", "#ffd9a8", "#9ec7d3", "#e98f5f", "#c9ced4"];
    var MAX_LIVE = 26;
    var live = 0;

    function spark(host, x, y) {
      if (live >= MAX_LIVE) return;
      live++;

      var s = document.createElement("span");
      s.className = "spark";
      s.innerHTML = SPARK_SVG;

      var size = rand(6, 16);
      var dur = rand(660, 1120);
      var driftX = rand(-22, 22);
      var driftY = rand(-34, -6);
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

    /* The chapter is the host: it is the nearest positioned ancestor
       in both the PDF-metric layout and the reflowed column. */
    function scatterFrom(el, n) {
      var host = el.closest ? el.closest(".chapter") : null;
      if (!host) return;
      for (var i = 0; i < n; i++) {
        (function (i) {
          setTimeout(function () {
            var hb = host.getBoundingClientRect();
            var ab = el.getBoundingClientRect();
            spark(
              host,
              ab.left - hb.left + rand(0, ab.width),
              ab.top - hb.top + rand(-3, ab.height + 3)
            );
          }, i * 52);
        })(i);
      }
    }

    Array.prototype.forEach.call(
      document.querySelectorAll(".sheet a, .crest, .chip"),
      function (el) {
        var n = el.classList.contains("crest") ? 7 : 5;
        el.addEventListener("pointerenter", function (e) {
          if (e.pointerType === "touch") return;
          scatterFrom(el, n);
        });
        el.addEventListener("focus", function () { scatterFrom(el, n); });
      }
    );

    /* Resting the pointer anywhere in the masthead keeps a slow
       shimmer going around the name. */
    Array.prototype.forEach.call(document.querySelectorAll(".sparkle"), function (host) {
      var last = 0;
      var idle = null;

      host.addEventListener("pointerenter", function (e) {
        if (e.pointerType === "touch") return;
        clearInterval(idle);
        idle = setInterval(function () {
          var b = host.getBoundingClientRect();
          spark(host, rand(0, b.width), rand(0, b.height));
        }, 300);
      });

      host.addEventListener(
        "pointermove",
        function (e) {
          if (e.pointerType === "touch") return;
          var now = e.timeStamp || Date.now();
          if (now - last < 90) return;
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
    });
  }

  window.__cvReady = true;
})();
