const DEFAULT_PAGE_TITLES = {
  home: "welcome to my page!!",
  projects: "projects i've worked on",
  experience: "experience",
  resources: "resources",
  music: "music",
  blog: "blog",
  post: "blog post",
  info: "info",
  releases: "release log",
  settings: "settings",
  apps: "apps",
  "textbook-project": "featured project",
};

const DEFAULT_HOME_MARKDOWN = "";

let projects = [];
let projectsByLanguage = {};
let projectsFallback = [];
let experience = [];
let experienceByLanguage = {};
let experienceFallback = [];
let resources = [];
let resourcesByLanguage = {};
let resourcesFallback = [];
let musicPosts = [];
let blogPosts = [];
let pageTitles = { ...DEFAULT_PAGE_TITLES };
let homeTitleRotations = [];
let homeTitleSparksEnabled = true;
let homeTitleFlamesEnabled = false;
let homeTitleLoopEnabled = false;
let selectedMarkdownLanguages = {};
let selectedProjectsTag = "";
let selectedProjectsYear = "";
let selectedProjectsSearch = "";
let selectedExperienceTag = "";
let selectedExperienceYear = "";
let selectedExperienceSearch = "";
let selectedResourcesTag = "";
let selectedResourcesYear = "";
let selectedResourcesSearch = "";
let selectedBlogTag = "";
let selectedBlogYear = "";
let selectedBlogSearch = "";
let selectedMusicTag = "";
let selectedMusicYear = "";
let selectedMusicSearch = "";
let blogPostsSignature = "";
let musicPostsSignature = "";
let blogPostsLoaded = false;
let musicPostsLoaded = false;

const IS_DEV =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "";

const tabs = document.querySelectorAll(".nav-btn");
const tabPanels = document.querySelectorAll(".tab");
const homeMarkdown = document.getElementById("home-markdown");
const projectsMarkdown = document.getElementById("projects-markdown");
const experienceMarkdown = document.getElementById("experience-markdown");
const resourcesMarkdown = document.getElementById("resources-markdown");
const musicMarkdown = document.getElementById("music-markdown");
const blogMarkdown = document.getElementById("blog-markdown");
const infoMarkdown = document.getElementById("info-markdown");
const releasesMarkdown = document.getElementById("releases-markdown");
const settingsMarkdown = document.getElementById("settings-markdown");
const appsMarkdown = document.getElementById("apps-markdown");
const textbookProjectMarkdown = document.getElementById("textbook-project-markdown");
const projectsGrid = document.getElementById("projects-grid");
const projectsTagFilter = document.getElementById("projects-tag-filter");
const projectsYearFilter = document.getElementById("projects-year-filter");
const projectsSearchInput = document.getElementById("projects-search");
const experienceGrid = document.getElementById("experience-grid");
const experienceTagFilter = document.getElementById("experience-tag-filter");
const experienceYearFilter = document.getElementById("experience-year-filter");
const experienceSearchInput = document.getElementById("experience-search");
const resourcesGrid = document.getElementById("resources-grid");
const resourcesTagFilter = document.getElementById("resources-tag-filter");
const resourcesYearFilter = document.getElementById("resources-year-filter");
const resourcesSearchInput = document.getElementById("resources-search");
const blogGrid = document.getElementById("blog-grid");
const musicGrid = document.getElementById("music-grid");
const blogTagFilter = document.getElementById("blog-tag-filter");
const blogYearFilter = document.getElementById("blog-year-filter");
const blogSearchInput = document.getElementById("blog-search");
const musicTagFilter = document.getElementById("music-tag-filter");
const musicYearFilter = document.getElementById("music-year-filter");
const musicSearchInput = document.getElementById("music-search");
const postBackButton = document.getElementById("post-back-button");
const postPageKicker = document.getElementById("post-page-kicker");
const postPageTitle = document.getElementById("post-page-title");
const postPageMeta = document.getElementById("post-page-meta");
const postPageContent = document.getElementById("post-page-content");
const typedTitle = document.getElementById("typed-title");
const animalsLayer = document.getElementById("animals-layer");
const infoButton = document.getElementById("info-button");

const experienceModal = document.getElementById("experience-modal");
const experienceModalClose = document.getElementById("experience-modal-close");
const experienceModalTitle = document.getElementById("experience-modal-title");
const experienceModalMeta = document.getElementById("experience-modal-meta");
const experienceModalImage = document.getElementById("experience-modal-image");
const experienceModalDescription = document.getElementById("experience-modal-description");
const modal = document.getElementById("project-modal");
const modalClose = document.getElementById("modal-close");
const modalTitle = document.getElementById("modal-title");
const modalMeta = document.getElementById("modal-meta");
const modalImage = document.getElementById("modal-image");
const modalSkills = document.getElementById("modal-skills");
const modalDescription = document.getElementById("modal-description");
const modalDetails = document.getElementById("modal-details");
const modalLinks = document.getElementById("modal-links");
const galleryPrev = document.getElementById("gallery-prev");
const galleryNext = document.getElementById("gallery-next");

const lightbox = document.getElementById("image-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");
const zoomReset = document.getElementById("zoom-reset");

const blogModal = document.getElementById("blog-modal");
const blogModalClose = document.getElementById("blog-modal-close");
const blogModalTitle = document.getElementById("blog-modal-title");
const blogModalMeta = document.getElementById("blog-modal-meta");
const blogModalContent = document.getElementById("blog-modal-content");

let selectedProject = null;
let activeBlogModalSlug = "";
let selectedImageIndex = 0;
let lightboxScale = 1;
let typingTimer = null;
let titleLoopTimer = null;
let currentTab = "home";
let markdownSignature = "";
const viewModes = {
  projects: "grid",
  experience: "grid",
  resources: "grid",
  blog: "grid",
  music: "grid",
};

const VIEW_ICON_GRID = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z"/></svg>';
const VIEW_ICON_LIST = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>';
const VIEW_ICON_COLUMNS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v2H3zm0 4h18v2H3zm0 4h18v2H3zm0 4h18v2H3z"/></svg>';
const VIEW_ICON_CHEVRON = '<svg class="chevron-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z"/></svg>';
const VIEW_ICON_CHECK = '<svg class="option-check" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

const KNOWN_TABS = new Set(["home", "projects", "experience", "resources", "music", "blog", "info", "releases", "settings", "apps", "textbook-project"]);
/* /cv and its sub-pages are standalone documents under /cv/, not tabs —
   see cv/index.html. Nothing here routes them any more. */
let markdownWatcherId = null;
let revealReady = false;
let markdownRotationControllers = [];
let activeStandalonePostSlug = "";

const ROTATION_DEFAULT_INTERVAL_MS = 2800;
const ROTATION_DEFAULT_EFFECT_DURATION_MS = 680;
const ROTATION_DEFAULT_TYPING_SPEED_MS = 55;
const ROTATION_DEFAULT_BACKSPACE_SPEED_MS = 30;
const ROTATION_MIN_INTERVAL_MS = 300;
const ROTATION_MIN_TYPING_SPEED_MS = 20;
const ROTATION_SLOT_REGEX = /^::rotation\s+(.+)$/i;
const COLUMNS_REGEX = /^::columns\s+(.+)$/i;
const ROTATION_SUPPORTED_MODES = new Set(["text", "markdown", "html", "attr"]);
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

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function tokenizeAttributeString(raw) {
  return String(raw || "").match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
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

function normalizeImageSize(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d*\.?\d+$/.test(raw)) {
    return `${raw}px`;
  }
  if (/^\d*\.?\d+(px|%|em|rem|vw|vh)$/i.test(raw)) {
    return raw;
  }
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

  const uniqueClasses = Array.from(new Set(classNames));
  return {
    classNames: uniqueClasses,
    styleAttr: styles.length > 0 ? ` style="${escapeAttribute(styles.join(";"))}"` : "",
    caption
  };
}

function formatMarkdownKbdLabel(raw) {
  let text = String(raw || "").trim();
  text = text.replace(/^(cmd|command)\b\s*\+?\s*/i, "⌘");
  text = text.replace(/^(ctrl|control)\b\s*\+?\s*/i, "Ctrl");
  text = text.replace(/^⌘\s*\+\s*/, "⌘");
  text = text.replace(/^Ctrl\s*\+\s*/, "Ctrl");
  return text;
}

const MARKDOWN_FA_HREF = "https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.7.2/css/all.min.css";
const MARKDOWN_FA_STYLES = {
  solid: "fa-solid", regular: "fa-regular", brands: "fa-brands",
  light: "fa-light", thin: "fa-thin", duotone: "fa-duotone",
  fas: "fa-solid", far: "fa-regular", fab: "fa-brands"
};

function ensureMarkdownFontAwesome() {
  if (typeof document === "undefined") return;
  if (document.getElementById("md-carousel-fa") || document.getElementById("md-fa")) return;
  if (document.querySelector('link[href*="fontawesome"], link[href*="font-awesome"]')) return;
  const link = document.createElement("link");
  link.id = "md-fa";
  link.rel = "stylesheet";
  link.href = MARKDOWN_FA_HREF;
  link.crossOrigin = "anonymous";
  link.referrerPolicy = "no-referrer";
  document.head.appendChild(link);
}

function markdownFaClassList(spec) {
  const tokens = String(spec || "").toLowerCase().split(/[/\s]+/).filter(Boolean);
  const classes = [];
  let hasStyle = false;
  let hasName = false;
  tokens.forEach((raw) => {
    if (!/^[a-z0-9-]+$/.test(raw)) return;
    const style = MARKDOWN_FA_STYLES[raw] || MARKDOWN_FA_STYLES[raw.replace(/^fa-/, "")];
    if (style) {
      if (!hasStyle) {
        classes.unshift(style);
        hasStyle = true;
      }
      return;
    }
    if (raw === "fa") return;
    classes.push(raw.startsWith("fa-") ? raw : `fa-${raw}`);
    hasName = true;
  });
  if (!hasName) return "";
  if (!hasStyle) classes.unshift("fa-solid");
  return classes.join(" ");
}

function renderMarkdownFaIcon(spec, label) {
  const classes = markdownFaClassList(spec);
  if (!classes) return escapeHtml(label || "");
  ensureMarkdownFontAwesome();
  const labelText = String(label || "").trim();
  const title = labelText ? ` title="${escapeAttribute(labelText)}"` : "";
  const aria = labelText
    ? ` role="img" aria-label="${escapeAttribute(labelText)}"`
    : " aria-hidden=\"true\"";
  return `<i class="md-fa-icon ${escapeAttribute(classes)}"${title}${aria}></i>`;
}

const TCOLORBOX_VARIANTS = new Set(["note", "tip", "info", "warn", "hint"]);

function parseTcolorboxMeta(meta) {
  const raw = String(meta || "").trim();
  if (!raw) return { variant: "note", title: "note" };
  const parts = raw.split(/\s+/);
  const first = parts[0].toLowerCase();
  if (TCOLORBOX_VARIANTS.has(first)) {
    return { variant: first, title: parts.slice(1).join(" ") || first };
  }
  return { variant: "note", title: raw };
}

function renderTcolorboxParagraphs(bodyMarkdown, markdownContext) {
  return String(bodyMarkdown || "")
    .split(/\n\s*\n/)
    .map((para) => para.trim().replace(/\n/g, " "))
    .filter(Boolean)
    .map((para) => `<p>${renderInlineMarkdown(para, markdownContext)}</p>`)
    .join("");
}

function splitTcolorboxBodies(bodyMarkdown) {
  const lines = String(bodyMarkdown || "").replace(/\r\n/g, "\n").split("\n");
  const desktop = [];
  const mobile = [];
  let bucket = desktop;
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (/^::mobile\s*$/i.test(trimmed)) {
      bucket = mobile;
      return;
    }
    if (/^::desktop\s*$/i.test(trimmed)) {
      bucket = desktop;
      return;
    }
    bucket.push(line);
  });
  return { desktop: desktop.join("\n"), mobile: mobile.join("\n") };
}

function buildTcolorboxHtml(meta, bodyMarkdown, markdownContext) {
  const { text: metaText, attrs } = parseAttributeSuffix(String(meta || ""));
  const { variant, title } = parseTcolorboxMeta(metaText);

  let extraClassNames = [];
  let extraAttrs = attrs;
  const classMatch = attrs.match(/\sclass="([^"]*)"/);
  if (classMatch) {
    extraClassNames = classMatch[1].split(/\s+/).filter(Boolean);
    extraAttrs = attrs.slice(0, classMatch.index) + attrs.slice(classMatch.index + classMatch[0].length);
  }

  const classNames = ["md-tcolorbox", `md-tcolorbox--${variant}`, ...extraClassNames];
  const { desktop, mobile } = splitTcolorboxBodies(bodyMarkdown);
  const desktopHtml = renderTcolorboxParagraphs(desktop, markdownContext);
  const mobileHtml = renderTcolorboxParagraphs(mobile, markdownContext);
  const bodies = mobileHtml
    ? `<div class="md-tcolorbox-body md-tcolorbox-body--desktop">${desktopHtml}</div><div class="md-tcolorbox-body md-tcolorbox-body--mobile">${mobileHtml}</div>`
    : `<div class="md-tcolorbox-body">${desktopHtml}</div>`;
  return `<aside class="${escapeAttribute(classNames.join(" "))}"${extraAttrs}><div class="md-tcolorbox-title">${escapeHtml(title)}</div>${bodies}</aside>`;
}

function renderInlineMarkdown(text, markdownContext = null) {
  // Split on inline HTML tags so they pass through unescaped.
  const INLINE_TAG = /(<\/?(?:span|abbr|mark|kbd|sub|sup|cite|time|del|ins|s|u|b|i|small|strong|em|a|code|br|wbr)\b[^>]*>)/gi;
  const parts = text.split(INLINE_TAG);
  let html = parts.map((part, idx) => (idx % 2 === 1 ? part : escapeHtml(part))).join("");
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
      const imageHtml = `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}" loading="lazy"${classAttr}${styleAttr}${titleAttr} />`;

      if (!caption) {
        return imageHtml;
      }

      const figureClasses = ["md-figure", ...classNames.filter((name) => name !== "md-image")];
      return `<figure class="${escapeAttribute(Array.from(new Set(figureClasses)).join(" "))}">${imageHtml}<figcaption class="md-figure-caption">${escapeHtml(caption)}</figcaption></figure>`;
    }
  );
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)(\{new-tab\})?/g, (_, text, url, newTab) => {
    const me = (window.portfolioSeo && typeof window.portfolioSeo.relMeAttr === "function")
      ? window.portfolioSeo.relMeAttr(url)
      : "";
    if (newTab) return `<a href="${url}" target="_blank" rel="${me ? "me noreferrer" : "noreferrer"}">${text}</a>`;
    return me ? `<a href="${url}" rel="me">${text}</a>` : `<a href="${url}">${text}</a>`;
  });
  html = html.replace(/\[([^\]]+)\]\{kbd\}/gi, (_, keys) => {
    return `<kbd class="md-kbd settings-shortcut-kbd">${formatMarkdownKbdLabel(keys)}</kbd>`;
  });
  html = html.replace(/\[([^\]]+)\]\{settings\}/gi, (_, label) => {
    return `<a href="settings" class="md-settings-open" data-settings-open="popover">${label}</a>`;
  });
  html = html.replace(/\[([^\]]+)\]\{fa:([^}]+)\}/gi, (_, label, spec) => renderMarkdownFaIcon(spec, label));
  html = html.replace(/\{fa:([^}]+)\}/gi, (_, spec) => renderMarkdownFaIcon(spec, ""));
  html = html.replace(/\[([^\]]+)\]\{tip:\s*([^}]+)\}/g, (_, label, tip) => {
    return `<span class="md-tooltip" data-tooltip="${escapeAttribute(tip.trim())}" tabindex="0">${label}</span>`;
  });

  if (markdownContext && markdownContext.referenceDefinitions instanceof Map) {
    html = html.replace(/\[([^\]]+)\]\[([^\]]+)\]/g, (full, label, referenceId) => {
      const id = normalizeMarkdownReferenceId(referenceId);
      const reference = markdownContext.referenceDefinitions.get(id);
      if (!reference) return full;
      const titleAttr = reference.title ? ` title="${escapeAttribute(reference.title)}"` : "";
      return `<a href="${escapeAttribute(reference.href)}"${titleAttr}>${label}</a>`;
    });

    html = html.replace(/\[([^\]]+)\]\[\]/g, (full, referenceId) => {
      const id = normalizeMarkdownReferenceId(referenceId);
      const reference = markdownContext.referenceDefinitions.get(id);
      if (!reference) return full;
      const titleAttr = reference.title ? ` title="${escapeAttribute(reference.title)}"` : "";
      return `<a href="${escapeAttribute(reference.href)}"${titleAttr}>${referenceId}</a>`;
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

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
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
  if (hasWow) {
    const animatedIdx = normalizedClassNames.indexOf("animated");
    if (animatedIdx !== -1) {
      normalizedClassNames.splice(animatedIdx, 1);
    }
  }

  if (normalizedClassNames.length > 0) {
    attributes.unshift(`class="${escapeAttribute(normalizedClassNames.join(" "))}"`);
  }

  return {
    text,
    attrs: attributes.length > 0 ? ` ${attributes.join(" ")}` : ""
  };
}

function buildCoverflowHtml(items) {
  const slides = items.map((item, i) => {
    const src = escapeAttribute(String(item.src || item.image || item.url || ""));
    const alt = escapeHtml(String(item.alt || item.title || ""));
    const caption = escapeHtml(String(item.caption || item.cap || ""));
    const activeClass = i === 0 ? " md-coverflow-active" : "";
    const captionHtml = caption
      ? `<figcaption class="md-coverflow-caption">${caption}</figcaption>`
      : "";
    return `<figure class="md-coverflow-slide${activeClass}" data-index="${i}"><img src="${src}" alt="${alt}" loading="lazy" class="md-coverflow-img" />${captionHtml}</figure>`;
  });
  return `<div class="md-coverflow" data-active="0"><div class="md-coverflow-track">${slides.join("")}<button class="md-coverflow-prev" aria-label="Previous" type="button">&#8249;</button><button class="md-coverflow-next" aria-label="Next" type="button">&#8250;</button></div></div>`;
}

function buildIpodCoverflowHtml(items) {
  const initialPos = Math.floor(items.length / 2) + 1;
  const initialCaption = escapeHtml(String(items[initialPos - 1]?.caption || items[initialPos - 1]?.cap || items[initialPos - 1]?.alt || items[initialPos - 1]?.title || ""));
  const imgs = items.map((item, i) => {
    const src = escapeAttribute(String(item.src || item.image || item.url || ""));
    const alt = escapeHtml(String(item.alt || item.title || ""));
    const caption = escapeAttribute(String(item.caption || item.cap || item.alt || item.title || ""));
    return `<img class="md-ipod-cf-image" src="${src}" alt="${alt}" loading="lazy" data-coverflow-index="${i + 1}" data-caption="${caption}" />`;
  });
  const captionEl = `<div class="md-ipod-cf-caption">${initialCaption}</div>`;
  return `<div class="md-ipod-coverflow" data-coverflow-position="${initialPos}" tabindex="0">${imgs.join("")}${captionEl}<button class="md-ipod-cf-prev" type="button" aria-label="Previous">❮</button><button class="md-ipod-cf-next" type="button" aria-label="Next">❯</button></div>`;
}

const LINK_PREVIEW_METADATA_CACHE = new Map();

function normalizePreviewText(value, maxLen) {
  const s = String(value || "").replace(/\s+/g, " ").trim();
  if (!s) return "";
  if (s.length <= maxLen) return s;
  return `${s.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
}

function derivePreviewTitleFromUrl(url) {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const last = segments.length ? segments[segments.length - 1] : "";
    const slug = decodeURIComponent(last || "")
      .replace(/\.[a-z0-9]{1,6}$/i, "")
      .replace(/[-_+]+/g, " ")
      .trim();
    if (slug) {
      return normalizePreviewText(slug.replace(/\b\w/g, (c) => c.toUpperCase()), 140);
    }
    return normalizePreviewText(parsed.hostname.replace(/^www\./i, ""), 140);
  } catch {
    return normalizePreviewText(url, 140);
  }
}

function extractMetadataFromMicrolink(payload) {
  const data = payload?.data || {};
  let image = "";
  if (typeof data.image === "string") image = data.image;
  if (data.image && typeof data.image === "object" && typeof data.image.url === "string") {
    image = data.image.url;
  }

  return {
    title: normalizePreviewText(data.title, 140),
    description: normalizePreviewText(data.description, 280),
    image: normalizePreviewText(image, 1000)
  };
}

function extractMetadataFromNoembed(payload) {
  return {
    title: normalizePreviewText(payload?.title, 140),
    description: normalizePreviewText(payload?.description, 280),
    image: normalizePreviewText(payload?.thumbnail_url || payload?.thumbnailUrl || "", 1000)
  };
}

function fetchJsonWithTimeout(url, timeoutMs) {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  let timeoutId = null;

  if (controller) {
    timeoutId = setTimeout(() => {
      try {
        controller.abort();
      } catch {}
    }, timeoutMs);
  }

  return fetch(url, controller ? { signal: controller.signal } : undefined)
    .then((resp) => {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return resp.json();
    })
    .finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });
}

function fetchLinkPreviewMetadata(url) {
  const key = String(url || "").trim();
  if (!key) return Promise.resolve({});
  if (LINK_PREVIEW_METADATA_CACHE.has(key)) return LINK_PREVIEW_METADATA_CACHE.get(key);

  const encoded = encodeURIComponent(key);
  const promise = fetchJsonWithTimeout(`https://api.microlink.io/?url=${encoded}&meta=true&screenshot=false&audio=false&video=false`, 6000)
    .then(extractMetadataFromMicrolink)
    .catch(() => {
      return fetchJsonWithTimeout(`https://noembed.com/embed?url=${encoded}`, 5000)
        .then(extractMetadataFromNoembed)
        .catch(() => ({}));
    })
    .then((meta) => ({
      title: normalizePreviewText(meta?.title, 140),
      description: normalizePreviewText(meta?.description, 280),
      image: normalizePreviewText(meta?.image, 1000)
    }));

  LINK_PREVIEW_METADATA_CACHE.set(key, promise);
  return promise;
}

function hydrateLinkPreviewsInContainer(container) {
  if (!container) return;
  const previews = container.querySelectorAll(".md-link-preview[data-link-preview-url]");

  previews.forEach((preview) => {
    if (preview.getAttribute("data-link-preview-hydrated") === "1") return;
    preview.setAttribute("data-link-preview-hydrated", "1");

    const missingTitle = preview.getAttribute("data-link-preview-missing-title") === "1";
    const missingDescription = preview.getAttribute("data-link-preview-missing-description") === "1";
    if (!missingTitle && !missingDescription) return;

    const url = preview.getAttribute("data-link-preview-url") || preview.getAttribute("href") || "";
    if (!url) return;

    const titleNode = preview.querySelector(".md-link-preview-title");
    const bodyNode = preview.querySelector(".md-link-preview-body");
    let descNode = preview.querySelector(".md-link-preview-desc");

    fetchLinkPreviewMetadata(url)
      .then((meta) => {
        if (missingTitle && titleNode) {
          const bestTitle = meta.title || derivePreviewTitleFromUrl(url);
          if (bestTitle) titleNode.textContent = bestTitle;
        }

        if (missingDescription) {
          const bestDescription = meta.description || "";
          if (bestDescription) {
            if (!descNode && bodyNode) {
              descNode = document.createElement("div");
              descNode.className = "md-link-preview-desc";
              bodyNode.appendChild(descNode);
            }
            if (descNode) descNode.textContent = bestDescription;
          }
        }
      })
      .catch(() => {
        if (missingTitle && titleNode) {
          const fallbackTitle = derivePreviewTitleFromUrl(url);
          if (fallbackTitle) titleNode.textContent = fallbackTitle;
        }
      });
  });
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

  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  const listStack = [];
  let inCodeFence = false;
  let codeFenceLanguage = "";
  let codeLines = [];
  let quoteLines = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ").trim();
    if (text) {
      const renderedWithContext = renderInlineMarkdown(text, markdownContext);
      if (/^(?:<img\b[^>]*\/>|<figure\b[\s\S]*<\/figure>)$/.test(renderedWithContext.trim())) {
        html.push(renderedWithContext);
      } else {
        html.push(`<p>${renderedWithContext}</p>`);
      }
    }
    paragraph = [];
  };

  const closeList = () => {
    while (listStack.length > 0) {
      popList();
    }
  };

  const ROMAN_RE = /^[ivxlcdm]+$/i;

  const classifyAlphaMarker = (token, openTypeAtIndent) => {
    const isUpper = token === token.toUpperCase() && /[A-Za-z]/.test(token);
    const lower = token.toLowerCase();
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
  };

  const detectListMarker = (rawLine) => {
    const leadingMatch = rawLine.match(/^[ \t]*/)[0];
    const indent = leadingMatch.replace(/\t/g, "    ").length;
    const trimmed = rawLine.trim();
    let m;
    if ((m = trimmed.match(/^([-*])\s+(.*)$/))) {
      return { tag: "ul", markerType: "bullet", indent, rest: m[2] };
    }
    if ((m = trimmed.match(/^(\d+)[.)]\s+(.*)$/))) {
      return { tag: "ol", markerType: "1", indent, rest: m[2] };
    }
    if ((m = trimmed.match(/^([a-zA-Z]+)[.)]\s+(.*)$/))) {
      const token = m[1];
      const rest = m[2];
      let openTypeAtIndent = null;
      for (let i = listStack.length - 1; i >= 0; i -= 1) {
        if (listStack[i].indent === indent && listStack[i].tag === "ol") {
          openTypeAtIndent = listStack[i].markerType;
          break;
        }
        if (listStack[i].indent < indent) break;
      }
      const markerType = classifyAlphaMarker(token, openTypeAtIndent);
      if (!markerType) return null;
      return { tag: "ol", markerType, indent, rest };
    }
    return null;
  };

  const openList = (info) => {
    const typeAttr = info.markerType && info.markerType !== "bullet" && info.markerType !== "1"
      ? ` type="${info.markerType}"`
      : "";
    let nestedInLi = false;
    if (listStack.length > 0 && listStack[listStack.length - 1].indent < info.indent) {
      const lastHtml = html[html.length - 1];
      if (typeof lastHtml === "string" && lastHtml.endsWith("</li>")) {
        html[html.length - 1] = lastHtml.slice(0, -"</li>".length);
        nestedInLi = true;
      }
    }
    html.push(`<${info.tag}${typeAttr}>`);
    listStack.push({ tag: info.tag, markerType: info.markerType, indent: info.indent, nestedInLi });
  };

  const popList = () => {
    const top = listStack.pop();
    html.push(`</${top.tag}>`);
    if (top.nestedInLi) {
      html.push("</li>");
    }
  };

  const handleListItem = (info) => {
    flushParagraph();
    while (
      listStack.length > 0 &&
      listStack[listStack.length - 1].indent > info.indent
    ) {
      popList();
    }
    const top = listStack[listStack.length - 1];
    if (
      !top ||
      top.indent < info.indent ||
      top.markerType !== info.markerType ||
      top.tag !== info.tag
    ) {
      if (top && top.indent === info.indent) {
        popList();
      }
      openList(info);
    }
    const { text, attrs } = parseAttributeSuffix(info.rest);
    html.push(`<li${attrs}>${renderInlineMarkdown(text, markdownContext)}</li>`);
  };

  const flushQuote = () => {
    if (quoteLines.length === 0) return;
    const parts = quoteLines.map((line) => {
      return renderInlineMarkdown(line.trimEnd(), markdownContext);
    });
    const rendered = parts.join("<br>").trim();
    if (rendered) {
      html.push(`<blockquote><p>${rendered}</p></blockquote>`);
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

  const parseLinkPreviewBlock = (lines) => {
    const fields = {};
    for (const line of lines) {
      const m = line.match(/^([a-zA-Z]+)\s*:\s*(.*)$/);
      if (m) fields[m[1].toLowerCase().trim()] = m[2].trim();
    }
    return fields;
  };

  const renderLinkPreview = (fields) => {
    const url = fields.url || "";
    const rawTitle = fields.title || "";
    const rawDescription = fields.description || "";
    const title = rawTitle || derivePreviewTitleFromUrl(url);
    const description = rawDescription || "";
    const image = fields.image || "";
    let domain = "";
    try { domain = new URL(url).hostname.replace(/^www\./, ""); } catch (_) { domain = url; }

    const faviconSrc = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
    const imgSrc = image || faviconSrc;
    const isFavicon = !image;

    const imgHtml = `<div class="md-link-preview-image${isFavicon ? " md-link-preview-favicon" : ""}"><img src="${escapeAttribute(imgSrc)}" alt="" loading="lazy" /></div>`;
    const descHtml = description ? `<div class="md-link-preview-desc">${escapeHtml(description)}</div>` : "";
    const inner = imgHtml +
      `<div class="md-link-preview-body">` +
        `<div class="md-link-preview-domain">${escapeHtml(domain)}</div>` +
        `<div class="md-link-preview-title">${escapeHtml(title)}</div>` +
        descHtml +
      `</div>`;

    if (url) {
      const attrs =
        ` data-link-preview-url="${escapeAttribute(url)}"` +
        ` data-link-preview-missing-title="${rawTitle ? "0" : "1"}"` +
        ` data-link-preview-missing-description="${rawDescription ? "0" : "1"}"`;
      return `<a class="md-link-preview" href="${escapeAttribute(url)}" target="_blank" rel="noreferrer"${attrs}>${inner}</a>`;
    }
    return `<div class="md-link-preview">${inner}</div>`;
  };

  const flushCodeFence = () => {
    if (!inCodeFence) return;
    const normalizedLanguage = normalizeCodeLanguage(codeFenceLanguage);
    if (normalizedLanguage === "link-preview") {
      html.push(renderLinkPreview(parseLinkPreviewBlock(codeLines)));
      inCodeFence = false;
      codeFenceLanguage = "";
      codeLines = [];
      return;
    }
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
        return `<th${align}>${renderInlineMarkdown(cell, markdownContext)}</th>`;
      })
      .join("");

    const tbodyRowsHtml = bodyRows
      .map((row) => {
        const cellsHtml = headers
          .map((_, index) => {
            const align = alignments[index] ? ` style="text-align:${alignments[index]}"` : "";
            const value = row[index] ?? "";
            return `<td${align}>${renderInlineMarkdown(value, markdownContext)}</td>`;
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

    const tcolorboxFence = trimmed.match(/^```\s*tcolorbox(?:\s+(.*))?$/i);
    if (tcolorboxFence) {
      flushParagraph();
      closeList();
      flushQuote();
      const tcolorboxLines = [];
      lineIndex += 1;
      while (lineIndex < lines.length && !/^```\s*$/.test(lines[lineIndex].trim())) {
        tcolorboxLines.push(lines[lineIndex]);
        lineIndex += 1;
      }
      html.push(buildTcolorboxHtml(tcolorboxFence[1] || "", tcolorboxLines.join("\n"), markdownContext));
      continue;
    }

    const codeFenceStart = trimmed.match(/^```\s*([^\s`]+)?\s*$/);
    if (codeFenceStart) {
      const fenceLanguage = codeFenceStart[1] || "";

      if (fenceLanguage.toLowerCase() === "coverflow") {
        flushParagraph();
        closeList();
        flushQuote();
        const coverflowLines = [];
        lineIndex += 1;
        while (lineIndex < lines.length && !/^```\s*$/.test(lines[lineIndex].trim())) {
          coverflowLines.push(lines[lineIndex]);
          lineIndex += 1;
        }
        try {
          const items = JSON.parse(coverflowLines.join("\n"));
          if (Array.isArray(items) && items.length > 0) {
            html.push(buildCoverflowHtml(items));
          }
        } catch {
          // malformed JSON — skip block
        }
        continue;
      }

      if (fenceLanguage.toLowerCase() === "carousel") {
        flushParagraph();
        closeList();
        flushQuote();
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

      if (fenceLanguage.toLowerCase() === "ipod-coverflow") {
        flushParagraph();
        closeList();
        flushQuote();
        const ipodLines = [];
        lineIndex += 1;
        while (lineIndex < lines.length && !/^```\s*$/.test(lines[lineIndex].trim())) {
          ipodLines.push(lines[lineIndex]);
          lineIndex += 1;
        }
        try {
          const items = JSON.parse(ipodLines.join("\n"));
          if (Array.isArray(items) && items.length > 0) {
            html.push(buildIpodCoverflowHtml(items));
          }
        } catch {
          // malformed JSON — skip block
        }
        continue;
      }

      flushParagraph();
      closeList();
      flushQuote();
      inCodeFence = true;
      codeFenceLanguage = fenceLanguage;
      codeLines = [];
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushQuote();
      if (listStack.length > 0) {
        let nextNonBlank = -1;
        for (let scan = lineIndex + 1; scan < lines.length; scan += 1) {
          if (lines[scan].trim()) { nextNonBlank = scan; break; }
        }
        if (nextNonBlank === -1 || !detectListMarker(lines[nextNonBlank])) {
          closeList();
        }
      }
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

    const columnsMatch = trimmed.match(COLUMNS_REGEX);
    if (columnsMatch) {
      flushParagraph();
      closeList();
      flushQuote();
      const cfg = parseColumnsConfig(columnsMatch[1]);
      const gridTempl = cfg.ratios
        ? `grid-template-columns: ${cfg.ratios.map(r => r + "fr").join(" ")};`
        : `grid-template-columns: repeat(${cfg.count}, 1fr);`;
      html.push(`<div class="md-columns" style="${gridTempl}">`);
      let colIdx = 0;
      while (lineIndex + 1 < lines.length && colIdx < cfg.count) {
        lineIndex++;
        const colLine = lines[lineIndex].trim();
        if (!colLine) {
          /* skip blank lines between columns */
          while (lineIndex + 1 < lines.length && !lines[lineIndex + 1].trim()) { lineIndex++; }
          lineIndex--;
          continue;
        }
        if (colLine.match(/^::/)) {
          lineIndex--;
          break;
        }
        html.push(`<div class="md-column">`);
        html.push(renderInlineMarkdown(colLine, markdownContext));
        while (lineIndex + 1 < lines.length) {
          const nextLine = lines[lineIndex + 1].trim();
          if (!nextLine) {
            lineIndex++;
            break;
          }
          if (nextLine.match(/^::/)) break;
          lineIndex++;
          html.push(`<p>${renderInlineMarkdown(nextLine, markdownContext)}</p>`);
        }
        html.push(`</div>`);
        colIdx++;
      }
      html.push(`</div>`);
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
      quoteLines.push(rawLine.replace(/^>\s*/, ""));
      continue;
    }

    flushQuote();

    if (/^<!--|^<(iframe|video|audio|div|section|details|summary|figure|form|script|style|article|aside|header|footer|main|nav|a|p|span|br|img|ul|ol|li|table|thead|tbody|tr|td|th|h[1-6])\b/i.test(trimmed)) {
      flushParagraph();
      closeList();
      const rawHtmlLines = [line];
      while (lineIndex + 1 < lines.length && lines[lineIndex + 1].trim()) {
        lineIndex++;
        rawHtmlLines.push(lines[lineIndex]);
      }
      html.push(rawHtmlLines.join("\n"));
      continue;
    }

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
      html.push(`<h${level}${attrs}>${renderInlineMarkdown(text, markdownContext)}</h${level}>`);
      continue;
    }

    const listInfo = detectListMarker(rawLine);
    if (listInfo) {
      handleListItem(listInfo);
      continue;
    }

    const paragraphLine = parseAttributeSuffix(trimmed);
    if (paragraphLine.attrs) {
      flushParagraph();
      closeList();
      html.push(`<p${paragraphLine.attrs}>${renderInlineMarkdown(paragraphLine.text, markdownContext)}</p>`);
      continue;
    }

    paragraph.push(paragraphLine.text);
  }

  flushQuote();
  flushCodeFence();
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
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : "";
}

