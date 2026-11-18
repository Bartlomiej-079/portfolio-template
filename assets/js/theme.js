(function () {
  const STORAGE_KEY = "portfolio-theme";
  const PERF_MODE_KEY = "portfolio-perf-mode";
  const ANIMATIONS_MODE_KEY = "portfolio-animations";
  const VIDEO_BG_KEY = "portfolio-video-bg";
  const MARIE_KONDO_KEY = "portfolio-marie-kondo";
  const MARIE_KONDO_SNAPSHOT_KEY = "portfolio-marie-kondo-snapshot";
  const MEDIA_QUERY = "(prefers-color-scheme: dark)";
  const FOOTER_MARKDOWN_PATH = "pages/footer.md";
  const FOOTER_DEFAULT_VIDEO_PATH = "assets/videos/lake_district.mp4";
  const APP_FRAME_VIDEO_PATH = "assets/videos/hampton_court.mp4";

  function computeSiteRoot() {
    const existing = window.__SITE_ROOT__;
    if (typeof existing === "string" && existing.trim()) {
      return existing.endsWith("/") ? existing : existing + "/";
    }

    const pathname = window.location.pathname || "/";
    const hostname = window.location.hostname || "";
    const segments = pathname.split("/").filter(Boolean);
    const isGithubPagesHost = /\.github\.io$/i.test(hostname);
    const root = isGithubPagesHost && segments.length > 0 ? "/" + segments[0] + "/" : "/";
    window.__SITE_ROOT__ = root;
    return root;
  }

  const SITE_ROOT = computeSiteRoot();

  function getStoredPreference() {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY);
      return value === "dark" || value === "light" || value === "system" ? value : null;
    } catch {
      return null;
    }
  }

  function getSystemTheme() {
    if (!window.matchMedia) return "light";
    return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
  }

  function resolveTheme(preference) {
    if (preference === "dark" || preference === "light") {
      return preference;
    }
    return getSystemTheme();
  }

  function setThemeAttribute(theme) {
    const resolved = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
    return resolved;
  }

  function persistPreference(preference) {
    try {
      window.localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Ignore storage errors (private mode/restricted storage).
    }
  }

  function clearPreference() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors (private mode/restricted storage).
    }
  }

  function normalizeFooterPath(pathValue) {
    const cleaned = String(pathValue || "").trim().replace(/^\/+/, "");
    return SITE_ROOT + cleaned;
  }

  function normalizeAssetPath(pathValue) {
    const value = String(pathValue || "").trim();
    if (!value) return "";
    if (/^(?:[a-z]+:)?\/\//i.test(value) || /^data:/i.test(value)) return value;
    if (value.startsWith("/")) return SITE_ROOT + value.replace(/^\/+/, "");
    return SITE_ROOT + value.replace(/^\.?\/?/, "");
  }

  function normalizeFooterLinksAndMedia(container) {
    if (!container) return;

    const links = Array.from(container.querySelectorAll("a[href]"));
    links.forEach(function (link) {
      const href = String(link.getAttribute("href") || "").trim();
      if (!href) return;
      if (/^(?:[a-z]+:)?\/\//i.test(href) || /^(?:mailto:|tel:|#)/i.test(href)) return;
      if (href.startsWith("/")) {
        link.setAttribute("href", SITE_ROOT + href.replace(/^\/+/, ""));
        return;
      }
      link.setAttribute("href", SITE_ROOT + href.replace(/^\.?\/?/, ""));
    });

    const mediaNodes = Array.from(container.querySelectorAll("img[src], video[src], source[src]"));
    mediaNodes.forEach(function (node) {
      const src = String(node.getAttribute("src") || "").trim();
      if (!src) return;
      if (/^(?:[a-z]+:)?\/\//i.test(src) || /^data:/i.test(src)) return;
      if (src.startsWith("/")) {
        node.setAttribute("src", SITE_ROOT + src.replace(/^\/+/, ""));
        return;
      }
      node.setAttribute("src", SITE_ROOT + src.replace(/^\.?\/?/, ""));
    });
  }

  function parseFooterContent(markdown) {
    const raw = String(markdown || "").trim();
    if (!raw) return "";

    // Allow raw HTML in footer.md for complete control.
    if (/<[a-z][\s\S]*>/i.test(raw)) {
      return raw;
    }

    const escaped = raw
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    return "<p>" + escaped.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br />") + "</p>";
  }

  async function loadFooterMarkup() {
    const path = normalizeFooterPath(FOOTER_MARKDOWN_PATH);
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      const markdown = await response.text();
      const html = parseFooterContent(markdown);
      if (!html) {
        return null;
      }

      return html;
    } catch {
      return null;
    }
  }

  function injectFooterVideo(footer, videoSrc) {
    if (!footer) return;

    const primaryVideoSrc = normalizeAssetPath(videoSrc || FOOTER_DEFAULT_VIDEO_PATH);
    if (!primaryVideoSrc) return;

    const attemptPlay = function (video) {
      if (!video || !videoBgEnabled) return;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          // Autoplay can fail transiently; event listeners below retry.
        });
      }
    };

    const existing = footer.querySelector(".site-footer-video");
    if (existing) {
      existing.src = primaryVideoSrc;
      existing.load();
      attemptPlay(existing);
      return;
    }

    const video = document.createElement("video");
    video.className = "site-footer-video";
    if (videoBgEnabled) video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("loop", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("preload", "metadata");
    video.setAttribute("aria-hidden", "true");
    video.autoplay = videoBgEnabled;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.src = primaryVideoSrc;
    video.addEventListener("canplay", function () {
      attemptPlay(video);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") {
        attemptPlay(video);
      }
    });

    footer.insertBefore(video, footer.firstChild);
    attemptPlay(video);
  }

  function injectAppFrameVideo() {
    const appFrames = Array.from(document.querySelectorAll(".app-frame"));
    if (!appFrames.length) return;

    const videoSrc = normalizeAssetPath(APP_FRAME_VIDEO_PATH);
    if (!videoSrc) return;

    const attemptPlay = function (video) {
      if (!video || !videoBgEnabled) return;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          // Autoplay can fail transiently; visibility/canplay handlers retry.
        });
      }
    };

    appFrames.forEach(function (frame) {
      const existing = frame.querySelector(":scope > .app-frame-video");
      if (existing) {
        existing.src = videoSrc;
        existing.load();
        attemptPlay(existing);
        return;
      }

      const video = document.createElement("video");
      video.className = "app-frame-video";
      if (videoBgEnabled) video.setAttribute("autoplay", "");
      video.setAttribute("muted", "");
      video.setAttribute("loop", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("preload", "metadata");
      video.setAttribute("aria-hidden", "true");
      video.autoplay = videoBgEnabled;
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.src = videoSrc;

      video.addEventListener("canplay", function () {
        attemptPlay(video);
      });

      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") {
          attemptPlay(video);
        }
      });

      frame.insertBefore(video, frame.firstChild);
      attemptPlay(video);
    });
  }

  function ensureFooterToggle() {
    if (document.querySelector(".site-footer")) return;

    const footer = document.createElement("footer");
    footer.className = "site-footer site-footer-auto";
    footer.innerHTML = '<div class="site-footer-inner"><span class="site-footer-text">footer</span></div>';

    const host = document.querySelector("main") || document.body;
    host.appendChild(footer);
  }

  function ensureFallbackThemeControl(footer) {
    if (!footer) return;
    if (footer.querySelector("[data-theme-choice], [data-theme-toggle]")) return;

    const container = document.createElement("div");
    container.className = "theme-choice-group";
    container.setAttribute("role", "group");
    container.setAttribute("aria-label", "Theme mode");

    ["system", "light", "dark"].forEach(function (mode) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "theme-toggle";
      button.setAttribute("data-theme-choice", mode);
      button.textContent = mode;
      container.appendChild(button);
    });

    const footerInner = footer.querySelector(".site-footer-inner") || footer;
    footerInner.appendChild(container);
  }

  function updateToggleButtons(theme, preference) {
    const buttons = document.querySelectorAll("[data-theme-toggle]");
    const choiceButtons = document.querySelectorAll("[data-theme-choice]");
    const systemTheme = getSystemTheme();
    const storedMode = preference === "dark" || preference === "light" ? preference : "system";

    buttons.forEach((button) => {
      const nextTheme = theme === "dark" ? "light" : "dark";
      button.textContent = "switch to " + nextTheme + " mode";
      button.setAttribute("aria-label", "Switch to " + nextTheme + " mode");
      button.setAttribute("data-theme-current", theme);
      if (storedMode === "system") {
        button.setAttribute("title", "following system (" + systemTheme + ")");
      } else {
        button.removeAttribute("title");
      }
    });

    choiceButtons.forEach((button) => {
      const mode = String(button.getAttribute("data-theme-choice") || "").toLowerCase();
      const isActive = mode === storedMode;
      button.classList.toggle("is-active", isActive);
      if (mode === "system") {
        button.setAttribute("title", "system is " + systemTheme);
      }
    });
  }

  function apply(preference) {
    const activeTheme = setThemeAttribute(resolveTheme(preference));
    updateToggleButtons(activeTheme, preference);
    return activeTheme;
  }

  function getPerfModeEnabled() {
    try {
      // Default off when unset; only "on" enables.
      return window.localStorage.getItem(PERF_MODE_KEY) === "on";
    } catch {
      return false;
    }
  }

  function persistPerfMode(enabled) {
    try {
      window.localStorage.setItem(PERF_MODE_KEY, enabled ? "on" : "off");
    } catch {
      // Ignore storage errors.
    }
  }

  let perfModeEnabled = getPerfModeEnabled();

  const isMacPlatform = /Mac|iPhone|iPad|iPod/.test(navigator.platform || "") ||
    /Mac OS X/.test(navigator.userAgent || "");
  const PERF_SHORTCUT_LABEL = (isMacPlatform ? "⌘" : "Ctrl") + "/";
  const ANIM_SHORTCUT_LABEL = (isMacPlatform ? "⌘" : "Ctrl") + "\\";
  const ANIM_KEYSHORTCUTS = (isMacPlatform ? "Meta" : "Control") + "+Backslash";
  const VIDEO_BG_SHORTCUT_LABEL = (isMacPlatform ? "⌘" : "Ctrl") + ";";
  const VIDEO_BG_KEYSHORTCUTS = (isMacPlatform ? "Meta" : "Control") + "+Semicolon";
  const MARIE_KONDO_SHORTCUT_LABEL = (isMacPlatform ? "⌘" : "Ctrl") + "M";
  const MARIE_KONDO_KEYSHORTCUTS = (isMacPlatform ? "Meta" : "Control") + "+KeyM";

  // While Marie Kondo mode is on, it owns perf/animations/video-bg — direct
  // calls to their setters are ignored unless made from inside
  // setMarieKondoMode() itself (which flips this flag around its own calls).
  let marieKondoOverrideActive = false;

  function applyPerfMode(enabled) {
    if (enabled) {
      document.documentElement.setAttribute("data-perf-mode", "on");
    } else {
      document.documentElement.removeAttribute("data-perf-mode");
    }

    const btn = document.getElementById("perf-mode-btn");
    if (btn) btn.classList.toggle("is-active", enabled);
  }

  function setPerfMode(enabled, options) {
    if (marieKondoEnabled && !marieKondoOverrideActive) return perfModeEnabled;
    const next = Boolean(enabled);
    const opts = options || {};
    perfModeEnabled = next;
    if (opts.persist !== false) persistPerfMode(next);
    applyPerfMode(next);
    if (opts.dispatch !== false) {
      document.dispatchEvent(new CustomEvent("portfolio:perf-mode-change", {
        detail: { enabled: next }
      }));
    }
    return next;
  }

  function togglePerfMode(options) {
    return setPerfMode(!perfModeEnabled, options);
  }

  function getAnimationsEnabled() {
    try {
      const stored = window.localStorage.getItem(ANIMATIONS_MODE_KEY);
      if (stored === "on") return true;
      if (stored === "off") return false;
    } catch {
      // Ignore storage errors.
    }
    // No explicit preference yet — the bubbles stay off until opted into.
    return false;
  }

  function persistAnimationsMode(enabled) {
    try {
      window.localStorage.setItem(ANIMATIONS_MODE_KEY, enabled ? "on" : "off");
    } catch {
      // Ignore storage errors.
    }
  }

  let animationsEnabled = getAnimationsEnabled();

  function applyAnimationsMode(enabled) {
    if (enabled) {
      document.documentElement.setAttribute("data-animations", "on");
    } else {
      document.documentElement.removeAttribute("data-animations");
    }
  }

  function setAnimationsMode(enabled, options) {
    if (marieKondoEnabled && !marieKondoOverrideActive) return animationsEnabled;
    const next = Boolean(enabled);
    const opts = options || {};
    animationsEnabled = next;
    if (opts.persist !== false) persistAnimationsMode(next);
    applyAnimationsMode(next);
    if (opts.dispatch !== false) {
      document.dispatchEvent(new CustomEvent("portfolio:animations-change", {
        detail: { enabled: next }
      }));
    }
    return next;
  }

  function toggleAnimationsMode(options) {
    return setAnimationsMode(!animationsEnabled, options);
  }

  function getVideoBgEnabled() {
    try {
      // Default on when unset; only "off" disables.
      return window.localStorage.getItem(VIDEO_BG_KEY) !== "off";
    } catch {
      return true;
    }
  }

  function persistVideoBgMode(enabled) {
    try {
      window.localStorage.setItem(VIDEO_BG_KEY, enabled ? "on" : "off");
    } catch {
      // Ignore storage errors.
    }
  }

  let videoBgEnabled = getVideoBgEnabled();

  function applyVideoBgMode(enabled) {
    if (enabled) {
      document.documentElement.setAttribute("data-video-bg", "on");
    } else {
      document.documentElement.removeAttribute("data-video-bg");
    }

    const videos = Array.from(document.querySelectorAll(".app-frame-video, .site-footer-video"));
    videos.forEach(function (video) {
      if (enabled) {
        const p = video.play();
        if (p && typeof p.catch === "function") p.catch(function () {});
      } else {
        video.pause();
      }
    });
  }

  function setVideoBgMode(enabled, options) {
    if (marieKondoEnabled && !marieKondoOverrideActive) return videoBgEnabled;
    const next = Boolean(enabled);
    const opts = options || {};
    videoBgEnabled = next;
    if (opts.persist !== false) persistVideoBgMode(next);
    applyVideoBgMode(next);
    if (opts.dispatch !== false) {
      document.dispatchEvent(new CustomEvent("portfolio:video-bg-change", {
        detail: { enabled: next }
      }));
    }
    return next;
  }

  function toggleVideoBgMode(options) {
    return setVideoBgMode(!videoBgEnabled, options);
  }

  function getMarieKondoEnabled() {
    try {
      return window.localStorage.getItem(MARIE_KONDO_KEY) === "on";
    } catch {
      return false;
    }
  }

  function hasMarieKondoPreference() {
    try {
      const preference = window.localStorage.getItem(MARIE_KONDO_KEY);
      return preference === "on" || preference === "off";
    } catch {
      return false;
    }
  }

  const enableMarieKondoByDefault = !hasMarieKondoPreference();

  function persistMarieKondoMode(enabled) {
    try {
      window.localStorage.setItem(MARIE_KONDO_KEY, enabled ? "on" : "off");
    } catch {
      // Ignore storage errors.
    }
  }

  function readMarieKondoSnapshot() {
    try {
      const raw = window.localStorage.getItem(MARIE_KONDO_SNAPSHOT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }

  function writeMarieKondoSnapshot(snapshot) {
    try {
      window.localStorage.setItem(MARIE_KONDO_SNAPSHOT_KEY, JSON.stringify(snapshot));
    } catch {
      // Ignore storage errors.
    }
  }

  function clearMarieKondoSnapshot() {
    try {
      window.localStorage.removeItem(MARIE_KONDO_SNAPSHOT_KEY);
    } catch {
      // Ignore storage errors.
    }
  }

  let marieKondoEnabled = getMarieKondoEnabled();

  function applyMarieKondoMode(enabled) {
    if (enabled) {
      document.documentElement.setAttribute("data-marie-kondo", "on");
    } else {
      document.documentElement.removeAttribute("data-marie-kondo");
    }
  }

  function setMarieKondoMode(enabled, options) {
    const next = Boolean(enabled);
    const opts = options || {};
    if (next === marieKondoEnabled) return next;

    marieKondoOverrideActive = true;
    try {
      if (next) {
        // Declutter: remember the pre-Kondo state, then force every other
        // effect toggle to its fastest setting.
        writeMarieKondoSnapshot({
          perf: perfModeEnabled,
          animations: animationsEnabled,
          videoBg: videoBgEnabled
        });
        setPerfMode(true, opts);
        setAnimationsMode(false, opts);
        setVideoBgMode(false, opts);
      } else {
        const snapshot = readMarieKondoSnapshot();
        if (snapshot) {
          setPerfMode(Boolean(snapshot.perf), opts);
          setAnimationsMode(Boolean(snapshot.animations), opts);
          setVideoBgMode(Boolean(snapshot.videoBg), opts);
        }
        clearMarieKondoSnapshot();
      }
    } finally {
      marieKondoOverrideActive = false;
    }

    marieKondoEnabled = next;
    if (opts.persist !== false) persistMarieKondoMode(next);
    applyMarieKondoMode(next);
    if (opts.dispatch !== false) {
      document.dispatchEvent(new CustomEvent("portfolio:marie-kondo-change", {
        detail: { enabled: next }
      }));
    }
    return next;
  }

  function toggleMarieKondoMode(options) {
    return setMarieKondoMode(!marieKondoEnabled, options);
  }

  function appendShortcutKbd(label, shortcutLabel) {
    if (!label || label.dataset.shortcutAnnotated === "true") return;
    label.dataset.shortcutAnnotated = "true";
    const kbd = document.createElement("kbd");
    kbd.className = "settings-shortcut-kbd";
    kbd.textContent = shortcutLabel;
    kbd.setAttribute("aria-hidden", "true");
    label.appendChild(document.createTextNode(" "));
    label.appendChild(kbd);
  }

  function annotatePerfShortcutHints() {
    const btn = document.getElementById("perf-mode-btn");
    if (btn) {
      const base = (window.portfolioI18n && typeof window.portfolioI18n.t === "function")
        ? window.portfolioI18n.t("tooltip.perf")
        : "Is this site running too slow? Disable all the cool effects.";
      btn.setAttribute("data-tooltip", base + " (" + PERF_SHORTCUT_LABEL + ")");
      btn.setAttribute("aria-keyshortcuts", (isMacPlatform ? "Meta" : "Control") + "+Slash");
    }
    document.querySelectorAll('.ios-toggle[data-toggle="animation"]').forEach(function (toggle) {
      toggle.setAttribute("aria-keyshortcuts", ANIM_KEYSHORTCUTS);
    });
    document.querySelectorAll('.ios-toggle[data-toggle="video-bg"]').forEach(function (toggle) {
      toggle.setAttribute("aria-keyshortcuts", VIDEO_BG_KEYSHORTCUTS);
    });
    document.querySelectorAll('.ios-toggle[data-toggle="marie-kondo"]').forEach(function (toggle) {
      toggle.setAttribute("aria-keyshortcuts", MARIE_KONDO_KEYSHORTCUTS);
    });
    document.querySelectorAll("[data-setting] .settings-row-label").forEach(function (label) {
      if (label.dataset.shortcutAnnotated === "true") return;
      var setting = label.closest("[data-setting]") && label.closest("[data-setting]").getAttribute("data-setting");
      if (setting === "perf") appendShortcutKbd(label, PERF_SHORTCUT_LABEL);
      else if (setting === "video-bg") appendShortcutKbd(label, VIDEO_BG_SHORTCUT_LABEL);
      else if (setting === "marie-kondo") appendShortcutKbd(label, MARIE_KONDO_SHORTCUT_LABEL);
      else if (setting === "animation") appendShortcutKbd(label, ANIM_SHORTCUT_LABEL);
    });
  }

  function initTooltip() {
    const tip = document.createElement("div");
    tip.id = "site-tooltip";
    tip.setAttribute("role", "tooltip");
    tip.setAttribute("aria-hidden", "true");
    document.body.appendChild(tip);

    function show(el) {
      const text = el.getAttribute("data-tooltip");
      if (!text) return;
      // <dialog> elements live in the browser top layer — move the tooltip
      // into any open dialog so it renders above the dialog backdrop.
      const dialog = el.closest("dialog");
      const parent = dialog || document.body;
      if (tip.parentNode !== parent) parent.appendChild(tip);
      tip.textContent = text;
      tip.classList.add("is-visible");
      requestAnimationFrame(function () {
        const r = el.getBoundingClientRect();
        const tr = tip.getBoundingClientRect();
        let top = r.top - tr.height - 8;
        let left = r.left + r.width / 2 - tr.width / 2;
        if (top < 4) top = r.bottom + 8;
        left = Math.max(8, Math.min(left, window.innerWidth - tr.width - 8));
        tip.style.top = top + "px";
        tip.style.left = left + "px";
      });
    }

    function hide() {
      tip.classList.remove("is-visible");
    }

    function closestTooltipHost(target) {
      const node = target && typeof target.closest === "function"
        ? target
        : target && target.parentElement;
      return node && typeof node.closest === "function" ? node.closest("[data-tooltip]") : null;
    }

    document.addEventListener("mouseenter", function (e) {
      const el = closestTooltipHost(e.target);
      if (el) show(el);
    }, true);

    document.addEventListener("mouseleave", function (e) {
      const el = closestTooltipHost(e.target);
      if (el) hide();
    }, true);

    document.addEventListener("focusin", function (e) {
      const el = closestTooltipHost(e.target);
      if (el) show(el);
    });

    document.addEventListener("focusout", function (e) {
      const el = closestTooltipHost(e.target);
      if (el) hide();
    });
  }

  function firePerfRipple(btn, event) {
    var rect = btn.getBoundingClientRect();
    var x = event ? ((event.clientX - rect.left) / rect.width * 100) : 50;
    var y = event ? ((event.clientY - rect.top) / rect.height * 100) : 50;
    btn.style.setProperty("--ripple-x", x + "%");
    btn.style.setProperty("--ripple-y", y + "%");
    btn.classList.remove("is-rippling");
    void btn.offsetWidth;
    btn.classList.add("is-rippling");
    btn.addEventListener("animationend", function () {
      btn.classList.remove("is-rippling");
    }, { once: true });
  }

  function wirePerfModeButton() {
    var btn = document.getElementById("perf-mode-btn");
    if (!btn || btn.dataset.perfModeBound === "true") return;
    btn.dataset.perfModeBound = "true";
    btn.addEventListener("click", function (event) {
      if (marieKondoEnabled) return;
      firePerfRipple(btn, event);
      togglePerfMode();
    });
    applyPerfMode(perfModeEnabled);
    annotatePerfShortcutHints();
  }

  function isShortcutTypingTarget(target) {
    const tag = (target && target.tagName) || "";
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (target && target.isContentEditable);
  }

  function wirePerfModeShortcut() {
    if (document.documentElement.dataset.perfShortcutBound === "true") return;
    document.documentElement.dataset.perfShortcutBound = "true";
    document.addEventListener("keydown", function (e) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (!isMeta || e.altKey || e.shiftKey) return;
      if (e.key !== "/" && e.code !== "Slash") return;
      if (isShortcutTypingTarget(e.target)) return;
      if (marieKondoEnabled) return;

      e.preventDefault();
      const btn = document.getElementById("perf-mode-btn");
      if (btn) firePerfRipple(btn, null);
      togglePerfMode();
    });
  }

  function wireAnimationsShortcut() {
    if (document.documentElement.dataset.animShortcutBound === "true") return;
    document.documentElement.dataset.animShortcutBound = "true";
    document.addEventListener("keydown", function (e) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (!isMeta || e.altKey || e.shiftKey) return;
      if (e.key !== "\\" && e.code !== "Backslash" && e.code !== "IntlBackslash") return;
      if (isShortcutTypingTarget(e.target)) return;

      e.preventDefault();
      toggleAnimationsMode();
    });
  }

  function wireVideoBgShortcut() {
    if (document.documentElement.dataset.videoBgShortcutBound === "true") return;
    document.documentElement.dataset.videoBgShortcutBound = "true";
    document.addEventListener("keydown", function (e) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (!isMeta || e.altKey || e.shiftKey) return;
      if (e.key !== ";" && e.code !== "Semicolon") return;
      if (isShortcutTypingTarget(e.target)) return;

      e.preventDefault();
      toggleVideoBgMode();
    }, true);
  }

  function wireMarieKondoShortcut() {
    if (document.documentElement.dataset.marieKondoShortcutBound === "true") return;
    document.documentElement.dataset.marieKondoShortcutBound = "true";
    document.addEventListener("keydown", function (e) {
      const isMeta = e.metaKey || e.ctrlKey;
      if (!isMeta || e.altKey || e.shiftKey) return;
      if (e.key.toLowerCase() !== "m" && e.code !== "KeyM") return;
      if (isShortcutTypingTarget(e.target)) return;

      e.preventDefault();
      toggleMarieKondoMode();
    });
  }

  let preference = getStoredPreference();

  function handleToggleClick() {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    preference = current === "dark" ? "light" : "dark";
    persistPreference(preference);
    apply(preference);
  }

  function handleChoiceClick(event) {
    const button = event.currentTarget;
    const mode = String(button.getAttribute("data-theme-choice") || "").toLowerCase();
    if (mode !== "system" && mode !== "light" && mode !== "dark") return;

    preference = mode;
    if (mode === "system") {
      clearPreference();
    } else {
      persistPreference(mode);
    }
    apply(preference);
  }

  function wireToggleButtons() {
    const buttons = document.querySelectorAll("[data-theme-toggle]");
    const choiceButtons = document.querySelectorAll("[data-theme-choice]");

    buttons.forEach((button) => {
      if (button.dataset.themeToggleBound === "true") return;
      button.dataset.themeToggleBound = "true";
      button.addEventListener("click", handleToggleClick);
    });

    choiceButtons.forEach((button) => {
      if (button.dataset.themeChoiceBound === "true") return;
      button.dataset.themeChoiceBound = "true";
      button.addEventListener("click", handleChoiceClick);
    });
  }

  function initFooterDynamics(footer) {
    if (!footer) return;

    var visitorCounter = footer.querySelector(".visitor-counter-img")
      || footer.querySelector('img[src*="hitwebcounter.com/counter/counter.php"]');
    if (visitorCounter) {
      var baseSrc = String(visitorCounter.getAttribute("src") || "").trim();
      if (baseSrc) {
        var retryAttempted = false;
        var toBust = function (srcValue) {
          var sep = srcValue.indexOf("?") >= 0 ? "&" : "?";
          return srcValue + sep + "cb=" + Date.now();
        };

        // Bust stale caches; some mobile browsers cache failed image responses aggressively.
        visitorCounter.setAttribute("src", toBust(baseSrc));
        visitorCounter.setAttribute("loading", "eager");
        visitorCounter.setAttribute("decoding", "async");

        visitorCounter.addEventListener("error", function () {
          if (!retryAttempted) {
            retryAttempted = true;
            var alternate = baseSrc.replace("www.hitwebcounter.com", "hitwebcounter.com");
            visitorCounter.setAttribute("src", toBust(alternate));
            return;
          }

          var fallback = document.createElement("span");
          fallback.className = "site-footer-tiny";
          fallback.textContent = (window.portfolioI18n && window.portfolioI18n.t)
            ? window.portfolioI18n.t("footer.counterUnavailable")
            : "counter unavailable";
          visitorCounter.replaceWith(fallback);
        }, { once: false });
      }
    }

    // Social icons — self-contained, no dependency on script.js
    var socialContainer = footer.querySelector("#footer-social-links");
    if (socialContainer) {
      var socialLinks = [
        { href: "mailto:hello@example.com",        label: "Email",     iconPath: '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>' },
        { href: "https://github.com/your-username",      label: "GitHub",    blank: true, me: true, iconPath: '<path d="M12 0C5.373 0 0 5.373 0 12a12 12 0 0 0 8.207 11.387c.6.111.793-.261.793-.577v-2.234c-3.338.727-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.808 1.305 3.493.998.107-.776.418-1.305.762-1.604-2.665-.304-5.467-1.334-5.467-5.93 0-1.31.469-2.381 1.236-3.221-.124-.304-.535-1.525.117-3.177 0 0 1.008-.322 3.301 1.23A11.52 11.52 0 0 1 12 5.8c1.02.005 2.047.138 3.006.404 2.292-1.552 3.3-1.23 3.3-1.23.653 1.653.242 2.874.118 3.177.768.84 1.236 1.91 1.236 3.22 0 4.609-2.806 5.626-5.479 5.922.43.372.823 1.102.823 2.222v3.293c0 .319.192.688.801.576A12.004 12.004 0 0 0 24 12c0-6.627-5.373-12-12-12Z"/>' },
        { href: "https://www.linkedin.com/in/your-username", label: "LinkedIn",  blank: true, me: true, iconPath: '<path d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.978 0 1.778-.773 1.778-1.729V1.729C24 .774 23.2 0 22.225 0ZM7.119 20.452H3.555V9h3.564v11.452ZM5.337 7.433a2.065 2.065 0 1 1 0-4.129 2.065 2.065 0 0 1 0 4.129ZM20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286Z"/>' },
        { href: "https://x.com/yourusername",            label: "Twitter",   blank: true, me: true, iconPath: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>' },
        { href: "https://www.instagram.com/your.username", label: "Instagram", blank: true, me: true, iconPath: '<path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.9A3.85 3.85 0 0 0 3.9 7.75v8.5A3.85 3.85 0 0 0 7.75 20.1h8.5a3.85 3.85 0 0 0 3.85-3.85v-8.5a3.85 3.85 0 0 0-3.85-3.85h-8.5Zm9.03 1.45a1.18 1.18 0 1 1 0 2.36 1.18 1.18 0 0 1 0-2.36ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.9A3.1 3.1 0 1 0 12 15.1 3.1 3.1 0 0 0 12 8.9Z"/>' },
        { href: "https://www.youtube.com/@yourusername",  label: "YouTube",   blank: true, me: true, iconPath: '<path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>' },
        { href: "info",                                 label: "Info",      iconPath: '<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.182c5.423 0 9.818 4.395 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818-5.423 0-9.818-4.395-9.818-9.818C2.182 6.577 6.577 2.182 12 2.182zm-.545 4.363a1.636 1.636 0 1 0 1.09 0v.002zm-.273 3.819v7.272h1.636V10.364h-1.636z"/>' }
      ];
      socialLinks.forEach(function (item) {
        var a = document.createElement("a");
        a.href = item.href;
        a.className = "site-footer-social-link";
        a.setAttribute("aria-label", item.label);
        a.setAttribute("title", item.label);
        if (item.blank && item.me) { a.target = "_blank"; a.rel = "me noopener noreferrer"; }
        else if (item.blank) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
        else if (item.me) { a.rel = "me"; }
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.setAttribute("aria-hidden", "true");
        svg.innerHTML = item.iconPath;
        a.appendChild(svg);
        socialContainer.appendChild(a);
      });
    }

    // Last-updated date from GitHub API
    var dateEl = footer.querySelector("#footer-last-updated");
    if (dateEl) {
      fetch("https://api.github.com/repos/your-username/portfolio-template")
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.pushed_at) return;
          var d = new Date(data.pushed_at);
          var locale = (window.portfolioI18n && window.portfolioI18n.locale)
            ? window.portfolioI18n.locale()
            : "en-GB";
          dateEl.textContent = d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
        })
        .catch(function () {});
    }
  }

  async function initializeTheme() {
    if (enableMarieKondoByDefault) {
      setMarieKondoMode(true, { dispatch: false });
    }
    injectAppFrameVideo();
    ensureFooterToggle();
    const footer = document.querySelector(".site-footer");
    const loadedFooter = await loadFooterMarkup();
    if (footer && loadedFooter) {
      footer.innerHTML = loadedFooter;
      normalizeFooterLinksAndMedia(footer);
      initFooterDynamics(footer);
      if (window.portfolioI18n && typeof window.portfolioI18n.apply === "function") {
        window.portfolioI18n.apply(footer);
      }
    }
    injectFooterVideo(footer, FOOTER_DEFAULT_VIDEO_PATH);
    ensureFallbackThemeControl(footer);
    wireToggleButtons();
    wirePerfModeButton();
    wirePerfModeShortcut();
    wireAnimationsShortcut();
    wireVideoBgShortcut();
    wireMarieKondoShortcut();
    annotatePerfShortcutHints();
    applyAnimationsMode(animationsEnabled);
    applyVideoBgMode(videoBgEnabled);
    applyMarieKondoMode(marieKondoEnabled);
    initTooltip();
    apply(preference);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeTheme, { once: true });
  } else {
    initializeTheme();
  }

  if (window.matchMedia) {
    const media = window.matchMedia(MEDIA_QUERY);
    const onMediaChange = function () {
      if (preference === null || preference === "system") {
        apply(null);
      }
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onMediaChange);
    } else if (typeof media.addListener === "function") {
      media.addListener(onMediaChange);
    }
  }

  window.siteTheme = {
    set(theme) {
      if (theme !== "dark" && theme !== "light" && theme !== "system") return;
      preference = theme;
      if (theme === "system") {
        clearPreference();
      } else {
        persistPreference(preference);
      }
      apply(preference);
    },
    clearPreference() {
      preference = "system";
      clearPreference();
      apply("system");
    },
    getPerfMode() {
      return perfModeEnabled;
    },
    setPerfMode(enabled) {
      return setPerfMode(enabled);
    },
    togglePerfMode() {
      return togglePerfMode();
    },
    getPerfShortcutLabel() {
      return PERF_SHORTCUT_LABEL;
    },
    getAnimShortcutLabel() {
      return ANIM_SHORTCUT_LABEL;
    },
    annotatePerfShortcutHints() {
      annotatePerfShortcutHints();
    },
    getAnimationsEnabled() {
      return animationsEnabled;
    },
    setAnimationsEnabled(enabled) {
      return setAnimationsMode(enabled);
    },
    toggleAnimationsEnabled(options) {
      return toggleAnimationsMode(options);
    },
    getVideoBgEnabled() {
      return videoBgEnabled;
    },
    setVideoBgEnabled(enabled) {
      return setVideoBgMode(enabled);
    },
    toggleVideoBgEnabled(options) {
      return toggleVideoBgMode(options);
    },
    getVideoBgShortcutLabel() {
      return VIDEO_BG_SHORTCUT_LABEL;
    },
    getMarieKondoMode() {
      return marieKondoEnabled;
    },
    setMarieKondoMode(enabled, options) {
      return setMarieKondoMode(enabled, options);
    },
    toggleMarieKondoMode(options) {
      return toggleMarieKondoMode(options);
    },
    getMarieKondoShortcutLabel() {
      return MARIE_KONDO_SHORTCUT_LABEL;
    }
  };
})();
