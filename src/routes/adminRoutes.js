/**
 * Admin Routes: Admin Dashboard Stats, Job Moderation, Tags, Logs & System Utilities
 */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/health', adminController.getHealth);

// Admin-protected endpoints (JWT + Admin role required)
router.post('/admin/tags', authenticateToken, requireAdmin, adminController.createAdminTag);
router.get('/admin/tags', authenticateToken, requireAdmin, adminController.getAdminTags);
router.get('/admin/jobs', authenticateToken, requireAdmin, adminController.getAdminJobs);
router.patch('/admin/jobs/:id/status', authenticateToken, requireAdmin, adminController.updateJobStatus);
router.get('/admin/logs', authenticateToken, requireAdmin, adminController.getAdminLogs);
router.get('/admin/stats', authenticateToken, requireAdmin, adminController.getAdminStats);

// Public / Legacy Tag & System Utilities
router.get('/tags', adminController.getTags);
router.post('/tags', authenticateToken, adminController.createLegacyTag);
router.post('/reset', authenticateToken, adminController.resetDatabase);
router.get('/test-results', adminController.getTestResults);

module.exports = router;
