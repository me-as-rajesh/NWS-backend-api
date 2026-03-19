const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, default: 'General' },
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        },
    },
    locationText: { type: String },
    address: { type: String },
    budget: { type: Number, default: 0 },
    duration: { type: String },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'],
        default: 'pending',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    chatEnabled: { type: Boolean, default: false },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    proposals: [{
        workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
        bidAmount: { type: Number },
        message: { type: String },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    }],
    images: [String],
}, { timestamps: true });

jobSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Job', jobSchema);