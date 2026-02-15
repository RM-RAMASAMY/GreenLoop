require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const session = require('express-session');

// Models
const User = require('./models/User');
const Action = require('./models/Action');
const Swap = require('./models/Swap');

const app = express();
const PORT = 3001;

// --- Middleware ---
app.use(cors({
    origin: true, // Allow all origins (including chrome-extension://)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.JWT_SECRET || 'greenloop-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using https
}));

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/greenloop')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err.message));

// --- Passport Google OAuth ---
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Find or create user
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails?.[0]?.value || `${profile.id}@google.com`,
                avatar: profile.photos?.[0]?.value || null,
            });
            console.log('🆕 New user created:', user.name);
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

app.use(passport.initialize());

// --- JWT Helpers ---
function generateToken(user) {
    return jwt.sign(
        { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '7d' }
    );
}

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
        req.userId = decoded.id;
        req.userName = decoded.name;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// --- Auth Routes ---

// Start Google OAuth flow
app.get('/auth/google', (req, res, next) => {
    // Store source in session
    if (req.query.source) {
        req.session.authSource = req.query.source;
        console.log('[AUTH] Source set to:', req.session.authSource);
    }
    // Pass to passport
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false // We still manage our own JWT session, but use express-session for temporary state
    })(req, res, next);
});

// Google OAuth callback
app.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth_failed` }),
    (req, res) => {
        console.log('[AUTH_DEBUG] Callback Query:', req.query); // DEBUG
        const token = generateToken(req.user);

        // Check session for source
        const source = req.session.authSource;
        console.log('[AUTH_DEBUG] Session Source:', source); // DEBUG

        if (source === 'extension') {
            // Clear session source
            req.session.authSource = null;
            // Redirect to special extension success page
            res.redirect(`${process.env.BACKEND_URL || 'http://localhost:3001'}/auth/extension/success?token=${token}&name=${encodeURIComponent(req.user.name)}`);
        } else {
            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?token=${token}`);
        }
    }
);

