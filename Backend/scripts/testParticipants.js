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
import event from '../models/eventModel.js';
import User from '../models/userModel.js';
import ParticipantEvent from '../models/ParticipantEventModel.js';

async function testParticipants() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const eventId = '68711b54ee0db388140ae41e';
    console.log(`Testing with event ID: ${eventId}`);

    // Get the AI event
    const aiEvent = await event.findById(eventId);
    console.log('AI Event:', aiEvent ? `Found: ${aiEvent.title}` : 'Not found');

    // Check ParticipantEvent collection directly
    console.log('\n=== Direct MongoDB Query ===');
    const directQuery = await mongoose.connection.db.collection('participantevents').find({ eventId: new mongoose.Types.ObjectId(eventId) }).toArray();
    console.log(`Direct query result: ${directQuery.length} records`);
    directQuery.forEach((pe, index) => {
      console.log(`${index + 1}. EventId: ${pe.eventId}, ParticipantId: ${pe.participantId}, Approved: ${pe.approved}`);
    });

    // Check with string eventId
    console.log('\n=== String EventId Query ===');
    const stringQuery = await mongoose.connection.db.collection('participantevents').find({ eventId: eventId }).toArray();
    console.log(`String query result: ${stringQuery.length} records`);

    // Check ParticipantEvent model query
    console.log('\n=== ParticipantEvent Model Query ===');
    const modelQuery = await ParticipantEvent.find({ eventId: eventId });
    console.log(`Model query result: ${modelQuery.length} records`);

    // Check with ObjectId
    console.log('\n=== ObjectId Query ===');
    const objectIdQuery = await ParticipantEvent.find({ eventId: new mongoose.Types.ObjectId(eventId) });
    console.log(`ObjectId query result: ${objectIdQuery.length} records`);

    // Check all ParticipantEvents
    console.log('\n=== All ParticipantEvents ===');
    const allPE = await ParticipantEvent.find({});
    console.log(`Total ParticipantEvents: ${allPE.length}`);
    allPE.forEach((pe, index) => {
      console.log(`${index + 1}. EventId: ${pe.eventId} (type: ${typeof pe.eventId}), ParticipantId: ${pe.participantId}`);
    });

    // Try to populate participant data
    if (allPE.length > 0) {
      console.log('\n=== Testing Population ===');
      const populatedEvents = await ParticipantEvent.find({})
        .populate('participantId', 'name email dateOfBirth department phone institution designation')
        .populate('approvedBy', 'name')
        .populate('attendanceMarkedBy', 'name');
      
      console.log(`Populated ParticipantEvents: ${populatedEvents.length}`);
      
      populatedEvents.forEach((pe, index) => {
        console.log(`${index + 1}. Event ID: ${pe.eventId}`);
        console.log(`   Participant: ${pe.participantId ? pe.participantId.name : 'NOT POPULATED'}`);
        console.log(`   Participant Email: ${pe.participantId ? pe.participantId.email : 'NOT POPULATED'}`);
        console.log(`   Approved: ${pe.approved}`);
        console.log('---');
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

testParticipants();