function extractDataBlock(markdown, blockName) {
  const raw = extractRawDataBlock(markdown, blockName);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function extractRawDataBlock(markdown, blockName) {
  const regex = new RegExp("```" + blockName + "\\n([\\s\\S]*?)```", "m");
  const match = markdown.match(regex);
  return match ? match[1] : null;
}

function collectLocalizedDataBlock(markdown, blockName) {
  const byLang = {};
  const split =
    window.portfolioI18n && typeof window.portfolioI18n.splitMarkdownByLanguageContent === "function"
      ? window.portfolioI18n.splitMarkdownByLanguageContent(markdown)
      : [];

  split.forEach((part) => {
    if (!part || part.type !== "lang") return;
    const parsed = parseLanguageContentFromRaw(part.raw);
    Object.entries(parsed).forEach(([lang, md]) => {
      const data = extractDataBlock(md, blockName);
      if (Array.isArray(data)) byLang[String(lang).toLowerCase()] = data;
    });
  });

  const fallback = extractDataBlock(markdown, blockName);
  return {
    byLang,
    fallback: Array.isArray(fallback) ? fallback : [],
  };
}

function resolveLocalizedDataForLang(byLang, fallback, lang) {
  const code = String(lang || getPreferredLanguage() || "en").toLowerCase();
  if (Array.isArray(byLang[code]) && byLang[code].length) {
    return byLang[code];
  }
  if (Array.isArray(byLang.en) && byLang.en.length) {
    return byLang.en;
  }
  return Array.isArray(fallback) ? fallback : [];
}

function collectExperienceByLanguage(markdown) {
  return collectLocalizedDataBlock(markdown, "experience-data");
}

function resolveExperienceForLang(lang) {
  return resolveLocalizedDataForLang(experienceByLanguage, experienceFallback, lang);
}

function collectResourcesByLanguage(markdown) {
  return collectLocalizedDataBlock(markdown, "resources-data");
}

function resolveResourcesForLang(lang) {
  return resolveLocalizedDataForLang(resourcesByLanguage, resourcesFallback, lang);
}

function collectProjectsByLanguage(markdown) {
  return collectLocalizedDataBlock(markdown, "projects-data");
}

function collectLocalizedObjectBlock(markdown, blockName) {
  const byLang = {};
  const split =
    window.portfolioI18n && typeof window.portfolioI18n.splitMarkdownByLanguageContent === "function"
      ? window.portfolioI18n.splitMarkdownByLanguageContent(markdown)
      : [];

  split.forEach((part) => {
    if (!part || part.type !== "lang") return;
    const parsed = parseLanguageContentFromRaw(part.raw);
    Object.entries(parsed).forEach(([lang, md]) => {
      const data = extractDataBlock(md, blockName);
      if (data && typeof data === "object" && !Array.isArray(data)) {
        byLang[String(lang).toLowerCase()] = data;
      }
    });
  });

  const fallback = extractDataBlock(markdown, blockName);
  return {
    byLang,
    fallback: fallback && typeof fallback === "object" && !Array.isArray(fallback) ? fallback : {},
  };
}

function collectLocalizedMarkdownBodies(markdown) {
  const byLang = {};
  const split =
    window.portfolioI18n && typeof window.portfolioI18n.splitMarkdownByLanguageContent === "function"
      ? window.portfolioI18n.splitMarkdownByLanguageContent(markdown)
      : [];

  split.forEach((part) => {
    if (!part || part.type !== "lang") return;
    const parsed = parseLanguageContentFromRaw(part.raw);
    Object.entries(parsed).forEach(([lang, md]) => {
      const body = removeFirstHeading(removeDataBlocks(md)).trim();
      if (body) byLang[String(lang).toLowerCase()] = body;
    });
  });

  return byLang;
}

function applyLocaleToPost(post, lang) {
  if (!post || !post.locales) return post;
  const code = String(lang || getPreferredLanguage() || "en").toLowerCase();
  const loc = post.locales[code] || post.locales.en;
  if (!loc) return post;
  Object.assign(post, loc);
  return post;
}

function applyLocaleToPostList(posts, lang) {
  if (!Array.isArray(posts)) return;
  const code = lang || getPreferredLanguage();
  posts.forEach((post) => applyLocaleToPost(post, code));
}

function resolveProjectsForLang(lang) {
  return resolveLocalizedDataForLang(projectsByLanguage, projectsFallback, lang);
}

function projectIdentity(project) {
  if (!project || typeof project !== "object") return "";
  return (
    (Array.isArray(project.images) && project.images[0]) ||
    project.links?.demo ||
    project.links?.github ||
    project.title ||
    ""
  );
}

function syncSelectedProjectForLanguage() {
  if (!selectedProject || !modal) return;
  const previousIndex = projects.indexOf(selectedProject);
  const identity = projectIdentity(selectedProject);
  const byIdentity = identity
    ? projects.find((item) => projectIdentity(item) === identity)
    : null;
  selectedProject = byIdentity || (previousIndex >= 0 ? projects[previousIndex] : null) || projects[0] || null;
  if (modal.open && selectedProject) renderModal();
}

function extractAllDataBlocks(markdown, blockName) {
  const regex = new RegExp("```" + blockName + "\\n([\\s\\S]*?)```", "gi");
  const results = [];
  let match;

  while ((match = regex.exec(markdown)) !== null) {
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

function t(key, vars) {
  return (window.portfolioI18n && typeof window.portfolioI18n.t === "function")
    ? window.portfolioI18n.t(key, vars)
    : key;
}

function parseLanguageContentFromRaw(rawBlock) {
  if (window.portfolioI18n && typeof window.portfolioI18n.parseLanguageContent === "function") {
    return window.portfolioI18n.parseLanguageContent(rawBlock);
  }

  const result = {};
  if (!rawBlock) return result;
  const lines = String(rawBlock).replace(/\r\n/g, "\n").split("\n");
  let currentLang = "";
  let buffer = [];
  const reserved = new Set(["mobile", "desktop"]);

  const flush = () => {
    if (!currentLang) return;
    const content = buffer.join("\n").trim();
    if (content) result[currentLang] = content;
    buffer = [];
  };

  for (const line of lines) {
    const marker = line.trim().match(/^::([a-zA-Z-]+)$/);
    if (marker) {
      const code = marker[1].toLowerCase();
      if (reserved.has(code)) {
        if (currentLang) buffer.push(line);
        continue;
      }
      flush();
      currentLang = code;
      continue;
    }
    if (currentLang) buffer.push(line);
  }

  flush();
  return result;
}

function parseLanguageContentBlock(markdown) {
  if (window.portfolioI18n && typeof window.portfolioI18n.parseAllLanguageContentBlocks === "function") {
    const blocks = window.portfolioI18n.parseAllLanguageContentBlocks(markdown);
    return blocks[0] || {};
  }

  const rawBlock =
    extractRawDataBlock(markdown, "language-content") ||
    extractRawDataBlock(markdown, "language content") ||
    extractRawDataBlock(markdown, "language content section");
  return parseLanguageContentFromRaw(rawBlock);
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

function removeDataBlocks(markdown) {
  const markdownWithRotationSlots = insertRotationSlotsFromBlocks(markdown);
  const withoutLanguageContent =
    window.portfolioI18n && typeof window.portfolioI18n.stripLanguageContentBlocks === "function"
      ? window.portfolioI18n.stripLanguageContentBlocks(markdownWithRotationSlots)
      : markdownWithRotationSlots
        .replace(/```language-content(?:[^\n]*)\n[\s\S]*?```/gi, "")
        .replace(/```language content(?:[^\n]*)\n[\s\S]*?```/gi, "")
        .replace(/```language content section(?:[^\n]*)\n[\s\S]*?```/gi, "");

  return withoutLanguageContent
    .replace(/```title-rotations\n[\s\S]*?```/gi, "")
    .replace(/```rotations\n[\s\S]*?```/gi, "")
    .replace(/```projects-data\n[\s\S]*?```/gi, "")
    .replace(/```experience-data\n[\s\S]*?```/gi, "")
    .replace(/```resources-data\n[\s\S]*?```/gi, "")
    .replace(/```post-data\n[\s\S]*?```/gi, "")
    .trim();
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

function parseColumnsConfig(rawConfig) {
  const config = { count: 3, ratios: null };
  const parts = String(rawConfig || "").trim().split(/\s+/);

  if (parts.length > 0) {
    const count = parseInt(parts[0], 10);
    if (count > 0 && count <= 12) config.count = count;
  }

  if (parts.length > 1) {
    const ratioStr = parts[1];
    const ratios = ratioStr.split("-").map(r => parseInt(r, 10));
    if (ratios.length === config.count && ratios.every(r => r > 0)) {
      config.ratios = ratios;
    }
  }

  return config;
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function stripHtmlTags(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function renderTypedTextWithLinks(text, links) {
  const source = String(text || "");
  if (!Array.isArray(links) || !links.length) {
    return escapeHtml(source);
  }

  let html = "";
  let cursor = 0;
  for (const link of links) {
    const start = Math.max(0, Number(link?.start) || 0);
    const end = Math.max(start, Number(link?.end) || 0);
    if (start >= source.length) break;
    html += escapeHtml(source.slice(cursor, Math.min(start, source.length)));
    const label = source.slice(start, Math.min(end, source.length));
    if (label) {
      html += `<a href="settings" class="md-settings-open" data-settings-open="popover">${escapeHtml(label)}</a>`;
    }
    cursor = Math.min(end, source.length);
  }
  html += escapeHtml(source.slice(cursor));
  return html;
}

function parseRotationInlineSettingsLinks(raw) {
  const links = [];
  let text = "";
  let lastIndex = 0;
  const source = String(raw || "");
  const re = /\[([^\]]+)\]\{settings\}/gi;
  let match;
  while ((match = re.exec(source))) {
    text += source.slice(lastIndex, match.index);
    const label = match[1];
    if (label) {
      links.push({ start: text.length, end: text.length + label.length });
      text += label;
    }
    lastIndex = match.index + match[0].length;
  }
  text += source.slice(lastIndex);
  return {
    text,
    html: renderTypedTextWithLinks(text, links),
    links
  };
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

  if (lower.startsWith("wow:")) {
    const wowClassRaw = raw.slice(raw.indexOf(":") + 1).trim();
    const wowClass = wowClassRaw || "fadeIn";
    return { mode: "wow", className: wowClass };
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

  const normalizedClass = raw.replace(/^animate__/, "").trim();
  return {
    mode: "animate",
    className: normalizedClass || "fadeIn"
  };
}

function normalizeRotationItems(items, mode) {
  if (!Array.isArray(items)) {
    return [];
  }

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
      const html =
        typeof item === "string"
          ? item
          : String((item && (item.html || item.content || item.text)) || "");
      if (!html.trim()) continue;
      normalized.push({
        html: `<div class="markdown-rotation-fragment markdown-rotation-fragment--html">${html}</div>`,
        text: stripHtmlTags(html),
        attrs: item?.attrs || null
      });
      continue;
    }

    if (mode === "markdown") {
      const markdown =
        typeof item === "string"
          ? item
          : String((item && (item.markdown || item.content || item.text)) || "");
      if (!markdown.trim()) continue;
      const html = markdownToHtml(markdown);
      normalized.push({
        html: `<div class="markdown-rotation-fragment markdown-rotation-fragment--markdown">${html}</div>`,
        text: stripHtmlTags(html),
        attrs: item?.attrs || null
      });
      continue;
    }

    const rawText =
      typeof item === "string"
        ? item
        : String((item && (item.text || item.value || item.content)) || "");

    if (!rawText.trim()) {
      continue;
    }

    const parsed = parseRotationInlineSettingsLinks(rawText.trim());
    normalized.push({
      text: parsed.text,
      html: parsed.html,
      links: parsed.links,
      attrs: item?.attrs || null
    });
  }

  return normalized;
}

function normalizeBackspaceMode(value) {
  const v = String(value || "inactive").trim().toLowerCase();
  if (v === "active" || v === "repeated") return v;
  return "inactive";
}

function computeCommonPrefix(texts) {
  if (!texts.length) return "";
  let prefix = texts[0];
  for (let i = 1; i < texts.length; i++) {
    const t = texts[i];
    let j = 0;
    while (j < prefix.length && j < t.length && prefix[j] === t[j]) j++;
    prefix = prefix.slice(0, j);
    if (!prefix) return "";
  }
  // trim trailing whitespace so we don't land mid-word
  return prefix.trimEnd();
}

function normalizeRotationsData(rawData) {
  if (!rawData) {
    return [];
  }

  const defaultSparksEnabled = typeof rawData?.sparks === "boolean" ? rawData.sparks : true;
  const defaultFlamesEnabled = typeof rawData?.flames === "boolean" ? rawData.flames : false;
  /*
   * Rotations run through their items once and settle on the last one. They
   * used to cycle for as long as the page was open, which meant the content
   * (and every animation attached to it) was rebuilt every couple of seconds
   * with no way to stop it. Set "loop": true on the block — or on a single
   * entry — to opt back into the endless carousel.
   */
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
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const id = normalizeRotationAnchor(entry.id || entry.anchor || `rotation-${index + 1}`);
      if (!id) {
        return null;
      }

      const elementTag = normalizeRotationTagName(entry.element || entry.tag || "span");
      const mode = normalizeRotationMode(entry.mode, elementTag);
      const items = normalizeRotationItems(entry.items, mode);
      if (!items.length) {
        return null;
      }

      const intervalMs = Math.round(
        parseFiniteNumber(entry.interval || entry.intervalMs, ROTATION_DEFAULT_INTERVAL_MS, ROTATION_MIN_INTERVAL_MS)
      );
      const effect = normalizeRotationEffect(entry.effect || "fade");
      const effectDurationMs = Math.round(
        parseFiniteNumber(
          entry.effectDuration || entry.effectDurationMs,
          ROTATION_DEFAULT_EFFECT_DURATION_MS,
          120
        )
      );
      const typingSpeedMs = Math.round(
        parseFiniteNumber(entry.typingSpeed || entry.typingSpeedMs, ROTATION_DEFAULT_TYPING_SPEED_MS, ROTATION_MIN_TYPING_SPEED_MS)
      );
      const backspaceSpeedMs = Math.round(
        parseFiniteNumber(entry.backspaceSpeed || entry.backspaceSpeedMs, ROTATION_DEFAULT_BACKSPACE_SPEED_MS, ROTATION_MIN_TYPING_SPEED_MS)
      );
      const startIndex = Math.max(0, Math.round(parseFiniteNumber(entry.startIndex, 0, 0)));
      const backspace = normalizeBackspaceMode(entry.backspace);
      const commonPrefix = backspace === "repeated"
        ? computeCommonPrefix(items.map((it) => it.text || ""))
        : "";

      return {
        id,
        anchor: normalizeRotationAnchor(entry.anchor || id, id),
        selector: typeof entry.selector === "string" ? entry.selector.trim() : "",
        elementTag,
        mode,
        items,
        intervalMs,
        effect,
        effectDurationMs,
        typingSpeedMs,
        backspaceSpeedMs,
        startIndex,
        randomOrder: Boolean(entry.random || entry.randomOrder),
        loop: typeof entry.loop === "boolean" ? entry.loop : defaultLoop,
        pauseOnHover: Boolean(entry.pauseOnHover),
        sparksEnabled: typeof entry.sparks === "boolean" ? entry.sparks : defaultSparksEnabled,
        flamesEnabled: typeof entry.flames === "boolean" ? entry.flames : defaultFlamesEnabled,
        staticAttributes: entry.attributes && typeof entry.attributes === "object" ? entry.attributes : null,
        blinkingCursor: Boolean(entry.blinkingCursor),
        backspace,
        commonPrefix
      };
    })
    .filter(Boolean);
}

function findRotationSlot(container, anchorId) {
  if (!container || !anchorId) {
    return null;
  }

  const slots = Array.from(container.querySelectorAll(".md-rotation-slot[data-rotation-id]"));
  return slots.find((slot) => String(slot.dataset.rotationId || "").toLowerCase() === anchorId) || null;
}

function applyRotationAttributes(target, attrs) {
  if (!target || !attrs || typeof attrs !== "object") {
    return;
  }

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

function detectScriptLang(text) {
  const str = String(text || "");
  if (!str) return null;
  if (/[぀-ヿ]/.test(str)) return "ja";
  if (/[가-힣]/.test(str)) return "ko";
  if (/[一-鿿㐀-䶿]/.test(str)) return "zh";
  if (/[ἀ-῿]/.test(str)) return "grc";
  if (/[Ͱ-Ͽ]/.test(str)) return "el";
  if (/[֐-׿]/.test(str)) return "he";
  if (/[؀-ۿ]/.test(str)) return "ar";
  if (/[Ѐ-ӿ]/.test(str)) return "ru";
  return null;
}

function applyDetectedLang(target, text) {
  if (!target) return;
  const detected = detectScriptLang(text);
  if (detected) {
    target.setAttribute("lang", detected);
  } else {
    target.removeAttribute("lang");
  }
}

function setTypingSparkleText(target, text, links) {
  if (!target) {
    return;
  }

  target.classList.add("typing-sparkle-host");
  applyDetectedLang(target, text);

  let textNode = target.querySelector(":scope > .typing-sparkle-text");
  if (!textNode) {
    textNode = document.createElement("span");
    textNode.className = "typing-sparkle-text";
    target.textContent = "";
    target.appendChild(textNode);
  }

  const value = String(text || "");
  if (Array.isArray(links) && links.length) {
    textNode.innerHTML = renderTypedTextWithLinks(value, links);
  } else {
    textNode.textContent = value;
  }
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
  let currentDisplayedText = "";
  // Items shown so far. Without "loop" the rotation retires once it has been
  // through the list, leaving the last item on screen for good.
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
    const links = Array.isArray(item?.links) ? item.links : [];
    if (!text) {
      currentDisplayedText = "";
      setTypingSparkleText(target, "", links);
      onComplete();
      return;
    }

    const backspaceMode = config.backspace || "inactive";
    const eraseDownTo = backspaceMode === "inactive"
      ? null
      : backspaceMode === "repeated"
        ? config.commonPrefix
        : "";

    const startFrom = currentDisplayedText;

    const typeForward = (from) => {
      let cursor = from.length;
      const typeStep = () => {
        if (stopped) return;
        if (cursor <= text.length) {
          const partial = text.slice(0, cursor);
          currentDisplayedText = partial;
          setTypingSparkleText(target, partial, links);
          if (cursor > 0) {
            const typedChar = text.charAt(cursor - 1);
            const previousChar = text.charAt(cursor - 2);
            const shouldEmit = shouldEmitTypingSpark(typedChar, previousChar, cursor);
            if (shouldEmit && config.sparksEnabled !== false && !isPerfMode()) {
              emitTypingSparkles(target, 16);
            }
            if (shouldEmit && config.flamesEnabled !== false && !isPerfMode()) {
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

    if (eraseDownTo === null || startFrom.length === 0) {
      currentDisplayedText = "";
      setTypingSparkleText(target, "", links);
      typeForward("");
      return;
    }

    // Erase startFrom down to eraseDownTo, then type the new text
    let eraseLen = startFrom.length;
    const stopAt = eraseDownTo.length;

    const eraseStep = () => {
      if (stopped) return;
      if (eraseLen > stopAt) {
        eraseLen -= 1;
        const partial = startFrom.slice(0, eraseLen);
        currentDisplayedText = partial;
        setTypingSparkleText(target, partial, links);
        typedTimer = window.setTimeout(eraseStep, config.backspaceSpeedMs);
      } else {
        typeForward(startFrom.slice(0, stopAt));
      }
    };

    eraseStep();
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
      applyDetectedLang(target, item.text);
    } else {
      target.innerHTML = item.html || "";
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
  if (!markdownRotationControllers.length) {
    return;
  }

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

  const rotationsDataBlocks = extractAllDataBlocks(markdownRaw, "rotations");
  const rotations = rotationsDataBlocks.flatMap((block) => normalizeRotationsData(block));
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
      console.warn(`Rotation '${rotation.id}' was skipped because no slot or selector target was found.`);
      return;
    }

    target.classList.add("markdown-rotation", `markdown-rotation--${rotation.mode}`);
    if (rotation.blinkingCursor) {
      target.classList.add("markdown-rotation--blinking-cursor");
    }
    applyRotationAttributes(target, rotation.staticAttributes);

    const controller = createRotationController(target, rotation);
    if (controller) {
      markdownRotationControllers.push(controller);
    }
  });
}

function extractMarkdownOptions(markdown) {
  const options = {
    justify: false
  };

  const lines = String(markdown || "").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^::justify\s*(on|true|yes)?\s*$/i.test(trimmed)) {
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
  return markdown.replace(/^#\s+.+\n?/m, "").trim();
}

function buildMarkdownUrlCandidates(path) {
  const normalized = path.replace(/^\.\//, "");
  const locationHref = window.location.href;
  const locationUrl = new URL(locationHref);

  let locationBasePath = locationUrl.pathname;
  if (!locationBasePath.endsWith("/")) {
    const lastSegment = locationBasePath.split("/").pop() || "";
    const looksLikeFile = /\.[a-z0-9]+$/i.test(lastSegment);
    locationBasePath = looksLikeFile
      ? locationBasePath.replace(/[^/]*$/, "")
      : `${locationBasePath}/`;
  }

  const locationDir = `${locationUrl.origin}${locationBasePath}`;

  const bootScript = document.querySelector('script[src$="assets/js/script.js"], script[src*="/assets/js/script.js"]');
  const scriptSrc = bootScript?.src || document.currentScript?.src || locationHref;
  const scriptDir = scriptSrc.endsWith("/")
    ? scriptSrc
    : scriptSrc.replace(/[^/]*$/, "");

  let repoBase = "";
  try {
    const scriptUrl = new URL(scriptSrc, locationHref);
    const match = scriptUrl.pathname.match(/^(.*\/)assets\/js\/[^/]+$/i);
    if (match) {
      repoBase = `${scriptUrl.origin}${match[1]}`;
    }
  } catch {
    repoBase = "";
  }

  const candidates = [
    normalized,
    `./${normalized}`,
    new URL(normalized, locationHref).toString(),
    new URL(normalized, locationDir).toString(),
    new URL(normalized, scriptDir).toString(),
    `${locationDir}${normalized}`,
    repoBase ? new URL(normalized, repoBase).toString() : ""
  ];

  return [...new Set(candidates.filter(Boolean))];
}

async function loadMarkdown(path, { forceRefresh = false } = {}) {
  const candidates = buildMarkdownUrlCandidates(path);
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { cache: forceRefresh ? "no-store" : "default" });
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

function toArrayOfStrings(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function parsePostYear(dateValue) {
  const raw = String(dateValue || "").trim();
  if (!raw) return "";
  const yearMatch = raw.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    return yearMatch[0];
  }
  return "";
}

function normalizeAudioTracks(postData, indexItem = null) {
  const candidates = [
    postData?.tracks,
    postData?.mp3s,
    postData?.recordings,
    postData?.audioFiles,
    postData?.audio,
    indexItem?.tracks,
    indexItem?.mp3s,
    indexItem?.recordings,
    indexItem?.audioFiles,
    indexItem?.audio
  ];

  const singletons = [
    postData?.mp3,
    postData?.mp3Url,
    postData?.audioUrl,
    postData?.track,
    indexItem?.mp3,
    indexItem?.mp3Url,
    indexItem?.audioUrl,
    indexItem?.track
  ];

  const items = [];

  candidates.forEach((candidate) => {
    if (!candidate) return;
    if (Array.isArray(candidate)) {
      candidate.forEach((entry) => items.push(entry));
      return;
    }
    items.push(candidate);
  });

  singletons.forEach((candidate) => {
    if (candidate) {
      items.push(candidate);
    }
  });

  const normalized = items
    .map((item, index) => {
      if (typeof item === "string") {
        const url = item.trim();
        if (!url) return null;
        return {
          title: `Track ${index + 1}`,
          url,
          duration: "",
          bpm: "",
          key: "",
          timeSignature: "",
          notes: ""
        };
      }

      if (item && typeof item === "object") {
        const url = String(item.url || item.src || item.file || item.path || item.mp3 || "").trim();
        if (!url) return null;
        return {
          title: String(item.title || item.name || item.label || "").trim() || `Track ${index + 1}`,
          url,
          duration: String(item.duration || "").trim(),
          bpm: String(item.bpm || "").trim(),
          key: String(item.key || item.keySignature || "").trim(),
          timeSignature: String(item.timeSignature || item.meter || "").trim(),
          notes: String(item.notes || item.description || "").trim()
        };
      }

      return null;
    })
    .filter(Boolean);

  const seen = new Set();
  return normalized.filter((track) => {
    if (seen.has(track.url)) return false;
    seen.add(track.url);
    return true;
  });
}

function normalizeSheetMusic(postData, indexItem = null) {
  const candidates = [
    postData?.sheetMusic,
    postData?.sheets,
    postData?.scores,
    postData?.score,
    indexItem?.sheetMusic,
    indexItem?.sheets,
    indexItem?.scores,
    indexItem?.score
  ];

  const items = [];
  candidates.forEach((candidate) => {
    if (!candidate) return;
    if (Array.isArray(candidate)) {
      candidate.forEach((entry) => items.push(entry));
      return;
    }
    items.push(candidate);
  });

  const normalized = items
    .map((item, index) => {
      if (typeof item === "string") {
        const url = item.trim();
        if (!url) return null;
        return {
          title: `Score ${index + 1}`,
          url,
          type: "sheet"
        };
      }

      if (item && typeof item === "object") {
        const url = String(item.url || item.src || item.file || item.path || item.pdf || "").trim();
        if (!url) return null;
        return {
          title: String(item.title || item.name || item.label || "").trim() || `Score ${index + 1}`,
          url,
          type: String(item.type || item.kind || "sheet").trim() || "sheet"
        };
      }

      return null;
    })
    .filter(Boolean);

  const seen = new Set();
  return normalized.filter((score) => {
    if (seen.has(score.url)) return false;
    seen.add(score.url);
    return true;
  });
}

function slugifyHeading(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

function extractHeadingsFromMarkdown(markdown) {
  const headings = [];
  const slugCounts = {};
  const lines = String(markdown || "").split("\n");
  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.+)$/);
    if (!m) continue;
    const level = m[1].length;
    // Strip inline markdown (bold, italic, code, links)
    const text = m[2]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/_{1,2}([^_]+)_{1,2}/g, "$1")
      .replace(/\{[^}]+\}/g, "")
      .trim();
    if (!text) continue;
    let slug = slugifyHeading(text);
    slugCounts[slug] = (slugCounts[slug] || 0) + 1;
    if (slugCounts[slug] > 1) slug = `${slug}-${slugCounts[slug]}`;
    headings.push({ level, text, id: slug });
  }
  return headings;
}

function buildTocHtml(headings, { linkPrefix = "" } = {}) {
  if (!headings || !headings.length) return "";
  const minLevel = Math.min(...headings.map((h) => h.level));
  let html = '<ol class="toc-list">';
  for (const h of headings) {
    const indent = h.level - minLevel;
    const href = linkPrefix ? `${linkPrefix}#${h.id}` : `#${h.id}`;
    html += `<li class="toc-item toc-level-${h.level}" style="--toc-indent:${indent}">`
          + `<a class="toc-link" href="${escapeAttribute(href)}">${escapeHtml(h.text)}</a>`
          + `</li>`;
  }
  html += "</ol>";
  return html;
}

function summarizeMarkdown(markdown, maxLength = 190) {
  const plain = String(markdown || "")
    .replace(/[#*_`>\-\[\]\(\)]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) {
    return plain;
  }

  return `${plain.slice(0, maxLength).trimEnd()}…`;
}

function normalizeContentPath(pathValue, directory) {
  const normalizedDirectory = String(directory || "").trim().replace(/^\/+|\/+$/g, "");
  if (!normalizedDirectory) return "";

  const path = String(pathValue || "").trim();
  if (!path) return "";
  if (path.startsWith(`${normalizedDirectory}/`)) return path;
  return `${normalizedDirectory}/${path.replace(/^\.\//, "")}`;
}

function normalizePostPath(pathValue) {
  return normalizeContentPath(pathValue, "posts");
}

function normalizeMusicPath(pathValue) {
  return normalizeContentPath(pathValue, "music");
}

function parseBlogPost(markdown, path, indexItem = null) {
  const isMusic = /^music\//i.test(String(path || ""));
  const slug = path.split("/").pop()?.replace(/\.md$/i, "") || "untitled";
  const { byLang: metaByLang, fallback: fallbackMeta } = collectLocalizedObjectBlock(markdown, "post-data");
  const bodies = collectLocalizedMarkdownBodies(markdown);
  const fallbackBody = removeFirstHeading(removeDataBlocks(markdown)).trim();
  const langs = new Set(["en", ...Object.keys(metaByLang), ...Object.keys(bodies)]);
  const locales = {};

  const buildLocale = (postData, contentMarkdown) => {
  const title =
    postData.title ||
    (typeof indexItem === "object" && indexItem?.title) ||
    extractTitle(markdown) ||
    slug ||
    "Untitled Post";
  const date =
    postData.date ||
    (typeof indexItem === "object" && indexItem?.date) ||
    "";
  const tags = toArrayOfStrings(
    postData.tags || (typeof indexItem === "object" && indexItem?.tags) || []
  );
  const year = parsePostYear(date);
  const summary =
    postData.summary ||
    (typeof indexItem === "object" && indexItem?.summary) ||
    summarizeMarkdown(contentMarkdown);
  const rawCoverImages =
    postData.coverImages ||
    (typeof indexItem === "object" && indexItem?.coverImages) ||
    null;
  const coverImages = Array.isArray(rawCoverImages) && rawCoverImages.length > 0
    ? rawCoverImages.map((item) =>
        typeof item === "string"
          ? { src: item, alt: "", caption: "" }
          : { src: String(item.src || item.image || item.url || ""), alt: String(item.alt || item.title || ""), caption: String(item.caption || item.cap || "") }
      ).filter((item) => item.src)
    : null;
  const coverImage =
    (!coverImages && (postData.coverImage ||
    (typeof indexItem === "object" && (indexItem?.coverImage || indexItem?.image)))) ||
    "";
  const artist = String(postData.artist || indexItem?.artist || "").trim();
  const composer = String(postData.composer || indexItem?.composer || "").trim();
  const album = String(postData.album || indexItem?.album || "").trim();
  const instrumentation = toArrayOfStrings(postData.instrumentation || indexItem?.instrumentation || []);
  const genre = toArrayOfStrings(postData.genre || indexItem?.genre || postData.genres || indexItem?.genres || []);
  const mood = toArrayOfStrings(postData.mood || indexItem?.mood || []);
  const keySignature = String(postData.key || postData.keySignature || indexItem?.key || indexItem?.keySignature || "").trim();
  const bpm = String(postData.bpm || indexItem?.bpm || "").trim();
  const tempo = String(postData.tempo || indexItem?.tempo || "").trim();
  const timeSignature = String(postData.timeSignature || postData.meter || indexItem?.timeSignature || indexItem?.meter || "").trim();
  const duration = String(postData.duration || indexItem?.duration || "").trim();
  const trackNumber = String(postData.trackNumber || indexItem?.trackNumber || "").trim();
  const externalLinks = Array.isArray(postData.links)
    ? postData.links
    : Array.isArray(indexItem?.links)
      ? indexItem.links
      : [];
  const audioTracks = normalizeAudioTracks(postData, indexItem);
  const sheetMusic = normalizeSheetMusic(postData, indexItem);
  const markdownOptions = extractMarkdownOptions(contentMarkdown);

  return {
    path,
    slug,
    isMusic,
    title,
    date,
    year,
    tags,
    summary,
    coverImage,
    coverImages,
    artist,
    composer,
    album,
    instrumentation,
    genre,
    mood,
    keySignature,
    bpm,
    tempo,
    timeSignature,
    duration,
    trackNumber,
    externalLinks,
    audioTracks,
    sheetMusic,
    contentHtml: markdownToHtml(removeMarkdownDirectives(contentMarkdown)),
    contentText: removeMarkdownDirectives(contentMarkdown)
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/[#>*_~\-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    justify: markdownOptions.justify || postData?.justify || postData?.textJustify || false,
    headings: extractHeadingsFromMarkdown(removeMarkdownDirectives(contentMarkdown))
  };
  };

  langs.forEach((lang) => {
    const postData = { ...(fallbackMeta || {}), ...(metaByLang[lang] || metaByLang.en || {}) };
    const contentMarkdown = bodies[lang] || bodies.en || fallbackBody;
    locales[lang] = buildLocale(postData, contentMarkdown);
  });

  const resolved = locales[getPreferredLanguage()] || locales.en || buildLocale(fallbackMeta || {}, fallbackBody);

  return {
    path,
    slug,
    isMusic,
    locales,
    ...resolved
  };
}

function createBlogPostsSignature(posts) {
  return posts
    .map(
      (post) =>
        `${post.path}|${post.slug}|${post.title}|${post.date}|${post.tags.join(",")}|${post.coverImage}|${post.summary.slice(0, 80)}|${post.artist || ""}|${post.audioTracks?.length || 0}|${post.sheetMusic?.length || 0}|${post.keySignature || ""}|${post.bpm || ""}`
    )
    .join("||");
}

async function fetchCollectionPosts(directory, normalizePath) {
  const normalizedDirectory = String(directory || "").trim().replace(/^\/+|\/+$/g, "");
  if (!normalizedDirectory) {
    return { posts: [], signature: "" };
  }

  const indexPath = `${normalizedDirectory}/index.json`;
  const directoryPath = `${normalizedDirectory}/`;

  const normalizeManifestEntries = (manifest) =>
    manifest
      .map((entry) => {
        if (typeof entry === "string") {
          return { path: normalizePath(entry) };
        }

        if (entry && typeof entry === "object") {
          return {
            ...entry,
            path: normalizePath(entry.path || entry.file || entry.slug)
          };
        }

        return { path: "" };
      })
      .filter((entry) => Boolean(entry.path));

  const readIndexManifest = async () => {
    try {
      const manifestRaw = await loadMarkdown(indexPath);
      const parsed = JSON.parse(manifestRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const scanPostsDirectory = async () => {
    if (typeof window.DOMParser !== "function") {
      return [];
    }

    const candidates = [directoryPath];

    for (const candidate of candidates) {
      try {
        const response = await fetch(candidate, { cache: "no-store" });
        if (!response.ok) {
          continue;
        }

        const payload = await response.text();
        const discovered = [];

        try {
          const maybeJson = JSON.parse(payload);
          if (Array.isArray(maybeJson)) {
            maybeJson.forEach((entry) => {
              if (typeof entry === "string") {
                discovered.push(normalizePath(entry));
              } else if (entry && typeof entry === "object") {
                discovered.push(normalizePath(entry.path || entry.file || entry.slug || ""));
              }
            });
          }
        } catch {}

        if (!discovered.length) {
          const documentNode = new window.DOMParser().parseFromString(payload, "text/html");
          const links = Array.from(documentNode.querySelectorAll("a[href]"))
            .map((anchor) => String(anchor.getAttribute("href") || "").trim())
            .filter(Boolean);

          links.forEach((href) => {
            const withoutHash = href.split("#")[0].split("?")[0];
            const isAbsolute = /^https?:\/\//i.test(withoutHash);
            const absolutePath = isAbsolute ? new URL(withoutHash, window.location.href).pathname : withoutHash;
            const directMatch = absolutePath.match(new RegExp(`(^|\\/)${normalizedDirectory}\\/[^/]+\\.md$`, "i"));
            if (directMatch) {
              discovered.push(normalizePath(directMatch[0].replace(/^\//, "")));
              return;
            }

            if (/^[^/]+\.md$/i.test(absolutePath)) {
              discovered.push(normalizePath(`${normalizedDirectory}/${absolutePath}`));
            }
          });
        }

        const unique = [...new Set(discovered)].filter((path) => /\.md$/i.test(path));
        if (unique.length) {
          return unique;
        }
      } catch {
        continue;
      }
    }

    return [];
  };

  const [scannedManifest, indexManifest] = await Promise.all([scanPostsDirectory(), readIndexManifest()]);
  const scannedEntries = normalizeManifestEntries(scannedManifest);
  const indexEntries = normalizeManifestEntries(indexManifest);
  const indexByPath = new Map(indexEntries.map((entry) => [entry.path, entry]));
  const baseEntries = scannedEntries.length > 0 ? scannedEntries : indexEntries;

  const entries = baseEntries
    .map((entry) => {
      const fromIndex = indexByPath.get(entry.path) || {};
      return {
        ...fromIndex,
        ...entry,
        path: entry.path
      };
    })
    .filter((entry) => Boolean(entry.path));

  const loadedPosts = await Promise.all(
    entries.map(async (entry) => {
      try {
        const raw = await loadMarkdown(entry.path);
        return parseBlogPost(raw, entry.path, entry);
      } catch {
        return null;
      }
    })
  );

  const posts = loadedPosts.filter(Boolean);
  posts.sort((left, right) => String(right.date || "").localeCompare(String(left.date || "")));

  return {
    posts,
    signature: createBlogPostsSignature(posts)
  };
}

async function fetchBlogPosts() {
  return fetchCollectionPosts("posts", normalizePostPath);
}

async function fetchMusicPosts() {
  return fetchCollectionPosts("music", normalizeMusicPath);
}

function createMarkdownSignature(
  homeRaw,
  projectsRaw,
  experienceRaw,
  resourcesRaw,
  musicRaw,
  blogRaw,
  infoRaw,
  postsSignature = "",
  musicSignature = ""
) {
  return `${homeRaw.length}|${projectsRaw.length}|${experienceRaw.length}|${resourcesRaw.length}|${musicRaw.length}|${blogRaw.length}|${infoRaw.length}|${postsSignature.length}|${musicSignature.length}|${homeRaw.slice(0, 120)}|${projectsRaw.slice(0, 120)}|${experienceRaw.slice(0, 120)}|${resourcesRaw.slice(0, 120)}|${musicRaw.slice(0, 120)}|${blogRaw.slice(0, 120)}|${infoRaw.slice(0, 120)}|${postsSignature.slice(0, 120)}|${musicSignature.slice(0, 120)}`;
}

function initReveal() {
  if (!window.Reveal) {
    return;
  }

  window.Reveal.init();
  revealReady = true;
}

// Markdown is injected after the initial pass, so newly created nodes have to
// be handed to the observer. Reveal.sync() is idempotent for nodes it already
// tracks.
function syncRevealBoxes() {
  if (!window.Reveal) {
    return;
  }

  window.Reveal.sync(document);
}

function ensureRevealReady() {
  if (!window.Reveal || revealReady) {
    return;
  }

  window.Reveal.init();
  revealReady = true;
}

function replayRevealAnimationsInContainer(container) {
  if (!container || !window.Reveal) {
    return;
  }

  window.Reveal.replay(container);
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
    copyButton.textContent = t("btn.copy");
    copyButton.setAttribute("aria-label", "Copy code block");

    copyButton.addEventListener("click", async (event) => {
      if (copyButton.disabled) {
        return;
      }

      copyButton.disabled = true;
      const originalLabel = "copy";

      try {
        await copyTextToClipboard(codeNode.textContent || "");
        copyButton.textContent = t("btn.copied");
        copyButton.classList.add("is-copied");
        showCodeCopyToast("Copied!", event?.clientX, event?.clientY);
      } catch {
        copyButton.textContent = t("btn.failed");
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

function addFootnoteTooltips(container) {
  if (!container) return;
  const fnSection = container.querySelector(".md-footnotes");
  container.querySelectorAll(".md-footnote-ref a[href]").forEach((link) => {
    const targetId = link.getAttribute("href").replace(/^#/, "");
    const fnEl = fnSection ? fnSection.querySelector("#" + CSS.escape(targetId)) : null;
    if (!fnEl) return;
    const text = fnEl.textContent.replace(/↩\s*$/, "").trim();
    if (!text) return;
    const sup = link.closest(".md-footnote-ref") || link.parentElement;
    sup.setAttribute("data-tooltip", text);
    sup.style.cursor = "help";
  });
}

function initCoverflows(container) {
  if (!container) return;
  container.querySelectorAll(".md-coverflow").forEach((coverflow) => {
    if (coverflow.dataset.cfInit) return;
    coverflow.dataset.cfInit = "1";

    const slides = Array.from(coverflow.querySelectorAll(".md-coverflow-slide"));
    const n = slides.length;
    if (n < 2) return;

    let active = 0;

    const ROTATE = 45;   // degrees — matches reference pen's 45° rotateY
    const SPREAD = 65;   // % of slide width per step
    const STACK  = 20;   // extra % push for covers beyond ±1

    const update = () => {
      slides.forEach((slide, i) => {
        let offset = i - active;
        if (offset > n / 2) offset -= n;
        if (offset < -n / 2) offset += n;
        const absOffset = Math.abs(offset);
        slide.classList.toggle("md-coverflow-active", absOffset === 0);
        slide.classList.toggle("md-coverflow-prev", offset < 0);
        slide.classList.toggle("md-coverflow-next", offset > 0);

        let tx, ry;
        if (absOffset === 0) {
          tx = 0; ry = 0;
        } else {
          const sign = offset > 0 ? 1 : -1;
          tx = sign * (SPREAD + Math.max(0, absOffset - 1) * STACK);
          ry = -sign * ROTATE;
        }
        const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.85 : 0.75;
        const zIndex = n + 10 - absOffset;
        const opacity = absOffset > 2 ? 0 : 1;

        slide.style.transform = `translateX(${tx}%) rotateY(${ry}deg) scale(${scale})`;
        slide.style.zIndex = zIndex;
        slide.style.opacity = opacity;
      });
      coverflow.dataset.active = active;
    };

    const track = coverflow.querySelector(".md-coverflow-track");
    track.setAttribute("tabindex", "0");

    coverflow.querySelector(".md-coverflow-prev").addEventListener("click", (e) => {
      e.stopPropagation();
      active = (active - 1 + n) % n;
      update();
    });
    coverflow.querySelector(".md-coverflow-next").addEventListener("click", (e) => {
      e.stopPropagation();
      active = (active + 1) % n;
      update();
    });

    slides.forEach((slide, i) => {
      slide.addEventListener("click", (e) => {
        if (i !== active) { e.stopPropagation(); active = i; update(); }
      });
    });

    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft")  { active = (active - 1 + n) % n; update(); e.preventDefault(); }
      if (e.key === "ArrowRight") { active = (active + 1) % n;     update(); e.preventDefault(); }
    });

    update();
  });
}

function initIpodCoverflows(container) {
  if (!container) return;
  container.querySelectorAll(".md-ipod-coverflow").forEach((cf) => {
    if (cf.dataset.cfIpodInit) return;
    cf.dataset.cfIpodInit = "1";

    const images = Array.from(cf.querySelectorAll(".md-ipod-cf-image"));
    const n = images.length;
    if (n < 1) return;

    // Exact constants from the reference pen (jhnsnc/YyRVNG)
    const NONFOCUS_SPACING = 90;   // px between non-focus covers
    const FOCUS_MARGIN     = 210;  // px from center to first side cover
    const MAX_OPACITY      = 0.5;
    const MAX_SCALE        = 0.5;
    const MIN_SCALE        = 0.2;
    const NUM_VISIBLE      = 3;

    let position = parseInt(cf.dataset.coverflowPosition) || Math.floor(n / 2) + 1;

    const captionEl = cf.querySelector(".md-ipod-cf-caption");

    const update = () => {
      const imageW = images[0] ? (images[0].getBoundingClientRect().width || 400) : 400;
      images.forEach((img) => {
        const idx  = parseInt(img.dataset.coverflowIndex);
        const dist = idx - position;
        const abs  = Math.abs(dist);

        if (abs === 0) {
          img.style.transform  = "translateX(-50%)";
          img.style.zIndex     = String(n + 1);
          img.style.opacity    = "1";
          img.style.boxShadow  = "0 1px 25px 10px rgba(0,0,0,0.6)";
          img.style.cursor     = "default";
          if (captionEl) captionEl.textContent = img.dataset.caption || "";
        } else if (abs <= NUM_VISIBLE) {
          const scale   = ((MAX_SCALE - MIN_SCALE) / (NUM_VISIBLE - 1)) * (NUM_VISIBLE - abs + 1) + MIN_SCALE;
          const opacity = (MAX_OPACITY / NUM_VISIBLE) * (NUM_VISIBLE - abs + 1);
          const tx      = dist < 0
            ? (-NONFOCUS_SPACING * (abs - 1)) - imageW / 2 - FOCUS_MARGIN
            : ( NONFOCUS_SPACING * (abs - 1)) - imageW / 2 + FOCUS_MARGIN;
          const ry      = dist < 0 ? "rotateY(45deg)" : "rotateY(-45deg)";
          img.style.transform  = `translateX(${tx}px) scale(${scale}) ${ry}`;
          img.style.zIndex     = String(n + 1 - abs);
          img.style.opacity    = String(opacity);
          img.style.boxShadow  = "";
          img.style.cursor     = "pointer";
        } else {
          const tx = dist < 0
            ? (-NONFOCUS_SPACING * NUM_VISIBLE) - imageW / 2 - FOCUS_MARGIN
            : ( NONFOCUS_SPACING * NUM_VISIBLE) - imageW / 2 + FOCUS_MARGIN;
          const ry = dist < 0 ? "rotateY(45deg)" : "rotateY(-45deg)";
          img.style.transform  = `translateX(${tx}px) scale(${MIN_SCALE}) ${ry}`;
          img.style.opacity    = "0";
          img.style.zIndex     = "0";
          img.style.cursor     = "pointer";
        }
      });
      cf.dataset.coverflowPosition = String(position);
    };

    cf.querySelector(".md-ipod-cf-prev").addEventListener("click", (e) => {
      e.stopPropagation();
      position = Math.max(1, position - 1);
      update();
    });
    cf.querySelector(".md-ipod-cf-next").addEventListener("click", (e) => {
      e.stopPropagation();
      position = Math.min(n, position + 1);
      update();
    });

    images.forEach((img) => {
      img.addEventListener("click", (e) => {
        const clicked = parseInt(img.dataset.coverflowIndex);
        if (clicked !== position) { e.stopPropagation(); position = clicked; update(); }
      });
    });

    cf.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft")  { position = Math.max(1, position - 1); update(); e.preventDefault(); }
      if (e.key === "ArrowRight") { position = Math.min(n, position + 1); update(); e.preventDefault(); }
    });

    const ro = new ResizeObserver(() => update());
    ro.observe(cf);

    update();
    requestAnimationFrame(() => requestAnimationFrame(update));
  });
}

function createChip(text) {
  const chip = document.createElement("span");
  chip.className = "chip";
  chip.textContent = text;
  return chip;
}

function getLanguageOptions(languageContent) {
  return Object.keys(languageContent || {});
}

const LANGUAGE_PREF_KEY = "portfolio-language";
const SUPPORTED_LANGUAGE_PREFS = ["en", "fr", "it", "ja", "zh", "pl"];

const LANGUAGE_NAMES = {
  en: "English",
  fr: "Français",
  it: "Italiano",
  ja: "日本語",
  zh: "中文",
  de: "Deutsch",
  es: "Español",
  ru: "Русский",
  no: "Norsk",
  la: "Latina",
  gr: "Ελληνικά",
};

function getLanguageDisplayName(language) {
  const normalized = String(language || "").toLowerCase();
  return LANGUAGE_NAMES[normalized] || normalized.toUpperCase();
}

function detectBrowserLanguagePref() {
  try {
    const list = [];
    if (navigator.languages && navigator.languages.length) {
      list.push(...navigator.languages);
    }
    if (navigator.language) list.push(navigator.language);
    for (const candidate of list) {
      const raw = String(candidate || "").toLowerCase().replace(/_/g, "-");
      const base = raw.split("-")[0];
      if (SUPPORTED_LANGUAGE_PREFS.includes(raw)) return raw;
      if (SUPPORTED_LANGUAGE_PREFS.includes(base)) return base;
    }
  } catch (_) {}
  return "";
}

function getPreferredLanguage() {
  if (window.portfolioI18n && typeof window.portfolioI18n.getLang === "function") {
    return window.portfolioI18n.getLang();
  }
  try {
    const v = String(localStorage.getItem(LANGUAGE_PREF_KEY) || "").toLowerCase();
    if (SUPPORTED_LANGUAGE_PREFS.includes(v)) return v;
  } catch (_) {}
  return detectBrowserLanguagePref() || "en";
}

function pickDefaultLanguage(languages) {
  if (!Array.isArray(languages) || !languages.length) return null;
  const pref = getPreferredLanguage();
  if (languages.includes(pref)) return pref;
  if (languages.includes("en")) return "en";
  return languages[0];
}

let applyingPreferredLanguage = false;

function applyLocalizedPageTitles() {
  const keys = ["home", "projects", "experience", "resources", "music", "blog", "post", "info", "releases", "settings", "apps", "textbook-project"];
  keys.forEach((tab) => {
    const translated = t(`title.${tab}`);
    if (translated && translated !== `title.${tab}`) {
      pageTitles[tab] = translated;
    }
  });
}

function refreshLocalizedChrome() {
  const openProjectSnapshot = selectedProject;
  projects = resolveProjectsForLang(getPreferredLanguage());
  experience = resolveExperienceForLang(getPreferredLanguage());
  resources = resolveResourcesForLang(getPreferredLanguage());
  if (openProjectSnapshot) selectedProject = openProjectSnapshot;
  syncSelectedProjectForLanguage();
  applyLocaleToPostList(blogPosts);
  applyLocaleToPostList(musicPosts);
  applyLocalizedPageTitles();
  if (window.portfolioI18n && typeof window.portfolioI18n.apply === "function") {
    window.portfolioI18n.apply(document);
  }
  if (typeof window.__annotateSidebarShortcuts === "function") {
    window.__annotateSidebarShortcuts();
  }
  if (window.siteTheme && typeof window.siteTheme.annotatePerfShortcutHints === "function") {
    window.siteTheme.annotatePerfShortcutHints();
  }
  if (typeof renderProjectsFilters === "function") renderProjectsFilters();
  if (typeof renderExperienceFilters === "function") renderExperienceFilters();
  if (typeof renderResourcesFilters === "function") renderResourcesFilters();
  if (typeof renderBlogFilters === "function") renderBlogFilters();
  if (typeof renderMusicFilters === "function") renderMusicFilters();
  if (typeof renderProjects === "function" && projectsGrid) renderProjects();
  if (typeof renderExperience === "function" && experienceGrid) renderExperience();
  if (typeof renderResources === "function" && resourcesGrid) renderResources();
  if (typeof renderBlog === "function" && blogGrid && blogPostsLoaded) renderBlog();
  if (typeof renderMusic === "function" && musicGrid && musicPostsLoaded) renderMusic();
  syncOpenBlogSurfaces();
  document.querySelectorAll(".view-toggle-wrap").forEach((wrap) => {
    if (typeof wrap._refreshI18n === "function") wrap._refreshI18n();
  });
  if (typeof currentTab === "string" && currentTab) {
    if (currentTab === "home") startHomeTitleRotation();
    else startTitleTypingOnce(pageTitles[currentTab] || currentTab);
  }
}

function setPreferredLanguage(lang) {
  const normalized = String(lang || "").toLowerCase();
  if (!SUPPORTED_LANGUAGE_PREFS.includes(normalized)) return;
  if (applyingPreferredLanguage) return;
  applyingPreferredLanguage = true;
  try {
    if (window.portfolioI18n && typeof window.portfolioI18n.setLang === "function") {
      window.portfolioI18n.setLang(normalized);
    } else {
      try { localStorage.setItem(LANGUAGE_PREF_KEY, normalized); } catch (_) {}
      document.dispatchEvent(new CustomEvent("portfolio:language-change", { detail: { language: normalized } }));
    }

    // Clear per-key selections so existing/future blocks honor the new default
    selectedMarkdownLanguages = {};

    // Re-render every mounted language switcher to the new preference (or its fallback)
    document.querySelectorAll(".home-language-switcher").forEach((switcher) => {
      const shims = Array.from(switcher.querySelectorAll(".home-language-btn"));
      if (!shims.length) return;
      const available = shims.map((b) => b.dataset.lang).filter(Boolean);
      const target = available.includes(normalized) ? normalized : pickDefaultLanguage(available);
      const shim = shims.find((b) => b.dataset.lang === target);
      if (shim) shim.click();
    });

    refreshLocalizedChrome();
  } finally {
    applyingPreferredLanguage = false;
  }
}
window.setPreferredLanguage = setPreferredLanguage;

document.addEventListener("portfolio:language-change", (event) => {
  if (applyingPreferredLanguage) return;
  const next = event?.detail?.language;
  if (next) setPreferredLanguage(next);
});

function getLanguageFlagEmoji(language) {
  const normalized = String(language || "").toLowerCase();
  const flagByLanguage = {
    en: "🇬🇧",
    fr: "🇫🇷",
    zh: "🇨🇳",
    it: "🇮🇹",
    ja: "🇯🇵",
    no: "🇳🇴",
    la: "🇻🇦",
    es: "🇪🇸",
    de: "🇩🇪",
    ru: "🇷🇺",
    gr: "🇬🇷",
  };

  return flagByLanguage[normalized] || "🌐";
}

const LANGUAGE_CONTENT_COLLAPSE_WORDS = 200;
// The home "about me" bio is deliberately short, so it collapses much sooner.
const HOME_COLLAPSE_WORDS = 60;

function countLanguageContentWords(text, language) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  if (!raw) return 0;

  const lang = String(language || "").toLowerCase();
  if (lang === "zh" || lang === "ja") {
    const chars = raw.replace(/[\s\u2000-\u206f\u3000-\u303f\uff00-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/g, "");
    return Math.round(chars.length / 2);
  }

  return raw.split(" ").filter(Boolean).length;
}

function syncLanguageContentCollapse(container) {
  const switcher = container.closest(".home-language-switcher");
  if (!switcher) return;

  if (!container.id) {
    const key = switcher.querySelector("[data-state-key]")?.dataset.stateKey || "language";
    // Several switchers can share a state key, and a duplicated id would make
    // the toggle's aria-controls point at somebody else's box.
    let id = `language-content-${key}`;
    let suffix = 2;
    while (document.getElementById(id)) {
      id = `language-content-${key}-${suffix}`;
      suffix += 1;
    }
    container.id = id;
  }

  const words = countLanguageContentWords(container.textContent, container.getAttribute("lang"));
  const hasInteractiveMedia = Boolean(
    container.querySelector(".md-carousel, .md-ipod-coverflow, .md-coverflow")
  );
  const isHome = container.closest("#home-markdown") !== null;
  const threshold = isHome ? HOME_COLLAPSE_WORDS : LANGUAGE_CONTENT_COLLAPSE_WORDS;
  const needsCollapse = !hasInteractiveMedia && words > threshold;
  let toggle = switcher.querySelector(":scope > .language-content-toggle");

  container.classList.toggle("is-collapsible", needsCollapse);
  container.classList.toggle("is-collapsed", needsCollapse);
  container.classList.remove("is-expanded");

  if (!needsCollapse) {
    if (toggle) toggle.remove();
    return;
  }

  if (!toggle) {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "language-content-toggle";
    toggle.addEventListener("click", () => {
      const expanded = container.classList.contains("is-collapsed");
      container.classList.toggle("is-collapsed", !expanded);
      container.classList.toggle("is-expanded", expanded);
      toggle.textContent = expanded ? t("btn.showLess") : t("btn.showMore");
      toggle.setAttribute("aria-expanded", String(expanded));
    });
    switcher.appendChild(toggle);
  }

  toggle.textContent = t("btn.showMore");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", container.id);
}

function prefersQuietMotion() {
  if (document.documentElement.getAttribute("data-marie-kondo") === "on") return true;
  if (document.documentElement.getAttribute("data-perf-mode") === "on") return true;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function emitHomeProfileSparkles(figure) {
  if (!figure || !figure.isConnected || prefersQuietMotion()) return;

  const rect = figure.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return;

  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const radius = Math.max(rect.width, rect.height) * 0.54;
  const glyphs = ["✦", "✧", "✶", "✹", "✨", "🌟", "💫"];
  const count = 34;

  for (let index = 0; index < count; index += 1) {
    const angle = ((Math.PI * 2 * index) / count) + ((Math.random() - 0.5) * 0.4);
    const startR = radius * (0.7 + Math.random() * 0.22);
    const sparkle = document.createElement("span");
    sparkle.className = "home-profile-sparkle";
    sparkle.setAttribute("aria-hidden", "true");
    sparkle.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];

    const colorRoll = Math.random();
    if (colorRoll < 0.4) sparkle.classList.add("typing-sparkle--gold");
    else if (colorRoll < 0.62) sparkle.classList.add("typing-sparkle--amber");
    else if (colorRoll < 0.8) sparkle.classList.add("typing-sparkle--sky");
    else if (colorRoll < 0.92) sparkle.classList.add("typing-sparkle--mint");
    else sparkle.classList.add("typing-sparkle--rose");

    const dist = 40 + Math.random() * 70;
    sparkle.style.left = `${cx + Math.cos(angle) * startR}px`;
    sparkle.style.top = `${cy + Math.sin(angle) * startR}px`;
    sparkle.style.setProperty("--sparkle-dx", `${Math.cos(angle) * dist}px`);
    sparkle.style.setProperty("--sparkle-dy", `${Math.sin(angle) * dist}px`);
    sparkle.style.setProperty("--sparkle-rot", `${Math.round(Math.random() * 90 - 45)}deg`);
    sparkle.style.setProperty("--sparkle-size", `${(0.55 + Math.random() * 0.75).toFixed(2)}rem`);
    sparkle.style.setProperty("--sparkle-duration", `${Math.round(880 + Math.random() * 720)}ms`);

    sparkle.addEventListener("animationend", () => {
      if (sparkle.parentNode) sparkle.parentNode.removeChild(sparkle);
    });
    document.body.appendChild(sparkle);
  }
}

function playHomeProfileEntrance(root) {
  const figures = (root || document).querySelectorAll(".home-profile");
  figures.forEach((figure) => {
    if (figure.dataset.entranceBound === "1") return;
    figure.dataset.entranceBound = "1";

    const settle = () => figure.classList.add("home-profile--settled");

    const start = () => {
      if (figure.dataset.entrancePlayed === "1" || !figure.isConnected) return;
      figure.dataset.entrancePlayed = "1";
      figure.classList.add("home-profile--enter");
      figure.addEventListener("animationend", settle, { once: true });
      if (prefersQuietMotion()) {
        // Reduced-motion/perf modes kill the keyframes, so animationend never
        // fires; settle immediately instead of waiting for an event that
        // will not arrive.
        settle();
        return;
      }
      // Safety net in case the animation is interrupted before it ends.
      window.setTimeout(settle, 2000);
      window.setTimeout(() => emitHomeProfileSparkles(figure), 160);
      window.setTimeout(() => emitHomeProfileSparkles(figure), 480);
    };

    const rect = figure.getBoundingClientRect();
    const inView = rect.bottom > 40 && rect.top < (window.innerHeight || 0) - 20;
    if (inView || prefersQuietMotion()) {
      start();
      return;
    }

    if (typeof IntersectionObserver !== "function") {
      start();
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        obs.disconnect();
        start();
      }
    }, { threshold: 0.28, rootMargin: "0px 0px -6% 0px" });
    observer.observe(figure);
    window.setTimeout(() => {
      observer.disconnect();
      start();
    }, 2200);
  });
}

function renderLanguageContent(container, languageContent, stateKey, { isInitialRender = false } = {}) {
  const languages = getLanguageOptions(languageContent);
  if (!languages.length) {
    container.innerHTML = "";
    const staleToggle = container.parentElement?.querySelector(":scope > .language-content-toggle");
    if (staleToggle) staleToggle.remove();
    container.classList.remove("is-collapsible", "is-collapsed", "is-expanded");
    return;
  }

  if (!selectedMarkdownLanguages[stateKey] || !languageContent[selectedMarkdownLanguages[stateKey]]) {
    selectedMarkdownLanguages[stateKey] = pickDefaultLanguage(languages);
  }

  const activeLanguage = selectedMarkdownLanguages[stateKey];
  const markdown = languageContent[activeLanguage] || "";
  container.setAttribute("lang", activeLanguage);
  container.innerHTML = markdownToHtml(markdown);
  if (typeof initCoverflows === "function") initCoverflows(container);
  if (typeof initIpodCoverflows === "function") initIpodCoverflows(container);
  if (window.SiteCarousel && typeof window.SiteCarousel.init === "function") {
    window.SiteCarousel.init(container);
  }
  renderMathInContainer(container);
  renderCodeBlocksInContainer(container);
  hydrateLinkPreviewsInContainer(container);
  syncLanguageContentCollapse(container);
  window.requestAnimationFrame(() => {
    playHomeProfileEntrance(container);
  });
  if (!isInitialRender) {
    window.requestAnimationFrame(() => {
      replayRevealAnimationsInContainer(container);
    });
  }
}

// Build a liquid-glass language dropdown. Returns { root, setValue, getValue }.
function createLanguageDropdown(options, initialValue, onChange) {
  const root = document.createElement("div");
  root.className = "lang-dropdown";

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "lang-dropdown-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");

  const triggerFlag = document.createElement("span");
  triggerFlag.className = "lang-dropdown-flag";
  const triggerName = document.createElement("span");
  triggerName.className = "lang-dropdown-name";
  const triggerChevron = document.createElement("span");
  triggerChevron.className = "lang-dropdown-chevron";
  triggerChevron.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5z"/></svg>';

  trigger.append(triggerFlag, triggerName, triggerChevron);

  const menu = document.createElement("div");
  menu.className = "lang-dropdown-menu";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;

  let currentValue = initialValue;
  let isOpen = false;
  let activeIdx = -1;

  function renderTrigger() {
    triggerFlag.textContent = getLanguageFlagEmoji(currentValue);
    triggerName.textContent = `${getLanguageDisplayName(currentValue)}`;
  }

  function renderMenu() {
    menu.innerHTML = "";
    options.forEach((lang, i) => {
      const opt = document.createElement("button");
      opt.type = "button";
      opt.className = "lang-dropdown-option";
      opt.setAttribute("role", "option");
      opt.dataset.lang = lang;
      const isCurrent = lang === currentValue;
      opt.setAttribute("aria-selected", isCurrent ? "true" : "false");
      if (isCurrent) opt.classList.add("is-active");

      const f = document.createElement("span");
      f.className = "lang-dropdown-flag";
      f.textContent = getLanguageFlagEmoji(lang);

      const n = document.createElement("span");
      n.className = "lang-dropdown-name";
      n.textContent = getLanguageDisplayName(lang);

      const check = document.createElement("span");
      check.className = "lang-dropdown-check";
      check.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

      opt.append(f, n, check);

      opt.addEventListener("mouseenter", () => {
        activeIdx = i;
        updateActive();
      });
      opt.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setValue(lang, true);
        close();
      });
      menu.appendChild(opt);
    });
  }

  function updateActive() {
    const items = menu.querySelectorAll(".lang-dropdown-option");
    items.forEach((it, i) => it.classList.toggle("is-hover", i === activeIdx));
  }

  // Detect a clipping/transformed ancestor that would trap an absolutely
  // positioned menu (e.g. the settings popover uses overflow:hidden + transform).
  function hasClippingAncestor() {
    let el = root.parentElement;
    while (el && el !== document.body) {
      const cs = getComputedStyle(el);
      if (
        cs.overflow === "hidden" || cs.overflowY === "hidden" || cs.overflowX === "hidden" ||
        cs.overflow === "auto" || cs.overflowY === "auto" || cs.overflowX === "auto" ||
        cs.transform !== "none" || cs.filter !== "none" || cs.perspective !== "none"
      ) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  let portaled = false;
  let originalParent = null;
  let originalNext = null;

  function positionMenu() {
    if (!portaled) return;
    const r = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw <= 480;
    const margin = 8;

    menu.style.minWidth = `${Math.max(r.width, isMobile ? Math.min(240, vw - margin * 2) : 192)}px`;

    // Decide vertical placement based on raw available space (not menu height,
    // which can be misleading before max-height is applied).
    const spaceBelow = vh - r.bottom - margin - 8;
    const spaceAbove = r.top - margin - 8;
    const placeAbove = spaceBelow < 180 && spaceAbove > spaceBelow;

    if (placeAbove) {
      const maxH = Math.max(160, spaceAbove);
      menu.style.maxHeight = `${maxH}px`;
      const menuH = Math.min(menu.scrollHeight, maxH);
      menu.style.top = `${Math.max(margin, r.top - menuH - 8)}px`;
      menu.style.transformOrigin = "bottom right";
    } else {
      menu.style.maxHeight = `${Math.max(160, spaceBelow)}px`;
      menu.style.top = `${r.bottom + 8}px`;
      menu.style.transformOrigin = "top right";
    }

    // Horizontal: align right edge to trigger right, clamped to viewport.
    const menuW = menu.offsetWidth || 192;
    let right = Math.max(margin, vw - r.right);
    // Ensure menu doesn't overflow left edge
    if (vw - right - menuW < margin) {
      right = Math.max(margin, vw - menuW - margin);
    }
    menu.style.right = `${right}px`;
    menu.style.left = "auto";
  }

  function portalOut() {
    if (portaled) return;
    originalParent = menu.parentNode;
    originalNext = menu.nextSibling;
    menu.classList.add("lang-dropdown-menu--portaled");
    menu.style.position = "fixed";
    menu.style.zIndex = "2147483645";
    document.body.appendChild(menu);
    portaled = true;
  }

  function portalIn() {
    if (!portaled) return;
    menu.classList.remove("lang-dropdown-menu--portaled");
    menu.style.position = "";
    menu.style.top = "";
    menu.style.right = "";
    menu.style.left = "";
    menu.style.minWidth = "";
    menu.style.maxHeight = "";
    menu.style.transformOrigin = "";
    menu.style.zIndex = "";
    if (originalParent) {
      originalParent.insertBefore(menu, originalNext || null);
    }
    portaled = false;
    originalParent = null;
    originalNext = null;
  }

  function open() {
    if (isOpen) return;
    renderMenu();
    menu.hidden = false;
    if (hasClippingAncestor()) {
      portalOut();
      // Render once hidden so we can measure, then position before showing
      requestAnimationFrame(() => {
        positionMenu();
        root.classList.add("is-open");
        menu.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      });
    } else {
      requestAnimationFrame(() => {
        root.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
      });
    }
    activeIdx = options.indexOf(currentValue);
    updateActive();
    isOpen = true;
    document.addEventListener("click", onDocClick, true);
    document.addEventListener("keydown", onKeydown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
  }

  function onReposition() {
    if (portaled) positionMenu();
  }

  function close() {
    if (!isOpen) return;
    root.classList.remove("is-open");
    menu.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    isOpen = false;
    document.removeEventListener("click", onDocClick, true);
    document.removeEventListener("keydown", onKeydown);
    window.removeEventListener("resize", onReposition);
    window.removeEventListener("scroll", onReposition, true);
    const wasPortaled = portaled;
    setTimeout(() => {
      if (!isOpen) {
        menu.hidden = true;
        if (wasPortaled) portalIn();
      }
    }, 220);
  }

  function onDocClick(e) {
    if (root.contains(e.target)) return;
    if (menu.contains(e.target)) return;
    close();
  }

  function onKeydown(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); trigger.focus(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIdx = Math.min(options.length - 1, activeIdx + 1);
      updateActive();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIdx = Math.max(0, activeIdx - 1);
      updateActive();
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (activeIdx >= 0 && options[activeIdx]) {
        setValue(options[activeIdx], true);
        close();
      }
    }
  }

  function setValue(lang, fire) {
    if (!options.includes(lang)) return;
    currentValue = lang;
    renderTrigger();
    if (!menu.hidden) renderMenu();
    if (fire && typeof onChange === "function") onChange(lang);
  }

  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen) close();
    else open();
  });

  root.append(trigger, menu);
  renderTrigger();

  return {
    root,
    setValue: (v) => setValue(v, false),
    getValue: () => currentValue,
  };
}

function languageContentHasVisibleMarkdown(languageContent) {
  return Object.values(languageContent || {}).some((md) => String(md || "").trim().length > 0);
}

function mountLanguageSwitcher(markdownContainer, languageContent, { hidePill = false, borderless = false } = {}) {
  const stateKey = markdownContainer.id || "default";
  const languages = getLanguageOptions(languageContent);
  if (!languages.length) {
    return;
  }
  if (hidePill && !languageContentHasVisibleMarkdown(languageContent)) {
    return;
  }

  if (!selectedMarkdownLanguages[stateKey] || !languageContent[selectedMarkdownLanguages[stateKey]]) {
    selectedMarkdownLanguages[stateKey] = pickDefaultLanguage(languages);
  }

  const anchorHeading =
    markdownContainer.querySelector("h3") ||
    markdownContainer.querySelector("h2") ||
    markdownContainer.firstElementChild;
  if (!anchorHeading) {
    return;
  }

  const switcher = document.createElement("div");
  switcher.className = "home-language-switcher";
  if (hidePill) switcher.classList.add("is-pill-hidden");
  if (borderless) switcher.classList.add("is-borderless");

  const header = document.createElement("div");
  header.className = "home-language-header";

  const content = document.createElement("div");
  content.className = "home-language-content markdown-content";

  const dropdown = createLanguageDropdown(
    languages,
    selectedMarkdownLanguages[stateKey],
    (next) => {
      selectedMarkdownLanguages[stateKey] = next;
      renderLanguageContent(content, languageContent, stateKey);
      setPreferredLanguage(next);
    }
  );
  // Keep the dataset.lang convention so setPreferredLanguage() can still find these
  dropdown.root.dataset.stateKey = stateKey;
  dropdown.root.classList.add("home-language-dropdown");
  // Backwards-compat shim: expose hidden .home-language-btn nodes so
  // setPreferredLanguage()'s `.home-language-btn` discovery keeps working.
  languages.forEach((lang) => {
    const shim = document.createElement("button");
    shim.type = "button";
    shim.className = "home-language-btn home-language-btn--hidden";
    shim.dataset.lang = lang;
    shim.style.display = "none";
    shim.addEventListener("click", (e) => {
      e.preventDefault();
      dropdown.setValue(lang);
      selectedMarkdownLanguages[stateKey] = lang;
      renderLanguageContent(content, languageContent, stateKey);
    });
    switcher.appendChild(shim);
  });

  if (!hidePill) {
    header.appendChild(dropdown.root);
    switcher.appendChild(header);
  }
  switcher.appendChild(content);

  const slot = markdownContainer.querySelector(".language-switcher-slot");
  if (slot) {
    slot.replaceWith(switcher);
  } else {
    anchorHeading.insertAdjacentElement("afterend", switcher);
  }
  renderLanguageContent(content, languageContent, stateKey, { isInitialRender: true });
}

const INFO_PLATFORM_ICONS = {
  "wikidata.org": "img:assets/icons/wikidata.svg",
  "scholar.google.com": '<path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/>',
  "orcid.org": '<path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z"/>',
  "instagram.com": '<path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.9A3.85 3.85 0 0 0 3.9 7.75v8.5A3.85 3.85 0 0 0 7.75 20.1h8.5a3.85 3.85 0 0 0 3.85-3.85v-8.5a3.85 3.85 0 0 0-3.85-3.85h-8.5Zm9.03 1.45a1.18 1.18 0 1 1 0 2.36 1.18 1.18 0 0 1 0-2.36ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.9A3.1 3.1 0 1 0 12 15.1 3.1 3.1 0 0 0 12 8.9Z"/>',
  "linkedin.com": '<path d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.978 0 1.778-.773 1.778-1.729V1.729C24 .774 23.2 0 22.225 0ZM7.119 20.452H3.555V9h3.564v11.452ZM5.337 7.433a2.065 2.065 0 1 1 0-4.129 2.065 2.065 0 0 1 0 4.129ZM20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286Z"/>',
  "soundcloud.com": '<path d="M9.2 8.6c.34 0 .62.28.62.62v6.98a.62.62 0 1 1-1.24 0V9.22c0-.34.28-.62.62-.62Zm-2.08.95c.34 0 .62.28.62.62v6.03a.62.62 0 1 1-1.24 0v-6.03c0-.34.28-.62.62-.62Zm-2.08 1.3c.34 0 .62.28.62.62v4.73a.62.62 0 1 1-1.24 0v-4.73c0-.34.28-.62.62-.62Zm-2.08 1.65c.34 0 .62.28.62.62v3.08a.62.62 0 1 1-1.24 0v-3.08c0-.34.28-.62.62-.62Zm9.04 3.8h7.07a2.14 2.14 0 0 0 .34-4.26 3.56 3.56 0 0 0-3.31-2.25 3.6 3.6 0 0 0-1.62.39A4.4 4.4 0 0 0 11.99 8a.62.62 0 1 0 0 8.26Z"/>',
  "x.com": '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>',
  "twitter.com": '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>',
  "spotify.com": '<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>',
  "last.fm": '<path d="M10.599 17.211l-.881-2.393s-1.433 1.596-3.579 1.596c-1.9 0-3.249-1.652-3.249-4.296 0-3.381 1.7-4.596 3.366-4.596 2.41 0 3.181 1.564 3.842 3.564l.88 2.761c.88 2.761 2.541 4.982 7.322 4.982 3.424 0 5.741-1.047 5.741-3.808 0-2.232-1.276-3.384-3.644-3.943l-1.762-.385c-1.219-.275-1.578-.771-1.578-1.596 0-.936.736-1.486 1.942-1.486 1.317 0 2.024.496 2.134 1.68l2.739-.33C23.467 7.147 22.085 6 19.483 6c-2.547 0-4.848 1.156-4.848 4.067 0 1.928.935 3.149 3.284 3.726l1.87.44c1.373.33 1.813.908 1.813 1.706 0 1.018-.99 1.43-2.876 1.43-2.794 0-3.954-1.485-4.628-3.541l-.907-2.761C12.444 8.203 10.985 6 7.065 6 3.14 6 0 8.561 0 12.2c0 3.52 1.997 6.347 6.226 6.347 3.229 0 4.373-1.336 4.373-1.336z"/>',
  "strava.com": '<path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>',
  "email": '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>',
  "facebook.com": '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>',
  "github.com": '<path d="M12 0C5.373 0 0 5.373 0 12a12 12 0 0 0 8.207 11.387c.6.111.793-.261.793-.577v-2.234c-3.338.727-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.808 1.305 3.493.998.107-.776.418-1.305.762-1.604-2.665-.304-5.467-1.334-5.467-5.93 0-1.31.469-2.381 1.236-3.221-.124-.304-.535-1.525.117-3.177 0 0 1.008-.322 3.301 1.23A11.52 11.52 0 0 1 12 5.8c1.02.005 2.047.138 3.006.404 2.292-1.552 3.3-1.23 3.3-1.23.653 1.653.242 2.874.118 3.177.768.84 1.236 1.91 1.236 3.22 0 4.609-2.806 5.626-5.479 5.922.43.372.823 1.102.823 2.222v3.293c0 .319.192.688.801.576A12.004 12.004 0 0 0 24 12c0-6.627-5.373-12-12-12Z"/>',
  "kaggle.com": '<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.33 17.165l-3.847-4.032-1.074 1.03v3.002H5.533V6.835H7.41v5.21l4.58-5.21h2.259l-4.047 4.554 4.424 4.646c-.77.21-1.54.11-2.296.13zm5.91.67c-.73.205-1.474.205-2.204 0l-2.03-5.543 2.03-2.376 2.204 7.919z"/>',
  "leetcode.com": '<path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z"/>',
  "dafont.com": '<path d="M9 4v3h4v12h3V7h4V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/>',
  "musescore.com": "img:assets/icons/musescore.png",
  "youtube.com": '<path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>',
  "mastodon.social": '<path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"/>',
  "duolingo.com": '<path d="M14.484 18.213c1.142 1.033 2.657 1.662 4.316 1.662l.294-.001c1.985-.038 3.749-.976 4.905-2.422v1.98c0 2.522-2.043 4.568-4.567 4.568H4.569C2.045 23.998.002 21.954.002 19.43v-1.92c1.181 1.443 2.976 2.365 4.985 2.365l.35-.001c1.61-.027 3.076-.646 4.191-1.648.555.764 1.456 1.26 2.473 1.26 1.023 0 1.928-.502 2.483-1.273zm-5.349-.996c-.989 1.022-2.375 1.658-3.909 1.658h-.239c-2.229 0-4.146-1.343-4.987-3.262v-7.16c.281-.64.68-1.216 1.169-1.699-.035-.731.132-1.469.511-2.128.256-.44.867-.504 1.21-.124l.766.851c.007-.003.014-.003.021-.005-.098-.78.037-1.587.419-2.308.24-.45.757-.53 1.114-.164 0 0 3.939 3.979 4.035 4.084 1.542 1.348 4.066 1.287 5.686-.18.002-.003.007-.005.009-.007.042-.042 3.855-3.9 3.855-3.9.3361-.3451.8619-.3101 1.113.164.385.724.518 1.535.417 2.32.002.001.003.001.004.002l.007.002c.001 0 .002 0 .003.001l.776-.86c.342-.38.954-.316 1.207.124.387.673.553 1.427.509 2.173.496.501.897 1.099 1.169 1.762v6.941c-.816 1.978-2.761 3.373-5.032 3.373H18.8c-1.547 0-2.945-.648-3.936-1.686a.8386.8386 0 0 0-.009-.067c.313-.017.528-.162.688-.33.152-.16.299-.397.299-.776 0 0-.022-.312-.024-.324.693.767 1.696 1.249 2.811 1.249 2.092 0 3.787-1.696 3.787-3.787v-2.243c0-2.092-1.697-3.787-3.787-3.787-2.093 0-3.787 1.695-3.787 3.787v2.243c0 .266.027.526.079.776-.712-.784-1.744-1.278-2.842-1.278-1.239 0-2.339.523-3.064 1.355.063-.274.097-.56.097-.853v-2.243c0-2.092-1.697-3.787-3.788-3.787-2.09 0-3.787 1.695-3.787 3.787v2.243c0 2.093 1.697 3.787 3.787 3.787 1.151 0 2.182-.513 2.876-1.322-.008.035-.039.395-.039.395 0 .378.147.616.298.775.16.168.374.312.688.331a.7783.7783 0 0 0-.012.097zm.997.073c.729.131 1.733.305 1.792.305h.157c.059 0 1.789-.303 1.789-.303-.327.705-1.041 1.194-1.869 1.194-.829 0-1.543-.49-1.869-1.196zm-.971-1.379c.246-1.313 1.462-2.259 2.918-2.259 1.324 0 2.521.97 2.763 2.259v.105c0 .082-.029.115-.103.106l-2.658.473h-.157l-2.66-.476c-.075.01-.103-.023-.103-.105Zm8.023-6.392c.255-.14.549-.22.861-.22.992 0 1.798.804 1.798 1.798v1.919c0 .991-.804 1.797-1.798 1.797-.991 0-1.797-.803-1.797-1.797v-1.542c.034.003.068.005.103.005.64 0 1.16-.518 1.16-1.156 0-.312-.125-.596-.327-.804zM5.162 9.461c.227-.104.48-.162.746-.162.991 0 1.798.804 1.798 1.798v1.919c0 .991-.804 1.797-1.798 1.797-.991 0-1.797-.803-1.797-1.797v-1.571c.089.022.182.034.278.034.641 0 1.16-.518 1.16-1.156 0-.342-.149-.65-.387-.862ZM.002 6.554V4.568C.002 2.044 2.045 0 4.569 0h14.865c2.522 0 4.565 2.044 4.565 4.568v2.041a5.1847 5.1847 0 0 0-.164-.197 4.8592 4.8592 0 0 0-.646-2.284c-.433-.754-1.315-1.037-2.07-.786a4.785 4.785 0 0 0-.327-.774h-.001c-.287-.54-.758-.835-1.248-.908-.493-.073-1.033.072-1.464.515l-3.82 3.864c-1.226 1.11-3.127 1.199-4.313.205-.103-.109-4.025-4.071-4.025-4.071-.427-.438-.966-.584-1.46-.51-.489.073-.961.367-1.248.907v.002c-.133.25-.241.508-.327.771-.753-.252-1.635.029-2.071.782 0 0-.001.001-.001.002-.4.694-.613 1.459-.645 2.23-.057.065-.113.13-.167.197z"/>',
  "flickr.com": '<path d="M5.334 6.666C2.3884 6.666 0 9.055 0 12c0 2.9456 2.3884 5.334 5.334 5.334 2.9456 0 5.332-2.3884 5.332-5.334 0-2.945-2.3864-5.334-5.332-5.334zm13.332 0c-2.9456 0-5.332 2.389-5.332 5.334 0 2.9456 2.3864 5.334 5.332 5.334C21.6116 17.334 24 14.9456 24 12c0-2.945-2.3884-5.334-5.334-5.334Z"/>',
  "komoot.com": '<path d="M9.8 14.829l2.2-3.43 2.2 3.43 5.962 5.962A11.946 11.946 0 0 1 12 24c-3.043 0-5.935-1.14-8.162-3.209zM0 12C0 5.385 5.385 0 12 0c6.62 0 12 5.385 12 12 0 2.663-.855 5.175-2.469 7.284l-6.018-6.018c.15-.412.226-.839.226-1.27A3.743 3.743 0 0 0 12 8.257a3.743 3.743 0 0 0-3.739 3.739c0 .431.075.858.226 1.27l-6.018 6.018A11.865 11.865 0 0 1 0 12Z"/>',
  "quizlet.com": '<path d="M12.779.025a11.789 11.789 0 0 0-5.338.896A11.829 11.829 0 0 0 3.058 4.11 11.928 11.928 0 0 0 .427 14.363a11.92 11.92 0 0 0 2.3 4.921 11.842 11.842 0 0 0 4.24 3.378 11.783 11.783 0 0 0 10.533-.226.327.327 0 0 1 .331.018 9.136 9.136 0 0 0 5.197 1.545.332.332 0 0 0 .332-.332v-4.038a.334.334 0 0 0-.276-.331 4.732 4.732 0 0 1-1.106-.319.329.329 0 0 1-.191-.352.33.33 0 0 1 .05-.133 11.943 11.943 0 0 0 .772-11.871 11.87 11.87 0 0 0-4.042-4.628A11.793 11.793 0 0 0 12.765.018l.013.007h.001ZM4.843 11.898a7.24 7.24 0 0 1 1.205-4.005 7.18 7.18 0 0 1 3.215-2.657 7.133 7.133 0 0 1 7.815 1.558 7.239 7.239 0 0 1 1.555 7.854 7.202 7.202 0 0 1-2.643 3.234 7.147 7.147 0 0 1-9.049-.896 7.228 7.228 0 0 1-2.103-5.089l.005.001Z"/>',
  "noteflight.com": "img:assets/icons/noteflight.png",
  "substack.com": '<path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>',
  "revolut.me": '<path d="M20.9133 6.9566C20.9133 3.1208 17.7898 0 13.9503 0H2.424v3.8605h10.9782c1.7376 0 3.177 1.3651 3.2087 3.043.016.84-.2994 1.633-.8878 2.2324-.5886.5998-1.375.9303-2.2144.9303H9.2322a.2756.2756 0 0 0-.2755.2752v3.431c0 .0585.018.1142.052.1612L16.2646 24h5.3114l-7.2727-10.094c3.6625-.1838 6.61-3.2612 6.61-6.9494zM6.8943 5.9229H2.424V24h4.4704z"/>',
  "snapchat.com": '<path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/>',
  "t.me": '<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>',
  "proton.me": '<path d="M2.474 17.75V24h4.401v-5.979c0-.582.232-1.14.645-1.551a2.204 2.204 0 0 1 1.556-.643h4.513a7.955 7.955 0 0 0 5.612-2.318 7.907 7.907 0 0 0 2.325-5.595 7.91 7.91 0 0 0-2.325-5.596A7.958 7.958 0 0 0 13.587 0H2.474v7.812h4.401V4.129h6.416c.995 0 1.951.394 2.656 1.097.704.7 1.1 1.653 1.101 2.646a3.742 3.742 0 0 1-1.101 2.648 3.766 3.766 0 0 1-2.656 1.097H8.627a6.158 6.158 0 0 0-4.352 1.795 6.133 6.133 0 0 0-1.801 4.338Z"/>',
  "pinterest.com": '<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>',
  "messenger.com": '<path d="M12 0C5.24 0 0 4.952 0 11.64c0 3.499 1.434 6.521 3.769 8.61a.96.96 0 0 1 .323.683l.065 2.135a.96.96 0 0 0 1.347.85l2.381-1.053a.96.96 0 0 1 .641-.046A13 13 0 0 0 12 23.28c6.76 0 12-4.952 12-11.64S18.76 0 12 0m6.806 7.44c.522-.03.971.567.63 1.094l-4.178 6.457a.707.707 0 0 1-.977.208l-3.87-2.504a.44.44 0 0 0-.49.007l-4.363 3.01c-.637.438-1.415-.317-.995-.966l4.179-6.457a.706.706 0 0 1 .977-.21l3.87 2.505c.15.097.344.094.491-.007l4.362-3.008a.7.7 0 0 1 .364-.13"/>',
  "quora.com": '<path d="M7.3799.9483A11.9628 11.9628 0 0 1 21.248 19.5397l2.4096 2.4225c.7322.7362.21 1.9905-.8272 1.9905l-10.7105.01a12.52 12.52 0 0 1-.304 0h-.02A11.9628 11.9628 0 0 1 7.3818.9503Zm7.3217 4.428a7.1717 7.1717 0 1 0-5.4873 13.2512 7.1717 7.1717 0 0 0 5.4883-13.2511Z"/>',
  "discord.com": '<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>',
  "threads.net": '<path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"/>',
  "threads.com": '<path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"/>',
  "reddit.com": '<path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z"/>',
  "meet.google.com": '<path d="M5.53 2.13 0 7.75h5.53zm.398 0v5.62h7.608v3.65l5.47-4.45c-.014-1.22.031-2.25-.025-3.46-.148-1.09-1.287-1.47-2.236-1.36zM23.1 4.32c-.802.295-1.358.995-2.047 1.49-2.506 2.05-4.982 4.12-7.468 6.19 3.025 2.59 6.04 5.18 9.065 7.76 1.218.671 1.428-.814 1.328-1.64v-13a.828.828 0 0 0-.877-.825zM.038 8.15v7.7h5.53v-7.7zm13.577 8.1H6.008v5.62c3.864-.006 7.737.011 11.58-.009 1.02-.07 1.618-1.12 1.468-2.07v-2.51l-5.47-4.68v3.65zm-13.577 0c.02 1.44-.041 2.88.033 4.31.162.948 1.158 1.43 2.047 1.31h3.464v-5.62z"/>',
  "calendar.app.google": '<path d="M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z"/>',
  "paypal.me": '<path d="M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z"/>',
  "wa.me": '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>',
  "gitlab.com": '<path d="M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.386 9.453.044 13.588a.924.924 0 0 0 .331 1.023L12 23.054l11.625-8.443a.924.924 0 0 0 .33-1.024z"/>',
  "coursera.org": '<path d="M11.976 0C5.992 0 .942 4.2.078 9.9c-.012.072-.012.144-.018.216-.042.612-.06 1.23-.06 1.854 0 6.624 5.376 11.994 12 11.994 2.148 0 4.164-.567 5.892-1.557L15.87 18.3a7.166 7.166 0 0 1-3.894 1.152c-3.96 0-7.17-3.21-7.17-7.17a7.17 7.17 0 0 1 7.17-7.17c1.992 0 3.792.81 5.094 2.118l2.022-4.122A11.947 11.947 0 0 0 11.976 0zm8.004 5.304l-3.006 6.132a3.594 3.594 0 0 1 .03.444c0 1.986-1.608 3.594-3.594 3.594-1.986 0-3.594-1.608-3.594-3.594C9.816 9.894 11.424 8.286 13.41 8.286c.24 0 .474.024.702.072l2.652-5.406a11.928 11.928 0 0 1 3.216 2.352z"/>',
  "hackerrank.com": '<path d="M12 0c1.285 0 9.75 4.886 10.392 6 .645 1.115.645 10.885 0 12-.642 1.115-9.107 6-10.392 6-1.284 0-9.75-4.885-10.392-6C.963 16.885.963 7.115 1.608 6 2.25 4.886 10.715 0 12 0zm2.295 6.799c-.141 0-.254.097-.254.18l-.004.315c0 .083-.077.153-.171.178a5.087 5.087 0 0 0-1.831.934c-.072.064-.171.032-.171-.043v-.304c0-.087-.107-.18-.254-.18H9.9c-.141 0-.254.097-.254.18v10.018c0 .087.107.18.254.18h1.714c.142 0 .256-.093.256-.18v-4.117c0-.073.09-.128.176-.108a5.084 5.084 0 0 0 1.814.004c.086-.02.176.034.176.107v4.111c0 .087.107.18.254.18h1.714c.142 0 .256-.093.256-.18V6.979c0-.087-.107-.18-.256-.18zM12 9.075a2.924 2.924 0 1 1-.001 5.847A2.924 2.924 0 0 1 12 9.075z"/>',
  "codepen.io": '<path d="M24 8.182l-.018-.087-.017-.05c-.01-.024-.018-.05-.03-.075-.003-.018-.015-.034-.02-.05l-.035-.067-.03-.05-.044-.06-.046-.045-.06-.045-.046-.03-.06-.044-.044-.04-.015-.02L12.58.19c-.347-.232-.796-.232-1.142 0L.453 7.502l-.015.015-.044.035-.06.05-.038.04-.05.056-.037.045-.05.06c-.02.017-.03.03-.03.046l-.05.06-.02.06c-.02.017-.02.038-.04.056v.036l-.015.067v.07l-.008.05v.02l-.002 12.378v.02l.015.064v.068l.02.055.02.06.02.05.02.06.04.05.04.06.02.03.04.04.054.06.04.04.046.04.06.044.04.04.06.04.044.035.06.03.07.038.07.02h.008l.01.01 11.057 6.815c.174.107.368.16.562.16s.387-.053.561-.16l11.058-6.815.014-.012.037-.01.063-.034.05-.03.07-.04.04-.04.06-.04.044-.035.06-.04.04-.036.04-.045.063-.06.04-.04.04-.05.04-.06.02-.05.02-.06.015-.07v-.068l.015-.065v-.02zm-10.29 5.408v6.71l-8.893-5.48 3.896-2.428 4.997 1.198zm.86-1.29l-5.005-1.207 5.005-3.12 5.005 3.12-5.005 1.207zm-6.72-.288l-5.005 3.12V10.3l5.005 3.12zm6.72-8.49l8.893 5.48-3.896 2.428-4.997-1.198zm-1.73 0L7.84 9.72l-3.896-2.43 8.893-5.48zm-8.584 9.508l3.896-2.43 4.998 1.2v6.71l-8.894-5.48zm15.174 0l5.005 3.12-8.894 5.48v-6.71l3.889-2.43 4.997 1.198z"/>',
  "goodreads.com": '<path d="M17.346.026c.422-.083.859.037 1.179.325.346.284.55.705.557 1.153-.023.457-.247.88-.612 1.156l-2.182 1.748a.601.601 0 0 0-.255.43.52.52 0 0 0 .11.424 5.886 5.886 0 0 1 .832 6.58c-1.394 2.79-4.503 3.99-7.501 2.927a.792.792 0 0 0-.499-.01c-.224.07-.303.18-.453.383l-.014.02-.941 1.254s-.792.985.457.935c3.027-.119 3.817-.119 5.439-.01 2.641.18 3.806 1.903 3.806 3.275 0 1.623-1.036 3.383-3.809 3.383a117.46 117.46 0 0 0-5.517-.03c-.31.005-.597.013-.835.02-.228.006-.41.011-.52.011-.712 0-1.648-.186-1.66-1.068-.008-.729.624-1.12 1.11-1.172.43-.045.815.007 1.24.064.252.034.518.07.815.088.185.011.366.025.552.038.53.038 1.102.08 1.926.087.427.005.759.01 1.025.015.695.012.941.016 1.28-.015 1.248-.112 1.832-.61 1.832-1.376 0-.805-.584-1.264-1.698-1.414-1.564-.213-2.33-.163-3.72-.074a87.66 87.66 0 0 1-1.669.095c-.608.029-2.449.026-2.682-1.492-.053-.416-.073-1.116.807-2.325l.75-1.003c.36-.49.582-.898.053-1.559 0 0-.39-.468-.52-.638-1.215-1.587-1.512-4.08-.448-6.114 1.577-3.011 5.4-4.26 8.37-2.581.253.143.438.203.655.163.201-.032.27-.167.363-.344.02-.04.042-.082.067-.126.004-.01.241-.465.535-1.028l.734-1.41a1.493 1.493 0 0 1 1.041-.785ZM9.193 13.243c1.854.903 3.912.208 5.254-2.47 1.352-2.699.827-5.11-1.041-6.023C10.918 3.537 8.81 5.831 8.017 7.41c-1.355 2.698-.717 4.886 1.147 5.818Z"/>',
  "facetime": '<path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/>'
};

function getInfoPlatformIcon(href) {
  if (!href) return "";
  if (href.startsWith("mailto:")) return INFO_PLATFORM_ICONS["email"] || "";
  try {
    const host = new URL(href).hostname.replace(/^www\./, "").toLowerCase();
    if (INFO_PLATFORM_ICONS[host]) return INFO_PLATFORM_ICONS[host];
    for (const [key, val] of Object.entries(INFO_PLATFORM_ICONS)) {
      if (host.includes(key)) return val;
    }
  } catch {}
  return "";
}

const INFO_LABEL_ICONS = {
  "meet": "meet.google.com",
  "calendar": "calendar.app.google",
  "facetime": "facetime",
};

function enhanceInfoPage() {
  if (!infoMarkdown) return;
  infoMarkdown.querySelectorAll("li").forEach((li) => {
    const a = li.querySelector("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    const label = a.textContent.trim();
    const target = a.getAttribute("target");
    const rel = a.getAttribute("rel");
    const labelKey = label.toLowerCase();
    const iconPath = getInfoPlatformIcon(href) || INFO_PLATFORM_ICONS[INFO_LABEL_ICONS[labelKey]] || "";

    const newA = document.createElement("a");
    newA.href = href;
    if (target) newA.target = target;
    if (rel) newA.rel = rel;

    if (iconPath) {
      if (iconPath.startsWith("img:")) {
        const img = document.createElement("img");
        img.setAttribute("class", "info-icon");
        img.setAttribute("src", iconPath.slice(4));
        img.setAttribute("aria-hidden", "true");
        img.setAttribute("alt", "");
        img.setAttribute("data-reveal-skip", "");
        newA.appendChild(img);
      } else {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "info-icon");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("aria-hidden", "true");
        svg.innerHTML = iconPath;
        newA.appendChild(svg);
      }
    }

    const span = document.createElement("span");
    span.textContent = label;
    newA.appendChild(span);

    while (li.firstChild) li.removeChild(li.firstChild);
    li.appendChild(newA);
  });
}

function renderMarkdownSection(rawMarkdown, targetContainer, fallbackMarkdown = "") {
  const bodyMarkdownRaw = removeFirstHeading(rawMarkdown);
  const splitParts =
    window.portfolioI18n && typeof window.portfolioI18n.splitMarkdownByLanguageContent === "function"
      ? window.portfolioI18n.splitMarkdownByLanguageContent(bodyMarkdownRaw)
      : [{ type: "md", raw: bodyMarkdownRaw }];
  const parts = splitParts.map((part) => {
    if (part.type === "lang") {
      const content = parseLanguageContentFromRaw(part.raw);
      Object.keys(content).forEach((lang) => {
        content[lang] = removeDataBlocks(content[lang] || "").trim();
      });
      return { type: "lang", content, hide: !!part.hide, borderless: !!part.borderless };
    }
    return part;
  });

  const langParts = parts.filter((part) => {
    if (part.type !== "lang" || !Object.keys(part.content || {}).length) return false;
    if (part.hide && !languageContentHasVisibleMarkdown(part.content)) return false;
    return true;
  });
  if (langParts.length) {
    const htmlChunks = parts.map((part, index) => {
      if (part.type === "lang") {
        if (part.hide && !languageContentHasVisibleMarkdown(part.content)) return "";
        return `<div class="language-switcher-slot" data-lang-slot="${index}"></div>`;
      }
      return markdownToHtml(removeMarkdownDirectives(removeDataBlocks(part.raw)).trim());
    }).filter(Boolean);
    targetContainer.innerHTML = htmlChunks.join("\n");

    parts.forEach((part, index) => {
      if (part.type !== "lang") return;
      if (part.hide && !languageContentHasVisibleMarkdown(part.content)) return;
      const slot = targetContainer.querySelector(`[data-lang-slot="${index}"]`);
      if (!slot) return;
      const originalId = targetContainer.id;
      if (langParts.length > 1) {
        targetContainer.id = `${originalId || "markdown"}-lang-${index}`;
      }
      try {
        mountLanguageSwitcher(targetContainer, part.content, {
          hidePill: !!part.hide,
          borderless: !!part.borderless,
        });
      } finally {
        if (langParts.length > 1) {
          targetContainer.id = originalId;
        }
      }
    });
  } else {
    const bodyMarkdown = removeDataBlocks(bodyMarkdownRaw).trim();
    const finalMarkdown = bodyMarkdown || fallbackMarkdown;
    targetContainer.innerHTML = markdownToHtml(removeMarkdownDirectives(finalMarkdown));
    const pageOptions = extractMarkdownOptions(finalMarkdown);
    if (pageOptions.justify) {
      targetContainer.classList.add("md-justified");
    }
  }

  mountRotationsInContainer(targetContainer, rawMarkdown);
  renderMathInContainer(targetContainer);
  renderCodeBlocksInContainer(targetContainer);
  hydrateLinkPreviewsInContainer(targetContainer);
  initCoverflows(targetContainer);
  initIpodCoverflows(targetContainer);
}

function getTabSiteRoot() {
  const existing = window.__SITE_ROOT__;
  if (typeof existing === "string" && existing.trim()) {
    return existing.endsWith("/") ? existing : existing + "/";
  }
  const isGhPages = /\.github\.io$/i.test(window.location.hostname);
  const segments = window.location.pathname.split("/").filter(Boolean);
  return isGhPages && segments.length > 0 ? `/${segments[0]}/` : "/";
}

function getTabFromUrl() {
  const tabParam = new URLSearchParams(window.location.search).get("tab");
  if (tabParam && KNOWN_TABS.has(tabParam)) return tabParam;
  const root = getTabSiteRoot();
  const afterRoot = window.location.pathname.startsWith(root)
    ? window.location.pathname.slice(root.length)
    : window.location.pathname.replace(/^\/+/, "");
  const segments = afterRoot.split("/").filter(Boolean).map((s) => s.toLowerCase());
  const seg = segments[0];
  if (!seg || seg === "index.html") return "home";
  return KNOWN_TABS.has(seg) ? seg : "home";
}

function getTabUrl(tabName) {
  const root = getTabSiteRoot().replace(/\/$/, "");
  if (tabName === "home") return root + "/";
  return `${root}/${tabName}`;
}

function updateTabUrl(tabName, push = true) {
  if (tabName === "post") return;
  const url = getTabUrl(tabName);
  if (push && url !== window.location.pathname) {
    history.pushState({ tab: tabName }, "", url);
  } else {
    history.replaceState({ tab: tabName }, "", url);
  }
}

function setTab(tabName, { pushHistory = true } = {}) {
  if (currentTab === "post" && tabName !== "post") {
    pauseEmbeddedMedia(postPageContent);
  }

  currentTab = tabName;
  const standaloneParentTab = getStandaloneParentTab();

  tabs.forEach((btn) => {
    const active = btn.dataset.tab === tabName || (tabName === "post" && btn.dataset.tab === standaloneParentTab);
    btn.classList.toggle("is-active", active);
  });

  tabPanels.forEach((panel) => {
    const active = panel.id === `tab-${tabName}`;
    panel.classList.toggle("is-active", active);
  });

  if (tabName === "home") {
    startHomeTitleRotation();
  } else {
    startTitleTypingOnce(pageTitles[tabName] || tabName);
  }

  if ((tabName === "blog" || tabName === "post") && !blogPostsLoaded) {
    blogPostsLoaded = true;
    if (blogGrid) blogGrid.innerHTML = `<p>${t("empty.loadingPosts")}</p>`;
    fetchBlogPosts()
      .then(({ posts, signature }) => {
        blogPosts = posts;
        blogPostsSignature = signature;
        renderBlogFilters();
        renderBlog();
      })
      .catch(() => {
        if (blogGrid) blogGrid.innerHTML = `<p>${t("empty.couldNotLoadPosts")}</p>`;
      });
  }

  if (tabName === "music" && !musicPostsLoaded) {
    musicPostsLoaded = true;
    if (musicGrid) musicGrid.innerHTML = `<p>${t("empty.loadingMusic")}</p>`;
    fetchMusicPosts()
      .then(({ posts, signature }) => {
        musicPosts = posts;
        musicPostsSignature = signature;
        renderMusicFilters();
        renderMusic();
      })
      .catch(() => {
        if (musicGrid) musicGrid.innerHTML = `<p>${t("empty.couldNotLoadMusic")}</p>`;
      });
  }

  updateTabUrl(tabName, pushHistory);

  if (tabName !== "post" && window.portfolioSeo && typeof window.portfolioSeo.applyTab === "function") {
    window.portfolioSeo.applyTab(tabName);
  }

  if (tabName === "apps" || tabName === "settings") {
    const panel = document.getElementById(`tab-${tabName}`);
    if (panel) {
      const animated = panel.querySelectorAll(
        tabName === "apps"
          ? ".ios-app"
          : ".settings-group, .settings-group-label"
      );
      animated.forEach((el) => {
        el.style.animation = "none";
        void el.offsetWidth;
        el.style.animation = "";
      });
      const labels = tabName === "apps" ? panel.querySelectorAll(".ios-app-label") : [];
      labels.forEach((el) => {
        el.style.animation = "none";
        void el.offsetWidth;
        el.style.animation = "";
      });
    }
  }
}

tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    activeStandalonePostSlug = "";
    updatePostUrlParameter("");
    setTab(btn.dataset.tab);
  });
});

const NAV_ICONS = {
  home: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
  projects: '<path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm13 0h-3v3h-3v3h3v-3h3v3h3v-3h-3z"/>',
  experience: '<path d="M20 6h-2.18c.07-.44.18-.86.18-1a3 3 0 0 0-6 0c0 .14.11.56.18 1H10C8.9 6 8 6.9 8 8v12c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-1a1 1 0 0 1 2 0c0 .5-.45 1-1 2-.55-1-1-1.5-1-2zm-3 3h4v1a2 2 0 0 0 4 0V8h2v12H10V8zM4 18H2V4h2v14zm2 2H4.5A2.5 2.5 0 0 1 2 17.5V4c0-1.1.9-2 2-2h2v18z"/>',
  resources: '<path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-2 14H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V6h8v2z"/>',
  music: '<path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>',
  blog: '<path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1V1h-2zm3 18H5V8h14v11z"/>',
};

tabs.forEach((btn) => {
  const tab = btn.dataset.tab;
  const pathData = NAV_ICONS[tab];
  if (!pathData) return;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "nav-icon");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML = pathData;
  btn.insertBefore(svg, btn.firstChild);
});

if (infoButton) {
  infoButton.addEventListener("click", () => {
    activeStandalonePostSlug = "";
    updatePostUrlParameter("");
    setTab("info");
  });
}

if (postBackButton) {
  postBackButton.addEventListener("click", () => {
    const nextTab = getStandaloneParentTab();
    activeStandalonePostSlug = "";
    updatePostUrlParameter("");
    // updatePostUrlParameter already did replaceState on the tab URL, no new push needed
    setTab(nextTab, { pushHistory: false });
  });
}

window.addEventListener("popstate", (event) => {
  const tabName = (event.state && KNOWN_TABS.has(event.state.tab))
    ? event.state.tab
    : getTabFromUrl();
  activeStandalonePostSlug = "";
  setTab(tabName, { pushHistory: false });
});

function createViewToggle(section, onViewChange) {
  const wrap = document.createElement("div");
  wrap.className = "view-toggle-wrap";

  const btn = document.createElement("button");
  btn.className = "view-toggle-btn";
  btn.type = "button";
  btn.setAttribute("aria-haspopup", "listbox");
  btn.setAttribute("aria-expanded", "false");

  function viewModeLabel(mode) {
    if (mode === "grid") return t("view.grid");
    if (mode === "columns") return t("view.columns");
    return t("view.list");
  }

  function updateBtnLabel() {
    const mode = viewModes[section];
    const icon = mode === "grid" ? VIEW_ICON_GRID : mode === "columns" ? VIEW_ICON_COLUMNS : VIEW_ICON_LIST;
    btn.innerHTML = icon + viewModeLabel(mode) + VIEW_ICON_CHEVRON;
  }
  updateBtnLabel();

  const dropdown = document.createElement("div");
  dropdown.className = "view-toggle-dropdown";
  dropdown.setAttribute("role", "listbox");

  const options = [
    { value: "grid", labelKey: "view.grid", icon: VIEW_ICON_GRID },
    { value: "list", labelKey: "view.list", icon: VIEW_ICON_LIST },
    { value: "columns", labelKey: "view.columns", icon: VIEW_ICON_COLUMNS },
  ];

  function updateOptionStates() {
    dropdown.querySelectorAll(".view-toggle-option").forEach((opt) => {
      opt.classList.toggle("is-selected", opt.dataset.value === viewModes[section]);
    });
  }

  options.forEach(({ value, labelKey, icon }) => {
    const opt = document.createElement("button");
    opt.className = "view-toggle-option";
    opt.type = "button";
    opt.dataset.value = value;
    opt.dataset.i18nKey = labelKey;
    opt.setAttribute("role", "option");
    opt.innerHTML = icon + t(labelKey) + VIEW_ICON_CHECK;
    opt.addEventListener("click", () => {
      viewModes[section] = value;
      updateBtnLabel();
      updateOptionStates();
      dropdown.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      onViewChange(value);
    });
    dropdown.appendChild(opt);
  });

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains("is-open");
    dropdown.classList.toggle("is-open", !isOpen);
    btn.setAttribute("aria-expanded", String(!isOpen));
    if (!isOpen) updateOptionStates();
  });

  document.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) {
      dropdown.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    }
  }, true);

  wrap.append(btn, dropdown);
  wrap._refreshI18n = () => {
    updateBtnLabel();
    dropdown.querySelectorAll(".view-toggle-option").forEach((opt) => {
      const key = opt.dataset.i18nKey;
      if (!key) return;
      const iconHtml = opt.querySelector("svg") ? opt.querySelector("svg").outerHTML : "";
      const check = opt.querySelector(".view-toggle-check, svg:last-of-type");
      opt.innerHTML = iconHtml + t(key) + VIEW_ICON_CHECK;
    });
    updateOptionStates();
  };
  return wrap;
}

