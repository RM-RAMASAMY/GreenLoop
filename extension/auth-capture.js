// auth-capture.js
// Runs only on http://localhost:3001/auth/extension/success*

(function () {
    console.log("GreenLoop Auth Capture script running...");

    // 1. Try to read the token from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const name = urlParams.get('name') || "EcoWarrior";

    // 2. Or try to read from the hidden div (fallback)
    const tokenDiv = document.getElementById('token');
    const divToken = tokenDiv ? tokenDiv.innerText : null;

    const finalToken = token || divToken;

    if (finalToken) {
        console.log("Token found! Saving to storage...");

        // Save to Chrome Storage
        chrome.storage.local.set({
            greenloop_token: finalToken,
            greenloop_user: { name: decodeURIComponent(name) } // Simple user object
        }, () => {
            console.log("Token saved. Closing tab...");

            // Optional: Notify the user on the page
            document.body.innerHTML += "<h3 style='color:green; text-align:center;'>Setup Complete! You can close this tab.</h3>";

            // Attempt to close the tab after a short delay
            setTimeout(() => {
                // window.close() only works if the script opened the window, 
                // but we can try sending a message to the background script if we had one.
                // For now, just leave it or try:
                window.close();
            }, 1000);
        });
    } else {
        console.error("No token found on success page.");
    }
})();
