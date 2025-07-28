import express from 'express'
import authMiddleware from '../../../shared/middleware/authMiddleware.js';
import { authorizeRoles } from '../../../shared/middleware/roleAuthMiddleware.js';
import{ allEvents } from '../controllers/allEvents.js'
import { approveEvent, rejectEvent } from '../controllers/updatedStatus.js';
import { addComment } from '../controllers/addComment.js';
import { downloadClaimPDF } from '../controllers/downloadClaimPDF.js';
import { updateEventStatus } from '../controllers/eventStatusController.js';
import { getEventParticipants } from '../../participants/controllers/participantManagement.js';
import { generateProgrammePDF } from '../../documents/controllers/pdfController.js';
import { 
  getConvenorCommitteeMembers, 
  addConvenorCommitteeMember, 
  updateConvenorCommitteeMember, 
  deleteConvenorCommitteeMember,
  initializeDefaultCommittee,
  getAvailableRoles
} from '../controllers/convenorCommitteeController.js';
import { getProgrammeById } from '../controllers/programmeController.js';
import {
  getApprovedEventParticipants,
  getApprovedParticipantStats,
  exportApprovedParticipants,
  debugParticipantData
} from '../controllers/participantController.js';
// Import feedback stats controllers
import {
  getEventFeedbackStats,
  getEventFeedbackDetails,
  getAllEventsFeedbackStats
} from '../../feedback/controllers/feedbackStats.js';

// Import signature management controllers
import {
  uploadSignature,
  getSignature,
  deleteSignature,
  activateSignature,
  getSignatureForCertificate
} from '../../hod/controllers/signatureController.js';

// Import HOD management middleware
import {
  getActiveHOD,
  getAllHODs,
  toggleHODStatus
} from '../../../shared/middleware/hodManagementMiddleware.js';

// Import profile controller
import { getProfileStats, updateProfile, getProfile, changePassword } from '../controllers/profileController.js';

const hodRoutes = express.Router();

// Apply authentication middleware to all HOD routes
hodRoutes.use(authMiddleware);

// Apply HOD role authorization to all routes
hodRoutes.use(authorizeRoles('hod', 'admin'));

// Profile management routes
hodRoutes.get('/profile/stats', getProfileStats);
hodRoutes.get('/profile', getProfile);
hodRoutes.put('/profile', updateProfile);
hodRoutes.put('/change-password', changePassword);

hodRoutes.get('/allEvents/', allEvents);
hodRoutes.get('/events/:id', getProgrammeById); // Individual event details
hodRoutes.get('/events/:id/participants/debug', debugParticipantData); // Debug participant data
hodRoutes.get('/events/:id/participants', getApprovedEventParticipants); // Approved participants only for HOD
hodRoutes.get('/events/:id/participants/stats', getApprovedParticipantStats); // Participant statistics
hodRoutes.get('/events/:id/participants/export', exportApprovedParticipants); // Export approved participants
hodRoutes.get('/events/:id/proposal-pdf', generateProgrammePDF); // Proposal PDF
hodRoutes.put('/events/:id/status', updateEventStatus); // Update event status
hodRoutes.get('/event/claimPdf/:eventId', downloadClaimPDF);
// Add route for force regenerating claim PDFs (for testing/debugging)
hodRoutes.get('/event/claimPdf/:eventId/regenerate', (req, res) => {
  req.query.forceRegenerate = 'true';
  return downloadClaimPDF(req, res);
});
hodRoutes.put('/event/approve', approveEvent);
hodRoutes.put('/event/reject', rejectEvent);
hodRoutes.post('/event/comment', addComment);

// Feedback Statistics Routes
hodRoutes.get('/feedback/stats/:eventId', getEventFeedbackStats);
hodRoutes.get('/feedback/details/:eventId', getEventFeedbackDetails);
hodRoutes.get('/feedback/all-events-stats', getAllEventsFeedbackStats);

// Convenor Committee Management
hodRoutes.get('/convenor-committee', getConvenorCommitteeMembers);
hodRoutes.post('/convenor-committee', addConvenorCommitteeMember);
hodRoutes.put('/convenor-committee/:id', updateConvenorCommitteeMember);
hodRoutes.delete('/convenor-committee/:id', deleteConvenorCommitteeMember);
hodRoutes.post('/convenor-committee/initialize-default', initializeDefaultCommittee);
hodRoutes.get('/convenor-committee/available-roles', getAvailableRoles);

// Signature Management Routes
hodRoutes.post('/signature/upload', uploadSignature);
hodRoutes.get('/signature', getSignature);
hodRoutes.delete('/signature', deleteSignature);
hodRoutes.put('/signature/activate', activateSignature);
hodRoutes.get('/signature/for-certificate/:hodId', getSignatureForCertificate);

// HOD Management Routes (Admin access)
hodRoutes.get('/management/active', getActiveHOD);
hodRoutes.get('/management/all', getAllHODs);
hodRoutes.put('/management/:hodId/toggle-status', toggleHODStatus);

export default hodRoutes;