const _cardObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter(e => e.isIntersecting);
  visible.forEach((entry, i) => {
    const delay = i * 160;
    entry.target.style.setProperty("--card-delay", delay + "ms");
    entry.target.classList.add("card--revealed");
    setTimeout(() => {
      entry.target.classList.remove("card--hidden", "card--revealed");
      entry.target.style.removeProperty("--card-delay");
    }, delay + 800);
    _cardObserver.unobserve(entry.target);
  });
}, { threshold: 0.04, rootMargin: "0px 0px -16px 0px" });

function animateCards(grid) {
  if (!grid) return;
  grid.querySelectorAll(".card, .project-card, .blog-card, .experience-card").forEach((card) => {
    card.style.setProperty("--card-delay", "0ms");
    card.classList.add("card--hidden");
    card.classList.remove("card--revealed");
    _cardObserver.observe(card);
  });
}

function applyViewMode(grid, section) {
  if (!grid) return;
  const mode = viewModes[section];
  grid.classList.toggle("view-list", mode === "list");
  grid.classList.toggle("view-columns", mode === "columns");
  if (mode === "list") {
    grid.querySelectorAll(".card, .project-card, .blog-card, .experience-card").forEach((card) => {
      const image = card.querySelector(".card-image");
      if (!card.querySelector(".card-list-body")) {
        const body = document.createElement("div");
        body.className = "card-list-body";
        Array.from(card.children).forEach((child) => {
          if (child !== image) body.appendChild(child);
        });
        card.appendChild(body);
      }
    });
  } else {
    grid.querySelectorAll(".card-list-body").forEach((body) => {
      const card = body.parentElement;
      Array.from(body.children).forEach((child) => card.insertBefore(child, body));
      body.remove();
    });
  }
}

