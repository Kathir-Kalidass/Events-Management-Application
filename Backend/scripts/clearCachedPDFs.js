import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv to look for .env file in the Backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Clear all cached claim PDFs to force regeneration with fixed logic
const clearCachedPDFs = async () => {
  try {
    console.log('🗑️ Clearing all cached claim PDFs to force regeneration...');
    
    // Remove claimPDF field from all events that have it
    const result = await mongoose.connection.db.collection('events').updateMany(
      { 'claimPDF': { $exists: true } },
      { $unset: { 'claimPDF': 1 } }
    );
    
    console.log(`✅ Successfully cleared ${result.modifiedCount} cached claim PDFs`);
    console.log('📄 All claim PDFs will now be regenerated with the latest fixes when accessed');
    
  } catch (error) {
    console.error('❌ Error clearing cached PDFs:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await clearCachedPDFs();
  await mongoose.disconnect();
  console.log('🔌 Database connection closed');
  process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run the script
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});