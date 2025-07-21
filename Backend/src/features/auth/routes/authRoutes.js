import express from 'express';
import registerUser from '../controllers/registerControllers.js';
import loginUser from '../controllers/loginControllers.js';
import { forgotPassword } from "../controllers/forgotPasswordController.js";

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post("/forgot-password", forgotPassword);

export default router;
