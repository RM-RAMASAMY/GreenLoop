require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

// Models
const User = require('./models/User');
const Action = require('./models/Action');
const Swap = require('./models/Swap');

const app = express();
const PORT = 3001;

// --- Middleware ---
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(bodyParser.json());

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
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
}));

// Google OAuth callback
app.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth_failed` }),
    (req, res) => {
        const token = generateToken(req.user);
        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?token=${token}`);
    }
);

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

        const impactData = [
            { name: 'Activities', value: allActions.length, color: '#10B981' },
            { name: 'CO₂ Saved', value: Math.round(totalCO2 * 10), color: '#3B82F6' },
            { name: 'Plastic', value: Math.round(totalPlastic / 10), color: '#F59E0B' },
        ];

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
const products = [
    { id: 'p1', name: 'Plastic Water Bottle', category: 'Hydration', ecoScore: 10, keywords: ['plastic', 'disposable', 'water bottle'], swap: { name: 'Stainless Steel Bottle', ecoScore: 95, description: 'Lasts a lifetime, keeps water cold.' } },
    { id: 'p2', name: 'Head & Shoulders Shampoo', category: 'Personal Care', ecoScore: 30, keywords: ['shampoo', 'plastic bottle', 'head & shoulders'], swap: { name: 'Ethique Shampoo Bar', ecoScore: 98, description: 'Plastic-free, concentrated, lasts longer.' } },
    { id: 'p3', name: 'Plastic Toothbrush', category: 'Personal Care', ecoScore: 20, keywords: ['toothbrush', 'plastic brush', 'oral care'], swap: { name: 'Bamboo Toothbrush', ecoScore: 99, description: 'Biodegradable handle, natural bristles.' } },
    { id: 'p4', name: 'Plastic Straws', category: 'Kitchen', ecoScore: 5, keywords: ['straw', 'plastic straw'], swap: { name: 'Stainless Steel Straws', ecoScore: 95, description: 'Reusable, easy to clean.' } },
    { id: 'p5', name: 'Plastic Grocery Bag', category: 'Shopping', ecoScore: 10, keywords: ['bag', 'shopping bag', 'plastic bag'], swap: { name: 'Organic Cotton Tote', ecoScore: 92, description: 'Durable, replaces 1000+ bags.' } },
    { id: 'p6', name: 'Plastic Cutlery', category: 'Kitchen', ecoScore: 15, keywords: ['fork', 'spoon', 'knife', 'cutlery'], swap: { name: 'Bamboo Travel Cutlery', ecoScore: 97, description: 'Lightweight, sustainable.' } },
];

app.get('/api/products/search', (req, res) => {
    const query = req.query.q?.toLowerCase();
    if (!query) return res.json([]);
    const match = products.find(p => p.keywords.some(k => query.includes(k)));
    if (match) {
        res.json({ found: true, original: { name: match.name, ecoScore: match.ecoScore }, swap: match.swap });
    } else {
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
