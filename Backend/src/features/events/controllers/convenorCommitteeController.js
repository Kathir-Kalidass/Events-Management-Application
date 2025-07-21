import ConvenorCommittee from "../../../shared/models/convenorCommitteeModel.js";

// Get all convenor committee members
export const getConvenorCommitteeMembers = async (req, res) => {
  try {
    const members = await ConvenorCommittee.find({ isActive: true })
      .populate('createdBy', 'name email')
      .lean(); // Use lean for better performance

    // Define display order for roles
    const displayOrder = [
      "Chief Patron", "Patron", "Co-Patron",
      "Vice-Chancellor", "Pro-Vice-Chancellor", "Registrar", "Controller of Examinations", "Finance Officer",
      "Dean", "Associate Dean", "Head of Department", "Associate Head of Department",
      "Chairman", "Vice-Chairman", "Secretary", "Joint Secretary", "Treasurer", "Convener", "Co-Convener",
      "Coordinator", "Co-Coordinator", "Technical Coordinator", "Program Coordinator", "Registration Coordinator",
      "Member", "Student Member", "External Member"
    ];

    // Sort members by display order, then by creation date
    const sortedMembers = members.sort((a, b) => {
      const aIndex = displayOrder.indexOf(a.role);
      const bIndex = displayOrder.indexOf(b.role);
      
      // If roles are in display order, sort by that
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only one role is in display order, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // If neither role is in display order, sort alphabetically by role
      if (a.role !== b.role) {
        return a.role.localeCompare(b.role);
      }
      
      // If roles are the same, sort by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({
      success: true,
      data: sortedMembers
    });
  } catch (error) {
    console.error("Error fetching organizing committee members:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching organizing committee members",
      error: error.message
    });
  }
};

// Add a new convenor committee member
export const addConvenorCommitteeMember = async (req, res) => {
  try {
    const { name, designation, department, role, roleCategory, description, isDefault } = req.body;

    // Validate required fields
    if (!name || !designation || !department) {
      return res.status(400).json({
        success: false,
        message: "Name, designation, and department are required"
      });
    }

    // Define roles that can only have one instance
    const singleInstanceRoles = [
      'Chief Patron', 'Vice-Chancellor', 'Registrar', 'Chairman'
    ];

    // Check if this is a single-instance role and if one already exists
    if (singleInstanceRoles.includes(role)) {
      const existingRole = await ConvenorCommittee.findOne({ 
        role: role, 
        isActive: true 
      });
      
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: `A ${role} already exists. Please update the existing ${role} or set their status to inactive.`
        });
      }
    }

    // Auto-determine role category if not provided
    let finalRoleCategory = roleCategory;
    if (!finalRoleCategory) {
      const patronRoles = ['Chief Patron', 'Patron', 'Co-Patron'];
      const adminRoles = ['Vice-Chancellor', 'Pro-Vice-Chancellor', 'Registrar', 'Controller of Examinations', 'Finance Officer'];
      const academicRoles = ['Dean', 'Associate Dean', 'Head of Department', 'Associate Head of Department'];
      const organizingRoles = ['Chairman', 'Vice-Chairman', 'Secretary', 'Joint Secretary', 'Treasurer', 'Convener', 'Co-Convener'];
      const coordinationRoles = ['Coordinator', 'Co-Coordinator', 'Technical Coordinator', 'Program Coordinator', 'Registration Coordinator'];
      const committeeRoles = ['Member', 'Student Member', 'External Member', 'Industry Representative', 'Guest Member', 'Honorary Member', 'Advisory Member'];
      const externalRoles = ['Industry Expert', 'Government Official', 'Research Scholar', 'International Delegate', 'Distinguished Guest', 'Resource Person', 'Subject Matter Expert'];

      if (patronRoles.includes(role)) finalRoleCategory = 'PATRON';
      else if (adminRoles.includes(role)) finalRoleCategory = 'ADMINISTRATION';
      else if (academicRoles.includes(role)) finalRoleCategory = 'ACADEMIC';
      else if (organizingRoles.includes(role)) finalRoleCategory = 'ORGANIZING';
      else if (coordinationRoles.includes(role)) finalRoleCategory = 'COORDINATION';
      else if (externalRoles.includes(role)) finalRoleCategory = 'EXTERNAL';
      else finalRoleCategory = 'COMMITTEE';
    }

    const newMember = new ConvenorCommittee({
      name,
      designation,
      department,
      role: role || 'Member',
      roleCategory: finalRoleCategory,
      description: description || '',
      isDefault: isDefault || false,
      createdBy: req.user?.id
    });

    await newMember.save();

    const populatedMember = await ConvenorCommittee.findById(newMember._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: "Organizing committee member added successfully",
      data: populatedMember
    });
  } catch (error) {
    console.error("Error adding organizing committee member:", error);
    res.status(500).json({
      success: false,
      message: "Error adding organizing committee member",
      error: error.message
    });
  }
};

