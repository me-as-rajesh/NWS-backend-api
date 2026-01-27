const express = require('express');
const router = express.Router();
const { getEmployees } = require('../controllers/employeeController');

router.route('/').get(getEmployees);

module.exports = router;