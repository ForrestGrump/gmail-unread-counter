/**
 * Gmail Unread Counter — Background Script
 *
 * Polls the Gmail Atom feed at a configurable interval and updates the
 * browser-action badge with the current unread message count.
 */

const GMAIL_ATOM_URL = "https://mail.google.com/mail/feed/atom/";
const GMAIL_INBOX_URL = "https://mail.google.com/mail/u/0/#inbox";
const ALARM_NAME = "gmail-poll";

// ── Defaults ────────────────────────────────────────────────────────────────
const DEFAULTS = {
  pollInterval: 1,          // minutes
  notifications: true,
  accountIndex: 0,
};

// ── State ───────────────────────────────────────────────────────────────────
let previousUnreadCount = -1;
let lastFeedEntries = [];

// ── Settings helpers ────────────────────────────────────────────────────────
async function getSettings() {
  const stored = await browser.storage.local.get(DEFAULTS);
  return { ...DEFAULTS, ...stored };
}

// ── Feed URL builder ────────────────────────────────────────────────────────
function buildFeedUrl(accountIndex) {
  // Gmail supports multi-account via /u/N/ path
  if (accountIndex > 0) {
    return `https://mail.google.com/mail/u/${accountIndex}/feed/atom/`;
  }
  return GMAIL_ATOM_URL;
}

function buildInboxUrl(accountIndex) {
  return `https://mail.google.com/mail/u/${accountIndex}/#inbox`;
}

// ── Core: Fetch unread count from Gmail Atom feed ───────────────────────────
async function fetchUnreadData() {
  const settings = await getSettings();
  const feedUrl = buildFeedUrl(settings.accountIndex);

  const response = await fetch(feedUrl, { credentials: "include" });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "application/xml");

  // Check for parse errors
  const parseError = xml.querySelector("parsererror");
  if (parseError) {
    throw new Error("Failed to parse Gmail feed XML");
  }

  // Extract unread count
  const fullCountEl = xml.querySelector("fullcount");
  const unreadCount = fullCountEl ? parseInt(fullCountEl.textContent, 10) : 0;

  // Extract recent entries (subject, sender, summary)
  const entries = [];
  const entryEls = xml.querySelectorAll("entry");
  for (let i = 0; i < Math.min(entryEls.length, 10); i++) {
    const entry = entryEls[i];
    const title = entry.querySelector("title")?.textContent || "(no subject)";
    const authorName = entry.querySelector("author > name")?.textContent || "Unknown";
    const authorEmail = entry.querySelector("author > email")?.textContent || "";
    const summary = entry.querySelector("summary")?.textContent || "";
    const issued = entry.querySelector("issued")?.textContent || "";
    const link = entry.querySelector("link")?.getAttribute("href") || "";

    entries.push({ title, authorName, authorEmail, summary, issued, link });
  }

  return { unreadCount, entries };
}

// ── Badge update ────────────────────────────────────────────────────────────
function updateBadge(count, state = "ok") {
  if (state === "error") {
    browser.browserAction.setBadgeText({ text: "!" });
    browser.browserAction.setBadgeBackgroundColor({ color: "#F44336" });
    browser.browserAction.setTitle({ title: "Gmail Unread Counter — Error" });
    return;
  }

  if (state === "auth") {
    browser.browserAction.setBadgeText({ text: "?" });
    browser.browserAction.setBadgeBackgroundColor({ color: "#FF9800" });
    browser.browserAction.setTitle({ title: "Gmail Unread Counter — Sign in required" });
    return;
  }

  // Normal state
  const badgeText = count > 0 ? String(count) : "";
  browser.browserAction.setBadgeText({ text: badgeText });
  browser.browserAction.setBadgeBackgroundColor({ color: "#4285F4" });

  const title = count > 0
    ? `Gmail Unread Counter — ${count} unread message${count !== 1 ? "s" : ""}`
    : "Gmail Unread Counter — No unread messages";
  browser.browserAction.setTitle({ title });
}

