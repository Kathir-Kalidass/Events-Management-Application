import User from '../models/userModel.js';

/**
 * Fetch HOD information from database
 * @returns {Object} HOD information with name and department
 */
export const fetchHODInfo = async () => {
  try {
    // Try to find HOD from User collection
    const hod = await User.findOne({ 
      role: 'hod',
      department: { $regex: /computer science|cse|dcse/i }
    });
    
    if (hod) {
      return {
        name: hod.name,
        department: hod.department || 'Department of Computer Science and Engineering'
      };
    }
    
    // Fallback: try to find from organizing committee
    try {
      const ConvenorCommittee = await import('../models/convenorCommitteeModel.js');
      const hodFromCommittee = await ConvenorCommittee.default.findOne({
        role: { $regex: /head of department|hod/i },
        department: { $regex: /computer science|cse|dcse/i }
      });
      
      if (hodFromCommittee) {
        return {
          name: hodFromCommittee.name,
          department: hodFromCommittee.department || 'Department of Computer Science and Engineering'
        };
      }
    } catch (error) {
      console.log('ConvenorCommittee model not available, using fallback');
    }
    
    // Final fallback
    return {
      name: process.env.DEPARTMENT_HEAD || "Dr. N. Sairam",
      department: 'Department of Computer Science and Engineering'
    };
  } catch (error) {
    console.error('Error fetching HOD info:', error);
    return {
      name: "Dr. N. Sairam",
      department: 'Department of Computer Science and Engineering'
    };
  }
};

/**
 * Create an HOD user if none exists
 * @param {Object} hodData - HOD information
 * @returns {Object} Created or existing HOD user
 */
export const ensureHODExists = async (hodData = {}) => {
  try {
    // Check if HOD already exists
    let hod = await User.findOne({ 
      role: 'hod',
      department: { $regex: /computer science|cse|dcse/i }
    });
    
    if (hod) {
      return hod;
    }
    
    // Create default HOD if none exists
    const defaultHODData = {
      name: hodData.name || process.env.DEPARTMENT_HEAD || "Dr. N. Sairam",
      email: hodData.email || "hod.cse@annauniv.edu",
      role: 'hod',
      department: hodData.department || 'Department of Computer Science and Engineering',
      institution: 'Anna University',
      password: hodData.password || 'hod123' // Default password
    };
    
    hod = new User(defaultHODData);
    await hod.save();
    
    console.log(`✅ Created HOD user: ${hod.name}`);
    return hod;
  } catch (error) {
    console.error('Error ensuring HOD exists:', error);
    throw error;
  }
};

export default {
  fetchHODInfo,
  ensureHODExists
};