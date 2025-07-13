import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv to look for .env file in the Backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import models
import ParticipantEvent from '../models/ParticipantEventModel.js';
import Event from '../models/eventModel.js';
import User from '../models/userModel.js';

async function testAPIEndpoint() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const eventId = '68711b54ee0db388140ae41e';
    console.log(`Testing API logic for event: ${eventId}`);

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      console.log('❌ Event not found');
      return;
    }
    console.log(`✅ Event found: ${event.title}`);

    // Find participant events for this specific event using ParticipantEvent model
    const participantEvents = await ParticipantEvent.find({ eventId })
      .populate('participantId', 'name email dateOfBirth department phone institution designation')
      .populate('approvedBy', 'name')
      .populate('attendanceMarkedBy', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${participantEvents.length} participant events`);

    // Transform the data to match the expected format
    const participants = participantEvents.map(pe => {
      const participant = pe.participantId;
      if (!participant) {
        console.log('⚠️ Participant not populated for ParticipantEvent:', pe._id);
        return null;
      }
      
      return {
        _id: participant._id,
        name: participant.name,
        email: participant.email,
        dateOfBirth: participant.dateOfBirth,
        department: participant.department,
        phone: participant.phone,
        institution: participant.institution,
        designation: participant.designation,
        eventRegistration: {
          eventId: pe.eventId,
          approved: pe.approved,
          attended: pe.attended,
          feedbackGiven: pe.feedbackGiven,
          certificateGenerated: pe.certificateGenerated,
          registrationDate: pe.registrationDate,
          approvedBy: pe.approvedBy,
          approvedDate: pe.approvedDate,
          attendanceMarkedBy: pe.attendanceMarkedBy,
          attendanceMarkedDate: pe.attendanceMarkedDate,
          rejectionReason: pe.rejectionReason
        }
      };
    }).filter(p => p !== null);
    
    console.log(`📊 Transformed participants: ${participants.length}`);
    
    participants.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name} (${p.email})`);
      console.log(`   Department: ${p.department || 'Not specified'}`);
      console.log(`   Approved: ${p.eventRegistration.approved}`);
      console.log(`   Attended: ${p.eventRegistration.attended}`);
      console.log('---');
    });

    // Simulate the API response
    const apiResponse = {
      success: true,
      event: {
        _id: event._id,
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate
      },
      participants: participants || [],
      totalCount: participants ? participants.length : 0
    };

    console.log('\n=== API Response ===');
    console.log(JSON.stringify(apiResponse, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

testAPIEndpoint();