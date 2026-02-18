const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const Worker = require('../models/Worker');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private
const createJob = asyncHandler(async (req, res) => {
    const { title, description, category, location, address, budget, duration, images, createdBy, userId } = req.body;

    const effectiveCreatedBy = createdBy || userId;
    if (!effectiveCreatedBy) {
        res.status(400);
        throw new Error('createdBy (or userId) is required');
    }

    const job = new Job({
        title,
        description,
        category,
        location,
        address,
        budget,
        duration,
        images,
        createdBy: effectiveCreatedBy,
    });

    const createdJob = await job.save();
    res.status(201).json(createdJob);
});

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
    const jobs = await Job.find({}).populate('createdBy', 'name pimage');
    res.json(jobs);
});

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id).populate('createdBy', 'name pimage').populate('proposals.workerId', 'userId jobname');
    if (job) {
        res.json(job);
    } else {
        res.status(404);
        throw new Error('Job not found');
    }
});

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = asyncHandler(async (req, res) => {
    const { title, description, category, location, address, budget, duration, status, images } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    job.title = title || job.title;
    job.description = description || job.description;
    job.category = category || job.category;
    job.location = location || job.location;
    job.address = address || job.address;
    job.budget = budget || job.budget;
    job.duration = duration || job.duration;
    job.status = status || job.status;
    job.images = images || job.images;

    const updatedJob = await job.save();
    res.json(updatedJob);
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    await job.remove();
    res.json({ message: 'Job removed' });
});

// @desc    Add a proposal to a job
// @route   POST /api/jobs/:id/proposals
// @access  Private/Worker
const addProposal = asyncHandler(async (req, res) => {
    const { bidAmount, message, userId } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    if (!userId) {
        res.status(400);
        throw new Error('userId is required to submit a proposal');
    }

    const worker = await Worker.findOne({ userId: userId });
    if (!worker) {
        res.status(400);
        throw new Error('Only workers can submit proposals.');
    }
    
    // Check if worker has already submitted a proposal
    const alreadyProposed = job.proposals.find(p => p.workerId.toString() === worker._id.toString());
    if(alreadyProposed) {
        res.status(400);
        throw new Error('You have already submitted a proposal for this job');
    }

    const proposal = {
        workerId: worker._id,
        bidAmount,
        message
    };

    job.proposals.push(proposal);
    await job.save();
    res.status(201).json({ message: 'Proposal added' });
});

// @desc    Accept a proposal and assign the job
// @route   PUT /api/jobs/:id/proposals/:proposalId/accept
// @access  Private
const acceptProposal = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    const proposal = job.proposals.id(req.params.proposalId);

    if (!proposal) {
        res.status(404);
        throw new Error('Proposal not found');
    }

    job.assignedTo = proposal.workerId;
    job.status = 'assigned';

    await job.save();

    res.json({ message: 'Proposal accepted and job assigned' });
});

// @desc    Directly assign a job to a worker
// @route   PUT /api/jobs/:id/assign
// @access  Private
const assignJob = asyncHandler(async (req, res) => {
    const { workerId } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
        res.status(404);
        throw new Error('Worker not found');
    }

    job.assignedTo = worker._id;
    job.status = 'assigned';

    await job.save();

    res.json({ message: 'Job assigned successfully' });
});


module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob, addProposal, acceptProposal, assignJob };