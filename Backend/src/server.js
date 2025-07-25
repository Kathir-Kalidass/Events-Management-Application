import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import shared modules
import db from './shared/config/db.js';
import { initializeDataValidation } from './shared/middleware/dataValidationMiddleware.js';

// Import feature routes directly
import authRoutes from './features/auth/routes/authRoutes.js';
import participantRoutes from './features/participants/routes/participantRoutes.js';
import coordinatorRoutes from './features/events/routes/coordinatorRoutes.js';
import hodRoutes from './features/events/routes/hodRoutes.js';
import claimItemRoutes from './features/claims/routes/claimItemRoutes.js';
import budgetSyncRoutes from './features/claims/routes/budgetSyncRoutes.js';
import certificateRoutes from './features/certificates/routes/certificateRoutes.js';
import brochureRoutes from './features/documents/routes/brochureRoutes.js';
import adminRoutes from './features/admin/routes/adminRoutes.js';
import debugRoutes from './features/debug/routes/debugRoutes.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv to look for .env file in the Backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

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
app.use("/api/certificates", certificateRoutes);
app.use("/api/brochures", brochureRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/debug", debugRoutes);

app.listen(process.env.PORT,"0.0.0.0", ()=>{

  // Initialize data validation after server starts
  initializeDataValidation({
    runOnStartup: true,
    intervalMinutes: 60, // Run every hour
    autoFix: false // Set to true if you want automatic fixes
  });
});