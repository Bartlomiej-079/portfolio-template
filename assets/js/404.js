function computeSiteRoot() {
  const existing = window.__SITE_ROOT__;
  if (typeof existing === "string" && existing.trim()) {
    return existing.endsWith("/") ? existing : `${existing}/`;
  }

  const pathname = window.location.pathname || "/";
  const hostname = window.location.hostname || "";
  const segments = pathname.split("/").filter(Boolean);
  const isGithubPagesHost = /\.github\.io$/i.test(hostname);
  const root = isGithubPagesHost && segments.length > 0 ? `/${segments[0]}/` : "/";
  window.__SITE_ROOT__ = root;
  return root;
}

const SITE_ROOT = computeSiteRoot();
const ASSET_VERSION = String(window.__ASSET_VERSION__ || "1").trim();
const ROTATION_SLOT_REGEX = /^::rotation\s+(.+)$/i;
const ROTATION_DEFAULT_INTERVAL_MS = 2400;
const ROTATION_DEFAULT_EFFECT_DURATION_MS = 550;
const ROTATION_DEFAULT_TYPING_SPEED_MS = 55;
const ROTATION_MIN_INTERVAL_MS = 300;
const ROTATION_MIN_TYPING_SPEED_MS = 20;
const ROTATION_EFFECT_ALIASES = {
  none: "none",
  typed: "typed",
  fade: "fadeIn",
  "fade-in": "fadeIn",
  "fade-up": "fadeInUp",
  "fade-down": "fadeInDown",
  "fade-left": "fadeInLeft",
  "fade-right": "fadeInRight",
  slide: "slideInUp",
  "slide-up": "slideInUp",
  "slide-down": "slideInDown",
  zoom: "zoomIn",
  "zoom-in": "zoomIn",
  "zoom-out": "zoomOut",
  bounce: "bounceIn",
  flip: "flipInX",
  pulse: "pulse",
  swing: "swing",
  tada: "tada"
};

let markdownRotationControllers = [];

function getFallback404Markdown() {
  return `## Looks like this link wandered off\n\nThe page you requested does not exist, or moved to a new location.\n\n- Head back to [the homepage](${SITE_ROOT})\n- Visit [my GitHub profile](https://github.com/your-username)\n- Or check your URL for typos\n`;
}

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

function normalizePathForSiteRoot(pathValue) {
  const href = String(pathValue || "").trim();
  if (!href) return href;

  if (/^(?:[a-z]+:)?\/\//i.test(href) || /^(?:data:|mailto:|tel:|#)/i.test(href)) {
    return href;
  }

  if (href.startsWith("/")) {
    return `${SITE_ROOT}${href.replace(/^\/+/, "")}`;
  }

  const cleaned = href.replace(/^(\.\/)+/, "").replace(/^(\.\.\/)+/, "");
  return `${SITE_ROOT}${cleaned}`;
}

function tokenizeAttributeString(raw) {
  return String(raw || "").match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
}

function normalizeImageSize(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d*\.?\d+$/.test(raw)) return `${raw}px`;
  if (/^\d*\.?\d+(px|%|em|rem|vw|vh)$/i.test(raw)) return raw;
  return "";
}

function parseInlineImageOptions(rawOptions) {
  const classNames = ["md-image"];
  const styles = [];
  let caption = "";
  const decodedOptions = String(rawOptions || "")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
  const tokens = tokenizeAttributeString(decodedOptions);

  for (const token of tokens) {
    if (token.startsWith(".")) {
      const className = token.slice(1).trim();
      if (className) classNames.push(className);
      continue;
    }

    const equalsIndex = token.indexOf("=");
    if (equalsIndex <= 0) continue;

    const key = token.slice(0, equalsIndex).trim().toLowerCase();
    let value = token.slice(equalsIndex + 1).trim();
    value = value.replace(/^"|"$/g, "").replace(/^'|'$/g, "");

    if (key === "width" || key === "w") {
      const width = normalizeImageSize(value);
      if (width) styles.push(`width:${width}`);
      continue;
    }

    if (key === "height" || key === "h") {
      const height = normalizeImageSize(value);
      if (height) styles.push(`height:${height}`);
      continue;
    }

    if (key === "align") {
      const normalizedAlign = value.toLowerCase();
      if (normalizedAlign === "left") classNames.push("md-image-align-left");
      if (normalizedAlign === "right") classNames.push("md-image-align-right");
      if (normalizedAlign === "center") classNames.push("md-image-align-center");
      continue;
    }

    if (key === "wrap") {
      const normalizedWrap = value.toLowerCase();
      if (normalizedWrap === "left") classNames.push("md-image-wrap-left");
      if (normalizedWrap === "right") classNames.push("md-image-wrap-right");
      if (normalizedWrap === "none") classNames.push("md-image-wrap-none");
      continue;
    }

    if (key === "caption" || key === "cap") {
      caption = value;
    }
  }

  return {
    classNames: Array.from(new Set(classNames)),
    styleAttr: styles.length > 0 ? ` style="${escapeAttribute(styles.join(";"))}"` : "",
    caption
  };
}

