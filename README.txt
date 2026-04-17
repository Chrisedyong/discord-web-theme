Discord Gradient Extension

Install
1. Unzip the folder.
2. Open chrome://extensions
3. Turn on Developer mode.
4. Click Load unpacked.
5. Select this folder.
6. Open or refresh https://discord.com/app

Files
- manifest.json: extension setup
- content.js: injects/removes theme CSS and tracks input activity
- popup.html / popup.js: popup controls
- style.css: main theme CSS

Current behavior
- Popup toggles the theme with chrome.storage.local key: discordThemeEnabled
- content.js injects style.css into Discord when enabled
- content.js adds class discord-profile-green to <html> when an input is focused or has text

Notes
- Reload the extension after editing files
- Refresh Discord after reloading
