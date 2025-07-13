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
import User from '../models/userModel.js';

async function checkParticipantUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const participantId = '6857dbb542e87e57a8748a61';
    console.log(`Checking for user with ID: ${participantId}`);

    // Check if the user exists
    const user = await User.findById(participantId);
    console.log('User found:', user ? `${user.name} (${user.email}) - Role: ${user.role}` : 'NOT FOUND');

    // Get all users to see what's available
    const allUsers = await User.find({}).select('name email role');
    console.log(`\nAll users in database (${allUsers.length}):`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user._id} - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Check if there are any participants
    const participants = await User.find({ role: 'participant' }).select('name email');
    console.log(`\nParticipants (${participants.length}):`);
    participants.forEach((user, index) => {
      console.log(`${index + 1}. ${user._id} - ${user.name} (${user.email})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkParticipantUser();