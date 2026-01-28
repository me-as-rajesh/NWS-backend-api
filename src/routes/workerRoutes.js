const express = require('express');
const router = express.Router();
const { registerWorker, workerLogin, getWorkers } = require('../controllers/workerController');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.route('/register').post(upload.single('profileImage'), registerWorker);
router.route('/login').post(workerLogin);
router.route('/').get(getWorkers);

module.exports = router;