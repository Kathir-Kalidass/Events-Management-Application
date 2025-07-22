import User from '../../../shared/models/userModel.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Get current user info for debugging
 * @route   GET /api/debug/user-info
 * @access  Private
 */
export const getCurrentUserInfo = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User info retrieved successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
        institution: user.institution,
        signature: user.signature ? {
          hasSignature: !!user.signature.imageData,
          fileName: user.signature.fileName,
          uploadedAt: user.signature.uploadedAt,
          isActive: user.signature.isActive,
          signatureType: user.signature.signatureType
        } : null,
        designation: user.designation,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      requestInfo: {
        userId: req.user._id,
        userRole: req.user.role,
        userName: req.user.name,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user info',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Check if user has specific role
 * @route   GET /api/debug/check-role/:role
 * @access  Private
 */
export const checkUserRole = asyncHandler(async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('name email role department isActive');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const hasRole = user.role === role;
    const isActive = user.isActive;

    res.status(200).json({
      success: true,
      message: `Role check completed for: ${role}`,
      data: {
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        currentRole: user.role,
        requestedRole: role,
        hasRole: hasRole,
        isActive: isActive,
        canAccess: hasRole && isActive,
        department: user.department
      }
    });

  } catch (error) {
    console.error('Error checking user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check user role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Get all HODs in system
 * @route   GET /api/debug/hods
 * @access  Private
 */
export const getAllHODs = asyncHandler(async (req, res) => {
  try {
    const hods = await User.find({ role: 'hod' })
      .select('name email department isActive signature createdAt')
      .sort({ isActive: -1, createdAt: -1 });

    const hodsData = hods.map(hod => ({
      id: hod._id,
      name: hod.name,
      email: hod.email,
      department: hod.department,
      isActive: hod.isActive,
      hasSignature: !!hod.signature?.imageData,
      signatureActive: hod.signature?.isActive || false,
      signatureType: hod.signature?.signatureType,
      createdAt: hod.createdAt
    }));

    res.status(200).json({
      success: true,
      message: 'HODs retrieved successfully',
      data: hodsData,
      summary: {
        total: hodsData.length,
        active: hodsData.filter(hod => hod.isActive).length,
        withSignature: hodsData.filter(hod => hod.hasSignature).length,
        activeWithSignature: hodsData.filter(hod => hod.isActive && hod.hasSignature).length
      }
    });

  } catch (error) {
    console.error('Error getting HODs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get HODs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});