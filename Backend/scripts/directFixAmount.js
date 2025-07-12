// Direct MongoDB update to fix amount fields
// Run this in MongoDB Compass or MongoDB shell

// Update the specific event to fix amount fields
db.events.updateOne(
  { _id: ObjectId("68711b54ee0db388140ae41e") },
  {
    $set: {
      // Fix tea item (index 0) - set amount to match approved amount
      "claimBill.expenses.0.amount": 2500,
      
      // Fix food item (index 1) - set amount to match approved amount  
      "claimBill.expenses.1.amount": 2030,
      
      // Update totals to reflect correct amounts
      "claimBill.totalBudgetAmount": 4530, // 2500 + 2030
      "claimBill.totalExpenditure": 4530,
      "claimBill.totalApprovedAmount": 4530
    }
  }
);

// Verify the update
db.events.findOne(
  { _id: ObjectId("68711b54ee0db388140ae41e") },
  { 
    "claimBill.expenses": 1,
    "claimBill.totalBudgetAmount": 1,
    "claimBill.totalExpenditure": 1,
    "claimBill.totalApprovedAmount": 1
  }
);