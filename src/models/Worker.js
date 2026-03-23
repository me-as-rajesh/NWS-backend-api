const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const workerSchema = new mongoose.Schema({
    // Authentication fields
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['worker'], default: 'worker' },

    // Profile fields
    name: { type: String },
    phoneNo: { type: String },
    pimage: { type: String },
    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
        }
    },

    jobname: { type: String },
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
}, { timestamps: true });

workerSchema.index({ location: '2dsphere' });

workerSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

workerSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Worker', workerSchema);