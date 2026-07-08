import express from 'express';
import { getHealth, getStats, getRecentErrors, resolveError } from '../controllers/monitoringController.js';
import authMiddleware from '../../../shared/middleware/authMiddleware.js';

const router = express.Router();

router.get('/health', getHealth);
router.get('/stats', authMiddleware, getStats);
router.get('/errors', authMiddleware, getRecentErrors);
router.put('/errors/:id/resolve', authMiddleware, resolveError);

export default router;
