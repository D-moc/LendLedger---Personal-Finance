import Notification from "../models/Notification.js";

// ==========================================
// GET ALL NOTIFICATIONS
// ==========================================

export const getNotifications = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const notifications =
      await Notification.find({
        userId,
      })
        .populate({
          path: "recordId",
          select:
            "personId direction originalPrincipal outstandingPrincipal outstandingInterest status",
          populate: {
            path: "personId",
            select: "name phone",
          },
        })
        .populate({
          path: "transactionId",
          select:
            "type principalAmount interestAmount totalAmount transactionDate note",
        })
        .sort({
          createdAt: -1,
        });

    const unreadCount =
      await Notification.countDocuments({
        userId,
        isRead: false,
      });

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to load notifications",
    });
  }
};


// ==========================================
// GET UNREAD COUNT
// ==========================================

export const getUnreadCount = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const unreadCount =
      await Notification.countDocuments({
        userId,
        isRead: false,
      });

    return res.status(200).json({
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get unread count error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to get notification count",
    });
  }
};


// ==========================================
// MARK ONE NOTIFICATION AS READ
// ==========================================

export const markNotificationAsRead =
  async (req, res) => {
    try {
      const {
        notificationId,
      } = req.params;

      const userId = req.user._id;

      const notification =
        await Notification.findOne({
          _id: notificationId,
          userId,
        });

      if (!notification) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }

      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();

        await notification.save();
      }

      return res.status(200).json({
        message:
          "Notification marked as read",
        notification,
      });
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to update notification",
      });
    }
  };


// ==========================================
// MARK ALL NOTIFICATIONS AS READ
// ==========================================

export const markAllNotificationsAsRead =
  async (req, res) => {
    try {
      const userId = req.user._id;

      await Notification.updateMany(
        {
          userId,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        }
      );

      return res.status(200).json({
        message:
          "All notifications marked as read",
      });
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to update notifications",
      });
    }
  };


// ==========================================
// DELETE ONE NOTIFICATION
// ==========================================

export const deleteNotification =
  async (req, res) => {
    try {
      const {
        notificationId,
      } = req.params;

      const userId = req.user._id;

      const notification =
        await Notification.findOneAndDelete({
          _id: notificationId,
          userId,
        });

      if (!notification) {
        return res.status(404).json({
          message:
            "Notification not found",
        });
      }

      return res.status(200).json({
        message:
          "Notification deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to delete notification",
      });
    }
  };