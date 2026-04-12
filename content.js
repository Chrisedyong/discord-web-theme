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

async function applyTheme(themeName = "blue") {
  let style = document.getElementById(STYLE_ID);
  const filePath = getThemeFilePath(themeName);
  const css = await loadCssText(filePath);

  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.documentElement.appendChild(style);
  }

  style.textContent = css;
}

function removeTheme() {
  const style = document.getElementById(STYLE_ID);
  if (style) style.remove();
}

async function syncTheme() {
  const result = await chrome.storage.local.get([
    "discordThemeEnabled",
    "discordThemeName"
  ]);

  if (result.discordThemeEnabled) {
    await applyTheme(result.discordThemeName || "blue");
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
  if (!changes.discordThemeEnabled && !changes.discordThemeName) return;
  void syncTheme();
});

start();