// ── Notifications ───────────────────────────────────────────────────────────
async function notifyNewMail(count, entries) {
  const settings = await getSettings();
  if (!settings.notifications) return;

  // Only notify if count increased
  if (previousUnreadCount >= 0 && count > previousUnreadCount) {
    const newCount = count - previousUnreadCount;
    const latestEntry = entries.length > 0 ? entries[0] : null;

    let message;
    if (latestEntry && newCount === 1) {
      message = `From: ${latestEntry.authorName}\n${latestEntry.title}`;
    } else {
      message = `You have ${newCount} new message${newCount !== 1 ? "s" : ""}`;
    }

    // Include the email link in the notification ID so we can extract it on click
    const notificationId = latestEntry?.link
      ? `gmail-new-mail_${latestEntry.link}`
      : "gmail-new-mail_inbox";

    browser.notifications.create(notificationId, {
      type: "basic",
      iconUrl: browser.runtime.getURL("icons/gmail-128.png"),
      title: "New Gmail Message",
      message: message,
    });
  }
}


// ── Main poll function ──────────────────────────────────────────────────────
async function pollGmail() {
  try {
    const data = await fetchUnreadData();
    updateBadge(data.unreadCount);

    // Send notifications for new mail
    await notifyNewMail(data.unreadCount, data.entries);

    // Update state
    previousUnreadCount = data.unreadCount;
    lastFeedEntries = data.entries;

    // Store data for popup access
    await browser.storage.local.set({
      lastUnreadCount: data.unreadCount,
      lastEntries: data.entries,
      lastChecked: Date.now(),
      lastError: null,
    });
  } catch (err) {
    console.error("[Gmail Unread Counter] Poll error:", err);

    // Distinguish auth errors from other errors
    if (err.message.includes("401") || err.message.includes("403")) {
      updateBadge(0, "auth");
      await browser.storage.local.set({
        lastError: "not_authenticated",
        lastChecked: Date.now(),
      });
    } else {
      updateBadge(0, "error");
      await browser.storage.local.set({
        lastError: err.message,
        lastChecked: Date.now(),
      });
    }
  }
}

// ── Alarm setup ─────────────────────────────────────────────────────────────
async function setupAlarm() {
  const settings = await getSettings();
  // Clear existing alarm
  await browser.alarms.clear(ALARM_NAME);
  // Create new periodic alarm
  browser.alarms.create(ALARM_NAME, {
    periodInMinutes: settings.pollInterval,
  });
}

// ── Event listeners ─────────────────────────────────────────────────────────

// Alarm tick → poll
browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    pollGmail();
  }
});

// Extension installed / browser started
browser.runtime.onInstalled.addListener(() => {
  setupAlarm();
  pollGmail();
});

browser.runtime.onStartup.addListener(() => {
  setupAlarm();
  pollGmail();
});

// Listen for settings changes → reconfigure alarm
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.pollInterval) {
    setupAlarm();
  }
});

// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "poll") {
    pollGmail().then(() => sendResponse({ ok: true }));
    return true; // async response
  }
  if (message.action === "getEntries") {
    sendResponse({ entries: lastFeedEntries, count: previousUnreadCount });
    return false;
  }
  if (message.action === "openGmail") {
    getSettings().then((settings) => {
      browser.tabs.create({ url: buildInboxUrl(settings.accountIndex) });
    });
    return false;
  }
});

// Notification click → open specific email (or inbox as fallback)
browser.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.startsWith("gmail-new-mail_")) {
    const url = notificationId.replace("gmail-new-mail_", "");

    if (url && url !== "inbox") {
      browser.tabs.create({ url: url });
    } else {
      getSettings().then((settings) => {
        browser.tabs.create({ url: buildInboxUrl(settings.accountIndex) });
      });
    }
    browser.notifications.clear(notificationId);
  }
});

// ── Initial poll on script load ─────────────────────────────────────────────
setupAlarm();
pollGmail();
