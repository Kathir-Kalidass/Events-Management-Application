// Module 4 - Events Conducted by Department
// Export all models related to events management

const Event = require('../../../models/eventModel');
const Participant = require('../../../models/participantModel');
const ParticipantEvent = require('../../../models/ParticipantEventModel');
const Certificate = require('../../../models/certificateModel');
const Claim = require('../../../models/claimModel');
const Feedback = require('../../../models/feedbackModel');
const FeedbackQuestion = require('../../../models/feedbackQuestionModel');
const ConvenorCommittee = require('../../../models/convenorCommitteeModel');
const TrainingProgramme = require('../../../models/TrainingProgramme');
const User = require('../../../models/userModel');

module.exports = {
  Event,
  Participant,
  ParticipantEvent,
  Certificate,
  Claim,
  Feedback,
  FeedbackQuestion,
  ConvenorCommittee,
  TrainingProgramme,
  User
};