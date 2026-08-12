import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

import personRoutes from "./routes/personRoutes.js";
import recordRoutes from "./routes/recordRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import interestRoutes from "./routes/interestRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { startInterestJob } from "./jobs/interestJob.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

dotenv.config();

const app = express();

// Database
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "LendLedger API is running 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/people", personRoutes);
app.use("/api/records", recordRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/interest", interestRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/payments", paymentRoutes);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/search",
  searchRoutes
);

// Server
const PORT = process.env.PORT || 5000;

startInterestJob();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
