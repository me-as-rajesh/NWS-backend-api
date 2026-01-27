const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);