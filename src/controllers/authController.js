const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { 
        username, 
        email, 
        password, 
        role,
    } = req.body;

    // Validation - only require authentication fields
    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields: username, email, password');
    }

    const effectiveRole = role || 'user';
    if (effectiveRole === 'worker') {
        res.status(400);
        throw new Error('Worker registration is not allowed on this endpoint. Use POST /api/workers/register');
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists with that email or username');
    }

    const user = await User.create({
        username,
        email,
        password,
        role: effectiveRole,
    });

    res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    });
});

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { login, email, password } = req.body;
    const credential = login || email;

    if (!credential || !password) {
        return res.status(400).json({ message: 'Please provide login/email and password' });
    }

    const user = await User.findOne({ $or: [{ email: credential }, { username: credential }] });

    if (user && (await user.matchPassword(password))) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token,
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            name: user.name,
            phoneNo: user.phoneNo,
            address: user.address,
            pimage: user.pimage,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { name, phoneNo, address } = req.body;

        let profileImageUrl = user.pimage;

        // Upload new image to Cloudinary if provided
        if (req.file) {
            try {
                console.log('🔍 Starting Cloudinary upload for profile update...');

                // Validate file
                if (!req.file.buffer || req.file.buffer.length === 0) {
                    throw new Error('File buffer is empty');
                }

                if (!req.file.mimetype) {
                    throw new Error('File mimetype is missing');
                }

                // Convert buffer to Base64 data URI for Cloudinary
                const b64 = Buffer.from(req.file.buffer).toString('base64');
                const dataURI = `data:${req.file.mimetype};base64,${b64}`;

                // Use callback-based approach
                const uploadPromise = new Promise((resolve, reject) => {
                    cloudinary.uploader.upload(
                        dataURI,
                        {
                            folder: 'nws-users',
                            public_id: `${user.username}-profile-${Date.now()}`,
                            resource_type: 'auto',
                            timeout: 60000,
                        },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        }
                    );
                });

                const result = await uploadPromise;
                profileImageUrl = result.secure_url;
                console.log('✅ Profile image updated successfully');

            } catch (error) {
                console.error('❌ Profile image upload error:', error.message);
                res.status(400);
                throw new Error(`Image upload failed: ${error.message}`);
            }
        }

        // Update user fields
        user.name = name || user.name;
        user.phoneNo = phoneNo || user.phoneNo;
        user.address = address || user.address;
        user.pimage = profileImageUrl;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            name: updatedUser.name,
            phoneNo: updatedUser.phoneNo,
            address: updatedUser.address,
            pimage: updatedUser.pimage,
            role: updatedUser.role,
            updatedAt: updatedUser.updatedAt,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = { registerUser, authUser, getUserProfile, updateUserProfile };