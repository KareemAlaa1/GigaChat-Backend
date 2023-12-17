const express = require('express');
const ChatController = require('../controllers/chat_controller');
const { protect } = require('../controllers/auth_controller');
const router = new express.Router();

router.get('/all', protect, ChatController.getAllConversations);

router.get('/search', protect, ChatController.searchMessage);

module.exports = router;
