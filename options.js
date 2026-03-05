/**
 * Gmail Unread Counter — Options Script
 */

const pollIntervalEl = document.getElementById("poll-interval");
const accountIndexEl = document.getElementById("account-index");
const notificationsEl = document.getElementById("notifications-enabled");
const btnSave = document.getElementById("btn-save");
const saveStatusEl = document.getElementById("save-status");

const DEFAULTS = {
    pollInterval: 1,
    notifications: true,
    accountIndex: 0,
};

// ── Load saved settings ─────────────────────────────────────────────────────
async function loadSettings() {
    const settings = await browser.storage.local.get(DEFAULTS);

    pollIntervalEl.value = settings.pollInterval;
    accountIndexEl.value = settings.accountIndex;
    notificationsEl.checked = settings.notifications;
}

// ── Save settings ───────────────────────────────────────────────────────────
async function saveSettings() {
    const settings = {
        pollInterval: parseInt(pollIntervalEl.value, 10),
        accountIndex: parseInt(accountIndexEl.value, 10),
        notifications: notificationsEl.checked,
    };

    await browser.storage.local.set(settings);

    // Show success feedback
    saveStatusEl.textContent = "✓ Saved!";
    saveStatusEl.classList.add("visible");

    setTimeout(() => {
        saveStatusEl.classList.remove("visible");
    }, 2000);
}

// ── Event listeners ─────────────────────────────────────────────────────────
btnSave.addEventListener("click", saveSettings);

// Allow saving with Enter key
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        saveSettings();
    }
});

// ── Initialize ──────────────────────────────────────────────────────────────
loadSettings();
