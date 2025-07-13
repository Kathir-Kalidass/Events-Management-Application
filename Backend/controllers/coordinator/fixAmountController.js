import Event from "../../models/eventModel.js";
import asyncHandler from "express-async-handler";
import { syncAmountFields, syncClaimBill } from "../../utils/amountSyncHelper.js";

// Fix amount fields for a specific event
export const fixEventAmountFields = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if claim bill exists
    if (!event.claimBill || !event.claimBill.expenses) {
      return res.status(404).json({ message: "No claim bill found" });
    }

    // Sync all amount fields using the helper
    syncClaimBill(event.claimBill);

    // Also update budget breakdown to show only approved items
    if (event.budgetBreakdown && event.budgetBreakdown.expenses) {
      const approvedItems = event.claimBill.expenses.filter(item => item.itemStatus === 'approved');
      
      // Create new budget breakdown with ONLY approved items
      const approvedBudgetExpenses = approvedItems.map(item => ({
        category: item.category,
        amount: item.approvedAmount || item.actualAmount || item.amount || 0
      }));

      event.budgetBreakdown.expenses = approvedBudgetExpenses;
      event.budgetBreakdown.totalExpenditure = approvedBudgetExpenses.reduce(
        (sum, exp) => sum + (exp.amount || 0), 0
      );

    }

    // Mark as modified and save
    event.markModified('claimBill');
    event.markModified('budgetBreakdown');
    await event.save();

    // Prepare response data
    const fixedItems = event.claimBill.expenses.map((item, index) => ({
      index,
      category: item.category,
      itemStatus: item.itemStatus,
      amount: item.amount,
      actualAmount: item.actualAmount,
      budgetAmount: item.budgetAmount,
      approvedAmount: item.approvedAmount,
      allSynchronized: item.itemStatus === 'approved' ? 
        (item.amount === item.actualAmount && item.actualAmount === item.budgetAmount && item.budgetAmount === item.approvedAmount) :
        item.itemStatus === 'rejected' ?
        (item.amount === 0 && item.actualAmount === 0 && item.budgetAmount === 0 && item.approvedAmount === 0) :
        true // pending items
    }));

    res.json({
      message: "Amount fields fixed successfully",
      eventId: event._id,
      eventTitle: event.title,
      totalItems: event.claimBill.expenses.length,
      approvedItems: event.claimBill.expenses.filter(item => item.itemStatus === 'approved').length,
      rejectedItems: event.claimBill.expenses.filter(item => item.itemStatus === 'rejected').length,
      pendingItems: event.claimBill.expenses.filter(item => item.itemStatus === 'pending').length,
      totalApprovedAmount: event.claimBill.totalApprovedAmount,
      totalBudgetAmount: event.claimBill.totalBudgetAmount,
      totalExpenditure: event.claimBill.totalExpenditure,
      fixedItems: fixedItems,
      budgetBreakdown: event.budgetBreakdown
    });

  } catch (error) {
    console.error('Error fixing amount fields:', error);
    res.status(500).json({
      message: 'Error fixing amount fields',
      error: error.message
    });
  }
});

