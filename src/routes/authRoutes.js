/**
 * Auth Routes: Authentication, Session & Account Switcher (Personas)
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/auth/login', authController.login);
router.post('/auth/switch', authController.switchAccount);
router.post('/auth/register', authController.register);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authenticateToken, authController.getMe);
router.get('/personas', authController.getPersonas);

module.exports = router;
