/**
 * Settings Routes: Account, Notification Preferences, Security (Password, 2FA, Devices), Appearance
 */
const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/settings/account', authenticateToken, settingsController.getAccountSettings);
router.put('/settings/notifications', authenticateToken, settingsController.updateNotificationPreferences);
router.put('/settings/appearance', authenticateToken, settingsController.updateAppearanceSettings);
router.post('/settings/security/password', authenticateToken, settingsController.changePassword);
router.put('/settings/security/2fa', authenticateToken, settingsController.updateTwoFactor);
router.get('/settings/security/devices', authenticateToken, settingsController.getDevices);
router.delete('/settings/security/devices', authenticateToken, settingsController.revokeOtherDevices);
router.delete('/settings/security/devices/:deviceId', authenticateToken, settingsController.revokeDevice);

module.exports = router;
