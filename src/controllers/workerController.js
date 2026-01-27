const Worker = require('../models/Worker');
const asyncHandler = require('express-async-handler');

// @desc    Get all workers
// @route   GET /api/workers
// @access  Public
const getWorkers = asyncHandler(async (req, res) => {
    const workers = await Worker.find({}).populate('user', 'name email');
    res.json(workers);
});

module.exports = { getWorkers };