/* ══════════════════════════════════════════════════════════════════
   /cv — section sheets.

   The same trick /city-optimise plays on its tiles: clicking a card
   (or a section's "Summary (+)") opens its detail panel by morphing
   the thing you clicked into a full sheet, the way an iOS icon opens
   into its app.

     1. Measure the trigger's viewport rect.
     2. Pin the sheet to exactly that rect with the transition
        suppressed, so frame one is pixel-identical to what was clicked.
     3. Reflow, restore the transition, release it to its final rect —
        the CSS transition on left/top/width/height does the morph.
     4. Closing runs the same thing backwards into the *current* rect
        of the trigger, re-measured, since the page may have scrolled.

   Geometry is animated rather than transform-scaled on purpose:
   scaling would distort the sheet's hairline border and its radius.

   Every panel's content lives in a <template> in the page, so the
   body is real markup rather than a string built here. Names are all
   cv-prefixed because <main> on this page is already .sheet — the
   paper the CV itself is printed on.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var MARGIN = 22;
  var MAX_W = 880;
  var PHONE = 640;

  var reduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var backdrop, sheet, body, title, scrollEl;
  var source = null;
  var isOpen = false;
  var lastFocus = null;
  var closeTimer = null;
  var naturalHeight = 0;

  /* Anything the reveal layer in cv.js would normally fade in starts
     at opacity 0 under html.js. Cloned template content never meets
     that observer, so it has to be marked arrived by hand. */
  var REVEALABLE =
    ".reveal, .rule-head, .sub-head, .entry, .prose, .bullets, .chips, .note, .crest, .mark";

  /* The sheet is only ever as tall as its content needs — never the
     full viewport height. It stays pinned to the same top margin
     regardless; only the bottom edge moves to fit. Pass the content's
     natural height (measured separately) to clamp against it. */
  function finalRect(height) {
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    if (vw < PHONE) {
      var maxH = vh - 24;
      return { left: 12, top: 12, width: vw - 24, height: height ? Math.min(height, maxH) : maxH };
    }
    var width = Math.min(MAX_W, vw - MARGIN * 2);
    var maxHeight = vh - MARGIN * 2;
    return {
      left: Math.round((vw - width) / 2),
      top: MARGIN,
      width: width,
      height: height ? Math.min(height, maxHeight) : maxHeight
    };
  }

  /* Measures how tall the current .cv-sheet-body content wants to be
     at the width it will actually render at — done with the sheet
     already visible (so display isn't none) but not yet painted at
     that state, so nothing flashes. */
  function measureNaturalHeight() {
    var targetWidth = finalRect().width;
    var prevWidth = sheet.style.width;
    var prevHeight = sheet.style.height;
    var prevVisibility = sheet.style.visibility;
    var prevScrollHeight = scrollEl.style.height;

    sheet.style.visibility = "hidden";
    sheet.style.width = targetWidth + "px";
    sheet.style.height = "auto";
    scrollEl.style.height = "auto";

    var h = sheet.scrollHeight;

    sheet.style.width = prevWidth;
    sheet.style.height = prevHeight;
    sheet.style.visibility = prevVisibility;
    scrollEl.style.height = prevScrollHeight;

    return h;
  }

  function applyRect(r) {
    sheet.style.left = r.left + "px";
    sheet.style.top = r.top + "px";
    sheet.style.width = r.width + "px";
    sheet.style.height = r.height + "px";
  }

  function rectOf(el) {
    var r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  function ensureChrome() {
    if (backdrop) return true;
    backdrop = document.getElementById("cv-sheet-backdrop");
    sheet = document.getElementById("cv-sheet");
    if (!backdrop || !sheet) return false;

    body = sheet.querySelector(".cv-sheet-body");
    title = sheet.querySelector(".cv-sheet-bar-title");
    scrollEl = sheet.querySelector(".cv-sheet-scroll");

    backdrop.addEventListener("click", close);
    Array.prototype.forEach.call(
      sheet.querySelectorAll("[data-sheet-close]"),
      function (btn) { btn.addEventListener("click", close); }
    );

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        close();
      }
    });
    window.addEventListener("resize", function () {
      if (isOpen) {
        /* The width may have just changed, which reflows the text,
           which changes how tall the content needs to be. */
        naturalHeight = measureNaturalHeight();
        applyRect(finalRect(naturalHeight));
      }
    });

    /* A hand-off inside a panel that points back into the CV itself
       ("read the full section ↓") has to put the page back first. */
    body.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      e.preventDefault();
      var target = document.getElementById(href.slice(1));
      close();
      if (target) {
        window.setTimeout(function () {
          target.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
        }, 60);
      }
    });

    return true;
  }

  function open(trigger) {
    if (!ensureChrome() || isOpen) return;

    var id = trigger.getAttribute("data-sheet-target");
    var template = id ? document.getElementById(id) : null;
    if (!template) return;

    window.clearTimeout(closeTimer);
    lastFocus = document.activeElement;
    source = trigger;
    isOpen = true;

    body.innerHTML = "";
    body.appendChild(template.content.cloneNode(true));
    Array.prototype.forEach.call(body.querySelectorAll(REVEALABLE), function (el) {
      el.classList.add("is-in");
    });
    if (title) title.textContent = trigger.getAttribute("data-sheet-title") || "";

    document.body.classList.add("is-cv-sheet-open");
    trigger.classList.add("is-source");

    backdrop.hidden = false;
    sheet.hidden = false;

    /* Measure how tall this panel's content actually wants to be
       before animating anywhere, so the sheet never overshoots past
       its own content just because the viewport is tall. */
    naturalHeight = measureNaturalHeight();

    if (reduce) {
      applyRect(finalRect(naturalHeight));
      backdrop.classList.add("is-open");
      sheet.classList.add("is-open");
    } else {
      /* Pin to the trigger with the morph off, so there is nothing to
         animate *from* a stale position. */
      sheet.style.transition = "none";
      applyRect(rectOf(trigger));
      sheet.style.borderRadius = getComputedStyle(trigger).borderRadius;

      void sheet.offsetWidth;
      sheet.style.transition = "";
      sheet.style.borderRadius = "";

      requestAnimationFrame(function () {
        backdrop.classList.add("is-open");
        sheet.classList.add("is-open");
        applyRect(finalRect(naturalHeight));
      });
    }

    var closeBtn = sheet.querySelector("[data-sheet-close]");
    if (closeBtn) {
      window.setTimeout(function () {
        try { closeBtn.focus({ preventScroll: true }); } catch (_) { closeBtn.focus(); }
      }, 120);
    }

    if (history.pushState) history.pushState({ cvSheet: id }, "", "#" + id);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    backdrop.classList.remove("is-open");
    sheet.classList.remove("is-open");

    /* Re-measure: the visitor may have scrolled the page behind, so
       the trigger is rarely still where it was when we opened. */
    if (source && !reduce) {
      source.scrollIntoView({ block: "nearest", behavior: "auto" });
      applyRect(rectOf(source));
    } else {
      sheet.style.opacity = "0";
    }

    var scroller = sheet.querySelector(".cv-sheet-scroll");
    if (scroller) scroller.scrollTop = 0;

    closeTimer = window.setTimeout(function () {
      sheet.hidden = true;
      backdrop.hidden = true;
      sheet.style.opacity = "";
      body.innerHTML = "";
      document.body.classList.remove("is-cv-sheet-open");
      if (source) {
        source.classList.remove("is-source");
        source = null;
      }
      if (lastFocus && lastFocus.focus) {
        try { lastFocus.focus({ preventScroll: true }); } catch (_) { lastFocus.focus(); }
      }
    }, reduce ? 0 : 520);

    if (history.state && history.state.cvSheet) history.back();
    else if (location.hash) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  function init() {
    var triggers = document.querySelectorAll("[data-sheet-target]");
    if (!triggers.length || !ensureChrome()) return;

    /* Nothing above is guaranteed to be here — the heading triggers
       stay hidden in CSS until this line runs. */
    document.documentElement.classList.add("sheets-ready");

    /* A click landing on a link *nested inside* a trigger — the crest
       or the company name inside an entry-title — means "go to that
       link", not "open the summary". Only true when the found anchor
       isn't the trigger itself, since a card trigger is an <a>. */
    function throughLink(trigger, e) {
      var link = e.target.closest ? e.target.closest("a") : null;
      return !!(link && link !== trigger && trigger.contains(link));
    }

    Array.prototype.forEach.call(triggers, function (trigger) {
      var native = trigger.tagName === "A" || trigger.tagName === "BUTTON";

      /* Entry-titles are headings, not natively focusable or
         keyboard-activatable, so they need both added by hand. */
      if (!native) {
        if (!trigger.hasAttribute("tabindex")) trigger.tabIndex = 0;
        if (!trigger.hasAttribute("role")) trigger.setAttribute("role", "button");
        trigger.addEventListener("keydown", function (e) {
          if (e.key !== "Enter" && e.key !== " ") return;
          if (throughLink(trigger, e)) return;
          e.preventDefault();
          open(trigger);
        });
      }

      trigger.addEventListener("click", function (e) {
        /* Cards are real links to the real page underneath. A
           cmd/ctrl/middle click means "open that page", not "show me
           the summary" — leave the browser to it. */
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (throughLink(trigger, e)) return;
        e.preventDefault();
        open(trigger);
      });
    });

    window.addEventListener("popstate", function () {
      if (isOpen) close();
    });

    /* Deep link: /cv/#s-skills opens that panel on load. */
    var hash = (location.hash || "").replace(/^#/, "");
    if (hash && window.CSS && CSS.escape) {
      var target = document.querySelector('[data-sheet-target="' + CSS.escape(hash) + '"]');
      if (target) window.setTimeout(function () { open(target); }, 300);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
