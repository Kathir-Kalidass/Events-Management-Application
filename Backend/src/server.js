import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import db from './shared/config/db.js';
import { initializeDataValidation } from './shared/middleware/dataValidationMiddleware.js';
import logger from './shared/utils/logger.js';
import { captureError } from './shared/utils/errorTracker.js';

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
import monitoringRoutes from './features/monitoring/routes/monitoringRoutes.js';
import aiRoutes from './features/ai/routes/aiRoutes.js';
import { initLLM } from './shared/services/llm/index.js';
import { createDefaultAdmin } from './features/admin/controllers/adminAuthController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();

app.use(express.json({ limit: '10mb' }));

const allowedOrigins = [
  "http://localhost:5173",
  "http://10.5.12.1:5173",
  "http://10.5.12.1:84",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed by CORS."));
    }
  },
  credentials: true,
}));

const morganStream = {
  write: (message) => logger.http(message.trim()),
};

app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: morganStream,
  skip: (req) => req.url === '/api/admin/debug/health',
}));

db.connectDb();

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
app.use("/api/monitoring", monitoringRoutes);
app.use("/api/ai", aiRoutes);

app.use((err, req, res, next) => {
  captureError(err, req);
  next(err);
});

import { errorHandler, notFound } from './shared/middleware/errorMiddleware.js';
app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, "0.0.0.0", async () => {
  logger.info(`Server running on port ${process.env.PORT}`);

  initLLM();

  try {
    await createDefaultAdmin();
  } catch (error) {
    logger.error('Error creating default admin:', { error: error.message });
  }

  initializeDataValidation({
    runOnStartup: true,
    intervalMinutes: 60,
    autoFix: false,
  });
});
