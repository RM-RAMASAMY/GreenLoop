const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        // For listing models, we don't need a specific model instance usually, 
        // but the SDK structure might require us to just use the genAI instance if available, 
        // or we can try a known model to get the client started.
        // Actually, the SDK doesn't have a direct 'listModels' on the top level in some versions.
        // Let's try to just run a simple generation with a known older model to see if ANYTHING works.

        // Attempt 1: gemini-pro (often standard)
        console.log("Trying gemini-pro...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const resultPro = await modelPro.generateContent("Hello");
        console.log("gemini-pro works!");
    } catch (error) {
        console.log("gemini-pro failed:", error.message);
    }

    try {
        // Attempt 2: gemini-1.5-flash
        console.log("Trying gemini-1.5-flash...");
        const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const resultFlash = await modelFlash.generateContent("Hello");
        console.log("gemini-1.5-flash works!");
    } catch (error) {
        console.log("gemini-1.5-flash failed:", error.message);
    }

    try {
        // Attempt 3: gemini-1.5-flash-latest
        console.log("Trying gemini-1.5-flash-latest...");
        const modelFlashLat = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const resultFlashLat = await modelFlashLat.generateContent("Hello");
        console.log("gemini-1.5-flash-latest works!");
    } catch (error) {
        console.log("gemini-1.5-flash-latest failed:", error.message);
    }

    try {
        // Attempt 4: gemini-2.5-flash
        console.log("Trying gemini-2.5-flash...");
        const modelFlash25 = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const resultFlash25 = await modelFlash25.generateContent("Hello");
        console.log("gemini-2.5-flash works!");
        console.log(resultFlash25.response.text());
    } catch (error) {
        console.log("gemini-2.5-flash failed:", error.message);
    }
}

listModels();
