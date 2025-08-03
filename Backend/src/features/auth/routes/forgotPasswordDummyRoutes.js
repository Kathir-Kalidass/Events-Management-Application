import express from 'express';
import { 
  forgotPasswordDummy,
  getPasswordResetRequests,
  approvePasswordReset,
  rejectPasswordReset
} from '../controllers/forgotPasswordDummyController.js';
import authMiddleware from '../../../shared/middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/forgot-password-dummy', forgotPasswordDummy);

// Admin routes for managing password reset requests
router.get('/admin/password-reset-requests', authMiddleware, getPasswordResetRequests);
router.post('/admin/password-reset-requests/:requestId/approve', authMiddleware, approvePasswordReset);
router.post('/admin/password-reset-requests/:requestId/reject', authMiddleware, rejectPasswordReset);

export default router;
