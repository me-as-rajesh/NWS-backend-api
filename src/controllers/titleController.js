const Title = require('../models/Title');
const asyncHandler = require('express-async-handler');

// @desc    Get all titles
// @route   GET /api/titles
// @access  Public
const getTitles = asyncHandler(async (req, res) => {
    const titles = await Title.find({});
    res.json(titles);
});

module.exports = { getTitles };