const express = require('express');
const router = express.Router();
const { registerWorker, workerLogin, getWorkers, updateWorkerProfile } = require('../controllers/workerController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.route('/register').post(upload.single('profileImage'), registerWorker);
router.route('/login').post(workerLogin);
router.route('/').get(getWorkers);

// Private routes
router.route('/:id').put(protect, upload.single('profileImage'), updateWorkerProfile);

module.exports = router;