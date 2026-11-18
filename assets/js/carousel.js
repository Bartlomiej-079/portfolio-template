/**
 * Self-contained carousel element for the markdown renderers.
 *
 * Markdown usage:
 *
 *   ```carousel
 *   --- First tab
 *   ## Slide one
 *   Any markdown you like.
 *
 *   --- Second tab
 *   More content.
 *   ```
 *
 * A slide delimiter is a line of three-or-more dashes; anything after the
 * dashes becomes that slide's indicator label (a labelled indicator renders
 * as a pill, an unlabelled one as a dot). Content before the first delimiter
 * is treated as the first slide.
 *
 * A label may lead with an icon, in any of these forms:
 *
 *   --- 📸 Photography          leading emoji (any number of them)
 *   --- fa:camera Photography   Font Awesome, solid by default
 *   --- fa:brands/github GitHub Font Awesome, explicit style
 *   --- fa-regular fa-heart Favourites   raw Font Awesome classes
 *
 * The Font Awesome stylesheet is only fetched if a block actually uses an
 * `fa` icon and the page does not already load it.
 *
 * Hosts render the block with SiteCarousel.buildHtml(body, renderMarkdown);
 * wiring happens automatically (DOM ready + MutationObserver), so any page
 * that loads this file gets working carousels with no extra init call.
 */
