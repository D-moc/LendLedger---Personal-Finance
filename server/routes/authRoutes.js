import express from "express";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getSettings,
  updateSettings,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();


// ==========================================
// AUTH
// ==========================================

// Register
router.post(
  "/register",
  registerUser
);


// Login
router.post(
  "/login",
  loginUser
);


// Get current logged-in user
router.get(
  "/me",
  protect,
  getCurrentUser
);


// Logout
router.post(
  "/logout",
  logoutUser
);


// ==========================================
// PASSWORD RESET
// ==========================================

// Request password reset
router.post(
  "/forgot-password",
  forgotPassword
);


// Reset password using token
router.post(
  "/reset-password/:token",
  resetPassword
);


// ==========================================
// SETTINGS
// ==========================================

// Get settings
router.get(
  "/settings",
  protect,
  getSettings
);


// Update settings
router.put(
  "/settings",
  protect,
  updateSettings
);


export default router;