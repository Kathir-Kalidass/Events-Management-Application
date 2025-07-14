import event from "../../models/eventModel.js";
import ConvenorCommittee from "../../models/convenorCommitteeModel.js";

// Create a new training programme
export const createProgramme = async (req, res) => {
  try {
    if (!req.body.title || !req.body.startDate || !req.body.endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Debug: Log the problematic field
    console.log("🔍 Debugging registrationProcedure field:");
    console.log("Type:", typeof req.body.registrationProcedure);
    console.log("Value:", req.body.registrationProcedure);

    // Helper function to safely parse JSON or handle objects
    const safeJSONParse = (data, fallback = {}) => {
      try {
        // If it's already an object, return it directly
        if (typeof data === 'object' && data !== null) {
          return data;
        }
        
        // If it's a string, try to parse it
        if (typeof data === 'string') {
          if (!data || data === 'undefined' || data === 'null') {
            return fallback;
          }
          return JSON.parse(data);
        }
        
        // For any other type, return fallback
        return fallback;
      } catch (error) {
        console.error("❌ JSON Parse Error for:", typeof data === 'string' ? data.substring(0, 100) + "..." : data);
        console.error("❌ Error:", error.message);
        return fallback;
      }
    };

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
      coordinators: safeJSONParse(req.body.coordinators, []),
      targetAudience: safeJSONParse(req.body.targetAudience, []),
      resourcePersons: safeJSONParse(req.body.resourcePersons, []),
      approvers: safeJSONParse(req.body.approvers, []),
      budgetBreakdown: safeJSONParse(req.body.budgetBreakdown, {}),
      // Handle organizing departments
      organizingDepartments: safeJSONParse(req.body.organizingDepartments, {
        primary: "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING (DCSE)",
        associative: []
      }),
      // Handle department approvers
      departmentApprovers: safeJSONParse(req.body.departmentApprovers, [{
        department: "DCSE",
        hodName: "",
        hodDesignation: "HoD, DCSE & Director, CCS",
        approved: false,
        approvedDate: null,
        signature: ""
      }]),
      // Handle registration procedure with safe parsing
      registrationProcedure: safeJSONParse(req.body.registrationProcedure, { enabled: false }),
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
    const programme = await event.findById(req.params.id)
      .populate({
        path: 'organizingCommittee.member',
        model: 'ConvenorCommittee'
      });
    
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    // Fetch all available organizing committee members for selection
    const availableCommitteeMembers = await ConvenorCommittee.find({ 
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

    // Add available organizing committee members to the response
    const programmeWithCommittee = {
      ...programmeData,
      availableCommitteeMembers
    };

    res.json(programmeWithCommittee);
  } catch (error) {
    console.error("❌ Error fetching programme:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update organizing committee for an event
export const updateOrganizingCommittee = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { organizingCommittee, committeeDisplaySettings } = req.body;

    const programme = await event.findById(eventId);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    // Update organizing committee
    if (organizingCommittee) {
      programme.organizingCommittee = organizingCommittee;
    }

    // Update display settings
    if (committeeDisplaySettings) {
      programme.committeeDisplaySettings = {
        ...programme.committeeDisplaySettings,
        ...committeeDisplaySettings
      };
    }

    await programme.save();

    // Populate the committee members for response
    const updatedProgramme = await event.findById(eventId)
      .populate({
        path: 'organizingCommittee.member',
        model: 'ConvenorCommittee'
      });

    res.json({
      message: "Organizing committee updated successfully",
      organizingCommittee: updatedProgramme.organizingCommittee,
      committeeDisplaySettings: updatedProgramme.committeeDisplaySettings
    });
  } catch (error) {
    console.error("❌ Error updating organizing committee:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all available committee members
export const getAvailableCommitteeMembers = async (req, res) => {
  try {
    const members = await ConvenorCommittee.find({ isActive: true })
      .sort({ 
        roleCategory: 1, 
        role: 1,
        name: 1 
      });

    // Group by role category for easier frontend handling
    const groupedMembers = members.reduce((acc, member) => {
      const category = member.roleCategory || 'COMMITTEE';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(member);
      return acc;
    }, {});

    res.json({
      members,
      groupedMembers
    });
  } catch (error) {
    console.error("❌ Error fetching committee members:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Add new committee member
export const addCommitteeMember = async (req, res) => {
  try {
    const { name, designation, department, role, roleCategory, description } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    const newMember = new ConvenorCommittee({
      name,
      designation,
      department,
      role,
      roleCategory: roleCategory || 'COMMITTEE',
      description,
      isActive: true,
      createdBy: req.user?._id
    });

    await newMember.save();

    res.status(201).json({
      message: "Committee member added successfully",
      member: newMember
    });
  } catch (error) {
    console.error("❌ Error adding committee member:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Update registration procedure
export const updateRegistrationProcedure = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { registrationProcedure } = req.body;

    const programme = await event.findById(eventId);
    if (!programme) {
      return res.status(404).json({ message: "Programme not found" });
    }

    programme.registrationProcedure = {
      ...programme.registrationProcedure,
      ...registrationProcedure
    };

    await programme.save();

    res.json({
      message: "Registration procedure updated successfully",
      registrationProcedure: programme.registrationProcedure
    });
  } catch (error) {
    console.error("❌ Error updating registration procedure:", error);
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