const express = require('express');
const router = express.Router();
const { getTitles } = require('../controllers/titleController');

router.route('/').get(getTitles);

module.exports = router;