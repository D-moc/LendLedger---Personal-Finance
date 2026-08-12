import express from "express";

import {
  createPayment,
  getTransactions,
} from "../controllers/transactionController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/payment", createPayment);

router.get(
  "/record/:recordId",
  getTransactions
);

export default router;