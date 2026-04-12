Discord Gradient Extension, specifically in chrome broswer.
Probably, this tool can also be used for other browser, but I have not tried it yet.

What is included in this package
- manifest.json
- content.js
- popup.html
- popup.js
- style.css
- README.txt

What this version does
- Adds a popup to enable or disable the extension theme.
- Loads one CSS file from the extension package: style.css.
- Injects that CSS into Discord Web when the extension is enabled.
- Adds the class "discord-profile-green" to the page root when an input or textarea is active or contains text, so CSS can style the profile border.

How the current code works
1. content.js reads the setting "discordThemeEnabled" from chrome.storage.local.
2. If enabled, it loads style.css with chrome.runtime.getURL("style.css") and fetch(...).
3. It creates a <style> element with id "discord-custom-theme-style" and injects the CSS text into the page.
4. If disabled, it removes that <style> element.
5. It also watches inputs / textareas / contenteditable elements and toggles the class "discord-profile-green" on the <html> element.

Install steps
1. Unzip this folder.
2. Open chrome://extensions
3. Turn on Developer mode.
4. Click Load unpacked.
5. Select this folder.
6. Open or refresh https://discord.com/app

Popup behavior
- The checkbox in the popup controls the key "discordThemeEnabled" in chrome.storage.local.
- When that value changes, content.js applies or removes the injected CSS.

Files you may want to edit
- style.css
  Change the main theme CSS here.
- content.js
  Controls when CSS is injected and when the "discord-profile-green" class is toggled.
- popup.js
  Controls the enable/disable state saved in chrome.storage.local.

About styles.zip
A separate file named styles.zip was also provided in chat.
That file contains per-theme CSS files such as:
- styles/blue.css
- styles/purple.css
- styles/emerald.css
- styles/sunset.css
- styles/rose.css
- styles/gold.css
- styles/ocean.css
- styles/midnight.css

Important:
This zip package does NOT automatically use those files.
The current content.js in this package still loads only:
- style.css

So if you want to use styles.zip for theme switching, you must also update:
- content.js, so it loads styles/<theme>.css instead of style.css
- popup.js / popup.html, so the popup stores a theme name such as "blue" or "purple"
- manifest.json, so the CSS files inside styles/ are added to web_accessible_resources

Current manifest note
This package currently exposes only:
- style.css

If you switch to per-theme files later, the manifest should expose those files too.

Troubleshooting
1. Nothing changes on Discord
- Reload the extension in chrome://extensions.
- Refresh Discord.
- Open DevTools and check whether a <style id="discord-custom-theme-style"> element exists.

2. Popup toggles but theme still does not change
- Make sure popup.js is writing "discordThemeEnabled".
- Make sure content.js is running on https://discord.com/*.
- Make sure style.css actually contains visible rules.

3. Profile border does not turn green
- The CSS must contain selectors that react to the class "discord-profile-green".
- The input-tracking code only adds/removes the class; the CSS must still style something with it.

4. style.css fails to load
- Make sure style.css is present in the extension root.
- Make sure the manifest exposes style.css in web_accessible_resources.

Summary
This package is the single-style version.
- One popup checkbox
- One injected CSS file: style.css
- Input tracking for the profile-green class

The separate styles.zip is only the CSS asset pack for future multi-theme support.
