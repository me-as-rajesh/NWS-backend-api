const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    // Ensure the notification belongs to the user
    if (notification.userId.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this notification');
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
});

module.exports = { getNotifications, markAsRead };