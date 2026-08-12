import express from "express";

import {
  searchLedger,
} from "../controllers/searchController.js";

import protect from "../middleware/authMiddleware.js";

const router =
  express.Router();

router.get(
  "/",
  protect,
  searchLedger
);

export default router;