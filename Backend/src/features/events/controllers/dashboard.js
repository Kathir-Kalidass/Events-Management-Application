// Import all controller functions from separate files
export { 
  createProgramme, 
  getProgrammes, 
  getProgrammeById, 
  deleteProgramme 
} from './programmeController.js';

export { 
  updateProgramme 
} from './updateController.js';

export { 
  handleClaimBillSubmission, 
  getProgrammeForClaim 
} from '../../claims/controllers/claimBillController.js';

export { 
  generateProgrammePDF 
} from '../../documents/controllers/pdfController.js';

export { 
  generateClaimBillPDF 
} from '../../claims/controllers/claimPdfController.js';

export { 
  getHod 
} from '../../admin/controllers/userController.js';