function normalizeMarkdownReferenceId(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function extractMarkdownDefinitions(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const contentLines = [];
  const footnoteDefinitions = new Map();
  const referenceDefinitions = new Map();

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];

    const footnoteMatch = line.match(/^\[\^([^\]]+)\]:\s*(.*)$/);
    if (footnoteMatch) {
      const id = normalizeMarkdownReferenceId(footnoteMatch[1]);
      const parts = [footnoteMatch[2].trim()];

      while (lineIndex + 1 < lines.length && /^(?:\t| {2,})\S/.test(lines[lineIndex + 1])) {
        lineIndex += 1;
        parts.push(lines[lineIndex].trim());
      }

      footnoteDefinitions.set(id, parts.filter(Boolean).join(" ").trim());
      continue;
    }

    const referenceMatch = line.match(/^\[([^\]]+)\]:\s*(\S+)(?:\s+"([^"]+)")?\s*$/);
    if (referenceMatch && !referenceMatch[1].startsWith("^")) {
      const id = normalizeMarkdownReferenceId(referenceMatch[1]);
      referenceDefinitions.set(id, {
        href: referenceMatch[2],
        title: referenceMatch[3] || ""
      });
      continue;
    }

    contentLines.push(line);
  }

  return {
    content: contentLines.join("\n"),
    footnoteDefinitions,
    referenceDefinitions
  };
}

function renderInlineMarkdown(text, markdownContext = null) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  html = html.replace(
    /!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]+)")?\)\s*(?:\{([^{}]+)\})?/g,
    (_, alt, src, title, imageOptions) => {
      const { classNames, styleAttr, caption } = parseInlineImageOptions(imageOptions);
      const layoutClassPattern = /^md-image-(?:align|wrap)-/;
      const imageClassNames = classNames.filter((name) => !layoutClassPattern.test(name));
      const classAttr = ` class="${escapeAttribute(imageClassNames.join(" "))}"`;
      const titleAttr = title ? ` title="${escapeAttribute(title)}"` : "";
      const imageHtml = `<img src="${escapeAttribute(normalizePathForSiteRoot(src))}" alt="${escapeAttribute(alt)}" loading="lazy"${classAttr}${styleAttr}${titleAttr} />`;
      if (!caption) {
        return imageHtml;
      }
      const figureClasses = ["md-figure", ...classNames.filter((name) => name !== "md-image")];
      return `<figure class="${escapeAttribute(Array.from(new Set(figureClasses)).join(" "))}">${imageHtml}<figcaption class="md-figure-caption">${escapeHtml(caption)}</figcaption></figure>`;
    }
  );

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    return `<a href="${escapeAttribute(normalizePathForSiteRoot(href))}">${label}</a>`;
  });

  if (markdownContext && markdownContext.referenceDefinitions instanceof Map) {
    html = html.replace(/\[([^\]]+)\]\[([^\]]+)\]/g, (full, label, referenceId) => {
      const id = normalizeMarkdownReferenceId(referenceId);
      const reference = markdownContext.referenceDefinitions.get(id);
      if (!reference) return full;
      const titleAttr = reference.title ? ` title="${escapeAttribute(reference.title)}"` : "";
      return `<a href="${escapeAttribute(normalizePathForSiteRoot(reference.href))}"${titleAttr}>${label}</a>`;
    });

    html = html.replace(/\[([^\]]+)\]\[\]/g, (full, referenceId) => {
      const id = normalizeMarkdownReferenceId(referenceId);
      const reference = markdownContext.referenceDefinitions.get(id);
      if (!reference) return full;
      const titleAttr = reference.title ? ` title="${escapeAttribute(reference.title)}"` : "";
      return `<a href="${escapeAttribute(normalizePathForSiteRoot(reference.href))}"${titleAttr}>${referenceId}</a>`;
    });
  }

  if (markdownContext && markdownContext.footnoteDefinitions instanceof Map) {
    html = html.replace(/\[\^([^\]]+)\]/g, (full, footnoteId) => {
      const normalizedId = normalizeMarkdownReferenceId(footnoteId);
      if (!markdownContext.footnoteDefinitions.has(normalizedId)) {
        return full;
      }

      if (!markdownContext.footnoteNumbers.has(normalizedId)) {
        const nextNumber = markdownContext.footnoteOrder.length + 1;
        markdownContext.footnoteOrder.push(normalizedId);
        markdownContext.footnoteNumbers.set(normalizedId, nextNumber);
      }

      const number = markdownContext.footnoteNumbers.get(normalizedId);
      return `<sup class="md-footnote-ref"><a href="#fn-${escapeAttribute(normalizedId)}" id="fnref-${escapeAttribute(normalizedId)}">${number}</a></sup>`;
    });
  }

  return html;
}

