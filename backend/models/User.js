const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, default: 'EcoWarrior' },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: null },
    totalXP: { type: Number, default: 0 },
    level: { type: String, default: 'Seed' },
    streak: { type: Number, default: 0 },
    location: {
        lat: { type: Number, default: 37.7749 },
        lng: { type: Number, default: -122.4194 }
    },
    settings: {
        pushNotifications: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: false },
        swapAlerts: { type: Boolean, default: true },
        leaderboardUpdates: { type: Boolean, default: false },
        darkMode: { type: Boolean, default: false },
        compactMode: { type: Boolean, default: false },
        publicProfile: { type: Boolean, default: true },
        showOnLeaderboard: { type: Boolean, default: true },
        shareActivity: { type: Boolean, default: false },
        locationServices: { type: Boolean, default: true },
        autoDetectProducts: { type: Boolean, default: true },
        showSwapPopup: { type: Boolean, default: true },
    },
    createdAt: { type: Date, default: Date.now }
});

// Calculate level based on XP
userSchema.methods.calculateLevel = function () {
    if (this.totalXP < 100) this.level = 'Seed';
    else if (this.totalXP < 500) this.level = 'Seedling';
    else if (this.totalXP < 2000) this.level = 'Sapling';
    else if (this.totalXP < 5000) this.level = 'Tree';
    else this.level = 'Forest';
    return this.level;
};

module.exports = mongoose.model('User', userSchema);
