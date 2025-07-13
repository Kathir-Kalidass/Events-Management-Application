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
import User from '../models/userModel.js';

async function fixParticipantEvent() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const eventId = '68711b54ee0db388140ae41e';
    const oldParticipantId = '6857dbb542e87e57a8748a61';
    const newParticipantId = '687121b6f7d6514a57ea2557'; // kkd

    console.log(`Fixing ParticipantEvent for event ${eventId}`);
    console.log(`Changing participantId from ${oldParticipantId} to ${newParticipantId}`);

    // Verify the new participant exists
    const participant = await User.findById(newParticipantId);
    if (!participant) {
      console.log('❌ New participant not found');
      return;
    }
    console.log(`✅ New participant found: ${participant.name} (${participant.email})`);

    // Find the ParticipantEvent
    const participantEvent = await ParticipantEvent.findOne({ 
      eventId: eventId, 
      participantId: oldParticipantId 
    });

    if (!participantEvent) {
      console.log('❌ ParticipantEvent not found');
      return;
    }

    console.log('✅ ParticipantEvent found');
    console.log('Before update:', {
      eventId: participantEvent.eventId,
      participantId: participantEvent.participantId,
      approved: participantEvent.approved,
      attended: participantEvent.attended
    });

    // Update the participantId
    participantEvent.participantId = newParticipantId;
    await participantEvent.save();

    console.log('✅ ParticipantEvent updated successfully');
    console.log('After update:', {
      eventId: participantEvent.eventId,
      participantId: participantEvent.participantId,
      approved: participantEvent.approved,
      attended: participantEvent.attended
    });

    // Test the population
    console.log('\n=== Testing Population ===');
    const populatedEvent = await ParticipantEvent.findById(participantEvent._id)
      .populate('participantId', 'name email dateOfBirth department phone institution designation');
    
    if (populatedEvent.participantId) {
      console.log('✅ Population successful:');
      console.log(`   Name: ${populatedEvent.participantId.name}`);
      console.log(`   Email: ${populatedEvent.participantId.email}`);
      console.log(`   Department: ${populatedEvent.participantId.department || 'Not specified'}`);
    } else {
      console.log('❌ Population failed');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

fixParticipantEvent();