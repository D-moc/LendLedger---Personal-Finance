import express from "express";

import {
  createPayment,
  getTransactions,
  getAllPayments,
} from "../controllers/paymentController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();


// ==========================================
// CREATE PAYMENT
// ==========================================

router.post(
  "/",
  protect,
  createPayment
);


// ==========================================
// GET ALL PAYMENTS
// Used by Payments page
// ==========================================

router.get(
  "/all",
  protect,
  getAllPayments
);


// ==========================================
// GET TRANSACTIONS FOR ONE RECORD
// Used by RecordDetails page
// ==========================================

router.get(
  "/:recordId",
  protect,
  getTransactions
);


export default router;