function getProjectYear(item) {
  return parsePostYear(item?.year || item?.date || "");
}

function matchesSearch(query, ...fields) {
  if (!query) return true;
  const q = query.toLowerCase();
  return fields.some((f) => String(f || "").toLowerCase().includes(q));
}

function getFilteredProjects() {
  return projects.filter((item) => {
    const matchesTag =
      !selectedProjectsTag ||
      (Array.isArray(item.skills) && item.skills.some((s) => String(s).toLowerCase() === selectedProjectsTag.toLowerCase())) ||
      String(item.event || "").toLowerCase() === selectedProjectsTag.toLowerCase();
    const matchesYear = !selectedProjectsYear || getProjectYear(item) === selectedProjectsYear;
    return matchesTag && matchesYear && matchesSearch(selectedProjectsSearch, item.title, item.description, item.details, item.event, (item.skills || []).join(" "));
  });
}

function renderProjectsFilters() {
  if (!projectsTagFilter || !projectsYearFilter) return;

  const tagSet = new Set();
  projects.forEach((item) => {
    if (item.event) tagSet.add(item.event);
    (item.skills || []).forEach((s) => tagSet.add(s));
  });
  const tags = [...tagSet].sort((a, b) => a.localeCompare(b));
  const years = [...new Set(projects.map((item) => getProjectYear(item)).filter(Boolean))].sort((a, b) => b.localeCompare(a));

  if (selectedProjectsTag && !tags.includes(selectedProjectsTag)) selectedProjectsTag = "";
  if (selectedProjectsYear && !years.includes(selectedProjectsYear)) selectedProjectsYear = "";

  projectsTagFilter.innerHTML = `<option value="">${t("filter.allTags")}</option>`;
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    projectsTagFilter.appendChild(option);
  });
  projectsTagFilter.value = selectedProjectsTag;

  projectsYearFilter.innerHTML = `<option value="">${t("filter.allYears")}</option>`;
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    projectsYearFilter.appendChild(option);
  });
  projectsYearFilter.value = selectedProjectsYear;
}

