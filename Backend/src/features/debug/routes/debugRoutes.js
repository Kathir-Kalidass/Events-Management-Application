import express from 'express';
import authMiddleware from '../../../shared/middleware/authMiddleware.js';
import {
  getCurrentUserInfo,
  checkUserRole,
  getAllHODs
} from '../controllers/debugController.js';

const router = express.Router();

// Apply authentication middleware to all debug routes
router.use(authMiddleware);

// Debug routes
router.get('/user-info', getCurrentUserInfo);
router.get('/check-role/:role', checkUserRole);
router.get('/hods', getAllHODs);

export default router;