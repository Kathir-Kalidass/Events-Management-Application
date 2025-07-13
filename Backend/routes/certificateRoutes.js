import express from "express";
import {
  generateCertificate,
  bulkGenerateCertificates,
  downloadCertificate,
  getCertificate,
  verifyCertificate,
  getCertificatesByParticipant,
  getCertificatesByEvent,
  updateTemplateConfig,
} from "../controllers/certificateController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles, authorizeParticipantSelfAccess, authorizeEventCoordinator } from "../middleware/roleAuthMiddleware.js";

const router = express.Router();

// Public routes
router.get("/verify/:certificateId", verifyCertificate);

// Protected routes - require authentication
router.use(authMiddleware);

// Generate single certificate
router.post("/generate", authorizeRoles("admin", "coordinator"), generateCertificate);

// Bulk generate certificates for an event
router.post("/bulk-generate", authorizeRoles("admin", "coordinator"), bulkGenerateCertificates);

// Download certificate
router.get("/download/:certificateId", downloadCertificate);

// Get certificate details
router.get("/:certificateId", getCertificate);

// Get certificates by participant
router.get("/participant/:participantId", authorizeParticipantSelfAccess("participantId"), getCertificatesByParticipant);

// Get certificates by event
router.get("/event/:eventId", authorizeEventCoordinator("eventId"), getCertificatesByEvent);

// Update template configuration (admin only)
router.put("/template-config", authorizeRoles("admin"), updateTemplateConfig);

export default router;