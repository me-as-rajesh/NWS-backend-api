const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/register').post(registerUser);
router.route('/login').post(authUser);
router.route('/profile').get(protect, getUserProfile).put(
	protect,
	upload.fields([
		{ name: 'profileImage', maxCount: 1 },
		{ name: 'pimage', maxCount: 1 },
	]),
	updateUserProfile
);

module.exports = router;