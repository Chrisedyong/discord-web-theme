const themeEnabled = document.getElementById("themeEnabled");
const themeName = document.getElementById("themeName");
const statusText = document.getElementById("statusText");

async function loadSettings() {
  const result = await chrome.storage.local.get([
    "discordThemeEnabled",
    "discordThemeName"
  ]);

  themeEnabled.checked = !!result.discordThemeEnabled;
  themeName.value = result.discordThemeName || "blue";

  if (statusText) {
    statusText.textContent = result.discordThemeEnabled
      ? `Enabled: ${themeName.value}`
      : "Disabled";
  }
}

async function saveEnabled() {
  await chrome.storage.local.set({
    discordThemeEnabled: themeEnabled.checked
  });

  if (statusText) {
    statusText.textContent = themeEnabled.checked
      ? `Enabled: ${themeName.value}`
      : "Disabled";
  }
}

async function saveThemeName() {
  await chrome.storage.local.set({
    discordThemeName: themeName.value
  });

  if (statusText) {
    statusText.textContent = themeEnabled.checked
      ? `Enabled: ${themeName.value}`
      : `Selected: ${themeName.value}`;
  }
}

themeEnabled.addEventListener("change", saveEnabled);
themeName.addEventListener("change", saveThemeName);

loadSettings();