const STYLE_ID = "discord-custom-theme-style";

const cssPromiseMap = new Map();

function loadCssText(filePath) {
  if (!cssPromiseMap.has(filePath)) {
    const url = chrome.runtime.getURL(filePath);
    const promise = fetch(url).then(async (res) => {
      if (!res.ok) {
        throw new Error(`Failed to load ${filePath}: ${res.status}`);
      }
      return await res.text();
    });
    cssPromiseMap.set(filePath, promise);
  }
  return cssPromiseMap.get(filePath);
}

function hasActiveInput() {
  const elements = document.querySelectorAll(
    'input, textarea, [contenteditable="true"]'
  );

  for (const el of elements) {
    const isFocused = document.activeElement === el;
    const hasText = el.isContentEditable
      ? (el.textContent || "").trim().length > 0
      : ((el.value || "").trim().length > 0);

    if (isFocused || hasText) return true;
  }

  return false;
}

function updateProfileBorderState() {
  document.documentElement.classList.toggle(
    "discord-profile-green",
    hasActiveInput()
  );
}

function getThemeFilePath(themeName) {
  if (themeName === "blue") return "styles/blue.css";
  else if (themeName === "purple") return "styles/purple.css";
  else if (themeName === "emerald") return "styles/emerald.css";
  else if (themeName === "sunset") return "styles/sunset.css";
  else if (themeName === "rose") return "styles/rose.css";
  else if (themeName === "gold") return "styles/gold.css";
  else if (themeName === "ocean") return "styles/ocean.css";
  else if (themeName === "midnight") return "styles/midnight.css";
  else return "styles/blue.css";
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function hexToRgb(hex) {
  let h = (hex || "").replace("#", "").trim();

  if (h.length === 3) {
    h = h.split("").map(ch => ch + ch).join("");
  }

  if (h.length !== 6) {
    return { r: 27, g: 47, b: 91 };
  }

  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

function rgbaFromHex(hex, opacityPercent) {
  const { r, g, b } = hexToRgb(hex);
  const a = clamp((Number(opacityPercent) || 100) / 100, 0, 1);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function mixRgb(a, b, ratio) {
  const t = clamp(ratio, 0, 1);
  return {
    r: Math.round(a.r * (1 - t) + b.r * t),
    g: Math.round(a.g * (1 - t) + b.g * t),
    b: Math.round(a.b * (1 - t) + b.b * t)
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (n) => clamp(n, 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function deriveSpoilerColors(c1Hex, c2Hex, c3Hex) {
  const c1 = hexToRgb(c1Hex);
  const c2 = hexToRgb(c2Hex);
  const c3 = hexToRgb(c3Hex);

  // Weighted toward color2 because the gradient spends most of its visible area near it.
  const base = {
    r: Math.round(c1.r * 0.2 + c2.r * 0.6 + c3.r * 0.2),
    g: Math.round(c1.g * 0.2 + c2.g * 0.6 + c3.g * 0.2),
    b: Math.round(c1.b * 0.2 + c2.b * 0.6 + c3.b * 0.2)
  };

  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  const hidden = mixRgb(base, white, 0.22);
  const hover = mixRgb(base, black, 0.18);

  return {
    hidden: rgbToHex(hidden),
    hover: rgbToHex(hover)
  };
}

function buildCustomCss(theme) {
  const angle = Number(theme.gradientAngle || 175);

  const c1 = theme.color1 || "#1b2f5b";
  const c2 = theme.color2 || "#244a86";
  const c3 = theme.color3 || "#356b94";

  const c1Opacity = Number(theme.color1Opacity || 100);
  const c2Opacity = Number(theme.color2Opacity || 100);
  const c3Opacity = Number(theme.color3Opacity || 100);

  const gradient = `linear-gradient(${angle}deg, ${rgbaFromHex(c1, c1Opacity)} 0%, ${rgbaFromHex(c2, c2Opacity)} 75%, ${rgbaFromHex(c3, c3Opacity)} 100%)`;

  const spoiler = deriveSpoilerColors(c1, c2, c3);

  return `
.discord-profile-green .avatar__03630,
.discord-profile-green .icon_bd6d20 {
  border-color: var(--green-360) !important;
  box-shadow: 0 0 0 2px rgba(87, 242, 135, 0.35) !important;
}

.theme-dark {
  --discord-theme-gradient: ${gradient};
  --background-base-lowest: var(--discord-theme-gradient) !important;
  --background-base-lower: var(--discord-theme-gradient) !important;
  --background-base-low: var(--discord-theme-gradient) !important;
  --background-surface-high: var(--discord-theme-gradient) !important;
  --background-surface-higher: var(--discord-theme-gradient) !important;
  --background-surface-highest: var(--discord-theme-gradient) !important;
  --chat-background-default: var(--discord-theme-gradient) !important;
  --spoiler-hidden-background: ${spoiler.hidden} !important;
  --spoiler-hidden-background-hover: ${spoiler.hover} !important;
}

html,
body,
[class*="appMount"] {
  background: var(--discord-theme-gradient) !important;
}
`;
}

async function applyTheme(themeName = "blue", customTheme = {}) {
  let style = document.getElementById(STYLE_ID);

  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(style);
  }

  if (themeName === "custom") {
    style.textContent = buildCustomCss(customTheme);
    return;
  }

  const filePath = getThemeFilePath(themeName);
  const css = await loadCssText(filePath);
  style.textContent = css;
}

function removeTheme() {
  const style = document.getElementById(STYLE_ID);
  if (style) style.remove();
}

async function syncTheme() {
  const result = await chrome.storage.local.get([
    "discordThemeEnabled",
    "discordThemeName",
    "customTheme"
  ]);

  if (result.discordThemeEnabled) {
    await applyTheme(
      result.discordThemeName || "blue",
      result.customTheme || {}
    );
  } else {
    removeTheme();
  }
}

function setupInputTracking() {
  document.addEventListener("input", updateProfileBorderState, true);
  document.addEventListener("focusin", updateProfileBorderState, true);
  document.addEventListener("focusout", updateProfileBorderState, true);

  const observer = new MutationObserver(updateProfileBorderState);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  updateProfileBorderState();
}

function start() {
  if (!document.body) {
    window.addEventListener("DOMContentLoaded", start, { once: true });
    return;
  }

  setupInputTracking();
  void syncTheme();
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (
    !changes.discordThemeEnabled &&
    !changes.discordThemeName &&
    !changes.customTheme
  ) {
    return;
  }
  void syncTheme();
});

start();