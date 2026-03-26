const express = require('express');
const router = express.Router();
const {
	registerWorker,
	workerLogin,
	getWorkerProfile,
	updateWorkerProfile,
	getWorkers,
	getWorkerById,
	updateWorker,
} = require('../controllers/workerController');
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

// Profile routes (define before '/:id' to avoid route shadowing)
router
	.route('/profile')
	.get(protect, worker, getWorkerProfile)
	.put(
		protect,
		worker,
		upload.fields([
			{ name: 'profileImage', maxCount: 1 },
			{ name: 'pimage', maxCount: 1 },
		]),
		updateWorkerProfile
	);

// Public worker lookup by id (keep at the end)
router.route('/:id').get(getWorkerById).put(
	upload.fields([
		{ name: 'profileImage', maxCount: 1 },
		{ name: 'pimage', maxCount: 1 },
	]),
	updateWorker
);

module.exports = router;