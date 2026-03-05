/**
 * Gmail Unread Counter — Popup Script
 */

// ── DOM references ──────────────────────────────────────────────────────────
const stateLoading = document.getElementById("state-loading");
const stateAuth = document.getElementById("state-auth");
const stateError = document.getElementById("state-error");
const stateOk = document.getElementById("state-ok");

const unreadCountEl = document.getElementById("unread-count");
const entriesList = document.getElementById("entries-list");
const entriesContainer = document.getElementById("entries-container");
const lastCheckedEl = document.getElementById("last-checked");
const errorMessage = document.getElementById("error-message");

const btnOpenGmail = document.getElementById("btn-open-gmail");
const btnRefresh = document.getElementById("btn-refresh");
const btnLogin = document.getElementById("btn-login");
const btnRetry = document.getElementById("btn-retry");

// ── State management ────────────────────────────────────────────────────────
function showState(stateEl) {
    [stateLoading, stateAuth, stateError, stateOk].forEach((el) => {
        el.classList.add("hidden");
    });
    stateEl.classList.remove("hidden");
}

// ── Time formatting ─────────────────────────────────────────────────────────
function formatTimeAgo(timestamp) {
    if (!timestamp) return "";
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
}

// ── Render entries ──────────────────────────────────────────────────────────
function renderEntries(entries) {
    entriesList.innerHTML = "";

    if (!entries || entries.length === 0) {
        entriesContainer.classList.add("hidden");
        return;
    }

    entriesContainer.classList.remove("hidden");

    // Show up to 5 entries
    const shown = entries.slice(0, 5);
    shown.forEach((entry) => {
        const li = document.createElement("li");
        li.className = "entry-item";

        li.innerHTML = `
      <div class="entry-sender">${escapeHtml(entry.authorName)}</div>
      <div class="entry-subject">${escapeHtml(entry.title)}</div>
      ${entry.summary ? `<div class="entry-summary">${escapeHtml(entry.summary)}</div>` : ""}
    `;

        // Click to open message
        if (entry.link) {
            li.addEventListener("click", () => {
                browser.tabs.create({ url: entry.link });
                window.close();
            });
        }

        entriesList.appendChild(li);
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// ── Load data & render ──────────────────────────────────────────────────────
async function loadData() {
    const data = await browser.storage.local.get([
        "lastUnreadCount",
        "lastEntries",
        "lastChecked",
        "lastError",
    ]);

    // Update last-checked time
    if (data.lastChecked) {
        lastCheckedEl.textContent = `Last checked: ${formatTimeAgo(data.lastChecked)}`;
    }

    // Handle error states
    if (data.lastError === "not_authenticated") {
        showState(stateAuth);
        return;
    }

    if (data.lastError) {
        errorMessage.textContent = `Error: ${data.lastError}`;
        showState(stateError);
        return;
    }

    // If we have no data yet, stay in loading
    if (data.lastUnreadCount === undefined && !data.lastError) {
        showState(stateLoading);
        return;
    }

    // Normal: show unread count and entries
    const count = data.lastUnreadCount || 0;
    unreadCountEl.textContent = count;

    if (count > 0) {
        unreadCountEl.classList.add("has-mail");
    } else {
        unreadCountEl.classList.remove("has-mail");
    }

    renderEntries(data.lastEntries);
    showState(stateOk);
}

// ── Event handlers ──────────────────────────────────────────────────────────

// Open Gmail
btnOpenGmail.addEventListener("click", () => {
    browser.runtime.sendMessage({ action: "openGmail" });
    window.close();
});

// Login button (also opens Gmail)
btnLogin.addEventListener("click", () => {
    browser.runtime.sendMessage({ action: "openGmail" });
    window.close();
});

// Refresh
btnRefresh.addEventListener("click", async () => {
    btnRefresh.classList.add("spinning");
    btnRefresh.disabled = true;

    try {
        await browser.runtime.sendMessage({ action: "poll" });
        await loadData();
    } catch (err) {
        console.error("Refresh failed:", err);
    } finally {
        btnRefresh.classList.remove("spinning");
        btnRefresh.disabled = false;
    }
});

// Retry (on error state)
btnRetry.addEventListener("click", async () => {
    showState(stateLoading);
    try {
        await browser.runtime.sendMessage({ action: "poll" });
        await loadData();
    } catch (err) {
        errorMessage.textContent = `Error: ${err.message}`;
        showState(stateError);
    }
});

// ── Initialize ──────────────────────────────────────────────────────────────
loadData();
