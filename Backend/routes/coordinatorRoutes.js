import express from 'express';
import { handleClaimBillSubmission } from '../controllers/coordinator/dashboard.js';
import { generateClaimBillPDF } from '../controllers/coordinator/dashboard.js';
import {
  createProgramme,
  getProgrammes,
  getProgrammeById,
  updateProgramme,
  deleteProgramme,
  generateProgrammePDF,
  getHod
} from '../controllers/coordinator/dashboard.js';
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

// Add the PDF route
coordinatorRoutes.get('/programmes/:id/pdf',  generateProgrammePDF);
coordinatorRoutes.post('/claims/:id', handleClaimBillSubmission);
coordinatorRoutes.get('/claims/:id/pdf', generateClaimBillPDF);
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


