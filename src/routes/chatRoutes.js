const express = require('express');
const router = express.Router();
const { accessChat, fetchChats, allMessages, sendMessage } = require('../controllers/chatController');

// Create or access a one-on-one chat
router.route('/').post(accessChat);

// Fetch all chats for the logged-in user
router.route('/').get(fetchChats);

// Fetch all messages in a specific chat
router.route('/:chatId/messages').get(allMessages);

// Send a new message
router.route('/messages').post(sendMessage);

module.exports = router;