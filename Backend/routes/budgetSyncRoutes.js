import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  syncBudgetWithClaimBill,
  getBudgetClaimComparison,
  fixEventBudgetSync,
  bulkSyncAllEvents
} from "../controllers/coordinator/budgetSyncController.js";

const router = express.Router();

// Get comparison between budget breakdown and claim bill
router.get("/events/:eventId/budget-claim-comparison", getBudgetClaimComparison);

// Sync budget breakdown with claim bill for specific event
router.post("/events/:eventId/sync-budget-claim", syncBudgetWithClaimBill);

// Fix specific event's budget and claim synchronization
router.put("/events/:eventId/fix-budget-sync", fixEventBudgetSync);

// Bulk sync all events that have discrepancies
router.post("/bulk-sync-all-events", bulkSyncAllEvents);

export default router;