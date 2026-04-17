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

const randomizeButton = document.getElementById("randomizeButton");

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

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));

  let r = 0, g = 0, b = 0;

  if (hp >= 0 && hp < 1) [r, g, b] = [c, x, 0];
  else if (hp >= 1 && hp < 2) [r, g, b] = [x, c, 0];
  else if (hp >= 2 && hp < 3) [r, g, b] = [0, c, x];
  else if (hp >= 3 && hp < 4) [r, g, b] = [0, x, c];
  else if (hp >= 4 && hp < 5) [r, g, b] = [x, 0, c];
  else if (hp >= 5 && hp < 6) [r, g, b] = [c, 0, x];

  const m = l - c / 2;
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
  Good random strategy:
  - pick one base hue
  - use nearby hues so the palette stays harmonious
  - keep saturation and lightness in safe ranges
  - keep opacity high enough to still look intentional
*/
function generateNiceRandomTheme() {
  const baseHue = randInt(0, 359);

  const hue2 = (baseHue + randInt(18, 42)) % 360;
  const hue3 = (baseHue + randInt(48, 88)) % 360;

  const sat1 = randInt(45, 68);
  const sat2 = randInt(50, 74);
  const sat3 = randInt(42, 66);

  const light1 = randInt(20, 30);
  const light2 = randInt(32, 45);
  const light3 = randInt(45, 60);

  return {
    gradientAngle: randInt(155, 205),
    color1: hslToHex(baseHue, sat1, light1),
    color2: hslToHex(hue2, sat2, light2),
    color3: hslToHex(hue3, sat3, light3),
    color1Opacity: randInt(82, 100),
    color2Opacity: randInt(86, 100),
    color3Opacity: randInt(88, 100)
  };
}

function applyThemeToInputs(theme) {
  gradientAngle.value = theme.gradientAngle;
  color1.value = theme.color1;
  color2.value = theme.color2;
  color3.value = theme.color3;
  color1Opacity.value = theme.color1Opacity;
  color2Opacity.value = theme.color2Opacity;
  color3Opacity.value = theme.color3Opacity;
  updateOpacityLabels();
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

  applyThemeToInputs(customTheme);
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

randomizeButton.addEventListener("click", async () => {
  const theme = generateNiceRandomTheme();

  themeName.value = "custom";
  themeEnabled.checked = true;
  updateCustomVisibility();
  applyThemeToInputs(theme);

  await chrome.storage.local.set({
    discordThemeEnabled: true,
    discordThemeName: "custom",
    customTheme: theme
  });
});

loadSettings();
