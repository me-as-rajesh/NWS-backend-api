const express = require('express');
const router = express.Router();
const { registerWorker, workerLogin, getWorkerProfile, updateWorkerProfile, getWorkers } = require('../controllers/workerController');
const { protect, worker } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.route('/register').post(
	upload.fields([
		{ name: 'profileImage', maxCount: 1 },
		{ name: 'pimage', maxCount: 1 },
	]),
	registerWorker
);
router.route('/login').post(workerLogin);
router.route('/').get(getWorkers);
// Public worker lookup by id
router.route('/:id').get(require('../controllers/workerController').getWorkerById);
router.route('/profile').get(protect, worker, getWorkerProfile).put(
	protect,
	worker,
	upload.fields([
		{ name: 'profileImage', maxCount: 1 },
		{ name: 'pimage', maxCount: 1 },
	]),
	updateWorkerProfile
);

module.exports = router;