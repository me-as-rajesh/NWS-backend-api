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

            // Convert buffer to Base64 data URI
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;

            console.log('📤 Uploading worker profile to Cloudinary...');

            const result = await cloudinary.uploader.upload(dataURI, {
                folder: 'nws-workers',
                public_id: `${username}-profile-${Date.now()}`,
                resource_type: 'auto',
            });

            profileImageUrl = result.secure_url;
            console.log('✅ Profile Image URL saved:', profileImageUrl);

        } catch (error) {
            console.error('❌ Upload Error Details:', error.message);
            res.status(400);
            throw new Error(`Profile image upload failed: ${error.message}`);
        }
    }

    // Prepare location object if coordinates provided
    let locationData = null;
    if (latitude && longitude) {
        locationData = {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
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
        skills: skills ? (typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills) : [],
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

    if (!credential || !password) {
        res.status(400);
        throw new Error('Please provide login/email and password');
    }

    const worker = await Worker.findOne({ $or: [{ email: credential }, { username: credential }] });

    if (worker && (await worker.matchPassword(password))) {
        res.json({
            _id: worker._id,
            workerId: worker._id,
            name: worker.name,
            username: worker.username,
            email: worker.email,
            role: worker.role,
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});


// @desc    Get all workers
// @route   GET /api/workers
// @access  Public
const getWorkers = asyncHandler(async (req, res) => {
    const workers = await Worker.find({});
    res.json(workers);
});

// @desc    Update worker profile
// @route   PUT /api/workers/:id
// @access  Private // Assuming protected route
const updateWorkerProfile = asyncHandler(async (req, res) => {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
        res.status(404);
        throw new Error('Worker not found');
    }

    // Update basic fields
    worker.name = req.body.name || worker.name;
    worker.email = req.body.email || worker.email;
    worker.phoneNo = req.body.phoneNo || worker.phoneNo;
    worker.address = req.body.address || worker.address;
    worker.jobname = req.body.jobname || worker.jobname;
    worker.education = req.body.education || worker.education;
    worker.about = req.body.about || worker.about;
    worker.experience = req.body.experience || worker.experience;
    worker.hourlyRate = req.body.hourlyRate || worker.hourlyRate;

    // Update skills (handle string or array)
    if (req.body.skills) {
        worker.skills = typeof req.body.skills === 'string' 
            ? req.body.skills.split(',').map(s => s.trim()) 
            : req.body.skills;
    }

    // Update location fields
    const { latitude, longitude } = req.body;
    if (latitude && longitude) {
        worker.latitude = Number(latitude);
        worker.longitude = Number(longitude);
        worker.location = {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
        };
    }

    // Update profile image if a new one is uploaded
    if (req.file) {
        try {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: 'nws-workers',
                public_id: `${worker.username}-profile-${Date.now()}`,
                overwrite: true, // Overwrite the old image
            });
            worker.pimage = result.secure_url;
        } catch (error) {
            console.error('❌ Image Upload Error:', error.message);
            res.status(400);
            throw new Error(`Image upload failed: ${error.message}`);
        }
    }

    const updatedWorker = await worker.save();

    res.json({
        _id: updatedWorker._id,
        workerId: updatedWorker._id,
        name: updatedWorker.name,
        username: updatedWorker.username,
        email: updatedWorker.email,
        phoneNo: updatedWorker.phoneNo,
        address: updatedWorker.address,
        latitude: updatedWorker.latitude,
        longitude: updatedWorker.longitude,
        pimage: updatedWorker.pimage,
        jobname: updatedWorker.jobname,
        education: updatedWorker.education,
        about: updatedWorker.about,
        experience: updatedWorker.experience,
        skills: updatedWorker.skills,
        hourlyRate: updatedWorker.hourlyRate,
        rating: updatedWorker.rating,
        totalJobs: updatedWorker.totalJobs,
        verificationStatus: updatedWorker.verificationStatus,
        role: updatedWorker.role,
    });
});

module.exports = { registerWorker, workerLogin, getWorkers, updateWorkerProfile };