const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        lastSeen: { type: Date },
    }],
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
});

module.exports = mongoose.model('Chat', chatSchema);