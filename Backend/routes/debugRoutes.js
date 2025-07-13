import express from 'express';
import optionalAuthMiddleware from '../middleware/optionalAuthMiddleware.js';

const router = express.Router();

// Debug endpoint to check authentication status
router.get('/auth-status', optionalAuthMiddleware, (req, res) => {
  const authStatus = {
    authenticated: !!req.user,
    user: req.user ? {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    } : null,
    headers: {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      userAgent: req.headers['user-agent'],
      origin: req.headers.origin,
      referer: req.headers.referer
    },
    timestamp: new Date().toISOString()
  };

  res.json({
    success: true,
    authStatus
  });
});

// Health check endpoint (no auth required)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// Debug endpoint to test different auth scenarios
router.get('/test-auth', optionalAuthMiddleware, (req, res) => {
  const scenarios = {
    hasAuthHeader: !!req.headers.authorization,
    authHeaderValue: req.headers.authorization || 'Not provided',
    userAuthenticated: !!req.user,
    userRole: req.user?.role || 'Not authenticated',
    requestInfo: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }
  };

  res.json({
    success: true,
    message: 'Auth test completed',
    scenarios
  });
});

export default router;