function markdownToHtml(markdown) {
  const {
    content,
    footnoteDefinitions,
    referenceDefinitions
  } = extractMarkdownDefinitions(markdown);

  const markdownContext = {
    footnoteDefinitions,
    referenceDefinitions,
    footnoteOrder: [],
    footnoteNumbers: new Map()
  };

  const lines = String(content || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let listType = "";
  let inCodeFence = false;
  let codeLanguage = "";
  let codeLines = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").trim();
    if (text) {
      const renderedText = renderInlineMarkdown(text, markdownContext);
      if (/^(?:<img\b[^>]*\/>|<figure\b[\s\S]*<\/figure>)$/.test(renderedText.trim())) {
        html.push(renderedText);
      } else {
        html.push(`<p>${renderedText}</p>`);
      }
    }
    paragraph = [];
  };

  const closeList = () => {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = "";
  };

  const flushCode = () => {
    if (!inCodeFence) return;
    const langClass = codeLanguage ? ` class="language-${escapeHtml(codeLanguage.toLowerCase())}"` : "";
    html.push(`<pre><code${langClass}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    inCodeFence = false;
    codeLanguage = "";
    codeLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (inCodeFence) {
      if (/^```\s*$/.test(trimmed)) {
        flushCode();
      } else {
        codeLines.push(rawLine);
      }
      continue;
    }

    const codeStart = trimmed.match(/^```\s*([^\s`]+)?\s*$/);
    if (codeStart) {
      flushParagraph();
      closeList();
      inCodeFence = true;
      codeLanguage = codeStart[1] || "";
      codeLines = [];
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      closeList();
      continue;
    }

    const rotationSlotMatch = trimmed.match(ROTATION_SLOT_REGEX);
    if (rotationSlotMatch) {
      flushParagraph();
      closeList();
      const slotId = normalizeRotationAnchor(rotationSlotMatch[1]);
      if (slotId) {
        html.push(`<div class="md-rotation-slot" data-rotation-id="${escapeHtml(slotId)}"></div>`);
      }
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInlineMarkdown(headingMatch[2], markdownContext)}</h${level}>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${renderInlineMarkdown(trimmed.replace(/^[-*]\s+/, ""), markdownContext)}</li>`);
      continue;
    }

    if (/^\d+[.)]\s+/.test(trimmed)) {
      flushParagraph();
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${renderInlineMarkdown(trimmed.replace(/^\d+[.)]\s+/, ""), markdownContext)}</li>`);
      continue;
    }

    if (/^[-*_]{3,}$/.test(trimmed)) {
      flushParagraph();
      closeList();
      html.push("<hr />");
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      closeList();
      html.push(`<blockquote><p>${renderInlineMarkdown(trimmed.replace(/^>\s?/, ""), markdownContext)}</p></blockquote>`);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushCode();
  flushParagraph();
  closeList();

  if (markdownContext.footnoteOrder.length > 0) {
    const footnotes = markdownContext.footnoteOrder
      .map((id) => {
        const text = markdownContext.footnoteDefinitions.get(id) || "";
        const contentHtml = renderInlineMarkdown(text, markdownContext);
        return `<li id="fn-${escapeAttribute(id)}">${contentHtml} <a href="#fnref-${escapeAttribute(id)}" class="md-footnote-backref" aria-label="Back to reference">↩</a></li>`;
      })
      .join("");

    html.push(`<section class="md-footnotes"><hr /><ol>${footnotes}</ol></section>`);
  }

  return html.join("\n");
}

