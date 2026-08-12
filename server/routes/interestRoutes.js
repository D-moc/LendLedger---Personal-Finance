import express from "express";

import {
  generateInterestForRecord,
  generateAllDueInterest,
} from "../controllers/interestController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();


// Generate interest for one record
router.post(
  "/generate/:recordId",
  protect,
  generateInterestForRecord
);


// Generate interest for all user's records
router.post(
  "/generate-all",
  protect,
  generateAllDueInterest
);


export default router;