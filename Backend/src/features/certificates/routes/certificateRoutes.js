import express from 'express';
import {
  generateCertificateFromDB,
  createCertificate,
  generateAndCreateCertificate,
  downloadCertificatePDF,
  downloadCertificateImage,
  verifyCertificate,
  getCertificatesByParticipant,
  getCertificatesByEvent,
  updateCertificateStatus,
  getCertificateStats,
  previewCertificate,
  getCertificateImagePreview,
  bulkCertificateOperations,
  getBufferStorageStats,
  regenerateAllCertificates,
  regenerateCertificatesByEvent,
  forceRegenerateCertificate
} from '../controllers/certificateController.js';
import authMiddleware from '../../../shared/middleware/authMiddleware.js';
import { authorizeRoles, authorizeEventCoordinator, authorizeCertificateAccess } from '../../../shared/middleware/roleAuthMiddleware.js';

const router = express.Router();

// Public routes
router.get('/verify/:certificateId', verifyCertificate);
router.get('/download/pdf/:certificateId', downloadCertificatePDF);
router.get('/download/image/:certificateId', downloadCertificateImage);

// Protected routes - require authentication
router.use(authMiddleware);

// Certificate generation routes - coordinators can only generate for their events
router.post('/generate/:certificateId', authorizeCertificateAccess(), generateCertificateFromDB);
router.post('/create', createCertificate);
router.post('/generate-and-create', generateAndCreateCertificate);

// Certificate retrieval routes
router.get('/participant/:participantId', getCertificatesByParticipant);
router.get('/event/:eventId', authorizeEventCoordinator(), getCertificatesByEvent);

// Student portal viewing routes - coordinators can only view certificates for their events
router.get('/preview/:certificateId', authorizeCertificateAccess(), previewCertificate);
router.get('/image-preview/:certificateId', authorizeCertificateAccess(), getCertificateImagePreview);

// Certificate management routes - coordinators can only manage certificates for their events
router.patch('/status/:certificateId', authorizeCertificateAccess(), updateCertificateStatus);

// Bulk operations for buffer management - require admin/coordinator role
router.post('/bulk-operations', authorizeRoles('admin', 'coordinator'), bulkCertificateOperations);

// Certificate regeneration routes - require admin/coordinator/hod role
router.post('/regenerate-all', authorizeRoles('admin', 'hod'), regenerateAllCertificates);
router.post('/regenerate-event/:eventId', authorizeRoles('admin', 'coordinator', 'hod'), regenerateCertificatesByEvent);
router.post('/force-regenerate/:certificateId', authorizeRoles('admin', 'coordinator', 'hod'), forceRegenerateCertificate);

// Statistics routes - require admin role
router.get('/stats', authorizeRoles('admin'), getCertificateStats);
router.get('/buffer-stats', authorizeRoles('admin'), getBufferStorageStats);

export default router;