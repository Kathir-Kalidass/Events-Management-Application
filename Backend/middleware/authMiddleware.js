import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  let token;

  // Check if token is present in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token using your secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user and attach to req.user
      req.user = await User.findById(decoded.userId).select("-password");

      next(); //  Pass control to next handler
    } catch (err) {
      console.error("Token verification failed:", err);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "No token, authorization denied" });
  }
};

export default authMiddleware;

