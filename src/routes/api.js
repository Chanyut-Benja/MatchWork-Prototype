/**
 * Main RESTful API Router Aggregator for MatchWork (/api/v1)
 */
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const matchingRoutes = require('./matchingRoutes');
const adminRoutes = require('./adminRoutes');
const messageRoutes = require('./messageRoutes');

router.use('/', authRoutes);
router.use('/', profileRoutes);
router.use('/', matchingRoutes);
router.use('/', adminRoutes);
router.use('/', messageRoutes);

module.exports = router;
