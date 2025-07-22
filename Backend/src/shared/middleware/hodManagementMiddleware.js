import User from '../models/userModel.js';

/**
 * Middleware to ensure only one active HOD at a time
 * This middleware should be used before creating or updating HOD users
 */
export const ensureOneActiveHOD = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    // Only apply this middleware for HOD role
    if (role !== 'hod') {
      return next();
    }

    // Check if there's already an active HOD
    const existingActiveHOD = await User.findOne({ 
      role: 'hod', 
      isActive: true 
    });

    if (existingActiveHOD) {
      // If this is an update request and it's for the same user, allow it
      if (req.method === 'PUT' && req.params.id === existingActiveHOD._id.toString()) {
        return next();
      }

      // If this is a new HOD registration, deactivate the existing one
      if (req.method === 'POST') {
        existingActiveHOD.isActive = false;
        existingActiveHOD.signature.isActive = false; // Also deactivate their signature
        await existingActiveHOD.save();
        
        console.log(`✅ Deactivated existing HOD: ${existingActiveHOD.name} (${existingActiveHOD.email})`);
      } else {
        // For other operations, prevent multiple active HODs
        return res.status(400).json({
          success: false,
          message: `An active HOD already exists: ${existingActiveHOD.name}. Please deactivate the current HOD before activating another.`,
          activeHOD: {
            name: existingActiveHOD.name,
            email: existingActiveHOD.email,
            department: existingActiveHOD.department
          }
        });
      }
    }

    // Set the new HOD as active
    req.body.isActive = true;
    next();

  } catch (error) {
    console.error('Error in ensureOneActiveHOD middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error managing HOD activation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Middleware to handle HOD activation/deactivation
 */
export const handleHODActivation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Only handle HOD activation
    const user = await User.findById(userId);
    if (!user || user.role !== 'hod') {
      return next();
    }

    // If activating this HOD, deactivate all other HODs
    if (isActive === true) {
      await User.updateMany(
        { 
          role: 'hod', 
          _id: { $ne: userId },
          isActive: true 
        },
        { 
          isActive: false,
          'signature.isActive': false
        }
      );
      
      console.log(`✅ Deactivated all other HODs, activating: ${user.name}`);
    }

    next();

  } catch (error) {
    console.error('Error in handleHODActivation middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Error handling HOD activation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get active HOD information
 */
export const getActiveHOD = async (req, res) => {
  try {
    const activeHOD = await User.findOne({ 
      role: 'hod', 
      isActive: true 
    }).select('name email department signature designation createdAt');

    if (!activeHOD) {
      return res.status(404).json({
        success: false,
        message: 'No active HOD found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: activeHOD._id,
        name: activeHOD.name,
        email: activeHOD.email,
        department: activeHOD.department,
        designation: activeHOD.designation,
        hasSignature: !!activeHOD.signature?.imageData,
        signatureActive: activeHOD.signature?.isActive || false,
        createdAt: activeHOD.createdAt
      }
    });

  } catch (error) {
    console.error('Error getting active HOD:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active HOD information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * List all HODs with their status
 */
export const getAllHODs = async (req, res) => {
  try {
    const hods = await User.find({ role: 'hod' })
      .select('name email department isActive signature designation createdAt')
      .sort({ isActive: -1, createdAt: -1 });

    const hodsData = hods.map(hod => ({
      id: hod._id,
      name: hod.name,
      email: hod.email,
      department: hod.department,
      designation: hod.designation,
      isActive: hod.isActive,
      hasSignature: !!hod.signature?.imageData,
      signatureActive: hod.signature?.isActive || false,
      createdAt: hod.createdAt
    }));

    res.status(200).json({
      success: true,
      data: hodsData,
      activeCount: hods.filter(hod => hod.isActive).length
    });

  } catch (error) {
    console.error('Error getting all HODs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching HODs list',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Activate/Deactivate HOD
 */
export const toggleHODStatus = async (req, res) => {
  try {
    const { hodId } = req.params;
    const { isActive } = req.body;

    const hod = await User.findById(hodId);
    if (!hod || hod.role !== 'hod') {
      return res.status(404).json({
        success: false,
        message: 'HOD not found'
      });
    }

    // If activating this HOD, deactivate all others
    if (isActive === true) {
      await User.updateMany(
        { 
          role: 'hod', 
          _id: { $ne: hodId },
          isActive: true 
        },
        { 
          isActive: false,
          'signature.isActive': false
        }
      );
    }

    // Update the target HOD
    hod.isActive = isActive;
    if (!isActive) {
      hod.signature.isActive = false; // Deactivate signature when deactivating HOD
    }
    
    await hod.save();

    res.status(200).json({
      success: true,
      message: `HOD ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: hod._id,
        name: hod.name,
        email: hod.email,
        isActive: hod.isActive,
        signatureActive: hod.signature.isActive
      }
    });

  } catch (error) {
    console.error('Error toggling HOD status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating HOD status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};