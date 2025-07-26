import User from '../../../shared/models/userModel.js';
import event from '../../../shared/models/eventModel.js';

// Get profile statistics
export const getProfileStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await event.find({ createdBy: userId });
    
    const stats = {
      totalEvents: events.length,
      activeEvents: events.filter(e => new Date(e.endDate) > new Date()).length,
      completedEvents: events.filter(e => new Date(e.endDate) <= new Date()).length,
      totalParticipants: events.reduce((sum, e) => sum + (e.participants?.length || 0), 0)
    };
    
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching profile stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch profile stats', 
      error: error.message 
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;
    
    console.log('📝 Profile update request:', { userId, updateData });
    
    // Validate required fields
    if (!updateData.name || !updateData.email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updateData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if email is already taken by another user
    if (updateData.email !== req.user.email) {
      const existingUser = await User.findOne({ 
        email: updateData.email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already in use by another account'
        });
      }
    }
    
    // Validate and sanitize update data
    const allowedFields = [
      'name', 'email', 'phone', 'designation', 'department', 
      'employeeId', 'joiningDate', 'address', 'bio', 
      'specializations', 'qualifications', 'preferences'
    ];
    
    const sanitizedData = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        sanitizedData[key] = updateData[key];
      }
    });
    
    console.log('🧹 Sanitized update data:', sanitizedData);
    
    // Handle date fields properly
    if (sanitizedData.joiningDate) {
      try {
        sanitizedData.joiningDate = new Date(sanitizedData.joiningDate);
        if (isNaN(sanitizedData.joiningDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid joining date format'
          });
        }
      } catch (dateError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid joining date format'
        });
      }
    }
    
    // Handle empty strings as null for optional fields
    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === '' && key !== 'name' && key !== 'email') {
        sanitizedData[key] = null;
      }
    });

    // Validate phone number if provided
    if (sanitizedData.phone && sanitizedData.phone.trim() !== '') {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(sanitizedData.phone.replace(/[\s\-\(\)]/g, ''))) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid phone number'
        });
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: sanitizedData },
      { 
        new: true, 
        runValidators: true,
        upsert: false
      }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    console.log('✅ Profile updated successfully:', updatedUser.name);
    
    res.json({ 
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} is already in use`
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile', 
      error: error.message
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true,
      user: user 
    });
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch profile', 
      error: error.message 
    });
  }
};