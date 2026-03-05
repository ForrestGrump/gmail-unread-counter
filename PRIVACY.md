# Privacy Policy — Gmail Unread Counter

**Last updated:** March 5, 2026

## Overview

Gmail Unread Counter is a Firefox browser extension that displays your unread Gmail message count on the toolbar icon and provides a quick preview of recent unread messages.

## Data Collection

This extension **does not collect, store, or transmit any personal data** to external servers. All operations happen locally in your browser.

## How It Works

- The extension fetches your unread email count and message previews by accessing Gmail's Atom feed (`https://mail.google.com/mail/feed/atom`) using your existing browser session cookies.
- All data retrieved from Gmail is processed **locally in your browser** and is used solely to display the unread count badge and message previews.
- No data is sent to any third-party server, analytics service, or external endpoint.

## Data Stored Locally

The extension stores the following settings in your browser's local extension storage (`browser.storage.local`):

| Data | Purpose |
|---|---|
| Poll interval | How often to check for new mail (user-configurable) |
| Notification preference | Whether desktop notifications are enabled |

These settings never leave your browser.

## Permissions Explained

| Permission | Why it's needed |
|---|---|
| `https://mail.google.com/*` | To access Gmail's Atom feed for unread mail data |
| `alarms` | To schedule periodic polling for new mail |
| `storage` | To save user preferences (poll interval, notifications) |
| `notifications` | To show desktop notifications when new mail arrives |

## Third-Party Services

This extension does not use any third-party services, analytics, or tracking.

## Contact

If you have questions about this privacy policy, please open an issue on the [GitHub repository](https://github.com/ForrestGrump/gmail-unread-counter).

## Changes

Any changes to this privacy policy will be reflected in this document and the "Last updated" date above.
