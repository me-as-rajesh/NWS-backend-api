const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Basic Information
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phoneNo: { type: String, required: true },
    password: { type: String, required: true },
    
    // Profile Information
    pimage: { type: String }, // Cloudinary URL
    address: { type: String },
    latitude: { type: Number }, // User's latitude for geolocation
    longitude: { type: Number }, // User's longitude for geolocation
    
    // Location (GeoJSON format for geospatial queries)
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
        }
    },
    
    // Job Information
    jobname: { type: String }, // Job title/profession
    
    // Role and Status
    role: { type: String, enum: ['user', 'worker', 'admin'], default: 'user' },
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);