(function (global) {
  "use strict";

  var SLIDE_DELIMITER = /^\s*-{3,}\s*(.*)$/;

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // ── Icons ─────────────────────────────────────────────────────────

  var FONT_AWESOME_HREF =
    "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css";
  var FA_STYLES = {
    solid: "fa-solid", regular: "fa-regular", brands: "fa-brands",
    light: "fa-light", thin: "fa-thin", duotone: "fa-duotone",
    fas: "fa-solid", far: "fa-regular", fab: "fa-brands",
    fal: "fa-light", fat: "fa-thin", fad: "fa-duotone"
  };
  var FA_TOKEN = /^(?:fa|fa[srlbdt]|fa-[a-z0-9-]+)$/i;
  var SAFE_CLASS = /^[a-z0-9-]+$/i;

  // Leading run of emoji, including modifiers, ZWJ sequences and flags.
  var EMOJI_LEAD = (function () {
    try {
      return new RegExp(
        "^(?:(?:\\p{Extended_Pictographic}|\\p{Regional_Indicator})" +
        "(?:\\uFE0F|\\u20E3|[\\u{1F3FB}-\\u{1F3FF}]|" +
        "\\u200D(?:\\p{Extended_Pictographic}|\\p{Regional_Indicator}))*)+",
        "u"
      );
    } catch (_) {
      return /^(?:[\u203C-\u3299\u200D\u20E3\uFE0F]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF])+/;
    }
  })();

  function ensureFontAwesome() {
    if (typeof document === "undefined") return;
    if (document.getElementById("md-carousel-fa")) return;
    if (document.querySelector('link[href*="fontawesome"], link[href*="font-awesome"]')) return;
    var link = document.createElement("link");
    link.id = "md-carousel-fa";
    link.rel = "stylesheet";
    link.href = FONT_AWESOME_HREF;
    link.crossOrigin = "anonymous";
    link.referrerPolicy = "no-referrer";
    document.head.appendChild(link);
  }

  function normalizeFaClasses(tokens) {
    var classes = [];
    var hasStyle = false;
    var hasName = false;

    tokens.forEach(function (token) {
      var raw = String(token).toLowerCase();
      if (!SAFE_CLASS.test(raw)) return;
      var style = FA_STYLES[raw] || FA_STYLES[raw.replace(/^fa-/, "")];
      if (style) {
        if (!hasStyle) { classes.unshift(style); hasStyle = true; }
        return;
      }
      if (raw === "fa") return;
      var name = raw.startsWith("fa-") ? raw : "fa-" + raw;
      classes.push(name);
      hasName = true;
    });

    if (!hasName) return null;
    if (!hasStyle) classes.unshift("fa-solid");
    return classes.join(" ");
  }

  /**
   * Splits an indicator label into an optional leading icon and its text.
   * Returns { icon: {type, value}|null, label: string }.
   */
  function parseLabel(raw) {
    var text = String(raw || "").trim();
    if (!text) return { icon: null, label: "" };

    var spec = text.match(/^fa:([a-z0-9/ -]+?)(?:\s{2,}|\s(?=\S)|$)(.*)$/i);
    if (spec) {
      var classes = normalizeFaClasses(spec[1].split(/[\/\s]+/));
      if (classes) return { icon: { type: "fa", value: classes }, label: spec[2].trim() };
    }

    var tokens = text.split(/\s+/);
    var faTokens = [];
    while (tokens.length > 0 && FA_TOKEN.test(tokens[0])) faTokens.push(tokens.shift());
    if (faTokens.length > 0) {
      var raws = normalizeFaClasses(faTokens);
      if (raws) return { icon: { type: "fa", value: raws }, label: tokens.join(" ").trim() };
    }

    var emoji = text.match(EMOJI_LEAD);
    if (emoji) {
      return { icon: { type: "emoji", value: emoji[0] }, label: text.slice(emoji[0].length).trim() };
    }

    return { icon: null, label: text };
  }

  function renderIcon(icon) {
    if (!icon) return "";
    if (icon.type === "fa") {
      ensureFontAwesome();
      return '<i class="md-carousel-dot-icon ' + escapeHtml(icon.value) + '" aria-hidden="true"></i>';
    }
    return '<span class="md-carousel-dot-icon" aria-hidden="true">' + escapeHtml(icon.value) + "</span>";
  }

  function parseSlides(body) {
    var lines = String(body || "").replace(/\r\n/g, "\n").split("\n");
    var slides = [];
    var current = null;

    function push() {
      if (!current) return;
      var text = current.lines.join("\n").trim();
      if (text || current.label) slides.push({ label: current.label, markdown: text });
      current = null;
    }

    for (var i = 0; i < lines.length; i++) {
      var match = lines[i].match(SLIDE_DELIMITER);
      if (match) {
        push();
        current = { label: match[1].trim(), lines: [] };
        continue;
      }
      if (!current) current = { label: "", lines: [] };
      current.lines.push(lines[i]);
    }
    push();

    return slides;
  }

  function buildHtml(body, renderMarkdown) {
    var slides = parseSlides(body);
    if (slides.length === 0) return "";

    var render = typeof renderMarkdown === "function"
      ? renderMarkdown
      : function (md) { return "<p>" + escapeHtml(md) + "</p>"; };

    var parsed = slides.map(function (slide) { return parseLabel(slide.label); });

    var slideHtml = slides.map(function (slide, i) {
      var label = parsed[i].label || String(i + 1) + " of " + slides.length;
      return '<div class="md-carousel-slide" data-index="' + i + '"' +
        ' role="group" aria-roledescription="slide" aria-label="' + escapeHtml(label) + '">' +
        '<div class="md-carousel-slide-inner">' + render(slide.markdown) + "</div></div>";
    }).join("");

    var dotsHtml = slides.map(function (slide, i) {
      var icon = parsed[i].icon;
      var label = parsed[i].label;
      var isPill = Boolean(icon || label);
      var classes = "md-carousel-dot" +
        (isPill ? " md-carousel-dot-pill" : "") +
        (icon && !label ? " md-carousel-dot-icon-only" : "");
      var accessibleLabel = label || (icon && icon.type === "emoji" ? icon.value : "Slide " + (i + 1));
      var inner = renderIcon(icon) +
        (label ? '<span class="md-carousel-dot-label">' + escapeHtml(label) + "</span>" : "");
      return '<button type="button" class="' + classes + '" data-index="' + i + '"' +
        ' aria-label="' + escapeHtml(accessibleLabel) + '">' + inner + "</button>";
    }).join("");

    var nav = slides.length > 1
      ? '<button type="button" class="md-carousel-arrow md-carousel-prev" aria-label="Previous slide">&#8249;</button>' +
        '<button type="button" class="md-carousel-arrow md-carousel-next" aria-label="Next slide">&#8250;</button>'
      : "";
    var dots = slides.length > 1
      ? '<div class="md-carousel-dots">' + dotsHtml + "</div>"
      : "";

    return '<div class="md-carousel" data-carousel data-active="0" tabindex="0"' +
      ' role="group" aria-roledescription="carousel">' +
      '<div class="md-carousel-viewport">' + slideHtml + nav + "</div>" +
      dots + "</div>";
  }

  // ── Runtime ───────────────────────────────────────────────────────

  var FAR_OFFSET = 130;
  var DRAG_THRESHOLD = 8;

  function relativeIndex(index, active, count) {
    var rel = index - active;
    if (rel > count / 2) rel -= count;
    if (rel < -count / 2) rel += count;
    return rel;
  }

  function initCarousel(root) {
    if (!root || root.dataset.mdcInit === "1") return;
    root.dataset.mdcInit = "1";

    var viewport = root.querySelector(".md-carousel-viewport");
    if (!viewport) return;

    var slides = Array.prototype.slice.call(viewport.querySelectorAll(".md-carousel-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".md-carousel-dot"));
    var count = slides.length;
    if (count === 0) return;

    var active = parseInt(root.dataset.active, 10) || 0;
    if (active < 0 || active >= count) active = 0;

    // Hand-authored markup may use Font Awesome without going through buildHtml.
    if (root.querySelector('[class*="fa-"]')) ensureFontAwesome();

    function paint(dragOffset) {
      for (var i = 0; i < count; i++) {
        var slide = slides[i];
        var rel = relativeIndex(i, active, count);
        var percent = rel === 0 ? 0
          : rel === -1 ? -100
          : rel === 1 ? 100
          : rel < 0 ? -FAR_OFFSET : FAR_OFFSET;

        slide.classList.toggle("is-active", rel === 0);
        slide.classList.toggle("is-prev", rel === -1);
        slide.classList.toggle("is-next", rel === 1);
        slide.classList.toggle("is-far", Math.abs(rel) > 1);
        slide.inert = rel !== 0;
        slide.style.transform = dragOffset
          ? "translateX(calc(" + percent + "% + " + dragOffset + "px))"
          : "translateX(" + percent + "%)";
      }

      for (var d = 0; d < dots.length; d++) {
        var isCurrent = d === active;
        dots[d].classList.toggle("is-active", isCurrent);
        if (isCurrent) dots[d].setAttribute("aria-current", "true");
        else dots[d].removeAttribute("aria-current");
      }

      root.dataset.active = String(active);
    }

    // The viewport stacks every slide in one grid cell, so its height comes
    // from whichever slide is showing rather than from the tallest one.
    function syncHeight(animate) {
      var height = slides[active].offsetHeight;
      if (!height) return;
      if (!animate) viewport.style.transition = "none";
      viewport.style.height = height + "px";
      if (!animate) {
        requestAnimationFrame(function () { viewport.style.transition = ""; });
      }
    }

    function goTo(index) {
      if (count < 2) return;
      active = ((index % count) + count) % count;
      paint(0);
      syncHeight(true);
    }

    var prevBtn = root.querySelector(".md-carousel-prev");
    var nextBtn = root.querySelector(".md-carousel-next");
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(active - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(active + 1); });

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        goTo(parseInt(dot.dataset.index, 10) || 0);
      });
    });

    root.addEventListener("keydown", function (event) {
      // A nested widget (coverflow, video, …) that handled the key wins.
      if (event.defaultPrevented) return;
      var tag = event.target && event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === "ArrowLeft") { event.preventDefault(); goTo(active - 1); }
      else if (event.key === "ArrowRight") { event.preventDefault(); goTo(active + 1); }
      else if (event.key === "Home") { event.preventDefault(); goTo(0); }
      else if (event.key === "End") { event.preventDefault(); goTo(count - 1); }
    });

    // Pointer drag / swipe
    var pointerId = null;
    var startX = 0;
    var startY = 0;
    var offset = 0;
    var swiping = false;

    function endDrag(commit) {
      if (pointerId === null) return;
      var width = viewport.clientWidth || 1;
      var moved = offset;
      pointerId = null;
      offset = 0;
      root.classList.remove("is-dragging");

      if (commit && swiping && Math.abs(moved) > Math.min(90, width * 0.18)) {
        goTo(active + (moved < 0 ? 1 : -1));
      } else {
        paint(0);
      }
      swiping = false;
    }

    viewport.addEventListener("pointerdown", function (event) {
      if (count < 2 || pointerId !== null) return;
      if (event.button !== undefined && event.button !== 0) return;
      if (event.target.closest && event.target.closest(
        "a,button,input,textarea,select,iframe,video,audio,details,.md-coverflow,.md-ipod-coverflow"
      )) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      offset = 0;
      swiping = false;
    });

    viewport.addEventListener("pointermove", function (event) {
      if (pointerId !== event.pointerId) return;
      var dx = event.clientX - startX;
      var dy = event.clientY - startY;

      if (!swiping) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        if (Math.abs(dy) > Math.abs(dx)) { pointerId = null; return; }
        swiping = true;
        root.classList.add("is-dragging");
        if (viewport.setPointerCapture) {
          try { viewport.setPointerCapture(event.pointerId); } catch (_) {}
        }
      }

      event.preventDefault();
      offset = dx;
      paint(dx);
    });

    // Listen on the document so a release outside the viewport still resolves.
    document.addEventListener("pointerup", function (event) {
      if (pointerId === event.pointerId) endDrag(true);
    });
    document.addEventListener("pointercancel", function (event) {
      if (pointerId === event.pointerId) endDrag(false);
    });

    paint(0);
    syncHeight(false);

    // Content that grows later (images, embeds, opened <details>) re-measures.
    if (typeof ResizeObserver === "function") {
      var observer = new ResizeObserver(function () { syncHeight(true); });
      slides.forEach(function (slide) { observer.observe(slide); });
    } else {
      window.addEventListener("resize", function () { syncHeight(false); });
    }
    root.addEventListener("toggle", function () { syncHeight(true); }, true);
  }

  function initCarousels(container) {
    var scope = container || document;
    if (!scope || typeof scope.querySelectorAll !== "function") return;
    if (scope.classList && scope.classList.contains("md-carousel")) initCarousel(scope);
    scope.querySelectorAll(".md-carousel").forEach(initCarousel);
  }

  function watchForCarousels() {
    if (typeof MutationObserver !== "function" || !document.body) return;
    var pending = false;
    var observer = new MutationObserver(function (records) {
      if (pending) return;
      for (var i = 0; i < records.length; i++) {
        if (records[i].addedNodes && records[i].addedNodes.length > 0) {
          pending = true;
          requestAnimationFrame(function () {
            pending = false;
            initCarousels(document);
          });
          return;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function start() {
    initCarousels(document);
    watchForCarousels();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  global.SiteCarousel = {
    buildHtml: buildHtml,
    parseSlides: parseSlides,
    parseLabel: parseLabel,
    init: initCarousels
  };
})(window);
