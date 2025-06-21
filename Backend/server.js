import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import db from './config/db.js';
import authRoutes from "./routes/authRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import coordinatorRoutes from "./routes/coordinatorRoutes.js";
import hodRoutes from "./routes/hodRoutes.js";

const app = express()
app.use(express.json());
app.use(cors());
dotenv.config();
db.connectDb();


app.use("/api/auth", authRoutes);
app.use("/api/participant", participantRoutes);
app.use("/api/coordinator", coordinatorRoutes);
app.use("/api/hod", hodRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
