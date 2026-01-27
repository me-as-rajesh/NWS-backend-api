const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['job_assigned', 'job_completed', 'review', 'message'], required: true },
    read: { type: Boolean, default: false },
    metadata: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);