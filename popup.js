const themeEnabled = document.getElementById("themeEnabled");
const themeName = document.getElementById("themeName");
const customSection = document.getElementById("customSection");

const gradientAngle = document.getElementById("gradientAngle");
const color1 = document.getElementById("color1");
const color2 = document.getElementById("color2");
const color3 = document.getElementById("color3");
const spoilerHidden = document.getElementById("spoilerHidden");
const spoilerHover = document.getElementById("spoilerHover");

const DEFAULT_CUSTOM_THEME = {
  gradientAngle: 175,
  color1: "#1b2f5b",
  color2: "#244a86",
  color3: "#356b94",
  spoilerHidden: "#5f8fd6",
  spoilerHover: "#3f6fb8"
};

function updateCustomVisibility() {
  customSection.style.display = themeName.value === "custom" ? "block" : "none";
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

  gradientAngle.value = customTheme.gradientAngle;
  color1.value = customTheme.color1;
  color2.value = customTheme.color2;
  color3.value = customTheme.color3;
  spoilerHidden.value = customTheme.spoilerHidden;
  spoilerHover.value = customTheme.spoilerHover;

  updateCustomVisibility();
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
      spoilerHidden: spoilerHidden.value,
      spoilerHover: spoilerHover.value
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
spoilerHidden.addEventListener("input", saveSettings);
spoilerHover.addEventListener("input", saveSettings);

loadSettings();