// Module 4 - Events Controllers
// Export all controllers related to events management from actual workspace

const certificateController = require('../../../controllers/certificateController');

// Admin Controllers (actual files)
const feedbackQuestionController = require('../../../controllers/admin/feedbackQuestionController');

// Coordinator Controllers (actual files)
const brochureController = require('../../../controllers/coordinator/brochureController');
const budgetSyncController = require('../../../controllers/coordinator/budgetSyncController');
const claimBillController = require('../../../controllers/coordinator/claimBillController');
const claimController = require('../../../controllers/coordinator/claimController');
const claimItemController = require('../../../controllers/coordinator/claimItemController');
const claimPdfController = require('../../../controllers/coordinator/claimPdfController');
const coordinatorDashboard = require('../../../controllers/coordinator/dashboard');
const downloadClaimPDF = require('../../../controllers/coordinator/downloadClaimPDF');
const feedbackStats = require('../../../controllers/coordinator/feedbackStats');
const fixAmountController = require('../../../controllers/coordinator/fixAmountController');
const generateClaim = require('../../../controllers/coordinator/generateClaim');
const organizingCommitteeController = require('../../../controllers/coordinator/organizingCommitteeController');
const participantManagement = require('../../../controllers/coordinator/participantManagement');
const pdfController = require('../../../controllers/coordinator/pdfController');
const programmeController = require('../../../controllers/coordinator/programmeController');
const updateController = require('../../../controllers/coordinator/updateController');
const userController = require('../../../controllers/coordinator/userController');

// HOD Controllers (actual files)
const hodAddComment = require('../../../controllers/hod/addComment');
const hodAllEvents = require('../../../controllers/hod/allEvents');
const convenorCommitteeController = require('../../../controllers/hod/convenorCommitteeController');
const hodDownloadClaimPDF = require('../../../controllers/hod/downloadClaimPDF');
const eventStatusController = require('../../../controllers/hod/eventStatusController');
const hodParticipantController = require('../../../controllers/hod/participantController');
const hodUpdatedStatus = require('../../../controllers/hod/updatedStatus');

// Participant Controllers (actual files)
const participantDashboard = require('../../../controllers/participant/dashboard');
const getCompletedEventsController = require('../../../controllers/participant/getCompletedEventsController');

// Auth Controllers (actual files)
const authControllers = require('../../../controllers/auth');

module.exports = {
  certificateController,
  
  // Admin Controllers
  admin: {
    feedbackQuestionController
  },
  
  // Coordinator Controllers
  coordinator: {
    brochureController,
    budgetSyncController,
    claimBillController,
    claimController,
    claimItemController,
    claimPdfController,
    dashboard: coordinatorDashboard,
    downloadClaimPDF,
    feedbackStats,
    fixAmountController,
    generateClaim,
    organizingCommitteeController,
    participantManagement,
    pdfController,
    programmeController,
    updateController,
    userController
  },
  
  // HOD Controllers
  hod: {
    addComment: hodAddComment,
    allEvents: hodAllEvents,
    convenorCommitteeController,
    downloadClaimPDF: hodDownloadClaimPDF,
    eventStatusController,
    participantController: hodParticipantController,
    updatedStatus: hodUpdatedStatus
  },
  
  // Participant Controllers
  participant: {
    dashboard: participantDashboard,
    getCompletedEventsController
  },
  
  // Auth Controllers
  authControllers
};