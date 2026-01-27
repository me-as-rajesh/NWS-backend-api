const Employee = require('../models/Employee');
const asyncHandler = require('express-async-handler');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Public
const getEmployees = asyncHandler(async (req, res) => {
    const employees = await Employee.find({}).populate('user', 'name');
    res.json(employees);
});

module.exports = { getEmployees };