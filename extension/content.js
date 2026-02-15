// Basic GreenLoop Content Script

const SERVER_URL = 'http://localhost:3001';

function getProductTitle() {
    // Amazon
    const amazonTitle = document.getElementById('productTitle');
    if (amazonTitle) return amazonTitle.innerText.trim();

    // Walmart (selectors might vary, using a generic guess for now or specific if known)
    const walmartTitle = document.querySelector('h1');
    if (walmartTitle) return walmartTitle.innerText.trim();

    return null;
}

function injectBanner(swapData) {
    if (document.getElementById('greenloop-banner')) return;

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
                        <span class="gl-score">EcoScore: ${swapData.ecoScore}/100</span>
                        <span class="gl-points">+100 EcoXP</span>
                    </div>
                </div>
                <button id="gl-swap-btn">View Swap</button>
            </div>
            <button id="gl-close">×</button>
        </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('gl-swap-btn').addEventListener('click', () => {
        // Log action to backend
        fetch(`${SERVER_URL}/api/action`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'user1', // Hardcoded for MVP
                actionType: 'SWAP',
                details: { productName: swapData.name }
            })
        })
            .then(res => res.json())
            .then(data => {
                alert(`You earned ${data.xpGained} EcoXP! New Level: ${data.newLevel}`);
            })
            .catch(err => console.error('Error logging swap:', err));
    });

    document.getElementById('gl-close').addEventListener('click', () => {
        banner.remove();
    });
}

async function checkProduct() {
    const title = getProductTitle();
    if (!title) return;

    console.log('GreenLoop checking product:', title);

    try {
        const response = await fetch(`${SERVER_URL}/api/products/search?q=${encodeURIComponent(title)}`);
        const data = await response.json();

        if (data.found) {
            console.log('GreenLoop swap found:', data.swap);
            injectBanner(data.swap);
        }
    } catch (error) {
        console.error('GreenLoop connection error:', error);
    }
}

// Run on load
window.addEventListener('load', () => {
    setTimeout(checkProduct, 1000); // Slight delay for dynamic loading
});
