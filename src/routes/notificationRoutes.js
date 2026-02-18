const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');

// Get all notifications for the logged-in user
router.route('/').get(getNotifications);

// Mark a single notification as read
router.route('/:id').put(markAsRead);

module.exports = router;