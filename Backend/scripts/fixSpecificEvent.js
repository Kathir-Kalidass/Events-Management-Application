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
const fixSpecificEvent = async () => {
  try {
    const eventId = '68711b54ee0db388140ae41e';
    console.log(`🔄 Fixing specific event: ${eventId}`);
    
    // Direct MongoDB update to add amount field and synchronize all amounts
    const result = await mongoose.connection.db.collection('events').updateOne(
      { _id: new mongoose.Types.ObjectId(eventId) },
      {
        $set: {
          // Fix tea item (index 0) - all amounts should be 2500
          "claimBill.expenses.0.amount": 2500,
          "claimBill.expenses.0.actualAmount": 2500,
          "claimBill.expenses.0.budgetAmount": 2500,
          "claimBill.expenses.0.approvedAmount": 2500,
          
          // Fix food item (index 1) - all amounts should be 2030
          "claimBill.expenses.1.amount": 2030,
          "claimBill.expenses.1.actualAmount": 2030,
          "claimBill.expenses.1.budgetAmount": 2030,
          "claimBill.expenses.1.approvedAmount": 2030,
          
          // Add amount field for other pending items (keep their current values)
          "claimBill.expenses.2.amount": 400, // foh
          "claimBill.expenses.3.amount": 21,  // dd
          "claimBill.expenses.4.amount": 345, // dds
          "claimBill.expenses.5.amount": 60,  // foh
          
          // Update totals to reflect approved amounts only (tea + food)
          "claimBill.totalBudgetAmount": 4530, // 2500 + 2030
          "claimBill.totalExpenditure": 4530,
          "claimBill.totalApprovedAmount": 4530
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Successfully fixed the specific event!');
      
      // Verify the fix
      const updatedEvent = await mongoose.connection.db.collection('events').findOne(
        { _id: new mongoose.Types.ObjectId(eventId) },
        { projection: { 'claimBill.expenses': 1, 'claimBill.totalBudgetAmount': 1 } }
      );
      
      console.log('\n🔍 Verification - Updated expense amounts:');
      updatedEvent.claimBill.expenses.forEach((expense, index) => {
        const allSame = expense.amount === expense.actualAmount && 
                       expense.actualAmount === expense.budgetAmount && 
                       expense.budgetAmount === expense.approvedAmount;
        
        console.log(`   ${index}: ${expense.category}`);
        console.log(`      amount: ${expense.amount}`);
        console.log(`      actualAmount: ${expense.actualAmount}`);
        console.log(`      budgetAmount: ${expense.budgetAmount}`);
        console.log(`      approvedAmount: ${expense.approvedAmount}`);
        console.log(`      status: ${expense.itemStatus}`);
        console.log(`      All synchronized: ${expense.itemStatus === 'approved' ? (allSame ? '✅' : '❌') : 'N/A (pending/rejected)'}`);
        console.log('');
      });
      
      console.log(`💰 Updated totals:`);
      console.log(`   totalBudgetAmount: ${updatedEvent.claimBill.totalBudgetAmount}`);
      console.log(`   totalExpenditure: ${updatedEvent.claimBill.totalExpenditure}`);
      console.log(`   totalApprovedAmount: ${updatedEvent.claimBill.totalApprovedAmount}`);
      
    } else {
      console.log('❌ No changes made - event may not exist or already fixed');
    }
    
  } catch (error) {
    console.error('❌ Error fixing specific event:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await fixSpecificEvent();
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