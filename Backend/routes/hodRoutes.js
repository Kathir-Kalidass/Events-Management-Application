import express from 'express'
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

const hodRoutes = express.Router();

hodRoutes.get('/allEvents/', allEvents);
hodRoutes.get('/events/:id', getProgrammeById); // Individual event details
hodRoutes.get('/events/:id/participants', getEventParticipants); // Event participants
hodRoutes.get('/events/:id/proposal-pdf', generateProgrammePDF); // Proposal PDF
hodRoutes.put('/events/:id/status', updateEventStatus); // Update event status
hodRoutes.get('/event/claimPdf/:eventId', downloadClaimPDF);
hodRoutes.put('/event/approve', approveEvent);
hodRoutes.put('/event/reject', rejectEvent);
hodRoutes.post('/event/comment', addComment);

// Convenor Committee Management
hodRoutes.get('/convenor-committee', getConvenorCommitteeMembers);
hodRoutes.post('/convenor-committee', addConvenorCommitteeMember);
hodRoutes.put('/convenor-committee/:id', updateConvenorCommitteeMember);
hodRoutes.delete('/convenor-committee/:id', deleteConvenorCommitteeMember);
hodRoutes.post('/convenor-committee/initialize-default', initializeDefaultCommittee);
hodRoutes.get('/convenor-committee/available-roles', getAvailableRoles);


export default hodRoutes;