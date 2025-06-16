import express from 'express'
import{ allEvents } from '../controllers/hod/allEvents.js'
import { createEvent, createUser } from '../controllers/hod/createSample.js'
import { approveEvent, rejectEvent } from '../controllers/hod/updatedStatus.js';
import { addComment } from '../controllers/hod/addComment.js';

const hodRoutes = express.Router();

hodRoutes.get('/allEvents/', allEvents);
hodRoutes.put('/event/approve', approveEvent);
hodRoutes.put('/event/reject', rejectEvent);
hodRoutes.post('/event/comment', addComment);

//utils
hodRoutes.post('/createEvent/', createEvent);
hodRoutes.post('/createUser/', createUser);



export default hodRoutes;