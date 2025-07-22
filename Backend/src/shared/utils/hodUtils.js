import User from '../models/userModel.js';

/**
 * Fetch HOD information from database with signature
 * @returns {Object} HOD information with name, department, and signature
 */
export const fetchHODInfo = async () => {
  try {
    // Try to find active HOD with signature first
    let hod = await User.findOne({ 
      role: 'hod',
      isActive: true,
      'signature.isActive': true
    }).select('name department signature');
    
    // If no HOD with active signature, try any active HOD
    if (!hod) {
      hod = await User.findOne({ 
        role: 'hod',
        isActive: true
      }).select('name department signature');
    }
    
    // If still no active HOD, try any HOD
    if (!hod) {
      hod = await User.findOne({ 
        role: 'hod'
      }).select('name department signature');
    }
    
    if (hod) {
      return {
        name: hod.name,
        department: hod.department || 'Department of Computer Science and Engineering',
        signature: hod.signature?.imageData || null,
        signatureActive: hod.signature?.isActive || false
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
          department: hodFromCommittee.department || 'Department of Computer Science and Engineering',
          signature: null,
          signatureActive: false
        };
      }
    } catch (error) {
      console.log('ConvenorCommittee model not available, using fallback');
    }
    
    // Final fallback
    return {
      name: process.env.DEPARTMENT_HEAD || "Dr. N. Sairam",
      department: 'Department of Computer Science and Engineering',
      signature: null,
      signatureActive: false
    };
  } catch (error) {
    console.error('Error fetching HOD info:', error);
    return {
      name: "Dr. N. Sairam",
      department: 'Department of Computer Science and Engineering',
      signature: null,
      signatureActive: false
    };
  }
};

/**
 * Fetch active HOD with signature for certificate generation
 * @returns {Object} Active HOD with signature information
 */
export const fetchActiveHODWithSignature = async () => {
  try {
    // Prioritize HODs with active signatures
    let hod = await User.findOne({ 
      role: 'hod',
      isActive: true,
      'signature.isActive': true
    }).select('name department signature');
    
    if (hod) {
      console.log(`✅ Found active HOD with signature: ${hod.name}`);
      return {
        name: hod.name,
        department: hod.department || 'Department of Computer Science and Engineering',
        signature: hod.signature.imageData,
        signatureActive: true
      };
    }
    
    // If no HOD with signature, find any active HOD
    hod = await User.findOne({ 
      role: 'hod',
      isActive: true 
    }).select('name department signature');
    
    if (hod) {
      console.log(`⚠️ Found active HOD without signature: ${hod.name}`);
      return {
        name: hod.name,
        department: hod.department || 'Department of Computer Science and Engineering',
        signature: hod.signature?.imageData || null,
        signatureActive: hod.signature?.isActive || false
      };
    }
    
    // Last resort: any HOD
    hod = await User.findOne({ 
      role: 'hod'
    }).select('name department signature');
    
    if (hod) {
      console.log(`⚠️ Found inactive HOD: ${hod.name}`);
      return {
        name: hod.name,
        department: hod.department || 'Department of Computer Science and Engineering',
        signature: hod.signature?.imageData || null,
        signatureActive: hod.signature?.isActive || false
      };
    }
    
    console.log(`❌ No HOD found in database, using fallback`);
    return {
      name: process.env.DEPARTMENT_HEAD || "Dr. N. Sairam",
      department: 'Department of Computer Science and Engineering',
      signature: null,
      signatureActive: false
    };
    
  } catch (error) {
    console.error('Error fetching active HOD with signature:', error);
    return {
      name: "Dr. N. Sairam",
      department: 'Department of Computer Science and Engineering',
      signature: null,
      signatureActive: false
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
  fetchActiveHODWithSignature,
  ensureHODExists
};