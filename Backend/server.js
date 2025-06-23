// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const db = require('./config/db.js');
// const authRoutes = require("./routes/authRoutes.js");
// const participantRoutes = require("./routes/participantRoutes.js");
// const coordinatorRoutes = require("./routes/coordinatorRoutes.js");
// const hodRoutes = require("./routes/hodRoutes.js");

// const app = express();
// app.use(express.json());
// app.use(cors());
// dotenv.config();
// db.connectDb();

// app.use("/api/auth", authRoutes);
// app.use("/api/participant", participantRoutes);
// app.use("/api/coordinator", coordinatorRoutes);
// app.use("/api/hod", hodRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from './config/db.js';
import authRoutes from "./routes/authRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import coordinatorRoutes from "./routes/coordinatorRoutes.js";
import hodRoutes from "./routes/hodRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
db.connectDb();

app.use("/api/auth", authRoutes);
app.use("/api/participant", participantRoutes);
app.use("/api/coordinator", coordinatorRoutes);
app.use("/api/hod", hodRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});