function extractTitle(markdown) {
  const titleMatch = String(markdown || "").match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : "";
}

function extractMarkdownOptions(markdown) {
  const options = {
    justify: false
  };

  const lines = String(markdown || "").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^::justify\s*(on|true|yes)?$/i.test(trimmed)) {
      options.justify = true;
      break;
    }
    if (/^#/.test(trimmed)) break;
    if (trimmed && !trimmed.startsWith("::")) break;
  }

  return options;
}

function removeMarkdownDirectives(markdown) {
  return String(markdown || "")
    .replace(/^::justify\s*(on|true|yes)?\s*$\n?/im, "")
    .trim();
}

function removeFirstHeading(markdown) {
  return String(markdown || "").replace(/^#\s+.+\n?/m, "").trim();
}

function removeDataBlocks(markdown) {
  const markdownWithRotationSlots = insertRotationSlotsFromBlocks(markdown);
  const withoutLanguageContent =
    window.portfolioI18n && typeof window.portfolioI18n.stripLanguageContentBlocks === "function"
      ? window.portfolioI18n.stripLanguageContentBlocks(markdownWithRotationSlots)
      : String(markdownWithRotationSlots || "")
        .replace(/```language-content(?:[^\n]*)\n[\s\S]*?```/gi, "")
        .replace(/```language content(?:[^\n]*)\n[\s\S]*?```/gi, "");

  return String(withoutLanguageContent || "")
    .replace(/```404-data\n[\s\S]*?```/gi, "")
    .replace(/```rotations\n[\s\S]*?```/gi, "")
    .trim();
}

function extractDataBlock(markdown, blockName) {
  const regex = new RegExp("```" + blockName + "\\n([\\s\\S]*?)```", "m");
  const match = String(markdown || "").match(regex);
  if (!match) return null;

  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function extractAllDataBlocks(markdown, blockName) {
  const regex = new RegExp("```" + blockName + "\\n([\\s\\S]*?)```", "gi");
  const results = [];
  let match;

  while ((match = regex.exec(String(markdown || ""))) !== null) {
    const raw = String(match[1] || "").trim();
    if (!raw) continue;

    try {
      results.push(JSON.parse(raw));
    } catch {
      continue;
    }
  }

  return results;
}

function normalizeRotationAnchor(value, fallback = "") {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) {
    return fallback;
  }

  const normalized = raw
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");

  return normalized || fallback;
}

function normalizeRotationTagName(value) {
  const fallback = "span";
  const normalized = String(value || "").trim().toLowerCase();
  if (!/^[a-z][a-z0-9-]*$/.test(normalized)) {
    return fallback;
  }

  const banned = new Set(["script", "style", "iframe", "object", "embed", "link", "meta"]);
  if (banned.has(normalized)) {
    return fallback;
  }

  return normalized;
}

function parseFiniteNumber(value, fallback, min = -Infinity) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return parsed >= min ? parsed : fallback;
}

function normalizeRotationEffect(effect) {
  const raw = String(effect || "fade").trim();
  if (!raw) {
    return { mode: "animate", className: "fadeIn" };
  }

  const lower = raw.toLowerCase();
  if (lower === "none") {
    return { mode: "none", className: "" };
  }

  if (lower === "typed") {
    return { mode: "typed", className: "" };
  }

  const alias = ROTATION_EFFECT_ALIASES[lower];
  if (alias === "none") {
    return { mode: "none", className: "" };
  }
  if (alias === "typed") {
    return { mode: "typed", className: "" };
  }
  if (alias) {
    return { mode: "animate", className: alias };
  }

  return {
    mode: "animate",
    className: raw.replace(/^animate__/, "") || "fadeIn"
  };
}

