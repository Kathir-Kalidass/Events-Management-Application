import ConvenorCommittee from "../../models/convenorCommitteeModel.js";

// Initialize default organizing committee
export const initializeOrganizingCommittee = async (req, res) => {
  try {
    // Check if organizing committee already exists
    const existingMembers = await ConvenorCommittee.find({ isActive: true });
    
    if (existingMembers.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Organizing committee already exists",
        data: existingMembers
      });
    }

    console.log("🏛️ Initializing default organizing committee...");
    
    const defaultMembers = [
      {
        name: "Vice-Chancellor",
        designation: "Vice-Chancellor",
        department: "Anna University",
        role: "Vice-Chancellor",
        roleCategory: "ADMINISTRATION",
        isDefault: true,
        isActive: true,
        description: "Chief executive of the university"
      },
      {
        name: "Registrar",
        designation: "Registrar",
        department: "Anna University",
        role: "Registrar",
        roleCategory: "ADMINISTRATION",
        isDefault: true,
        isActive: true,
        description: "Administrative head of the university"
      },
      {
        name: "Dean",
        designation: "Dean",
        department: "College of Engineering, Guindy",
        role: "Dean",
        roleCategory: "ACADEMIC",
        isDefault: true,
        isActive: true,
        description: "Academic head of the college"
      },
      {
        name: "Chairman",
        designation: "Chairman",
        department: "Convenor Committee",
        role: "Chairman",
        roleCategory: "ORGANIZING",
        isDefault: true,
        isActive: true,
        description: "Chairman of the convenor committee"
      },
      {
        name: "Head of Department",
        designation: "Head of Department",
        department: "Department of Computer Science and Engineering",
        role: "Head of Department",
        roleCategory: "ACADEMIC",
        isDefault: true,
        isActive: true,
        description: "Head of the organizing department"
      }
    ];

    const createdMembers = await ConvenorCommittee.insertMany(defaultMembers);
    
    console.log("✅ Created default organizing committee members:", createdMembers.length);
    
    // Log each created member
    createdMembers.forEach(member => {
      console.log(`📋 Created: ${member.role} - ${member.name} (${member.roleCategory})`);
    });

    res.status(201).json({
      success: true,
      message: "Default organizing committee initialized successfully",
      data: createdMembers
    });
    
  } catch (error) {
    console.error("❌ Error initializing organizing committee:", error);
    res.status(500).json({
      success: false,
      message: "Error initializing organizing committee",
      error: error.message
    });
  }
};

// Get all organizing committee members
export const getOrganizingCommittee = async (req, res) => {
  try {
    const members = await ConvenorCommittee.find({ isActive: true })
      .sort({ 
        roleCategory: 1, 
        role: 1,
        createdAt: -1 
      });

    console.log("📋 Fetched organizing committee members:", members.length);
    
    // Log each member for debugging
    members.forEach(member => {
      console.log(`📋 Member: ${member.role} - ${member.name} (${member.roleCategory})`);
    });

    res.status(200).json({
      success: true,
      data: members
    });
    
  } catch (error) {
    console.error("❌ Error fetching organizing committee:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching organizing committee",
      error: error.message
    });
  }
};

// Add a new organizing committee member
export const addOrganizingCommitteeMember = async (req, res) => {
  try {
    const { name, designation, department, role, roleCategory, description } = req.body;

    // Validate required fields
    if (!name || !designation || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, designation, and role are required"
      });
    }

    // Auto-determine role category if not provided
    let finalRoleCategory = roleCategory;
    if (!finalRoleCategory) {
      const adminRoles = ['Vice-Chancellor', 'Pro-Vice-Chancellor', 'Registrar', 'Controller of Examinations', 'Finance Officer'];
      const academicRoles = ['Dean', 'Associate Dean', 'Head of Department', 'Associate Head of Department'];
      const organizingRoles = ['Chairman', 'Vice-Chairman', 'Secretary', 'Joint Secretary', 'Treasurer', 'Convener', 'Co-Convener'];
      
      if (adminRoles.includes(role)) finalRoleCategory = 'ADMINISTRATION';
      else if (academicRoles.includes(role)) finalRoleCategory = 'ACADEMIC';
      else if (organizingRoles.includes(role)) finalRoleCategory = 'ORGANIZING';
      else finalRoleCategory = 'COMMITTEE';
    }

    const newMember = new ConvenorCommittee({
      name,
      designation,
      department: department || 'Anna University',
      role,
      roleCategory: finalRoleCategory,
      description: description || '',
      isDefault: false,
      isActive: true
    });

    await newMember.save();
    
    console.log(`✅ Added organizing committee member: ${role} - ${name} (${finalRoleCategory})`);

    res.status(201).json({
      success: true,
      message: "Organizing committee member added successfully",
      data: newMember
    });
    
  } catch (error) {
    console.error("❌ Error adding organizing committee member:", error);
    res.status(500).json({
      success: false,
      message: "Error adding organizing committee member",
      error: error.message
    });
  }
};

// Update an organizing committee member
export const updateOrganizingCommitteeMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, department, role, roleCategory, description, isActive } = req.body;

    const member = await ConvenorCommittee.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Organizing committee member not found"
      });
    }

    // Update fields
    if (name) member.name = name;
    if (designation) member.designation = designation;
    if (department) member.department = department;
    if (role) member.role = role;
    if (roleCategory) member.roleCategory = roleCategory;
    if (description !== undefined) member.description = description;
    if (typeof isActive === 'boolean') member.isActive = isActive;

    await member.save();
    
    console.log(`✅ Updated organizing committee member: ${member.role} - ${member.name}`);

    res.status(200).json({
      success: true,
      message: "Organizing committee member updated successfully",
      data: member
    });
    
  } catch (error) {
    console.error("❌ Error updating organizing committee member:", error);
    res.status(500).json({
      success: false,
      message: "Error updating organizing committee member",
      error: error.message
    });
  }
};

// Delete (deactivate) an organizing committee member
export const deleteOrganizingCommitteeMember = async (req, res) => {
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
    
    console.log(`✅ Deactivated organizing committee member: ${member.role} - ${member.name}`);

    res.status(200).json({
      success: true,
      message: "Organizing committee member deleted successfully"
    });
    
  } catch (error) {
    console.error("❌ Error deleting organizing committee member:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting organizing committee member",
      error: error.message
    });
  }
};