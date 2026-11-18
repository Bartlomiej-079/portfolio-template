/**
 * Shared markdown rendering library.
 * Included in blog/index.html (standalone pages). The main index.html uses
 * the same logic inline in script.js — keep both in sync when editing.
 * Exposes window.SiteMd with the public API.
 */
(function (global) {
  var ROTATION_SLOT_REGEX = /^::rotation\s+(.+)$/i;
  var COLUMNS_REGEX = /^::columns\s+(.+)$/i;

  // ── Escape helpers ────────────────────────────────────────────────

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeAttribute(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  var LINK_PREVIEW_METADATA_CACHE = new Map();

  function normalizePreviewText(value, maxLen) {
    var s = String(value || "").replace(/\s+/g, " ").trim();
    if (!s) return "";
    if (s.length <= maxLen) return s;
    return s.slice(0, Math.max(0, maxLen - 1)).trimEnd() + "…";
  }

  function derivePreviewTitleFromUrl(url) {
    try {
      var parsed = new URL(url);
      var segs = parsed.pathname.split("/").filter(Boolean);
      var last = segs.length > 0 ? segs[segs.length - 1] : "";
      var slug = decodeURIComponent(last || "").replace(/\.[a-z0-9]{1,6}$/i, "").replace(/[-_+]+/g, " ").trim();
      if (slug) {
        return normalizePreviewText(slug.replace(/\b\w/g, function (c) { return c.toUpperCase(); }), 140);
      }
      return normalizePreviewText(parsed.hostname.replace(/^www\./i, ""), 140);
    } catch (_) {
      return normalizePreviewText(url, 140);
    }
  }

  function extractMetadataFromMicrolink(payload) {
    var data = payload && payload.data ? payload.data : {};
    var imageValue = "";
    if (typeof data.image === "string") imageValue = data.image;
    if (data.image && typeof data.image === "object" && typeof data.image.url === "string") imageValue = data.image.url;
    return {
      title: normalizePreviewText(data.title, 140),
      description: normalizePreviewText(data.description, 280),
      image: normalizePreviewText(imageValue, 1000)
    };
  }

  function extractMetadataFromNoembed(payload) {
    return {
      title: normalizePreviewText(payload && payload.title, 140),
      description: normalizePreviewText(payload && payload.description, 280),
      image: normalizePreviewText((payload && (payload.thumbnail_url || payload.thumbnailUrl)) || "", 1000)
    };
  }

  function fetchJsonWithTimeout(url, timeoutMs) {
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var tid = null;
    if (ctrl) {
      tid = setTimeout(function () {
        try { ctrl.abort(); } catch (_) {}
      }, timeoutMs);
    }

    var request = fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
      .then(function (resp) {
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        return resp.json();
      })
      .finally(function () {
        if (tid) clearTimeout(tid);
      });

    return request;
  }

  function fetchLinkPreviewMetadata(url) {
    var key = String(url || "").trim();
    if (!key) return Promise.resolve({});
    if (LINK_PREVIEW_METADATA_CACHE.has(key)) {
      return LINK_PREVIEW_METADATA_CACHE.get(key);
    }

    var encoded = encodeURIComponent(key);
    var promise = fetchJsonWithTimeout("https://api.microlink.io/?url=" + encoded + "&meta=true&screenshot=false&audio=false&video=false", 6000)
      .then(extractMetadataFromMicrolink)
      .catch(function () {
        return fetchJsonWithTimeout("https://noembed.com/embed?url=" + encoded, 5000)
          .then(extractMetadataFromNoembed)
          .catch(function () { return {}; });
      })
      .then(function (meta) {
        return {
          title: normalizePreviewText(meta && meta.title, 140),
          description: normalizePreviewText(meta && meta.description, 280),
          image: normalizePreviewText(meta && meta.image, 1000)
        };
      });

    LINK_PREVIEW_METADATA_CACHE.set(key, promise);
    return promise;
  }

  function hydrateLinkPreviewsInContainer(container) {
    if (!container) return;
    var nodes = container.querySelectorAll(".md-link-preview[data-link-preview-url]");
    nodes.forEach(function (node) {
      if (node.getAttribute("data-link-preview-hydrated") === "1") return;
      node.setAttribute("data-link-preview-hydrated", "1");

      var missingTitle = node.getAttribute("data-link-preview-missing-title") === "1";
      var missingDesc = node.getAttribute("data-link-preview-missing-description") === "1";
      if (!missingTitle && !missingDesc) return;

      var url = node.getAttribute("data-link-preview-url") || node.getAttribute("href") || "";
      if (!url) return;

      var titleNode = node.querySelector(".md-link-preview-title");
      var bodyNode = node.querySelector(".md-link-preview-body");
      var descNode = node.querySelector(".md-link-preview-desc");

      fetchLinkPreviewMetadata(url).then(function (meta) {
        if (missingTitle && titleNode) {
          var bestTitle = meta.title || derivePreviewTitleFromUrl(url);
          if (bestTitle) titleNode.textContent = bestTitle;
        }

        if (missingDesc) {
          var bestDescription = meta.description || "";
          if (bestDescription) {
            if (!descNode && bodyNode) {
              descNode = document.createElement("div");
              descNode.className = "md-link-preview-desc";
              bodyNode.appendChild(descNode);
            }
            if (descNode) descNode.textContent = bestDescription;
          }
        }
      }).catch(function () {
        if (missingTitle && titleNode) {
          var fallback = derivePreviewTitleFromUrl(url);
          if (fallback) titleNode.textContent = fallback;
        }
      });
    });
  }

  // ── Attribute parsing ────────────────────────────────────────────

  function tokenizeAttributeString(raw) {
    return String(raw || "").match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
  }

  function normalizeMarkdownReferenceId(value) {
    return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  }

  function parseAttributeSuffix(line) {
    var match = line.match(/^(.*)\s\{([^{}]+)\}\s*$/);
    if (!match) return { text: line, attrs: "" };

    var text = match[1].trimEnd();
    var raw = match[2].trim();
    var tokens = raw.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    var classNames = [];
    var attributes = [];

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (token.startsWith(".")) {
        var cn = token.slice(1).trim();
        if (cn) classNames.push(cn);
        continue;
      }
      var eq = token.indexOf("=");
      if (eq > 0) {
        var key = token.slice(0, eq).trim();
        var val = token.slice(eq + 1).trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
        if (key) attributes.push(escapeAttribute(key) + '="' + escapeAttribute(val) + '"');
        continue;
      }
      var k = token.trim();
      if (k) attributes.push(escapeAttribute(k) + '="true"');
    }

    var normalized = classNames.map(function (cn) {
      return cn.startsWith("animate__") ? cn.replace(/^animate__/, "") : cn;
    });
    if (normalized.includes("wow") && !normalized.includes("animated")) {
      normalized.unshift("animated");
    }
    if (normalized.length > 0) {
      attributes.unshift('class="' + escapeAttribute(normalized.join(" ")) + '"');
    }

    return { text: text, attrs: attributes.length > 0 ? " " + attributes.join(" ") : "" };
  }

  // ── Image options ────────────────────────────────────────────────

  function normalizeImageSize(value) {
    var raw = String(value || "").trim();
    if (!raw) return "";
    if (/^\d*\.?\d+$/.test(raw)) return raw + "px";
    if (/^\d*\.?\d+(px|%|em|rem|vw|vh)$/i.test(raw)) return raw;
    return "";
  }

  function parseInlineImageOptions(rawOptions) {
    var classNames = ["md-image"];
    var styles = [];
    var caption = "";
    var decoded = String(rawOptions || "").replaceAll("&quot;", '"').replaceAll("&#39;", "'");
    var tokens = tokenizeAttributeString(decoded);

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (token.startsWith(".")) {
        var cn = token.slice(1).trim();
        if (cn) classNames.push(cn);
        continue;
      }
      var eq = token.indexOf("=");
      if (eq <= 0) continue;
      var key = token.slice(0, eq).trim().toLowerCase();
      var value = token.slice(eq + 1).trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");

      if (key === "width" || key === "w") {
        var w = normalizeImageSize(value);
        if (w) styles.push("width:" + w);
      } else if (key === "height" || key === "h") {
        var h = normalizeImageSize(value);
        if (h) styles.push("height:" + h);
      } else if (key === "align") {
        var a = value.toLowerCase();
        if (a === "left") classNames.push("md-image-align-left");
        if (a === "right") classNames.push("md-image-align-right");
        if (a === "center") classNames.push("md-image-align-center");
      } else if (key === "wrap") {
        var wr = value.toLowerCase();
        if (wr === "left") classNames.push("md-image-wrap-left");
        if (wr === "right") classNames.push("md-image-wrap-right");
        if (wr === "none") classNames.push("md-image-wrap-none");
      } else if (key === "caption" || key === "cap") {
        caption = value;
      }
    }

    var unique = Array.from(new Set(classNames));
    return {
      classNames: unique,
      styleAttr: styles.length > 0 ? ' style="' + escapeAttribute(styles.join(";")) + '"' : "",
      caption: caption
    };
  }

  // ── Definitions (footnotes + references) ────────────────────────

  function extractMarkdownDefinitions(markdown) {
    var lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
    var contentLines = [];
    var footnoteDefinitions = new Map();
    var referenceDefinitions = new Map();

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var fnMatch = line.match(/^\[\^([^\]]+)\]:\s*(.*)$/);
      if (fnMatch) {
        var fnId = normalizeMarkdownReferenceId(fnMatch[1]);
        var parts = [fnMatch[2].trim()];
        while (i + 1 < lines.length && /^(?:\t| {2,})\S/.test(lines[i + 1])) {
          i++;
          parts.push(lines[i].trim());
        }
        footnoteDefinitions.set(fnId, parts.filter(Boolean).join(" ").trim());
        continue;
      }

      var refMatch = line.match(/^\[([^\]]+)\]:\s*(\S+)(?:\s+"([^"]+)")?\s*$/);
      if (refMatch && !refMatch[1].startsWith("^")) {
        var refId = normalizeMarkdownReferenceId(refMatch[1]);
        referenceDefinitions.set(refId, { href: refMatch[2], title: refMatch[3] || "" });
        continue;
      }

      contentLines.push(line);
    }

    return { content: contentLines.join("\n"), footnoteDefinitions: footnoteDefinitions, referenceDefinitions: referenceDefinitions };
  }

  function formatMarkdownKbdLabel(raw) {
    var text = String(raw || "").trim();
    text = text.replace(/^(cmd|command)\b\s*\+?\s*/i, "⌘");
    text = text.replace(/^(ctrl|control)\b\s*\+?\s*/i, "Ctrl");
    text = text.replace(/^⌘\s*\+\s*/, "⌘");
    text = text.replace(/^Ctrl\s*\+\s*/, "Ctrl");
    return text;
  }

  var MARKDOWN_FA_HREF = "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css";
  var MARKDOWN_FA_STYLES = {
    solid: "fa-solid", regular: "fa-regular", brands: "fa-brands",
    light: "fa-light", thin: "fa-thin", duotone: "fa-duotone",
    fas: "fa-solid", far: "fa-regular", fab: "fa-brands"
  };

  function ensureMarkdownFontAwesome() {
    if (typeof document === "undefined") return;
    if (document.getElementById("md-carousel-fa") || document.getElementById("md-fa")) return;
    if (document.querySelector('link[href*="fontawesome"], link[href*="font-awesome"]')) return;
    var link = document.createElement("link");
    link.id = "md-fa";
    link.rel = "stylesheet";
    link.href = MARKDOWN_FA_HREF;
    link.crossOrigin = "anonymous";
    link.referrerPolicy = "no-referrer";
    document.head.appendChild(link);
  }

  function markdownFaClassList(spec) {
    var tokens = String(spec || "").toLowerCase().split(/[/\s]+/).filter(Boolean);
    var classes = [];
    var hasStyle = false;
    var hasName = false;
    tokens.forEach(function (raw) {
      if (!/^[a-z0-9-]+$/.test(raw)) return;
      var style = MARKDOWN_FA_STYLES[raw] || MARKDOWN_FA_STYLES[raw.replace(/^fa-/, "")];
      if (style) {
        if (!hasStyle) { classes.unshift(style); hasStyle = true; }
        return;
      }
      if (raw === "fa") return;
      classes.push(raw.startsWith("fa-") ? raw : "fa-" + raw);
      hasName = true;
    });
    if (!hasName) return "";
    if (!hasStyle) classes.unshift("fa-solid");
    return classes.join(" ");
  }

  function renderMarkdownFaIcon(spec, label) {
    var classes = markdownFaClassList(spec);
    if (!classes) return escapeHtml(label || "");
    ensureMarkdownFontAwesome();
    var labelText = String(label || "").trim();
    var title = labelText ? ' title="' + escapeAttribute(labelText) + '"' : "";
    var aria = labelText
      ? ' role="img" aria-label="' + escapeAttribute(labelText) + '"'
      : ' aria-hidden="true"';
    return '<i class="md-fa-icon ' + escapeAttribute(classes) + '"' + title + aria + "></i>";
  }

  var TCOLORBOX_VARIANTS = { note: true, tip: true, info: true, warn: true, hint: true };

  function parseTcolorboxMeta(meta) {
    var raw = String(meta || "").trim();
    if (!raw) return { variant: "note", title: "note" };
    var parts = raw.split(/\s+/);
    var first = parts[0].toLowerCase();
    if (TCOLORBOX_VARIANTS[first]) {
      return { variant: first, title: parts.slice(1).join(" ") || first };
    }
    return { variant: "note", title: raw };
  }

  function renderTcolorboxParagraphs(bodyMarkdown, ctx) {
    return String(bodyMarkdown || "")
      .split(/\n\s*\n/)
      .map(function (para) { return para.trim().replace(/\n/g, " "); })
      .filter(Boolean)
      .map(function (para) { return "<p>" + renderInlineMarkdown(para, ctx) + "</p>"; })
      .join("");
  }

  function splitTcolorboxBodies(bodyMarkdown) {
    var lines = String(bodyMarkdown || "").replace(/\r\n/g, "\n").split("\n");
    var desktop = [];
    var mobile = [];
    var bucket = desktop;
    lines.forEach(function (line) {
      var trimmed = line.trim();
      if (/^::mobile\s*$/i.test(trimmed)) { bucket = mobile; return; }
      if (/^::desktop\s*$/i.test(trimmed)) { bucket = desktop; return; }
      bucket.push(line);
    });
    return { desktop: desktop.join("\n"), mobile: mobile.join("\n") };
  }

  function buildTcolorboxHtml(meta, bodyMarkdown, ctx) {
    var suffix = parseAttributeSuffix(String(meta || ""));
    var parsed = parseTcolorboxMeta(suffix.text);

    var extraClassNames = [];
    var extraAttrs = suffix.attrs;
    var classMatch = suffix.attrs.match(/\sclass="([^"]*)"/);
    if (classMatch) {
      extraClassNames = classMatch[1].split(/\s+/).filter(Boolean);
      extraAttrs = suffix.attrs.slice(0, classMatch.index) + suffix.attrs.slice(classMatch.index + classMatch[0].length);
    }

    var classNames = ["md-tcolorbox", "md-tcolorbox--" + parsed.variant].concat(extraClassNames);
    var split = splitTcolorboxBodies(bodyMarkdown);
    var desktopHtml = renderTcolorboxParagraphs(split.desktop, ctx);
    var mobileHtml = renderTcolorboxParagraphs(split.mobile, ctx);
    var bodies = mobileHtml
      ? '<div class="md-tcolorbox-body md-tcolorbox-body--desktop">' + desktopHtml + '</div><div class="md-tcolorbox-body md-tcolorbox-body--mobile">' + mobileHtml + "</div>"
      : '<div class="md-tcolorbox-body">' + desktopHtml + "</div>";
    return '<aside class="' + escapeAttribute(classNames.join(" ")) + '"' + extraAttrs + '><div class="md-tcolorbox-title">' + escapeHtml(parsed.title) + "</div>" + bodies + "</aside>";
  }

  // ── Inline markdown renderer ─────────────────────────────────────

  function renderInlineMarkdown(text, ctx) {
    var INLINE_TAG = /(<\/?(?:span|abbr|mark|kbd|sub|sup|cite|time|del|ins|s|u|b|i|small|strong|em|a|code|br|wbr)\b[^>]*>)/gi;
    var parts = String(text).split(INLINE_TAG);
    var html = parts.map(function(part, idx) { return idx % 2 === 1 ? part : escapeHtml(part); }).join("");
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    html = html.replace(
      /!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]+)")?\)\s*(?:\{([^{}]+)\})?/g,
      function (_, alt, src, title, imageOptions) {
        var opts = parseInlineImageOptions(imageOptions);
        var layoutPat = /^md-image-(?:align|wrap)-/;
        var imgClasses = opts.classNames.filter(function (n) { return !layoutPat.test(n); });
        var classAttr = ' class="' + escapeAttribute(imgClasses.join(" ")) + '"';
        var titleAttr = title ? ' title="' + escapeAttribute(title) + '"' : "";
        var imgHtml = '<img src="' + escapeAttribute(src) + '" alt="' + escapeAttribute(alt) + '" loading="lazy"' + classAttr + opts.styleAttr + titleAttr + " />";
        if (!opts.caption) return imgHtml;
        var figClasses = ["md-figure"].concat(opts.classNames.filter(function (n) { return n !== "md-image"; }));
        var uniqueFig = Array.from(new Set(figClasses));
        return '<figure class="' + escapeAttribute(uniqueFig.join(" ")) + '">' + imgHtml + '<figcaption class="md-figure-caption">' + escapeHtml(opts.caption) + "</figcaption></figure>";
      }
    );

    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)(\{new-tab\})?/g, function (_, text, url, newTab) {
      var me = (window.portfolioSeo && typeof window.portfolioSeo.relMeAttr === "function")
        ? window.portfolioSeo.relMeAttr(url)
        : "";
      if (newTab) return '<a href="' + url + '" target="_blank" rel="' + (me ? "me noreferrer" : "noreferrer") + '">' + text + '</a>';
      return me ? '<a href="' + url + '" rel="me">' + text + '</a>' : '<a href="' + url + '">' + text + '</a>';
    });

    html = html.replace(/\[([^\]]+)\]\{kbd\}/gi, function (_, keys) {
      return '<kbd class="md-kbd settings-shortcut-kbd">' + formatMarkdownKbdLabel(keys) + "</kbd>";
    });

    html = html.replace(/\[([^\]]+)\]\{settings\}/gi, function (_, label) {
      return '<a href="settings" class="md-settings-open" data-settings-open="popover">' + label + "</a>";
    });

    html = html.replace(/\[([^\]]+)\]\{fa:([^}]+)\}/gi, function (_, label, spec) {
      return renderMarkdownFaIcon(spec, label);
    });
    html = html.replace(/\{fa:([^}]+)\}/gi, function (_, spec) {
      return renderMarkdownFaIcon(spec, "");
    });

    if (ctx && ctx.referenceDefinitions instanceof Map) {
      html = html.replace(/\[([^\]]+)\]\[([^\]]+)\]/g, function (full, label, refId) {
        var id = normalizeMarkdownReferenceId(refId);
        var ref = ctx.referenceDefinitions.get(id);
        if (!ref) return full;
        var ta = ref.title ? ' title="' + escapeAttribute(ref.title) + '"' : "";
        return '<a href="' + escapeAttribute(ref.href) + '"' + ta + ">" + label + "</a>";
      });
      html = html.replace(/\[([^\]]+)\]\[\]/g, function (full, refId) {
        var id = normalizeMarkdownReferenceId(refId);
        var ref = ctx.referenceDefinitions.get(id);
        if (!ref) return full;
        var ta = ref.title ? ' title="' + escapeAttribute(ref.title) + '"' : "";
        return '<a href="' + escapeAttribute(ref.href) + '"' + ta + ">" + refId + "</a>";
      });
    }

    if (ctx && ctx.footnoteDefinitions instanceof Map) {
      html = html.replace(/\[\^([^\]]+)\]/g, function (full, fnId) {
        var id = normalizeMarkdownReferenceId(fnId);
        if (!ctx.footnoteDefinitions.has(id)) return full;
        if (!ctx.footnoteNumbers.has(id)) {
          var n = ctx.footnoteOrder.length + 1;
          ctx.footnoteOrder.push(id);
          ctx.footnoteNumbers.set(id, n);
        }
        var num = ctx.footnoteNumbers.get(id);
        return '<sup class="md-footnote-ref"><a href="#fn-' + escapeAttribute(id) + '" id="fnref-' + escapeAttribute(id) + '">' + num + "</a></sup>";
      });
    }

    return html;
  }

  // ── Rotation anchor (used inside markdownToHtml) ─────────────────

  function normalizeRotationAnchor(value, fallback) {
    fallback = fallback || "";
    var raw = String(value || "").trim().toLowerCase();
    if (!raw) return fallback;
    var normalized = raw
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9_-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^[-_]+|[-_]+$/g, "");
    return normalized || fallback;
  }

  function parseColumnsConfig(rawConfig) {
    var config = { count: 3, ratios: null };
    var parts = String(rawConfig || "").trim().split(/\s+/);

    if (parts.length > 0) {
      var count = parseInt(parts[0], 10);
      if (count > 0 && count <= 12) config.count = count;
    }

    if (parts.length > 1) {
      var ratioStr = parts[1];
      var ratios = ratioStr.split("-").map(function(r) { return parseInt(r, 10); });
      if (ratios.length === config.count && ratios.every(function(r) { return r > 0; })) {
        config.ratios = ratios;
      }
    }

    return config;
  }

  // ── Block markdown renderer ──────────────────────────────────────

  function markdownToHtml(markdown) {
    var defs = extractMarkdownDefinitions(markdown);
    var ctx = {
      footnoteDefinitions: defs.footnoteDefinitions,
      referenceDefinitions: defs.referenceDefinitions,
      footnoteOrder: [],
      footnoteNumbers: new Map()
    };

    var lines = defs.content.replace(/\r\n/g, "\n").split("\n");
    var html = [];
    var paragraph = [];
    var listStack = [];
    var inCodeFence = false;
    var codeFenceLanguage = "";
    var codeLines = [];
    var quoteLines = [];

    function flushParagraph() {
      if (!paragraph.length) return;
      var text = paragraph.join(" ").trim();
      if (text) {
        var rendered = renderInlineMarkdown(text, ctx);
        if (/^(?:<img\b[^>]*\/>|<figure\b[\s\S]*<\/figure>)$/.test(rendered.trim())) {
          html.push(rendered);
        } else {
          html.push("<p>" + rendered + "</p>");
        }
      }
      paragraph = [];
    }

    var ROMAN_RE = /^[ivxlcdm]+$/i;

    function classifyAlphaMarker(token, openTypeAtIndent) {
      var isUpper = token === token.toUpperCase() && /[A-Za-z]/.test(token);
      var lower = token.toLowerCase();
      if (token.length > 1) {
        if (ROMAN_RE.test(token)) return isUpper ? "I" : "i";
        return null;
      }
      if (openTypeAtIndent === "i" || openTypeAtIndent === "I") {
        return isUpper ? "I" : "i";
      }
      if (openTypeAtIndent === "a" || openTypeAtIndent === "A") {
        return isUpper ? "A" : "a";
      }
      if (lower === "i" || lower === "v" || lower === "x") {
        return isUpper ? "I" : "i";
      }
      return isUpper ? "A" : "a";
    }

    function detectListMarker(rawLine) {
      var leading = rawLine.match(/^[ \t]*/)[0];
      var indent = leading.replace(/\t/g, "    ").length;
      var trimmedLine = rawLine.trim();
      var m;
      if ((m = trimmedLine.match(/^([-*])\s+(.*)$/))) {
        return { tag: "ul", markerType: "bullet", indent: indent, rest: m[2] };
      }
      if ((m = trimmedLine.match(/^(\d+)[.)]\s+(.*)$/))) {
        return { tag: "ol", markerType: "1", indent: indent, rest: m[2] };
      }
      if ((m = trimmedLine.match(/^([a-zA-Z]+)[.)]\s+(.*)$/))) {
        var token = m[1];
        var rest = m[2];
        var openTypeAtIndent = null;
        for (var i = listStack.length - 1; i >= 0; i -= 1) {
          if (listStack[i].indent === indent && listStack[i].tag === "ol") {
            openTypeAtIndent = listStack[i].markerType;
            break;
          }
          if (listStack[i].indent < indent) break;
        }
        var markerType = classifyAlphaMarker(token, openTypeAtIndent);
        if (!markerType) return null;
        return { tag: "ol", markerType: markerType, indent: indent, rest: rest };
      }
      return null;
    }

    function openList(info) {
      var typeAttr = info.markerType && info.markerType !== "bullet" && info.markerType !== "1"
        ? ' type="' + info.markerType + '"'
        : "";
      var nestedInLi = false;
      if (listStack.length > 0 && listStack[listStack.length - 1].indent < info.indent) {
        var lastHtml = html[html.length - 1];
        if (typeof lastHtml === "string" && lastHtml.slice(-5) === "</li>") {
          html[html.length - 1] = lastHtml.slice(0, -5);
          nestedInLi = true;
        }
      }
      html.push("<" + info.tag + typeAttr + ">");
      listStack.push({ tag: info.tag, markerType: info.markerType, indent: info.indent, nestedInLi: nestedInLi });
    }

    function popList() {
      var top = listStack.pop();
      html.push("</" + top.tag + ">");
      if (top.nestedInLi) html.push("</li>");
    }

    function closeList() {
      while (listStack.length > 0) popList();
    }

    function handleListItem(info) {
      flushParagraph();
      while (listStack.length > 0 && listStack[listStack.length - 1].indent > info.indent) {
        popList();
      }
      var top = listStack[listStack.length - 1];
      if (!top || top.indent < info.indent || top.markerType !== info.markerType || top.tag !== info.tag) {
        if (top && top.indent === info.indent) popList();
        openList(info);
      }
      var parsed = parseAttributeSuffix(info.rest);
      html.push("<li" + parsed.attrs + ">" + renderInlineMarkdown(parsed.text, ctx) + "</li>");
    }

    function flushQuote() {
      if (!quoteLines.length) return;
      var lines = quoteLines.map(function(l) { return l.trim(); }).filter(Boolean);
      if (lines.length) {
        var inner = lines.map(function(l) { return renderInlineMarkdown(l, ctx); }).join("<br>");
        html.push("<blockquote><p>" + inner + "</p></blockquote>");
      }
      quoteLines = [];
    }

    function normalizeCodeLang(v) {
      var aliases = { "c++": "cpp", "c#": "csharp", js: "javascript", ts: "typescript", py: "python", rb: "ruby", sh: "bash", shell: "bash" };
      var n = String(v || "").trim().toLowerCase();
      return aliases[n] || n;
    }

    function parseLinkPreviewBlock(lines) {
      var fields = {};
      for (var i = 0; i < lines.length; i++) {
        var m = lines[i].match(/^([a-zA-Z]+)\s*:\s*(.*)$/);
        if (m) fields[m[1].toLowerCase().trim()] = m[2].trim();
      }
      return fields;
    }

    function renderLinkPreview(fields) {
      var url = fields.url || "";
      var rawTitle = fields.title || "";
      var rawDescription = fields.description || "";
      var title = rawTitle || derivePreviewTitleFromUrl(url);
      var description = rawDescription || "";
      var image = fields.image || "";
      var domain = "";
      try { domain = new URL(url).hostname.replace(/^www\./, ""); } catch (_) { domain = url; }

      var faviconSrc = "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(domain) + "&sz=64";
      var imgSrc = image || faviconSrc;
      var isFavicon = !image;

      var imgHtml = '<div class="md-link-preview-image' + (isFavicon ? " md-link-preview-favicon" : "") + '">' +
        '<img src="' + escapeAttribute(imgSrc) + '" alt="" loading="lazy" /></div>';
      var descHtml = description
        ? '<div class="md-link-preview-desc">' + escapeHtml(description) + "</div>"
        : "";
      var inner = imgHtml +
        '<div class="md-link-preview-body">' +
          '<div class="md-link-preview-domain">' + escapeHtml(domain) + "</div>" +
          '<div class="md-link-preview-title">' + escapeHtml(title) + "</div>" +
          descHtml +
        "</div>";

      if (url) {
        var attrs = ' data-link-preview-url="' + escapeAttribute(url) + '"' +
          ' data-link-preview-missing-title="' + (rawTitle ? "0" : "1") + '"' +
          ' data-link-preview-missing-description="' + (rawDescription ? "0" : "1") + '"';
        return '<a class="md-link-preview" href="' + escapeAttribute(url) + '" target="_blank" rel="noreferrer"' + attrs + '>' + inner + "</a>";
      }
      return '<div class="md-link-preview">' + inner + "</div>";
    }

    function flushCodeFence() {
      if (!inCodeFence) return;
      var lang = normalizeCodeLang(codeFenceLanguage);
      if (lang === "link-preview") {
        html.push(renderLinkPreview(parseLinkPreviewBlock(codeLines)));
        inCodeFence = false; codeFenceLanguage = ""; codeLines = [];
        return;
      }
      var cls = lang ? ' class="language-' + escapeAttribute(lang) + '"' : "";
      html.push("<pre><code" + cls + ">" + escapeHtml(codeLines.join("\n")) + "</code></pre>");
      inCodeFence = false; codeFenceLanguage = ""; codeLines = [];
    }

    function splitRow(line) {
      return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map(function (c) { return c.trim(); });
    }

    function isSeparator(line) {
      var cells = splitRow(line);
      return cells.length > 0 && cells.every(function (c) { return /^:?-{2,}:?$/.test(c); });
    }

    function renderTable(headerLine, sepLine, bodyLines) {
      var headers = splitRow(headerLine);
      var seps = splitRow(sepLine);
      var aligns = seps.map(function (s) {
        if (/^:-+:$/.test(s)) return "center";
        if (/^-+:$/.test(s)) return "right";
        if (/^:-+$/.test(s)) return "left";
        return "";
      });
      var thead = headers.map(function (cell, idx) {
        var al = aligns[idx] ? ' style="text-align:' + aligns[idx] + '"' : "";
        return "<th" + al + ">" + renderInlineMarkdown(cell, ctx) + "</th>";
      }).join("");
      var tbody = bodyLines.map(function (row) {
        var cells = splitRow(row);
        return "<tr>" + headers.map(function (_, idx) {
          var al = aligns[idx] ? ' style="text-align:' + aligns[idx] + '"' : "";
          return "<td" + al + ">" + renderInlineMarkdown(cells[idx] || "", ctx) + "</td>";
        }).join("") + "</tr>";
      }).join("");
      return "<table><thead><tr>" + thead + "</tr></thead><tbody>" + tbody + "</tbody></table>";
    }

    function normalizeVSpace(v) {
      var raw = String(v || "").trim();
      if (!raw) return "1.25em";
      return /^\d*\.?\d+(px|em|rem|vh|vw|%)$/i.test(raw) ? raw : "1.25em";
    }

    for (var li = 0; li < lines.length; li++) {
      var rawLine = lines[li];
      var line = rawLine.trimEnd();
      var trimmed = line.trim();

      if (inCodeFence) {
        if (/^```\s*$/.test(trimmed)) { flushCodeFence(); }
        else { codeLines.push(rawLine); }
        continue;
      }

      var tcolorboxFence = trimmed.match(/^```\s*tcolorbox(?:\s+(.*))?$/i);
      if (tcolorboxFence) {
        flushParagraph(); closeList(); flushQuote();
        var tcolorboxLines = [];
        li += 1;
        while (li < lines.length && !/^```\s*$/.test(lines[li].trim())) {
          tcolorboxLines.push(lines[li]);
          li += 1;
        }
        html.push(buildTcolorboxHtml(tcolorboxFence[1] || "", tcolorboxLines.join("\n"), ctx));
        continue;
      }

      var fenceStart = trimmed.match(/^```\s*([^\s`]+)?\s*$/);
      if (fenceStart) {
        flushParagraph(); closeList(); flushQuote();

        if (String(fenceStart[1] || "").toLowerCase() === "carousel") {
          var carouselLines = [];
          var carouselInnerFence = false;
          li += 1;
          while (li < lines.length) {
            var carouselLine = lines[li].trim();
            if (/^```/.test(carouselLine)) {
              if (carouselInnerFence) carouselInnerFence = false;
              else if (/^```\s*$/.test(carouselLine)) break;
              else carouselInnerFence = true;
            }
            carouselLines.push(lines[li]);
            li += 1;
          }
          if (global.SiteCarousel) {
            html.push(global.SiteCarousel.buildHtml(carouselLines.join("\n"), markdownToHtml));
          }
          continue;
        }

        inCodeFence = true; codeFenceLanguage = fenceStart[1] || ""; codeLines = [];
        continue;
      }

      if (!trimmed) {
        flushParagraph();
        flushQuote();
        if (listStack.length > 0) {
          var nextNonBlank = -1;
          for (var scan = li + 1; scan < lines.length; scan += 1) {
            if (lines[scan].trim()) { nextNonBlank = scan; break; }
          }
          if (nextNonBlank === -1 || !detectListMarker(lines[nextNonBlank])) {
            closeList();
          }
        }
        continue;
      }

      var vspaceM = trimmed.match(/^::vspace(?:\s+([^\s]+))?$/i);
      if (vspaceM) {
        flushParagraph(); closeList(); flushQuote();
        html.push('<div class="md-vspace" style="height:' + escapeAttribute(normalizeVSpace(vspaceM[1])) + '"></div>');
        continue;
      }

      var rotM = trimmed.match(ROTATION_SLOT_REGEX);
      if (rotM) {
        flushParagraph(); closeList(); flushQuote();
        var slotId = normalizeRotationAnchor(rotM[1]);
        if (slotId) html.push('<div class="md-rotation-slot" data-rotation-id="' + escapeAttribute(slotId) + '"></div>');
        continue;
      }

      var colsM = trimmed.match(COLUMNS_REGEX);
      if (colsM) {
        flushParagraph(); closeList(); flushQuote();
        var cfg = parseColumnsConfig(colsM[1]);
        var gridTempl = cfg.ratios
          ? 'grid-template-columns: ' + cfg.ratios.map(function(r) { return r + 'fr'; }).join(' ') + ';'
          : 'grid-template-columns: repeat(' + cfg.count + ', 1fr);';
        html.push('<div class="md-columns" style="' + gridTempl + '">');
        var colIdx = 0;
        while (li + 1 < lines.length && colIdx < cfg.count) {
          li++;
          var colLine = lines[li].trim();
          if (!colLine) {
            /* skip blank lines between columns */
            while (li + 1 < lines.length && !lines[li + 1].trim()) { li++; }
            li--;
            continue;
          }
          if (colLine.match(/^::/)) { li--; break; }
          html.push('<div class="md-column">');
          html.push(renderInlineMarkdown(colLine, defs));
          /* collect remaining lines for this column until blank line or next directive */
          while (li + 1 < lines.length) {
            var nextLine = lines[li + 1].trim();
            if (!nextLine) {
              li++;
              break;
            }
            if (nextLine.match(/^::/)) {
              break;
            }
            li++;
            html.push('<p>' + renderInlineMarkdown(nextLine, defs) + '</p>');
          }
          html.push('</div>');
          colIdx++;
        }
        html.push('</div>');
        continue;
      }

      if (/^[-*_]{3,}$/.test(trimmed)) {
        flushParagraph(); closeList(); flushQuote(); html.push("<hr />"); continue;
      }

      if (trimmed.startsWith(">")) {
        flushParagraph(); closeList();
        quoteLines.push(trimmed.replace(/^>\s?/, ""));
        continue;
      }

      flushQuote();

      if (/^<(iframe|video|audio|div|section|details|summary|figure|form|script|style|article|aside|header|footer|main|nav)\b/i.test(trimmed)) {
        flushParagraph(); closeList();
        var rawHtmlLines = [line];
        while (li + 1 < lines.length && lines[li + 1].trim()) { li++; rawHtmlLines.push(lines[li]); }
        html.push(rawHtmlLines.join("\n"));
        continue;
      }

      if (trimmed.includes("|") && li + 1 < lines.length && isSeparator(lines[li + 1].trim())) {
        flushParagraph(); closeList();
        var bodyRows = [];
        var ti = li + 2;
        while (ti < lines.length && lines[ti].trim() && lines[ti].includes("|")) { bodyRows.push(lines[ti]); ti++; }
        html.push(renderTable(lines[li], lines[li + 1], bodyRows));
        li = ti - 1;
        continue;
      }

      var headingM = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headingM) {
        flushParagraph(); closeList();
        var level = headingM[1].length;
        var h = parseAttributeSuffix(headingM[2].trim());
        html.push("<h" + level + h.attrs + ">" + renderInlineMarkdown(h.text, ctx) + "</h" + level + ">");
        continue;
      }

      var listInfo = detectListMarker(rawLine);
      if (listInfo) {
        handleListItem(listInfo);
        continue;
      }

      var paraLine = parseAttributeSuffix(trimmed);
      if (paraLine.attrs) {
        flushParagraph(); closeList();
        html.push("<p" + paraLine.attrs + ">" + renderInlineMarkdown(paraLine.text, ctx) + "</p>");
        continue;
      }

      paragraph.push(paraLine.text);
    }

    flushQuote(); flushCodeFence(); flushParagraph(); closeList();

    if (ctx.footnoteOrder.length > 0) {
      var fnItems = ctx.footnoteOrder.map(function (id) {
        var text = ctx.footnoteDefinitions.get(id) || "";
        var rendered = renderInlineMarkdown(text, ctx);
        return '<li id="fn-' + escapeAttribute(id) + '">' + rendered +
          ' <a href="#fnref-' + escapeAttribute(id) + '" class="md-footnote-backref" aria-label="Back to reference">↩</a></li>';
      }).join("");
      html.push('<section class="md-footnotes"><hr /><ol>' + fnItems + "</ol></section>");
    }

    return html.join("\n");
  }

  // ── Code block rendering ─────────────────────────────────────────

  function getCodeLanguageFromNode(node) {
    if (!node) return "";
    var cn = String(node.className || "");
    var m = cn.match(/\blanguage-([a-z0-9_-]+)/i);
    var lang = String(m ? m[1] : "").trim().toLowerCase();
    var aliases = { "c++": "cpp", "c#": "csharp", js: "javascript", ts: "typescript", py: "python", rb: "ruby", sh: "bash", shell: "bash" };
    return aliases[lang] || lang;
  }

  function formatCodeLanguageLabel(language) {
    if (!language) return "plain text";
    var labels = { javascript: "JavaScript", typescript: "TypeScript", python: "Python", sql: "SQL", r: "R", cpp: "C++", csharp: "C#", bash: "Bash", json: "JSON", html: "HTML", css: "CSS", markdown: "Markdown" };
    return labels[language] || language.toUpperCase();
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "true");
      ta.style.cssText = "position:fixed;left:-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy") ? resolve() : reject(new Error("copy failed"));
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  function showCodeCopyToast(message, clientX, clientY) {
    var toast = document.createElement("div");
    toast.className = "code-copy-toast";
    toast.textContent = message;
    var x = Number.isFinite(clientX) ? clientX : window.innerWidth - 48;
    var y = Number.isFinite(clientY) ? clientY : window.innerHeight - 48;
    toast.style.left = Math.min(Math.max(12, x + 8), Math.max(12, window.innerWidth - 160)) + "px";
    toast.style.top = Math.min(Math.max(12, y - 20), Math.max(12, window.innerHeight - 40)) + "px";
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add("is-visible"); });
    setTimeout(function () {
      toast.classList.remove("is-visible");
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 140);
    }, 850);
  }

  function highlightCodeInContainer(container) {
    if (!container || !window.hljs) return;
    if (typeof window.hljs.configure === "function") window.hljs.configure({ ignoreUnescapedHTML: true });
    container.querySelectorAll("pre code").forEach(function (node) {
      var lang = getCodeLanguageFromNode(node);
      if (lang && typeof window.hljs.getLanguage === "function" && !window.hljs.getLanguage(lang)) {
        node.className = node.className.split(/\s+/).filter(function (t) { return !/^language-/i.test(t); }).join(" ");
      }
      try {
        window.hljs.highlightElement(node);
      } catch (_) {
        if (typeof window.hljs.highlightAuto === "function") {
          try {
            var res = window.hljs.highlightAuto(node.textContent || "");
            if (res && res.value) { node.innerHTML = res.value; node.classList.add("hljs"); }
          } catch (_2) {}
        }
      }
    });
  }

  function decorateCodeBlocks(container) {
    if (!container) return;
    container.querySelectorAll("pre code").forEach(function (codeNode) {
      var pre = codeNode.parentElement;
      if (!pre || (pre.parentElement && pre.parentElement.classList.contains("md-code-block"))) return;

      var lang = getCodeLanguageFromNode(codeNode);
      var wrapper = document.createElement("div");
      wrapper.className = "md-code-block";
      var toolbar = document.createElement("div");
      toolbar.className = "md-code-toolbar";
      var label = document.createElement("span");
      label.className = "md-code-language";
      label.textContent = formatCodeLanguageLabel(lang);
      var copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "md-code-copy";
      copyBtn.textContent = "copy";
      copyBtn.setAttribute("aria-label", "Copy code block");
      copyBtn.addEventListener("click", function (e) {
        if (copyBtn.disabled) return;
        copyBtn.disabled = true;
        copyTextToClipboard(codeNode.textContent || "").then(function () {
          copyBtn.textContent = "copied";
          copyBtn.classList.add("is-copied");
          showCodeCopyToast("Copied!", e.clientX, e.clientY);
        }).catch(function () {
          copyBtn.textContent = "failed";
          showCodeCopyToast("Copy failed", e.clientX, e.clientY);
        }).finally(function () {
          setTimeout(function () {
            copyBtn.textContent = "copy";
            copyBtn.classList.remove("is-copied");
            copyBtn.disabled = false;
          }, 1200);
        });
      });
      toolbar.appendChild(label);
      toolbar.appendChild(copyBtn);
      pre.classList.add("md-code-pre");
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(toolbar);
      wrapper.appendChild(pre);
    });
  }

  function renderCodeBlocksInContainer(container) {
    highlightCodeInContainer(container);
    decorateCodeBlocks(container);
  }

  function renderMathInContainer(container) {
    if (!container || typeof window.renderMathInElement !== "function") return;
    window.renderMathInElement(container, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
      throwOnError: false
    });
  }

  // ── Footnote tooltips ────────────────────────────────────────────

  function addFootnoteTooltips(container) {
    if (!container) return;
    var fnSection = container.querySelector(".md-footnotes");
    container.querySelectorAll(".md-footnote-ref a[href]").forEach(function (link) {
      var targetId = link.getAttribute("href").replace(/^#/, "");
      var fnEl = fnSection ? fnSection.querySelector("#" + CSS.escape(targetId)) : null;
      if (!fnEl) return;
      var text = fnEl.textContent.replace(/↩\s*$/, "").trim();
      if (!text) return;
      var sup = link.closest(".md-footnote-ref") || link.parentElement;
      sup.setAttribute("data-tooltip", text);
      sup.style.cursor = "help";
    });
  }

  // ── Public API ───────────────────────────────────────────────────

  global.SiteMd = {
    markdownToHtml: markdownToHtml,
    renderMathInContainer: renderMathInContainer,
    renderCodeBlocksInContainer: renderCodeBlocksInContainer,
    addFootnoteTooltips: addFootnoteTooltips,
    hydrateLinkPreviewsInContainer: hydrateLinkPreviewsInContainer,
    escapeHtml: escapeHtml
  };
})(window);