function getExperienceYear(item) {
  return parsePostYear(item?.year || item?.date || "");
}

function getFilteredExperience() {
  return experience.filter((item) => {
    const matchesTag = !selectedExperienceTag || String(item.title || "").toLowerCase() === selectedExperienceTag.toLowerCase() || String(item.organization || "").toLowerCase() === selectedExperienceTag.toLowerCase();
    const matchesYear = !selectedExperienceYear || getExperienceYear(item) === selectedExperienceYear;
    return matchesTag && matchesYear && matchesSearch(selectedExperienceSearch, item.title, item.organization, item.description, item.year);
  });
}

function renderExperienceFilters() {
  if (!experienceTagFilter || !experienceYearFilter) return;

  const tags = [...new Set(experience.map((item) => item.title).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const years = [...new Set(experience.map((item) => getExperienceYear(item)).filter(Boolean))].sort((a, b) => b.localeCompare(a));

  if (selectedExperienceTag && !tags.includes(selectedExperienceTag)) selectedExperienceTag = "";
  if (selectedExperienceYear && !years.includes(selectedExperienceYear)) selectedExperienceYear = "";

  experienceTagFilter.innerHTML = `<option value="">${t("filter.allRoles")}</option>`;
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    experienceTagFilter.appendChild(option);
  });
  experienceTagFilter.value = selectedExperienceTag;

  experienceYearFilter.innerHTML = `<option value="">${t("filter.allYears")}</option>`;
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    experienceYearFilter.appendChild(option);
  });
  experienceYearFilter.value = selectedExperienceYear;
}

function injectProjectsViewToggle() {
  const filtersEl = document.getElementById("projects-filters");
  if (!filtersEl || filtersEl.querySelector(".view-toggle-wrap")) return;
  const toggle = createViewToggle("projects", () => {
    renderProjects();
  });
  filtersEl.appendChild(toggle);
}

function renderProjects() {
  projectsGrid.innerHTML = "";

  const visibleProjects = getFilteredProjects();

  if (!visibleProjects.length) {
    projectsGrid.innerHTML = `<p>${t("empty.projects")}</p>`;
    return;
  }

  visibleProjects.forEach((project, index) => {
    const originalIndex = projects.indexOf(project);
    const card = document.createElement("article");
    card.className = "card project-card";

    const image = document.createElement("img");
    image.className = "card-image";
    image.src = (project.images && project.images[0]) || "";
    image.alt = project.title || "Project image";
    image.loading = "lazy";
    image.decoding = "async";

    const title = document.createElement("h3");
    title.textContent = project.title || "Untitled Project";

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `${project.event || ""}${project.event && project.year ? " • " : ""}${project.year || ""}`;

    const description = document.createElement("p");
    description.textContent = project.description || "";

    const chips = document.createElement("div");
    chips.className = "chips";
    (project.skills || []).slice(0, 4).forEach((skill) => chips.appendChild(createChip(skill)));

    const open = document.createElement("button");
    open.className = "open-btn";
    open.textContent = t("btn.viewDetails");
    open.addEventListener("click", () => openProject(originalIndex));

    card.append(image, title, meta, description, chips, open);
    projectsGrid.appendChild(card);
  });

  applyViewMode(projectsGrid, "projects");
  animateCards(projectsGrid);
}

function injectExperienceViewToggle() {
  const filtersEl = document.getElementById("experience-filters");
  if (!filtersEl || filtersEl.querySelector(".view-toggle-wrap")) return;
  const toggle = createViewToggle("experience", () => {
    renderExperience();
  });
  filtersEl.appendChild(toggle);
}

function injectResourcesViewToggle() {
  const filtersEl = document.getElementById("resources-filters");
  if (!filtersEl || filtersEl.querySelector(".view-toggle-wrap")) return;
  const toggle = createViewToggle("resources", () => {
    renderResources();
  });
  filtersEl.appendChild(toggle);
}

function injectBlogViewToggle() {
  const filtersEl = document.getElementById("blog-filters");
  if (!filtersEl || filtersEl.querySelector(".view-toggle-wrap")) return;
  const toggle = createViewToggle("blog", () => {
    renderBlog();
  });
  filtersEl.appendChild(toggle);
}

function injectMusicViewToggle() {
  const filtersEl = document.getElementById("music-filters");
  if (!filtersEl || filtersEl.querySelector(".view-toggle-wrap")) return;
  const toggle = createViewToggle("music", () => {
    renderMusic();
  });
  filtersEl.appendChild(toggle);
}

function renderExperience() {
  experienceGrid.innerHTML = "";

  const visibleExperience = getFilteredExperience();

  if (!visibleExperience.length) {
    experienceGrid.innerHTML = `<p>${t("empty.experience")}</p>`;
    return;
  }

  visibleExperience.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card experience-card";

    const image = document.createElement("img");
    image.className = "card-image";
    image.src = item.image || "";
    image.alt = item.organization || "Experience image";
    image.loading = "lazy";
    image.decoding = "async";

    const title = document.createElement("h3");
    title.textContent = item.title || "Untitled Role";

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = `${item.organization || ""}${item.organization && item.year ? " • " : ""}${item.year || ""}`;

    const description = document.createElement("p");
    appendTextWithLinks(description, item.description || "");

    card.append(image, title, meta, description);
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      openExperience(item);
    });
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openExperience(item);
      }
    });
    experienceGrid.appendChild(card);
  });

  applyViewMode(experienceGrid, "experience");
  animateCards(experienceGrid);
}

function appendTextWithLinks(el, text) {
  el.innerHTML = renderInlineMarkdown(String(text || ""));
}

function openExperience(item) {
  if (!experienceModal) return;
  experienceModalTitle.textContent = item.title || "Untitled Role";
  experienceModalMeta.textContent = `${item.organization || ""}${item.organization && item.year ? " • " : ""}${item.year || ""}`;
  experienceModalImage.src = item.image || "";
  experienceModalImage.alt = item.organization || "Experience image";
  experienceModalImage.hidden = !item.image;
  experienceModalDescription.textContent = "";
  appendTextWithLinks(experienceModalDescription, item.description || "");
  experienceModal.showModal();
  moveCursorTo(experienceModal);
}

function closeExperience() {
  animatedDialogClose(experienceModal, () => moveCursorTo(document.body));
}

