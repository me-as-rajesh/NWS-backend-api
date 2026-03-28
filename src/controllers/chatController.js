const asyncHandler = require('express-async-handler');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Job = require('../models/Job');

const getRequestUserId = (req, { bodyKey = 'userId', queryKey = 'userId' } = {}) => {
    return (
        req?.body?.[bodyKey] ||
        req?.query?.[queryKey] ||
        req?.body?.userId ||
        req?.query?.userId
    );
};

const getChatById = async (chatId) => {
    const chat = await Chat.findById(chatId);
    if (!chat) {
        throw new Error('Chat not found');
    }

    return chat;
};

const ensureChatEnabledForJob = async (jobId) => {
    if (!jobId) {
        return null;
    }

    const job = await Job.findById(jobId);
    if (!job) {
        throw new Error('Job not found');
    }

    if (!job.chatEnabled) {
        throw new Error('Chat disabled');
    }

    return job;
};

// @desc    Create or get a one-on-one chat
// @route   POST /api/chats
// @access  Private
const accessChat = asyncHandler(async (req, res) => {
    const { userId, jobId } = req.body;
    const requesterId = getRequestUserId(req, { bodyKey: 'requesterId', queryKey: 'requesterId' });

    if (!requesterId || !userId) {
        console.log("requesterId and userId are required");
        return res.sendStatus(400);
    }

    if (jobId) {
        try {
            await ensureChatEnabledForJob(jobId);
        } catch (error) {
            res.status(error.message === 'Chat disabled' ? 403 : 404);
            throw error;
        }
    }

    // Find if a chat between the two users (and optionally for a job) already exists
    let isChat = await Chat.find({
        isGroupChat: false,
        participants: { $all: [requesterId, userId] },
        ...(jobId && { jobId: jobId })
    })
    .populate("participants", "-password")
    .populate("lastMessage");

    isChat = await User.populate(isChat, {
        path: "lastMessage.sender",
        select: "name pimage email",
    });

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            participants: [requesterId, userId],
            ...(jobId && { jobId: jobId })
        };

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "participants",
                "-password"
            );
            res.status(200).json(FullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
});

// @desc    Get all chats for a user
// @route   GET /api/chats
// @access  Private
const fetchChats = asyncHandler(async (req, res) => {
    const requesterId = getRequestUserId(req, { bodyKey: 'userId', queryKey: 'userId' });
    if (!requesterId) {
        return res.status(400).json({ message: 'userId query param is required' });
    }

    try {
        Chat.find({ participants: requesterId })
            .populate("participants", "-password")
            .populate("groupAdmin", "-password")
            .populate("lastMessage")
            .sort({ lastMessageAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: "lastMessage.sender",
                    select: "name pimage email",
                });
                res.status(200).send(results);
            });
    } catch (error) {
        if (res.statusCode === 200) {
            res.status(400);
        }
        throw new Error(error.message);
    }
});

// @desc    Get all messages for a chat
// @route   GET /api/chats/:chatId/messages
// @access  Private
const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId })
            .populate("sender", "name pimage email")
            .populate("chatId");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

// @desc    Send a new message
// @route   POST /api/chats/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;
    const senderId = getRequestUserId(req, { bodyKey: 'senderId', queryKey: 'senderId' });
    const senderName = req?.body?.senderName;

    // Defensive validation: reject duplicate/incorrect field names and unexpected extras
    if (("message" in req.body) && content) {
        return res.status(400).json({ message: 'Invalid request body: duplicate fields "content" and "message". Use only "content".' });
    }

    if (("chat" in req.body) && chatId) {
        return res.status(400).json({ message: 'Invalid request body: duplicate fields "chatId" and "chat". Use only "chatId".' });
    }

    const allowed = ['content', 'chatId', 'senderId', 'senderName'];
    const extras = Object.keys(req.body).filter(k => !allowed.includes(k));
    if (extras.length > 0) {
        return res.status(400).json({ message: `Invalid request body: unexpected fields: ${extras.join(', ')}. Expected only: ${allowed.join(', ')}.` });
    }

    if (!content || !chatId || !senderId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: senderId,
        content: content,
        chatId: chatId,
    };

    try {
        let chat;

        try {
            chat = await getChatById(chatId);
            if (chat.jobId) {
                await ensureChatEnabledForJob(chat.jobId);
            }
        } catch (error) {
            res.status(error.message === 'Chat disabled' ? 403 : 404);
            throw error;
        }

        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name pimage");
        message = await message.populate("chatId");
        message = await User.populate(message, {
            path: "chatId.participants",
            select: "name pimage email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { 
            lastMessage: message,
            lastMessageAt: Date.now() 
        });
        
        // Create a notification for the recipient
        const recipient = chat.participants.find(p => p.toString() !== senderId.toString());

        if (recipient) {
            await Notification.create({
                userId: recipient,
                title: `New message${senderName ? ` from ${senderName}` : ''}`,
                message: content,
                type: 'message',
                metadata: { chatId: req.body.chatId }
            });
        }

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { accessChat, fetchChats, allMessages, sendMessage };