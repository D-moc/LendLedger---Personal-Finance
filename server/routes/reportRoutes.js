import express from "express";

import {
  getReportOverview,
  getPaymentTrends,
} from "../controllers/reportController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();


// ==========================================
// REPORT OVERVIEW
// ==========================================

router.get(
  "/overview",
  protect,
  getReportOverview
);


// ==========================================
// PAYMENT TRENDS
// ==========================================

router.get(
  "/payment-trends",
  protect,
  getPaymentTrends
);


export default router;