if (experienceModal) {
  experienceModalClose.addEventListener("click", closeExperience);
  experienceModal.addEventListener("click", (event) => {
    if (event.target === experienceModal) closeExperience();
  });
  experienceModal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeExperience();
  });
  experienceModal.addEventListener("pointermove", (event) => {
    const card = experienceModal.querySelector(".modal-card");
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - r.left}px`);
    card.style.setProperty("--my", `${event.clientY - r.top}px`);
  });
}

function renderResources() {
  resourcesGrid.innerHTML = "";

  const visibleResources = getFilteredResources();

  if (!visibleResources.length) {
    resourcesGrid.innerHTML = `<p>${t("empty.resources")}</p>`;
    return;
  }

  visibleResources.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";

    const title = document.createElement("h3");
    title.textContent = item.title || "Untitled Resource";

    const meta = document.createElement("p");
    meta.className = "meta";
    const type = item.type || "";
    const source = item.source || "";
    const year = item.year || "";
    meta.textContent = [type, source, year].filter(Boolean).join(" • ");

    const description = document.createElement("p");
    description.textContent = item.description || "";

    card.append(title, meta, description);

    if (item.tags?.length) {
      const chips = document.createElement("div");
      chips.className = "chips";
      item.tags.slice(0, 6).forEach((tag) => chips.appendChild(createChip(tag)));
      card.appendChild(chips);
    }

    if (item.link || (item.links && Array.isArray(item.links))) {
      const actions = document.createElement("div");
      actions.className = "actions";

      if (item.link) {
        const link = document.createElement("a");
        link.className = "button";
        link.href = item.link;
        if (item.newTab) { link.target = "_blank"; link.rel = "noreferrer"; }
        link.textContent = item.linkLabel || t("btn.openResource");
        actions.appendChild(link);
      }

      if (Array.isArray(item.links)) {
        item.links.forEach((entry) => {
          if (!entry?.url) return;
          const link = document.createElement("a");
          link.className = "button";
          link.href = entry.url;
          if (entry.newTab) { link.target = "_blank"; link.rel = "noreferrer"; }
          link.textContent = entry.label || t("btn.openLink");
          actions.appendChild(link);
        });
      }

      if (actions.childElementCount > 0) {
        card.appendChild(actions);
      }
    }

    resourcesGrid.appendChild(card);
  });

  applyViewMode(resourcesGrid, "resources");
  animateCards(resourcesGrid);
}

function getResourceYear(item) {
  return parsePostYear(item?.year || item?.date || "");
}

function getFilteredResources() {
  return resources.filter((item) => {
    const matchesTag =
      !selectedResourcesTag ||
      (Array.isArray(item.tags) && item.tags.some((tag) => String(tag).toLowerCase() === selectedResourcesTag.toLowerCase()));
    const matchesYear = !selectedResourcesYear || getResourceYear(item) === selectedResourcesYear;
    return matchesTag && matchesYear && matchesSearch(selectedResourcesSearch, item.title, item.description, item.source, item.type, (item.tags || []).join(" "));
  });
}

function renderResourcesFilters() {
  if (!resourcesTagFilter || !resourcesYearFilter) return;

  const tags = [...new Set(resources.flatMap((item) => toArrayOfStrings(item.tags || [])))].sort((a, b) => a.localeCompare(b));
  const years = [...new Set(resources.map((item) => getResourceYear(item)).filter(Boolean))].sort((a, b) => b.localeCompare(a));

  if (selectedResourcesTag && !tags.includes(selectedResourcesTag)) {
    selectedResourcesTag = "";
  }

  if (selectedResourcesYear && !years.includes(selectedResourcesYear)) {
    selectedResourcesYear = "";
  }

  resourcesTagFilter.innerHTML = `<option value="">${t("filter.allTags")}</option>`;
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    resourcesTagFilter.appendChild(option);
  });
  resourcesTagFilter.value = selectedResourcesTag;

  resourcesYearFilter.innerHTML = `<option value="">${t("filter.allYears")}</option>`;
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    resourcesYearFilter.appendChild(option);
  });
  resourcesYearFilter.value = selectedResourcesYear;
}

function getFilteredBlogPosts() {
  return blogPosts.filter((post) => {
    const matchesTag = !selectedBlogTag || post.tags.some((tag) => tag.toLowerCase() === selectedBlogTag.toLowerCase());
    const matchesYear = !selectedBlogYear || post.year === selectedBlogYear;
    return matchesTag && matchesYear && matchesSearch(selectedBlogSearch, post.title, post.summary, post.tags.join(" "));
  });
}

function renderBlogFilters() {
  if (!blogTagFilter || !blogYearFilter) return;

  const tags = [...new Set(blogPosts.flatMap((post) => post.tags))].sort((a, b) => a.localeCompare(b));
  const years = [...new Set(blogPosts.map((post) => post.year).filter(Boolean))].sort((a, b) => b.localeCompare(a));

  if (selectedBlogTag && !tags.includes(selectedBlogTag)) {
    selectedBlogTag = "";
  }

  if (selectedBlogYear && !years.includes(selectedBlogYear)) {
    selectedBlogYear = "";
  }

  blogTagFilter.innerHTML = `<option value="">${t("filter.allTags")}</option>`;
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    blogTagFilter.appendChild(option);
  });
  blogTagFilter.value = selectedBlogTag;

  blogYearFilter.innerHTML = `<option value="">${t("filter.allYears")}</option>`;
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    blogYearFilter.appendChild(option);
  });
  blogYearFilter.value = selectedBlogYear;
}

function createMusicPlayer(tracks) {
  const normalizedTracks = Array.isArray(tracks) ? tracks.filter((track) => track?.url) : [];
  if (!normalizedTracks.length) return null;

  const shell = document.createElement("section");
  shell.className = "music-player";
  shell.setAttribute("aria-label", "Audio player");

  const header = document.createElement("div");
  header.className = "music-player-header";

  const title = document.createElement("p");
  title.className = "music-player-title";
  title.textContent = t("music.audioPlayer");

  header.append(title);

  const audio = document.createElement("audio");
  audio.controls = true;
  audio.controlsList = "nodownload";
  audio.style.width = "100%";
  audio.preload = "metadata";
  audio.src = normalizedTracks[0].url;

  const trackSelect = document.createElement("select");
  trackSelect.className = "music-player-track-select blog-filter-select";

  normalizedTracks.forEach((track, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    const parts = [track.title];
    if (track.bpm) parts.push(`${track.bpm} bpm`);
    if (track.key) parts.push(track.key);
    option.textContent = parts.filter(Boolean).join(" • ");
    trackSelect.appendChild(option);
  });

  trackSelect.addEventListener("change", () => {
    const index = Number(trackSelect.value);
    const track = normalizedTracks[index] || normalizedTracks[0];
    audio.src = track.url;
    audio.load();
    audio.play().catch(() => {
      // Native controls manage playback state if autoplay on change is blocked.
    });
  });

  shell.append(header, audio, trackSelect);
  return shell;
}

function createMusicMetaPanel(post) {
  const rows = [
    ["artist", post.artist],
    ["composer", post.composer],
    ["album", post.album],
    ["track", post.trackNumber],
    ["duration", post.duration],
    ["bpm", post.bpm],
    ["tempo", post.tempo],
    ["key", post.keySignature],
    ["time", post.timeSignature],
    ["instrumentation", post.instrumentation.join(", ")],
    ["genre", post.genre.join(", ")],
    ["mood", post.mood.join(", ")]
  ].filter(([, value]) => String(value || "").trim().length > 0);

  if (!rows.length) return null;

  const panel = document.createElement("section");
  panel.className = "music-post-meta";

  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "music-post-meta-row";

    const key = document.createElement("span");
    key.className = "music-post-meta-key";
    key.textContent = label;

    const text = document.createElement("span");
    text.className = "music-post-meta-value";
    text.textContent = value;

    row.append(key, text);
    panel.appendChild(row);
  });

  return panel;
}

function createSheetMusicPanel(entries) {
  const scores = Array.isArray(entries) ? entries.filter((entry) => entry?.url) : [];
  if (!scores.length) return null;

  const panel = document.createElement("section");
  panel.className = "sheet-music-panel";

  const heading = document.createElement("p");
  heading.className = "sheet-music-title";
  heading.textContent = t("music.sheetMusic");

  const list = document.createElement("div");
  list.className = "sheet-music-links";

  scores.forEach((entry) => {
    const link = document.createElement("a");
    link.className = "button";
    link.href = entry.url;
    if (entry.newTab) { link.target = "_blank"; link.rel = "noreferrer"; }
    link.textContent = entry.title || t("btn.openScore");
    list.appendChild(link);
  });

  panel.append(heading, list);
  return panel;
}

function pauseEmbeddedMedia(container) {
  if (!container) return;

  container.querySelectorAll("audio").forEach((audio) => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // Ignore media cleanup errors.
    }
  });
}

function getPostMetaText(post) {
  if (!post) return "";

  const metaParts = [post.date, Array.isArray(post.tags) ? post.tags.join(" • ") : ""].filter(Boolean);
  if (post.isMusic && post.artist) {
    metaParts.unshift(post.artist);
  }

  return metaParts.join(" • ");
}

function getPostPageUrl(post) {
  if (!post?.slug) return window.location.href;
  const root = getTabSiteRoot();
  return root + "blog/?post=" + encodeURIComponent(post.slug);
}

function updatePostUrlParameter(postSlug) {
  const url = new URL(window.location.href);

  if (postSlug) {
    url.searchParams.set("post", postSlug);
  } else {
    url.searchParams.delete("post");
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history.replaceState({}, "", nextUrl);
  }
}

function findPostBySlug(slug) {
  if (!slug) return null;
  return blogPosts.find((post) => post.slug === slug) || musicPosts.find((post) => post.slug === slug) || null;
}

function getStandaloneParentTab() {
  return findPostBySlug(activeStandalonePostSlug)?.isMusic ? "music" : "blog";
}

function buildBlogPostContent(post, options = {}) {
  const { includeOpenInNewPageLink = false } = options;
  const fragment = document.createDocumentFragment();

  if (includeOpenInNewPageLink && post.slug) {
    const topActions = document.createElement("div");
    topActions.className = "blog-modal-top-actions";

    const openWindowBtn = document.createElement("a");
    openWindowBtn.className = "button button-open-window";
    openWindowBtn.href = getPostPageUrl(post);
    openWindowBtn.target = "_blank";
    openWindowBtn.rel = "noopener noreferrer";
    openWindowBtn.textContent = t("btn.openInNewPage");

    topActions.appendChild(openWindowBtn);
    fragment.appendChild(topActions);
  }

  if (post.coverImages) {
    const coverSection = document.createElement("div");
    coverSection.className = "blog-modal-cover blog-modal-cover-coverflow";
    coverSection.innerHTML = buildIpodCoverflowHtml(post.coverImages);
    fragment.appendChild(coverSection);
  } else if (post.coverImage) {
    const coverSection = document.createElement("div");
    coverSection.className = "blog-modal-cover";
    const img = document.createElement("img");
    img.src = post.coverImage;
    img.alt = `${post.title} cover image`;
    img.className = "blog-modal-cover-image";
    img.loading = "eager";
    coverSection.appendChild(img);
    fragment.appendChild(coverSection);
  }

  const metadataSection = document.createElement("div");
  metadataSection.className = "blog-modal-metadata";

  if (post.date) {
    const dateEl = document.createElement("div");
    dateEl.className = "blog-metadata-item";
    dateEl.innerHTML = `<span class="blog-metadata-label">Published:</span> <span class="blog-metadata-value">${escapeHtml(post.date)}</span>`;
    metadataSection.appendChild(dateEl);
  }

  if (post.tags && post.tags.length > 0) {
    const tagsEl = document.createElement("div");
    tagsEl.className = "blog-metadata-item blog-metadata-tags";
    tagsEl.innerHTML = '<span class="blog-metadata-label">Tags:</span> ';
    const tagsContainer = document.createElement("div");
    tagsContainer.className = "blog-tags-container";
    post.tags.forEach((tag) => {
      tagsContainer.appendChild(createChip(tag));
    });
    tagsEl.appendChild(tagsContainer);
    metadataSection.appendChild(tagsEl);
  }

  if (metadataSection.children.length > 0) {
    fragment.appendChild(metadataSection);
  }

  if (post.summary) {
    const summaryEl = document.createElement("p");
    summaryEl.className = "blog-modal-summary";
    summaryEl.textContent = post.summary;
    fragment.appendChild(summaryEl);
  }

  if (post.isMusic) {
    const metaPanel = createMusicMetaPanel(post);
    if (metaPanel) {
      fragment.appendChild(metaPanel);
    }

    const player = createMusicPlayer(post.audioTracks);
    if (player) {
      fragment.appendChild(player);
    }

    const sheetPanel = createSheetMusicPanel(post.sheetMusic);
    if (sheetPanel) {
      fragment.appendChild(sheetPanel);
    }

    if (Array.isArray(post.externalLinks) && post.externalLinks.length) {
      const linksRow = document.createElement("div");
      linksRow.className = "sheet-music-links";
      post.externalLinks.forEach((entry, index) => {
        const url = String(entry?.url || entry?.href || "").trim();
        if (!url) return;
        const link = document.createElement("a");
        link.className = "button";
        link.href = url;
        if (entry?.newTab) { link.target = "_blank"; link.rel = "noreferrer"; }
        link.textContent = String(entry?.label || entry?.title || `link ${index + 1}`);
        linksRow.appendChild(link);
      });
      if (linksRow.childElementCount > 0) {
        fragment.appendChild(linksRow);
      }
    }
  }

  const content = document.createElement("div");
  content.innerHTML = post.contentHtml || "";
  if (post.justify) {
    content.classList.add("md-justified");
  }

  // Stamp IDs onto rendered heading elements so anchor links resolve
  const headings = Array.isArray(post.headings) ? post.headings : [];
  if (headings.length) {
    const slugCounts = {};
    content.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((el) => {
      const text = el.textContent.trim();
      let slug = slugifyHeading(text);
      slugCounts[slug] = (slugCounts[slug] || 0) + 1;
      if (slugCounts[slug] > 1) slug = `${slug}-${slugCounts[slug]}`;
      el.id = slug;
    });

    // TOC accordion — only in the modal (includeOpenInNewPageLink signals modal context)
    if (options.includeOpenInNewPageLink) {
      const tocDetails = document.createElement("details");
      tocDetails.className = "md-accordion blog-toc-accordion";
      const tocSummary = document.createElement("summary");
      tocSummary.textContent = t("toc.title");
      tocDetails.appendChild(tocSummary);
      const tocList = document.createElement("div");
      tocList.innerHTML = buildTocHtml(headings);
      tocDetails.appendChild(tocList.firstElementChild);
      fragment.appendChild(tocDetails);
    }
  }

  fragment.appendChild(content);

  return fragment;
}

function renderStandalonePost(post) {
  if (!post || !postPageContent || !postPageTitle || !postBackButton) return;

  activeStandalonePostSlug = post.slug || "";
  pageTitles.post = post.title || DEFAULT_PAGE_TITLES.post;
  postPageKicker.textContent = post.isMusic ? t("kicker.musicPost") : t("kicker.blogPost");
  postPageTitle.textContent = post.title || "Untitled Post";
  postPageMeta.textContent = getPostMetaText(post);
  postBackButton.textContent = post.isMusic ? t("btn.backToMusic") : t("btn.backToBlog");

  pauseEmbeddedMedia(postPageContent);
  postPageContent.innerHTML = "";
  postPageContent.appendChild(buildBlogPostContent(post));
  postPageContent.classList.toggle("md-justified", Boolean(post.justify));

  renderMathInContainer(postPageContent);
  renderCodeBlocksInContainer(postPageContent);
  addFootnoteTooltips(postPageContent);
  hydrateLinkPreviewsInContainer(postPageContent);
  initCoverflows(postPageContent);
  initIpodCoverflows(postPageContent);
  updatePostUrlParameter(activeStandalonePostSlug);
  setTab("post");
  if (window.portfolioSeo && typeof window.portfolioSeo.applyArticle === "function") {
    window.portfolioSeo.applyArticle(post);
  }
}

function paintBlogModal(post) {
  if (!blogModal || !post) return;
  blogModalTitle.textContent = post.title || "Untitled Post";
  blogModalMeta.textContent = getPostMetaText(post);
  pauseEmbeddedMedia(blogModalContent);
  blogModalContent.innerHTML = "";
  blogModalContent.appendChild(buildBlogPostContent(post, { includeOpenInNewPageLink: true }));
  blogModalContent.classList.toggle("md-justified", Boolean(post.justify));

  renderMathInContainer(blogModalContent);
  renderCodeBlocksInContainer(blogModalContent);
  addFootnoteTooltips(blogModalContent);
  hydrateLinkPreviewsInContainer(blogModalContent);
  initCoverflows(blogModalContent);
  initIpodCoverflows(blogModalContent);
}

function openBlogPost(post) {
  if (!blogModal || !post) return;
  activeBlogModalSlug = post.slug || "";
  paintBlogModal(post);
  blogModal.showModal();
  moveCursorTo(blogModal);
}

function closeBlogPost() {
  if (!blogModal) return;
  pauseEmbeddedMedia(blogModal);
  animatedDialogClose(blogModal, () => {
    activeBlogModalSlug = "";
    moveCursorTo(document.body);
  });
}

function syncOpenBlogSurfaces() {
  if (blogModal?.open && activeBlogModalSlug) {
    const post = findPostBySlug(activeBlogModalSlug);
    if (post) paintBlogModal(post);
  }
  if (currentTab === "post" && activeStandalonePostSlug) {
    const post = findPostBySlug(activeStandalonePostSlug);
    if (post) renderStandalonePost(post);
  }
}

function renderBlog() {
  if (!blogGrid) return;

  blogGrid.innerHTML = "";
  const visiblePosts = getFilteredBlogPosts();

  if (!visiblePosts.length) {
    blogGrid.innerHTML = `<p>${t("empty.blog")}</p>`;
    return;
  }

  visiblePosts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "card blog-card";
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      if (e.target.closest(".open-btn")) return;
      openBlogPost(post);
    });

    if (post.coverImages) {
      const coverDiv = document.createElement("div");
      coverDiv.className = "card-ipod-cover";
      coverDiv.innerHTML = buildIpodCoverflowHtml(post.coverImages);
      coverDiv.addEventListener("click", (e) => e.stopPropagation());
      card.appendChild(coverDiv);
    } else if (post.coverImage) {
      const image = document.createElement("img");
      image.className = "card-image";
      image.src = post.coverImage;
      image.alt = `${post.title || "Blog post"} cover image`;
      image.loading = "lazy";
      image.decoding = "async";
      card.appendChild(image);
    }

    const title = document.createElement("h3");
    title.textContent = post.title || "Untitled Post";
    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = [post.date, post.year].filter(Boolean).join(" • ");

    const summary = document.createElement("p");
    summary.textContent = post.summary || "";

    const chips = document.createElement("div");
    chips.className = "chips";
    post.tags.slice(0, 6).forEach((tag) => chips.appendChild(createChip(tag)));

    const open = document.createElement("button");
    open.className = "open-btn";
    open.textContent = "read post";
    open.addEventListener("click", () => openBlogPost(post));

    card.append(title, meta, summary);
    if (post.tags.length) {
      card.appendChild(chips);
    }
    card.appendChild(open);
    blogGrid.appendChild(card);
  });

  applyViewMode(blogGrid, "blog");
  animateCards(blogGrid);
  initCoverflows(blogGrid);
  initIpodCoverflows(blogGrid);
}

function getFilteredMusicPosts() {
  return musicPosts.filter((post) => {
    const matchesTag = !selectedMusicTag || post.tags.some((tag) => tag.toLowerCase() === selectedMusicTag.toLowerCase());
    const matchesYear = !selectedMusicYear || post.year === selectedMusicYear;
    return matchesTag && matchesYear && matchesSearch(selectedMusicSearch, post.title, post.summary, post.tags.join(" "), post.artist);
  });
}

function renderMusicFilters() {
  if (!musicTagFilter || !musicYearFilter) return;

  const tags = [...new Set(musicPosts.flatMap((post) => post.tags))].sort((a, b) => a.localeCompare(b));
  const years = [...new Set(musicPosts.map((post) => post.year).filter(Boolean))].sort((a, b) => b.localeCompare(a));

  if (selectedMusicTag && !tags.includes(selectedMusicTag)) {
    selectedMusicTag = "";
  }

  if (selectedMusicYear && !years.includes(selectedMusicYear)) {
    selectedMusicYear = "";
  }

  musicTagFilter.innerHTML = `<option value="">${t("filter.allTags")}</option>`;
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    musicTagFilter.appendChild(option);
  });
  musicTagFilter.value = selectedMusicTag;

  musicYearFilter.innerHTML = `<option value="">${t("filter.allYears")}</option>`;
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    musicYearFilter.appendChild(option);
  });
  musicYearFilter.value = selectedMusicYear;
}

function renderMusic() {
  if (!musicGrid) return;

  musicGrid.innerHTML = "";
  const visiblePosts = getFilteredMusicPosts();

  if (!visiblePosts.length) {
    musicGrid.innerHTML = `<p>${t("empty.music")}</p>`;
    return;
  }

  visiblePosts.forEach((post) => {
    const card = document.createElement("article");
    card.className = "card blog-card";
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      if (e.target.closest(".open-btn")) return;
      openBlogPost(post);
    });

    if (post.coverImages) {
      const coverDiv = document.createElement("div");
      coverDiv.className = "card-ipod-cover";
      coverDiv.innerHTML = buildIpodCoverflowHtml(post.coverImages);
      coverDiv.addEventListener("click", (e) => e.stopPropagation());
      card.appendChild(coverDiv);
    } else if (post.coverImage) {
      const image = document.createElement("img");
      image.className = "card-image";
      image.src = post.coverImage;
      image.alt = `${post.title || "Music post"} cover image`;
      image.loading = "lazy";
      image.decoding = "async";
      card.appendChild(image);
    }

    const title = document.createElement("h3");
    title.textContent = post.title || "Untitled Post";
    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = [post.artist, post.date, post.year].filter(Boolean).join(" • ");

    const summary = document.createElement("p");
    summary.textContent = post.summary || "";

    const musicMeta = document.createElement("p");
    musicMeta.className = "meta";
    musicMeta.textContent = [
      post.keySignature,
      post.bpm ? `${post.bpm} bpm` : "",
      post.timeSignature,
      post.audioTracks?.length ? `${post.audioTracks.length} mp3` : ""
    ]
      .filter(Boolean)
      .join(" • ");

    const chips = document.createElement("div");
    chips.className = "chips";
    [...post.tags, ...post.instrumentation, ...post.genre]
      .slice(0, 8)
      .forEach((tag) => chips.appendChild(createChip(tag)));

    const open = document.createElement("button");
    open.className = "open-btn";
    open.textContent = post.audioTracks?.length ? "open player" : "read post";
    open.addEventListener("click", () => openBlogPost(post));

    card.append(title, meta, summary);
    if (musicMeta.textContent) {
      card.appendChild(musicMeta);
    }
    if (post.tags.length) {
      card.appendChild(chips);
    }
    card.appendChild(open);
    musicGrid.appendChild(card);
  });

  applyViewMode(musicGrid, "music");
  animateCards(musicGrid);
  initCoverflows(musicGrid);
  initIpodCoverflows(musicGrid);
}

function renderModal() {
  if (!selectedProject) return;

  modalTitle.textContent = selectedProject.title || "Untitled Project";
  modalMeta.textContent = `${selectedProject.event || ""}${selectedProject.event && selectedProject.year ? " • " : ""}${selectedProject.year || ""}`;
  modalImage.src = selectedProject.images[selectedImageIndex] || "";
  modalImage.alt = `${selectedProject.title || "Project"} image ${selectedImageIndex + 1}`;
  modalDescription.textContent = selectedProject.description || "";
  modalDetails.textContent = selectedProject.details || "";

  modalSkills.innerHTML = "";
  (selectedProject.skills || []).forEach((skill) => {
    modalSkills.appendChild(createChip(skill));
  });

  modalLinks.innerHTML = "";

  if (selectedProject.links?.demo) {
    const demoLink = document.createElement("a");
    demoLink.className = "button";
    demoLink.href = selectedProject.links.demo;
    if (selectedProject.links.demoNewTab) { demoLink.target = "_blank"; demoLink.rel = "noreferrer"; }
    demoLink.textContent = selectedProject.links.demo.endsWith(".pdf") ? t("btn.readPdf") : t("btn.seeWebsite");
    modalLinks.appendChild(demoLink);
  }

  if (selectedProject.links?.github) {
    const ghLink = document.createElement("a");
    ghLink.className = "button";
    ghLink.href = selectedProject.links.github;
    if (selectedProject.links.githubNewTab) { ghLink.target = "_blank"; ghLink.rel = "noreferrer"; }
    ghLink.textContent = t("btn.viewGithub");
    modalLinks.appendChild(ghLink);
  }

  if (selectedProject.links?.video) {
    const videoLink = document.createElement("a");
    videoLink.className = "button";
    videoLink.href = selectedProject.links.video;
    if (selectedProject.links.videoNewTab) { videoLink.target = "_blank"; videoLink.rel = "noreferrer"; }
    videoLink.textContent = t("btn.watchDemo");
    modalLinks.appendChild(videoLink);
  }

  const imageCount = (selectedProject.images || []).length;
  const canNavigate = imageCount > 1;
  galleryPrev.style.visibility = canNavigate ? "visible" : "hidden";
  galleryNext.style.visibility = canNavigate ? "visible" : "hidden";
}

function updateLightboxScale() {
  lightboxImage.style.transform = `scale(${lightboxScale})`;
  zoomReset.textContent = `${Math.round(lightboxScale * 100)}%`;
}

function moveCursorTo(container) {
  if (!cursor || !container) return;
  if (cursor.parentElement !== container) {
    container.appendChild(cursor);
  }
}

function openLightbox() {
  if (!selectedProject) return;
  lightboxImage.src = selectedProject.images[selectedImageIndex] || "";
  lightboxImage.alt = `${selectedProject.title || "Project"} enlarged image`;
  lightboxScale = 1;
  updateLightboxScale();
  lightbox.showModal();
  moveCursorTo(lightbox);
}

function closeLightbox() {
  animatedDialogClose(lightbox, () => moveCursorTo(document.body));
}

function animatedDialogClose(dialog, afterClose) {
  if (!dialog) return;
  dialog.classList.add("is-closing");
  const card = dialog.querySelector(".modal-card, .lightbox-card");
  const duration = 220;
  const done = () => {
    dialog.classList.remove("is-closing");
    dialog.close();
    if (afterClose) afterClose();
  };
  if (card) {
    card.addEventListener("animationend", done, { once: true });
    setTimeout(done, duration + 40);
  } else {
    done();
  }
}

function openProject(index) {
  selectedProject = projects[index];
  selectedImageIndex = 0;
  renderModal();
  modal.showModal();
  moveCursorTo(modal);
}

function closeModal() {
  animatedDialogClose(modal, () => {
    selectedProject = null;
    moveCursorTo(document.body);
  });
}

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});
modal.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeModal();
});

modalImage.addEventListener("click", openLightbox);

if (blogModalClose) {
  blogModalClose.addEventListener("click", closeBlogPost);
}

if (blogModal) {
  blogModal.addEventListener("click", (event) => {
    if (event.target === blogModal) closeBlogPost();
  });
  blogModal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeBlogPost();
  });
}

if (blogTagFilter) {
  blogTagFilter.addEventListener("change", () => {
    selectedBlogTag = blogTagFilter.value;
    renderBlog();
  });
}

if (blogYearFilter) {
  blogYearFilter.addEventListener("change", () => {
    selectedBlogYear = blogYearFilter.value;
    renderBlog();
  });
}

if (musicTagFilter) {
  musicTagFilter.addEventListener("change", () => {
    selectedMusicTag = musicTagFilter.value;
    renderMusic();
  });
}

if (musicYearFilter) {
  musicYearFilter.addEventListener("change", () => {
    selectedMusicYear = musicYearFilter.value;
    renderMusic();
  });
}

if (resourcesTagFilter) {
  resourcesTagFilter.addEventListener("change", () => {
    selectedResourcesTag = resourcesTagFilter.value;
    renderResources();
  });
}

if (resourcesYearFilter) {
  resourcesYearFilter.addEventListener("change", () => {
    selectedResourcesYear = resourcesYearFilter.value;
    renderResources();
  });
}

if (resourcesSearchInput) {
  resourcesSearchInput.addEventListener("input", () => {
    selectedResourcesSearch = resourcesSearchInput.value;
    renderResources();
  });
}

if (blogSearchInput) {
  blogSearchInput.addEventListener("input", () => {
    selectedBlogSearch = blogSearchInput.value;
    renderBlog();
  });
}

if (musicSearchInput) {
  musicSearchInput.addEventListener("input", () => {
    selectedMusicSearch = musicSearchInput.value;
    renderMusic();
  });
}

if (projectsTagFilter) {
  projectsTagFilter.addEventListener("change", () => {
    selectedProjectsTag = projectsTagFilter.value;
    renderProjects();
  });
}

if (projectsYearFilter) {
  projectsYearFilter.addEventListener("change", () => {
    selectedProjectsYear = projectsYearFilter.value;
    renderProjects();
  });
}

if (projectsSearchInput) {
  projectsSearchInput.addEventListener("input", () => {
    selectedProjectsSearch = projectsSearchInput.value;
    renderProjects();
  });
}

if (experienceTagFilter) {
  experienceTagFilter.addEventListener("change", () => {
    selectedExperienceTag = experienceTagFilter.value;
    renderExperience();
  });
}

if (experienceYearFilter) {
  experienceYearFilter.addEventListener("change", () => {
    selectedExperienceYear = experienceYearFilter.value;
    renderExperience();
  });
}

if (experienceSearchInput) {
  experienceSearchInput.addEventListener("input", () => {
    selectedExperienceSearch = experienceSearchInput.value;
    renderExperience();
  });
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
lightbox.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeLightbox();
});

zoomIn.addEventListener("click", () => {
  lightboxScale = Math.min(5, lightboxScale + 0.25);
  updateLightboxScale();
});

zoomOut.addEventListener("click", () => {
  lightboxScale = Math.max(0.5, lightboxScale - 0.25);
  updateLightboxScale();
});

zoomReset.addEventListener("click", () => {
  lightboxScale = 1;
  updateLightboxScale();
});

galleryPrev.addEventListener("click", () => {
  if (!selectedProject) return;
  selectedImageIndex = (selectedImageIndex - 1 + selectedProject.images.length) % selectedProject.images.length;
  renderModal();
});

galleryNext.addEventListener("click", () => {
  if (!selectedProject) return;
  selectedImageIndex = (selectedImageIndex + 1) % selectedProject.images.length;
  renderModal();
});

window.addEventListener("keydown", (event) => {
  if (modal.open && selectedProject) {
    if (event.key === "ArrowLeft") {
      selectedImageIndex = (selectedImageIndex - 1 + selectedProject.images.length) % selectedProject.images.length;
      renderModal();
    }
    if (event.key === "ArrowRight") {
      selectedImageIndex = (selectedImageIndex + 1) % selectedProject.images.length;
      renderModal();
    }
    if (event.key === "Escape") {
      if (lightbox.open) closeLightbox();
      else closeModal();
    }
  }

  if (event.key === "Escape" && blogModal?.open) {
    closeBlogPost();
  }
});

let bubblesActivated = false;

function calculateBubblesCount() {
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  const baseBubbles = 15;
  const maxBubbles = 50;
  const bubblesCount = Math.ceil(baseBubbles + (pageHeight / 1500));
  return Math.min(bubblesCount, maxBubbles);
}

window.addEventListener("scroll", () => {
  if (!bubblesActivated && window.scrollY > 50) {
    bubblesActivated = true;
    const canvas = document.getElementById("bubbles");
    if (canvas) {
      canvas.classList.add("is-active");
    }
  }
});

function startTitleTypingOnce(text, onComplete = null, sparksEnabled = true, flamesEnabled = true) {
  stopTitleTyping();

  typedTitle.classList.remove("animated", "shakeY");
  void typedTitle.offsetWidth;
  typedTitle.classList.add("animated", "shakeY");

  setTypingSparkleText(typedTitle, "");
  let index = 0;

  const typeStep = () => {
    if (index <= text.length) {
      setTypingSparkleText(typedTitle, text.slice(0, index));

      if (index > 0) {
        const typedChar = text.charAt(index - 1);
        const previousChar = text.charAt(index - 2);
        const shouldEmit = shouldEmitTypingSpark(typedChar, previousChar, index);
        if (shouldEmit && sparksEnabled && !isPerfMode()) {
          emitTypingSparkles(typedTitle, 20);
        }
        if (shouldEmit && flamesEnabled && !isPerfMode()) {
          emitTypingFlames(typedTitle, 10);
        }
      }

      index += 1;
      typingTimer = window.setTimeout(typeStep, 85);
    } else if (typeof onComplete === "function") {
      titleLoopTimer = window.setTimeout(onComplete, 1100);
    }
  };

  typingTimer = window.setTimeout(typeStep, 220);
}

function startHomeTitleRotation() {
  if (!homeTitleRotations.length) {
    startTitleTypingOnce(pageTitles.home || DEFAULT_PAGE_TITLES.home, null, homeTitleSparksEnabled, homeTitleFlamesEnabled);
    return;
  }

  stopTitleTyping();
  let index = 0;

  const typeNext = () => {
    // Stop once every title has had its turn, leaving the last one in place.
    // Looping forever retyped the heading — and reflowed everything under it —
    // for as long as the tab stayed open.
    if (!homeTitleLoopEnabled && index >= homeTitleRotations.length) {
      return;
    }

    const nextTitle = homeTitleRotations[index % homeTitleRotations.length];
    index += 1;
    startTitleTypingOnce(nextTitle, typeNext, homeTitleSparksEnabled, homeTitleFlamesEnabled);
  };

  typeNext();
}

function stopTitleTyping() {
  if (typingTimer) {
    window.clearTimeout(typingTimer);
    typingTimer = null;
  }

  if (titleLoopTimer) {
    window.clearTimeout(titleLoopTimer);
    titleLoopTimer = null;
  }
}

function createAnimalSprite(source, frameSpeed = 7) {
  const node = document.createElement("div");
  node.className = "animal-sprite";
  node.style.backgroundImage = `url(${source})`;
  node.dataset.frame = "0";
  node.dataset.ticks = "0";
  node.dataset.speed = String(frameSpeed);
  return node;
}

const animals = [
  {
    node: createAnimalSprite("https://www.parthiv.co.uk/Black_grouse_Flight.png", 5),
    x: -100,
    speed: 1.1,
    direction: 1,
    row: 2
  },
  {
    node: createAnimalSprite("https://www.parthiv.co.uk/Fox_walk.png", 8),
    x: 220,
    speed: 0.8,
    direction: 1,
    row: 2
  }
];

animals.forEach((animal) => {
  animalsLayer.appendChild(animal.node);
});

function tickAnimals() {
  const width = animalsLayer.clientWidth;

  animals.forEach((animal) => {
    animal.x += animal.speed * animal.direction;
    if (animal.x > width + 100) animal.x = -100;

    const frame = Number(animal.node.dataset.frame);
    const ticks = Number(animal.node.dataset.ticks) + 1;
    const frameSpeed = Number(animal.node.dataset.speed);

    if (ticks >= frameSpeed) {
      animal.node.dataset.frame = String((frame + 1) % 6);
      animal.node.dataset.ticks = "0";
    } else {
      animal.node.dataset.ticks = String(ticks);
    }

    const drawFrame = Number(animal.node.dataset.frame);
    const x = -(drawFrame * 32);
    const y = -(animal.row * 32);

    animal.node.style.left = `${animal.x}px`;
    animal.node.style.backgroundPosition = `${x}px ${y}px`;
  });

  window.requestAnimationFrame(tickAnimals);
}

// Rocket cursor + flame trail live in assets/js/cursor.js so every page
// (not just index.html) can include it.

async function fetchAllMarkdownPages({ forceRefresh = false } = {}) {
  const opts = { forceRefresh };
  const [homeRaw, projectsRaw, experienceRaw, resourcesRaw, musicRaw, blogRaw, infoRaw, releasesRaw, settingsRaw, appsRaw, textbookProjectRaw] = await Promise.all([
    loadMarkdown("pages/home.md", opts),
    loadMarkdown("pages/projects.md", opts),
    loadMarkdown("pages/experience.md", opts),
    loadMarkdown("pages/resources.md", opts),
    loadMarkdown("pages/music.md", opts),
    loadMarkdown("pages/blog.md", opts),
    loadMarkdown("pages/info.md", opts),
    loadMarkdown("pages/releases.md", opts),
    loadMarkdown("pages/settings.md", opts),
    loadMarkdown("pages/apps.md", opts),
    loadMarkdown("pages/textbook-project.md", opts)
  ]);

  return { homeRaw, projectsRaw, experienceRaw, resourcesRaw, musicRaw, blogRaw, infoRaw, releasesRaw, settingsRaw, appsRaw, textbookProjectRaw };
}

function applyMarkdownContent(homeRaw, projectsRaw, experienceRaw, resourcesRaw, musicRaw, blogRaw, infoRaw, preserveTab = true, releasesRaw = "", settingsRaw = "", appsRaw = "", textbookProjectRaw = "") {
  const tabToRestore = preserveTab ? currentTab : getTabFromUrl();
  stopAllMarkdownRotations();

  const homeTitle = extractTitle(homeRaw);
  const projectsTitle = extractTitle(projectsRaw);
  const experienceTitle = extractTitle(experienceRaw);
  const resourcesTitle = extractTitle(resourcesRaw);
  const musicTitle = extractTitle(musicRaw);
  const blogTitle = extractTitle(blogRaw);
  const infoTitle = extractTitle(infoRaw);

  const homeRotationsData = extractDataBlock(homeRaw, "title-rotations");

  let parsedHomeTitleRotations = [];
  let parsedHomeTitleSparksEnabled = true;
  let parsedHomeTitleFlamesEnabled = false;
  let parsedHomeTitleLoopEnabled = false;

  if (Array.isArray(homeRotationsData)) {
    parsedHomeTitleRotations = homeRotationsData;
  } else if (homeRotationsData && typeof homeRotationsData === "object") {
    if (Array.isArray(homeRotationsData.items)) {
      parsedHomeTitleRotations = homeRotationsData.items;
    } else if (Array.isArray(homeRotationsData.titles)) {
      parsedHomeTitleRotations = homeRotationsData.titles;
    } else if (Array.isArray(homeRotationsData.rotations)) {
      parsedHomeTitleRotations = homeRotationsData.rotations;
    }

    if (typeof homeRotationsData.sparks === "boolean") {
      parsedHomeTitleSparksEnabled = homeRotationsData.sparks;
    }

    if (typeof homeRotationsData.flames === "boolean") {
      parsedHomeTitleFlamesEnabled = homeRotationsData.flames;
    }

    // As with the markdown rotations: one pass unless the block asks for more.
    if (typeof homeRotationsData.loop === "boolean") {
      parsedHomeTitleLoopEnabled = homeRotationsData.loop;
    }
  }

  homeTitleRotations = parsedHomeTitleRotations.filter((value) => typeof value === "string" && value.trim().length > 0);
  homeTitleSparksEnabled = parsedHomeTitleSparksEnabled;
  homeTitleFlamesEnabled = parsedHomeTitleFlamesEnabled;
  homeTitleLoopEnabled = parsedHomeTitleLoopEnabled;

  pageTitles.home = homeTitleRotations[0] || homeTitle || DEFAULT_PAGE_TITLES.home;
  pageTitles.projects = projectsTitle || DEFAULT_PAGE_TITLES.projects;
  pageTitles.experience = experienceTitle || DEFAULT_PAGE_TITLES.experience;
  pageTitles.resources = resourcesTitle || DEFAULT_PAGE_TITLES.resources;
  pageTitles.music = musicTitle || DEFAULT_PAGE_TITLES.music;
  pageTitles.blog = blogTitle || DEFAULT_PAGE_TITLES.blog;
  pageTitles.info = infoTitle || DEFAULT_PAGE_TITLES.info;
  const releasesTitle = extractTitle(releasesRaw);
  pageTitles.releases = releasesTitle || DEFAULT_PAGE_TITLES.releases;
  const settingsTitle = extractTitle(settingsRaw);
  pageTitles.settings = settingsTitle || DEFAULT_PAGE_TITLES.settings;
  const appsTitle = extractTitle(appsRaw);
  pageTitles.apps = appsTitle || DEFAULT_PAGE_TITLES.apps;
  const textbookProjectTitle = extractTitle(textbookProjectRaw);
  pageTitles["textbook-project"] = textbookProjectTitle || DEFAULT_PAGE_TITLES["textbook-project"];

  const localizedProjects = collectProjectsByLanguage(projectsRaw);
  projectsByLanguage = localizedProjects.byLang;
  projectsFallback = localizedProjects.fallback;
  const localizedExperience = collectExperienceByLanguage(experienceRaw);
  experienceByLanguage = localizedExperience.byLang;
  experienceFallback = localizedExperience.fallback;
  const localizedResources = collectResourcesByLanguage(resourcesRaw);
  resourcesByLanguage = localizedResources.byLang;
  resourcesFallback = localizedResources.fallback;

  projects = resolveProjectsForLang(getPreferredLanguage());
  experience = resolveExperienceForLang(getPreferredLanguage());
  resources = resolveResourcesForLang(getPreferredLanguage());

  ensureRevealReady();

  renderMarkdownSection(homeRaw, homeMarkdown, DEFAULT_HOME_MARKDOWN);
  renderMarkdownSection(projectsRaw, projectsMarkdown);
  renderMarkdownSection(experienceRaw, experienceMarkdown);
  renderMarkdownSection(resourcesRaw, resourcesMarkdown);
  renderMarkdownSection(musicRaw, musicMarkdown);
  renderMarkdownSection(blogRaw, blogMarkdown);
  renderMarkdownSection(infoRaw, infoMarkdown);
  renderMarkdownSection(releasesRaw, releasesMarkdown);
  renderMarkdownSection(settingsRaw, settingsMarkdown);
  renderMarkdownSection(appsRaw, appsMarkdown);
  renderMarkdownSection(textbookProjectRaw, textbookProjectMarkdown);
  enhanceInfoPage();

  renderProjectsFilters();
  injectProjectsViewToggle();
  renderProjects();
  renderExperienceFilters();
  injectExperienceViewToggle();
  renderExperience();
  renderResourcesFilters();
  injectResourcesViewToggle();
  renderResources();
  renderMusicFilters();
  injectMusicViewToggle();
  renderMusic();
  renderBlogFilters();
  injectBlogViewToggle();
  renderBlog();
  initReveal();

  if (modal.open) {
    closeModal();
  }

  applyLocalizedPageTitles();
  if (window.portfolioI18n && typeof window.portfolioI18n.apply === "function") {
    window.portfolioI18n.apply(document);
  }
  if (typeof window.__annotateSidebarShortcuts === "function") {
    window.__annotateSidebarShortcuts();
  }
  if (window.siteTheme && typeof window.siteTheme.annotatePerfShortcutHints === "function") {
    window.siteTheme.annotatePerfShortcutHints();
  }
  setTab(tabToRestore, { pushHistory: false });
}

async function initMarkdownDrivenPages() {
  try {
    const [
      { homeRaw, projectsRaw, experienceRaw, resourcesRaw, musicRaw, blogRaw, infoRaw, releasesRaw, settingsRaw, appsRaw, textbookProjectRaw },
      { posts, signature },
      { posts: musicItems, signature: musicSignature }
    ] = await Promise.all([
      fetchAllMarkdownPages(),
      fetchBlogPosts(),
      fetchMusicPosts()
    ]);

    blogPosts = posts;
    blogPostsSignature = signature;
    musicPosts = musicItems;
    musicPostsSignature = musicSignature;
    blogPostsLoaded = true;
    musicPostsLoaded = true;

    markdownSignature = createMarkdownSignature(
      homeRaw,
      projectsRaw,
      experienceRaw,
      resourcesRaw,
      musicRaw,
      blogRaw,
      infoRaw,
      blogPostsSignature,
      musicPostsSignature
    );
    applyMarkdownContent(homeRaw, projectsRaw, experienceRaw, resourcesRaw, musicRaw, blogRaw, infoRaw, false, releasesRaw, settingsRaw, appsRaw, textbookProjectRaw);
    handlePostUrlParameter();
  } catch (error) {
    console.error("Unable to initialize markdown pages.", error);
    stopAllMarkdownRotations();
    projects = [];
    projectsByLanguage = {};
    projectsFallback = [];
    experience = [];
    experienceByLanguage = {};
    experienceFallback = [];
    resources = [];
    resourcesByLanguage = {};
    resourcesFallback = [];
    musicPosts = [];
    blogPosts = [];
    homeTitleRotations = [];
    homeTitleSparksEnabled = true;
    homeTitleFlamesEnabled = false;
    homeTitleLoopEnabled = false;
    homeMarkdown.innerHTML = markdownToHtml(DEFAULT_HOME_MARKDOWN);
    projectsMarkdown.innerHTML = "<p>Could not load pages/projects.md.</p>";
    experienceMarkdown.innerHTML = "<p>Could not load pages/experience.md.</p>";
    resourcesMarkdown.innerHTML = "<p>Could not load pages/resources.md.</p>";
    musicMarkdown.innerHTML = "<p>Could not load pages/music.md.</p>";
    blogMarkdown.innerHTML = "<p>Could not load pages/blog.md.</p>";
    infoMarkdown.innerHTML = "<p>Could not load pages/info.md.</p>";
    renderProjectsFilters();
    injectProjectsViewToggle();
    renderProjects();
    renderExperienceFilters();
    injectExperienceViewToggle();
    renderExperience();
    renderResourcesFilters();
    injectResourcesViewToggle();
    renderResources();
    renderMusicFilters();
    injectMusicViewToggle();
    renderMusic();
    renderBlogFilters();
    injectBlogViewToggle();
    renderBlog();
    setTab("home");
  }
}

function startMarkdownWatcher() {
  if (markdownWatcherId) {
    window.clearInterval(markdownWatcherId);
  }

  markdownWatcherId = window.setInterval(async () => {
    try {
      const { homeRaw, projectsRaw, experienceRaw, resourcesRaw, musicRaw, blogRaw, infoRaw, releasesRaw, settingsRaw, appsRaw, textbookProjectRaw } = await fetchAllMarkdownPages({ forceRefresh: true });
      const [{ posts, signature }, { posts: musicItems, signature: musicSignature }] = await Promise.all([
        fetchBlogPosts(),
        fetchMusicPosts()
      ]);
      blogPostsLoaded = true;
      musicPostsLoaded = true;
      const nextSignature = createMarkdownSignature(
        homeRaw,
        projectsRaw,
        experienceRaw,
        resourcesRaw,
        musicRaw,
        blogRaw,
        infoRaw,
        signature,
        musicSignature
      );

      if (nextSignature !== markdownSignature) {
        blogPosts = posts;
        blogPostsSignature = signature;
        musicPosts = musicItems;
        musicPostsSignature = musicSignature;
        renderBlogFilters();
        renderBlog();
        renderMusicFilters();
        renderMusic();
        markdownSignature = nextSignature;
        applyMarkdownContent(homeRaw, projectsRaw, experienceRaw, resourcesRaw, musicRaw, blogRaw, infoRaw, true, releasesRaw, settingsRaw, appsRaw, textbookProjectRaw);

        if (activeStandalonePostSlug) {
          const activePost = findPostBySlug(activeStandalonePostSlug);
          if (activePost) {
            renderStandalonePost(activePost);
          } else {
            activeStandalonePostSlug = "";
            updatePostUrlParameter("");
            setTab("blog");
          }
        }
      }
    } catch {
      // Ignore transient errors while watching.
    }
  }, 1500);
}

window.requestAnimationFrame(tickAnimals);
initMarkdownDrivenPages();

function handlePostUrlParameter() {
  const urlParams = new URLSearchParams(window.location.search);
  const postSlug = String(urlParams.get("post") || "").trim();

  if (!postSlug) {
    return;
  }

  const post = findPostBySlug(postSlug);
  if (post) {
    renderStandalonePost(post);
    return;
  }

  activeStandalonePostSlug = "";
  updatePostUrlParameter("");
  setTab("blog");
}

if (IS_DEV) {
  startMarkdownWatcher();
}


// ── App switcher popover ───────────────────────────────────────────────────
(() => {
  const appsButton = document.getElementById("apps-button");
  const switcher = document.getElementById("app-switcher");
  const backdrop = document.getElementById("app-switcher-backdrop");
  const grid = document.getElementById("app-switcher-grid");
  if (!appsButton || !switcher || !backdrop || !grid) return;

  let isOpen = false;

  function populateGrid() {
    const siteRoot = getTabSiteRoot();
    return fetch(siteRoot + "switcher/apps.json")
      .then((r) => {
        if (!r.ok) throw new Error("apps.json " + r.status);
        return r.json();
      })
      .then((data) => {
        grid.innerHTML = "";
        const apps = data.apps || [];
        apps.forEach((app) => {
          const item = document.createElement("a");
          item.className = "app-switcher-item";
          item.href = app.href;
          item.setAttribute("aria-label", app.name);
          if (app.description) item.title = app.description;
          if (app.id !== "portfolio") item.target = "_blank";

          const icon = document.createElement("div");
          icon.className = "app-switcher-icon";
          const img = document.createElement("img");
          img.src = siteRoot + "switcher/icons/" + app.icon;
          img.alt = app.name;
          img.loading = "lazy";
          icon.appendChild(img);

          const text = document.createElement("span");
          text.className = "app-switcher-label";
          text.textContent = app.name;

          item.appendChild(icon);
          item.appendChild(text);
          item.addEventListener("click", closeSwitcher);
          grid.appendChild(item);
        });
        if (isOpen) positionSwitcher();
      })
      .catch(() => {
        const source = document.querySelectorAll("#apps-markdown .ios-app");
        grid.innerHTML = "";
        source.forEach((node) => {
          const href = node.getAttribute("href") || "#";
          const label = node.querySelector(".ios-app-label")?.textContent?.trim() || node.getAttribute("aria-label") || "";
          const imgSrc = node.querySelector(".ios-app-icon img")?.getAttribute("src") || "";
          const tooltip = node.getAttribute("data-tooltip") || "";

          const item = document.createElement("a");
          item.className = "app-switcher-item";
          item.href = href;
          item.setAttribute("aria-label", label);
          if (tooltip) item.title = tooltip;
          if (node.getAttribute("target")) item.target = node.getAttribute("target");

          const icon = document.createElement("div");
          icon.className = "app-switcher-icon";
          if (imgSrc) {
            const img = document.createElement("img");
            img.src = imgSrc;
            img.alt = label;
            img.loading = "lazy";
            icon.appendChild(img);
          }

          const text = document.createElement("span");
          text.className = "app-switcher-label";
          text.textContent = label;

          item.appendChild(icon);
          item.appendChild(text);
          item.addEventListener("click", closeSwitcher);
          grid.appendChild(item);
        });
        if (isOpen) positionSwitcher();
      });
  }

  function positionSwitcher() {
    if (window.matchMedia("(max-width: 768px)").matches) {
      switcher.style.top = "";
      switcher.style.left = "";
      return;
    }
    const rect = appsButton.getBoundingClientRect();
    const margin = 12;
    const switcherWidth = switcher.offsetWidth || 360;
    const measured = switcher.offsetHeight || 0;
    // First open often measures only the header (grid still empty). Treat that
    // as a full drawer so we reserve space and stay inside the viewport.
    const fallbackHeight = Math.min(560, window.innerHeight - margin * 2);
    const switcherHeight = grid.childElementCount === 0
      ? fallbackHeight
      : (measured || fallbackHeight);

    // Prefer placing to the right of the sidebar button
    let left = rect.right + 10;
    if (left + switcherWidth + margin > window.innerWidth) {
      left = Math.max(margin, rect.left - switcherWidth - 10);
    }
    left = Math.max(margin, Math.min(left, window.innerWidth - switcherWidth - margin));

    // Anchor the bottom near the trigger (the apps button sits low), then
    // clamp so the whole drawer stays on screen.
    let top = rect.bottom - switcherHeight;
    if (top + switcherHeight + margin > window.innerHeight) {
      top = window.innerHeight - switcherHeight - margin;
    }
    top = Math.max(margin, top);

    switcher.style.top = `${top}px`;
    switcher.style.left = `${left}px`;
  }

  const switcherResizeObserver = typeof ResizeObserver === "function"
    ? new ResizeObserver(() => {
        if (isOpen) positionSwitcher();
      })
    : null;

  function openSwitcher() {
    if (isOpen) return;
    populateGrid();
    switcher.hidden = false;
    backdrop.hidden = false;
    // allow next frame for transition
    requestAnimationFrame(() => {
      positionSwitcher();
      switcher.classList.add("is-open");
      backdrop.classList.add("is-open");
    });
    appsButton.setAttribute("aria-expanded", "true");
    isOpen = true;
    if (switcherResizeObserver) switcherResizeObserver.observe(switcher);
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("click", onDocumentClick, true);
    window.addEventListener("resize", positionSwitcher);
    window.addEventListener("scroll", positionSwitcher, true);
  }

  function closeSwitcher() {
    if (!isOpen) return;
    switcher.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    appsButton.setAttribute("aria-expanded", "false");
    isOpen = false;
    if (switcherResizeObserver) switcherResizeObserver.disconnect();
    document.removeEventListener("keydown", onKeydown);
    document.removeEventListener("click", onDocumentClick, true);
    window.removeEventListener("resize", positionSwitcher);
    window.removeEventListener("scroll", positionSwitcher, true);
    setTimeout(() => {
      if (!isOpen) {
        switcher.hidden = true;
        backdrop.hidden = true;
      }
    }, 220);
  }

  function onKeydown(event) {
    if (event.key === "Escape") {
      closeSwitcher();
      appsButton.focus();
    }
  }

  function onDocumentClick(event) {
    if (switcher.contains(event.target) || appsButton.contains(event.target)) return;
    closeSwitcher();
  }

  appsButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOpen) closeSwitcher();
    else openSwitcher();
  });

  backdrop.addEventListener("click", closeSwitcher);

  // Expose toggle for keyboard shortcut wiring elsewhere
  window.__toggleAppSwitcher = () => {
    if (isOpen) closeSwitcher();
    else openSwitcher();
  };
})();


// ── Site search (Spotlight-style palette) ──────────────────────────────────
(() => {
  const button = document.getElementById("search-button");
  const palette = document.getElementById("site-search");
  const backdrop = document.getElementById("site-search-backdrop");
  const input = document.getElementById("site-search-input");
  const tagsEl = document.getElementById("site-search-tags");
  const resultsEl = document.getElementById("site-search-results");
  const countEl = document.getElementById("site-search-count");
  if (!button || !palette || !backdrop || !input || !resultsEl) return;

  function typeLabel(key) {
    return t(`search.type.${key}`);
  }

  const TYPES = [
    { key: "all" },
    { key: "page" },
    { key: "blog" },
    { key: "project" },
    { key: "experience" },
    { key: "resource" },
    { key: "music" },
  ];

  const TYPE_ICONS = {
    page: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>',
    blog: '<svg viewBox="0 0 24 24"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>',
    project: '<svg viewBox="0 0 24 24"><path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm13 0h-3v3h-3v3h3v-3h3v3h3v-3h-3z"/></svg>',
    experience: '<svg viewBox="0 0 24 24"><path d="M20 6h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-6-2v2h-4V4h4z"/></svg>',
    resource: '<svg viewBox="0 0 24 24"><path d="M19 2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM4 6H2v14a2 2 0 0 0 2 2h14v-2H4V6z"/></svg>',
    music: '<svg viewBox="0 0 24 24"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>',
  };

  let isOpen = false;
  let activeType = "all";
  let activeIndex = 0;
  let lastQuery = "";
  let lastResults = [];
  let lastFocused = null;

  // Build static page entries from sidebar nav buttons + a few extras
  function buildPageIndex() {
    const out = [];
    document.querySelectorAll(".sidebar .nav-btn").forEach((btn) => {
      const tab = btn.dataset.tab;
      if (!tab) return;
      out.push({
        type: "page",
        title: btn.textContent.trim() || tab,
        subtitle: t("search.navigateTo", { tab }),
        tab,
      });
    });
    // Settings / apps / info
    out.push({ type: "page", title: t("title.settings"), subtitle: t("search.page.settings"), tab: "settings" });
    out.push({ type: "page", title: t("title.apps"), subtitle: t("search.page.apps"), tab: "apps" });
    out.push({ type: "page", title: t("title.info"), subtitle: t("search.page.info"), tab: "info" });
    // The CV is its own document under /cv/, so these navigate by URL.
    const cvRoot = getTabSiteRoot();
    out.push({ type: "page", title: "cv", subtitle: t("search.page.cv"), href: `${cvRoot}cv/` });
    out.push({ type: "page", title: "cv · awards", subtitle: t("search.page.cvAwards"), href: `${cvRoot}cv/awards/` });
    out.push({ type: "page", title: "cv · skills", subtitle: t("search.page.cvSkills"), href: `${cvRoot}cv/skills/` });
    out.push({ type: "page", title: "cv · languages", subtitle: t("search.page.cvLanguages"), href: `${cvRoot}cv/languages/` });
    out.push({ type: "page", title: "cv · references", subtitle: t("search.page.cvReferences"), href: `${cvRoot}cv/references/` });
    return out;
  }

  function buildIndex() {
    const idx = [];
    idx.push(...buildPageIndex());

    (Array.isArray(blogPosts) ? blogPosts : []).forEach((post) => {
      idx.push({
        type: "blog",
        title: post.title || t("search.untitledPost"),
        subtitle: [post.date, (post.tags || []).slice(0, 3).join(", ")].filter(Boolean).join(" • "),
        tags: post.tags || [],
        body: post.contentText || "",
        summary: post.summary || "",
        post,
      });
      // Add per-heading entries so users can jump straight to a section
      (post.headings || []).forEach((h) => {
        const text = (h && (h.text || h.title)) || "";
        if (!text) return;
        idx.push({
          type: "blog",
          title: text,
          subtitle: t("search.section", { title: post.title || t("title.post") }),
          tags: post.tags || [],
          body: "",
          isHeading: true,
          headingSlug: h.slug || h.id || "",
          post,
        });
      });
    });

    (Array.isArray(musicPosts) ? musicPosts : []).forEach((post) => {
      idx.push({
        type: "music",
        title: post.title || "untitled track",
        subtitle: [post.artist, post.album, post.date].filter(Boolean).join(" • "),
        tags: [
          ...(post.tags || []),
          post.composer, post.genre, post.mood, post.keySignature, post.instrumentation,
        ].filter(Boolean),
        body: post.contentText || "",
        summary: post.summary || "",
        meta: [post.bpm && `${post.bpm} bpm`, post.timeSignature, post.duration].filter(Boolean).join(" • "),
        post,
      });
    });

    (Array.isArray(projects) ? projects : []).forEach((item, originalIndex) => {
      idx.push({
        type: "project",
        title: item.title || "untitled project",
        subtitle: [item.event, item.year].filter(Boolean).join(" • "),
        tags: item.skills || [],
        body: [item.description, item.details, item.event].filter(Boolean).join(" "),
        description: item.description || "",
        projectIndex: originalIndex,
      });
    });

    (Array.isArray(experience) ? experience : []).forEach((item) => {
      idx.push({
        type: "experience",
        title: item.title || item.role || "experience",
        subtitle: [item.organization || item.event, item.year].filter(Boolean).join(" • "),
        tags: [...(item.tags || []), ...(item.skills || [])].filter(Boolean),
        body: [item.description, item.details, item.event, item.organization].filter(Boolean).join(" "),
        description: item.description || "",
      });
    });

    (Array.isArray(resources) ? resources : []).forEach((item) => {
      idx.push({
        type: "resource",
        title: item.title || "resource",
        subtitle: [item.event, item.year].filter(Boolean).join(" • "),
        tags: [...(item.tags || []), ...(item.skills || [])].filter(Boolean),
        body: [item.description, item.details, item.event].filter(Boolean).join(" "),
        description: item.description || "",
        url: item.url || item.link || "",
      });
    });

    return idx;
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function highlight(text, query) {
    const safe = escapeHTML(text || "");
    if (!query) return safe;
    const tokens = query.trim().split(/\s+/).filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!tokens.length) return safe;
    const re = new RegExp("(" + tokens.join("|") + ")", "ig");
    return safe.replace(re, "<mark>$1</mark>");
  }

  function scoreEntry(entry, query) {
    if (!query) return 1;
    const q = query.toLowerCase();
    const title = (entry.title || "").toLowerCase();
    const sub = (entry.subtitle || "").toLowerCase();
    const desc = (entry.description || "").toLowerCase();
    const summary = (entry.summary || "").toLowerCase();
    const body = (entry.body || "").toLowerCase();
    const tags = (entry.tags || []).join(" ").toLowerCase();
    const meta = (entry.meta || "").toLowerCase();
    const hay = title + " \n " + sub + " \n " + tags + " \n " + desc + " \n " + summary + " \n " + meta + " \n " + body;
    const tokens = q.split(/\s+/).filter(Boolean);
    let score = 0;
    for (const t of tokens) {
      if (!hay.includes(t)) return 0;
      if (title.startsWith(t)) score += 14;
      else if (title.includes(t)) score += 8;
      if (tags.includes(t)) score += 4;
      if (sub.includes(t)) score += 2;
      if (summary.includes(t)) score += 2;
      if (desc.includes(t)) score += 1;
      if (body.includes(t)) score += 1;
    }
    if (entry.isHeading) score += 1; // tie-break headings slightly above plain body
    return score;
  }

  function extractSnippet(entry, query) {
    if (!query) return entry.summary || "";
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const sources = [entry.summary, entry.description, entry.body].filter(Boolean);
    for (const src of sources) {
      const lower = src.toLowerCase();
      let hitAt = -1;
      for (const t of tokens) {
        const i = lower.indexOf(t);
        if (i >= 0 && (hitAt < 0 || i < hitAt)) hitAt = i;
      }
      if (hitAt >= 0) {
        const radius = 60;
        const start = Math.max(0, hitAt - radius);
        const end = Math.min(src.length, hitAt + radius + 40);
        let s = src.slice(start, end).trim();
        if (start > 0) s = "…" + s;
        if (end < src.length) s = s + "…";
        return s;
      }
    }
    return entry.summary || entry.subtitle || "";
  }

  function renderTags(index) {
    if (!tagsEl) return;
    const counts = {};
    TYPES.forEach((typeEntry) => (counts[typeEntry.key] = 0));
    index.forEach((e) => {
      counts.all++;
      if (counts[e.type] != null) counts[e.type]++;
    });
    tagsEl.innerHTML = "";
    TYPES.forEach((typeEntry) => {
      if (typeEntry.key !== "all" && !counts[typeEntry.key]) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "site-search-tag" + (typeEntry.key === activeType ? " is-active" : "");
      btn.dataset.type = typeEntry.key;
      btn.innerHTML = `${escapeHTML(typeLabel(typeEntry.key))} <span class="site-search-tag-count">${counts[typeEntry.key]}</span>`;
      btn.addEventListener("click", () => {
        activeType = typeEntry.key;
        renderTags(index);
        runSearch();
        input.focus();
      });
      tagsEl.appendChild(btn);
    });
  }

  function defaultSuggestions(index) {
    // Show: recent blog posts, then top projects, until ~8 items
    const blog = index.filter((e) => e.type === "blog").slice(0, 4);
    const projs = index.filter((e) => e.type === "project").slice(0, 3);
    const pages = index.filter((e) => e.type === "page").slice(0, 3);
    return [...blog, ...projs, ...pages];
  }

  function runSearch() {
    const index = buildIndex();
    renderTags(index);
    const q = input.value.trim();
    lastQuery = q;

    let pool = activeType === "all" ? index : index.filter((e) => e.type === activeType);

    let entries;
    if (!q) {
      entries = activeType === "all" ? defaultSuggestions(index) : pool.slice(0, 12);
    } else {
      entries = pool
        .map((e) => ({ e, s: scoreEntry(e, q) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 30)
        .map((x) => x.e);
    }

    lastResults = entries;
    activeIndex = 0;
    renderResults(entries, q);
    countEl.textContent = entries.length
      ? t(entries.length === 1 ? "search.result" : "search.results", { n: entries.length })
      : "";
  }

  function renderResults(entries, query) {
    resultsEl.innerHTML = "";
    if (!entries.length) {
      const empty = document.createElement("div");
      empty.className = "site-search-empty";
      empty.textContent = query ? t("search.noResults", { query }) : t("search.noItems");
      resultsEl.appendChild(empty);
      return;
    }

    // Group by type when no query
    const groups = {};
    entries.forEach((e) => {
      (groups[e.type] = groups[e.type] || []).push(e);
    });
    const order = ["page", "blog", "project", "experience", "resource", "music"];
    let flatIdx = 0;
    order.forEach((typeKey) => {
      const list = groups[typeKey];
      if (!list || !list.length) return;
      if (!query) {
        const header = document.createElement("div");
        header.className = "site-search-section";
        header.textContent = typeLabel(typeKey);
        resultsEl.appendChild(header);
      }
      list.forEach((entry) => {
        const node = document.createElement("div");
        node.className = "site-search-result" + (flatIdx === activeIndex ? " is-active" : "");
        node.setAttribute("role", "option");
        node.dataset.flatIdx = String(flatIdx);

        const icon = document.createElement("div");
        icon.className = "site-search-result-icon";
        icon.innerHTML = TYPE_ICONS[entry.type] || TYPE_ICONS.page;

        const body = document.createElement("div");
        body.className = "site-search-result-body";
        const title = document.createElement("div");
        title.className = "site-search-result-title";
        title.innerHTML = highlight(entry.title, query);
        body.appendChild(title);

        let subText = entry.subtitle || "";
        if (query) {
          const snippet = extractSnippet(entry, query);
          if (snippet) {
            subText = entry.subtitle ? `${entry.subtitle} — ${snippet}` : snippet;
          }
        }
        if (subText) {
          const sub = document.createElement("div");
          sub.className = "site-search-result-sub";
          sub.innerHTML = highlight(subText, query);
          body.appendChild(sub);
        }

        const typeChip = document.createElement("span");
        typeChip.className = "site-search-result-type";
        typeChip.textContent = entry.type;

        node.append(icon, body, typeChip);

        // Map back to lastResults index
        const ourFlat = flatIdx;
        node.addEventListener("mousemove", () => {
          if (activeIndex !== ourFlat) {
            activeIndex = ourFlat;
            updateActive();
          }
        });
        node.addEventListener("click", () => {
          activeIndex = ourFlat;
          selectActive();
        });
        resultsEl.appendChild(node);
        flatIdx++;
      });
    });

    // Re-order lastResults to match render order
    lastResults = order.flatMap((k) => groups[k] || []);
    updateActive();
  }

  function updateActive() {
    const nodes = resultsEl.querySelectorAll(".site-search-result");
    nodes.forEach((n, i) => n.classList.toggle("is-active", i === activeIndex));
    const active = nodes[activeIndex];
    if (active && typeof active.scrollIntoView === "function") {
      active.scrollIntoView({ block: "nearest" });
    }
  }

  function selectActive() {
    const entry = lastResults[activeIndex];
    if (!entry) return;
    closePalette();

    if (entry.type === "page" && entry.href) {
      window.location.href = entry.href;
      return;
    }
    if (entry.type === "page" && entry.tab) {
      if (typeof setTab === "function") setTab(entry.tab);
      return;
    }
    if (entry.type === "blog" && entry.post) {
      if (typeof openBlogPost === "function") openBlogPost(entry.post);
      else if (typeof setTab === "function") setTab("blog");
      return;
    }
    if (entry.type === "music" && entry.post) {
      if (typeof openBlogPost === "function") openBlogPost(entry.post);
      else if (typeof setTab === "function") setTab("music");
      return;
    }
    if (entry.type === "project" && typeof entry.projectIndex === "number") {
      if (typeof setTab === "function") setTab("projects");
      if (typeof openProject === "function") {
        // small delay so tab is ready
        setTimeout(() => openProject(entry.projectIndex), 80);
      }
      return;
    }
    if (entry.type === "experience") {
      if (typeof setTab === "function") setTab("experience");
      return;
    }
    if (entry.type === "resource") {
      if (entry.url) {
        window.open(entry.url, "_blank", "noopener");
      } else if (typeof setTab === "function") {
        setTab("resources");
      }
      return;
    }
  }

  // Pre-load blog/music posts on first open so they appear in search
  let preloaded = false;
  function preloadCollections() {
    if (preloaded) return;
    preloaded = true;
    if (typeof fetchBlogPosts === "function" && (!blogPostsLoaded || !blogPosts.length)) {
      fetchBlogPosts().then(({ posts, signature }) => {
        blogPosts = posts;
        blogPostsSignature = signature;
        blogPostsLoaded = true;
        if (isOpen) runSearch();
      }).catch(() => {});
    }
    if (typeof fetchMusicPosts === "function" && (!musicPostsLoaded || !musicPosts.length)) {
      fetchMusicPosts().then(({ posts, signature }) => {
        musicPosts = posts;
        musicPostsSignature = signature;
        musicPostsLoaded = true;
        if (isOpen) runSearch();
      }).catch(() => {});
    }
  }

  function openPalette() {
    if (isOpen) return;
    lastFocused = document.activeElement;
    palette.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      palette.classList.add("is-open");
      backdrop.classList.add("is-open");
    });
    button.setAttribute("aria-expanded", "true");
    isOpen = true;
    preloadCollections();
    runSearch();
    setTimeout(() => input.focus(), 30);
    document.addEventListener("keydown", onKeydown);
  }

  function closePalette() {
    if (!isOpen) return;
    palette.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
    isOpen = false;
    document.removeEventListener("keydown", onKeydown);
    setTimeout(() => {
      if (!isOpen) {
        palette.hidden = true;
        backdrop.hidden = true;
      }
    }, 220);
    if (lastFocused && typeof lastFocused.focus === "function") {
      try { lastFocused.focus(); } catch (_) {}
    }
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (activeIndex < lastResults.length - 1) activeIndex++;
      updateActive();
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (activeIndex > 0) activeIndex--;
      updateActive();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      selectActive();
      return;
    }
    if (e.key === "Tab") {
      // Cycle type filters
      e.preventDefault();
      const visible = TYPES.filter((t) => {
        if (t.key === "all") return true;
        return buildIndex().some((entry) => entry.type === t.key);
      });
      const i = visible.findIndex((t) => t.key === activeType);
      const next = visible[(i + (e.shiftKey ? -1 + visible.length : 1)) % visible.length];
      activeType = next.key;
      runSearch();
    }
  }

  input.addEventListener("input", () => runSearch());

  backdrop.addEventListener("click", closePalette);

  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen) closePalette();
    else openPalette();
  });

  // Global ⌘K / Ctrl+K shortcut + "/" focus
  document.addEventListener("keydown", (e) => {
    const isMeta = e.metaKey || e.ctrlKey;
    if (isMeta && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      if (isOpen) closePalette();
      else openPalette();
      return;
    }
    if (!isOpen && e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const t = e.target;
      const tag = (t && t.tagName) || "";
      const isEditable = tag === "INPUT" || tag === "TEXTAREA" || (t && t.isContentEditable);
      if (!isEditable) {
        e.preventDefault();
        openPalette();
      }
    }
  });

  document.addEventListener("portfolio:language-change", () => {
    if (isOpen) runSearch();
  });
})();


// ── Sidebar keyboard shortcuts: Apps (⌘./Ctrl+.) ──────────────────────────
(() => {
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || "") ||
                /Mac OS X/.test(navigator.userAgent || "");
  const modKey = isMac ? "⌘" : "Ctrl";

  function annotateSidebarShortcuts() {
    const search = document.getElementById("search-button");
    if (search) {
      const base = t("tooltip.search");
      search.setAttribute("data-tooltip", base);
    }
    const apps = document.getElementById("apps-button");
    if (apps) {
      const base = t("tooltip.apps");
      apps.setAttribute("data-tooltip", `${base} (${modKey}.)`);
    }
    const settings = document.querySelector('.sidebar-actions a[href="settings"]');
    if (settings) {
      const base = t("tooltip.settings");
      settings.setAttribute("data-tooltip", `${base} (${modKey},)`);
      settings.setAttribute("aria-keyshortcuts", "Meta+Comma Control+Comma");
    }
    const popoverShortcut = document.getElementById("settings-popover-shortcut");
    if (popoverShortcut) popoverShortcut.textContent = `${modKey},`;
    const popover = document.getElementById("settings-popover");
    if (popover) popover.setAttribute("aria-keyshortcuts", "Meta+Comma Control+Comma");
  }
  window.__annotateSidebarShortcuts = annotateSidebarShortcuts;
  annotateSidebarShortcuts();
  document.addEventListener("DOMContentLoaded", annotateSidebarShortcuts);
  document.addEventListener("portfolio:language-change", annotateSidebarShortcuts);

  // Performance mode lives in the footer; keep tooltip in sync with ⌘/
  const perfBtn = document.getElementById("perf-mode-btn");
  if (perfBtn) {
    const perfSc = `${modKey}/`;
    perfBtn.setAttribute(
      "data-tooltip",
      `Is this site running too slow? Disable all the cool effects. (${perfSc})`
    );
  }

  document.addEventListener("keydown", (e) => {
    const isMeta = e.metaKey || e.ctrlKey;
    if (!isMeta || e.altKey || e.shiftKey) return;

    // Skip when typing in an input/textarea/contenteditable
    const t = e.target;
    const tag = (t && t.tagName) || "";
    const isEditable = tag === "INPUT" || tag === "TEXTAREA" || (t && t.isContentEditable);

    // ⌘. / Ctrl+. → toggle Apps popover
    if (e.key === ".") {
      if (isEditable) return;
      e.preventDefault();
      if (typeof window.__toggleAppSwitcher === "function") {
        window.__toggleAppSwitcher();
      } else {
        const btn = document.getElementById("apps-button");
        if (btn) btn.click();
      }
      return;
    }

    // ⌘, / Ctrl+, → toggle Settings popover
    if (e.key === "," || e.code === "Comma") {
      if (isEditable) return;
      e.preventDefault();
      if (typeof window.__toggleSettingsPopover === "function") {
        window.__toggleSettingsPopover();
      } else {
        const link = document.querySelector('.sidebar-actions a[href="settings"]');
        if (link) link.click();
      }
    }
  });
})();


// ── Ensure the sidebar-actions block is fully visible on load ────────────
(() => {
  const sidebar = document.querySelector(".sidebar");
  const actions = document.querySelector(".sidebar .sidebar-actions");
  if (!sidebar || !actions) return;

  function revealActions() {
    // Only meaningful when sidebar overflows
    if (sidebar.scrollHeight <= sidebar.clientHeight + 1) return;
    // Scroll all the way down so the actions block is fully visible
    sidebar.scrollTop = sidebar.scrollHeight;
  }

  // Run after layout settles
  requestAnimationFrame(() => requestAnimationFrame(revealActions));
  window.addEventListener("load", revealActions, { once: true });
  window.addEventListener("resize", () => {
    // If user is near the bottom, keep actions in view on resize
    const nearBottom = sidebar.scrollTop + sidebar.clientHeight >= sidebar.scrollHeight - 4;
    if (nearBottom) revealActions();
  });
})();


// ── Settings popover ────────────────────────────────────────────────────────
(() => {
  const THEME_KEY = "portfolio-theme";
  const PERF_KEY = "portfolio-perf-mode";
  const ANIMATION_KEY = "portfolio-animations";
  const VIDEO_BG_KEY = "portfolio-video-bg";
  const MARIE_KONDO_KEY = "portfolio-marie-kondo";

  const sidebarSettings = document.querySelector('.sidebar-actions a[href="settings"]');
  const popover = document.getElementById("settings-popover");
  const backdrop = document.getElementById("settings-popover-backdrop");
  const body = document.getElementById("settings-popover-body");
  const openFullBtn = document.getElementById("settings-popover-open");
  if (!sidebarSettings || !popover || !backdrop || !body) return;

  let isOpen = false;
  let populated = false;
  let lastFocused = null;

  function readThemePreference() {
    try {
      const v = localStorage.getItem(THEME_KEY);
      if (v === "dark" || v === "light" || v === "system") return v;
    } catch (_) {}
    return "system";
  }

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function readTheme() {
    const pref = readThemePreference();
    if (pref === "dark" || pref === "light") return pref;
    return getSystemTheme();
  }

  function readPerf() {
    if (window.siteTheme && typeof window.siteTheme.getPerfMode === "function") {
      return Boolean(window.siteTheme.getPerfMode());
    }
    // Default off when unset; only "on" enables.
    try { return localStorage.getItem(PERF_KEY) === "on"; } catch (_) { return false; }
  }

  function applyThemePreference(pref) {
    try {
      if (pref === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, pref);
    } catch (_) {}
    const resolved = (pref === "dark" || pref === "light") ? pref : getSystemTheme();
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
    document.dispatchEvent(new CustomEvent("portfolio:theme-change", { detail: { theme: resolved, preference: pref } }));
  }

  function applyPerf(enabled) {
    if (window.siteTheme && typeof window.siteTheme.setPerfMode === "function") {
      window.siteTheme.setPerfMode(enabled);
      return;
    }
    try {
      localStorage.setItem(PERF_KEY, enabled ? "on" : "off");
    } catch (_) {}
    if (enabled) document.documentElement.setAttribute("data-perf-mode", "on");
    else document.documentElement.removeAttribute("data-perf-mode");
  }

  function readVideoBg() {
    if (window.siteTheme && typeof window.siteTheme.getVideoBgEnabled === "function") {
      return Boolean(window.siteTheme.getVideoBgEnabled());
    }
    // Default on when unset; only "off" disables.
    try { return localStorage.getItem(VIDEO_BG_KEY) !== "off"; } catch (_) { return true; }
  }

  function applyVideoBg(enabled) {
    if (window.siteTheme && typeof window.siteTheme.setVideoBgEnabled === "function") {
      window.siteTheme.setVideoBgEnabled(enabled);
      return;
    }
    try {
      localStorage.setItem(VIDEO_BG_KEY, enabled ? "on" : "off");
    } catch (_) {}
    if (enabled) document.documentElement.setAttribute("data-video-bg", "on");
    else document.documentElement.removeAttribute("data-video-bg");

    // Pause/play any background videos directly (fallback when theme.js isn't loaded)
    document.querySelectorAll(".app-frame-video, .site-footer-video").forEach((v) => {
      if (enabled) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      else v.pause();
    });
  }

  function readMarieKondo() {
    if (window.siteTheme && typeof window.siteTheme.getMarieKondoMode === "function") {
      return Boolean(window.siteTheme.getMarieKondoMode());
    }
    try { return localStorage.getItem(MARIE_KONDO_KEY) !== "off"; } catch (_) { return true; }
  }

  function applyMarieKondo(enabled) {
    if (window.siteTheme && typeof window.siteTheme.setMarieKondoMode === "function") {
      window.siteTheme.setMarieKondoMode(enabled);
      return;
    }
    try {
      localStorage.setItem(MARIE_KONDO_KEY, enabled ? "on" : "off");
    } catch (_) {}
    if (enabled) document.documentElement.setAttribute("data-marie-kondo", "on");
    else document.documentElement.removeAttribute("data-marie-kondo");
  }

  function readAnimation() {
    if (window.siteTheme && typeof window.siteTheme.getAnimationsEnabled === "function") {
      return Boolean(window.siteTheme.getAnimationsEnabled());
    }
    // Default off when unset; only "on" enables.
    try { return localStorage.getItem(ANIMATION_KEY) === "on"; } catch (_) { return false; }
  }

  function applyAnimation(enabled) {
    if (window.siteTheme && typeof window.siteTheme.setAnimationsEnabled === "function") {
      window.siteTheme.setAnimationsEnabled(enabled);
      return;
    }
    try {
      localStorage.setItem(ANIMATION_KEY, enabled ? "on" : "off");
    } catch (_) {}
    if (enabled) document.documentElement.setAttribute("data-animations", "on");
    else document.documentElement.removeAttribute("data-animations");
  }

  function annotatePerfShortcutIn(scope) {
    if (window.siteTheme && typeof window.siteTheme.annotatePerfShortcutHints === "function") {
      window.siteTheme.annotatePerfShortcutHints();
      return;
    }
    const root = scope || document;
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || "") || /Mac OS X/.test(navigator.userAgent || "");
    const perfLabel = (window.siteTheme && window.siteTheme.getPerfShortcutLabel)
      ? window.siteTheme.getPerfShortcutLabel()
      : (isMac ? "⌘" : "Ctrl") + "/";
    const animLabel = (window.siteTheme && window.siteTheme.getAnimShortcutLabel)
      ? window.siteTheme.getAnimShortcutLabel()
      : (isMac ? "⌘" : "Ctrl") + "\\";
    const videoBgLabel = (window.siteTheme && window.siteTheme.getVideoBgShortcutLabel)
      ? window.siteTheme.getVideoBgShortcutLabel()
      : (isMac ? "⌘" : "Ctrl") + ";";
    const marieKondoLabel = (window.siteTheme && window.siteTheme.getMarieKondoShortcutLabel)
      ? window.siteTheme.getMarieKondoShortcutLabel()
      : (isMac ? "⌘" : "Ctrl") + "M";
    root.querySelectorAll('.ios-toggle[data-toggle="animation"]').forEach((el) => {
      el.setAttribute("aria-keyshortcuts", (isMac ? "Meta" : "Control") + "+Backslash");
    });
    root.querySelectorAll('.ios-toggle[data-toggle="video-bg"]').forEach((el) => {
      el.setAttribute("aria-keyshortcuts", (isMac ? "Meta" : "Control") + "+Semicolon");
    });
    root.querySelectorAll('.ios-toggle[data-toggle="marie-kondo"]').forEach((el) => {
      el.setAttribute("aria-keyshortcuts", (isMac ? "Meta" : "Control") + "+KeyM");
    });
    root.querySelectorAll("[data-setting] .settings-row-label").forEach((el) => {
      if (el.dataset.shortcutAnnotated === "true") return;
      const setting = el.closest("[data-setting]")?.getAttribute("data-setting");
      let shortcut = "";
      if (setting === "perf") shortcut = perfLabel;
      else if (setting === "video-bg") shortcut = videoBgLabel;
      else if (setting === "marie-kondo") shortcut = marieKondoLabel;
      else if (setting === "animation") shortcut = animLabel;
      if (!shortcut) return;
      el.dataset.shortcutAnnotated = "true";
      const kbd = document.createElement("kbd");
      kbd.className = "settings-shortcut-kbd";
      kbd.textContent = shortcut;
      kbd.setAttribute("aria-hidden", "true");
      el.appendChild(document.createTextNode(" "));
      el.appendChild(kbd);
    });
  }

  function syncToggle(toggleEl, isOn) {
    if (!toggleEl) return;
    toggleEl.setAttribute("aria-checked", isOn ? "true" : "false");
  }

  function syncAllToggles(root) {
    const scope = root || document;
    const perf = readPerf();
    const animation = readAnimation();
    const videoBg = readVideoBg();
    const marieKondo = readMarieKondo();
    scope.querySelectorAll('.ios-toggle[data-toggle="perf"]').forEach((el) => syncToggle(el, perf));
    scope.querySelectorAll('.ios-toggle[data-toggle="animation"]').forEach((el) => syncToggle(el, animation));
    scope.querySelectorAll('.ios-toggle[data-toggle="video-bg"]').forEach((el) => syncToggle(el, videoBg));
    scope.querySelectorAll('.ios-toggle[data-toggle="marie-kondo"]').forEach((el) => syncToggle(el, marieKondo));
    syncThemeSegments(scope);
    syncLanguageSegments(scope);
  }

  function readLanguagePref() {
    if (typeof getPreferredLanguage === "function") return getPreferredLanguage();
    try {
      const v = String(localStorage.getItem("portfolio-language") || "").toLowerCase();
      if (["en", "fr", "it", "ja", "zh", "pl"].includes(v)) return v;
    } catch (_) {}
    return "en";
  }

  function syncLanguageSegments(root) {
    const scope = root || document;
    const current = readLanguagePref();
    // Sync settings-page dropdown instances
    scope.querySelectorAll(".lang-dropdown-mount").forEach((mount) => {
      const inst = mount._langDropdownInstance;
      if (inst && typeof inst.setValue === "function") inst.setValue(current);
    });
  }

  function wireLanguageSegments(scope) {
    scope.querySelectorAll(".lang-dropdown-mount").forEach((mount) => {
      if (mount.dataset.bound === "true") return;
      mount.dataset.bound = "true";
      const opts = String(mount.dataset.options || "en,fr,it,ja,zh,pl")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const current = readLanguagePref();
      const initial = opts.includes(current) ? current : "en";
      const inst = (typeof createLanguageDropdown === "function")
        ? createLanguageDropdown(opts, initial, (next) => {
            if (typeof window.setPreferredLanguage === "function") {
              window.setPreferredLanguage(next);
            }
          })
        : null;
      if (!inst) return;
      mount.innerHTML = "";
      mount.appendChild(inst.root);
      mount._langDropdownInstance = inst;
    });
  }

  function syncThemeSegments(root) {
    const scope = root || document;
    const pref = readThemePreference();
    scope.querySelectorAll(".theme-segment").forEach((seg) => {
      seg.setAttribute("data-active", pref);
      seg.querySelectorAll(".theme-segment-option").forEach((opt) => {
        const isOn = opt.getAttribute("data-theme-mode") === pref;
        opt.setAttribute("aria-checked", isOn ? "true" : "false");
        opt.classList.toggle("is-active", isOn);
      });
    });
  }

  function wireToggles(scope) {
    scope.querySelectorAll(".ios-toggle").forEach((toggle) => {
      if (toggle.dataset.bound === "true") return;
      toggle.dataset.bound = "true";
      toggle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const kind = toggle.getAttribute("data-toggle");
        if (kind !== "marie-kondo" && readMarieKondo()) {
          // Marie Kondo mode owns these while it's active — restored on untoggle.
          return;
        }
        const isOn = toggle.getAttribute("aria-checked") === "true";
        const next = !isOn;
        syncToggle(toggle, next);
        if (kind === "perf") {
          applyPerf(next);
          document.querySelectorAll('.ios-toggle[data-toggle="perf"]').forEach((el) => syncToggle(el, next));
        } else if (kind === "animation") {
          applyAnimation(next);
          document.querySelectorAll('.ios-toggle[data-toggle="animation"]').forEach((el) => syncToggle(el, next));
        } else if (kind === "video-bg") {
          applyVideoBg(next);
          document.querySelectorAll('.ios-toggle[data-toggle="video-bg"]').forEach((el) => syncToggle(el, next));
        } else if (kind === "marie-kondo") {
          applyMarieKondo(next);
          document.querySelectorAll('.ios-toggle[data-toggle="marie-kondo"]').forEach((el) => syncToggle(el, next));
        }
      });
    });
  }

  function wireThemeSegments(scope) {
    scope.querySelectorAll(".theme-segment").forEach((seg) => {
      if (seg.dataset.bound === "true") return;
      seg.dataset.bound = "true";
      seg.querySelectorAll(".theme-segment-option").forEach((opt) => {
        opt.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const mode = opt.getAttribute("data-theme-mode");
          if (mode !== "system" && mode !== "light" && mode !== "dark") return;
          applyThemePreference(mode);
          syncThemeSegments(document);
        });
      });
    });
  }

  function populate() {
    // Clone the rendered settings panel content so the popover stays in sync
    const settingsPanel = document.getElementById("settings-markdown");
    body.innerHTML = "";
    if (settingsPanel && settingsPanel.children.length) {
      Array.from(settingsPanel.children).forEach((child) => {
        // Skip the H1 "Settings" — the popover header already shows the title
        if (child.tagName === "H1") return;
        body.appendChild(child.cloneNode(true));
      });
    } else {
      // Fallback bare-bones markup
      body.innerHTML = `
        <p class="settings-group-label">Appearance</p>
        <div class="settings-group">
          <div class="settings-row settings-row-segment">
            <div class="settings-row-icon" style="background:linear-gradient(135deg,#667eea,#764ba2);">🎨</div>
            <span class="settings-row-label">Theme</span>
            <div class="theme-segment" role="radiogroup" aria-label="Theme">
              <button type="button" class="theme-segment-option" role="radio" aria-checked="false" data-theme-mode="system">system</button>
              <button type="button" class="theme-segment-option" role="radio" aria-checked="false" data-theme-mode="light">light</button>
              <button type="button" class="theme-segment-option" role="radio" aria-checked="false" data-theme-mode="dark">dark</button>
              <span class="theme-segment-indicator" aria-hidden="true"></span>
            </div>
          </div>
          <div class="settings-row settings-row-dropdown">
            <div class="settings-row-icon" style="background:linear-gradient(135deg,#11998e,#38ef7d);">🌐</div>
            <span class="settings-row-label">Language</span>
            <div class="lang-dropdown-mount" data-options="en,fr,it,ja,zh,pl" aria-label="Default language"></div>
          </div>
          <div class="settings-row settings-row-toggle">
            <div class="settings-row-icon" style="background:linear-gradient(135deg,#f7971e,#ffd200);">⚡</div>
            <span class="settings-row-label">Performance Mode</span>
            <button type="button" class="ios-toggle" role="switch" aria-checked="false" data-toggle="perf" aria-label="Toggle performance mode" aria-keyshortcuts="Meta+Slash Control+Slash"><span class="ios-toggle-track"><span class="ios-toggle-thumb"></span></span></button>
          </div>
          <div class="settings-row settings-row-toggle">
            <div class="settings-row-icon" style="background:linear-gradient(135deg,#2193b0,#6dd5ed);">🎬</div>
            <span class="settings-row-label">Video Background</span>
            <button type="button" class="ios-toggle" role="switch" aria-checked="false" data-toggle="video-bg" aria-label="Toggle video background" aria-keyshortcuts="Meta+Semicolon Control+Semicolon"><span class="ios-toggle-track"><span class="ios-toggle-thumb"></span></span></button>
          </div>
          <div class="settings-row settings-row-toggle">
            <div class="settings-row-icon" style="background:linear-gradient(135deg,#8e2de2,#c471ed);">🫧</div>
            <span class="settings-row-label">Bubbles Animation</span>
            <button type="button" class="ios-toggle" role="switch" aria-checked="false" data-toggle="animation" aria-label="Toggle background animation" aria-keyshortcuts="Meta+Backslash Control+Backslash"><span class="ios-toggle-track"><span class="ios-toggle-thumb"></span></span></button>
          </div>
          <div class="settings-row settings-row-toggle">
            <div class="settings-row-icon" style="background:linear-gradient(135deg,#e0e0e0,#ffffff);">🧹</div>
            <span class="settings-row-label">Marie Kondo Mode</span>
            <button type="button" class="ios-toggle" role="switch" aria-checked="false" data-toggle="marie-kondo" aria-label="Toggle Marie Kondo mode" aria-keyshortcuts="Meta+KeyM Control+KeyM"><span class="ios-toggle-track"><span class="ios-toggle-thumb"></span></span></button>
          </div>
        </div>`;
    }
    // Cloned nodes inherit data-bound=true — clear it so wireToggles can bind
    body.querySelectorAll(".ios-toggle, .theme-segment, .lang-segment, .lang-dropdown-mount").forEach((el) => {
      delete el.dataset.bound;
      // .lang-dropdown-mount is a portal — its contents are a clone of a live
      // dropdown instance and must be wiped so wireLanguageSegments() can mount
      // a fresh one. Other controls (toggle track/thumb, segment buttons) keep
      // their inner markup.
      if (el.classList.contains("lang-dropdown-mount")) {
        if (el._langDropdownInstance) delete el._langDropdownInstance;
        el.innerHTML = "";
      }
    });
    wireToggles(body);
    wireThemeSegments(body);
    wireLanguageSegments(body);
    syncAllToggles(body);
    if (window.portfolioI18n && typeof window.portfolioI18n.apply === "function") {
      window.portfolioI18n.apply(body);
    }
    annotatePerfShortcutIn(body);
    populated = true;
  }

  function position() {
    if (window.matchMedia("(max-width: 768px)").matches) {
      popover.style.top = "";
      popover.style.left = "";
      return;
    }
    const rect = sidebarSettings.getBoundingClientRect();
    const margin = 12;
    const w = popover.offsetWidth || 380;
    const h = popover.offsetHeight || 0;

    // Prefer to the right of the sidebar settings button
    let left = rect.right + 10;
    if (left + w + margin > window.innerWidth) {
      left = Math.max(margin, rect.left - w - 10);
    }

    // Vertically anchor with the popover's bottom near the button bottom
    let top = rect.bottom - h;
    if (top + h + margin > window.innerHeight) top = window.innerHeight - h - margin;
    top = Math.max(margin, top);

    popover.style.top = top + "px";
    popover.style.left = left + "px";
  }

  function open() {
    if (isOpen) return;
    lastFocused = document.activeElement;
    // Always re-populate to reflect any markdown re-render
    populate();
    popover.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      position();
      popover.classList.add("is-open");
      backdrop.classList.add("is-open");
    });
    sidebarSettings.setAttribute("aria-expanded", "true");
    isOpen = true;
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("click", onDocClick, true);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
  }

  window.__openSettingsPopover = open;
  window.__toggleSettingsPopover = () => {
    if (isOpen) close();
    else open();
  };

  function close() {
    if (!isOpen) return;
    popover.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    sidebarSettings.setAttribute("aria-expanded", "false");
    isOpen = false;
    document.removeEventListener("keydown", onKeydown);
    document.removeEventListener("click", onDocClick, true);
    window.removeEventListener("resize", position);
    window.removeEventListener("scroll", position, true);
    setTimeout(() => {
      if (!isOpen) {
        popover.hidden = true;
        backdrop.hidden = true;
      }
    }, 220);
    if (lastFocused && typeof lastFocused.focus === "function") {
      try { lastFocused.focus(); } catch (_) {}
    }
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  function eventElement(e) {
    const node = e && e.target;
    if (node && typeof node.closest === "function") return node;
    const parent = node && node.parentElement;
    return parent && typeof parent.closest === "function" ? parent : null;
  }

  function onDocClick(e) {
    const target = eventElement(e);
    if (!target) return;
    if (popover.contains(target) || sidebarSettings.contains(target)) return;
    if (target.closest("[data-settings-open]")) return;
    close();
  }

  // Intercept the sidebar settings link to open the popover instead
  sidebarSettings.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOpen) close();
    else open();
  });

  document.addEventListener("click", (e) => {
    const target = eventElement(e);
    const link = target && target.closest("[data-settings-open]");
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();
    if (isOpen) close();
    else open();
  });

  backdrop.addEventListener("click", close);

  if (openFullBtn) {
    openFullBtn.addEventListener("click", () => {
      close();
    });
  }

  // Also wire the in-tab settings panel toggles (when user is on /settings)
  function wireSettingsTab() {
    const panel = document.getElementById("settings-markdown");
    if (!panel) return;
    wireToggles(panel);
    wireThemeSegments(panel);
    wireLanguageSegments(panel);
    syncAllToggles(panel);
    annotatePerfShortcutIn(panel);
  }
  wireSettingsTab();
  // Re-wire after markdown re-renders. Pause the observer while we mutate
  // (the dropdown mount fills its own innerHTML) to avoid an infinite loop.
  let rewiring = false;
  const settingsPanel = document.getElementById("settings-markdown");
  const obs = new MutationObserver(() => {
    if (rewiring) return;
    rewiring = true;
    try { wireSettingsTab(); }
    finally {
      // Let the current microtask queue drain, then re-arm
      setTimeout(() => { rewiring = false; }, 0);
    }
  });
  if (settingsPanel) obs.observe(settingsPanel, { childList: true, subtree: true });

  // Keep toggles in sync when theme changes elsewhere (theme.js / system)
  const themeMQ = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  if (themeMQ && typeof themeMQ.addEventListener === "function") {
    themeMQ.addEventListener("change", () => {
      if (readThemePreference() === "system") applyThemePreference("system");
      syncAllToggles(document);
    });
  }
  document.addEventListener("portfolio:theme-change", () => syncAllToggles(document));
  document.addEventListener("portfolio:language-change", () => syncLanguageSegments(document));
  document.addEventListener("portfolio:perf-mode-change", () => {
    syncAllToggles(document);
    annotatePerfShortcutIn(document);
  });
  document.addEventListener("portfolio:animations-change", () => syncAllToggles(document));
  document.addEventListener("portfolio:video-bg-change", () => {
    syncAllToggles(document);
    annotatePerfShortcutIn(document);
  });
  document.addEventListener("portfolio:marie-kondo-change", () => {
    syncAllToggles(document);
    annotatePerfShortcutIn(document);
  });

})();


// ── "is this site lagging?" banner ──────────────────────────────────────────
// Points anyone on slower hardware at Marie Kondo mode, which strips the
// bubbles, video background and blur effects in one go. Shows once per
// visitor: dismissing it, or turning Marie Kondo on from anywhere, retires it.
(() => {
  const DISMISS_KEY = "portfolio-lag-banner";
  const MARIE_KONDO_KEY = "portfolio-marie-kondo";

  const banner = document.getElementById("lag-banner");
  const cta = document.getElementById("lag-banner-cta");
  const closeBtn = document.getElementById("lag-banner-close");
  if (!banner || !cta || !closeBtn) return;

  function marieKondoOn() {
    if (window.siteTheme && typeof window.siteTheme.getMarieKondoMode === "function") {
      return Boolean(window.siteTheme.getMarieKondoMode());
    }
    try { return localStorage.getItem(MARIE_KONDO_KEY) !== "off"; } catch (_) { return true; }
  }

  function dismissed() {
    try { return localStorage.getItem(DISMISS_KEY) === "dismissed"; } catch (_) { return false; }
  }

  function persistDismissal() {
    try { localStorage.setItem(DISMISS_KEY, "dismissed"); } catch (_) {}
  }

  let shown = false;

  function hide(permanent) {
    if (permanent) persistDismissal();
    if (!shown) return;
    shown = false;
    banner.classList.remove("is-open");
    document.documentElement.removeAttribute("data-lag-banner");
    setTimeout(() => {
      if (!shown) banner.hidden = true;
    }, 340);
  }

  function show() {
    if (shown || dismissed() || marieKondoOn()) return;
    shown = true;
    banner.hidden = false;
    // Two frames: one to get the element laid out in its off-screen start
    // position, one to let the transition to is-open actually run.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!shown) return;
        document.documentElement.setAttribute("data-lag-banner", "on");
        banner.classList.add("is-open");
      });
    });
  }

  cta.addEventListener("click", (e) => {
    e.preventDefault();
    hide(true);
    if (typeof window.__openSettingsPopover === "function") window.__openSettingsPopover();
    else window.location.href = "settings";
  });

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    hide(true);
  });

  document.addEventListener("portfolio:marie-kondo-change", () => {
    if (marieKondoOn()) hide(true);
  });

  // Let the page settle before sliding in, so it never competes with the
  // first paint it is complaining about.
  if (!dismissed() && !marieKondoOn()) setTimeout(show, 1500);
})();
