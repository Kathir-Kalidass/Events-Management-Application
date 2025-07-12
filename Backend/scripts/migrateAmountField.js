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

// Migration to add amount field to all existing claim bill expenses
const migrateAmountField = async () => {
  try {
    console.log('🔄 Starting migration to add amount field to claim bill expenses...');
    
    // Find all events that have claim bills
    const events = await mongoose.connection.db.collection('events').find({
      'claimBill.expenses': { $exists: true, $ne: [] }
    }).toArray();
    
    console.log(`📊 Found ${events.length} events with claim bills to migrate`);
    
    let totalUpdated = 0;
    let totalItemsUpdated = 0;
    
    for (const event of events) {
      console.log(`\n🔍 Processing event: ${event.title} (${event._id})`);
      
      let eventNeedsUpdate = false;
      const updateOperations = {};
      
      if (event.claimBill && event.claimBill.expenses) {
        for (let i = 0; i < event.claimBill.expenses.length; i++) {
          const expense = event.claimBill.expenses[i];
          
          // Check if amount field is missing or needs to be synchronized
          let targetAmount = 0;
          
          if (expense.itemStatus === 'approved') {
            // For approved items, use approved amount
            targetAmount = expense.approvedAmount || expense.actualAmount || expense.budgetAmount || 0;
          } else if (expense.itemStatus === 'rejected') {
            // For rejected items, amount should be 0
            targetAmount = 0;
          } else {
            // For pending items, use actual amount or budget amount
            targetAmount = expense.actualAmount || expense.budgetAmount || 0;
          }
          
          // Check if amount field is missing or incorrect
          if (expense.amount === undefined || expense.amount !== targetAmount) {
            updateOperations[`claimBill.expenses.${i}.amount`] = targetAmount;
            eventNeedsUpdate = true;
            totalItemsUpdated++;
            
            console.log(`  ✅ Will add/fix amount field for ${expense.category}: ${expense.amount || 'undefined'} → ${targetAmount}`);
          } else {
            console.log(`  ✓ Amount field already correct for ${expense.category}: ${expense.amount}`);
          }
          
          // Also ensure all amount fields are synchronized for approved items
          if (expense.itemStatus === 'approved') {
            if (expense.actualAmount !== targetAmount) {
              updateOperations[`claimBill.expenses.${i}.actualAmount`] = targetAmount;
              eventNeedsUpdate = true;
            }
            if (expense.budgetAmount !== targetAmount) {
              updateOperations[`claimBill.expenses.${i}.budgetAmount`] = targetAmount;
              eventNeedsUpdate = true;
            }
            if (expense.approvedAmount !== targetAmount) {
              updateOperations[`claimBill.expenses.${i}.approvedAmount`] = targetAmount;
              eventNeedsUpdate = true;
            }
          }
        }
        
        // Update totals if needed
        const approvedItems = event.claimBill.expenses.filter(exp => exp.itemStatus === 'approved');
        const totalApprovedAmount = approvedItems.reduce((sum, exp) => {
          const amount = exp.approvedAmount || exp.actualAmount || exp.budgetAmount || 0;
          return sum + amount;
        }, 0);
        
        if (event.claimBill.totalApprovedAmount !== totalApprovedAmount) {
          updateOperations['claimBill.totalApprovedAmount'] = totalApprovedAmount;
          eventNeedsUpdate = true;
        }
        
        if (event.claimBill.totalBudgetAmount !== totalApprovedAmount) {
          updateOperations['claimBill.totalBudgetAmount'] = totalApprovedAmount;
          eventNeedsUpdate = true;
        }
        
        if (event.claimBill.totalExpenditure !== totalApprovedAmount) {
          updateOperations['claimBill.totalExpenditure'] = totalApprovedAmount;
          eventNeedsUpdate = true;
        }
      }
      
      // Apply updates if needed
      if (eventNeedsUpdate) {
        const result = await mongoose.connection.db.collection('events').updateOne(
          { _id: event._id },
          { $set: updateOperations }
        );
        
        if (result.modifiedCount > 0) {
          totalUpdated++;
          console.log(`  💾 Event updated successfully`);
        } else {
          console.log(`  ⚠️ Event update failed`);
        }
      } else {
        console.log(`  ✓ Event already has correct amount fields`);
      }
    }
    
    console.log(`\n✅ Migration completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Total events processed: ${events.length}`);
    console.log(`   - Total events updated: ${totalUpdated}`);
    console.log(`   - Total expense items updated: ${totalItemsUpdated}`);
    
    // Verify the migration
    console.log(`\n🔍 Verifying migration...`);
    const verificationEvents = await mongoose.connection.db.collection('events').find({
      'claimBill.expenses': { $exists: true, $ne: [] }
    }).toArray();
    
    let verificationErrors = 0;
    
    for (const event of verificationEvents) {
      if (event.claimBill && event.claimBill.expenses) {
        for (const expense of event.claimBill.expenses) {
          if (expense.amount === undefined) {
            console.log(`❌ Verification failed: ${event.title} - ${expense.category} still missing amount field`);
            verificationErrors++;
          } else if (expense.itemStatus === 'approved') {
            const allSame = expense.amount === expense.actualAmount && 
                           expense.actualAmount === expense.budgetAmount && 
                           expense.budgetAmount === expense.approvedAmount;
            if (!allSame) {
              console.log(`❌ Verification failed: ${event.title} - ${expense.category} amounts not synchronized`);
              console.log(`   amount: ${expense.amount}, actual: ${expense.actualAmount}, budget: ${expense.budgetAmount}, approved: ${expense.approvedAmount}`);
              verificationErrors++;
            }
          }
        }
      }
    }
    
    if (verificationErrors === 0) {
      console.log(`✅ Verification passed! All events have correct amount fields.`);
    } else {
      console.log(`❌ Verification found ${verificationErrors} errors.`);
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await migrateAmountField();
  await mongoose.disconnect();
  console.log('🔌 Database connection closed');
  process.exit(0);
};

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run the migration
main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});