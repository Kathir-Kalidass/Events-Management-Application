import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles, authorizeEventCoordinator } from "../middleware/roleAuthMiddleware.js";
import {
  syncBudgetWithClaimBill,
  getBudgetClaimComparison,
  fixEventBudgetSync,
  bulkSyncAllEvents
} from "../controllers/coordinator/budgetSyncController.js";

const router = express.Router();

// Apply authentication middleware to all budget sync routes
router.use(authMiddleware);

// Apply role authorization - only coordinators, HODs, and admins can access budget sync
router.use(authorizeRoles('coordinator', 'hod', 'admin'));

// Get comparison between budget breakdown and claim bill
router.get("/events/:eventId/budget-claim-comparison", authorizeEventCoordinator('eventId'), getBudgetClaimComparison);

// Sync budget breakdown with claim bill for specific event
router.post("/events/:eventId/sync-budget-claim", authorizeEventCoordinator('eventId'), syncBudgetWithClaimBill);

// Fix specific event's budget and claim synchronization
router.put("/events/:eventId/fix-budget-sync", authorizeEventCoordinator('eventId'), fixEventBudgetSync);

// Bulk sync all events that have discrepancies - admin only
router.post("/bulk-sync-all-events", authorizeRoles('admin'), bulkSyncAllEvents);

export default router;