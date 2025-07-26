import User from '../../../shared/models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Admin login controller
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists and is admin
    const admin = await User.findOne({ 
      email, 
      role: 'admin' 
    });

    if (!admin) {
      return res.status(401).json({ 
        message: "Invalid admin credentials" 
      });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: "Invalid admin credentials" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        role: admin.role,
        email: admin.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Admin login successful",
      role: admin.role,
      name: admin.name,
      email: admin.email,
      _id: admin._id,
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      message: "Admin login error", 
      error: error.message 
    });
  }
};

// Create default admin if none exists
export const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      const defaultAdmin = new User({
        name: 'System Administrator',
        email: 'admin@university.edu',
        role: 'admin',
        password: 'admin123', // This will be hashed by the pre-save middleware
        department: 'Administration',
        institution: 'Anna University'
      });

      await defaultAdmin.save();
      console.log('Default admin created successfully');
      return defaultAdmin;
    }
    
    return existingAdmin;
  } catch (error) {
    console.error('Error creating default admin:', error);
    throw error;
  }
};

// Get admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select('-password');
    
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ 
      message: "Error fetching admin profile", 
      error: error.message 
    });
  }
};