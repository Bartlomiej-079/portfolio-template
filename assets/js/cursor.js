const cursor = document.getElementById("custom-cursor");
const rootStyle = document.documentElement.style;
let lastFlameTime = 0;
let lastCursorX = 0;
let lastCursorY = 0;
let lastCursorTime = 0;

function isPerfMode() {
  return document.documentElement.getAttribute("data-perf-mode") === "on";
}

function isMarieKondoOn() {
  return document.documentElement.getAttribute("data-marie-kondo") === "on";
}

// The flame trail is one of the "cool effects" performance mode turns off. It
// is deliberately independent of the bubbles toggle.
function isCustomCursorEnabled() {
  return !isPerfMode() && !isMarieKondoOn();
}

// The rocket cursor replaces the native pointer, so it shows in every mode —
// only Marie Kondo mode retires it.
function isRocketCursorVisible() {
  return !isMarieKondoOn();
}

function updateShadowFromCursor(clientX, clientY) {
  const width = Math.max(window.innerWidth || 1, 1);
  const height = Math.max(window.innerHeight || 1, 1);

  const nx = ((clientX / width) * 2) - 1;
  const ny = ((clientY / height) * 2) - 1;

  const dx = Math.max(-1, Math.min(1, nx));
  const dy = Math.max(-1, Math.min(1, ny));

  rootStyle.setProperty("--shadow-dx-sm", `${(dx * 1.5).toFixed(2)}px`);
  rootStyle.setProperty("--shadow-dy-sm", `${(dy * 1.5).toFixed(2)}px`);
  rootStyle.setProperty("--shadow-dx-md", `${(dx * 3.5).toFixed(2)}px`);
  rootStyle.setProperty("--shadow-dy-md", `${(dy * 3.5).toFixed(2)}px`);
  rootStyle.setProperty("--shadow-dx-lg", `${(dx * 6).toFixed(2)}px`);
  rootStyle.setProperty("--shadow-dy-lg", `${(dy * 6).toFixed(2)}px`);
}

function spawnFlameTrail(x, y, options = {}) {
  if (!isCustomCursorEnabled()) return;
  const speed = Number(options.speed || 0);
  const burst = Boolean(options.burst);
  const now = Date.now();
  if (!burst && now - lastFlameTime < 22) {
    return;
  }
  lastFlameTime = now;

  const calmTrail = ["✨", "🌟", "💫", "🛸", "☄️", "🪐", "🌈", "⚡"];
  const fastTrail = ["🚀", "🚀", "💥", "⚡", "☄️", "🌠", "🔥", "✨", "🛸"];
  const clickBurst = ["🚀", "💥", "⚡", "🔥", "✨", "🌟", "🧨", "☄️", "🌈"];

  const emojiPool = burst ? clickBurst : speed > 0.95 ? fastTrail : calmTrail;
  const baseCount = burst ? 6 : speed > 1.25 ? 5 : speed > 0.7 ? 4 : 2;
  const particleCount = baseCount + Math.floor(Math.random() * 2);

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement("div");
    particle.className = "flame-trail";
    particle.textContent = emojiPool[Math.floor(Math.random() * emojiPool.length)];

    const spreadX = burst ? 22 : speed > 0.9 ? 16 : 12;
    const spreadY = burst ? 18 : speed > 0.9 ? 12 : 9;
    particle.style.left = `${x - 8 + (Math.random() * spreadX - spreadX / 2)}px`;
    particle.style.top = `${y + (Math.random() * spreadY - spreadY / 2)}px`;

    const minSize = burst ? 13 : 11;
    const maxSize = burst ? 24 : speed > 0.9 ? 21 : 18;
    particle.style.fontSize = `${minSize + Math.floor(Math.random() * (maxSize - minSize + 1))}px`;

    const driftX = Math.round((Math.random() * 28 - 14) * (burst ? 1.15 : 1));
    const driftY = -16 - Math.round(Math.random() * (burst ? 22 : 14));
    const driftScale = burst ? 0.35 + Math.random() * 0.4 : 0.5 + Math.random() * 0.35;
    const driftRotate = Math.round(Math.random() * 80 - 40);

    particle.style.setProperty("--trail-dx", `${driftX}px`);
    particle.style.setProperty("--trail-dy", `${driftY}px`);
    particle.style.setProperty("--trail-scale", driftScale.toFixed(2));
    particle.style.setProperty("--trail-rotate", `${driftRotate}deg`);

    document.body.appendChild(particle);

    requestAnimationFrame(() => {
      particle.classList.add("is-fading");
    });

    window.setTimeout(() => {
      particle.remove();
    }, 900);
  }
}

window.addEventListener("mousemove", (event) => {
  updateShadowFromCursor(event.clientX, event.clientY);

  if (!cursor) return;
  if (!isRocketCursorVisible()) {
    cursor.classList.add("is-hidden");
    return;
  }

  const now = performance.now();
  const dt = lastCursorTime ? now - lastCursorTime : 16;
  const dx = event.clientX - lastCursorX;
  const dy = event.clientY - lastCursorY;
  const distance = Math.hypot(dx, dy);
  const speed = Math.min(1.8, distance / Math.max(8, dt));

  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
  cursor.classList.remove("is-hidden");
  spawnFlameTrail(event.clientX, event.clientY, { speed });

  lastCursorX = event.clientX;
  lastCursorY = event.clientY;
  lastCursorTime = now;
});

window.addEventListener("mousedown", () => {
  if (!cursor || !isRocketCursorVisible()) return;
  cursor.classList.add("clicking");
  spawnFlameTrail(lastCursorX || window.innerWidth / 2, lastCursorY || window.innerHeight / 2, {
    speed: 1.4,
    burst: true
  });
});

window.addEventListener("mouseup", () => {
  if (!cursor) return;
  cursor.classList.remove("clicking");
});

window.addEventListener("touchstart", () => {
  if (!cursor) return;
  cursor.classList.add("is-hidden");
  updateShadowFromCursor(window.innerWidth / 2, window.innerHeight / 2);
});

updateShadowFromCursor(window.innerWidth / 2, window.innerHeight / 2);

new MutationObserver(() => {
  if (cursor) {
    cursor.classList.toggle("is-hidden", !isRocketCursorVisible());
  }
}).observe(document.documentElement, { attributeFilter: ["data-perf-mode", "data-animations", "data-marie-kondo"] });

if (cursor) {
  cursor.classList.toggle("is-hidden", !isRocketCursorVisible());
}
