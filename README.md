# Gmail Unread Counter — Firefox Extension

A Firefox extension that polls Gmail and displays the unread email count as a badge on the toolbar icon.

## Features

- 📬 Real-time unread email count on toolbar badge
- 🔔 Desktop notifications for new mail
- 📋 Quick preview of recent unread messages in popup
- ⚙️ Configurable poll interval (1–30 minutes)
- 👥 Multi-account support
- 🎨 Clean, modern dark-themed UI

## Installation

### From Firefox Add-ons (AMO)

> Coming soon — the extension is under review.

### From Source (Development)

1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging`
3. Click **"This Firefox"**
4. Click **"Load Temporary Add-on…"**
5. Select the `manifest.json` file from this directory

## Usage

- **Badge**: Shows unread count automatically (updates every 1 min by default)
- **Click icon**: Shows popup with unread count and recent message previews
- **"Open Gmail" button**: Opens Gmail in a new tab
- **Settings**: Right-click extension → Manage Extension → Preferences

## Requirements

- You must be **logged into Gmail** in Firefox for the extension to work
- The extension uses Gmail's Atom feed, which relies on your existing session cookies

## File Structure

```
├── manifest.json      # Extension manifest
├── background.js      # Polling & badge logic
├── popup.html/js/css  # Popup UI
├── options.html/js/css # Settings page
├── icons/             # Extension icons
├── LICENSE            # MIT License
└── PRIVACY.md         # Privacy policy
```

## Privacy

This extension does not collect, store, or transmit any personal data to external servers. All Gmail data is processed locally in your browser. See [PRIVACY.md](PRIVACY.md) for the full privacy policy.

## License

[MIT](LICENSE)
