import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

/**
 * Optional authentication middleware
 * Attempts to authenticate the user but doesn't fail if no token is provided
 * Useful for endpoints that can work with or without authentication
 */
const optionalAuthMiddleware = async (req, res, next) => {
  let token;

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
        console.log(`⚠️ Invalid token format, proceeding without auth`);
        return next();
      }
      
      // Remove quotes if present
      if (token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and attach to req.user
      req.user = await User.findById(decoded.id).select("-password");
      
      if (req.user) {
        console.log(`👤 Optional auth: User authenticated: ${req.user.name} (${req.user.role})`);
      } else {
        console.log(`⚠️ Optional auth: User not found for token, proceeding without auth`);
      }
      
    } catch (err) {
      console.log(`⚠️ Optional auth: Token verification failed, proceeding without auth: ${err.message}`);
      // Don't return error, just proceed without authentication
    }
  } else {
    console.log(`ℹ️ Optional auth: No token provided, proceeding without auth`);
  }
  
  // Always proceed to next middleware/handler
  next();
};

export default optionalAuthMiddleware;