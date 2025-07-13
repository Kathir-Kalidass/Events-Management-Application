import event from "../../models/eventModel.js";
import ConvenorCommittee from "../../models/convenorCommitteeModel.js";

// Create a new training programme
export const createProgramme = async (req, res) => {
  try {
    if (!req.body.title || !req.body.startDate || !req.body.endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const programme = new event({
      title: req.body.title,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      venue: req.body.venue,
      mode: req.body.mode || "Online",
      duration: req.body.duration,
      type: req.body.type,
      objectives: req.body.objectives,
      outcomes: req.body.outcomes,
      budget: Number(req.body.budget) || 0,
      coordinators: JSON.parse(req.body.coordinators || "[]"),
      targetAudience: JSON.parse(req.body.targetAudience || "[]"),
      resourcePersons: JSON.parse(req.body.resourcePersons || "[]"),
      approvers: JSON.parse(req.body.approvers || "[]"),
      budgetBreakdown: JSON.parse(req.body.budgetBreakdown || "{}"),
      // Handle organizing departments
      organizingDepartments: JSON.parse(req.body.organizingDepartments || '{"primary":"DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING","associative":[]}'),
      // Handle department approvers
      departmentApprovers: JSON.parse(req.body.departmentApprovers || '[{"department":"DCSE","hodName":"","hodDesignation":"HOD of DCSE","approved":false,"approvedDate":null,"signature":""}]'),
      // Handle registration procedure
      registrationProcedure: JSON.parse(req.body.registrationProcedure || '{"enabled":false}'),
      createdBy: req.body.createdBy,
      reviewedBy: req.body.reviewedBy,
    });

    if (req.file) {
      programme.brochure = {
        fileName: req.file.filename,
        filePath: req.file.path,
        contentType: req.file.mimetype,
      };
    }

    const savedProgramme = await programme.save();
    res.status(201).json(savedProgramme);
  } catch (error) {
    console.error("❌ Error creating programme:", error);
    res.status(500).json({
      message: "Error creating programme",
      error: error.message,
    });
  }
};

// Get all programmes for the current coordinator
export const getProgrammes = async (req, res) => {
  try {
    // For now, show all events to all coordinators
    // You can modify this logic later if you want to restrict access
    let query = {};
    
    // Optional: If you want to filter by coordinator, uncomment the following:
    // if (req.user && req.user._id && req.user.role === 'coordinator') {
    //   query.createdBy = req.user._id;
    // }

    const programmes = await event
      .find(query)
      .select("-brochure")
      .populate('createdBy', 'name email role')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${programmes.length} programmes for user ${req.user?.name || 'anonymous'} (role: ${req.user?.role || 'none'})`);

    res.json(programmes);
  } catch (error) {
    console.error("❌ Error fetching programmes:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ FIXED: Get single programme by ID with proper expense synchronization for editing
export const getProgrammeById = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    // Fetch organizing committee data
    const organizingCommittee = await ConvenorCommittee.find({ 
      isActive: true
    }).sort({ 
      roleCategory: 1, 
      role: 1,
      createdAt: -1 
    });

    // ✅ CRITICAL FIX: Proper expense synchronization for editing
    let programmeData = programme.toObject();
    
    // Determine which expenses to use for editing (priority: claim bill > budget breakdown)
    let expensesToUse = [];
    let sourceOfExpenses = 'none';
    
    if (programme.claimBill?.expenses && Array.isArray(programme.claimBill.expenses) && programme.claimBill.expenses.length > 0) {
      expensesToUse = programme.claimBill.expenses;
      sourceOfExpenses = 'claimBill';

    } else if (programme.budgetBreakdown?.expenses && Array.isArray(programme.budgetBreakdown.expenses) && programme.budgetBreakdown.expenses.length > 0) {
      expensesToUse = programme.budgetBreakdown.expenses;
      sourceOfExpenses = 'budgetBreakdown';

    }
    
    // ✅ IMPORTANT: Ensure both budgetBreakdown and claimBill have the same expenses for editing
    if (expensesToUse.length > 0) {
      // Ensure budget breakdown exists
      if (!programmeData.budgetBreakdown) {
        programmeData.budgetBreakdown = {};
      }
      
      // Calculate total expenditure
      const totalExpenditure = expensesToUse.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      
      // Update budget breakdown with the most current expenses
      programmeData.budgetBreakdown.expenses = expensesToUse;
      programmeData.budgetBreakdown.totalExpenditure = totalExpenditure;
      
      // If claim bill exists, ensure it also has the same expenses
      if (programmeData.claimBill) {
        programmeData.claimBill.expenses = expensesToUse;
        programmeData.claimBill.totalExpenditure = totalExpenditure;
      }
      
      // Add metadata for debugging
      programmeData.budgetBreakdown.expenseSource = sourceOfExpenses;

    }

    // Add organizing committee to the response
    const programmeWithCommittee = {
      ...programmeData,
      organizingCommittee
    };

    res.json(programmeWithCommittee);
  } catch (error) {
    console.error("❌ Error fetching programme:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete programme
export const deleteProgramme = async (req, res) => {
  try {
    const programme = await event.findById(req.params.id);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }
    await programme.deleteOne();
    res.json({ message: "Programme removed" });
  } catch (error) {
    console.error("❌ Error deleting programme:", error);
    res.status(500).json({ message: "Server Error" });
  }
};