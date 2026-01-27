const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Job = require('../models/Job');
const Worker = require('../models/Worker');

// @desc    Create a new review for a job
// @route   POST /api/jobs/:id/reviews
// @access  Private
const createJobReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    // Check if the logged-in user is the creator of the job
    if (job.createdBy.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('You are not authorized to review this job.');
    }

    // Check if the job has been assigned to a worker
    if (!job.assignedTo) {
        res.status(400);
        throw new Error('This job has not been assigned to a worker yet.');
    }
    
    // Optional: Check if job status is 'completed'
    if (job.status !== 'completed') {
        res.status(400);
        throw new Error('You can only review completed jobs.');
    }

    // Check if the job has already been reviewed
    const alreadyReviewed = await Review.findOne({ jobId: req.params.id });
    if (alreadyReviewed) {
        res.status(400);
        throw new Error('This job has already been reviewed.');
    }

    const review = new Review({
        jobId: req.params.id,
        fromUser: req.user._id,
        toWorker: job.assignedTo,
        rating: Number(rating),
        comment,
    });

    await review.save();

    // Update the worker's rating
    const worker = await Worker.findById(job.assignedTo);
    if (worker) {
        const reviews = await Review.find({ toWorker: worker._id });
        const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
        worker.rating = totalRating / reviews.length;
        worker.totalJobs = reviews.length;
        await worker.save();
    }

    res.status(201).json({ message: 'Review added successfully' });
});

// @desc    Get reviews for a worker
// @route   GET /api/workers/:id/reviews
// @access  Public
const getWorkerReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ toWorker: req.params.id })
        .populate('fromUser', 'name pimage');

    if (!reviews) {
        res.status(404);
        throw new Error('No reviews found for this worker.');
    }
    
    res.json(reviews);
});


module.exports = { createJobReview, getWorkerReviews };