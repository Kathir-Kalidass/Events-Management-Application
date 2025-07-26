import event from "../../../shared/models/eventModel.js";

// ✅ ENHANCED: Handle claim bill submission with proper synchronization including income
export const handleClaimBillSubmission = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    const { expenses, income } = req.body;

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

    // Calculate total income if provided
    let totalClaimIncome = 0;
    if (income && Array.isArray(income)) {
      totalClaimIncome = income.reduce(
        (sum, i) => sum + Number(i.income || 0),
        0
      );
    }

    // ✅ FIXED: Update claim bill - preserve existing approval status
    const existingCreatedAt = programme.claimBill?.createdAt;
    const existingExpenses = programme.claimBill?.expenses || [];
    
    programme.claimBill = {
      expenses: expenses.map(expense => {
        // Find existing expense with same category to preserve approval status
        const existingExpense = existingExpenses.find(existing => 
          existing.category === expense.category
        );
        
        if (existingExpense && existingExpense.itemStatus === 'approved') {
          // Preserve approved expense data, only update amounts if needed
          return {
            ...existingExpense,
            budgetAmount: Number(expense.amount || 0),
            actualAmount: Number(expense.amount || 0),
            amount: Number(expense.amount || 0),
            // Keep existing approval data
            approvedAmount: existingExpense.approvedAmount,
            itemStatus: existingExpense.itemStatus,
            reviewDate: existingExpense.reviewDate,
            reviewedBy: existingExpense.reviewedBy,
            receiptNumber: existingExpense.receiptNumber,
            receiptGenerated: existingExpense.receiptGenerated,
            rejectionReason: existingExpense.rejectionReason,
            description: expense.description || existingExpense.description || `Expense for ${expense.category}`
          };
        } else if (existingExpense && existingExpense.itemStatus === 'rejected') {
          // Preserve rejected expense data, only update amounts
          return {
            ...existingExpense,
            budgetAmount: Number(expense.amount || 0),
            actualAmount: Number(expense.amount || 0),
            amount: Number(expense.amount || 0),
            description: expense.description || existingExpense.description || `Expense for ${expense.category}`
          };
        } else {
          // New expense or pending expense - set as pending
          return {
            category: expense.category,
            budgetAmount: Number(expense.amount || 0),
            actualAmount: Number(expense.amount || 0),
            amount: Number(expense.amount || 0),
            approvedAmount: 0,
            description: expense.description || `Expense for ${expense.category}`,
            itemStatus: 'pending',
            rejectionReason: '',
            receiptNumber: null,
            receiptGenerated: false,
            reviewDate: null,
            reviewedBy: null
          };
        }
      }),
      totalExpenditure: totalClaimExpenditure,
      totalApprovedAmount: existingExpenses
        .filter(exp => exp.itemStatus === 'approved')
        .reduce((sum, exp) => sum + (exp.approvedAmount || 0), 0),
      status: programme.claimBill?.status || 'pending',
      claimSubmitted: true,
      createdAt: existingCreatedAt || new Date(),
      updatedAt: new Date()
    };

    // ✅ CRITICAL: Synchronize budget breakdown with claim bill including income
    if (programme.budgetBreakdown) {
      // Update the main budget breakdown with actual claim expenses
      programme.budgetBreakdown.expenses = expenses;
      programme.budgetBreakdown.totalExpenditure = totalClaimExpenditure;
      
      // Update income if provided
      if (income && Array.isArray(income)) {
        programme.budgetBreakdown.income = income;
        programme.budgetBreakdown.totalIncome = totalClaimIncome;
        
        // Recalculate university overhead (30% of total income)
        programme.budgetBreakdown.universityOverhead = totalClaimIncome * 0.3;
      }
      
      // Recalculate total expenditure including university overhead if it exists
      if (programme.budgetBreakdown.universityOverhead) {
        programme.budgetBreakdown.totalExpenditure = totalClaimExpenditure + Number(programme.budgetBreakdown.universityOverhead);
      }
    } else {
      // Create budget breakdown if it doesn't exist
      const universityOverhead = totalClaimIncome * 0.3;
      
      programme.budgetBreakdown = {
        expenses,
        totalExpenditure: totalClaimExpenditure + universityOverhead,
        income: income || [],
        totalIncome: totalClaimIncome,
        universityOverhead: universityOverhead
      };
    }

    await programme.save();

    res.status(200).json({ 
      message: "Claim bill with income stored and synchronized successfully", 
      claimTotalExpenditure: programme.claimBill.totalExpenditure,
      budgetTotalExpenditure: programme.budgetBreakdown.totalExpenditure,
      totalIncome: programme.budgetBreakdown.totalIncome,
      universityOverhead: programme.budgetBreakdown.universityOverhead,
      claimExpenses: expenses,
      incomeData: income || []
    });
  } catch (error) {
    console.error("❌ Error submitting claim bill:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ ENHANCED: Get programme with proper expense and income data for claim section
export const getProgrammeForClaim = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    // ✅ Determine which expenses to use for claim section (priority: claim bill > budget breakdown)
    let availableExpenses = [];
    let availableIncome = [];
    let expenseSource = 'none';
    
    if (programme.claimBill?.expenses && Array.isArray(programme.claimBill.expenses) && programme.claimBill.expenses.length > 0) {
      availableExpenses = programme.claimBill.expenses;
      expenseSource = 'claimBill';
    } else if (programme.budgetBreakdown?.expenses && Array.isArray(programme.budgetBreakdown.expenses) && programme.budgetBreakdown.expenses.length > 0) {
      availableExpenses = programme.budgetBreakdown.expenses;
      expenseSource = 'budgetBreakdown';
    }

    // Get income data from budget breakdown
    if (programme.budgetBreakdown?.income && Array.isArray(programme.budgetBreakdown.income)) {
      availableIncome = programme.budgetBreakdown.income;
    }

    const responseData = {
      ...programme.toObject(),
      availableExpenses,
      availableIncome,
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