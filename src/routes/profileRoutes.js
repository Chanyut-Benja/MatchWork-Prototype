/**
 * Profile Routes: CandidateProfile, Seeker Preferences/Weights, and JobPosting
 */
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/candidates/:id/tags', authenticateToken, profileController.getCandidateTags);
router.put('/candidates/:id/tags', authenticateToken, profileController.updateCandidateTags);
router.post('/seekers/profile', authenticateToken, profileController.saveSeekerProfile);
router.get('/seekers/profile', authenticateToken, profileController.getSeekerProfile);
router.put('/seekers/preferences/weights', authenticateToken, profileController.updateSeekerWeights);
router.get('/seekers/preferences/weights', authenticateToken, profileController.getSeekerWeights);
router.post('/jobs', authenticateToken, profileController.createJob);

module.exports = router;
