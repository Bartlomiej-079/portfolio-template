/*!
 * reveal.js — scroll-triggered reveal engine
 *
 * Replaces wow.js 1.x. wow.js bound a scroll listener and called
 * getBoundingClientRect() on every tracked node on every tick; with ~224 `.wow`
 * nodes across the markdown that is a forced layout per frame on the main
 * thread. IntersectionObserver does the same intersection test off the main
 * thread and only calls back on the frames where something actually crossed.
 *
 * Animations themselves stay in CSS (assets/css/motion.css) so they run on the
 * compositor. This file only decides *when* to add `.is-revealed`.
 *
 * Public API (drop-in for the old WOW call sites):
 *   Reveal.init()             — start observing; safe to call repeatedly
 *   Reveal.sync(root)         — pick up newly injected nodes
 *   Reveal.replay(container)  — re-run animations inside a container
 *   Reveal.revealAll(root)    — force everything visible (perf/reduced motion)
 */
(function () {
  "use strict";

  var DOC = document;
  var ROOT = DOC.documentElement;

  /* Mark the document as JS-capable immediately. motion.css only hides
     unrevealed nodes under `.motion-ready`, so if this file fails to load the
     content stays visible rather than stranded at opacity 0. */
  ROOT.classList.add("motion-ready");

  var REVEAL_SELECTOR = "[data-reveal], .wow";
  var REVEALED_CLASS = "is-revealed";
  var STAGGER_MS = 60;
  var STAGGER_CAP_MS = 420;
  /* Fire slightly before the element's top edge reaches the fold, so the
     animation is already underway by the time it is comfortably in view. */
  var ROOT_MARGIN = "0px 0px -8% 0px";
  /* Nothing should ever stay invisible. If an element that is already within
     the viewport is still unrevealed after this long, show it unconditionally.
     Elements genuinely below the fold keep their scroll reveal. */
  var SWEEP_SETTLE_MS = 2500;
  /* Scroll-idle delay before sweeping for nodes the observer missed. */
  var SWEEP_SCROLL_MS = 200;
  /* Trailing debounce for mutation-driven syncs. */
  var SYNC_DEBOUNCE_MS = 120;

  var observer = null;
  var initialised = false;
  var sweepTimer = null;
  var syncTimer = null;
  /* Nodes handed to the observer that have not fired yet. Keeping the set
     means the catch-up sweep is O(outstanding) rather than O(document), and
     becomes a no-op once everything has revealed. */
  var pending = new Set();
  /* Containers found to be sticky/fixed, so the computed-style walk runs at
     most once per container rather than once per element. */
  var pinnedCache = new WeakMap();

  var prefersReducedMotion = false;
  try {
    prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (err) {
    prefersReducedMotion = false;
  }

  /* ── Auto-assignment ───────────────────────────────────────────────────
   *
   * Elements the site never animated before. Each entry maps a selector to a
   * reveal name from motion.css; `stagger` walks matched siblings so repeating
   * groups arrive in sequence instead of all at once.
   */
  var AUTO_REVEAL_RULES = [
    /* Cards read as physical objects, so they lift and scale rather than
       simply fading up like body text. */
    {
      selector:
        /* Grid cards get their entrance from animateCards() in script.js;
           a second animation-name here is clobbered by the hover rule's
           `animation` shorthand and replays on every hover. */
        ".card:not(.cards > *), .blog-card:not(.cards > *), " +
        ".project-card:not(.cards > *), .experience-card:not(.cards > *), .intro-card, " +
        ".book-tile, .app-switcher-item, .ios-app-grid > *, .sheet-music-panel",
      reveal: "lift",
      stagger: true
    },
    /* Imagery defocuses into place; a slide fights the composition. */
    {
      selector:
        ".markdown-content img, .markdown-content figure, .card-image, " +
        ".gallery-item, .photo-grid > *",
      reveal: "blur",
      stagger: true
    },
    /* Headings get the same fade-up the annotated markdown headings use. */
    {
      selector:
        ".section-title, .markdown-content > h1, .markdown-content > h2, " +
        ".markdown-content > h3, .markdown-content > h4, " +
        ".markdown-content > h5, .markdown-content > h6",
      reveal: "fade-up"
    },
    /* Body-level block content: short travel so dense pages stay calm. */
    {
      selector:
        ".markdown-content > p, .markdown-content > ul, " +
        ".markdown-content > ol, .markdown-content > blockquote, " +
        ".markdown-content > pre, .markdown-content > dl, " +
        ".markdown-content > .md-code-block",
      reveal: "rise"
    },
    /* Tables animate as a unit, then their rows cascade. */
    { selector: ".markdown-content > table, .markdown-content > .table-wrap", reveal: "rise" },
    { selector: ".markdown-content table tbody tr", reveal: "rise", stagger: true, nested: true },
    /* Repeating row-shaped UI. */
    {
      selector: ".toc-item, .settings-row, .blog-metadata-item, .footer-nav-links > li",
      reveal: "rise",
      stagger: true
    },
    /* Sidebar nav slides in from the edge it sits on. */
    { selector: ".sidebar .nav-btn", reveal: "fade-right", stagger: true },
    /* Small circular controls pop rather than slide. */
    { selector: ".socials .icon-link", reveal: "zoom", stagger: true },
    /* Page furniture. */
    { selector: ".tab-title-wrap, .blog-filters, .skills-section", reveal: "fade-up" },
    { selector: ".error404-card, .site-footer-inner", reveal: "fade-up" }
  ];

  /* Regions where an auto-reveal would do more harm than good: overlays that
     appear on demand, offscreen chrome, and anything decorative. */
  var AUTO_REVEAL_EXCLUDE =
    ".site-search, .modal, .modal-card, .lightbox, .lightbox-card, " +
    ".blog-modal-content, .custom-cursor, .bubbles-canvas, .carousel-track, " +
    "[data-reveal-skip]";

  function isExcluded(el) {
    return Boolean(el.closest(AUTO_REVEAL_EXCLUDE));
  }

  /* Avoid animating an element inside something that is itself animating —
     the two transforms compound and the inner element visibly lags. */
  function hasRevealAncestor(el) {
    var parent = el.parentElement;
    while (parent && parent !== DOC.body) {
      if (parent.hasAttribute("data-reveal") || parent.classList.contains("wow")) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  function alreadyAnnotated(el) {
    return (
      el.hasAttribute("data-reveal") ||
      el.classList.contains("wow") ||
      el.classList.contains("animated") ||
      el.hasAttribute("data-reveal-auto")
    );
  }

  function assignAutoReveals(root) {
    var scope = root && root.querySelectorAll ? root : DOC;

    AUTO_REVEAL_RULES.forEach(function (rule) {
      var matches;
      try {
        matches = Array.prototype.slice.call(scope.querySelectorAll(rule.selector));
      } catch (err) {
        return;
      }

      /* Stagger indices restart per parent, so two sibling lists each begin
         at zero instead of the second one starting mid-cascade. */
      var indexByParent = new Map();

      matches.forEach(function (el) {
        if (alreadyAnnotated(el) || isExcluded(el)) return;
        /* `nested` rules (table rows) are deliberately allowed inside an
           animating ancestor; everything else is not. */
        if (!rule.nested && hasRevealAncestor(el)) return;

        el.setAttribute("data-reveal", rule.reveal);
        el.setAttribute("data-reveal-auto", "");

        if (rule.stagger) {
          var parent = el.parentElement || DOC.body;
          var index = indexByParent.get(parent) || 0;
          indexByParent.set(parent, index + 1);
          if (index > 0) {
            var delay = Math.min(index * STAGGER_MS, STAGGER_CAP_MS);
            el.setAttribute("data-reveal-delay", delay + "ms");
          }
        }
      });
    });
  }

  /* ── Revealing ─────────────────────────────────────────────────────── */

  /* Legacy markdown carries data-wow-* attributes; new markup uses
     data-reveal-*. Accept both so none of the 224 annotations need editing. */
  function attr(el, name) {
    return el.getAttribute("data-reveal-" + name) || el.getAttribute("data-wow-" + name);
  }

  function reveal(el) {
    if (el.classList.contains(REVEALED_CLASS)) return;

    var delay = attr(el, "delay");
    var duration = attr(el, "duration");
    var iteration = attr(el, "iteration");

    if (delay) el.style.animationDelay = delay;
    if (duration) el.style.animationDuration = duration;
    if (iteration) el.style.animationIterationCount = iteration;

    /* Legacy `.wow` nodes name their animation with an animate.css class but
       omit `.animated`, which is what carries duration/fill-mode in
       motion.css. markdown.js adds it during render; add it here too so
       hand-written HTML works either way. */
    if (el.classList.contains("wow") && !el.classList.contains("animated")) {
      el.classList.add("animated");
    }

    el.classList.add(REVEALED_CLASS);
    pending.delete(el);

    /* Release the compositor layer once the animation is done. */
    el.addEventListener(
      "animationend",
      function () {
        el.style.willChange = "";
      },
      { once: true }
    );
  }

  function revealAll(root) {
    var scope = root && root.querySelectorAll ? root : DOC;
    Array.prototype.forEach.call(scope.querySelectorAll(REVEAL_SELECTOR), reveal);
  }

  function onIntersect(entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }

  function observe(root) {
    var scope = root && root.querySelectorAll ? root : DOC;
    var nodes = scope.querySelectorAll(REVEAL_SELECTOR);

    if (!observer) {
      revealAll(scope);
      return;
    }

    Array.prototype.forEach.call(nodes, function (el) {
      if (el.classList.contains(REVEALED_CLASS)) return;
      if (isPinned(el)) {
        reveal(el);
        return;
      }
      pending.add(el);
      observer.observe(el);
    });
  }

  /*
   * IntersectionObserver clips against every scrolling ancestor, not just the
   * viewport. The sidebar is `position: sticky` with `overflow-y: auto`, so
   * anything pinned near its bottom edge sits past the negative bottom
   * rootMargin and can never cross the trigger line — it would stay at
   * opacity 0 forever. Page chrome like that should animate in on load
   * instead of waiting for a scroll that will not help.
   */
  function isPinned(el) {
    var node = el.parentElement;
    var depth = 0;

    while (node && node !== DOC.body && depth < 12) {
      if (pinnedCache.has(node)) {
        if (pinnedCache.get(node)) return true;
      } else {
        var position = "";
        try {
          position = window.getComputedStyle(node).position;
        } catch (err) {
          position = "";
        }
        var pinned = position === "sticky" || position === "fixed";
        pinnedCache.set(node, pinned);
        if (pinned) return true;
      }
      node = node.parentElement;
      depth += 1;
    }

    return false;
  }

  /*
   * Catch-up sweep for nodes the observer never reported.
   *
   * IntersectionObserver delivers callbacks asynchronously, so an element that
   * scrolls into and back out of view between two deliveries — a fast flick,
   * an anchor jump, a programmatic scroll — is never reported. Once it sits
   * above the viewport it can never intersect again, so without this it would
   * stay at opacity 0 permanently.
   *
   * Only outstanding nodes are examined, and anything still genuinely below
   * the fold is left alone so it keeps its scroll reveal.
   */
  /*
   * Cheap pre-filter for mutation records. The typing effect rewrites its own
   * subtree on a timer and produces a couple of hundred records a second;
   * syncing on each would re-run every auto-reveal selector over the whole
   * document continuously. Only insertions of real elements elsewhere count.
   *
   * This deliberately does not skip already-revealed containers: markdown is
   * injected into containers that have themselves been revealed, and ignoring
   * those would leave the new children untracked.
   */
  function recordsAddContent(records) {
    for (var i = 0; i < records.length; i += 1) {
      var record = records[i];
      if (!record.addedNodes.length) continue;

      var target = record.target;
      if (
        target &&
        target.nodeType === 1 &&
        (target.classList.contains("typing-sparkle-host") ||
          target.closest(".typing-sparkle-host"))
      ) {
        continue;
      }

      for (var j = 0; j < record.addedNodes.length; j += 1) {
        if (record.addedNodes[j].nodeType === 1) return true;
      }
    }
    return false;
  }

  function sweep() {
    if (!pending.size) return;

    var viewportBottom = window.innerHeight || ROOT.clientHeight || 0;

    Array.prototype.forEach.call(Array.from(pending), function (el) {
      if (!el.isConnected) {
        pending.delete(el);
        return;
      }

      var rect = el.getBoundingClientRect();
      /* Zero-sized means a hidden tab or an inactive language pane; leave it
         for the observer, which fires when it is actually shown. */
      if (!rect.width && !rect.height) return;

      /* At or above the fold: it should have been revealed by now. */
      if (rect.top < viewportBottom) {
        reveal(el);
        if (observer) observer.unobserve(el);
      }
    });
  }

  function scheduleSweep(delay) {
    if (sweepTimer) clearTimeout(sweepTimer);
    sweepTimer = setTimeout(function () {
      sweepTimer = null;
      sweep();
    }, delay);
  }

  /* ── Public API ────────────────────────────────────────────────────── */

  function sync(root) {
    assignAutoReveals(root);

    /* Honour the site's existing motion switches. styles.css keeps these
       nodes visible; revealing immediately means they never sit at opacity 0
       waiting for a scroll that the switch has made pointless. */
    if (
      prefersReducedMotion ||
      ROOT.getAttribute("data-marie-kondo") === "on"
    ) {
      revealAll(root || DOC);
      return;
    }

    observe(root);
    scheduleSweep(SWEEP_SETTLE_MS);
  }

  function init() {
    if (!initialised) {
      initialised = true;

      if (typeof window.IntersectionObserver === "function") {
        observer = new window.IntersectionObserver(onIntersect, {
          rootMargin: ROOT_MARGIN,
          threshold: 0.01
        });
      }

      /*
       * A passive, trailing-edge listener that only runs once scrolling has
       * stopped, and then only over nodes still outstanding. This is not the
       * per-tick rect measurement wow.js did: the observer handles the normal
       * case, and this only mops up what it missed. Once everything has
       * revealed, `pending` is empty and sweep() returns immediately.
       */
      window.addEventListener(
        "scroll",
        function () {
          if (!pending.size) return;
          scheduleSweep(SWEEP_SCROLL_MS);
        },
        { passive: true, capture: true }
      );

      window.addEventListener(
        "resize",
        function () {
          if (pending.size) scheduleSweep(SWEEP_SCROLL_MS);
        },
        { passive: true }
      );

      /*
       * The Marie Kondo and performance switches are toggled at runtime from
       * settings. Marie Kondo forces every node visible from CSS without ever
       * revealing it, so turning it back off would drop anything unrevealed
       * straight back to opacity 0 until the next scroll. Re-syncing on the
       * toggle keeps what is on screen on screen.
       */
      if (typeof window.MutationObserver === "function") {
        new window.MutationObserver(function () {
          sync(DOC);
          sweep();
        }).observe(ROOT, {
          attributes: true,
          attributeFilter: ["data-marie-kondo", "data-perf-mode"]
        });
      }

      /* Markdown is injected long after first paint and from several call
         sites. Watching the tree means none of them has to remember to call
         sync() — a safety net, not the primary path.

         The typing and rotation effects rewrite their own subtrees on a timer,
         which produces a couple of hundred mutation records a second. Syncing
         on each one would re-run every auto-reveal selector over the whole
         document continuously — the exact main-thread cost this file exists to
         remove. So records are filtered down to real content insertions first,
         then coalesced on a trailing debounce. */
      if (typeof window.MutationObserver === "function") {
        new window.MutationObserver(function (records) {
          if (!recordsAddContent(records)) return;
          if (syncTimer) clearTimeout(syncTimer);
          syncTimer = setTimeout(function () {
            syncTimer = null;
            sync(DOC);
          }, SYNC_DEBOUNCE_MS);
        }).observe(DOC.body || ROOT, { childList: true, subtree: true });
      }
    }

    sync(DOC);
  }

  /* Re-run animations for content that was swapped in place (language switch,
     tab change) where the nodes themselves are reused. */
  function replay(container) {
    if (!container || !container.querySelectorAll) return;

    var nodes = container.querySelectorAll(REVEAL_SELECTOR);
    if (!nodes.length) return;

    Array.prototype.forEach.call(nodes, function (el) {
      el.classList.remove(REVEALED_CLASS);
      el.classList.remove("animated");
      /* Force a reflow so removing and re-adding the class restarts the
         animation rather than being coalesced into no change. */
      void el.offsetWidth;
      reveal(el);
    });
  }

  window.Reveal = {
    init: init,
    sync: sync,
    replay: replay,
    revealAll: revealAll,
    reveal: reveal
  };

  if (DOC.readyState === "loading") {
    DOC.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
