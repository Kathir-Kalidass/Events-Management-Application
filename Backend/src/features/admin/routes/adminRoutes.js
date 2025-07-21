import express from 'express';
import authMiddleware from '../../../shared/middleware/authMiddleware.js';
import { authorizeRoles } from '../../../shared/middleware/roleAuthMiddleware.js';
import feedbackQuestionController from '../controllers/feedbackQuestionController.js';

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authMiddleware);

// Feedback Questions Management Routes (Admin/HOD only)
router.get('/feedback-questions', authorizeRoles('admin', 'hod'), feedbackQuestionController.getAllFeedbackQuestions);
router.post('/feedback-questions', authorizeRoles('admin', 'hod'), feedbackQuestionController.createFeedbackQuestion);
router.put('/feedback-questions/:id', authorizeRoles('admin', 'hod'), feedbackQuestionController.updateFeedbackQuestion);
router.delete('/feedback-questions/:id', authorizeRoles('admin', 'hod'), feedbackQuestionController.deleteFeedbackQuestion);
router.put('/feedback-questions/reorder', authorizeRoles('admin', 'hod'), feedbackQuestionController.reorderFeedbackQuestions);
router.post('/feedback-questions/initialize', authorizeRoles('admin', 'hod'), feedbackQuestionController.initializeDefaultQuestions);

export default router;