function normalizeRotationItems(items, mode) {
  if (!Array.isArray(items)) return [];

  const normalized = [];

  for (const item of items) {
    if (mode === "attr") {
      if (typeof item === "string" && item.trim()) {
        normalized.push({ attrs: { src: item.trim() }, text: "" });
        continue;
      }

      if (item && typeof item === "object") {
        const attrs = item.attrs && typeof item.attrs === "object" ? item.attrs : item;
        const text = String(item.text || item.caption || "");
        normalized.push({ attrs, text });
      }
      continue;
    }

    if (mode === "html") {
      const html = typeof item === "string" ? item : String((item && (item.html || item.content || item.text)) || "");
      if (!html.trim()) continue;
      normalized.push({ html, text: String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() });
      continue;
    }

    if (mode === "markdown") {
      const markdownValue = typeof item === "string" ? item : String((item && (item.markdown || item.content || item.text)) || "");
      if (!markdownValue.trim()) continue;
      const html = markdownToHtml(markdownValue);
      normalized.push({ html, text: String(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() });
      continue;
    }

    const text = typeof item === "string" ? item : String((item && (item.text || item.value || item.content)) || "");
    if (!text.trim()) continue;
    normalized.push({ text: text.trim() });
  }

  return normalized;
}

function normalizeRotationsData(rawData) {
  if (!rawData) return [];

  const source = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData.rotations)
      ? rawData.rotations
      : rawData && typeof rawData === "object"
        ? [rawData]
        : [];

  return source
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const id = normalizeRotationAnchor(entry.id || entry.anchor || `rotation-${index + 1}`);
      if (!id) {
        return null;
      }

      const elementTag = normalizeRotationTagName(entry.element || entry.tag || "span");
      const mode = String(entry.mode || "").trim().toLowerCase() || (elementTag === "img" ? "attr" : "text");
      const items = normalizeRotationItems(entry.items, mode);
      if (!items.length) {
        return null;
      }

      return {
        id,
        anchor: normalizeRotationAnchor(entry.anchor || id, id),
        selector: typeof entry.selector === "string" ? entry.selector.trim() : "",
        elementTag,
        mode,
        items,
        color:
          typeof entry.color === "string"
            ? entry.color.trim()
            : typeof entry.textColor === "string"
              ? entry.textColor.trim()
              : "",
        intervalMs: Math.round(
          parseFiniteNumber(entry.interval || entry.intervalMs, ROTATION_DEFAULT_INTERVAL_MS, ROTATION_MIN_INTERVAL_MS)
        ),
        effect: normalizeRotationEffect(entry.effect || "fade"),
        effectDurationMs: Math.round(
          parseFiniteNumber(entry.effectDuration || entry.effectDurationMs, ROTATION_DEFAULT_EFFECT_DURATION_MS, 120)
        ),
        typingSpeedMs: Math.round(
          parseFiniteNumber(entry.typingSpeed || entry.typingSpeedMs, ROTATION_DEFAULT_TYPING_SPEED_MS, ROTATION_MIN_TYPING_SPEED_MS)
        ),
        startIndex: Math.max(0, Math.round(parseFiniteNumber(entry.startIndex, 0, 0))),
        // One pass through the items unless the block asks to keep cycling —
        // same default as the rotation engine in script.js.
        loop: typeof entry.loop === "boolean" ? entry.loop : (typeof rawData?.loop === "boolean" ? rawData.loop : false),
        staticAttributes: entry.attributes && typeof entry.attributes === "object" ? entry.attributes : null
      };
    })
    .filter(Boolean);
}

function insertRotationSlotsFromBlocks(markdown) {
  return String(markdown || "").replace(/```rotations\n([\s\S]*?)```/gi, (_, rawJson) => {
    let parsed;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      return "";
    }

    const entries = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.rotations)
        ? parsed.rotations
        : parsed && typeof parsed === "object"
          ? [parsed]
          : [];

    const slotIds = entries
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return "";
        }
        return normalizeRotationAnchor(entry.anchor || entry.id || "");
      })
      .filter(Boolean);

    if (!slotIds.length) {
      return "";
    }

    return slotIds.map((id) => `::rotation ${id}`).join("\n");
  });
}

