const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actionType: {
        type: String,
        required: true,
        enum: ['PLANT', 'SWAP', 'WALK', 'REFILL', 'COMPOST', 'CLEANUP', 'OBSERVE', 'OTHER']
    },
    details: {
        plantName: String,        // e.g. "Oak Sapling"
        plantType: String,        // tree, flower, bush, fern
        title: String,            // e.g. "City Hall Garden"
        productName: String,
        description: String,
        imageUrl: String,
    },
    xpGained: { type: Number, required: true },
    location: {
        lat: Number,
        lng: Number
    },
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient user queries
actionSchema.index({ userId: 1, createdAt: -1 });
// Index for plant map queries (actions with location)
actionSchema.index({ actionType: 1, 'location.lat': 1 });

module.exports = mongoose.model('Action', actionSchema);
