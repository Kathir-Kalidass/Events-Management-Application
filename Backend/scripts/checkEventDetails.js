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
import User from '../models/userModel.js';

async function checkEventDetails() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all events with creator details
    const events = await event.find({})
      .populate('createdBy', 'name email role')
      .populate('reviewedBy', 'name email role');
    
    console.log(`Total events found: ${events.length}\n`);

    events.forEach((evt, index) => {
      console.log(`Event ${index + 1}:`);
      console.log(`  Title: ${evt.title}`);
      console.log(`  ID: ${evt._id}`);
      console.log(`  Status: ${evt.status}`);
      console.log(`  Created: ${evt.createdAt}`);
      console.log(`  Created By: ${evt.createdBy ? `${evt.createdBy.name} (${evt.createdBy.email}) - Role: ${evt.createdBy.role}` : 'Not populated'}`);
      console.log(`  Reviewed By: ${evt.reviewedBy ? `${evt.reviewedBy.name} (${evt.reviewedBy.email}) - Role: ${evt.reviewedBy.role}` : 'Not populated'}`);
      console.log('---');
    });

    // Get all users to see who could be coordinators
    const users = await User.find({}).select('name email role');
    console.log(`\nAll users in database:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkEventDetails();