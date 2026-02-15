const SERVER_URL = 'http://localhost:3001';

// DOM Elements
const loginView = document.getElementById('login-view');
const profileView = document.getElementById('profile-view');
const googleLoginBtn = document.getElementById('google-login');
const logoutBtn = document.getElementById('logout-btn');

// Profile Elements
const userNameEl = document.getElementById('user-name');
const userLevelEl = document.getElementById('user-level');
const userXpEl = document.getElementById('user-xp');
const userSwapsEl = document.getElementById('user-swaps');

// Init
document.addEventListener('DOMContentLoaded', () => {
    // 1. Check current auth state
    checkAuth();

    // 2. Listen for storage changes (e.g., when auth-capture.js saves a token)
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && (changes.greenloop_token || changes.greenloop_user)) {
            checkAuth();
        }
    });

    // 3. Setup Listeners
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            // Open the backend auth route with ?source=extension
            chrome.tabs.create({ url: `${SERVER_URL}/auth/google?source=extension` });
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            chrome.storage.local.remove(['greenloop_token', 'greenloop_user'], () => {
                showLogin();
            });
        });
    }
});

// ---------------------------
// Functions
// ---------------------------

function checkAuth() {
    chrome.storage.local.get(['greenloop_token'], (result) => {
        if (result.greenloop_token) {
            showProfile(result.greenloop_token);
        } else {
            showLogin();
        }
    });
}

function showLogin() {
    if (loginView) loginView.classList.remove('hidden');
    if (profileView) profileView.classList.add('hidden');
}

function showProfile(token) {
    if (loginView) loginView.classList.add('hidden');
    if (profileView) profileView.classList.remove('hidden');

    // Fetch latest stats
    fetchStats(token);
}

async function fetchStats(token) {
    try {
        const response = await fetch(`${SERVER_URL}/api/user/me/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
            // Token might be expired
            chrome.storage.local.remove(['greenloop_token']);
            showLogin();
            return;
        }

        if (!response.ok) throw new Error('Failed to fetch stats');

        const data = await response.json();

        // Update UI
        if (userNameEl) userNameEl.innerText = data.name || 'User';
        if (userLevelEl) userLevelEl.innerText = `Level: ${data.level || 1}`;
        if (userXpEl) userXpEl.innerText = data.xp || 0;
        if (userSwapsEl) userSwapsEl.innerText = data.totalSwaps || 0;

    } catch (error) {
        console.error('Stats Error:', error);
        if (userXpEl) userXpEl.innerText = '-';
    }
}
