// Basic GreenLoop Content Script

// Basic GreenLoop Content Script

// SERVER_URL is now handled in background.js

// Keep track of the last checked title to avoid spamming the backend
let lastCheckedTitle = '';

function getProductTitle() {
    // 1. Amazon Product Page
    const amazonTitle = document.getElementById('productTitle');
    if (amazonTitle) return amazonTitle.innerText.trim();

    // 2. Amazon Search Page (extract from URL or search bar)
    const urlParams = new URLSearchParams(window.location.search);
    if (window.location.hostname.includes('amazon')) {
        // Try getting search bar value first as it's most accurate
        const searchBar = document.getElementById('twotabsearchtextbox');
        if (searchBar && searchBar.value) return searchBar.value.trim();

        if (urlParams.has('k')) {
            return decodeURIComponent(urlParams.get('k').replace(/\+/g, ' '));
        }
    }

    // 3. Walmart Product Page
    const walmartTitle = document.querySelector('[itemprop="name"]') || document.querySelector('h1');
    if (walmartTitle) return walmartTitle.innerText.trim();

    // 4. Walmart Search Page
    if (window.location.hostname.includes('walmart')) {
        const searchBar = document.querySelector('input[type="search"]');
        if (searchBar && searchBar.value) return searchBar.value.trim();

        if (urlParams.has('q')) {
            return decodeURIComponent(urlParams.get('q'));
        }
    }

    // 5. Fallback: Document Title
    return document.title;
}

const CATEGORIES = {
    'Hydration': ['bottle', 'cup', 'mug', 'flask', 'jug', 'water'],
    'Kitchen': ['straw', 'fork', 'spoon', 'knife', 'cutlery', 'plate', 'bowl', 'container', 'bag', 'wrap', 'sponge', 'towel'],
    'Personal Care': ['shampoo', 'soap', 'toothbrush', 'paste', 'razor', 'floss', 'deodorant', 'pad', 'tampon'],
    'Shopping': ['bag', 'tote', 'sack', 'cart']
};

function inferCategory(name) {
    name = name.toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORIES)) {
        if (keywords.some(k => name.includes(k))) return cat;
    }
    return 'Other';
}

function injectBanner(fullData) {
    if (document.getElementById('greenloop-banner')) return;

    const swapData = fullData.swap;
    const originalName = fullData.original.name;

    const banner = document.createElement('div');
    banner.id = 'greenloop-banner';
    banner.innerHTML = `
        <div class="gl-content">
            <div class="gl-header">
                <span class="gl-logo">🌿 GreenLoop</span>
                <span class="gl-alert">Better Choice Available!</span>
            </div>
            <div class="gl-body">
                <img src="${swapData.image}" alt="${swapData.name}" class="gl-swap-img" />
                <div class="gl-info">
                    <h3>${swapData.name}</h3>
                    <p>${swapData.description}</p>
                    <div class="gl-stats">
                        <span class="gl-score" title="Product sustainability rating by AI">🌱 Sustainability: ${swapData.ecoScore}/100</span>
                        <span class="gl-points">+100 EcoXP if swapped</span>
                    </div>
                </div>
                <button id="gl-swap-btn">View Swap</button>
            </div>
            <button id="gl-close">×</button>
        </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('gl-swap-btn').addEventListener('click', () => {
        // 0. Redirect to Swap (New Feature)
        if (swapData.searchQuery) {
            const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(swapData.searchQuery)}`;
            window.open(searchUrl, '_blank');
        } else {
            // Fallback if no query
            const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(swapData.name)}`;
            window.open(searchUrl, '_blank');
        }

        // 1. Get token from storage
        chrome.storage.local.get(['greenloop_token'], (result) => {
            const token = result.greenloop_token;

            if (!token) {
                // Not logged in -> Prompt user
                alert("Please log in to GreenLoop via the extension icon to track your impact!");
                return;
            }

            // 2. Log action to backend via Background Script
            // 2. Log action as SWAP to backend via Background Script
            const category = inferCategory(originalName);

            chrome.runtime.sendMessage({
                type: 'LOG_SWAP', // Changed from LOG_ACTION
                token: token,
                payload: {
                    original: originalName,
                    swap: swapData.name,
                    category: category,
                    ecoScoreBefore: 20, // Estimated default for non-sustainable items
                    ecoScoreAfter: swapData.ecoScore || 90,
                    xp: 100,
                    co2Saved: 0.5, // Default estimate
                    plasticSaved: 15 // Default estimate
                }
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Runtime error:', chrome.runtime.lastError);
                    return;
                }

                if (!response || !response.success) {
                    if (response && response.status === 401) {
                        alert("Session expired. Please log in again.");
                    } else {
                        console.error('Error logging swap:', response ? response.error : 'Unknown error');
                    }
                    return;
                }

                const data = response.data;
                if (data) {
                    alert(`You earned ${data.xpGained} EcoXP! New Level: ${data.newLevel}`);
                }
            });
        });
    });

    document.getElementById('gl-close').addEventListener('click', () => {
        banner.remove();
    });
}

// Filter out page slogans, generic text, and non-product queries
function isValidProductQuery(query) {
    if (!query || query.length < 3 || query.length > 200) return false;

    // Block known Amazon/Walmart boilerplate text
    const blocklist = [
        'amazon.com', 'spend less', 'smile more', 'shipping made easy',
        'walmart.com', 'save money', 'live better', 'delivering to',
        'hello, sign in', 'returns & orders', 'cart', 'your lists',
        'today\'s deals', 'customer service', 'registry', 'gift cards',
        'sell', 'all', 'buy again', 'browsing history',
    ];
    const lower = query.toLowerCase();
    if (blocklist.some(b => lower.includes(b))) return false;

    // Must have at least 2 word characters (filters out single chars, punctuation noise)
    const words = query.split(/\s+/).filter(w => w.length > 1);
    if (words.length < 1) return false;

    return true;
}

async function checkProduct() {
    const title = getProductTitle();
    if (!title || title === lastCheckedTitle) return;

    // Don't waste API calls on non-product text
    if (!isValidProductQuery(title)) {
        console.log('GreenLoop skipping non-product text:', title.substring(0, 50));
        return;
    }

    lastCheckedTitle = title;
    console.log('GreenLoop checking product/search:', title);

    try {
        // Send message to background script
        chrome.runtime.sendMessage({ type: 'SEARCH_PRODUCT', query: title }, (response) => {
            if (chrome.runtime.lastError) {
                // Suppress harmless context invalidation errors during reloads
                if (!chrome.runtime.lastError.message.includes('Extension context invalidated')) {
                    console.warn('GreenLoop Runtime Warning:', chrome.runtime.lastError);
                }
                return;
            }

            if (response && response.success && response.data) {
                const data = response.data;
                if (data.found) {
                    console.log('GreenLoop swap found:', data.swap.name);
                    if (data.found) {
                        console.log('GreenLoop swap found:', data.swap.name);
                        injectBanner(data); // Pass full data object
                    }
                }
            }
        });
    } catch (error) {
        console.error('GreenLoop init error:', error);
    }
}

// --- Init & Observers ---

// 1. Initial Check
// Run immediately if document is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    checkProduct();
} else {
    window.addEventListener('load', checkProduct);
}
// Also run a bit later for safe measure
setTimeout(checkProduct, 2000);

// 2. Periodic Check (for SPA navigation)
// Increase frequency slightly to be more responsive
setInterval(checkProduct, 5000);

// 3. MutationObserver (optional, but good for catching dynamic load)
// We rely on setInterval for now to avoid complexity with debouncing large DOM changes


