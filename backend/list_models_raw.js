const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
    try {
        console.log(`Querying ${URL.replace(API_KEY, 'HIDDEN_KEY')}...`);
        const response = await axios.get(URL);
        const models = response.data.models;
        console.log("Available Models:");
        models.forEach(m => {
            console.log(`- ${m.name} (${m.displayName})`);
            if (m.supportedGenerationMethods) {
                console.log(`  Methods: ${m.supportedGenerationMethods.join(', ')}`);
            }
        });
    } catch (error) {
        console.error("Error listing models:", error.message);
        if (error.response) {
            console.error("Response data:", JSON.stringify(error.response.data, null, 2));
        }
    }
}

listModels();
