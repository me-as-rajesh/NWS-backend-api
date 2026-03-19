const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    chatName: { type: String, default: 'sender' },
    isGroupChat: { type: Boolean, default: false },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);