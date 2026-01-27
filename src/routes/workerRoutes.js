const express = require('express');
const router = express.Router();
const { getWorkers } = require('../controllers/workerController');

router.route('/').get(getWorkers);

module.exports = router;