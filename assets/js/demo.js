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
const ROTATION_SUPPORTED_MODES = new Set(["text", "markdown", "html", "attr"]);
const ROTATION_DEFAULT_INTERVAL_MS = 2800;
const ROTATION_DEFAULT_EFFECT_DURATION_MS = 680;
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
const TYPING_SPARKLE_GLYPHS = ["✦", "✧", "✶", "✹"];

let markdownRotationControllers = [];
let revealReady = false;

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

function renderInlineMarkdown(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+\"([^\"]+)\")?\)/g, (_, alt, src, title) => {
    const titleAttr = title ? ` title="${escapeAttribute(title)}"` : "";
    return `<img src="${escapeAttribute(normalizePathForSiteRoot(src))}" alt="${escapeAttribute(alt)}" loading="lazy"${titleAttr} />`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    return `<a href="${escapeAttribute(normalizePathForSiteRoot(href))}" target="_blank" rel="noreferrer">${label}</a>`;
  });
  return html;
}

function parseAttributeSuffix(line) {
  const match = line.match(/^(.*)\s\{([^{}]+)\}\s*$/);
  if (!match) {
    return { text: line, attrs: "" };
  }

  const text = match[1].trimEnd();
  const raw = match[2].trim();
  const tokens = raw.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];

  const classNames = [];
  const attributes = [];

  for (const token of tokens) {
    if (token.startsWith(".")) {
      const className = token.slice(1).trim();
      if (className) classNames.push(className);
      continue;
    }

    const equalsIndex = token.indexOf("=");
    if (equalsIndex > 0) {
      const key = token.slice(0, equalsIndex).trim();
      let value = token.slice(equalsIndex + 1).trim();
      value = value.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
      if (key) {
        attributes.push(`${escapeAttribute(key)}="${escapeAttribute(value)}"`);
      }
      continue;
    }

    const key = token.trim();
    if (key) {
      attributes.push(`${escapeAttribute(key)}="true"`);
    }
  }

  const normalizedClassNames = classNames.map((className) => {
    if (className.startsWith("animate__")) {
      return className.replace(/^animate__/, "");
    }
    return className;
  });

  const hasWow = normalizedClassNames.includes("wow");
  const hasAnimated = normalizedClassNames.includes("animated");
  if (hasWow && !hasAnimated) {
    normalizedClassNames.unshift("animated");
  }

  if (normalizedClassNames.length > 0) {
    attributes.unshift(`class="${escapeAttribute(normalizedClassNames.join(" "))}"`);
  }

  return {
    text,
    attrs: attributes.length > 0 ? ` ${attributes.join(" ")}` : ""
  };
}