function applyRotationAttributes(target, attrs) {
  if (!target || !attrs || typeof attrs !== "object") return;

  Object.entries(attrs).forEach(([key, value]) => {
    if (!key) return;
    if (value === null || value === undefined || value === false) {
      target.removeAttribute(key);
      return;
    }
    target.setAttribute(key, String(value));
  });
}

function applyRotationEffect(target, effect, durationMs) {
  if (!target || !effect || effect.mode === "none" || effect.mode === "typed") {
    return;
  }

  const animationClass = effect.className || "fadeIn";
  target.classList.remove("animated", animationClass);
  void target.offsetWidth;
  target.style.animationDuration = `${durationMs}ms`;
  target.classList.add("animated", animationClass);
}

function createRotationController(target, config) {
  if (!target || !config || !Array.isArray(config.items) || !config.items.length) {
    return null;
  }

  let activeIndex = config.startIndex % config.items.length;
  let stopped = false;
  let loopTimer = null;
  let typedTimer = null;
  let shownCount = 0;

  const clearTimers = () => {
    if (loopTimer) {
      window.clearTimeout(loopTimer);
      loopTimer = null;
    }
    if (typedTimer) {
      window.clearTimeout(typedTimer);
      typedTimer = null;
    }
  };

  const scheduleNext = () => {
    if (stopped) return;
    loopTimer = window.setTimeout(showNext, config.intervalMs);
  };

  const renderTyped = (text, onComplete) => {
    let cursor = 0;
    const value = String(text || "");
    target.textContent = "";

    const step = () => {
      if (stopped) return;
      if (cursor <= value.length) {
        target.textContent = value.slice(0, cursor);
        cursor += 1;
        typedTimer = window.setTimeout(step, config.typingSpeedMs);
      } else {
        onComplete();
      }
    };

    step();
  };

  const applyItem = (item, onComplete) => {
    if (config.mode === "attr") {
      applyRotationAttributes(target, item.attrs || null);
      if (item.text) {
        target.setAttribute("title", item.text);
      }
      applyRotationEffect(target, config.effect, config.effectDurationMs);
      onComplete();
      return;
    }

    if (config.effect.mode === "typed" && config.mode === "text") {
      renderTyped(item.text || "", onComplete);
      return;
    }

    if (config.mode === "text") {
      target.textContent = item.text || "";
    } else {
      target.innerHTML = item.html || "";
      normalizeInternalLinks(target);
    }

    applyRotationEffect(target, config.effect, config.effectDurationMs);
    onComplete();
  };

  const showNext = () => {
    if (stopped) return;

    const item = config.items[activeIndex];
    applyItem(item, () => {
      shownCount += 1;
      if (!config.loop && shownCount >= config.items.length) {
        stopped = true;
        clearTimers();
        target.classList.add("markdown-rotation--settled");
        return;
      }
      activeIndex = (activeIndex + 1) % config.items.length;
      scheduleNext();
    });
  };

  showNext();

  return {
    stop() {
      stopped = true;
      clearTimers();
    }
  };
}

function stopAllMarkdownRotations() {
  if (!markdownRotationControllers.length) return;
  markdownRotationControllers.forEach((controller) => {
    if (controller && typeof controller.stop === "function") {
      controller.stop();
    }
  });
  markdownRotationControllers = [];
}

