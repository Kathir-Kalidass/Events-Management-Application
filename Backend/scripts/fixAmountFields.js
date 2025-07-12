import mongoose from 'mongoose';
import Event from '../models/eventModel.js';
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

// Fix amount fields for all claim items
const fixAmountFields = async () => {
  try {
    console.log('🔄 Starting amount field synchronization...');
    
    // Find all events with claim bills
    const events = await Event.find({
      'claimBill.expenses': { $exists: true, $ne: [] }
    });

    console.log(`📊 Found ${events.length} events with claim bills`);

    let totalFixed = 0;
    let totalItems = 0;

    for (const event of events) {
      console.log(`\n🔍 Processing event: ${event.title} (${event._id})`);
      
      let eventModified = false;
      
      if (event.claimBill && event.claimBill.expenses) {
        for (let i = 0; i < event.claimBill.expenses.length; i++) {
          const expense = event.claimBill.expenses[i];
          totalItems++;
          
          console.log(`  📝 Item ${i}: ${expense.category}`);
          console.log(`    Current amounts: amount=${expense.amount}, actualAmount=${expense.actualAmount}, budgetAmount=${expense.budgetAmount}, approvedAmount=${expense.approvedAmount}`);
          console.log(`    Status: ${expense.itemStatus}`);
          
          let targetAmount = 0;
          
          if (expense.itemStatus === 'approved') {
            // For approved items, use approved amount or actual amount
            targetAmount = expense.approvedAmount || expense.actualAmount || expense.budgetAmount || expense.amount || 0;
          } else if (expense.itemStatus === 'rejected') {
            // For rejected items, amount should be 0
            targetAmount = 0;
          } else {
            // For pending items, keep original amount
            targetAmount = expense.actualAmount || expense.budgetAmount || expense.amount || 0;
          }
          
          // Check if amount field needs to be updated
          if (expense.amount !== targetAmount) {
            console.log(`    ✅ Fixing amount: ${expense.amount} → ${targetAmount}`);
            expense.amount = targetAmount;
            
            // Also ensure other fields are consistent for approved items
            if (expense.itemStatus === 'approved') {
              expense.actualAmount = targetAmount;
              expense.budgetAmount = targetAmount;
              if (!expense.approvedAmount) {
                expense.approvedAmount = targetAmount;
              }
            }
            
            eventModified = true;
            totalFixed++;
          } else {
            console.log(`    ✓ Amount field already correct`);
          }
        }
        
        // Recalculate totals if event was modified
        if (eventModified) {
          const approvedItems = event.claimBill.expenses.filter(exp => exp.itemStatus === 'approved');
          const totalApprovedAmount = approvedItems.reduce((sum, exp) => sum + (exp.approvedAmount || 0), 0);
          const totalBudgetAmount = approvedItems.reduce((sum, exp) => sum + (exp.amount || 0), 0);
          
          event.claimBill.totalApprovedAmount = totalApprovedAmount;
          event.claimBill.totalBudgetAmount = totalBudgetAmount;
          event.claimBill.totalExpenditure = totalApprovedAmount;
          
          console.log(`  💰 Updated totals: approved=${totalApprovedAmount}, budget=${totalBudgetAmount}`);
          
          // Mark as modified and save
          event.markModified('claimBill');
          await event.save();
          console.log(`  💾 Event saved successfully`);
        }
      }
    }
    
    console.log(`\n✅ Amount field synchronization completed!`);
    console.log(`📊 Summary:`);
    console.log(`   - Total events processed: ${events.length}`);
    console.log(`   - Total claim items processed: ${totalItems}`);
    console.log(`   - Total amount fields fixed: ${totalFixed}`);
    
  } catch (error) {
    console.error('❌ Error fixing amount fields:', error);
    throw error;
  }
};

// Fix specific event by ID
const fixSpecificEvent = async (eventId) => {
  try {
    console.log(`🔄 Fixing specific event: ${eventId}`);
    
    const event = await Event.findById(eventId);
    if (!event) {
      console.log('❌ Event not found');
      return;
    }
    
    console.log(`📝 Event: ${event.title}`);
    
    if (!event.claimBill || !event.claimBill.expenses) {
      console.log('❌ No claim bill found');
      return;
    }
    
    let itemsFixed = 0;
    
    for (let i = 0; i < event.claimBill.expenses.length; i++) {
      const expense = event.claimBill.expenses[i];
      
      console.log(`\n  📝 Item ${i}: ${expense.category}`);
      console.log(`    Before: amount=${expense.amount}, actualAmount=${expense.actualAmount}, budgetAmount=${expense.budgetAmount}, approvedAmount=${expense.approvedAmount}`);
      console.log(`    Status: ${expense.itemStatus}`);
      
      let targetAmount = 0;
      
      if (expense.itemStatus === 'approved') {
        targetAmount = expense.approvedAmount || expense.actualAmount || expense.budgetAmount || expense.amount || 0;
        // Ensure all fields are consistent for approved items
        expense.actualAmount = targetAmount;
        expense.budgetAmount = targetAmount;
        if (!expense.approvedAmount) {
          expense.approvedAmount = targetAmount;
        }
      } else if (expense.itemStatus === 'rejected') {
        targetAmount = 0;
      } else {
        targetAmount = expense.actualAmount || expense.budgetAmount || expense.amount || 0;
      }
      
      if (expense.amount !== targetAmount) {
        expense.amount = targetAmount;
        itemsFixed++;
        console.log(`    ✅ Fixed amount: → ${targetAmount}`);
      } else {
        console.log(`    ✓ Amount already correct`);
      }
      
      console.log(`    After: amount=${expense.amount}, actualAmount=${expense.actualAmount}, budgetAmount=${expense.budgetAmount}, approvedAmount=${expense.approvedAmount}`);
    }
    
    // Recalculate totals
    const approvedItems = event.claimBill.expenses.filter(exp => exp.itemStatus === 'approved');
    const totalApprovedAmount = approvedItems.reduce((sum, exp) => sum + (exp.approvedAmount || 0), 0);
    const totalBudgetAmount = approvedItems.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    
    event.claimBill.totalApprovedAmount = totalApprovedAmount;
    event.claimBill.totalBudgetAmount = totalBudgetAmount;
    event.claimBill.totalExpenditure = totalApprovedAmount;
    
    console.log(`\n  💰 Updated totals: approved=${totalApprovedAmount}, budget=${totalBudgetAmount}`);
    
    // Save changes
    event.markModified('claimBill');
    await event.save();
    
    console.log(`\n✅ Event fixed successfully!`);
    console.log(`📊 Summary: ${itemsFixed} amount fields fixed`);
    
  } catch (error) {
    console.error('❌ Error fixing specific event:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  await connectDB();
  
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === '--event-id' && args[1]) {
    // Fix specific event
    await fixSpecificEvent(args[1]);
  } else {
    // Fix all events
    await fixAmountFields();
  }
  
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

export { fixAmountFields, fixSpecificEvent };