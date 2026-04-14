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

function buildCustomCss(theme) {
  const angle = Number(theme.gradientAngle || 175);
  const c1 = theme.color1 || "#1b2f5b";
  const c2 = theme.color2 || "#244a86";
  const c3 = theme.color3 || "#356b94";
  const spoilerHidden = theme.spoilerHidden || "#5f8fd6";
  const spoilerHover = theme.spoilerHover || "#3f6fb8";

  const gradient = `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 75%, ${c3} 100%)`;

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
  --spoiler-hidden-background: ${spoilerHidden} !important;
  --spoiler-hidden-background-hover: ${spoilerHover} !important;
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