// Update a convenor committee member
export const updateConvenorCommitteeMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, department, role, roleCategory, description, isDefault, isActive } = req.body;

    const member = await ConvenorCommittee.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Organizing committee member not found"
      });
    }

    // Define roles that can only have one instance
    const singleInstanceRoles = [
      'Chief Patron', 'Vice-Chancellor', 'Registrar', 'Chairman'
    ];

    // Check if trying to set another single-instance role
    if (role && singleInstanceRoles.includes(role) && member.role !== role) {
      const existingRole = await ConvenorCommittee.findOne({ 
        role: role, 
        isActive: true,
        _id: { $ne: id }
      });
      
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: `A ${role} already exists. Please update the existing ${role} first.`
        });
      }
    }

    // Update fields
    if (name) member.name = name;
    if (designation) member.designation = designation;
    if (department) member.department = department;
    if (role) {
      member.role = role;
      
      // Auto-update role category if role changes
      const patronRoles = ['Chief Patron', 'Patron', 'Co-Patron'];
      const adminRoles = ['Vice-Chancellor', 'Pro-Vice-Chancellor', 'Registrar', 'Controller of Examinations', 'Finance Officer'];
      const academicRoles = ['Dean', 'Associate Dean', 'Head of Department', 'Associate Head of Department'];
      const organizingRoles = ['Chairman', 'Vice-Chairman', 'Secretary', 'Joint Secretary', 'Treasurer', 'Convener', 'Co-Convener'];
      const coordinationRoles = ['Coordinator', 'Co-Coordinator', 'Technical Coordinator', 'Program Coordinator', 'Registration Coordinator'];
      const committeeRoles = ['Member', 'Student Member', 'External Member', 'Industry Representative', 'Guest Member', 'Honorary Member', 'Advisory Member'];
      const externalRoles = ['Industry Expert', 'Government Official', 'Research Scholar', 'International Delegate', 'Distinguished Guest', 'Resource Person', 'Subject Matter Expert'];

      if (patronRoles.includes(role)) member.roleCategory = 'PATRON';
      else if (adminRoles.includes(role)) member.roleCategory = 'ADMINISTRATION';
      else if (academicRoles.includes(role)) member.roleCategory = 'ACADEMIC';
      else if (organizingRoles.includes(role)) member.roleCategory = 'ORGANIZING';
      else if (coordinationRoles.includes(role)) member.roleCategory = 'COORDINATION';
      else if (externalRoles.includes(role)) member.roleCategory = 'EXTERNAL';
      else member.roleCategory = 'COMMITTEE';
    }
    if (roleCategory) member.roleCategory = roleCategory;
    if (description !== undefined) member.description = description;
    if (typeof isDefault === 'boolean') member.isDefault = isDefault;
    if (typeof isActive === 'boolean') member.isActive = isActive;

    await member.save();

    const populatedMember = await ConvenorCommittee.findById(member._id)
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: "Organizing committee member updated successfully",
      data: populatedMember
    });
  } catch (error) {
    console.error("Error updating organizing committee member:", error);
    res.status(500).json({
      success: false,
      message: "Error updating organizing committee member",
      error: error.message
    });
  }
};

// Delete a convenor committee member (soft delete)
export const deleteConvenorCommitteeMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await ConvenorCommittee.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Organizing committee member not found"
      });
    }

    member.isActive = false;
    await member.save();

    res.status(200).json({
      success: true,
      message: "Organizing committee member deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting organizing committee member:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting organizing committee member",
      error: error.message
    });
  }
};

