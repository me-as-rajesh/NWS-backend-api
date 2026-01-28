const Worker = require('../models/Worker');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');

// @desc    Register a new worker with profile image
// @route   POST /api/workers/register
// @access  Public
const registerWorker = asyncHandler(async (req, res) => {
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
        education,
        about,
        experience,
        skills,
        hourlyRate
    } = req.body;

    // Validation
    if (!name || !username || !email || !phoneNo || !password || !jobname) {
        res.status(400);
        throw new Error('Please provide all required fields: name, username, email, phoneNo, password, jobname');
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists with that email or username');
    }

    let profileImageUrl = null;

    // Upload profile image to Cloudinary directly from buffer
    if (req.file) {
        try {
            console.log('🔍 Starting Worker Profile Upload to Cloudinary...');
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

            // Convert buffer to Base64 data URI
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;

            console.log('📤 Uploading worker profile to Cloudinary...');

            // Upload using callback-based approach
            const uploadPromise = new Promise((resolve, reject) => {
                cloudinary.uploader.upload(
                    dataURI,
                    {
                        folder: 'nws-workers',
                        public_id: `${username}-profile-${Date.now()}`,
                        resource_type: 'auto',
                        timeout: 60000,
                    },
                    (error, result) => {
                        if (error) {
                            console.error('❌ Cloudinary API Error:', {
                                message: error.message,
                                http_code: error.http_code,
                            });
                            reject(error);
                        } else {
                            console.log('✅ Worker profile uploaded successfully');
                            resolve(result);
                        }
                    }
                );
            });

            const result = await uploadPromise;
            profileImageUrl = result.secure_url;
            console.log('✅ Profile Image URL saved:', profileImageUrl);

        } catch (error) {
            console.error('❌ Upload Error Details:');
            console.error('Error message:', error.message);
            
            res.status(400);
            const errorMsg = error.message || 'Unknown error uploading worker profile image';
            throw new Error(`Profile image upload failed: ${errorMsg}`);
        }
    }

    // Prepare location object if coordinates provided
    let locationData = null;
    if (latitude && longitude) {
        locationData = {
            type: 'Point',
            coordinates: [longitude, latitude]
        };
    }

    // Create user first
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
        jobname: jobname,
        role: 'worker',
    });

    // Create worker profile
    const worker = await Worker.create({
        userId: user._id,
        jobname: jobname,
        education: education || null,
        about: about || null,
        experience: experience || null,
        skills: skills ? (typeof skills === 'string' ? skills.split(',') : skills) : [],
        hourlyRate: hourlyRate ? Number(hourlyRate) : null,
    });

    res.status(201).json({
        _id: user._id,
        workerId: worker._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phoneNo: user.phoneNo,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
        pimage: user.pimage,
        jobname: worker.jobname,
        education: worker.education,
        about: worker.about,
        experience: worker.experience,
        skills: worker.skills,
        hourlyRate: worker.hourlyRate,
        role: user.role,
        verificationStatus: worker.verificationStatus,
        token: generateToken(user._id),
    });
});

// @desc    Worker login
// @route   POST /api/workers/login
// @access  Public
const workerLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    // Find user by email and verify role is worker
    const user = await User.findOne({ email, role: 'worker' });

    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // Check password
    if (!(await user.matchPassword(password))) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // Get worker profile
    const worker = await Worker.findOne({ userId: user._id });

    if (!worker) {
        res.status(404);
        throw new Error('Worker profile not found');
    }

    res.json({
        _id: user._id,
        workerId: worker._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phoneNo: user.phoneNo,
        pimage: user.pimage,
        jobname: worker.jobname,
        education: worker.education,
        about: worker.about,
        experience: worker.experience,
        skills: worker.skills,
        hourlyRate: worker.hourlyRate,
        rating: worker.rating,
        totalJobs: worker.totalJobs,
        verificationStatus: worker.verificationStatus,
        role: user.role,
        token: generateToken(user._id),
    });
});

// @desc    Get all workers
// @route   GET /api/workers
// @access  Public
const getWorkers = asyncHandler(async (req, res) => {
    const workers = await Worker.find({}).populate('userId', 'name email pimage');
    res.json(workers);
});

module.exports = { registerWorker, workerLogin, getWorkers };