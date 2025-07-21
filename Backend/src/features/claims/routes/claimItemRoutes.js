import express from "express";
import authMiddleware from "../../../shared/middleware/authMiddleware.js";
import { authorizeRoles, authorizeEventCoordinator } from "../../../shared/middleware/roleAuthMiddleware.js";
import {
  updateClaimItemStatus,
  generateReceipt,
  getClaimItemsStatus,
  downloadReceipt,
  generateConsolidatedClaimBill,
  removeRejectedItems
} from "../controllers/claimItemController.js";
import {
  fixEventAmountFields,
  fixAllEventsAmountFields,
  getAmountFieldStatus
} from "../controllers/fixAmountController.js";

const router = express.Router();

// Apply authentication middleware to all claim item routes
router.use(authMiddleware);

// Apply role authorization - only coordinators, HODs, and admins can access claim items
router.use(authorizeRoles('coordinator', 'hod', 'admin'));

// Get all claim items with their status for an event
router.get("/events/:eventId/claim-items", authorizeEventCoordinator('eventId'), getClaimItemsStatus);

// Update individual claim item status (approve/reject)
router.put("/events/:eventId/claim-items/:itemIndex/status", authorizeEventCoordinator('eventId'), updateClaimItemStatus);

// Generate receipt for approved claim item
router.post("/events/:eventId/claim-items/:itemIndex/receipt", authorizeEventCoordinator('eventId'), generateReceipt);

// Download existing receipt
router.get("/events/:eventId/claim-items/:itemIndex/receipt", authorizeEventCoordinator('eventId'), downloadReceipt);

// Generate consolidated claim bill with all approved items
router.post("/events/:eventId/consolidated-claim-bill", authorizeEventCoordinator('eventId'), generateConsolidatedClaimBill);

// Remove rejected items permanently from database
router.delete("/events/:eventId/rejected-items", authorizeEventCoordinator('eventId'), removeRejectedItems);

// Fix amount fields for specific event
router.post("/events/:eventId/fix-amount-fields", authorizeEventCoordinator('eventId'), fixEventAmountFields);

// Get amount field status for specific event
router.get("/events/:eventId/amount-field-status", authorizeEventCoordinator('eventId'), getAmountFieldStatus);

// Fix amount fields for all events - admin only
router.post("/fix-all-amount-fields", authorizeRoles('admin'), fixAllEventsAmountFields);

export default router;