function markdownToHtml(markdown) {
  const lines = String(markdown || "").replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let listType = "";
  let inCodeFence = false;
  let codeFenceLanguage = "";
  let codeLines = [];
  let quoteLines = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ").trim();
    if (text) html.push(`<p>${renderInlineMarkdown(text)}</p>`);
    paragraph = [];
  };

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = "";
    }
  };

  const flushQuote = () => {
    if (quoteLines.length === 0) return;
    const text = quoteLines.join(" ").trim();
    if (text) {
      html.push(`<blockquote><p>${renderInlineMarkdown(text)}</p></blockquote>`);
    }
    quoteLines = [];
  };

  const normalizeCodeLanguage = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    const aliases = {
      "c++": "cpp",
      "c#": "csharp",
      js: "javascript",
      ts: "typescript",
      py: "python",
      rb: "ruby",
      sh: "bash",
      shell: "bash"
    };
    return aliases[normalized] || normalized;
  };

  const flushCodeFence = () => {
    if (!inCodeFence) return;
    const normalizedLanguage = normalizeCodeLanguage(codeFenceLanguage);
    const languageClass = normalizedLanguage ? ` class="language-${escapeAttribute(normalizedLanguage)}"` : "";
    html.push(`<pre><code${languageClass}>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    inCodeFence = false;
    codeFenceLanguage = "";
    codeLines = [];
  };

  const splitTableRow = (line) => {
    const normalized = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    return normalized.split("|").map((cell) => cell.trim());
  };

  const isTableSeparatorLine = (line) => {
    const normalized = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    const cells = normalized.split("|").map((cell) => cell.trim());
    return cells.length > 0 && cells.every((cell) => /^:?-{2,}:?$/.test(cell));
  };

  const renderTable = (headerLine, separatorLine, bodyLines) => {
    const headers = splitTableRow(headerLine);
    const separators = splitTableRow(separatorLine);
    const bodyRows = bodyLines.map((line) => splitTableRow(line));

    const alignments = separators.map((separator) => {
      if (/^:-+:$/.test(separator)) return "center";
      if (/^-+:$/.test(separator)) return "right";
      if (/^:-+$/.test(separator)) return "left";
      return "";
    });

    const theadCells = headers
      .map((cell, index) => {
        const align = alignments[index] ? ` style="text-align:${alignments[index]}"` : "";
        return `<th${align}>${renderInlineMarkdown(cell)}</th>`;
      })
      .join("");

    const tbodyRowsHtml = bodyRows
      .map((row) => {
        const cellsHtml = headers
          .map((_, index) => {
            const align = alignments[index] ? ` style="text-align:${alignments[index]}"` : "";
            const value = row[index] ?? "";
            return `<td${align}>${renderInlineMarkdown(value)}</td>`;
          })
          .join("");
        return `<tr>${cellsHtml}</tr>`;
      })
      .join("");

    return `<table><thead><tr>${theadCells}</tr></thead><tbody>${tbodyRowsHtml}</tbody></table>`;
  };

  const normalizeVSpaceSize = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "1.25em";
    if (/^\d*\.?\d+(px|em|rem|vh|vw|%)$/i.test(raw)) {
      return raw;
    }
    return "1.25em";
  };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const rawLine = lines[lineIndex];
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (inCodeFence) {
      if (/^```\s*$/.test(trimmed)) {
        flushCodeFence();
      } else {
        codeLines.push(rawLine);
      }
      continue;
    }

    const codeFenceStart = trimmed.match(/^```\s*([^\s`]+)?\s*$/);
    if (codeFenceStart) {
      flushParagraph();
      closeList();
      flushQuote();

      if (String(codeFenceStart[1] || "").toLowerCase() === "carousel") {
        const carouselLines = [];
        let carouselInnerFence = false;
        lineIndex += 1;
        while (lineIndex < lines.length) {
          const carouselLine = lines[lineIndex].trim();
          if (/^```/.test(carouselLine)) {
            if (carouselInnerFence) carouselInnerFence = false;
            else if (/^```\s*$/.test(carouselLine)) break;
            else carouselInnerFence = true;
          }
          carouselLines.push(lines[lineIndex]);
          lineIndex += 1;
        }
        if (window.SiteCarousel) {
          html.push(window.SiteCarousel.buildHtml(carouselLines.join("\n"), markdownToHtml));
        }
        continue;
      }

      inCodeFence = true;
      codeFenceLanguage = codeFenceStart[1] || "";
      codeLines = [];
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      closeList();
      flushQuote();
      continue;
    }

    const vspaceMatch = trimmed.match(/^::vspace(?:\s+([^\s]+))?$/i);
    if (vspaceMatch) {
      flushParagraph();
      closeList();
      flushQuote();
      const size = normalizeVSpaceSize(vspaceMatch[1]);
      html.push(`<div class="md-vspace" style="height:${escapeAttribute(size)}"></div>`);
      continue;
    }

    const rotationSlotMatch = trimmed.match(ROTATION_SLOT_REGEX);
    if (rotationSlotMatch) {
      flushParagraph();
      closeList();
      flushQuote();
      const slotId = normalizeRotationAnchor(rotationSlotMatch[1]);
      if (slotId) {
        html.push(`<div class="md-rotation-slot" data-rotation-id="${escapeAttribute(slotId)}"></div>`);
      }
      continue;
    }

    if (/^[-*_]{3,}$/.test(trimmed)) {
      flushParagraph();
      closeList();
      flushQuote();
      html.push("<hr />");
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      closeList();
      quoteLines.push(trimmed.replace(/^>\s?/, ""));
      continue;
    }

    flushQuote();

    if (trimmed.includes("|") && lineIndex + 1 < lines.length) {
      const nextTrimmed = lines[lineIndex + 1].trim();
      if (isTableSeparatorLine(nextTrimmed)) {
        flushParagraph();
        closeList();

        const bodyLines = [];
        let tableIndex = lineIndex + 2;
        while (tableIndex < lines.length) {
          const rowTrimmed = lines[tableIndex].trim();
          if (!rowTrimmed || !rowTrimmed.includes("|")) {
            break;
          }
          bodyLines.push(lines[tableIndex]);
          tableIndex += 1;
        }

        html.push(renderTable(lines[lineIndex], lines[lineIndex + 1], bodyLines));
        lineIndex = tableIndex - 1;
        continue;
      }
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      const level = headingMatch[1].length;
      const { text, attrs } = parseAttributeSuffix(headingMatch[2].trim());
      html.push(`<h${level}${attrs}>${renderInlineMarkdown(text)}</h${level}>`);
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      const { text, attrs } = parseAttributeSuffix(trimmed.replace(/^[-*]\s+/, ""));
      html.push(`<li${attrs}>${renderInlineMarkdown(text)}</li>`);
      continue;
    }

    if (/^\d+[.)]\s+/.test(trimmed)) {
      flushParagraph();
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      const { text, attrs } = parseAttributeSuffix(trimmed.replace(/^\d+[.)]\s+/, ""));
      html.push(`<li${attrs}>${renderInlineMarkdown(text)}</li>`);
      continue;
    }

    const paragraphLine = parseAttributeSuffix(trimmed);
    if (paragraphLine.attrs) {
      flushParagraph();
      closeList();
      html.push(`<p${paragraphLine.attrs}>${renderInlineMarkdown(paragraphLine.text)}</p>`);
      continue;
    }

    paragraph.push(paragraphLine.text);
  }

  flushQuote();
  flushCodeFence();
  flushParagraph();
  closeList();
  return html.join("\n");
}

