import express from 'express';
import {
  getStatus,
  generateBrochureContent,
  generateCertificateText,
  analyzeFeedback,
  getRecommendations,
  getBudgetSuggestions,
  smartBrochure,
  smartBrochurePDF,
  getTones,
} from '../controllers/aiController.js';
import authMiddleware from '../../../shared/middleware/authMiddleware.js';

const router = express.Router();

router.get('/status', getStatus);
router.post('/brochure', authMiddleware, generateBrochureContent);
router.post('/certificate', authMiddleware, generateCertificateText);
router.post('/feedback/sentiment', authMiddleware, analyzeFeedback);
router.post('/recommendations', authMiddleware, getRecommendations);
router.post('/budget', authMiddleware, getBudgetSuggestions);

router.post('/smart-brochure', authMiddleware, smartBrochure);
router.get('/smart-brochure/:eventId/pdf', authMiddleware, smartBrochurePDF);
router.get('/tones', authMiddleware, getTones);

export default router;
