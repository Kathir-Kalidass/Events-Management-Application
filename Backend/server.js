import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './config/db.js';
import authRoutes from "./routes/authRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import coordinatorRoutes from "./routes/coordinatorRoutes.js";
import hodRoutes from "./routes/hodRoutes.js";
import claimItemRoutes from "./routes/claimItemRoutes.js";
import budgetSyncRoutes from "./routes/budgetSyncRoutes.js";
import debugRoutes from "./routes/debugRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import { initializeDataValidation } from './middleware/dataValidationMiddleware.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv to look for .env file in the Backend directory
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
app.use(express.json());
app.use(cors());
db.connectDb();

// Register API routes
app.use("/api/auth", authRoutes);
app.use("/api/participant", participantRoutes);
app.use("/api/coordinator", coordinatorRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/claims", claimItemRoutes);
app.use("/api/budget-sync", budgetSyncRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/certificates", certificateRoutes);

app.listen(process.env.PORT,"0.0.0.0", ()=>{
  console.log(`server started: http://localhost:${process.env.PORT}`);
  
  // Initialize data validation after server starts
  initializeDataValidation({
    runOnStartup: true,
    intervalMinutes: 60, // Run every hour
    autoFix: false // Set to true if you want automatic fixes
  });
});