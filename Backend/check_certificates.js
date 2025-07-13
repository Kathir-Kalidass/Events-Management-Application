import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import Certificate from './models/certificateModel.js';
import ParticipantEvent from './models/ParticipantEventModel.js';
import User from './models/userModel.js';
import Event from './models/eventModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv
dotenv.config({ path: join(__dirname, '.env') });

async function checkCertificates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check certificates in Certificate model
    const certificates = await Certificate.find({}).populate('participantId').populate('eventId');
    console.log(`\nCertificates in Certificate model: ${certificates.length}`);
    certificates.forEach(cert => {
      console.log(`- ${cert.participantName} - ${cert.eventTitle} - ${cert.certificateId}`);
    });

    // Check participant events with feedback given
    const participantEvents = await ParticipantEvent.find({ 
      feedbackGiven: true 
    }).populate('participantId').populate('eventId');
    
    console.log(`\nParticipant events with feedback given: ${participantEvents.length}`);
    participantEvents.forEach(pe => {
      console.log(`- ${pe.participantId?.name} - ${pe.eventId?.title} - Certificate Generated: ${pe.certificateGenerated} - Certificate ID: ${pe.certificateId}`);
    });

    // Check all users
    const users = await User.find({ role: 'participant' });
    console.log(`\nTotal participants: ${users.length}`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user._id})`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkCertificates();