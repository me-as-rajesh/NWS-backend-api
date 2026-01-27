const express = require('express');
const router = express.Router();
const { accessChat, fetchChats, allMessages, sendMessage } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Create or access a one-on-one chat
router.route('/').post(protect, accessChat);

// Fetch all chats for the logged-in user
router.route('/').get(protect, fetchChats);

// Fetch all messages in a specific chat
router.route('/:chatId/messages').get(protect, allMessages);

// Send a new message
router.route('/messages').post(protect, sendMessage);

module.exports = router;