function extractTitle(markdown) {
  const titleMatch = String(markdown || "").match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : "";
}

function removeFirstHeading(markdown) {
  return String(markdown || "").replace(/^#\s+.+\n?/m, "").trim();
}

function extractRawDataBlock(markdown, blockName) {
  const regex = new RegExp("```" + blockName + "\\n([\\s\\S]*?)```", "m");
  const match = String(markdown || "").match(regex);
  return match ? match[1] : null;
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

function normalizeRotationMode(value, elementTag) {
  const mode = String(value || "").trim().toLowerCase();
  if (ROTATION_SUPPORTED_MODES.has(mode)) {
    return mode;
  }
  return elementTag === "img" ? "attr" : "text";
}

function parseFiniteNumber(value, fallback, min = -Infinity) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return parsed >= min ? parsed : fallback;
}

function stripHtmlTags(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeRotationEffect(effect) {
  const raw = String(effect || "fade").trim();
  if (!raw) {
    return { mode: "animate", className: "fadeIn" };
  }

  const lower = raw.toLowerCase();
  if (lower === "none") return { mode: "none", className: "" };
  if (lower === "typed") return { mode: "typed", className: "" };

  if (lower.startsWith("wow:")) {
    const wowClassRaw = raw.slice(raw.indexOf(":") + 1).trim();
    const wowClass = wowClassRaw || "fadeIn";
    return { mode: "wow", className: wowClass };
  }

  const alias = ROTATION_EFFECT_ALIASES[lower];
  if (alias === "none") return { mode: "none", className: "" };
  if (alias === "typed") return { mode: "typed", className: "" };
  if (alias) return { mode: "animate", className: alias };

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
        normalized.push({ attrs: { src: normalizePathForSiteRoot(item.trim()) }, text: "" });
        continue;
      }

      if (item && typeof item === "object") {
        const attrs = item.attrs && typeof item.attrs === "object" ? { ...item.attrs } : { ...item };
        if (typeof attrs.src === "string") {
          attrs.src = normalizePathForSiteRoot(attrs.src);
        }
        if (typeof attrs.href === "string") {
          attrs.href = normalizePathForSiteRoot(attrs.href);
        }
        const text = String(item.text || item.caption || "");
        normalized.push({ attrs, text });
      }
      continue;
    }

    if (mode === "html") {
      const html = typeof item === "string" ? item : String((item && (item.html || item.content || item.text)) || "");
      if (!html.trim()) continue;
      normalized.push({
        html: `<div class="markdown-rotation-fragment markdown-rotation-fragment--html">${html}</div>`,
        text: stripHtmlTags(html),
        attrs: item?.attrs || null
      });
      continue;
    }

    if (mode === "markdown") {
      const markdownValue = typeof item === "string" ? item : String((item && (item.markdown || item.content || item.text)) || "");
      if (!markdownValue.trim()) continue;
      const html = markdownToHtml(markdownValue);
      normalized.push({
        html: `<div class="markdown-rotation-fragment markdown-rotation-fragment--markdown">${html}</div>`,
        text: stripHtmlTags(html),
        attrs: item?.attrs || null
      });
      continue;
    }

    const text = typeof item === "string" ? item : String((item && (item.text || item.value || item.content)) || "");
    if (!text.trim()) continue;
    normalized.push({ text: text.trim(), html: escapeHtml(text.trim()), attrs: item?.attrs || null });
  }

  return normalized;
}

function normalizeRotationsData(rawData) {
  if (!rawData) return [];

  const defaultSparksEnabled = typeof rawData?.sparks === "boolean" ? rawData.sparks : true;
  const defaultFlamesEnabled = typeof rawData?.flames === "boolean" ? rawData.flames : false;
  // One pass through the items unless the block asks to keep cycling — same
  // default as the rotation engine in script.js.
  const defaultLoop = typeof rawData?.loop === "boolean" ? rawData.loop : false;

  const source = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData.rotations)
      ? rawData.rotations
      : rawData && typeof rawData === "object"
        ? [rawData]
        : [];

  return source
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;

      const id = normalizeRotationAnchor(entry.id || entry.anchor || `rotation-${index + 1}`);
      if (!id) return null;

      const elementTag = normalizeRotationTagName(entry.element || entry.tag || "span");
      const mode = normalizeRotationMode(entry.mode, elementTag);
      const items = normalizeRotationItems(entry.items, mode);
      if (!items.length) return null;

      return {
        id,
        anchor: normalizeRotationAnchor(entry.anchor || id, id),
        selector: typeof entry.selector === "string" ? entry.selector.trim() : "",
        elementTag,
        mode,
        items,
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
        randomOrder: Boolean(entry.random || entry.randomOrder),
        loop: typeof entry.loop === "boolean" ? entry.loop : defaultLoop,
        pauseOnHover: Boolean(entry.pauseOnHover),
        sparksEnabled: typeof entry.sparks === "boolean" ? entry.sparks : defaultSparksEnabled,
        flamesEnabled: typeof entry.flames === "boolean" ? entry.flames : defaultFlamesEnabled,
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

    if (!slotIds.length) return "";

    return slotIds.map((id) => `::rotation ${id}`).join("\n");
  });
}

