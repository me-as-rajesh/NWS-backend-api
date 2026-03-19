const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const Worker = require('../models/Worker');
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');

const normalizeJobStatus = (status) => {
    if (!status) {
        return status;
    }

    const statusMap = {
        assigned: 'accepted',
        'in-progress': 'in_progress',
        inprogress: 'in_progress',
    };

    return statusMap[status] || status;
};

const parseLocationPayload = (location, address) => {
    if (!location) {
        return { location: undefined, locationText: undefined, address };
    }

    if (typeof location === 'string') {
        return {
            location: undefined,
            locationText: location,
            address: address || location,
        };
    }

    return {
        location,
        locationText: address || undefined,
        address,
    };
};

const getWorkerChatUserId = (worker) => worker?.userId || worker?._id;

const ensureWorkerExists = async (workerId) => {
    const worker = await Worker.findById(workerId);
    if (!worker) {
        throw new Error('Worker not found');
    }

    return worker;
};

const createNotification = async ({ userId, title, message, type, metadata }) => {
    if (!userId) {
        return null;
    }

    return Notification.create({
        userId,
        title,
        message,
        type,
        metadata,
    });
};

const ensureJobChat = async (job) => {
    const worker = await Worker.findById(job.assignedTo);
    if (!worker) {
        throw new Error('Assigned worker not found');
    }

    const workerChatUserId = getWorkerChatUserId(worker);
    const participants = [job.createdBy, workerChatUserId];

    let chat = await Chat.findOne({
        isGroupChat: false,
        jobId: job._id,
        participants: { $all: participants, $size: participants.length },
    });

    if (!chat) {
        chat = await Chat.create({
            chatName: 'job-chat',
            isGroupChat: false,
            participants,
            jobId: job._id,
        });
    }

    return chat;
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private
const createJob = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        category,
        location,
        address,
        budget,
        duration,
        images,
        createdBy,
        userId,
        workerId,
        assignedTo,
        status,
        chatEnabled,
    } = req.body;

    const effectiveCreatedBy = createdBy || userId;
    if (!effectiveCreatedBy) {
        res.status(400);
        throw new Error('createdBy (or userId) is required');
    }

    const locationData = parseLocationPayload(location, address);
    const normalizedStatus = normalizeJobStatus(status);
    const effectiveAssignedTo = assignedTo || workerId;

    const job = new Job({
        title,
        description,
        category,
        location: locationData.location,
        locationText: locationData.locationText,
        address: locationData.address,
        budget,
        duration,
        images,
        createdBy: effectiveCreatedBy,
        assignedTo: effectiveAssignedTo,
        status: normalizedStatus || 'pending',
        chatEnabled: chatEnabled === true || normalizedStatus === 'accepted',
    });

    const createdJob = await job.save();

    if (createdJob.chatEnabled && createdJob.assignedTo) {
        await ensureJobChat(createdJob);
    }

    res.status(201).json(createdJob);
});

