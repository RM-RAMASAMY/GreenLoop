const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

async function testSearch(productName) {
    const prompt = `
    Analyze the product: "${productName}".
    
    1. Is there a more eco-friendly or sustainable alternative to this product? (Boolean)
    2. Suggest ONE specific, highly-rated sustainable alternative product name.
    3. Provide a short, punchy reason why it's better (max 10 words).
    4. Estimate an EcoScore (0-100) for the alternative.
    5. Provide a search query string to find this alternative on Amazon.

    Output PURE JSON format only:
    {
        "hasBetterAlternative": boolean,
        "originalName": string,
        "swap": {
            "name": string,
            "description": string,
            "ecoScore": number,
            "searchQuery": string
        }
    }
    If the product is already the best option, set "hasBetterAlternative": false.
    `;

    try {
        console.log(`Testing search for: ${productName}`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("RAW AI RESPONSE:");
        console.log(text);

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);
        console.log("PARSED DATA:");
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

testSearch("plastic cup");
