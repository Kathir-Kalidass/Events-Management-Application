import User from "../../../shared/models/userModel.js";
import encrypt from "../../../../passwordManager/encryption.js";


// In-memory storage for password reset requests (for dummy implementation)
// In production, this would be stored in database
let passwordResetRequests = [];
let requestIdCounter = 1;

export const forgotPasswordDummy = async (req, res) => {
  const { email, role } = req.body;

  try {
    // Validate input
    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required." });
    }

    // Check if user exists
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(404).json({ message: "Email not found for this role." });
    }

    // Check if there's already a pending request for this user
    const existingRequest = passwordResetRequests.find(req => 
      req.email === email && req.role === role && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ 
        message: "A password reset request is already pending for this email. Please wait for admin approval." 
      });
    }

    // Create a new password reset request
    const resetRequest = {
      id: requestIdCounter++,
      email,
      role,
      userName: user.name,
      userId: user._id,
      requestedAt: new Date(),
      status: 'pending'
    };

    passwordResetRequests.push(resetRequest);

    // Log the request for admin visibility
    console.log(`[PASSWORD RESET REQUEST] ${new Date().toISOString()}`);
    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);
    console.log(`User: ${user.name}`);
    console.log(`User ID: ${user._id}`);
    console.log(`Request ID: ${resetRequest.id}`);
    console.log('---');

    res.status(200).json({ 
      message: "Password reset request has been sent to admin for approval. Admin will reset your password to your email address and notify you via email." 
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
};

// Dummy admin functions for future implementation
export const getPasswordResetRequests = async (req, res) => {
  try {
    // Return actual stored requests plus some dummy data for demo
    const actualRequests = passwordResetRequests.map(request => ({
      ...request,
      requestedAt: request.requestedAt.toISOString()
    }));

    // Add some dummy data for demonstration if no actual requests exist
    const dummyRequests = [];
   
    const allRequests = actualRequests.length > 0 ? actualRequests : dummyRequests;

    res.status(200).json({ requests: allRequests });
  } catch (err) {
    console.error("Get reset requests error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const approvePasswordReset = async (req, res) => {
  const { requestId } = req.params;
  
  try {
    // Find the reset request
    const requestIndex = passwordResetRequests.findIndex(req => req.id == requestId);
    const resetRequest = passwordResetRequests[requestIndex];

    if (!resetRequest) {
      return res.status(404).json({ message: "Reset request not found." });
    }

    if (resetRequest.status !== 'pending') {
      return res.status(400).json({ message: "Reset request has already been processed." });
    }

    // Find the user
    const user = await User.findById(resetRequest.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Reset password to user's email address
    const newPassword = user.email; // Set password to email
    const encryptedPassword = await encrypt(newPassword);

    // Update user's password in database
    await User.findByIdAndUpdate(user._id, { password: encryptedPassword });

    // Update request status
    passwordResetRequests[requestIndex] = {
      ...resetRequest,
      status: 'approved',
      processedAt: new Date(),
      processedBy: 'admin' // In real implementation, get from auth token
    };

    // Log the action
    console.log(`[PASSWORD RESET APPROVED] ${new Date().toISOString()}`);
    console.log(`Request ID: ${requestId}`);
    console.log(`User: ${user.name} (${user.email})`);
    console.log(`New password: ${newPassword}`);
    console.log('---');

    res.status(200).json({ 
      message: `Password reset approved. User's password has been reset to their email address: ${user.email}` 
    });
  } catch (err) {
    console.error("Approve reset error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const rejectPasswordReset = async (req, res) => {
  const { requestId } = req.params;
  const { reason } = req.body;
  
  try {
    // Find the reset request
    const requestIndex = passwordResetRequests.findIndex(req => req.id == requestId);
    const resetRequest = passwordResetRequests[requestIndex];

    if (!resetRequest) {
      return res.status(404).json({ message: "Reset request not found." });
    }

    if (resetRequest.status !== 'pending') {
      return res.status(400).json({ message: "Reset request has already been processed." });
    }

    // Update request status
    passwordResetRequests[requestIndex] = {
      ...resetRequest,
      status: 'rejected',
      processedAt: new Date(),
      processedBy: 'admin', // In real implementation, get from auth token
      reason: reason || 'No reason provided'
    };

    // Log the action
    console.log(`[PASSWORD RESET REJECTED] ${new Date().toISOString()}`);
    console.log(`Request ID: ${requestId}`);
    console.log(`User: ${resetRequest.userName} (${resetRequest.email})`);
    console.log(`Reason: ${reason || 'No reason provided'}`);
    console.log('---');
    
    res.status(200).json({ 
      message: "Password reset request has been rejected." 
    });
  } catch (err) {
    console.error("Reject reset error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
