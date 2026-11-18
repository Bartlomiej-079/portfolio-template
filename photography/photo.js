/* Photography page — title sparkle typing + gallery scroll reveal */

const _SPARKLE_GLYPHS = ["✦", "✧", "✶", "✹"];
const _SPARKLE_COLORS = [
  ["typing-sparkle--gold",  0.48],
  ["typing-sparkle--amber", 0.68],
  ["typing-sparkle--sky",   0.86],
  ["typing-sparkle--mint",  0.95],
  ["typing-sparkle--rose",  1.00],
];
let _typingTimer = null;

function _isPerfMode() {
  return document.documentElement.getAttribute("data-perf-mode") === "on";
}

function _setSparkleText(el, text) {
  el.classList.add("typing-sparkle-host");
  let span = el.querySelector(":scope > .typing-sparkle-text");
  if (!span) {
    span = document.createElement("span");
    span.className = "typing-sparkle-text";
    el.textContent = "";
    el.appendChild(span);
  }
  span.textContent = String(text ?? "");
}

function _emitSparkles(el, intensity = 18) {
  if (!el || !el.isConnected) return;
  el.classList.add("typing-sparkle-host");
  const span   = el.querySelector(":scope > .typing-sparkle-text");
  const sr     = span  ? span.getBoundingClientRect()  : null;
  const hr     = el.getBoundingClientRect();
  const offX   = sr ? sr.left - hr.left : 0;
  const offY   = sr ? sr.top  - hr.top  : 0;
  const w      = Math.max(4,  Math.round(sr ? sr.width  : el.scrollWidth  || 4));
  const h      = Math.max(12, Math.round(sr ? sr.height : 18));
  const baseX  = offX + w;
  const baseY  = offY + Math.max(8, Math.round(h * 0.58));

  for (let i = 0; i < intensity; i++) {
    const s  = document.createElement("span");
    s.className = "typing-sparkle";
    s.textContent = _SPARKLE_GLYPHS[Math.floor(Math.random() * _SPARKLE_GLYPHS.length)];
    const r = Math.random();
    s.classList.add((_SPARKLE_COLORS.find(([, t]) => r < t) || _SPARKLE_COLORS.at(-1))[0]);
    s.style.setProperty("--sparkle-x",        `${Math.max(2, baseX + (Math.random() * 44 - 22))}px`);
    s.style.setProperty("--sparkle-y",        `${Math.max(4, baseY + (Math.random() * 32 - 16))}px`);
    s.style.setProperty("--sparkle-dx",       `${Math.round(Math.random() * 44 - 22)}px`);
    s.style.setProperty("--sparkle-dy",       `${Math.round(-26 - Math.random() * 30)}px`);
    s.style.setProperty("--sparkle-rot",      `${Math.round(Math.random() * 70 - 35)}deg`);
    s.style.setProperty("--sparkle-size",     `${(Math.random() * 0.32 + 0.44).toFixed(2)}rem`);
    s.style.setProperty("--sparkle-duration", `${Math.round(1100 + Math.random() * 700)}ms`);
    s.addEventListener("animationend", () => s.parentNode?.removeChild(s));
    el.appendChild(s);
  }
}

function _startTyping(el, text) {
  if (_typingTimer) { clearTimeout(_typingTimer); _typingTimer = null; }
  _setSparkleText(el, "");
  let i = 0;
  const step = () => {
    _setSparkleText(el, text.slice(0, i));
    if (i > 0 && !_isPerfMode()) _emitSparkles(el, 16);
    if (i <= text.length) { i++; _typingTimer = setTimeout(step, 85); }
  };
  _typingTimer = setTimeout(step, 300);
}

/* ── Title: fetch photography.md, extract H1 + intro ─────────── */
async function initPhotoTitle() {
  const titleEl = document.getElementById("photo-title");
  const introEl = document.getElementById("photo-intro");
  if (!titleEl) return;

  let title = "photography";
  try {
    const res = await fetch("photography.md?" + Date.now());
    if (res.ok) {
      const md = await res.text();
      const h1 = md.match(/^#\s+(.+)$/m);
      if (h1) title = h1[1].trim().toLowerCase();

      if (introEl) {
        const afterHeading = md.replace(/^#.*$/m, "").trim();
        const firstPara    = afterHeading.split(/\n{2,}/)[0]?.trim() ?? "";
        if (firstPara) introEl.textContent = firstPara;
      }

      /* render markdown content (columns, etc.) after intro if window.SiteMd exists */
      if (window.SiteMd) {
        const descContainer = document.getElementById("photo-description");
        if (descContainer && md) {
          /* remove the H1 heading and first paragraph from markdown to avoid duplication */
          const mdWithoutH1 = md.replace(/^#\s+.+$/m, "").trim();
          const mdWithoutFirstPara = mdWithoutH1.replace(/^[^\n]*\n\n/, "").trim();
          const htmlContent = window.SiteMd.markdownToHtml(mdWithoutFirstPara);
          descContainer.innerHTML = htmlContent;
        }
      }
    }
  } catch (_) { /* fallback to "photography" */ }

  _startTyping(titleEl, title);
}

/* ── Gallery scroll-reveal via IntersectionObserver ──────────── */
function setupGalleryReveal() {
  const items = document.querySelectorAll(".gallery-item");
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter(e => e.isIntersecting);
    visible.forEach((entry, i) => {
      const delay = i * 90;
      entry.target.style.setProperty("--reveal-delay", `${delay}ms`);
      entry.target.classList.add("is-visible");
      /* reset delay after entrance so hover transitions are instant */
      setTimeout(() => entry.target.style.setProperty("--reveal-delay", "0ms"), delay + 900);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.04, rootMargin: "0px 0px -16px 0px" });

  items.forEach(item => observer.observe(item));
}

/* expose so index.html inline script can call after buildGallery */
window.setupGalleryReveal = setupGalleryReveal;

document.addEventListener("DOMContentLoaded", initPhotoTitle);
