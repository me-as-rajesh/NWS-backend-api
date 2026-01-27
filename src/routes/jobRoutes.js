const express = require('express');
const router = express.Router();
const {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    addProposal,
    acceptProposal,
    assignJob
} = require('../controllers/jobController');
const { createJobReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.route('/').get(getJobs);
router.route('/:id').get(getJobById);

// Private routes for creating, updating, and deleting jobs
router.route('/').post(protect, createJob);
router.route('/:id').put(protect, updateJob).delete(protect, deleteJob);

// Private routes for managing proposals
router.route('/:id/proposals').post(protect, addProposal);
router.route('/:id/proposals/:proposalId/accept').put(protect, acceptProposal);

// Private route for assigning a job to a worker directly
router.route('/:id/assign').put(protect, assignJob);

// Private route for creating a review for a job
router.route('/:id/reviews').post(protect, createJobReview);

module.exports = router;