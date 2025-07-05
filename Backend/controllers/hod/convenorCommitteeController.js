import ConvenorCommittee from "../../models/convenorCommitteeModel.js";

// Get all convenor committee members
export const getConvenorCommitteeMembers = async (req, res) => {
  try {
    const members = await ConvenorCommittee.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ role: -1, createdAt: -1 }); // Chairman first, then by creation date

    res.status(200).json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error("Error fetching convenor committee members:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching convenor committee members",
      error: error.message
    });
  }
};

// Add a new convenor committee member
export const addConvenorCommitteeMember = async (req, res) => {
  try {
    const { name, designation, department, role } = req.body;

    // Validate required fields
    if (!name || !designation || !department) {
      return res.status(400).json({
        success: false,
        message: "Name, designation, and department are required"
      });
    }

    // Check if this is a Chairman role and if one already exists
    if (role === 'Chairman') {
      const existingChairman = await ConvenorCommittee.findOne({ 
        role: 'Chairman', 
        isActive: true 
      });
      
      if (existingChairman) {
        return res.status(400).json({
          success: false,
          message: "A Chairman already exists. Please update the existing Chairman or set their status to inactive."
        });
      }
    }

    const newMember = new ConvenorCommittee({
      name,
      designation,
      department,
      role: role || 'Member',
      createdBy: req.user?.id
    });

    await newMember.save();

    const populatedMember = await ConvenorCommittee.findById(newMember._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: "Convenor committee member added successfully",
      data: populatedMember
    });
  } catch (error) {
    console.error("Error adding convenor committee member:", error);
    res.status(500).json({
      success: false,
      message: "Error adding convenor committee member",
      error: error.message
    });
  }
};

// Update a convenor committee member
export const updateConvenorCommitteeMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, department, role, isActive } = req.body;

    const member = await ConvenorCommittee.findById(id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Convenor committee member not found"
      });
    }

    // Check if trying to set another Chairman
    if (role === 'Chairman' && member.role !== 'Chairman') {
      const existingChairman = await ConvenorCommittee.findOne({ 
        role: 'Chairman', 
        isActive: true,
        _id: { $ne: id }
      });
      
      if (existingChairman) {
        return res.status(400).json({
          success: false,
          message: "A Chairman already exists. Please update the existing Chairman first."
        });
      }
    }

    // Update fields
    if (name) member.name = name;
    if (designation) member.designation = designation;
    if (department) member.department = department;
    if (role) member.role = role;
    if (typeof isActive === 'boolean') member.isActive = isActive;

    await member.save();

    const populatedMember = await ConvenorCommittee.findById(member._id)
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: "Convenor committee member updated successfully",
      data: populatedMember
    });
  } catch (error) {
    console.error("Error updating convenor committee member:", error);
    res.status(500).json({
      success: false,
      message: "Error updating convenor committee member",
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
        message: "Convenor committee member not found"
      });
    }

    member.isActive = false;
    await member.save();

    res.status(200).json({
      success: true,
      message: "Convenor committee member deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting convenor committee member:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting convenor committee member",
      error: error.message
    });
  }
};
