const themeEnabled = document.getElementById("themeEnabled");
const themeName = document.getElementById("themeName");
const customSection = document.getElementById("customSection");

const gradientAngle = document.getElementById("gradientAngle");
const color1 = document.getElementById("color1");
const color2 = document.getElementById("color2");
const color3 = document.getElementById("color3");

const color1Opacity = document.getElementById("color1Opacity");
const color2Opacity = document.getElementById("color2Opacity");
const color3Opacity = document.getElementById("color3Opacity");

const color1OpacityValue = document.getElementById("color1OpacityValue");
const color2OpacityValue = document.getElementById("color2OpacityValue");
const color3OpacityValue = document.getElementById("color3OpacityValue");

const DEFAULT_CUSTOM_THEME = {
  gradientAngle: 175,
  color1: "#1b2f5b",
  color2: "#244a86",
  color3: "#356b94",
  color1Opacity: 100,
  color2Opacity: 100,
  color3Opacity: 100
};

function updateCustomVisibility() {
  customSection.style.display = themeName.value === "custom" ? "block" : "none";
}

function updateOpacityLabels() {
  color1OpacityValue.textContent = `${color1Opacity.value}%`;
  color2OpacityValue.textContent = `${color2Opacity.value}%`;
  color3OpacityValue.textContent = `${color3Opacity.value}%`;
}

async function loadSettings() {
  const result = await chrome.storage.local.get([
    "discordThemeEnabled",
    "discordThemeName",
    "customTheme"
  ]);

  const customTheme = result.customTheme || DEFAULT_CUSTOM_THEME;

  themeEnabled.checked = !!result.discordThemeEnabled;
  themeName.value = result.discordThemeName || "blue";

  gradientAngle.value = customTheme.gradientAngle ?? 175;
  color1.value = customTheme.color1 ?? "#1b2f5b";
  color2.value = customTheme.color2 ?? "#244a86";
  color3.value = customTheme.color3 ?? "#356b94";

  color1Opacity.value = customTheme.color1Opacity ?? 100;
  color2Opacity.value = customTheme.color2Opacity ?? 100;
  color3Opacity.value = customTheme.color3Opacity ?? 100;

  updateCustomVisibility();
  updateOpacityLabels();
}

async function saveSettings() {
  await chrome.storage.local.set({
    discordThemeEnabled: themeEnabled.checked,
    discordThemeName: themeName.value,
    customTheme: {
      gradientAngle: Number(gradientAngle.value || 175),
      color1: color1.value,
      color2: color2.value,
      color3: color3.value,
      color1Opacity: Number(color1Opacity.value || 100),
      color2Opacity: Number(color2Opacity.value || 100),
      color3Opacity: Number(color3Opacity.value || 100)
    }
  });
}

themeEnabled.addEventListener("change", saveSettings);

themeName.addEventListener("change", async () => {
  updateCustomVisibility();
  await saveSettings();
});

gradientAngle.addEventListener("input", saveSettings);
color1.addEventListener("input", saveSettings);
color2.addEventListener("input", saveSettings);
color3.addEventListener("input", saveSettings);

color1Opacity.addEventListener("input", async () => {
  updateOpacityLabels();
  await saveSettings();
});

color2Opacity.addEventListener("input", async () => {
  updateOpacityLabels();
  await saveSettings();
});

color3Opacity.addEventListener("input", async () => {
  updateOpacityLabels();
  await saveSettings();
});

loadSettings();