function removeDataBlocks(markdown) {
  const markdownWithRotationSlots = insertRotationSlotsFromBlocks(markdown);

  return String(markdownWithRotationSlots || "")
    .replace(/```rotations\n[\s\S]*?```/gi, "")
    .trim();
}

function applyRotationAttributes(target, attrs) {
  if (!target || !attrs || typeof attrs !== "object") return;

  Object.entries(attrs).forEach(([key, value]) => {
    if (!key) return;
    if (value === null || value === undefined || value === false) {
      target.removeAttribute(key);
      return;
    }

    if ((key === "src" || key === "href") && typeof value === "string") {
      target.setAttribute(key, normalizePathForSiteRoot(value));
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
  target.classList.remove("animated");
  target.classList.remove("is-revealed");
  target.classList.remove(animationClass);
  void target.offsetWidth;

  // Rotation effects fire on a timer, not on scroll, so the element is marked
  // revealed up front — otherwise motion.css would hold it at opacity 0 while
  // it waits for an intersection that already happened.
  if (effect.mode === "wow") {
    target.classList.add("wow");
    target.setAttribute("data-wow-duration", `${Math.max(0.15, durationMs / 1000)}s`);
  } else {
    target.classList.remove("wow");
    target.removeAttribute("data-wow-duration");
  }

  target.style.animationDuration = `${durationMs}ms`;
  target.classList.add("animated", "is-revealed", animationClass);
}

function renderMathInContainer(container) {
  if (!container || typeof window.renderMathInElement !== "function") {
    return;
  }

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

function getCodeLanguageFromNode(node) {
  if (!node) return "";

  const className = String(node.className || "");
  const languageMatch = className.match(/\blanguage-([a-z0-9_-]+)/i);
  const normalized = String(languageMatch ? languageMatch[1] : "").trim().toLowerCase();
  const aliases = {
    "c++": "cpp",
    "c#": "csharp",
    js: "javascript",
    ts: "typescript",
    py: "python",
    rb: "ruby",
    sh: "bash",
    shell: "bash"
  };

  return aliases[normalized] || normalized;
}

function formatCodeLanguageLabel(language) {
  if (!language) return "plain text";

  const labels = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    sql: "SQL",
    r: "R",
    cpp: "C++",
    csharp: "C#",
    bash: "Bash",
    json: "JSON",
    html: "HTML",
    css: "CSS",
    markdown: "Markdown"
  };

  return labels[language] || language.toUpperCase();
}

function copyTextToClipboard(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    return navigator.clipboard.writeText(text);
  }

  return new Promise((resolve, reject) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const succeeded = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (succeeded) {
        resolve();
      } else {
        reject(new Error("Clipboard copy failed"));
      }
    } catch (error) {
      document.body.removeChild(textarea);
      reject(error);
    }
  });
}

function showCodeCopyToast(message, clientX, clientY) {
  const toast = document.createElement("div");
  toast.className = "code-copy-toast";
  toast.textContent = message;

  const x = Number.isFinite(clientX) ? clientX : window.innerWidth - 48;
  const y = Number.isFinite(clientY) ? clientY : window.innerHeight - 48;
  const maxX = Math.max(12, window.innerWidth - 160);
  const maxY = Math.max(12, window.innerHeight - 40);

  toast.style.left = `${Math.min(Math.max(12, x + 8), maxX)}px`;
  toast.style.top = `${Math.min(Math.max(12, y - 20), maxY)}px`;

  document.body.appendChild(toast);

  window.requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  window.setTimeout(() => {
    toast.classList.remove("is-visible");
    window.setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 140);
  }, 850);
}

