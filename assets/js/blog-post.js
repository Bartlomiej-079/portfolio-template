(function () {
  "use strict";

  var SITE_ROOT = (function () {
    var existing = window.__SITE_ROOT__;
    if (typeof existing === "string" && existing.trim()) {
      return existing.endsWith("/") ? existing : existing + "/";
    }
    var hostname = window.location.hostname || "";
    var segments = (window.location.pathname || "/").split("/").filter(Boolean);
    var isGhPages = /\.github\.io$/i.test(hostname);
    var root = isGhPages && segments.length > 0 ? "/" + segments[0] + "/" : "/";
    window.__SITE_ROOT__ = root;
    return root;
  })();

  function getSlug() {
    return new URLSearchParams(window.location.search).get("post") || "";
  }

  function fetchText(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    });
  }

  function extractDataBlock(markdown) {
    var m = markdown.match(/```post-data\n([\s\S]*?)```/i);
    if (!m) return {};
    try { return JSON.parse(m[1]) || {}; } catch (_) { return {}; }
  }

  // ── Language localisation ────────────────────────────────────────────────
  // Posts wrap their per-language bodies in ```language-content fences (see
  // assets/js/i18n.js). markdown.js has no idea what those fences mean, so
  // left alone they render as a literal, unstyled code block. Here we pick
  // the single language matching the site's current preference (localStorage
  // "portfolio-language", same key the rest of the site uses) and splice its
  // content back into the markdown as if it were the only content ever
  // there — extensible to any language the ```::code fences add later.
  function getPreferredLang() {
    var i18n = window.portfolioI18n;
    if (i18n && typeof i18n.getLang === "function") {
      try { return i18n.getLang(); } catch (_) {}
    }
    return "en";
  }

  function pickLanguageKey(langMap) {
    var keys = Object.keys(langMap || {});
    if (!keys.length) return null;
    var pref = getPreferredLang();
    if (langMap[pref]) return pref;
    if (langMap.en) return "en";
    return keys[0];
  }

  function localizeMarkdown(markdown) {
    var i18n = window.portfolioI18n;
    if (!i18n || typeof i18n.splitMarkdownByLanguageContent !== "function") return markdown;

    var parts;
    try { parts = i18n.splitMarkdownByLanguageContent(markdown); } catch (_) { return markdown; }
    if (!Array.isArray(parts) || !parts.some(function (p) { return p && p.type === "lang"; })) {
      return markdown;
    }

    return parts.map(function (part) {
      if (!part || part.type !== "lang") return part ? part.raw : "";
      var langMap = {};
      try { langMap = i18n.parseLanguageContent(part.raw) || {}; } catch (_) {}
      var key = pickLanguageKey(langMap);
      return key ? langMap[key] : "";
    }).join("\n\n");
  }

  // ── Lightbox ────────────────────────────────────────────────────────────
  var lightboxDialog = null;
  var lightboxImg = null;
  var lightboxScale = 1;

  function ensureLightbox() {
    if (lightboxDialog) return;
    lightboxDialog = document.getElementById("bp-lightbox");
    lightboxImg = document.getElementById("bp-lightbox-img");
    if (!lightboxDialog) return;

    document.getElementById("bp-lbx-close").addEventListener("click", closeLightbox);
    document.getElementById("bp-lbx-newtab").addEventListener("click", function () {
      if (lightboxImg && lightboxImg.src) window.open(lightboxImg.src, "_blank", "noopener");
    });
    document.getElementById("bp-lbx-zoomin").addEventListener("click", function () {
      lightboxScale = Math.min(5, lightboxScale + 0.25);
      updateScale();
    });
    document.getElementById("bp-lbx-zoomout").addEventListener("click", function () {
      lightboxScale = Math.max(0.25, lightboxScale - 0.25);
      updateScale();
    });
    document.getElementById("bp-lbx-zoomreset").addEventListener("click", function () {
      lightboxScale = 1;
      updateScale();
    });
    lightboxDialog.addEventListener("click", function (e) {
      if (e.target === lightboxDialog) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (lightboxDialog && lightboxDialog.open) {
        if (e.key === "Escape") { e.preventDefault(); closeLightbox(); }
        if (e.key === "+" || e.key === "=") { lightboxScale = Math.min(5, lightboxScale + 0.25); updateScale(); }
        if (e.key === "-") { lightboxScale = Math.max(0.25, lightboxScale - 0.25); updateScale(); }
        if (e.key === "0") { lightboxScale = 1; updateScale(); }
      }
    });
  }

  function updateScale() {
    if (lightboxImg) lightboxImg.style.transform = "scale(" + lightboxScale + ")";
    var btn = document.getElementById("bp-lbx-zoomreset");
    if (btn) btn.textContent = Math.round(lightboxScale * 100) + "%";
  }

  function openLightbox(src, alt) {
    ensureLightbox();
    if (!lightboxDialog) return;
    lightboxScale = 1;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    updateScale();
    lightboxDialog.showModal();
  }

  function closeLightbox() {
    if (lightboxDialog) lightboxDialog.close();
    if (lightboxImg) { lightboxImg.src = ""; lightboxImg.alt = ""; }
  }

  // Wire "open in new tab" overlay + lightbox click on every content image
  function wireContentImages(container) {
    container.querySelectorAll("img[src]").forEach(function (img) {
      // Skip images that are already wrapped
      if (img.closest(".bp-img-wrap")) return;

      var wrap = document.createElement("span");
      wrap.className = "bp-img-wrap";

      var newtabBtn = document.createElement("a");
      newtabBtn.className = "bp-img-newtab";
      newtabBtn.href = img.src;
      newtabBtn.target = "_blank";
      newtabBtn.rel = "noopener noreferrer";
      newtabBtn.title = "Open image in new tab";
      newtabBtn.setAttribute("aria-label", "Open image in new tab");
      newtabBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>open';

      img.parentNode.insertBefore(wrap, img);
      wrap.appendChild(img);
      wrap.appendChild(newtabBtn);

      img.style.cursor = "zoom-in";
      img.addEventListener("click", function () {
        openLightbox(img.src, img.alt);
      });
    });
  }

  // ── Heading utilities ────────────────────────────────────────────────────
  function slugifyHeading(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-");
  }

  function extractHeadings(container) {
    var headings = [];
    var slugCounts = {};
    container.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach(function (el) {
      var text = el.textContent.trim();
      var level = parseInt(el.tagName[1], 10);
      var slug = slugifyHeading(text);
      slugCounts[slug] = (slugCounts[slug] || 0) + 1;
      if (slugCounts[slug] > 1) slug = slug + "-" + slugCounts[slug];
      el.id = slug;
      headings.push({ level: level, text: text, id: slug, el: el });
    });
    return headings;
  }

  function buildTocSidebar(headings) {
    var sidebar = document.getElementById("bp-toc-sidebar");
    if (!sidebar || !headings.length) return;

    sidebar.innerHTML = "";
    var label = document.createElement("p");
    label.className = "bp-toc-label";
    label.textContent = (window.portfolioI18n && window.portfolioI18n.t)
      ? window.portfolioI18n.t("toc.title")
      : "Contents";
    sidebar.appendChild(label);

    var minLevel = Math.min.apply(null, headings.map(function (h) { return h.level; }));
    var nav = document.createElement("nav");
    nav.className = "bp-toc-nav";
    nav.setAttribute("aria-label", (window.portfolioI18n && window.portfolioI18n.t)
      ? window.portfolioI18n.t("aria.toc")
      : "Table of contents");

    headings.forEach(function (h) {
      var indent = h.level - minLevel;
      var a = document.createElement("a");
      a.className = "bp-toc-link";
      a.href = "#" + h.id;
      a.textContent = h.text;
      a.style.setProperty("--toc-indent", indent);
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var target = document.getElementById(h.id);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        // Update hash without jumping
        history.replaceState(null, "", "#" + h.id);
      });
      nav.appendChild(a);
    });

    sidebar.appendChild(nav);

    // Active heading tracker via IntersectionObserver
    if ("IntersectionObserver" in window) {
      var activeId = null;
      var links = nav.querySelectorAll(".bp-toc-link");

      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            activeId = entry.target.id;
          }
        });
        links.forEach(function (link) {
          var isActive = link.getAttribute("href") === "#" + activeId;
          link.classList.toggle("is-active", isActive);
        });
      }, { rootMargin: "0px 0px -60% 0px", threshold: 0 });

      headings.forEach(function (h) { observer.observe(h.el); });
    }
  }

  // ── Metadata helpers ─────────────────────────────────────────────────────
  function makeLocationStrip(postData) {
    var location = postData.location || "";
    var coordinates = postData.coordinates || "";
    if (!location && !coordinates) return null;

    var strip = document.createElement("div");
    strip.className = "bp-location-strip";

    if (location) {
      var locEl = document.createElement("span");
      locEl.className = "bp-location-name";
      locEl.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" class="bp-location-icon"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
      locEl.appendChild(document.createTextNode(location));
      strip.appendChild(locEl);
    }

    if (coordinates) {
      var coordEl = document.createElement("span");
      coordEl.className = "bp-location-coords";
      coordEl.textContent = coordinates;
      strip.appendChild(coordEl);
    }

    return strip;
  }

  function makeExifStrip(postData) {
    var fields = [
      { key: "camera",  label: "Camera"   },
      { key: "lens",    label: "Lens"     },
      { key: "aperture",label: "f/"       },
      { key: "shutter", label: "Shutter"  },
      { key: "iso",     label: "ISO"      },
      { key: "focal",   label: "Focal"    }
    ];
    var items = fields.filter(function (f) { return postData[f.key]; });
    if (!items.length) return null;

    var strip = document.createElement("div");
    strip.className = "bp-exif-strip";

    items.forEach(function (f) {
      var item = document.createElement("span");
      item.className = "bp-exif-item";
      var label = document.createElement("span");
      label.className = "bp-exif-label";
      label.textContent = f.label;
      var value = document.createElement("span");
      value.className = "bp-exif-value";
      // For aperture, prefix is already "f/" so don't double it
      value.textContent = f.key === "aperture"
        ? String(postData[f.key]).replace(/^f\//i, "")
        : String(postData[f.key]);
      item.appendChild(label);
      item.appendChild(value);
      strip.appendChild(item);
    });

    return strip;
  }

  function extractTitle(markdown) {
    var m = markdown.match(/^#\s+(.+)$/m);
    return m ? m[1].trim() : "";
  }

  function stripForContent(markdown) {
    return markdown
      .replace(/^#\s+.+\n?/m, "")
      .replace(/```post-data\n[\s\S]*?```/gi, "")
      .trim();
  }

  function normalizeAssetSrc(src) {
    if (!src) return "";
    if (/^(?:[a-z]+:)?\/\//i.test(src) || /^data:/i.test(src)) return src;
    if (src.startsWith("/")) return SITE_ROOT + src.replace(/^\/+/, "");
    return SITE_ROOT + src.replace(/^\.?\/?/, "");
  }

  function makeChip(text) {
    var span = document.createElement("span");
    span.className = "chip";
    span.textContent = text;
    return span;
  }

  var postSourceTab = "blog";

  function getBackUrl() {
    return SITE_ROOT + "?tab=" + postSourceTab;
  }

  function showError(msg) {
    var loading = document.getElementById("bp-loading");
    var errorEl = document.getElementById("bp-error");
    var msgEl = document.getElementById("bp-error-msg");
    if (loading) loading.hidden = true;
    if (msgEl) {
      msgEl.textContent = msg || ((window.portfolioI18n && window.portfolioI18n.t)
        ? window.portfolioI18n.t("bp.notFound")
        : "Post not found.");
    }
    if (errorEl) errorEl.hidden = false;
    var backEl = document.getElementById("bp-error-back");
    if (backEl) backEl.href = getBackUrl();
  }

  function wireScrollBehavior(titleText) {
    var progressEl = document.getElementById("bp-progress");
    var headerTitle = document.getElementById("bp-header-title");
    var titleEl = document.getElementById("bp-title");

    function onScroll() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (progressEl && docHeight > 0) {
        progressEl.style.width = Math.min(100, (scrollTop / docHeight) * 100) + "%";
      }
      if (headerTitle && titleEl) {
        var titleBottom = titleEl.getBoundingClientRect().bottom;
        if (titleBottom < 0) {
          headerTitle.classList.add("is-visible");
        } else {
          headerTitle.classList.remove("is-visible");
        }
      }
    }

    if (headerTitle) headerTitle.textContent = titleText;
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function renderPost(markdown, slug) {
    var postData = extractDataBlock(markdown);
    var title = postData.title || extractTitle(markdown) || slug;
    var date = postData.date || "";
    var tags = Array.isArray(postData.tags) ? postData.tags : [];
    var summary = postData.summary || "";
    var rawCover = postData.coverImage || postData.image || "";
    var coverImage = rawCover ? normalizeAssetSrc(rawCover) : "";
    var contentMd = stripForContent(markdown);

    document.title = title + " | Your Name";
    if (window.portfolioSeo && typeof window.portfolioSeo.applyArticle === "function") {
      window.portfolioSeo.applyArticle({
        slug: slug,
        title: title,
        date: date,
        tags: tags,
        summary: summary,
        coverImage: coverImage,
        isMusic: postSourceTab === "music"
      });
    }

    var backUrl = getBackUrl();
    var backLabel = (window.portfolioI18n && window.portfolioI18n.t)
      ? (postSourceTab === "music" ? window.portfolioI18n.t("btn.backToMusic") : window.portfolioI18n.t("btn.backToBlog"))
      : ("back to " + postSourceTab);
    function setBackLink(el) {
      if (!el) return;
      el.href = backUrl;
      var span = el.querySelector("[data-i18n], span");
      if (span) {
        span.textContent = backLabel;
        return;
      }
      var textNode = null;
      el.childNodes.forEach(function (n) {
        if (n.nodeType === 3 && n.textContent.trim()) textNode = n;
      });
      if (textNode) textNode.textContent = " " + backLabel;
      else el.appendChild(document.createTextNode(" " + backLabel));
    }
    setBackLink(document.getElementById("bp-back-link"));
    setBackLink(document.getElementById("bp-back-link-bottom"));
    var errBack = document.getElementById("bp-error-back");
    if (errBack) {
      errBack.href = backUrl;
      errBack.textContent = "← " + backLabel;
    }

    var tagsEl = document.getElementById("bp-tags");
    if (tagsEl) {
      tagsEl.innerHTML = "";
      tags.forEach(function (t) { tagsEl.appendChild(makeChip(t)); });
    }

    var dateEl = document.getElementById("bp-date");
    if (dateEl && date) {
      dateEl.textContent = date;
      dateEl.setAttribute("datetime", date);
    }

    var titleEl = document.getElementById("bp-title");
    if (titleEl) titleEl.textContent = title;

    var authorEl = document.getElementById("bp-author");
    if (authorEl) {
      authorEl.innerHTML = '<a rel="author me" href="https://example.com/">Your Name</a>';
      authorEl.hidden = false;
    }

    var summaryEl = document.getElementById("bp-summary");
    if (summaryEl) {
      if (summary) {
        summaryEl.textContent = summary;
      } else {
        summaryEl.hidden = true;
      }
    }

    var oldMetaPanel = document.querySelector(".bp-photo-meta");
    if (oldMetaPanel) oldMetaPanel.parentNode.removeChild(oldMetaPanel);

    // Location strip (below summary, above cover)
    var locationStrip = makeLocationStrip(postData);
    var exifStrip = makeExifStrip(postData);
    if (locationStrip || exifStrip) {
      var metaPanel = document.createElement("div");
      metaPanel.className = "bp-photo-meta";
      if (locationStrip) metaPanel.appendChild(locationStrip);
      if (exifStrip) metaPanel.appendChild(exifStrip);
      var summaryRef = document.getElementById("bp-summary");
      var coverRef = document.getElementById("bp-cover-wrap");
      if (coverRef && coverRef.parentNode) {
        coverRef.parentNode.insertBefore(metaPanel, coverRef);
      } else if (summaryRef && summaryRef.parentNode) {
        summaryRef.parentNode.insertBefore(metaPanel, summaryRef.nextSibling);
      }
    }

    var coverWrap = document.getElementById("bp-cover-wrap");
    if (coverWrap) {
      coverWrap.innerHTML = "";
      coverWrap.hidden = false;
      if (coverImage) {
        var img = document.createElement("img");
        img.className = "bp-cover";
        img.src = coverImage;
        img.alt = title + " cover image";
        img.loading = "eager";
        img.style.cursor = "zoom-in";
        img.addEventListener("click", function () { openLightbox(img.src, img.alt); });
        coverWrap.appendChild(img);

        var coverNewTab = document.createElement("a");
        coverNewTab.className = "bp-cover-newtab";
        coverNewTab.href = coverImage;
        coverNewTab.target = "_blank";
        coverNewTab.rel = "noopener noreferrer";
        coverNewTab.title = "Open image in new tab";
        coverNewTab.setAttribute("aria-label", "Open cover image in new tab");
        coverNewTab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>open';
        coverWrap.appendChild(coverNewTab);
      } else {
        coverWrap.hidden = true;
      }
    }

    var contentEl = document.getElementById("bp-content");
    if (contentEl) {
      contentEl.innerHTML = window.SiteMd.markdownToHtml(contentMd);

      if (postData.justify || postData.textJustify || /^::justify\s*(on|true|yes)?\s*$/im.test(contentMd)) {
        contentEl.classList.add("md-justified");
      } else {
        contentEl.classList.remove("md-justified");
      }

      contentEl.querySelectorAll("img[src]").forEach(function (imgEl) {
        imgEl.src = normalizeAssetSrc(imgEl.getAttribute("src"));
      });

      window.SiteMd.renderMathInContainer(contentEl);
      window.SiteMd.renderCodeBlocksInContainer(contentEl);
      window.SiteMd.addFootnoteTooltips(contentEl);
      window.SiteMd.hydrateLinkPreviewsInContainer(contentEl);

      wireContentImages(contentEl);

      // Extract headings, stamp IDs, build sidebar TOC
      var headings = extractHeadings(contentEl);
      buildTocSidebar(headings);
    }

    var loadingEl = document.getElementById("bp-loading");
    var layoutEl = document.getElementById("bp-layout");
    if (loadingEl) loadingEl.hidden = true;
    if (layoutEl) layoutEl.hidden = false;

    wireScrollBehavior(title);
  }

  async function init() {
    var slug = getSlug();

    if (!slug) {
      window.location.replace(getBackUrl());
      return;
    }

    // Try a collection (blog "posts" or "music"); strips the optional
    // leading directory prefix on entries like "music/2019-...md".
    async function tryCollection(dir) {
      var indexText;
      try {
        indexText = await fetchText(SITE_ROOT + dir + "/index.json");
      } catch (_) {
        return null;
      }
      var index;
      try { index = JSON.parse(indexText); } catch (_) { return null; }
      if (!Array.isArray(index)) return null;

      var match = index.find(function (entry) {
        var name = String(entry || "").replace(/^.*\//, "").replace(/\.md$/i, "");
        return name === slug;
      });
      if (!match) return null;
      var filename = String(match).replace(/^.*\//, "");
      try {
        return await fetchText(SITE_ROOT + dir + "/" + filename);
      } catch (_) {
        return null;
      }
    }

    try {
      var markdown = await tryCollection("posts");
      if (markdown) {
        postSourceTab = "blog";
      } else {
        var musicMd = await tryCollection("music");
        if (musicMd) {
          markdown = musicMd;
          postSourceTab = "music";
        }
      }

      if (!markdown) {
        // Try hidden posts — accessible by URL but not listed in the index
        try {
          markdown = await fetchText(SITE_ROOT + "posts/hidden/" + slug + ".md");
          postSourceTab = "blog";
        } catch (_) {}
      }

      if (!markdown) {
        showError();
        return;
      }

      currentRawMarkdown = markdown;
      currentSlug = slug;
      renderPost(localizeMarkdown(markdown), slug);
      if (window.portfolioI18n && typeof window.portfolioI18n.apply === "function") {
        window.portfolioI18n.apply(document);
      }
      if (window.portfolioSeo && typeof window.portfolioSeo.refresh === "function") {
        window.portfolioSeo.refresh();
      }
    } catch (err) {
      showError();
    }
  }

  // Re-render with the newly selected language's content when the site-wide
  // preference changes (same "portfolio-language" localStorage key used
  // everywhere else on the site).
  var currentRawMarkdown = "";
  var currentSlug = "";
  document.addEventListener("portfolio:language-change", function () {
    if (!currentRawMarkdown) return;
    renderPost(localizeMarkdown(currentRawMarkdown), currentSlug);
    if (window.portfolioI18n && typeof window.portfolioI18n.apply === "function") {
      window.portfolioI18n.apply(document);
    }
    if (window.portfolioSeo && typeof window.portfolioSeo.refresh === "function") {
      window.portfolioSeo.refresh();
    }
  });

  if (window.portfolioI18n && typeof window.portfolioI18n.apply === "function") {
    window.portfolioI18n.apply(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
