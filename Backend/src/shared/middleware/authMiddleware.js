import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  let token;
  console.log("checking in authmiddleware");
  // Log request details for debugging

  // Check if token is present in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];
      
      // Validate token exists after split
      if (!token || token === 'undefined' || token === 'null') {
        console.error(`❌ Invalid token after split: "${token}"`);
        return res.status(401).json({ 
          message: "Invalid authorization format",
          error: "INVALID_AUTH_FORMAT"
        });
      }
      
      // Remove quotes if present (common issue with frontend token storage)
      if (token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);

      }
      
      // Debug: Log token info (first and last 10 characters for security)
      console.log(`🔐 Token received: ${token.substring(0, 10)}...${token.substring(token.length - 10)}`);

      // Verify token using your secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user and attach to req.user (note: token uses 'id' not 'userId')
      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        console.error(`❌ User not found for ID: ${decoded.id}`);
        return res.status(401).json({ 
          message: "User not found",
          error: "USER_NOT_FOUND"
        });
      }
      
      console.log(`👤 User authenticated: ${req.user.name} (${req.user.email}) - Role: ${req.user.role}`);
      next(); //  Pass control to next handler
    } catch (err) {
      console.error("❌ Token verification failed:", err.message);
      
      // Provide more specific error messages
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: "Token expired, please login again",
          error: "TOKEN_EXPIRED",
          clearToken: true
        });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: "Invalid token, please login again",
          error: "INVALID_TOKEN",
          clearToken: true // Signal frontend to clear token
        });
      } else {
        return res.status(401).json({ 
          message: "Authentication failed",
          error: "AUTH_FAILED",
          details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }
    }
  } else {
    // More detailed logging for missing authorization
    console.error(`❌ No authorization header found for ${req.method} ${req.originalUrl}`);
    console.error(`📋 Available headers:`, Object.keys(req.headers));
    console.error(`🔍 Authorization header value:`, req.headers.authorization || 'undefined');
    
    return res.status(401).json({ 
      message: "No token, authorization denied",
      error: "NO_TOKEN",
      hint: "Include 'Authorization: Bearer <token>' header"
    });
  }
};

export default authMiddleware;