function decorateCodeBlocks(container) {
  if (!container) {
    return;
  }

  container.querySelectorAll("pre code").forEach((codeNode) => {
    const pre = codeNode.parentElement;
    if (!pre || (pre.parentElement && pre.parentElement.classList.contains("md-code-block"))) {
      return;
    }

    const language = getCodeLanguageFromNode(codeNode);

    const wrapper = document.createElement("div");
    wrapper.className = "md-code-block";

    const toolbar = document.createElement("div");
    toolbar.className = "md-code-toolbar";

    const languageLabel = document.createElement("span");
    languageLabel.className = "md-code-language";
    languageLabel.textContent = formatCodeLanguageLabel(language);

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "md-code-copy";
    copyButton.textContent = "copy";
    copyButton.setAttribute("aria-label", "Copy code block");

    copyButton.addEventListener("click", async (event) => {
      if (copyButton.disabled) {
        return;
      }

      copyButton.disabled = true;
      const originalLabel = "copy";

      try {
        await copyTextToClipboard(codeNode.textContent || "");
        copyButton.textContent = "copied";
        copyButton.classList.add("is-copied");
        showCodeCopyToast("Copied!", event?.clientX, event?.clientY);
      } catch {
        copyButton.textContent = "failed";
        copyButton.classList.remove("is-copied");
        showCodeCopyToast("Copy failed", event?.clientX, event?.clientY);
      }

      window.setTimeout(() => {
        copyButton.textContent = originalLabel;
        copyButton.classList.remove("is-copied");
        copyButton.disabled = false;
      }, 1200);
    });

    toolbar.appendChild(languageLabel);
    toolbar.appendChild(copyButton);

    pre.classList.add("md-code-pre");

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(toolbar);
    wrapper.appendChild(pre);
  });
}

function highlightCodeInContainer(container) {
  if (!container || !window.hljs) {
    return;
  }

  if (typeof window.hljs.configure === "function") {
    window.hljs.configure({ ignoreUnescapedHTML: true });
  }

  container.querySelectorAll("pre code").forEach((node) => {
    const language = getCodeLanguageFromNode(node);

    if (language && typeof window.hljs.getLanguage === "function" && !window.hljs.getLanguage(language)) {
      node.className = node.className
        .split(/\s+/)
        .filter((classToken) => !/^language-/i.test(classToken))
        .join(" ");
    }

    try {
      window.hljs.highlightElement(node);
    } catch {
      const rawCode = node.textContent || "";
      const autoHighlightLanguages = ["javascript", "typescript", "python", "sql", "r", "bash", "json"];
      let highlighted = null;

      if (typeof window.hljs.highlightAuto === "function") {
        try {
          highlighted = window.hljs.highlightAuto(rawCode, autoHighlightLanguages);
        } catch {
          highlighted = window.hljs.highlightAuto(rawCode);
        }
      }

      if (highlighted && highlighted.value) {
        node.innerHTML = highlighted.value;
        node.classList.add("hljs");
      }
    }
  });
}

function renderCodeBlocksInContainer(container) {
  highlightCodeInContainer(container);
  decorateCodeBlocks(container);
}

function initWow() {
  if (!window.Reveal) return;

  if (!revealReady) {
    window.Reveal.init();
    revealReady = true;
    return;
  }

  window.Reveal.sync(document);
}

function setTypingSparkleText(target, text) {
  if (!target) {
    return;
  }

  target.classList.add("typing-sparkle-host");

  let textNode = target.querySelector(":scope > .typing-sparkle-text");
  if (!textNode) {
    textNode = document.createElement("span");
    textNode.className = "typing-sparkle-text";
    target.textContent = "";
    target.appendChild(textNode);
  }

  textNode.textContent = String(text || "");
}

function emitTypingSparkles(target, intensity = 28) {
  if (!target || !target.isConnected) {
    return;
  }

  target.classList.add("typing-sparkle-host");

  const textNode = target.querySelector(":scope > .typing-sparkle-text");
  const textRect = textNode ? textNode.getBoundingClientRect() : null;
  const hostRect = target.getBoundingClientRect();
  const textOffsetX = textRect ? textRect.left - hostRect.left : 0;
  const textOffsetY = textRect ? textRect.top - hostRect.top : 0;
  const textWidth = Math.max(4, Math.round(textRect ? textRect.width : target.clientWidth || target.scrollWidth || 4));
  const textHeight = Math.max(12, Math.round(textRect ? textRect.height : target.clientHeight || 18));
  const baseX = textOffsetX + textWidth;
  const baseY = textOffsetY + Math.max(8, Math.round(textHeight * 0.58));

  for (let index = 0; index < intensity; index += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "typing-sparkle";
    sparkle.textContent = TYPING_SPARKLE_GLYPHS[Math.floor(Math.random() * TYPING_SPARKLE_GLYPHS.length)];

    const colorRoll = Math.random();
    if (colorRoll < 0.48) sparkle.classList.add("typing-sparkle--gold");
    else if (colorRoll < 0.68) sparkle.classList.add("typing-sparkle--amber");
    else if (colorRoll < 0.86) sparkle.classList.add("typing-sparkle--sky");
    else if (colorRoll < 0.95) sparkle.classList.add("typing-sparkle--mint");
    else sparkle.classList.add("typing-sparkle--rose");

    sparkle.style.setProperty("--sparkle-x", `${Math.max(2, baseX + (Math.random() * 44 - 22))}px`);
    sparkle.style.setProperty("--sparkle-y", `${Math.max(4, baseY + (Math.random() * 32 - 16))}px`);
    sparkle.style.setProperty("--sparkle-dx", `${Math.round(Math.random() * 44 - 22)}px`);
    sparkle.style.setProperty("--sparkle-dy", `${Math.round(-26 - Math.random() * 30)}px`);
    sparkle.style.setProperty("--sparkle-rot", `${Math.round(Math.random() * 70 - 35)}deg`);
    sparkle.style.setProperty("--sparkle-size", `${(Math.random() * 0.32 + 0.44).toFixed(2)}rem`);
    sparkle.style.setProperty("--sparkle-duration", `${Math.round(1100 + Math.random() * 700)}ms`);

    sparkle.addEventListener("animationend", () => {
      if (sparkle.parentNode) {
        sparkle.parentNode.removeChild(sparkle);
      }
    });

    target.appendChild(sparkle);
  }
}