function mountRotationsInContainer(container, markdownRaw) {
  if (!container || !markdownRaw) {
    return;
  }

  const blocks = extractAllDataBlocks(markdownRaw, "rotations");
  const rotations = blocks.flatMap((block) => normalizeRotationsData(block));
  if (!rotations.length) {
    return;
  }

  const slotNodes = Array.from(container.querySelectorAll(".md-rotation-slot[data-rotation-id]"));
  const usedSlotNodes = new Set();

  const findSlotById = (anchorId) => {
    if (!anchorId) return null;
    return (
      slotNodes.find((slot) => {
        if (usedSlotNodes.has(slot)) return false;
        return String(slot.dataset.rotationId || "").toLowerCase() === anchorId;
      }) || null
    );
  };

  const findNextFreeSlot = () => slotNodes.find((slot) => !usedSlotNodes.has(slot)) || null;

  rotations.forEach((rotation) => {
    let target = null;

    if (rotation.selector) {
      target = container.querySelector(rotation.selector) || document.querySelector(rotation.selector);
    }

    if (!target) {
      const slot = findSlotById(rotation.anchor) || findSlotById(rotation.id) || findNextFreeSlot();
      if (slot) {
        usedSlotNodes.add(slot);
        target = document.createElement(rotation.elementTag);
        target.className = "markdown-rotation-target";
        slot.replaceWith(target);
      }
    }

    if (!target) {
      return;
    }

    target.classList.add("markdown-rotation", `markdown-rotation--${rotation.mode}`);
    applyRotationAttributes(target, rotation.staticAttributes);

    if (rotation.mode !== "attr") {
      target.style.color = rotation.color || "var(--error-subtle)";
    }

    const controller = createRotationController(target, rotation);
    if (controller) {
      markdownRotationControllers.push(controller);
    }
  });
}

function buildMarkdownUrlCandidates(path) {
  const normalized = String(path || "").replace(/^\.\//, "");
  const locationHref = window.location.href;
  const locationDir = locationHref.endsWith("/") ? locationHref : locationHref.replace(/[^/]*$/, "");
  const rootPath = `${SITE_ROOT}${normalized.replace(/^\//, "")}`;
  const cacheBust = ASSET_VERSION ? `?v=${encodeURIComponent(ASSET_VERSION)}` : "";

  return [...new Set([
    `${rootPath}${cacheBust}`,
    normalized,
    `./${normalized}`,
    `${normalized}${cacheBust}`,
    `./${normalized}${cacheBust}`,
    `${new URL(normalized, locationHref).toString()}${cacheBust}`,
    `${new URL(normalized, locationDir).toString()}${cacheBust}`,
    `${locationDir}${normalized}${cacheBust}`
  ])];
}

function normalizeInternalLinks(container) {
  if (!container) return;

  const links = Array.from(container.querySelectorAll("a[href]"));
  links.forEach((link) => {
    const href = String(link.getAttribute("href") || "").trim();
    if (!href) return;

    const isExternal = /^(?:[a-z]+:)?\/\//i.test(href) || /^[a-z]+:/i.test(href);
    if (isExternal || href.startsWith("#")) return;

    if (href.startsWith("/")) {
      link.setAttribute("href", `${SITE_ROOT}${href.replace(/^\//, "")}`);
      return;
    }

    const cleaned = href.replace(/^(\.\/)+/, "").replace(/^(\.\.\/)+/, "");
    link.setAttribute("href", `${SITE_ROOT}${cleaned}`);
  });
}

async function loadMarkdown(path) {
  const candidates = buildMarkdownUrlCandidates(path);

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { cache: "no-store" });
      if (response.ok) {
        return response.text();
      }
    } catch {
      // Try next candidate.
    }
  }

  throw new Error(`Failed to load markdown file: ${path}`);
}

function localize404Rotations(markdown) {
  const i18n = window.portfolioI18n;
  const items = i18n && typeof i18n.t === "function" ? i18n.t("error404.rotations") : null;
  if (!Array.isArray(items) || !items.length) return markdown;
  return String(markdown || "").replace(/```rotations\n([\s\S]*?)```/i, (full, raw) => {
    try {
      const parsed = JSON.parse(raw);
      const entries = Array.isArray(parsed) ? parsed : [parsed];
      entries.forEach((entry) => {
        if (entry && typeof entry === "object") entry.items = items;
      });
      return "```rotations\n" + JSON.stringify(entries, null, 2) + "\n```";
    } catch {
      return full;
    }
  });
}

function apply404Chrome() {
  const i18n = window.portfolioI18n;
  if (!i18n || typeof i18n.t !== "function") return;
  const titleNode = document.querySelector(".error404-title");
  const kickerNode = document.querySelector(".error404-kicker");
  const eyebrow = document.querySelector(".error404-eyebrow");
  const homeLink = document.getElementById("error404-home-link");
  if (titleNode) titleNode.textContent = i18n.t("error404.title");
  if (kickerNode) kickerNode.textContent = i18n.t("error404.kicker");
  if (eyebrow) eyebrow.textContent = i18n.t("error404.eyebrow");
  if (homeLink) homeLink.textContent = i18n.t("btn.backToHome");
  document.title = i18n.t("error404.documentTitle");
  if (typeof i18n.apply === "function") i18n.apply(document);
}

