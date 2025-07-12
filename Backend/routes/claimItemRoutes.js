import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  updateClaimItemStatus,
  generateReceipt,
  getClaimItemsStatus,
  downloadReceipt,
  generateConsolidatedClaimBill,
  removeRejectedItems
} from "../controllers/coordinator/claimItemController.js";
import {
  fixEventAmountFields,
  fixAllEventsAmountFields,
  getAmountFieldStatus
} from "../controllers/coordinator/fixAmountController.js";

const router = express.Router();

// Get all claim items with their status for an event
router.get("/events/:eventId/claim-items", getClaimItemsStatus);

// Update individual claim item status (approve/reject)
router.put("/events/:eventId/claim-items/:itemIndex/status", updateClaimItemStatus);

// Generate receipt for approved claim item
router.post("/events/:eventId/claim-items/:itemIndex/receipt", generateReceipt);

// Download existing receipt
router.get("/events/:eventId/claim-items/:itemIndex/receipt", downloadReceipt);

// Generate consolidated claim bill with all approved items
router.post("/events/:eventId/consolidated-claim-bill", generateConsolidatedClaimBill);

// Remove rejected items permanently from database
router.delete("/events/:eventId/rejected-items", removeRejectedItems);

// Fix amount fields for specific event
router.post("/events/:eventId/fix-amount-fields", fixEventAmountFields);

// Get amount field status for specific event
router.get("/events/:eventId/amount-field-status", getAmountFieldStatus);

// Fix amount fields for all events
router.post("/fix-all-amount-fields", fixAllEventsAmountFields);

export default router;