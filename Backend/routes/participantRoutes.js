import express from 'express';
import { dashboard } from '../controllers/participant/dashboard.js';
import getCompletedEvents from "../controllers/participant/getCompletedEventsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const participantRoutes = express.Router();

participantRoutes.get('/dashboard', dashboard);
participantRoutes.get("/completed-events", authMiddleware, getCompletedEvents);

export default participantRoutes;
