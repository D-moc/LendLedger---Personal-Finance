import express from "express";

import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();


// ==========================================
// GET ALL NOTIFICATIONS
// ==========================================

router.get(
  "/",
  protect,
  getNotifications
);


// ==========================================
// GET UNREAD COUNT
// ==========================================

router.get(
  "/unread-count",
  protect,
  getUnreadCount
);


// ==========================================
// MARK ALL AS READ
// ==========================================

router.patch(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);


// ==========================================
// MARK ONE AS READ
// ==========================================

router.patch(
  "/:notificationId/read",
  protect,
  markNotificationAsRead
);


// ==========================================
// DELETE ONE
// ==========================================

router.delete(
  "/:notificationId",
  protect,
  deleteNotification
);


export default router;