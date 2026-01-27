const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phoneNo: { type: String, required: true },
    password: { type: String, required: true },
    address: { type: String },
    pimage: { type: String }, // Cloudinary URL
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
        }
    },
    role: { type: String, enum: ['user', 'worker', 'admin'], default: 'user' },
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);