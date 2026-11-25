/**
 * Message Routes: Chat history endpoints protected by JWT auth
 */
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/messages/:connectionId', authenticateToken, messageController.getMessagesByConnection);

module.exports = router;
