import express from 'express';
import { getNoteOrder, addNoteEntry, lockNoteOrder, updatePlannedBudget } from '../controllers/noteOrderController.js';
import { authorizeRoles, authorizeEventCoordinator } from '../../../shared/middleware/roleAuthMiddleware.js';

const router = express.Router({ mergeParams: true });

// Get the note order for an event
router.get('/:eventId', getNoteOrder);

// Update planned budget (income/expenses) before lock
router.put('/:eventId', authorizeEventCoordinator('eventId'), authorizeRoles('coordinator', 'admin'), updatePlannedBudget);

// Add internal note order entry
router.post('/:eventId/entries', authorizeEventCoordinator('eventId'), authorizeRoles('coordinator', 'admin'), addNoteEntry);

// Lock the note order (immutable after this)
router.post('/:eventId/lock', authorizeEventCoordinator('eventId'), authorizeRoles('coordinator', 'admin'), lockNoteOrder);

export default router;
