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
} from './claimBillController.js';

export { 
  generateProgrammePDF 
} from './pdfController.js';

export { 
  generateClaimBillPDF 
} from './claimPdfController.js';

export { 
  getHod 
} from './userController.js';