// Initialize default organizing committee structure
export const initializeDefaultCommittee = async (req, res) => {
  try {
    const defaultMembers = [
      {
        role: "Chief Patron",
        name: "Vice-Chancellor",
        designation: "Vice-Chancellor",
        department: "Anna University",
        roleCategory: "PATRON",
        isDefault: true,
        description: "Overall patron of all university events"
      },
      {
        role: "Patron",
        name: "Registrar",
        designation: "Registrar", 
        department: "Anna University",
        roleCategory: "PATRON",
        isDefault: true,
        description: "Administrative patron"
      },
      {
        role: "Dean",
        name: "Dean",
        designation: "Dean",
        department: "College of Engineering, Guindy",
        roleCategory: "ACADEMIC",
        isDefault: true,
        description: "Academic oversight"
      },
      {
        role: "Head of Department",
        name: "Head of Department",
        designation: "Head of Department",
        department: "Department of Computer Science and Engineering",
        roleCategory: "ACADEMIC", 
        isDefault: true,
        description: "Departmental leadership"
      }
    ];

    const createdMembers = [];
    
    for (const memberData of defaultMembers) {
      // Check if this default role already exists
      const existing = await ConvenorCommittee.findOne({
        role: memberData.role,
        isActive: true
      });

      if (!existing) {
        const newMember = new ConvenorCommittee({
          ...memberData,
          createdBy: req.user?.id
        });
        
        await newMember.save();
        createdMembers.push(newMember);
      }
    }

    res.status(200).json({
      success: true,
      message: `Default organizing committee initialized. ${createdMembers.length} new members added.`,
      data: createdMembers
    });
  } catch (error) {
    console.error("Error initializing default committee:", error);
    res.status(500).json({
      success: false,
      message: "Error initializing default committee",
      error: error.message
    });
  }
};

// Get available roles for organizing committee
export const getAvailableRoles = async (req, res) => {
  try {
    const roleCategories = {
      PATRON: {
        name: "Patron",
        order: 1,
        roles: ["Chief Patron", "Patron", "Co-Patron"]
      },
      ADMINISTRATION: {
        name: "Administration",
        order: 2,
        roles: ["Vice-Chancellor", "Pro-Vice-Chancellor", "Registrar", "Controller of Examinations", "Finance Officer"]
      },
      ACADEMIC: {
        name: "Academic Leadership",
        order: 3,
        roles: ["Dean", "Associate Dean", "Head of Department", "Associate Head of Department"]
      },
      ORGANIZING: {
        name: "Organizing Committee",
        order: 4,
        roles: ["Chairman", "Vice-Chairman", "Secretary", "Joint Secretary", "Treasurer", "Convener", "Co-Convener"]
      },
      COORDINATION: {
        name: "Coordination Committee",
        order: 5,
        roles: ["Coordinator", "Co-Coordinator", "Technical Coordinator", "Program Coordinator", "Registration Coordinator"]
      },
      COMMITTEE: {
        name: "Committee Members",
        order: 6,
        roles: ["Member", "Student Member", "External Member", "Industry Representative", "Guest Member", "Honorary Member", "Advisory Member"]
      },
      EXTERNAL: {
        name: "External Participants",
        order: 7,
        roles: ["Industry Expert", "Government Official", "Research Scholar", "International Delegate", "Distinguished Guest", "Resource Person", "Subject Matter Expert"]
      }
    };

    // Get currently occupied single-instance roles
    const singleInstanceRoles = [
      'Chief Patron', 'Vice-Chancellor', 'Registrar', 'Chairman'
    ];

    const occupiedRoles = await ConvenorCommittee.find({
      role: { $in: singleInstanceRoles },
      isActive: true
    }).select('role');

    const occupiedRoleNames = occupiedRoles.map(member => member.role);

    res.status(200).json({
      success: true,
      data: {
        roleCategories,
        occupiedSingleInstanceRoles: occupiedRoleNames,
        singleInstanceRoles
      }
    });
  } catch (error) {
    console.error("Error fetching available roles:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available roles",
      error: error.message
    });
  }
};
