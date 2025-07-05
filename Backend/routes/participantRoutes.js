import express from 'express';
import * as participantController from '../controllers/participant/dashboard.js';

const router = express.Router();

router.get('/events', participantController.getEvents);
router.post('/register', participantController.registerEvent);
router.get('/my-events/:participantId', participantController.getMyEvents);
router.get('/my-certificates/:participantId', participantController.getMyCertificates);
router.post('/feedback', participantController.giveFeedback);

export default router;