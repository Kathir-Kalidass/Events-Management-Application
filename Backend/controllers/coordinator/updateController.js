import event from "../../models/eventModel.js";

// ✅ ENHANCED: Update programme with proper expense synchronization
export const updateProgramme = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    // Helper function to safely parse JSON
    const safeJSONParse = (jsonString, fieldName) => {
      if (!jsonString) return null;
      
      // Handle case where jsonString might be an array (due to duplicate form submissions)
      if (Array.isArray(jsonString)) {
        jsonString = jsonString[0];
      }
      
      try {
        return JSON.parse(jsonString);
      } catch (error) {
        console.error(`❌ Error parsing ${fieldName} JSON:`, error.message);
        console.error(`Raw ${fieldName} data:`, jsonString);
        throw new Error(`Invalid ${fieldName} JSON format: ${error.message}`);
      }
    };

    const {
      title,
      startDate,
      endDate,
      venue,
      mode,
      duration,
      type,
      objectives,
      outcomes,
      budget,
      coordinators,
      targetAudience,
      resourcePersons,
      registrationFees,
      approvers,
      paymentDetails,
      budgetBreakdown,
      organizingDepartments,
      departmentApprovers,
      registrationProcedure,
    } = req.body;

    programme.title = title || programme.title;
    programme.startDate = startDate ? new Date(startDate) : programme.startDate;
    programme.endDate = endDate ? new Date(endDate) : programme.endDate;
    programme.venue = venue || programme.venue;
    programme.mode = mode || programme.mode;
    programme.duration = duration || programme.duration;
    programme.type = type || programme.type;
    programme.objectives = objectives || programme.objectives;
    programme.outcomes = outcomes || programme.outcomes;
    programme.budget = budget ? Number(budget) : programme.budget;
    
    // Use safe JSON parsing for all complex fields
    programme.coordinators = coordinators
      ? safeJSONParse(coordinators, "coordinators")
      : programme.coordinators;
    programme.targetAudience = targetAudience
      ? safeJSONParse(targetAudience, "targetAudience")
      : programme.targetAudience;
    programme.resourcePersons = resourcePersons
      ? safeJSONParse(resourcePersons, "resourcePersons")
      : programme.resourcePersons;
    programme.approvers = approvers
      ? safeJSONParse(approvers, "approvers")
      : programme.approvers;

    // ✅ CRITICAL FIX: Handle budget breakdown updates with proper synchronization
    if (budgetBreakdown) {
      const newBudgetBreakdown = safeJSONParse(budgetBreakdown, "budgetBreakdown");

      // Update budget breakdown
      programme.budgetBreakdown = newBudgetBreakdown;
      
      // ✅ IMPORTANT: Synchronize with claim bill if it exists
      if (newBudgetBreakdown?.expenses && Array.isArray(newBudgetBreakdown.expenses)) {
        const newTotalExpenditure = newBudgetBreakdown.expenses.reduce(
          (sum, e) => sum + Number(e.amount || 0), 0
        );
        
        // Update budget breakdown total
        programme.budgetBreakdown.totalExpenditure = newTotalExpenditure;
        
        // ✅ CRITICAL: Update claim bill to match budget breakdown
        if (programme.claimBill) {

          programme.claimBill.expenses = newBudgetBreakdown.expenses;
          programme.claimBill.totalExpenditure = newTotalExpenditure;
          
          // Preserve claim submission status and creation date
          // programme.claimBill.claimSubmitted remains unchanged
          // programme.claimBill.createdAt remains unchanged
        } else {

          programme.claimBill = {
            expenses: newBudgetBreakdown.expenses,
            totalExpenditure: newTotalExpenditure,
            claimSubmitted: false
          };
        }
        
        // Add university overhead to budget breakdown total if it exists
        if (programme.budgetBreakdown.universityOverhead) {
          programme.budgetBreakdown.totalExpenditure += Number(programme.budgetBreakdown.universityOverhead);
        }

      }
    }

    // Handle organizing departments and department approvers
    programme.organizingDepartments = organizingDepartments
      ? safeJSONParse(organizingDepartments, "organizingDepartments")
      : programme.organizingDepartments;
    
    programme.departmentApprovers = departmentApprovers
      ? safeJSONParse(departmentApprovers, "departmentApprovers")
      : programme.departmentApprovers;

    // Handle registration procedure with safe parsing
    if (registrationProcedure) {
      programme.registrationProcedure = safeJSONParse(registrationProcedure, "registrationProcedure");
    }

    if (req.file) {
      programme.brochure = {
        fileName: req.file.filename,
        filePath: req.file.path,
        contentType: req.file.mimetype,
      };
    }

    const updatedProgramme = await programme.save();
    
    // ✅ Log the updated information for debugging

    res.json(updatedProgramme);
  } catch (error) {
    console.error("❌ Error updating programme:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};