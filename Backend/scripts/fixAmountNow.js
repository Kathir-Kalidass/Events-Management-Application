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

// Fix the specific event immediately
const fixEventNow = async () => {
  try {
    const eventId = '68711b54ee0db388140ae41e';
    console.log(`🔄 Fixing amount fields for event: ${eventId}`);
    
    // Get current event data
    const currentEvent = await mongoose.connection.db.collection('events').findOne(
      { _id: new mongoose.Types.ObjectId(eventId) }
    );
    
    if (!currentEvent) {
      console.log('❌ Event not found');
      return;
    }
    
    console.log('📊 Current expense amounts:');
    currentEvent.claimBill.expenses.forEach((expense, index) => {
      console.log(`   ${index}: ${expense.category} - amount: ${expense.amount}, approved: ${expense.approvedAmount}, actual: ${expense.actualAmount}, budget: ${expense.budgetAmount}`);
    });
    
    // Prepare update operations
    const updateOperations = {};
    let totalApprovedAmount = 0;
    
    // Fix each approved expense
    currentEvent.claimBill.expenses.forEach((expense, index) => {
      if (expense.itemStatus === 'approved') {
        const approvedAmount = expense.approvedAmount || expense.actualAmount || expense.budgetAmount || 0;
        
        // Set all amount fields to be the same
        updateOperations[`claimBill.expenses.${index}.amount`] = approvedAmount;
        updateOperations[`claimBill.expenses.${index}.actualAmount`] = approvedAmount;
        updateOperations[`claimBill.expenses.${index}.budgetAmount`] = approvedAmount;
        updateOperations[`claimBill.expenses.${index}.approvedAmount`] = approvedAmount;
        
        totalApprovedAmount += approvedAmount;
        
        console.log(`✅ Will fix ${expense.category}: all amounts → ${approvedAmount}`);
      } else if (expense.itemStatus === 'rejected') {
        // Set all amount fields to 0 for rejected items
        updateOperations[`claimBill.expenses.${index}.amount`] = 0;
        updateOperations[`claimBill.expenses.${index}.actualAmount`] = 0;
        updateOperations[`claimBill.expenses.${index}.budgetAmount`] = 0;
        updateOperations[`claimBill.expenses.${index}.approvedAmount`] = 0;
        
        console.log(`✅ Will fix ${expense.category}: all amounts → 0 (rejected)`);
      }
    });
    
    // Update totals
    updateOperations['claimBill.totalBudgetAmount'] = totalApprovedAmount;
    updateOperations['claimBill.totalExpenditure'] = totalApprovedAmount;
    updateOperations['claimBill.totalApprovedAmount'] = totalApprovedAmount;
    
    console.log(`💰 Will update totals to: ${totalApprovedAmount}`);
    
    // Apply the update
    const result = await mongoose.connection.db.collection('events').updateOne(
      { _id: new mongoose.Types.ObjectId(eventId) },
      { $set: updateOperations }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Successfully fixed amount fields!');
      
      // Verify the fix
      const updatedEvent = await mongoose.connection.db.collection('events').findOne(
        { _id: new mongoose.Types.ObjectId(eventId) }
      );
      
      console.log('\n🔍 Verification - Updated expense amounts:');
      updatedEvent.claimBill.expenses.forEach((expense, index) => {
        const allSame = expense.amount === expense.actualAmount && 
                       expense.actualAmount === expense.budgetAmount && 
                       expense.budgetAmount === expense.approvedAmount;
        
        console.log(`   ${index}: ${expense.category} - amount: ${expense.amount}, approved: ${expense.approvedAmount}, actual: ${expense.actualAmount}, budget: ${expense.budgetAmount} | All same: ${allSame ? '✅' : '❌'}`);
      });
      
      console.log(`\n💰 Updated totals:`);
      console.log(`   totalBudgetAmount: ${updatedEvent.claimBill.totalBudgetAmount}`);
      console.log(`   totalExpenditure: ${updatedEvent.claimBill.totalExpenditure}`);
      console.log(`   totalApprovedAmount: ${updatedEvent.claimBill.totalApprovedAmount}`);
      
    } else {
      console.log('❌ No changes made - event may already be fixed');
    }
    
  } catch (error) {
    console.error('❌ Error fixing event:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await fixEventNow();
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