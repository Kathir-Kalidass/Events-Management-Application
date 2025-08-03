import express from 'express';
import registerUser from '../controllers/registerControllers.js';
import loginUser from '../controllers/loginControllers.js';
import { forgotPassword } from "../controllers/forgotPasswordController.js";
import { forgotPasswordDummy } from "../controllers/forgotPasswordDummyController.js";

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);

// Use dummy implementation as primary forgot password endpoint
router.post("/forgot-password", forgotPasswordDummy);
// Keep original as backup
router.post("/forgot-password-original", forgotPassword);
// Also keep dummy endpoint for testing
router.post("/forgot-password-dummy", forgotPasswordDummy);

export default router;
