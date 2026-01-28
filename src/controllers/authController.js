const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const cloudinary = require('cloudinary').v2;
const asyncHandler = require('express-async-handler');

// @desc    Register a new user with profile image
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { 
        name, 
        username, 
        email, 
        phoneNo, 
        password, 
        address,
        latitude,
        longitude,
        jobname,
        role 
    } = req.body;

    // Validation
    if (!name || !username || !email || !phoneNo || !password) {
        res.status(400);
        throw new Error('Please provide all required fields: name, username, email, phoneNo, password');
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists with that email or username');
    }

    let profileImageUrl = null;

    // Upload image to Cloudinary if provided
    if (req.file) {
        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'nws-users',
                resource_type: 'auto',
            });
            profileImageUrl = result.secure_url;
        } catch (error) {
            res.status(400);
            throw new Error('Image upload failed: ' + error.message);
        }
    }

    // Prepare location object if coordinates are provided
    let locationData = null;
    if (latitude && longitude) {
        locationData = {
            type: 'Point',
            coordinates: [longitude, latitude] // GeoJSON format: [longitude, latitude]
        };
    }

    const user = await User.create({
        name,
        username,
        email,
        phoneNo,
        password,
        address: address || null,
        pimage: profileImageUrl,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        location: locationData,
        jobname: jobname || null,
        role: role || 'user',
    });

    res.status(201).json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phoneNo: user.phoneNo,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
        pimage: user.pimage,
        jobname: user.jobname,
        role: user.role,
        token: generateToken(user._id),
    });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

module.exports = { registerUser, authUser };