function apply404Markdown(markdown) {
  const container = document.getElementById("error404-markdown");
  if (!container) return;

  const localizedMarkdown = localize404Rotations(markdown);
  apply404Chrome();

  const i18n = window.portfolioI18n;
  const languageContent = i18n && typeof i18n.parseLanguageContent === "function"
    ? (i18n.parseAllLanguageContentBlocks
      ? (i18n.parseAllLanguageContentBlocks(localizedMarkdown)[0] || {})
      : i18n.parseLanguageContent(((localizedMarkdown.match(/```(?:language-content|language content)(?:[^\n]*)\n([\s\S]*?)```/i) || [])[1] || "")))
    : {};
  const lang = i18n && typeof i18n.getLang === "function" ? i18n.getLang() : "en";
  const langBody = languageContent[lang] || languageContent.en || "";

  let body = langBody
    ? removeFirstHeading(langBody)
    : removeDataBlocks(removeFirstHeading(localizedMarkdown));
  if (!/::rotation\s+/i.test(body)) {
    body = `${body}\n\n::rotation focus-inline`.trim();
  }

  const finalMarkdown = removeMarkdownDirectives(removeDataBlocks(body));
  const pageOptions = extractMarkdownOptions(markdown);

  stopAllMarkdownRotations();
  container.innerHTML = markdownToHtml(finalMarkdown || getFallback404Markdown());
  if (pageOptions.justify) {
    container.classList.add("md-justified");
  }
  normalizeInternalLinks(container);
  mountRotationsInContainer(container, localizedMarkdown);
}

async function init404Page() {
  const homeLink = document.getElementById("error404-home-link");
  if (homeLink) {
    homeLink.setAttribute("href", SITE_ROOT);
  }

  if (window.portfolioI18n && typeof window.portfolioI18n.mountPicker === "function") {
    window.portfolioI18n.mountPicker(document.getElementById("error404-lang"));
  }

  let loadedMarkdown = "";
  try {
    loadedMarkdown = await loadMarkdown("pages/404.md");
    apply404Markdown(loadedMarkdown);
  } catch (error) {
    console.error("Unable to load pages/404.md", error);
    loadedMarkdown = `# Page Not Found\n\n${getFallback404Markdown()}`;
    apply404Markdown(loadedMarkdown);
  }

  document.addEventListener("portfolio:language-change", () => {
    if (loadedMarkdown) apply404Markdown(loadedMarkdown);
  });
}

function initCustomCursor() {
  const cursor = document.getElementById("custom-cursor");
  if (!cursor) return;

  cursor.textContent = "😠";
  let lastTrailTime = 0;

  const spawnSwearTrail = (x, y) => {
    const now = Date.now();
    if (now - lastTrailTime < 34) {
      return;
    }
    lastTrailTime = now;

    const particles = ["🤬", "😤", "💢", "😠"];
    const particleCount = 2 + Math.floor(Math.random() * 2);

    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement("div");
      particle.className = "swear-trail";
      particle.textContent = particles[Math.floor(Math.random() * particles.length)];
      particle.style.left = `${x - 10 - Math.random() * 16}px`;
      particle.style.top = `${y + (Math.random() * 12 - 6)}px`;
      particle.style.fontSize = `${11 + Math.floor(Math.random() * 9)}px`;

      document.body.appendChild(particle);

      requestAnimationFrame(() => {
        particle.classList.add("is-fading");
      });

      window.setTimeout(() => {
        particle.remove();
      }, 900);
    }
  };

  window.addEventListener("mousemove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.classList.remove("is-hidden");
    spawnSwearTrail(event.clientX, event.clientY);
  });

  window.addEventListener("mousedown", () => {
    cursor.classList.add("clicking");
  });

  window.addEventListener("mouseup", () => {
    cursor.classList.remove("clicking");
  });

  window.addEventListener("touchstart", () => {
    cursor.classList.add("is-hidden");
  });
}

initCustomCursor();
init404Page();
