import event from "../../models/eventModel.js";

// ✅ ENHANCED: Handle claim bill submission with proper synchronization
export const handleClaimBillSubmission = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    const { expenses } = req.body;

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res
        .status(400)
        .json({ message: "Expenses should be a non-empty array" });
    }

    // Calculate total expenditure from claim expenses
    const totalClaimExpenditure = expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    // ✅ Update claim bill - preserve original creation date if it exists
    const existingCreatedAt = programme.claimBill?.createdAt;
    programme.claimBill = {
      expenses: expenses.map(expense => ({
        category: expense.category,
        budgetAmount: Number(expense.amount || 0),
        actualAmount: Number(expense.amount || 0),
        amount: Number(expense.amount || 0),
        approvedAmount: Number(expense.amount || 0), // ✅ AUTO-APPROVE: Set approved amount same as actual amount
        description: expense.description || `Expense for ${expense.category}`,
        itemStatus: 'approved', // ✅ AUTO-APPROVE: Coordinators don't need to approve their own items
        rejectionReason: '',
        receiptNumber: null,
        receiptGenerated: false,
        reviewDate: new Date(), // ✅ AUTO-APPROVE: Set review date to current date
        reviewedBy: req.user._id // ✅ AUTO-APPROVE: Set coordinator as reviewer (self-approval)
      })),
      totalExpenditure: totalClaimExpenditure,
      totalApprovedAmount: totalClaimExpenditure, // ✅ Set total approved amount since all items are auto-approved
      status: 'pending', // Overall status still pending for HOD review
      claimSubmitted: true,
      createdAt: existingCreatedAt || new Date(), // Only set new date if no existing date
      updatedAt: new Date() // Track when it was last updated
    };

    // ✅ CRITICAL: Synchronize budget breakdown with claim bill
    if (programme.budgetBreakdown) {

      // Update the main budget breakdown with actual claim expenses
      programme.budgetBreakdown.expenses = expenses;
      programme.budgetBreakdown.totalExpenditure = totalClaimExpenditure;
      
      // Recalculate total including university overhead if it exists
      if (programme.budgetBreakdown.universityOverhead) {
        programme.budgetBreakdown.totalExpenditure += Number(programme.budgetBreakdown.universityOverhead);
      }
    } else {
      // Create budget breakdown if it doesn't exist
      programme.budgetBreakdown = {
        expenses,
        totalExpenditure: totalClaimExpenditure
      };
    }

    await programme.save();

    res.status(200).json({ 
      message: "Claim bill stored and synchronized successfully", 
      claimTotalExpenditure: programme.claimBill.totalExpenditure,
      budgetTotalExpenditure: programme.budgetBreakdown.totalExpenditure,
      claimExpenses: expenses
    });
  } catch (error) {
    console.error("❌ Error submitting claim bill:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ ENHANCED: Get programme with proper expense data for claim section
export const getProgrammeForClaim = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    // ✅ Determine which expenses to use for claim section (priority: claim bill > budget breakdown)
    let availableExpenses = [];
    let expenseSource = 'none';
    
    if (programme.claimBill?.expenses && Array.isArray(programme.claimBill.expenses) && programme.claimBill.expenses.length > 0) {
      availableExpenses = programme.claimBill.expenses;
      expenseSource = 'claimBill';
    } else if (programme.budgetBreakdown?.expenses && Array.isArray(programme.budgetBreakdown.expenses) && programme.budgetBreakdown.expenses.length > 0) {
      availableExpenses = programme.budgetBreakdown.expenses;
      expenseSource = 'budgetBreakdown';
    }

    const responseData = {
      ...programme.toObject(),
      availableExpenses,
      expenseSource,
      hasExistingClaim: !!programme.claimBill,
      claimSubmitted: programme.claimBill?.claimSubmitted || false
    };

    res.json(responseData);
  } catch (error) {
    console.error("❌ Error fetching programme for claim:", error);
    res.status(500).json({ message: "Server Error" });
  }
};