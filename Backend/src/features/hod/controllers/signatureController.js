import User from '../../../shared/models/userModel.js';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Upload HOD signature
 * @route   POST /api/hod/signature/upload
 * @access  Private (HOD only)
 */
export const uploadSignature = asyncHandler(async (req, res) => {
  try {
    const { imageData, fileName, signatureType = 'uploaded' } = req.body;
    const hodId = req.user._id;
    const userRole = req.user.role;

    console.log(`🔍 Uploading signature for user: ${hodId}, role: ${userRole}, type: ${signatureType}`);

    // Validate input
    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }

    // Validate base64 image data
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image format. Please upload a valid image file.'
      });
    }

    // Find and update the HOD user
    const hod = await User.findById(hodId);
    if (!hod) {
      console.log(`❌ User not found: ${hodId}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`🔍 Found user: ${hod.name}, role: ${hod.role}`);

    // Allow both 'hod' role and admin access
    if (hod.role !== 'hod' && userRole !== 'admin') {
      console.log(`❌ Access denied. User role: ${hod.role}, Request role: ${userRole}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. HOD role required.',
        debug: {
          userRole: hod.role,
          requestRole: userRole,
          userId: hodId
        }
      });
    }

    // Update signature data
    hod.signature = {
      imageData,
      fileName: fileName || `signature-${signatureType}-${Date.now()}.png`,
      uploadedAt: new Date(),
      isActive: true, // Automatically activate new signature
      signatureType: signatureType // 'drawn' or 'uploaded'
    };

    await hod.save();

    console.log(`✅ Signature ${signatureType} saved for: ${hod.name}`);

    // Return signature data (without sensitive info)
    const signatureData = {
      imageData: hod.signature.imageData,
      fileName: hod.signature.fileName,
      uploadedAt: hod.signature.uploadedAt,
      isActive: hod.signature.isActive,
      signatureType: hod.signature.signatureType
    };

    res.status(200).json({
      success: true,
      message: `Signature ${signatureType === 'drawn' ? 'drawn' : 'uploaded'} successfully`,
      data: signatureData
    });

  } catch (error) {
    console.error('Error uploading signature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload signature',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Get HOD signature
 * @route   GET /api/hod/signature
 * @access  Private (HOD only)
 */
export const getSignature = asyncHandler(async (req, res) => {
  try {
    const hodId = req.user._id;
    const userRole = req.user.role;

    console.log(`🔍 Fetching signature for user: ${hodId}, role: ${userRole}`);

    const hod = await User.findById(hodId).select('signature name department role');
    if (!hod) {
      console.log(`❌ User not found: ${hodId}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`🔍 Found user: ${hod.name}, role: ${hod.role}`);

    // Allow both 'hod' role and admin access
    if (hod.role !== 'hod' && userRole !== 'admin') {
      console.log(`❌ Access denied. User role: ${hod.role}, Request role: ${userRole}`);
      return res.status(403).json({
        success: false,
        message: 'Access denied. HOD role required.',
        debug: {
          userRole: hod.role,
          requestRole: userRole,
          userId: hodId
        }
      });
    }

    if (!hod.signature || !hod.signature.imageData) {
      console.log(`ℹ️ No signature found for user: ${hod.name}`);
      return res.status(404).json({
        success: false,
        message: 'No signature found'
      });
    }

    const signatureData = {
      imageData: hod.signature.imageData,
      fileName: hod.signature.fileName,
      uploadedAt: hod.signature.uploadedAt,
      isActive: hod.signature.isActive,
      signatureType: hod.signature.signatureType,
      hodName: hod.name,
      department: hod.department
    };

    console.log(`✅ Signature found for: ${hod.name}, active: ${hod.signature.isActive}`);

    res.status(200).json({
      success: true,
      data: signatureData
    });

  } catch (error) {
    console.error('Error fetching signature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch signature',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Delete HOD signature
 * @route   DELETE /api/hod/signature
 * @access  Private (HOD only)
 */
export const deleteSignature = asyncHandler(async (req, res) => {
  try {
    const hodId = req.user._id;

    const hod = await User.findById(hodId);
    if (!hod || hod.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HOD role required.'
      });
    }

    if (!hod.signature || !hod.signature.imageData) {
      return res.status(404).json({
        success: false,
        message: 'No signature found to delete'
      });
    }

    // Clear signature data
    hod.signature = {
      imageData: null,
      fileName: null,
      uploadedAt: null,
      isActive: false
    };

    await hod.save();

    res.status(200).json({
      success: true,
      message: 'Signature deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting signature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete signature',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Activate/Deactivate HOD signature
 * @route   PUT /api/hod/signature/activate
 * @access  Private (HOD only)
 */
export const activateSignature = asyncHandler(async (req, res) => {
  try {
    const hodId = req.user._id;

    const hod = await User.findById(hodId);
    if (!hod || hod.role !== 'hod') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. HOD role required.'
      });
    }

    if (!hod.signature || !hod.signature.imageData) {
      return res.status(404).json({
        success: false,
        message: 'No signature found to activate'
      });
    }

    // Toggle activation status
    hod.signature.isActive = !hod.signature.isActive;
    await hod.save();

    const signatureData = {
      imageData: hod.signature.imageData,
      fileName: hod.signature.fileName,
      uploadedAt: hod.signature.uploadedAt,
      isActive: hod.signature.isActive
    };

    res.status(200).json({
      success: true,
      message: `Signature ${hod.signature.isActive ? 'activated' : 'deactivated'} successfully`,
      data: signatureData
    });

  } catch (error) {
    console.error('Error updating signature status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update signature status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @desc    Get HOD signature for certificate generation (internal use)
 * @route   GET /api/hod/signature/for-certificate/:hodId
 * @access  Private (Internal API)
 */
export const getSignatureForCertificate = asyncHandler(async (req, res) => {
  try {
    const { hodId } = req.params;

    const hod = await User.findById(hodId).select('signature name department designation');
    if (!hod || hod.role !== 'hod') {
      return res.status(404).json({
        success: false,
        message: 'HOD not found'
      });
    }

    if (!hod.signature || !hod.signature.imageData || !hod.signature.isActive) {
      return res.status(404).json({
        success: false,
        message: 'No active signature found for this HOD'
      });
    }

    const signatureData = {
      imageData: hod.signature.imageData,
      hodName: hod.name,
      department: hod.department,
      designation: hod.designation || `Head of Department, ${hod.department || 'CSE'}`
    };

    res.status(200).json({
      success: true,
      data: signatureData
    });

  } catch (error) {
    console.error('Error fetching signature for certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch signature for certificate',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});