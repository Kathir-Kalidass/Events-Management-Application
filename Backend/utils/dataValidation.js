import ParticipantEvent from '../models/ParticipantEventModel.js';
import Participant from '../models/participantModel.js';
import User from '../models/userModel.js';
import Event from '../models/eventModel.js';
import mongoose from 'mongoose';

/**
 * Utility functions for data validation and cleanup
 */

/**
 * Find and optionally fix orphaned ParticipantEvent records
 * @param {boolean} autoFix - Whether to automatically fix orphaned records
 * @param {string} eventId - Optional: Check specific event only
 * @returns {Object} Report of orphaned records found and actions taken
 */
export const validateParticipantEvents = async (autoFix = false, eventId = null) => {
  try {
    const report = {
      totalChecked: 0,
      orphanedRecords: [],
      fixedRecords: [],
      deletedRecords: [],
      errors: []
    };

    // Build query
    const query = eventId ? { eventId } : {};
    
    // Get all ParticipantEvents
    const participantEvents = await ParticipantEvent.find(query);
    report.totalChecked = participantEvents.length;

    for (const pe of participantEvents) {
      try {
        // Check if participant exists
        const participant = await User.findById(pe.participantId);
        
        if (!participant) {
          const orphanedRecord = {
            participantEventId: pe._id,
            eventId: pe.eventId,
            missingParticipantId: pe.participantId,
            registrationDate: pe.registrationDate,
            approved: pe.approved,
            attended: pe.attended
          };
          
          report.orphanedRecords.push(orphanedRecord);
          console.warn(`⚠️ Orphaned ParticipantEvent: ${pe._id} - participant ${pe.participantId} not found`);

          if (autoFix) {
            // Try to find a suitable replacement participant or delete the record
            const availableParticipants = await User.find({ role: 'participant' }).limit(1);
            
            if (availableParticipants.length > 0) {
              // Update with first available participant (you might want more sophisticated logic)
              pe.participantId = availableParticipants[0]._id;
              await pe.save();
              
              report.fixedRecords.push({
                ...orphanedRecord,
                newParticipantId: availableParticipants[0]._id,
                newParticipantName: availableParticipants[0].name
              });

            } else {
              // No participants available, delete the orphaned record
              await ParticipantEvent.findByIdAndDelete(pe._id);
              report.deletedRecords.push(orphanedRecord);

            }
          }
        }

        // Also check if event exists
        const event = await Event.findById(pe.eventId);
        if (!event) {
          console.warn(`⚠️ ParticipantEvent ${pe._id} references non-existent event ${pe.eventId}`);
          report.errors.push(`ParticipantEvent ${pe._id} references non-existent event ${pe.eventId}`);
          
          if (autoFix) {
            // Delete ParticipantEvent for non-existent events
            await ParticipantEvent.findByIdAndDelete(pe._id);
            report.deletedRecords.push({
              participantEventId: pe._id,
              reason: 'Event not found',
              eventId: pe.eventId
            });

          }
        }

      } catch (error) {
        report.errors.push(`Error processing ParticipantEvent ${pe._id}: ${error.message}`);
        console.error(`❌ Error processing ParticipantEvent ${pe._id}:`, error.message);
      }
    }

    return report;
  } catch (error) {
    console.error('❌ Error in validateParticipantEvents:', error);
    throw error;
  }
};

/**
 * Create a proper ParticipantEvent with validation
 * @param {string} eventId - Event ID
 * @param {string} participantId - Participant ID
 * @param {Object} options - Additional options
 * @returns {Object} Created ParticipantEvent or error
 */
export const createValidatedParticipantEvent = async (eventId, participantId, options = {}) => {
  try {
    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    // Validate participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      throw new Error(`Participant with ID ${participantId} not found`);
    }

    // Check if participant has role 'participant'
    if (participant.role !== 'participant') {
      throw new Error(`User ${participantId} is not a participant (role: ${participant.role})`);
    }

    // Check if already registered
    const existingRegistration = await ParticipantEvent.findOne({ eventId, participantId });
    if (existingRegistration) {
      throw new Error(`Participant ${participantId} already registered for event ${eventId}`);
    }

    // Create the ParticipantEvent
    const participantEvent = new ParticipantEvent({
      eventId,
      participantId,
      approved: options.approved || false,
      attended: options.attended || false,
      feedbackGiven: options.feedbackGiven || false,
      certificateGenerated: options.certificateGenerated || false,
      registrationDate: options.registrationDate || new Date(),
      ...options
    });

    await participantEvent.save();

    return { success: true, participantEvent };

  } catch (error) {
    console.error('❌ Error creating validated ParticipantEvent:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Bulk validate and fix data integrity issues
 * @param {Object} options - Validation options
 * @returns {Object} Comprehensive validation report
 */
export const validateDataIntegrity = async (options = {}) => {
  const {
    autoFix = false,
    checkParticipantEvents = true,
    checkEvents = true,
    checkUsers = true
  } = options;

  const report = {
    timestamp: new Date(),
    autoFix,
    participantEvents: null,
    events: null,
    users: null,
    summary: {
      totalIssues: 0,
      fixedIssues: 0,
      remainingIssues: 0
    }
  };

  try {

    // Validate ParticipantEvents
    if (checkParticipantEvents) {

      report.participantEvents = await validateParticipantEvents(autoFix);
    }

    // Validate Events (check for orphaned events, etc.)
    if (checkEvents) {

      // Add event validation logic here if needed
      report.events = { message: 'Event validation not implemented yet' };
    }

    // Validate Users (check for orphaned users, etc.)
    if (checkUsers) {

      // Add user validation logic here if needed
      report.users = { message: 'User validation not implemented yet' };
    }

    // Calculate summary
    if (report.participantEvents) {
      report.summary.totalIssues += report.participantEvents.orphanedRecords.length;
      report.summary.fixedIssues += report.participantEvents.fixedRecords.length + report.participantEvents.deletedRecords.length;
    }
    report.summary.remainingIssues = report.summary.totalIssues - report.summary.fixedIssues;

    return report;

  } catch (error) {
    console.error('❌ Error in data integrity validation:', error);
    report.error = error.message;
    return report;
  }
};

/**
 * Scheduled cleanup function that can be run periodically
 */
export const scheduledDataCleanup = async () => {
  try {

    const report = await validateDataIntegrity({ 
      autoFix: true,
      checkParticipantEvents: true 
    });
    
    // Log the report for monitoring
    console.log('📋 Cleanup Report:', JSON.stringify(report, null, 2));
    
    // You could send this report to monitoring systems, email admins, etc.
    
    return report;
  } catch (error) {
    console.error('❌ Error in scheduled cleanup:', error);
    throw error;
  }
};

export default {
  validateParticipantEvents,
  createValidatedParticipantEvent,
  validateDataIntegrity,
  scheduledDataCleanup
};