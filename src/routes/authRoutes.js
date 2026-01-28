const express = require('express');
const router = express.Router();
const { registerUser, authUser } = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

router.route('/register').post(upload.single('profileImage'), registerUser);
router.route('/login').post(authUser);

module.exports = router;