// @desc    Send an availability request to a worker
// @route   POST /api/jobs/request
// @access  Private
const requestJob = asyncHandler(async (req, res) => {
    const { userId, workerId, title, description, location, address, category, budget, duration, images } = req.body;

    if (!userId || !workerId || !title || !description) {
        res.status(400);
        throw new Error('userId, workerId, title, and description are required');
    }

    const worker = await ensureWorkerExists(workerId);
    const locationData = parseLocationPayload(location, address);

    const job = await Job.create({
        title,
        description,
        category,
        location: locationData.location,
        locationText: locationData.locationText,
        address: locationData.address,
        budget,
        duration,
        images,
        createdBy: userId,
        assignedTo: worker._id,
        status: 'pending',
        chatEnabled: false,
    });

    await createNotification({
        userId: getWorkerChatUserId(worker),
        title: 'New availability request',
        message: 'User asking: Are you available?',
        type: 'availability_request',
        metadata: { jobId: job._id, workerId: worker._id, userId },
    });

    res.status(201).json(job);
});

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
    const jobs = await Job.find({})
        .populate('createdBy', 'name pimage')
        .populate('assignedTo', 'name jobname rating pimage');

    res.json(jobs);
});

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id)
        .populate('createdBy', 'name pimage')
        .populate('assignedTo', 'name jobname rating pimage')
        .populate('proposals.workerId', 'userId jobname name rating');

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    res.json(job);
});

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = asyncHandler(async (req, res) => {
    const { title, description, category, location, address, budget, duration, status, images, chatEnabled } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    const locationData = parseLocationPayload(location, address);
    const normalizedStatus = normalizeJobStatus(status);

    job.title = title || job.title;
    job.description = description || job.description;
    job.category = category || job.category;
    job.location = locationData.location || job.location;
    job.locationText = locationData.locationText || job.locationText;
    job.address = locationData.address || job.address;
    job.budget = budget !== undefined ? budget : job.budget;
    job.duration = duration || job.duration;
    job.status = normalizedStatus || job.status;
    job.images = images || job.images;

    if (chatEnabled !== undefined) {
        job.chatEnabled = Boolean(chatEnabled);
    }

    if (job.status === 'accepted') {
        job.chatEnabled = true;
        job.acceptedAt = job.acceptedAt || new Date();
    }

    if (job.status === 'completed') {
        job.chatEnabled = false;
        job.completedAt = job.completedAt || new Date();
    }

    const updatedJob = await job.save();

    if (updatedJob.chatEnabled && updatedJob.assignedTo) {
        await ensureJobChat(updatedJob);
    }

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

    await job.deleteOne();
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

    const worker = await Worker.findOne({ userId });
    if (!worker) {
        res.status(400);
        throw new Error('Only workers can submit proposals.');
    }

    const alreadyProposed = job.proposals.find((proposal) => proposal.workerId.toString() === worker._id.toString());
    if (alreadyProposed) {
        res.status(400);
        throw new Error('You have already submitted a proposal for this job');
    }

    job.proposals.push({
        workerId: worker._id,
        bidAmount,
        message,
    });

    await job.save();
    res.status(201).json({ message: 'Proposal added', job });
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

    job.proposals.forEach((item) => {
        item.status = item._id.toString() === proposal._id.toString() ? 'accepted' : 'rejected';
    });
    job.assignedTo = proposal.workerId;
    job.status = 'accepted';
    job.chatEnabled = true;
    job.acceptedAt = new Date();

    await job.save();

    const worker = await Worker.findById(proposal.workerId);
    await ensureJobChat(job);

    await createNotification({
        userId: job.createdBy,
        title: 'Worker accepted your job',
        message: 'Your job has been accepted and chat is now enabled.',
        type: 'job_request_accepted',
        metadata: { jobId: job._id, workerId: proposal.workerId },
    });

    await createNotification({
        userId: getWorkerChatUserId(worker),
        title: 'Job assigned',
        message: 'You have been assigned to a job.',
        type: 'job_assigned',
        metadata: { jobId: job._id },
    });

    res.json({ message: 'Proposal accepted and chat enabled', job });
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

    const worker = await ensureWorkerExists(workerId);

    job.assignedTo = worker._id;
    job.status = 'accepted';
    job.chatEnabled = true;
    job.acceptedAt = new Date();

    await job.save();
    await ensureJobChat(job);

    await createNotification({
        userId: job.createdBy,
        title: 'Worker assigned',
        message: 'A worker has been assigned and chat is now enabled.',
        type: 'job_request_accepted',
        metadata: { jobId: job._id, workerId: worker._id },
    });

    await createNotification({
        userId: getWorkerChatUserId(worker),
        title: 'New job assigned',
        message: 'You have been assigned to a new job.',
        type: 'job_assigned',
        metadata: { jobId: job._id },
    });

    res.json({ message: 'Job assigned successfully', job });
});

// @desc    Accept a pending job request
// @route   PUT /api/jobs/:jobId/accept
// @access  Private/Worker
const acceptJobRequest = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    if (!job.assignedTo) {
        res.status(400);
        throw new Error('No worker is assigned to this request');
    }

    if (job.status === 'completed') {
        res.status(400);
        throw new Error('Completed jobs cannot be accepted');
    }

    job.status = 'accepted';
    job.chatEnabled = true;
    job.acceptedAt = new Date();

    await job.save();

    const worker = await Worker.findById(job.assignedTo);
    const chat = await ensureJobChat(job);

    await createNotification({
        userId: job.createdBy,
        title: 'Worker accepted your request',
        message: 'Chat enabled. You can now message the worker.',
        type: 'job_request_accepted',
        metadata: { jobId: job._id, chatId: chat._id },
    });

    await createNotification({
        userId: getWorkerChatUserId(worker),
        title: 'Availability accepted',
        message: 'The job request is now active.',
        type: 'job_assigned',
        metadata: { jobId: job._id, chatId: chat._id },
    });

    res.json({ message: 'Job request accepted', job, chatId: chat._id });
});

// @desc    Reject a pending job request
// @route   PUT /api/jobs/:jobId/reject
// @access  Private/Worker
const rejectJobRequest = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    job.status = 'rejected';
    job.chatEnabled = false;

    await job.save();

    await createNotification({
        userId: job.createdBy,
        title: 'Worker is busy',
        message: 'The worker rejected your availability request.',
        type: 'job_request_rejected',
        metadata: { jobId: job._id, workerId: job.assignedTo },
    });

    res.json({ message: 'Job request rejected', job });
});

// @desc    Mark a job as completed and disable chat
// @route   PUT /api/jobs/:jobId/complete
// @access  Private/Worker
const completeJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    if (!job.assignedTo) {
        res.status(400);
        throw new Error('Job has no assigned worker');
    }

    job.status = 'completed';
    job.chatEnabled = false;
    job.completedAt = new Date();

    await job.save();

    await createNotification({
        userId: job.createdBy,
        title: 'Worker completed job',
        message: 'Worker completed job. Please review.',
        type: 'job_completed',
        metadata: { jobId: job._id, workerId: job.assignedTo },
    });

    res.json({ message: 'Job completed and chat disabled', job });
});

module.exports = {
    createJob,
    requestJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    addProposal,
    acceptProposal,
    assignJob,
    acceptJobRequest,
    rejectJobRequest,
    completeJob,
};