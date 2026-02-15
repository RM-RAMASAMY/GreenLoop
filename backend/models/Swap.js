const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    original: { type: String, required: true },
    swap: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Hydration', 'Personal Care', 'Kitchen', 'Shopping', 'Other']
    },
    ecoScoreBefore: { type: Number, required: true },
    ecoScoreAfter: { type: Number, required: true },
    xp: { type: Number, default: 100 },
    co2Saved: { type: Number, default: 0 },       // in kg
    plasticSaved: { type: Number, default: 0 },    // in grams
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient user queries
swapSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Swap', swapSchema);
