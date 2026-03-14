const Worker = require('../models/Worker');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const getUploadedFile = (req) => {
    if (req.file) {
        return req.file;
    }

    if (req.files) {
        if (req.files.profileImage && req.files.profileImage[0]) {
            return req.files.profileImage[0];
        }

        if (req.files.pimage && req.files.pimage[0]) {
            return req.files.pimage[0];
        }
    }

    return null;
};

const uploadWorkerImage = async (file, username) => {
    if (!file) {
        return null;
    }

    if (!file.buffer || file.buffer.length === 0) {
        throw new Error('File buffer is empty');
    }

    if (!file.mimetype) {
        throw new Error('File mimetype is missing');
    }

    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            dataURI,
            {
                folder: 'nws-workers',
                public_id: `${username}-profile-${Date.now()}`,
                resource_type: 'auto',
                timeout: 60000,
            },
            (error, uploadResult) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(uploadResult);
                }
            }
        );
    });

    return result.secure_url;
};

// @desc    Register a new worker
// @route   POST /api/workers/register
// @access  Public
const registerWorker = asyncHandler(async (req, res) => {
    const { 
        username, 
        email, 
        password, 
    } = req.body;

    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields: username, email, password');
    }

    const workerExists = await Worker.findOne({ $or: [{ email }, { username }] });
    if (workerExists) {
        res.status(400);
        throw new Error('Worker already exists with that email or username');
    }

    // handle optional profile image and extra profile fields
    const file = getUploadedFile(req);
    let profileImageUrl = null;
    if (file) {
        try {
            profileImageUrl = await uploadWorkerImage(file, username);
        } catch (error) {
            res.status(400);
            throw new Error(`Profile image upload failed: ${error.message}`);
        }
    }

    const worker = await Worker.create({
        username,
        email,
        password,
        role: 'worker',
        pimage: profileImageUrl,
        name: req.body.name || undefined,
        phoneNo: req.body.phoneNo || undefined,
        jobname: req.body.jobname || undefined,
    });

    res.status(201).json({
        _id: worker._id,
        workerId: worker._id,
        username: worker.username,
        email: worker.email,
        role: worker.role,
        createdAt: worker.createdAt,
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

    const token = jwt.sign({ id: worker._id, accountType: 'worker' }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.json({
        _id: worker._id,
        workerId: worker._id,
        username: worker.username,
        email: worker.email,
        role: worker.role,
        accountType: 'worker',
        token,
    });
});

// @desc    Get worker profile
// @route   GET /api/workers/profile
// @access  Private/Worker
const getWorkerProfile = asyncHandler(async (req, res) => {
    const worker = await Worker.findById(req.user._id);

    if (!worker) {
        res.status(404);
        throw new Error('Worker not found');
    }

    res.json({
        _id: worker._id,
        workerId: worker._id,
        username: worker.username,
        email: worker.email,
        name: worker.name,
        phoneNo: worker.phoneNo,
        address: worker.address,
        pimage: worker.pimage,
        latitude: worker.latitude,
        longitude: worker.longitude,
        jobname: worker.jobname,
        education: worker.education,
        about: worker.about,
        experience: worker.experience,
        skills: worker.skills,
        hourlyRate: worker.hourlyRate,
        availability: worker.availability,
        rating: worker.rating,
        totalJobs: worker.totalJobs,
        verificationStatus: worker.verificationStatus,
        certificates: worker.certificates,
        role: worker.role,
        createdAt: worker.createdAt,
        updatedAt: worker.updatedAt,
    });
});

// @desc    Update worker profile
// @route   PUT /api/workers/profile
// @access  Private/Worker
const updateWorkerProfile = asyncHandler(async (req, res) => {
    const worker = await Worker.findById(req.user._id);

    if (!worker) {
        res.status(404);
        throw new Error('Worker not found');
    }

    const {
        name,
        phoneNo,
        address,
        latitude,
        longitude,
        jobname,
        education,
        about,
        experience,
        skills,
        hourlyRate,
        availability,
    } = req.body;

    const file = getUploadedFile(req);
    let profileImageUrl = worker.pimage;

    if (file) {
        try {
            profileImageUrl = await uploadWorkerImage(file, worker.username);
        } catch (error) {
            res.status(400);
            throw new Error(`Profile image upload failed: ${error.message}`);
        }
    }

    let locationData = worker.location;
    if (latitude && longitude) {
        locationData = {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
        };
    }

    worker.name = name || worker.name;
    worker.phoneNo = phoneNo || worker.phoneNo;
    worker.address = address || worker.address;
    worker.pimage = profileImageUrl;
    worker.latitude = latitude !== undefined ? Number(latitude) : worker.latitude;
    worker.longitude = longitude !== undefined ? Number(longitude) : worker.longitude;
    worker.location = locationData;
    worker.jobname = jobname || worker.jobname;
    worker.education = education || worker.education;
    worker.about = about || worker.about;
    worker.experience = experience || worker.experience;
    worker.skills = skills ? (typeof skills === 'string' ? skills.split(',').map((item) => item.trim()).filter(Boolean) : skills) : worker.skills;
    worker.hourlyRate = hourlyRate !== undefined ? Number(hourlyRate) : worker.hourlyRate;
    worker.availability = availability !== undefined ? availability === true || availability === 'true' : worker.availability;

    const updatedWorker = await worker.save();

    res.json({
        _id: updatedWorker._id,
        workerId: updatedWorker._id,
        username: updatedWorker.username,
        email: updatedWorker.email,
        name: updatedWorker.name,
        phoneNo: updatedWorker.phoneNo,
        address: updatedWorker.address,
        pimage: updatedWorker.pimage,
        latitude: updatedWorker.latitude,
        longitude: updatedWorker.longitude,
        jobname: updatedWorker.jobname,
        education: updatedWorker.education,
        about: updatedWorker.about,
        experience: updatedWorker.experience,
        skills: updatedWorker.skills,
        hourlyRate: updatedWorker.hourlyRate,
        availability: updatedWorker.availability,
        rating: updatedWorker.rating,
        totalJobs: updatedWorker.totalJobs,
        verificationStatus: updatedWorker.verificationStatus,
        role: updatedWorker.role,
        updatedAt: updatedWorker.updatedAt,
    });
});

// @desc    Get all workers
// @route   GET /api/workers
// @access  Public
const getWorkers = asyncHandler(async (req, res) => {
    const workers = await Worker.find({}).select('-password');
    res.json(workers);
});

module.exports = { registerWorker, workerLogin, getWorkerProfile, updateWorkerProfile, getWorkers };

// @desc    Get worker by ID
// @route   GET /api/workers/:id
// @access  Public
const getWorkerById = asyncHandler(async (req, res) => {
    const worker = await Worker.findById(req.params.id).select('-password');
    if (worker) {
        return res.json(worker);
    }
    res.status(404);
    throw new Error('Worker not found');
});

module.exports.getWorkerById = getWorkerById;