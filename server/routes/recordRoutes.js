import express from "express";

import {
  createRecord,
  getRecords,
  getRecordById,
  getRecordSummary,
  settleRecord,
} from "../controllers/recordController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createRecord);

router.get("/", getRecords);

router.get("/:id", getRecordById);

router.get("/:id/summary", getRecordSummary);

router.patch("/:id/settle", settleRecord);

export default router;