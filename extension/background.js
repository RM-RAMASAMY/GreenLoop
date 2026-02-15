// background.js - Service Worker
// Handles API requests to bypass Mixed Content restrictions (HTTPS -> HTTP)

const SERVER_URL = 'http://localhost:3001';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SEARCH_PRODUCT') {
        handleSearch(request.query, sendResponse);
        return true; // Keep channel open for async response
    }

    if (request.type === 'LOG_ACTION') {
        handleLogAction(request.token, request.payload, sendResponse);
        return true; // Keep channel open
    }
});

async function handleSearch(query, sendResponse) {
    try {
        console.log(`[BG] Searching for: ${query}`);
        const response = await fetch(`${SERVER_URL}/api/products/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        sendResponse({ success: true, data });
    } catch (error) {
        console.error('[BG] Search error:', error);
        sendResponse({ success: false, error: error.message });
    }
}

async function handleLogAction(token, payload, sendResponse) {
    try {
        console.log(`[BG] Logging action:`, payload);
        const response = await fetch(`${SERVER_URL}/api/action`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.status === 401) {
            sendResponse({ success: false, error: 'Unauthorized', status: 401 });
            return;
        }

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        sendResponse({ success: true, data });
    } catch (error) {
        console.error('[BG] Log Action error:', error);
        sendResponse({ success: false, error: error.message });
    }
}
