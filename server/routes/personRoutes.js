import express from "express";

import {
  createPerson,
  getPeople,
  getPersonSummary,
  getPersonById,
  updatePerson,
  archivePerson,
  restorePerson,
} from "../controllers/personController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createPerson);

router.get("/", getPeople);

router.get("/:id/summary", getPersonSummary);

router.get("/:id", getPersonById);

router.put("/:id", updatePerson);

router.delete("/:id", archivePerson);

router.patch("/:id/restore", restorePerson);

export default router;