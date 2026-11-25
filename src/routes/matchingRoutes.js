/**
 * Matching Routes: Recommendation Feed, Card Interactions, Mutual Matches & Connections
 */
const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/feed', authenticateToken, matchingController.getFeed);
router.post('/feed/reset', authenticateToken, matchingController.resetFeed);
router.post('/interactions', authenticateToken, matchingController.createInteraction);
router.get('/interactions', authenticateToken, matchingController.getInteractions);
router.delete('/interactions', authenticateToken, matchingController.deleteInteraction);
router.get('/matches', authenticateToken, matchingController.getMatches);
router.post('/matches/:id/connect', authenticateToken, matchingController.connectMatch);
router.get('/matches/:id/breakdown', authenticateToken, matchingController.getMatchBreakdown);
router.post('/simulate-match', authenticateToken, matchingController.simulateMatch);

module.exports = router;
