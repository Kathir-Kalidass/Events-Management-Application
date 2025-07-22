import express from 'express';
import { authMiddleware, authorizeRole } from '../../../shared/middleware/authMiddleware.js';
import {
  uploadSignature,
  getSignature,
  deleteSignature,
  activateSignature
} from '../controllers/signatureController.js';

const router = express.Router();

// Apply authentication and HOD role authorization to all routes
router.use(authMiddleware);
router.use(authorizeRole(['hod']));

// Signature management routes
router.post('/upload', uploadSignature);
router.get('/', getSignature);
router.delete('/', deleteSignature);
router.put('/activate', activateSignature);

export default router;