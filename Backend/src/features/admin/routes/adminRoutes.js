import express from 'express';
import { 
  adminLogin, 
  getAdminProfile 
} from '../controllers/adminAuthController.js';
import { 
  getAllUsers, 
  getAllEvents, 
  addUser, 
  bulkAddUsers, 
  updateUser, 
  deleteUser, 
  getDashboardStats,
  upload 
} from '../controllers/userController.js';
import authMiddleware from '../../../shared/middleware/authMiddleware.js';

const router = express.Router();

// Admin authentication routes
router.post('/login', adminLogin);
router.get('/profile', authMiddleware, getAdminProfile);

// Dashboard routes
router.get('/dashboard/stats', authMiddleware, getDashboardStats);

// User management routes
router.get('/users', authMiddleware, getAllUsers);
router.post('/users', authMiddleware, addUser);
router.post('/users/bulk', authMiddleware, upload.single('file'), bulkAddUsers);
router.put('/users/:userId', authMiddleware, updateUser);
router.delete('/users/:userId', authMiddleware, deleteUser);

// Event management routes
router.get('/events', authMiddleware, getAllEvents);

export default router;