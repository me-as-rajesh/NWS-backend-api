const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobname: { type: String, required: true },
    education: { type: String },
    about: { type: String },
    experience: { type: String },
    skills: [String],
    hourlyRate: { type: Number },
    availability: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    totalJobs: { type: Number, default: 0 },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    certificates: [{
        url: { type: String },
        name: { type: String },
        issuedDate: { type: Date },
    }]
});

module.exports = mongoose.model('Worker', workerSchema);