function emitTypingFlames(target, intensity = 8) {
  if (!target || !target.isConnected) {
    return;
  }

  target.classList.add("typing-sparkle-host");

  const textNode = target.querySelector(":scope > .typing-sparkle-text");
  const textRect = textNode ? textNode.getBoundingClientRect() : null;
  const hostRect = target.getBoundingClientRect();
  const textOffsetX = textRect ? textRect.left - hostRect.left : 0;
  const textOffsetY = textRect ? textRect.top - hostRect.top : 0;
  const textWidth = Math.max(4, Math.round(textRect ? textRect.width : target.clientWidth || target.scrollWidth || 4));
  const textHeight = Math.max(12, Math.round(textRect ? textRect.height : target.clientHeight || 18));
  const baseX = textOffsetX + textWidth;
  const baseY = textOffsetY + Math.max(8, Math.round(textHeight * 0.58));
  const flameGlyphs = ["🔥"];

  for (let index = 0; index < intensity; index += 1) {
    const flame = document.createElement("span");
    flame.className = "typing-flame";
    flame.textContent = flameGlyphs[Math.floor(Math.random() * flameGlyphs.length)];

    flame.style.setProperty("--flame-x", `${Math.max(2, baseX + (Math.random() * 40 - 20))}px`);
    flame.style.setProperty("--flame-y", `${Math.max(4, baseY + (Math.random() * 24 - 12))}px`);
    flame.style.setProperty("--flame-dx", `${Math.round(Math.random() * 44 - 22)}px`);
    flame.style.setProperty("--flame-dy", `${Math.round(-40 - Math.random() * 32)}px`);
    flame.style.setProperty("--flame-rot", `${Math.round(Math.random() * 180 - 90)}deg`);
    flame.style.setProperty("--flame-size", `${(Math.random() * 0.5 + 0.5).toFixed(2)}rem`);
    flame.style.setProperty("--flame-duration", `${Math.round(520 + Math.random() * 280)}ms`);

    flame.addEventListener("animationend", () => {
      if (flame.parentNode) {
        flame.parentNode.removeChild(flame);
      }
    });

    target.appendChild(flame);
  }
}

function isCjkCharacter(value) {
  const char = String(value || "");
  return /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/.test(char);
}

function shouldEmitTypingSpark(typedChar, previousChar, index) {
  return String(typedChar || "").length > 0;
}

function createRotationController(target, config) {
  if (!target || !config || !Array.isArray(config.items) || !config.items.length) {
    return null;
  }

  let stopped = false;
  let paused = false;
  let activeIndex = config.startIndex % config.items.length;
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

  const advanceIndex = () => {
    if (config.randomOrder && config.items.length > 1) {
      let nextIndex = activeIndex;
      while (nextIndex === activeIndex) {
        nextIndex = Math.floor(Math.random() * config.items.length);
      }
      activeIndex = nextIndex;
      return;
    }

    activeIndex = (activeIndex + 1) % config.items.length;
  };

  const scheduleNext = () => {
    if (stopped) return;
    loopTimer = window.setTimeout(showNext, config.intervalMs);
  };

  const renderTyped = (item, onComplete) => {
    const text = String(item?.text || "");
    if (!text) {
      setTypingSparkleText(target, "");
      onComplete();
      return;
    }

    let cursor = 0;
    setTypingSparkleText(target, "");

    const typeStep = () => {
      if (stopped) return;

      if (cursor <= text.length) {
        setTypingSparkleText(target, text.slice(0, cursor));

        if (cursor > 0) {
          const typedChar = text.charAt(cursor - 1);
          const previousChar = text.charAt(cursor - 2);
          const shouldEmit = shouldEmitTypingSpark(typedChar, previousChar, cursor);
          if (shouldEmit && config.sparksEnabled !== false) {
            emitTypingSparkles(target, 16);
          }
          if (shouldEmit && config.flamesEnabled !== false) {
            emitTypingFlames(target, 8);
          }
        }

        cursor += 1;
        typedTimer = window.setTimeout(typeStep, config.typingSpeedMs);
      } else {
        onComplete();
      }
    };

    typeStep();
  };

  const applyItem = (item, onComplete) => {
    const mode = config.mode;
    const isTyped = config.effect.mode === "typed";

    if (mode === "attr") {
      applyRotationAttributes(target, item.attrs || null);
      if (item.text) {
        target.setAttribute("title", item.text);
      }
      applyRotationEffect(target, config.effect, config.effectDurationMs);
      onComplete();
      return;
    }

    if (isTyped && mode === "text") {
      applyRotationEffect(target, { mode: "none", className: "" }, config.effectDurationMs);
      renderTyped(item, onComplete);
      return;
    }

    if (mode === "text") {
      target.textContent = item.text || "";
    } else {
      target.innerHTML = item.html || "";
      normalizeLinksAndMedia(target);
      renderMathInContainer(target);
      renderCodeBlocksInContainer(target);
    }

    applyRotationAttributes(target, item.attrs || null);
    applyRotationEffect(target, config.effect, config.effectDurationMs);
    onComplete();
  };

  const showNext = () => {
    if (stopped) return;

    if (paused) {
      scheduleNext();
      return;
    }

    const item = config.items[activeIndex];
    applyItem(item, () => {
      shownCount += 1;
      if (!config.loop && shownCount >= config.items.length) {
        stopped = true;
        clearTimers();
        // Retire the typing cursor too: nothing more is coming, and a caret
        // blinking forever is the same perpetual animation in miniature.
        target.classList.add("markdown-rotation--settled");
        return;
      }
      advanceIndex();
      scheduleNext();
    });
  };

  if (config.pauseOnHover) {
    target.addEventListener("mouseenter", () => {
      paused = true;
    });
    target.addEventListener("mouseleave", () => {
      paused = false;
    });
  }

  showNext();

  return {
    stop() {
      stopped = true;
      clearTimers();
    }
  };
}

