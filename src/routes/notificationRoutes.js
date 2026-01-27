const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Get all notifications for the logged-in user
router.route('/').get(protect, getNotifications);

// Mark a single notification as read
router.route('/:id').put(protect, markAsRead);

module.exports = router;