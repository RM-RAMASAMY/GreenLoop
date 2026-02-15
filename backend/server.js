const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// --- In-Memory Database (Mock) ---

const users = [
    {
        id: 'user1',
        name: 'EcoWarrior',
        email: 'user@example.com',
        totalXP: 1250,
        level: 'Sapling',
        garden: [], // Array of planted items
        history: [], // History of actions
        streak: 5,
        location: { lat: 37.7749, lng: -122.4194 } // San Francisco
    }
];

const leaderboards = {
    neighborhood: [
        { id: 'u2', name: 'NeighborNed', xp: 1500 },
        { id: 'user1', name: 'EcoWarrior', xp: 1250 },
        { id: 'u3', name: 'SallySustainable', xp: 900 }
    ],
    campus: [
        { id: 'c1', name: 'Biology Dept', xp: 50000 },
        { id: 'c2', name: 'Computer Science', xp: 45000 }
    ],
    company: [
        { id: 'comp1', name: 'GreenCorp', xp: 100000 },
        { id: 'comp2', name: 'TechGiant', xp: 80000 }
    ]
};

const products = [
    {
        id: 'p1',
        name: 'Plastic Water Bottle',
        category: 'Hydration',
        ecoScore: 10,
        keywords: ['plastic', 'disposable', 'water bottle'],
        swap: {
            id: 's1',
            name: 'Stainless Steel Bottle',
            ecoScore: 95,
            image: 'https://images.unsplash.com/photo-1602143407151-11115cdbf69c?w=400',
            description: 'Lasts a lifetime, keeps water cold.'
        }
    },
    {
        id: 'p2',
        name: 'Head & Shoulders Shampoo', // Example from FRD
        category: 'Personal Care',
        ecoScore: 30,
        keywords: ['shampoo', 'plastic bottle', 'head & shoulders'],
        swap: {
            id: 's2',
            name: 'Ethique Shampoo Bar',
            ecoScore: 98,
            image: 'https://plus.unsplash.com/premium_photo-1675806655187-d46ae3722c83?w=400',
            description: 'Plastic-free, concentrated, lasts longer.'
        }
    },
    {
        id: 'p3',
        name: 'Plastic Toothbrush',
        category: 'Personal Care',
        ecoScore: 20,
        keywords: ['toothbrush', 'plastic brush', 'oral care'],
        swap: {
            id: 's3',
            name: 'Bamboo Toothbrush',
            ecoScore: 99,
            image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb6dcaf?w=400',
            description: 'Biodegradable handle, natural bristles.'
        }
    },
    {
        id: 'p4',
        name: 'Plastic Straws',
        category: 'Kitchen',
        ecoScore: 5,
        keywords: ['straw', 'plastic straw', 'drinking straw'],
        swap: {
            id: 's4',
            name: 'Stainless Steel Straws',
            ecoScore: 95,
            image: 'https://images.unsplash.com/photo-1541108564883-b68486299580?w=400',
            description: 'Reusable, easy to clean, ocean-friendly.'
        }
    },
    {
        id: 'p5',
        name: 'Plastic Grocery Bag',
        category: 'Shopping',
        ecoScore: 10,
        keywords: ['bag', 'shopping bag', 'plastic bag', 'carrier bag'],
        swap: {
            id: 's5',
            name: 'Organic Cotton Tote',
            ecoScore: 92,
            image: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=400',
            description: 'Durable, washable, replaces 1000+ bags.'
        }
    },
    {
        id: 'p6',
        name: 'Plastic Cutlery',
        category: 'Kitchen',
        ecoScore: 15,
        keywords: ['fork', 'spoon', 'knife', 'plastic cutlery', 'disposable cutlery'],
        swap: {
            id: 's6',
            name: 'Bamboo Travel Cutlery',
            ecoScore: 97,
            image: 'https://images.unsplash.com/photo-1584346133934-a3afd2a8d6f1?w=400',
            description: 'Lightweight, sustainable, perfect for travel.'
        }
    }
];

// --- Helper Functions ---

const calculateLevel = (xp) => {
    if (xp < 100) return 'Seed';
    if (xp < 500) return 'Seedling';
    if (xp < 2000) return 'Sapling';
    if (xp < 5000) return 'Tree';
    return 'Forest';
};

// --- API Endpoints ---

// 0. Root Endpoint (Health Check)
app.get('/', (req, res) => {
    res.send('🌿 GreenLoop Backend is Active! Try /api/user/user1');
});

// 1. Get User Data
app.get('/api/user/:id', (req, res) => {
    const user = users.find(u => u.id === req.params.id) || users[0]; // Default to first user for demo
    res.json(user);
});

// 2. Log Action (The Core Loop)
app.post('/api/action', (req, res) => {
    const { userId, actionType, details } = req.body;
    // details: { product, location, plantName, etc. }

    // Find user (or default)
    let user = users.find(u => u.id === userId);
    if (!user) user = users[0];

    let xpGained = 0;
    let message = '';

    switch (actionType) {
        case 'PLANT':
            xpGained = 50;
            message = 'You planted a new life!';
            if (details.plantName) {
                user.garden.push({
                    id: Date.now(),
                    name: details.plantName,
                    plantedAt: new Date(),
                    location: details.location || user.location
                });
            }
            break;
        case 'SWAP':
            xpGained = 100;
            message = `Great choice swapping to ${details.productName}!`;
            break;
        case 'WALK':
            xpGained = 30;
            message = 'Walking saves carbon!';
            break;
        case 'REFILL':
            xpGained = 10;
            message = 'Hydrated and sustainable!';
            break;
        case 'COMPOST':
            xpGained = 20;
            message = 'Feeding the earth!';
            break;
        default:
            xpGained = 5;
            message = 'Action logged.';
    }

    user.totalXP += xpGained;
    user.level = calculateLevel(user.totalXP);
    user.history.unshift({ action: actionType, xp: xpGained, date: new Date(), details });

    res.json({
        success: true,
        message,
        xpGained,
        newTotal: user.totalXP,
        newLevel: user.level
    });
});

// 3. Product Search (For Chrome Extension)
app.get('/api/products/search', (req, res) => {
    const query = req.query.q?.toLowerCase();
    if (!query) return res.json([]);

    // Simple keyword match
    const match = products.find(p => p.keywords.some(k => query.includes(k)));

    if (match) {
        res.json({
            found: true,
            original: { name: match.name, ecoScore: match.ecoScore },
            swap: match.swap
        });
    } else {
        res.json({ found: false });
    }
});

// 4. Get Leaderboards
app.get('/api/leaderboard', (req, res) => {
    res.json(leaderboards);
});

// Start Server
app.listen(PORT, () => {
    console.log(`GreenLoop Backend running on http://localhost:${PORT}`);
});
