// Module 4 - Events Routes
// Export all routes related to events management

const express = require('express');
const router = express.Router();

// Import individual route files from actual workspace
const adminRoutes = require('../../../routes/adminRoutes');
const coordinatorRoutes = require('../../../routes/coordinatorRoutes');
const hodRoutes = require('../../../routes/hodRoutes');
const participantRoutes = require('../../../routes/participantRoutes');
const certificateRoutes = require('../../../routes/certificateRoutes');
const claimItemRoutes = require('../../../routes/claimItemRoutes');
const budgetSyncRoutes = require('../../../routes/budgetSyncRoutes');
const authRoutes = require('../../../routes/authRoutes');
const debugRoutes = require('../../../routes/debugRoutes');

// Mount routes with appropriate prefixes
router.use('/admin', adminRoutes);
router.use('/coordinator', coordinatorRoutes);
router.use('/hod', hodRoutes);
router.use('/participant', participantRoutes);
router.use('/certificates', certificateRoutes);
router.use('/claims', claimItemRoutes);
router.use('/budget', budgetSyncRoutes);
router.use('/auth', authRoutes);
router.use('/debug', debugRoutes);

module.exports = router;