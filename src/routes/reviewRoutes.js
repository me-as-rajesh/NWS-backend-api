const express = require('express');
const router = express.Router();
const { getWorkerReviews } = require('../controllers/reviewController');

// Public route to get all reviews for a worker
router.route('/worker/:id').get(getWorkerReviews);

module.exports = router;