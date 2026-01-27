const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
        }
    },
    address: { type: String },
    budget: { type: Number, required: true },
    duration: { type: String },
    status: { type: String, enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
    proposals: [{
        workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' },
        bidAmount: { type: Number },
        message: { type: String },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
    }],
    images: [String],
}, { timestamps: true });

jobSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Job', jobSchema);