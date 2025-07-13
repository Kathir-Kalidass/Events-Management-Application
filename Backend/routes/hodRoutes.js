import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleAuthMiddleware.js';
import{ allEvents } from '../controllers/hod/allEvents.js'
import { approveEvent, rejectEvent } from '../controllers/hod/updatedStatus.js';
import { addComment } from '../controllers/hod/addComment.js';
import { downloadClaimPDF } from '../controllers/hod/downloadClaimPDF.js';
import { updateEventStatus } from '../controllers/hod/eventStatusController.js';
import { getEventParticipants } from '../controllers/coordinator/participantManagement.js';
import { generateProgrammePDF } from '../controllers/coordinator/dashboard.js';
import { 
  getConvenorCommitteeMembers, 
  addConvenorCommitteeMember, 
  updateConvenorCommitteeMember, 
  deleteConvenorCommitteeMember,
  initializeDefaultCommittee,
  getAvailableRoles
} from '../controllers/hod/convenorCommitteeController.js';
import { getProgrammeById } from '../controllers/coordinator/dashboard.js';
import {
  getApprovedEventParticipants,
  getApprovedParticipantStats,
  exportApprovedParticipants,
  debugParticipantData
} from '../controllers/hod/participantController.js';
// Import feedback stats controllers
import {
  getEventFeedbackStats,
  getEventFeedbackDetails,
  getAllEventsFeedbackStats
} from '../controllers/coordinator/feedbackStats.js';

const hodRoutes = express.Router();

// Apply authentication middleware to all HOD routes
hodRoutes.use(authMiddleware);

// Apply HOD role authorization to all routes
hodRoutes.use(authorizeRoles('hod', 'admin'));

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


export default hodRoutes;