import express from 'express';
import { handleClaimBillSubmission } from '../controllers/coordinator/dashboard.js';
import { downloadClaimPDF } from '../controllers/coordinator/downloadClaimPDF.js';
import {
  createProgramme,
  getProgrammes,
  getProgrammeById,
  updateProgramme,
  deleteProgramme,
  generateProgrammePDF,
  generateClaimBillPDF,
  getHod
} from '../controllers/coordinator/dashboard.js';
// Import participant management controllers
import {
  getParticipants,
  getEventParticipants,
  addParticipant,
  approveParticipant,
  bulkApproveParticipants,
  uploadParticipants,
  generateTemplate,
  updateParticipant,
  deleteParticipant,
  exportParticipants
} from '../controllers/coordinator/participantManagement.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const coordinatorRoutes = express.Router();


coordinatorRoutes.get('/getHOD', getHod);
coordinatorRoutes.route('/programmes')
  .get(getProgrammes)
  .post(upload.single('brochure'), createProgramme);

coordinatorRoutes.route('/programmes/:id')
  .get(getProgrammeById)
  .put(upload.single('brochure'), updateProgramme)
  .delete(deleteProgramme);

// Add the PDF routes
coordinatorRoutes.get('/programmes/:id/pdf', generateProgrammePDF);
coordinatorRoutes.get('/event/claimPdf/:eventId', downloadClaimPDF)
coordinatorRoutes.post('/claims/:id', handleClaimBillSubmission);
coordinatorRoutes.get('/claims/:id/pdf', generateClaimBillPDF);

// Participant Management Routes
coordinatorRoutes.get('/participants', getParticipants);
coordinatorRoutes.get('/participants/event/:eventId', getEventParticipants);
coordinatorRoutes.get('/events/:eventId/participants', getEventParticipants); // Alias for the frontend
coordinatorRoutes.post('/participants/add', addParticipant);
coordinatorRoutes.put('/participants/approve', approveParticipant);
coordinatorRoutes.put('/participants/bulk-approve', bulkApproveParticipants);
coordinatorRoutes.post('/participants/upload', upload.single('file'), uploadParticipants);
coordinatorRoutes.get('/participants/template', generateTemplate);
coordinatorRoutes.put('/participants/:participantId', updateParticipant);
coordinatorRoutes.delete('/participants/:participantId', deleteParticipant);
coordinatorRoutes.get('/participants/export/:eventId', exportParticipants);
coordinatorRoutes.get('/claim-pdf/:id', async (req, res) => {
  try {
    const programme = await TrainingProgramme.findById(req.params.id);
    if (!programme || !programme.claimBill?.pdf?.data) {
      return res.status(404).json({ message: 'Claim PDF not found' });
    }

    res.setHeader('Content-Type', programme.claimBill.pdf.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${programme.claimBill.pdf.fileName}"`);

    // Write and end safely
    res.write(programme.claimBill.pdf.data);
    res.end();

  } catch (err) {
    console.error('❌ Error serving claim PDF:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error retrieving claim PDF', error: err.message });
    }
  }
});



export default coordinatorRoutes;