// Fix amount fields for all events
export const fixAllEventsAmountFields = asyncHandler(async (req, res) => {
  try {

    // Find all events with claim bills
    const events = await Event.find({
      'claimBill.expenses': { $exists: true, $ne: [] }
    });

    let fixedEvents = 0;
    let totalItemsFixed = 0;
    const fixResults = [];

    for (const event of events) {

      let eventFixed = false;
      let itemsFixed = 0;

      // Sync all amount fields
      const beforeSync = JSON.parse(JSON.stringify(event.claimBill.expenses));
      syncClaimBill(event.claimBill);

      // Check what was fixed
      event.claimBill.expenses.forEach((item, index) => {
        const before = beforeSync[index];
        if (before.amount !== item.amount || 
            before.actualAmount !== item.actualAmount || 
            before.budgetAmount !== item.budgetAmount || 
            before.approvedAmount !== item.approvedAmount) {
          itemsFixed++;
          eventFixed = true;
        }
      });

      // Update budget breakdown
      if (event.budgetBreakdown && event.budgetBreakdown.expenses) {
        const approvedItems = event.claimBill.expenses.filter(item => item.itemStatus === 'approved');
        const approvedBudgetExpenses = approvedItems.map(item => ({
          category: item.category,
          amount: item.approvedAmount || item.actualAmount || item.amount || 0
        }));

        event.budgetBreakdown.expenses = approvedBudgetExpenses;
        event.budgetBreakdown.totalExpenditure = approvedBudgetExpenses.reduce(
          (sum, exp) => sum + (exp.amount || 0), 0
        );
      }

      if (eventFixed) {
        event.markModified('claimBill');
        event.markModified('budgetBreakdown');
        await event.save();
        fixedEvents++;
        totalItemsFixed += itemsFixed;

        fixResults.push({
          eventId: event._id,
          eventTitle: event.title,
          itemsFixed: itemsFixed,
          totalApprovedAmount: event.claimBill.totalApprovedAmount
        });

      } else {

      }
    }

    res.json({
      message: "Amount fields fixed for all events",
      totalEvents: events.length,
      fixedEvents: fixedEvents,
      totalItemsFixed: totalItemsFixed,
      fixResults: fixResults
    });

  } catch (error) {
    console.error('Error fixing amount fields for all events:', error);
    res.status(500).json({
      message: 'Error fixing amount fields for all events',
      error: error.message
    });
  }
});

// Get amount field status for a specific event
export const getAmountFieldStatus = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if claim bill exists
    if (!event.claimBill || !event.claimBill.expenses) {
      return res.status(404).json({ message: "No claim bill found" });
    }

    // Check each item's amount field synchronization
    const itemsStatus = event.claimBill.expenses.map((item, index) => {
      let expectedAmount = 0;
      let needsFix = false;

      if (item.itemStatus === 'approved') {
        expectedAmount = item.approvedAmount || item.actualAmount || item.budgetAmount || 0;
        needsFix = item.amount !== expectedAmount ||
                   item.actualAmount !== expectedAmount ||
                   item.budgetAmount !== expectedAmount ||
                   item.approvedAmount !== expectedAmount;
      } else if (item.itemStatus === 'rejected') {
        expectedAmount = 0;
        needsFix = item.amount !== 0 ||
                   item.actualAmount !== 0 ||
                   item.budgetAmount !== 0 ||
                   item.approvedAmount !== 0;
      } else {
        expectedAmount = item.actualAmount || item.budgetAmount || item.amount || 0;
        needsFix = item.amount !== expectedAmount ||
                   item.actualAmount !== expectedAmount ||
                   item.budgetAmount !== expectedAmount ||
                   item.approvedAmount !== 0;
      }

      return {
        index: index,
        category: item.category,
        status: item.itemStatus,
        currentAmount: item.amount,
        expectedAmount: expectedAmount,
        actualAmount: item.actualAmount,
        budgetAmount: item.budgetAmount,
        approvedAmount: item.approvedAmount,
        needsFix: needsFix,
        allSynchronized: !needsFix
      };
    });

    const itemsNeedingFix = itemsStatus.filter(item => item.needsFix);

    res.json({
      eventId: event._id,
      eventTitle: event.title,
      totalItems: event.claimBill.expenses.length,
      itemsNeedingFix: itemsNeedingFix.length,
      allSynchronized: itemsNeedingFix.length === 0,
      itemsStatus: itemsStatus,
      summary: {
        approved: itemsStatus.filter(item => item.status === 'approved').length,
        rejected: itemsStatus.filter(item => item.status === 'rejected').length,
        pending: itemsStatus.filter(item => item.status === 'pending').length,
        needsFix: itemsNeedingFix.length
      }
    });

  } catch (error) {
    console.error('Error checking amount field status:', error);
    res.status(500).json({
      message: 'Error checking amount field status',
      error: error.message
    });
  }
});

export default { fixEventAmountFields, fixAllEventsAmountFields, getAmountFieldStatus };