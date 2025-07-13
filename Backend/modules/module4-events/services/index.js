// Module 4 - Events Services
// Export all services related to events management

const emailService = require('./emailService');
const pdfService = require('./pdfService');
const certificateService = require('./certificateService');
const claimService = require('./claimService');
const eventService = require('./eventService');

module.exports = {
  emailService,
  pdfService,
  certificateService,
  claimService,
  eventService
};