function stopAllMarkdownRotations() {
  markdownRotationControllers.forEach((controller) => {
    if (controller && typeof controller.stop === "function") {
      controller.stop();
    }
  });
  markdownRotationControllers = [];
}

function mountRotationsInContainer(container, markdownRaw) {
  if (!container || !markdownRaw) return;

  const rotationsDataBlocks = extractAllDataBlocks(markdownRaw, "rotations");
  const rotations = rotationsDataBlocks.flatMap((block) => normalizeRotationsData(block));
  if (!rotations.length) return;

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
      console.warn(`Rotation '${rotation.id}' was skipped because no slot or selector target was found.`);
      return;
    }

    target.classList.add("markdown-rotation", `markdown-rotation--${rotation.mode}`);
    applyRotationAttributes(target, rotation.staticAttributes);

    const controller = createRotationController(target, rotation);
    if (controller) {
      markdownRotationControllers.push(controller);
    }
  });

  initWow();
}

function normalizeLinksAndMedia(container) {
  if (!container) return;

  const links = Array.from(container.querySelectorAll("a[href]"));
  links.forEach((link) => {
    const href = String(link.getAttribute("href") || "").trim();
    if (!href) return;
    link.setAttribute("href", normalizePathForSiteRoot(href));
  });

  const images = Array.from(container.querySelectorAll("img[src]"));
  images.forEach((image) => {
    const src = String(image.getAttribute("src") || "").trim();
    if (!src) return;
    image.setAttribute("src", normalizePathForSiteRoot(src));
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

async function loadMarkdown(path) {
  const candidates = buildMarkdownUrlCandidates(path);
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { cache: "no-store" });
      if (response.ok) {
        return response.text();
      }
      lastError = new Error(`HTTP ${response.status} for ${candidate}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`Failed to load ${path}. Last error: ${lastError ? String(lastError) : "unknown"}`);
}

function applyDemoMarkdown(markdown) {
  const container = document.getElementById("demo-markdown");
  const titleNode = document.getElementById("demo-title");
  if (!container) return;

  const title = extractTitle(markdown) || "demo";
  if (titleNode) {
    titleNode.textContent = title;
  }
  document.title = `${title} | Your Name`;

  const body = removeDataBlocks(removeFirstHeading(markdown));
  stopAllMarkdownRotations();
  container.innerHTML = markdownToHtml(body);
  normalizeLinksAndMedia(container);
  renderMathInContainer(container);
  renderCodeBlocksInContainer(container);
  mountRotationsInContainer(container, markdown);
  initWow();
}

async function initDemoPage() {
  const homeLink = document.getElementById("demo-home-link");
  if (homeLink) {
    homeLink.setAttribute("href", SITE_ROOT);
  }

  try {
    const markdown = await loadMarkdown("pages/demo.md");
    applyDemoMarkdown(markdown);
  } catch (error) {
    console.error("Unable to load pages/demo.md", error);
  }
}

function initChaosCursor() {
  const existingCursor = document.getElementById("demo-chaos-cursor");
  if (existingCursor) {
    existingCursor.remove();
  }

  const styleId = "demo-chaos-cursor-style";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .demo-chaos-cursor {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 10001;
        transform: translate(-50%, -50%);
        font-size: 30px;
        line-height: 1;
        filter: drop-shadow(0 0 8px rgba(20, 255, 160, 0.75));
        transition: transform 70ms linear, filter 90ms ease;
        will-change: transform, filter;
      }

      .demo-chaos-cursor.is-clicking {
        transform: translate(-50%, -50%) scale(0.76) rotate(-10deg);
        filter: drop-shadow(0 0 14px rgba(255, 70, 130, 0.85));
      }

      .demo-chaos-cursor.is-hidden {
        opacity: 0;
      }

      .demo-chaos-trail {
        --dx: 0px;
        --dy: -24px;
        --spin: 0deg;
        --scale: 0.6;
        position: fixed;
        pointer-events: none;
        z-index: 10000;
        transform: translate(-50%, -50%);
        opacity: 1;
        will-change: transform, opacity, filter;
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.25), 0 0 16px rgba(0, 255, 180, 0.25);
      }

      .demo-chaos-trail.is-fading {
        opacity: 0;
        transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) rotate(var(--spin)) scale(var(--scale));
        filter: blur(1.4px) saturate(1.45);
        transition: opacity 900ms ease, transform 900ms cubic-bezier(0.2, 0.85, 0.2, 1), filter 900ms ease;
      }
    `;
    document.head.appendChild(style);
  }

  const cursor = document.createElement("div");
  cursor.id = "demo-chaos-cursor";
  cursor.className = "demo-chaos-cursor is-hidden";
  cursor.textContent = "🧑‍💻";
  cursor.setAttribute("aria-hidden", "true");
  document.body.appendChild(cursor);

  const chaosEmojis = ["👾", "🧑‍💻", "💾", "⌨️", "🧠", "🔐", "🛰️", "💻", "🧬", "⚡", "🤖", "🛜", "💥", "🔥"];
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const spawnCap = reducedMotion ? 4 : 12;
  let lastX = window.innerWidth / 2;
  let lastY = window.innerHeight / 2;
  let lastTime = 0;

  cursor.style.left = `${lastX}px`;
  cursor.style.top = `${lastY}px`;
  cursor.classList.remove("is-hidden");

  const spawnChaosTrail = (x, y, intensity = 1) => {
    const particleCount = Math.max(2, Math.min(spawnCap, Math.round((reducedMotion ? 2 : 5) * intensity)));

    for (let i = 0; i < particleCount; i += 1) {
      const particle = document.createElement("div");
      particle.className = "demo-chaos-trail";
      particle.textContent = chaosEmojis[Math.floor(Math.random() * chaosEmojis.length)];

      const dx = (Math.random() * 240 - 120) * (0.35 + Math.random() * 0.9) * intensity;
      const dy = (Math.random() * 200 - 100) * (0.35 + Math.random() * 0.85) * intensity;
      const spin = `${Math.random() * 900 - 450}deg`;
      const scale = (0.18 + Math.random() * 1.05).toFixed(2);
      const hue = Math.floor(Math.random() * 360);

      particle.style.left = `${x + (Math.random() * 30 - 15)}px`;
      particle.style.top = `${y + (Math.random() * 24 - 12)}px`;
      particle.style.fontSize = `${12 + Math.floor(Math.random() * 30)}px`;
      particle.style.setProperty("--dx", `${dx}px`);
      particle.style.setProperty("--dy", `${dy}px`);
      particle.style.setProperty("--spin", spin);
      particle.style.setProperty("--scale", String(scale));
      particle.style.filter = `hue-rotate(${hue}deg) saturate(${1 + Math.random() * 0.9})`;

      document.body.appendChild(particle);

      requestAnimationFrame(() => {
        particle.classList.add("is-fading");
      });

      window.setTimeout(() => {
        particle.remove();
      }, 980);
    }
  };

  const handlePointerMove = (event) => {
    const clientX = Number(event.clientX);
    const clientY = Number(event.clientY);
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
      return;
    }

    const now = performance.now();
    const dt = Math.max(1, now - lastTime);
    const dx = clientX - lastX;
    const dy = clientY - lastY;
    const speed = Math.min(2.6, Math.hypot(dx, dy) / dt);

    cursor.style.left = `${clientX}px`;
    cursor.style.top = `${clientY}px`;
    cursor.classList.remove("is-hidden");

    const shouldBurst = speed > 1.25;
    if (shouldBurst) {
      spawnChaosTrail(clientX, clientY, 1.4);
    } else {
      spawnChaosTrail(clientX, clientY, 0.85);
    }

    lastX = clientX;
    lastY = clientY;
    lastTime = now;
  };

  window.addEventListener("mousemove", handlePointerMove);
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("mouseenter", () => {
    cursor.classList.remove("is-hidden");
  });

  window.addEventListener("mousedown", () => {
    cursor.classList.add("is-clicking");
    spawnChaosTrail(lastX, lastY, 2.2);
  });

  window.addEventListener("mouseup", () => {
    cursor.classList.remove("is-clicking");
  });

  window.addEventListener("mouseleave", () => {
    cursor.classList.add("is-hidden");
  });

  window.addEventListener("touchstart", () => {
    cursor.classList.add("is-hidden");
  });
}

initChaosCursor();
initDemoPage();
