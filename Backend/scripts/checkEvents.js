import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv to look for .env file in the Backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import the event model
import event from '../models/eventModel.js';

async function checkEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if events collection exists and count documents
    const eventCount = await event.countDocuments();
    console.log(`Total events in database: ${eventCount}`);

    // Get all events
    const events = await event.find({}).select('title createdAt status');
    console.log('Events found:');
    events.forEach((evt, index) => {
      console.log(`${index + 1}. ${evt.title} - Status: ${evt.status} - Created: ${evt.createdAt}`);
    });

    // Check collections in the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAll collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Check if there are any participant events
    const participantEventCount = await mongoose.connection.db.collection('participantevents').countDocuments();
    console.log(`\nTotal participant events: ${participantEventCount}`);

    // Get some participant events to see the eventIds
    const participantEvents = await mongoose.connection.db.collection('participantevents').find({}).limit(5).toArray();
    console.log('\nParticipant events found:');
    participantEvents.forEach((pe, index) => {
      console.log(`${index + 1}. EventId: ${pe.eventId} - ParticipantId: ${pe.participantId} - Approved: ${pe.approved}`);
    });

    // Check if the referenced events exist
    if (participantEvents.length > 0) {
      console.log('\nChecking if referenced events exist:');
      for (const pe of participantEvents) {
        const referencedEvent = await event.findById(pe.eventId);
        if (referencedEvent) {
          console.log(`✅ Event ${pe.eventId} exists: ${referencedEvent.title}`);
        } else {
          console.log(`❌ Event ${pe.eventId} NOT FOUND in events collection`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkEvents();