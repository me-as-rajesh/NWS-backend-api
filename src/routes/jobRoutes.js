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

// Public routes
router.route('/').get(getJobs);
router.route('/:id').get(getJobById);

// Private routes for creating, updating, and deleting jobs
router.route('/').post(createJob);
router.route('/:id').put(updateJob).delete(deleteJob);

// Private routes for managing proposals
router.route('/:id/proposals').post(addProposal);
router.route('/:id/proposals/:proposalId/accept').put(acceptProposal);

// Private route for assigning a job to a worker directly
router.route('/:id/assign').put(assignJob);

// Private route for creating a review for a job
router.route('/:id/reviews').post(createJobReview);

module.exports = router;