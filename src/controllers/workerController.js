const Worker = require('../models/Worker');
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

    // Check if worker already exists
    const workerExists = await Worker.findOne({ $or: [{ email }, { username }] });
    if (workerExists) {
        res.status(400);
        throw new Error('Worker already exists with that email or username');
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

    const worker = await Worker.create({
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
        role: 'worker',
        jobname: jobname,
        education: education || null,
        about: about || null,
        experience: experience || null,
        skills: skills ? (typeof skills === 'string' ? skills.split(',') : skills) : [],
        hourlyRate: hourlyRate ? Number(hourlyRate) : null,
    });

    res.status(201).json({
        _id: worker._id,
        workerId: worker._id,
        name: worker.name,
        username: worker.username,
        email: worker.email,
        phoneNo: worker.phoneNo,
        address: worker.address,
        latitude: worker.latitude,
        longitude: worker.longitude,
        pimage: worker.pimage,
        jobname: worker.jobname,
        education: worker.education,
        about: worker.about,
        experience: worker.experience,
        skills: worker.skills,
        hourlyRate: worker.hourlyRate,
        rating: worker.rating,
        totalJobs: worker.totalJobs,
        verificationStatus: worker.verificationStatus,
        role: worker.role,
    });
});

// @desc    Worker login
// @route   POST /api/workers/login
// @access  Public
const workerLogin = asyncHandler(async (req, res) => {
    const { login, email, password } = req.body;
    const credential = login || email;

    // Validation
    if (!credential || !password) {
        res.status(400);
        throw new Error('Please provide login/email and password');
    }

    const worker = await Worker.findOne({
        $or: [{ email: credential }, { username: credential }],
    });

    if (!worker) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    if (!(await worker.matchPassword(password))) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    res.json({
        _id: worker._id,
        workerId: worker._id,
        name: worker.name,
        username: worker.username,
        email: worker.email,
        phoneNo: worker.phoneNo,
        pimage: worker.pimage,
        jobname: worker.jobname,
        education: worker.education,
        about: worker.about,
        experience: worker.experience,
        skills: worker.skills,
        hourlyRate: worker.hourlyRate,
        rating: worker.rating,
        totalJobs: worker.totalJobs,
        verificationStatus: worker.verificationStatus,
        role: worker.role,
    });
});

// @desc    Get all workers
// @route   GET /api/workers
// @access  Public
const getWorkers = asyncHandler(async (req, res) => {
    const workers = await Worker.find({});
    res.json(workers);
});

module.exports = { registerWorker, workerLogin, getWorkers };