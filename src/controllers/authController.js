const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
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
        role,

        // Worker-profile fields (only used when role === 'worker')
        education,
        about,
        experience,
        skills,
        hourlyRate
    } = req.body;

    // Validation
    if (!name || !username || !email || !phoneNo || !password) {
        res.status(400);
        throw new Error('Please provide all required fields: name, username, email, phoneNo, password');
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

    let profileImageUrl = null;

    // Upload image to Cloudinary directly from buffer
    if (req.file) {
        try {
            console.log('🔍 Starting Cloudinary upload...');
            console.log('File info:', {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
            });

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

            console.log('📤 Uploading to Cloudinary...');
            console.log('Data URI length:', dataURI.length);

            // Use callback-based approach instead of await
            const uploadPromise = new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    dataURI,
                    {
                        folder: 'nws-users',
                        public_id: `${username}-${Date.now()}`,
                        resource_type: 'auto',
                        timeout: 60000,
                    },
                    (error, result) => {
                        if (error) {
                            console.error('❌ Cloudinary API Error:', {
                                message: error.message,
                                http_code: error.http_code,
                                status: error.status,
                            });
                            reject(error);
                        } else {
                            console.log('✅ Image uploaded successfully');
                            resolve(result);
                        }
                    }
                );
            });

            const result = await uploadPromise;
            profileImageUrl = result.secure_url;
            console.log('✅ Image URL saved:', profileImageUrl);

        } catch (error) {
            console.error('❌ Upload Error Details:');
            console.error('Error type:', error.constructor.name);
            console.error('Error message:', error.message);
            console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
            
            res.status(400);
            const errorMsg = error.message || 'Unknown error uploading image to Cloudinary';
            throw new Error(`Image upload failed: ${errorMsg}`);
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
        role: effectiveRole,
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
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

module.exports = { registerUser, authUser };