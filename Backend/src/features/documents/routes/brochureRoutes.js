import express from 'express';
import authMiddleware from '../../../shared/middleware/authMiddleware.js';
import { authorizeRoles, authorizeEventCoordinator, authorizeResourceOwnership } from '../../../shared/middleware/roleAuthMiddleware.js';
import {
  generateBrochurePDF,
  downloadBrochurePDF,
  saveBrochurePDF
} from '../controllers/brochureController.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const brochureRoutes = express.Router();

// Apply authentication middleware to all brochure routes
brochureRoutes.use(authMiddleware);

// Apply role authorization - allow coordinators, HODs, and admins
brochureRoutes.use((req, res, next) => {
  if (req.user.role === 'coordinator' || req.user.role === 'hod' || req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Access denied. Coordinator, HOD, or Admin role required"
  });
});

// Brochure generation and management routes
brochureRoutes.get('/:id/pdf', generateBrochurePDF);
brochureRoutes.get('/:eventId/download', downloadBrochurePDF);
brochureRoutes.post('/:id/save', authorizeResourceOwnership('event', 'id'), upload.single('brochurePDF'), saveBrochurePDF);

// Enhanced brochure routes (these will be handled by the coordinator routes)
// but we can add aliases here for consistency
brochureRoutes.get('/:id/enhanced', generateBrochurePDF);
brochureRoutes.get('/:id/advanced', generateBrochurePDF);

export default brochureRoutes;