// Extension Success Page (Token Capture)
app.get('/auth/extension/success', (req, res) => {
    const { token, name } = req.query;
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login Successful</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 50px; background: #f0fdf4; color: #166534; }
                h1 { margin-bottom: 10px; }
                p { color: #15803d; }
                .token-box { background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; word-break: break-all; display: none; }
            </style>
        </head>
        <body>
            <h1>🌿 GreenLoop</h1>
            <h2>Login Successful!</h2>
            <p>Welcome back, ${name || 'EcoWarrior'}.</p>
            <p>You can now close this tab and return to the extension.</p>
            <div id="token" style="display:none;">${token}</div>
            <script>
                // The content script will read this div
                console.log("Login successful. Ready for capture.");
            </script>
        </body>
        </html>
    `);
});

// Demo login (for development without Google OAuth configured)
app.post('/auth/demo-login', async (req, res) => {
    const { name, email } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name: name || 'EcoWarrior',
                email: email || 'demo@greenloop.app',
                totalXP: 0, // Start at 0 for real progress
            });
            // Seed some demo data for new users
            await seedDemoData(user._id);
        } else if (name && name !== user.name) {
            // Update name if user provided a new one
            user.name = name;
            await user.save();
        }
        const token = generateToken(user);
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API Routes ---

// 0. Health Check
app.get('/', (req, res) => {
    res.json({ status: '🌿 GreenLoop Backend Active', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// 1. Get Current User
app.get('/api/user/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-__v');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Voice AI Integration (Gemini + ElevenLabs) ---
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const { spawn } = require('child_process');

// --- Helper: Get Embedding ---
async function getEmbedding(text) {
    try {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (e) {
        console.error("Embedding Error:", e);
        return null;
    }
}

// --- Helper: Call Python Vector Bridge ---
function callVectorBridge(command, data) {
    return new Promise((resolve) => {
        const pythonProcess = spawn('python', ['vector_bridge.py']); // Assumes running from backend/ dir
        let output = '';

        pythonProcess.stdout.on('data', (chunk) => { output += chunk; });
        pythonProcess.stderr.on('data', (chunk) => { console.error(`[VectorBridge Log]: ${chunk}`); });

        pythonProcess.on('close', (code) => {
            try {
                if (!output) resolve(null);
                else resolve(JSON.parse(output));
            } catch (e) {
                console.error("Vector Bridge Parse Error:", e, "Output:", output);
                resolve(null);
            }
        });

        pythonProcess.stdin.write(JSON.stringify({ command, data }));
        pythonProcess.stdin.end();
    });
}

app.post('/api/chat', authMiddleware, async (req, res) => {
    const { message } = req.body;

    try {
        // --- Context Retrieval (RAG-Lite) ---
        const userPromise = User.findById(req.userId);
        const actionsPromise = Action.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(10);
        const swapsPromise = Swap.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(5);

        // Vector Search (Async, non-blocking if fails)
        const embedding = await getEmbedding(message);
        let vectorHits = [];
        if (embedding) {
            const vectorResult = await callVectorBridge("search", { vector: embedding, top_k: 3 });
            if (vectorResult && vectorResult.status === "success") {
                vectorHits = vectorResult.hits || [];
            }
        }

        const [user, actions, swaps] = await Promise.all([userPromise, actionsPromise, swapsPromise]);

        // Build Context String
        let context = `[USER CONTEXT]\nName: ${user.name}\nLevel: ${user.level}\nXP: ${user.totalXP}\n\n[RECENT ACTIONS]\n`;
        actions.forEach(a => context += `- ${a.actionType}: ${JSON.stringify(a.details)} (${new Date(a.createdAt).toLocaleDateString()})\n`);

        context += `\n[RECENT SWAPS]\n`;
        swaps.forEach(s => context += `- Swapped ${s.original} for ${s.swap}\n`);

        if (vectorHits.length > 0) {
            context += `\n[RELEVANT MEMORIES (Vector DB)]\n`;
            vectorHits.forEach(h => context += `- ${JSON.stringify(h.payload)}\n`);
        }

        console.log("Generated Context for Gemini:", context.substring(0, 200) + "...");

        // 1. Gemini Reasoning
        // Using gemini-2.5-flash as requested
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{
                        text: `You are 'The Green Man', a wise, friendly, and slightly mystical AI assistant focused on sustainability. 
                    
                    Here is the live data for the user you are talking to:
                    ${context}
                    
                    Use this data to be personal and specific. If they ask about their stats, use the numbers provided.
                    Keep answers concise and suitable for speech.` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Greetings, friend. I see your journey clearly. How may I assist you?" }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const replyText = result.response.text();

        // 2. ElevenLabs Text-to-Speech
        let audioBase64 = null;
        if (process.env.ELEVENLABS_API_KEY) {
            try {
                // Use '9BWtsMINqrJLrRacOk9x' (Aria) as default - standard voices are usually free
                const voiceId = process.env.ELEVENLABS_VOICE_ID || '9BWtsMINqrJLrRacOk9x';
                console.log("Using ElevenLabs Voice ID:", voiceId);
                const ttsResponse = await axios.post(
                    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
                    {
                        text: replyText,
                        model_id: "eleven_flash_v2_5",
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.75,
                        },
                    },
                    {
                        headers: {
                            'Accept': 'audio/mpeg',
                            'xi-api-key': process.env.ELEVENLABS_API_KEY,
                            'Content-Type': 'application/json',
                        },
                        responseType: 'arraybuffer',
                    }
                );
                audioBase64 = Buffer.from(ttsResponse.data).toString('base64');
            } catch (ttsError) {
                console.error("ElevenLabs TTS Error:", ttsError.message);
                if (ttsError.response) {
                    // Convert buffer to string for readable error message
                    const errorMsg = Buffer.isBuffer(ttsError.response.data)
                        ? ttsError.response.data.toString('utf8')
                        : JSON.stringify(ttsError.response.data);
                    console.error("ElevenLabs Error Details:", errorMsg);
                }
                // Fallback: Frontend will handle missing audio (or use browser TTS)
            }
        }

        res.json({ reply: replyText, audio: audioBase64 });

    } catch (error) {
        console.error("Voice AI Error Details:", error);

        if (error.response) {
            console.error("API Response Error:", error.response.data);
        }
        res.status(500).json({ error: "Failed to commune with nature (AI Error)" });
    }
});

// 2. Get User Stats (Dashboard data)
app.get('/api/user/me/stats', authMiddleware, async (req, res) => {
    try {
        let user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Recalculate total XP from all sources to ensure absolute synchronization
        const allActions = await Action.find({ userId: req.userId }).sort({ createdAt: 1 });
        const totalActionXP = allActions.reduce((s, a) => s + (a.xpGained || 0), 0);

        const swaps = await Swap.find({ userId: req.userId });
        const totalSwapXP = swaps.reduce((s, sw) => s + (sw.xp || 100), 0);

        const calculatedXP = totalActionXP + totalSwapXP;

        // Auto-sync User model if drift detected
        if (user.totalXP !== calculatedXP) {
            console.log(`[SYNC] XP Drift Corrected for ${user.name}: ${user.totalXP} -> ${calculatedXP}`);
            user.totalXP = calculatedXP;
            user.calculateLevel();
            await user.save();
        }

        // Streak & Total Logs Calculation
        const dates = [...new Set(allActions.map(a => new Date(a.createdAt).toDateString()))];
        const streak = dates.length; // Count unique active days

        const today = new Date().toDateString();
        const todayXP = allActions
            .filter(a => new Date(a.createdAt).toDateString() === today)
            .reduce((s, a) => s + (a.xpGained || 0), 0);

        // Weekly Chart Data
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const xpByDay = {};
        days.forEach(d => xpByDay[d] = 0);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        allActions.filter(a => a.createdAt >= sevenDaysAgo).forEach(a => {
            const day = days[new Date(a.createdAt).getDay()];
            xpByDay[day] += a.xpGained;
        });
        const xpData = days.map(d => ({ name: d, xp: xpByDay[d] }));

        const totalCO2 = swaps.reduce((sum, s) => sum + (s.co2Saved || 0), 0);
        const totalPlastic = swaps.reduce((sum, s) => sum + (s.plasticSaved || 0), 0);

        // Activity Distribution
        const activityCounts = {};
        allActions.forEach(a => {
            const type = a.actionType || 'OTHER';
            activityCounts[type] = (activityCounts[type] || 0) + 1;
        });

        const typeColors = {
            'PLANT': '#10B981', // Emerald
            'WALK': '#3B82F6',  // Blue
            'REFILL': '#06B6D4', // Cyan
            'COMPOST': '#F59E0B', // Amber
            'SWAP': '#8B5CF6', // Purple
            'CLEANUP': '#EC4899', // Pink
            'OBSERVE': '#6366F1', // Indigo
            'OTHER': '#6B7280' // Gray
        };

        const impactData = Object.keys(activityCounts).map(type => ({
            name: type.charAt(0) + type.slice(1).toLowerCase(),
            value: activityCounts[type],
            color: typeColors[type] || '#9CA3AF'
        }));

        res.json({
            name: user.name,
            level: user.level,
            xp: user.totalXP,
            nextLevelXp: getNextLevelXp(user.totalXP),
            streak,
            todayXP,
            totalLogs: allActions.length,
            xpData,
            impactData,
            totalActions: allActions.length,
            totalSwaps: swaps.length,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Log Action
app.post('/api/action', authMiddleware, async (req, res) => {
    const { actionType, details } = req.body;

    const xpMap = { PLANT: 50, SWAP: 100, WALK: 30, REFILL: 10, COMPOST: 20, CLEANUP: 40, OBSERVE: 15 };
    const xpGained = xpMap[actionType] || 5;

    try {
        const action = await Action.create({
            userId: req.userId,
            actionType,
            details,
            xpGained,
            location: details?.location || null,
        });

        console.log(`[ACTION] ${actionType} logged by ${req.userName}. Location:`, action.location);

        // Update user XP
        const user = await User.findById(req.userId);
        user.totalXP += xpGained;
        user.calculateLevel();
        await user.save();

        const messages = {
            PLANT: 'You planted a new life! 🌱',
            SWAP: `Great choice swapping to ${details?.productName || 'an eco product'}!`,
            WALK: 'Walking saves carbon! 🚶',
            REFILL: 'Hydrated and sustainable! 💧',
            COMPOST: 'Feeding the earth! 🌍',
            CLEANUP: 'Making the world cleaner! 🧹',
            OBSERVE: 'Eyes on the environment! 👀',
        };

        // --- ASYNC VECTOR UPSERT ---
        (async () => {
            try {
                const textDescription = `${actionType}: ${details?.description || JSON.stringify(details)} at ${action.location ? JSON.stringify(action.location) : 'unknown location'}`;
                const embedding = await getEmbedding(textDescription);
                if (embedding) {
                    await callVectorBridge("upsert", {
                        id: action._id.toString(),
                        vector: embedding,
                        payload: { type: "ACTION", text: textDescription, date: new Date() }
                    });
                    console.log("[VectorDB] Action Upserted");
                }
            } catch (e) {
                console.error("[VectorDB] Upsert Failed:", e);
            }
        })();
        // ---------------------------

        res.json({
            success: true,
            message: messages[actionType] || 'Action logged!',
            xpGained,
            newTotal: user.totalXP,
            newLevel: user.level,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get Swaps
app.get('/api/swaps', authMiddleware, async (req, res) => {
    try {
        const swaps = await Swap.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(swaps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Log a Swap
app.post('/api/swaps', authMiddleware, async (req, res) => {
    try {
        const swap = await Swap.create({ userId: req.userId, ...req.body });

        // Also give XP
        const user = await User.findById(req.userId);
        user.totalXP += swap.xp || 100;
        user.calculateLevel();
        await user.save();

        // --- ASYNC VECTOR UPSERT ---
        (async () => {
            try {
                const textDescription = `Swapped ${req.body.original} for ${req.body.swap}`;
                const embedding = await getEmbedding(textDescription);
                if (embedding) {
                    await callVectorBridge("upsert", {
                        id: swap._id.toString(),
                        vector: embedding,
                        payload: { type: "SWAP", text: textDescription, date: new Date() }
                    });
                    console.log("[VectorDB] Swap Upserted");
                }
            } catch (e) {
                console.error("[VectorDB] Upsert Failed:", e);
            }
        })();
        // ---------------------------

        res.json({ success: true, swap, newTotal: user.totalXP });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Leaderboard (top users by XP)
app.get('/api/leaderboard', async (req, res) => {
    try {
        const users = await User.find({ totalXP: { $gt: 0 } })
            .select('name totalXP level avatar createdAt')
            .sort({ totalXP: -1 })
            .limit(20);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Get User Settings
app.get('/api/user/me/settings', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('settings');
        res.json(user?.settings || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Update User Settings
app.put('/api/user/me/settings', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.settings = { ...user.settings.toObject(), ...req.body };
        await user.save();
        res.json({ success: true, settings: user.settings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. Get Recent Actions (for Profile page)
app.get('/api/actions', authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const actions = await Action.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(limit);
        res.json(actions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9.5 Delete an Action
app.delete('/api/actions/:id', authMiddleware, async (req, res) => {
    console.log(`[DELETE_REQ] Attempting to delete action: ${req.params.id} for user: ${req.userId}`);
    try {
        // Find action first to get XP value
        const action = await Action.findOne({ _id: req.params.id, userId: req.userId });
        if (!action) {
            return res.status(404).json({ error: 'Action not found or unauthorized' });
        }

        const xpToSubtract = action.xpGained || 0;

        // Delete the action
        await Action.findByIdAndDelete(req.params.id);

        // Update user XP atomically to prevent drift
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { $inc: { totalXP: -xpToSubtract } },
            { new: true }
        );

        if (updatedUser) {
            if (updatedUser.totalXP < 0) updatedUser.totalXP = 0;
            updatedUser.calculateLevel();
            await updatedUser.save();
            console.log(`[DELETE] Action ${req.params.id} deleted. Subtracted ${xpToSubtract} XP. New total: ${updatedUser.totalXP}`);
        }

        res.json({
            success: true,
            message: 'Action deleted and XP updated',
            newTotal: updatedUser ? updatedUser.totalXP : null
        });
    } catch (err) {
        console.error('[DELETE_ERR]', err);
        res.status(500).json({ error: err.message });
    }
});

// 10. Get All Plant Pins for Map
app.get('/api/plants', async (req, res) => {
    try {
        console.log('[GET] Fetching all plant pins...');
        // Find all PLANT actions that have a location
        const actions = await Action.find({
            actionType: 'PLANT',
            'location.lat': { $ne: null },
            'location.lng': { $ne: null }
        }).populate('userId', 'name');

        console.log(`[GET] Found ${actions.length} potential plants with location.`);

        // Map to format suitable for MapPage pins
        const plantPins = actions.map(a => ({
            id: a._id,
            lat: Number(a.location.lat),
            lng: Number(a.location.lng),
            userName: a.userId?.name || 'EcoWarrior',
            plantNumber: a.details?.plantName || 'Plant',
            type: a.details?.plantType || 'tree',
            title: a.details?.title || 'Green Spot',
            desc: a.details?.description || 'Planted with GreenLoop',
            createdAt: a.createdAt
        }));

        res.json(plantPins);
    } catch (err) {
        console.error('[ERROR] /api/plants failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// 11. Product Search (for Chrome Extension — public)
// 11. Product Search (AI Powered)
async function getSustainableSwap(productName) {
    const prompt = `
    Analyze the product: "${productName}".
    
    1. Is this product generally considered non-sustainable or single-use plastic? (Boolean)
    2. If yes, suggest ONE specific, highly-rated sustainable alternative product name.
    3. Provide a short, punchy reason why it's better (max 10 words).
    4. Estimate an EcoScore (0-100) for the alternative.
    5. Provide a search query string to find this alternative on Amazon.

    Output PURE JSON format only:
    {
        "isNonSustainable": boolean,
        "originalName": string,
        "swap": {
            "name": string,
            "description": string,
            "ecoScore": number,
            "searchQuery": string
        }
    }
    If the product is already sustainable or not clear, set "isNonSustainable": false.
    `;

    try {
        console.log(`[AI] Generating content for: ${prompt.substring(0, 50)}...`);
        const result = await model.generateContent(prompt);
        console.log('[AI] Result received');
        const response = await result.response;
        const text = response.text();
        console.log('[AI] Text:', text);

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Error:", error);
        return { isNonSustainable: false };
    }
}

app.get('/api/products/search', async (req, res) => {
    const query = req.query.q?.toLowerCase();
    // console.log(`[SEARCH] Query received: "${query}"`); 

    if (!query) return res.json([]);

    // AI Search
    try {
        const aiResult = await getSustainableSwap(query);

        if (aiResult.isNonSustainable) {
            // Mock image for now, real image API is complex without scraping
            // We'll use a generic placeholder or try to guess based on keyword
            let image = 'https://m.media-amazon.com/images/I/71wF7xS5ZAL._AC_SL1500_.jpg'; // Default generic bottle

            res.json({
                found: true,
                original: { name: aiResult.originalName },
                swap: {
                    ...aiResult.swap,
                    image: image
                }
            });
        } else {
            console.log(`[SEARCH] AI determined "${query}" is sustainable or unknown.`);
            res.json({ found: false });
        }
    } catch (e) {
        console.error("Search Handler Error:", e);
        res.json({ found: false });
    }
});

// --- Helpers ---
function getNextLevelXp(xp) {
    if (xp < 100) return 100;
    if (xp < 500) return 500;
    if (xp < 2000) return 2000;
    if (xp < 5000) return 5000;
    return 10000;
}

// Seed demo data for new users
async function seedDemoData(userId) {
    const demoActions = [
        {
            userId,
            actionType: 'PLANT',
            details: {
                plantName: 'Coast Live Oak',
                plantType: 'tree',
                title: 'Golden Gate Park Garden',
                description: 'Planted near the entrance'
            },
            xpGained: 50,
            location: { lat: 37.7694, lng: -122.4862 }
        },
        {
            userId,
            actionType: 'PLANT',
            details: {
                plantName: 'California Poppy',
                plantType: 'flower',
                title: 'Presidio Wildflowers',
                description: 'Helping native pollinators'
            },
            xpGained: 50,
            location: { lat: 37.7984, lng: -122.4662 }
        },
        {
            userId,
            actionType: 'PLANT',
            details: {
                plantName: 'Manzanita',
                plantType: 'bush',
                title: 'Bernal Heights Patch',
                description: 'Drought-resistant native'
            },
            xpGained: 50,
            location: { lat: 37.7431, lng: -122.4162 }
        },
        { userId, actionType: 'WALK', details: { description: 'Walked to work instead of driving' }, xpGained: 30 },
        { userId, actionType: 'REFILL', details: { description: 'Used reusable water bottle' }, xpGained: 10 },
        { userId, actionType: 'COMPOST', details: { description: 'Composted kitchen scraps' }, xpGained: 20 },
        { userId, actionType: 'CLEANUP', details: { description: 'Beach cleanup at Ocean Beach', location: 'Ocean Beach, SF' }, xpGained: 40 },
    ];
    const demoSwaps = [
        { userId, original: 'Plastic Water Bottle', swap: 'Stainless Steel Bottle', category: 'Hydration', ecoScoreBefore: 10, ecoScoreAfter: 95, xp: 100, co2Saved: 0.8, plasticSaved: 42 },
        { userId, original: 'Head & Shoulders Shampoo', swap: 'Ethique Shampoo Bar', category: 'Personal Care', ecoScoreBefore: 30, ecoScoreAfter: 98, xp: 100, co2Saved: 1.2, plasticSaved: 85 },
        { userId, original: 'Plastic Straws', swap: 'Stainless Steel Straws', category: 'Kitchen', ecoScoreBefore: 5, ecoScoreAfter: 95, xp: 100, co2Saved: 0.5, plasticSaved: 30 },
    ];
    await Action.insertMany(demoActions);
    await Swap.insertMany(demoSwaps);
}

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`🌿 GreenLoop Backend running on http://localhost:${PORT}`);
});
