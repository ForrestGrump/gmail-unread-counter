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

### Temporary (Development)

1. Open Firefox and navigate to `about:debugging`
2. Click **"This Firefox"**
3. Click **"Load Temporary Add-on…"**
4. Select the `manifest.json` file from this directory

### Permanent (Self-signed)

1. Package the extension: `cd gmail_email_checker && zip -r ../gmail-unread-counter.zip *`
2. Go to [addons.mozilla.org](https://addons.mozilla.org/developers/) → Submit a New Add-on
3. Choose **"On your own"** (self-distribution)
4. Upload the `.zip` file
5. Mozilla will sign it — download the signed `.xpi`
6. Open the `.xpi` in Firefox to install permanently

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
└── icons/             # Extension icons
```
