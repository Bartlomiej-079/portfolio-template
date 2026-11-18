/* App switcher — one catalog, every site.
 * Source of truth: https://example.com/switcher/apps.json
 * Usage:
 *   <script src="https://example.com/switcher/switcher.js" defer></script>
 * Optional mount in a header: <div data-lyceum-switcher data-current="app-one"></div>
 * Without a mount the launcher sits top-right.
 */
(function () {
  "use strict";

  var DEFAULT_BASE = "https://example.com/switcher/";
  var HOST_TO_ID = {
    // Map each hostname that embeds this switcher to the app id in apps.json,
    // so the launcher can highlight "you are here".
    "example.com": "portfolio",
    "www.example.com": "portfolio",
    "app-one.example.com": "app-one",
    "app-two.example.com": "app-two"
  };

  function scriptEl() {
    if (document.currentScript) return document.currentScript;
    var nodes = document.querySelectorAll('script[src*="switcher/switcher.js"]');
    return nodes[nodes.length - 1] || null;
  }

  function resolveBase() {
    var el = scriptEl();
    if (el && el.src) return el.src.replace(/switcher\.js(?:\?.*)?$/, "");
    return DEFAULT_BASE;
  }

  var BASE = resolveBase();
  var catalogPromise = null;
  var cssInjected = false;

  function loadCatalog() {
    if (catalogPromise) return catalogPromise;
    catalogPromise = fetch(BASE + "apps.json", { credentials: "omit" })
      .then(function (r) {
        if (!r.ok) throw new Error("apps.json " + r.status);
        return r.json();
      });
    return catalogPromise;
  }

  function currentId(root) {
    if (root && root.getAttribute) {
      var fromMount = root.getAttribute("data-current");
      if (fromMount) return fromMount;
    }
    var el = scriptEl();
    if (el) {
      var fromScript = el.getAttribute("data-current");
      if (fromScript) return fromScript;
    }
    return HOST_TO_ID[location.hostname] || "";
  }

  function isDark() {
    var root = document.documentElement;
    if (root.classList.contains("dark")) return true;
    var theme = root.getAttribute("data-theme");
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  var CSS =
    ".lv-root{position:relative;display:inline-flex;vertical-align:middle;font-family:Figtree,system-ui,sans-serif}" +
    ".lv-root.lv-float{position:fixed;top:max(0.75rem,env(safe-area-inset-top));right:max(0.75rem,env(safe-area-inset-right));z-index:2147483000}" +
    ".lv-btn{display:flex;align-items:center;justify-content:center;width:2.25rem;height:2.25rem;border-radius:999px;border:1px solid rgba(255,255,255,0.4);background:rgba(255,255,255,0.55);color:#57534e;box-shadow:0 1px 2px rgba(0,0,0,0.08);cursor:pointer}" +
    ".lv-btn:hover{background:rgba(255,255,255,0.85)}" +
    ".lv-root.is-dark .lv-btn{border-color:rgba(255,255,255,0.1);background:rgba(41,37,36,0.65);color:#d6d3d1}" +
    ".lv-root.is-dark .lv-btn:hover{background:rgba(41,37,36,0.9)}" +
    ".lv-panel{position:absolute;right:0;top:calc(100% + 0.5rem);z-index:2;width:min(19rem,calc(100vw - 1.5rem));border-radius:1rem;padding:0.75rem;background:rgba(255,255,255,0.88);border:1px solid rgba(28,25,23,0.08);box-shadow:0 18px 40px rgba(28,25,23,0.16);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}" +
    ".lv-root.is-dark .lv-panel{background:rgba(28,25,23,0.92);border-color:rgba(255,255,255,0.1);box-shadow:0 18px 40px rgba(0,0,0,0.45)}" +
    ".lv-head{display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-bottom:0.5rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(28,25,23,0.1)}" +
    ".lv-root.is-dark .lv-head{border-bottom-color:rgba(255,255,255,0.1)}" +
    ".lv-title{margin:0;padding:0 0.25rem;font-size:0.875rem;font-weight:600;color:#1c1917}" +
    ".lv-root.is-dark .lv-title{color:#fafaf9}" +
    ".lv-all{display:flex;align-items:center;justify-content:center;width:2rem;height:2rem;border-radius:0.75rem;color:#44403c;text-decoration:none}" +
    ".lv-all:hover{background:rgba(28,25,23,0.06)}" +
    ".lv-root.is-dark .lv-all{color:#e7e5e4}" +
    ".lv-root.is-dark .lv-all:hover{background:rgba(255,255,255,0.1)}" +
    ".lv-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0.25rem}" +
    ".lv-tile{display:flex;flex-direction:column;align-items:center;gap:0.35rem;padding:0.5rem 0.25rem;border-radius:0.75rem;text-decoration:none;text-align:center;color:#44403c}" +
    ".lv-tile:hover{background:rgba(28,25,23,0.06)}" +
    ".lv-root.is-dark .lv-tile{color:#e7e5e4}" +
    ".lv-root.is-dark .lv-tile:hover{background:rgba(255,255,255,0.1)}" +
    ".lv-icon{width:3.5rem;height:3.5rem;border-radius:0.75rem;overflow:hidden;background:#e7e5e4}" +
    ".lv-icon img{width:100%;height:100%;object-fit:cover;display:block}" +
    ".lv-label{width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.72rem;font-weight:500}";

  function ensureCss() {
    if (cssInjected) return;
    cssInjected = true;
    var style = document.createElement("style");
    style.setAttribute("data-lyceum-switcher", "");
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function svgGrid() {
    return (
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">' +
      '<path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>' +
      "</svg>"
    );
  }

  function svgLink() {
    return (
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' +
      '<polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>' +
      "</svg>"
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render(host, catalog) {
    ensureCss();
    if (host.getAttribute("data-lyceum-ready") === "1") return;
    host.setAttribute("data-lyceum-ready", "1");
    host.classList.add("lv-root");
    if (host.getAttribute("data-lyceum-float") === "1") host.classList.add("lv-float");
    if (isDark()) host.classList.add("is-dark");

    var current = currentId(host);
    var home = catalog.home || "https://example.com/apps";
    var title = catalog.title || "My Apps";
    var apps = catalog.apps || [];

    host.innerHTML =
      '<button type="button" class="lv-btn" aria-haspopup="dialog" aria-expanded="false" aria-label="Apps" title="Apps">' +
        svgGrid() +
      "</button>" +
      '<div class="lv-panel" role="dialog" aria-label="Apps" hidden></div>';

    var btn = host.querySelector(".lv-btn");
    var panel = host.querySelector(".lv-panel");

    function tiles() {
      return apps
        .map(function (app, i) {
          var href = app.href;
          var same = app.id === current;
          var target = same ? "" : ' target="_blank" rel="noreferrer"';
          return (
            '<a class="lv-tile" href="' +
            escapeHtml(href) +
            '"' +
            target +
            ' title="' +
            escapeHtml(app.description || "") +
            '" style="animation-delay:' +
            i * 40 +
            'ms">' +
            '<span class="lv-icon"><img src="' +
            escapeHtml(BASE + "icons/" + app.icon) +
            '" alt="" loading="lazy"></span>' +
            '<span class="lv-label">' +
            escapeHtml(app.name) +
            "</span></a>"
          );
        })
        .join("");
    }

    panel.innerHTML =
      '<div class="lv-head"><h2 class="lv-title">' +
      escapeHtml(title) +
      '</h2><a class="lv-all" href="' +
      escapeHtml(home) +
      '" target="_blank" rel="noreferrer" title="See all apps" aria-label="See all apps">' +
      svgLink() +
      "</a></div><div class=\"lv-grid\">" +
      tiles() +
      "</div>";

    function setOpen(open) {
      panel.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(panel.hidden);
    });

    panel.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (a) setOpen(false);
    });

    document.addEventListener("pointerdown", function (e) {
      if (!host.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var sync = function () {
        host.classList.toggle("is-dark", isDark());
      };
      if (mq.addEventListener) mq.addEventListener("change", sync);
      var obs = new MutationObserver(sync);
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    }
  }

  function mount(el) {
    if (!el) return;
    loadCatalog()
      .then(function (catalog) {
        render(el, catalog);
      })
      .catch(function (err) {
        console.warn("App switcher failed to load", err);
      });
  }

  function mountAll() {
    var nodes = document.querySelectorAll("[data-lyceum-switcher]");
    if (nodes.length) {
      Array.prototype.forEach.call(nodes, mount);
      return;
    }
    if (document.querySelector(".lv-root")) return;
    var float = document.createElement("div");
    float.setAttribute("data-lyceum-switcher", "");
    float.setAttribute("data-lyceum-float", "1");
    document.body.appendChild(float);
    mount(float);
  }

  window.LyceumSwitcher = { mount: mount, mountAll: mountAll };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll);
  } else {
    mountAll();
  }
})();
