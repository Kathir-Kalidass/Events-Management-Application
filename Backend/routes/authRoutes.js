import express from 'express';
import registerUser from '../controllers/auth/registerControllers.js';
import loginUser from '../controllers/auth/loginControllers.js';
import { forgotPassword } from "../controllers/auth/forgotPasswordController.js";

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post("/forgot-password", forgotPassword);

export default router;
