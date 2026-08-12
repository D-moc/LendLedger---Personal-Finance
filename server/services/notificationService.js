import Notification from "../models/Notification.js";
import User from "../models/User.js";

// ==========================================
// CREATE NOTIFICATION
// ==========================================

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  recordId = null,
  transactionId = null,
}) => {
  try {
    if (
      !userId ||
      !type ||
      !title ||
      !message
    ) {
      return null;
    }

    const user =
      await User.findById(userId).select(
        "notificationPreferences"
      );

    if (!user) {
      return null;
    }

    const preferences =
      user.notificationPreferences || {};

    // ========================================
    // CHECK USER PREFERENCES
    // ========================================

    if (
      type === "PAYMENT_RECEIVED" &&
      preferences.paymentReceived === false
    ) {
      return null;
    }

    if (
      type === "INTEREST_DUE" &&
      preferences.interestDue === false
    ) {
      return null;
    }

    if (
      type === "OVERDUE" &&
      preferences.overdue === false
    ) {
      return null;
    }

    // ========================================
    // CREATE NOTIFICATION
    // ========================================

    const notification =
      await Notification.create({
        userId,
        type,
        title,
        message,
        recordId,
        transactionId,
      });

    return notification;
  } catch (error) {
    console.error(
      "Create notification error:",
      error
    );

    // Notification failure should never
    // break payment/interest processing.
    return null;
  }
};


// ==========================================
// PAYMENT NOTIFICATION
// ==========================================

export const createPaymentNotification =
  async ({
    userId,
    recordId,
    transactionId,
    amount,
    personName,
  }) => {
    const formattedAmount =
      Number(
        amount || 0
      ).toLocaleString(
        "en-IN",
        {
          maximumFractionDigits: 2,
        }
      );

    return createNotification({
      userId,

      type:
        "PAYMENT_RECEIVED",

      title:
        "Payment recorded",

      message: personName
        ? `Payment of ₹${formattedAmount} was recorded for ${personName}.`
        : `Payment of ₹${formattedAmount} was recorded.`,

      recordId,

      transactionId,
    });
  };


// ==========================================
// INTEREST DUE NOTIFICATION
// ==========================================

export const createInterestDueNotification =
  async ({
    userId,
    recordId,
    amount,
    personName,
  }) => {
    const formattedAmount =
      Number(
        amount || 0
      ).toLocaleString(
        "en-IN",
        {
          maximumFractionDigits: 2,
        }
      );

    return createNotification({
      userId,

      type:
        "INTEREST_DUE",

      title:
        "Interest generated",

      message: personName
        ? `₹${formattedAmount} interest has been generated for ${personName}.`
        : `₹${formattedAmount} interest has been generated.`,

      recordId,
    });
  };


// ==========================================
// OVERDUE NOTIFICATION
// ==========================================

export const createOverdueNotification =
  async ({
    userId,
    recordId,
    amount,
    personName,
  }) => {
    try {
      // --------------------------------------
      // PREVENT DUPLICATE NOTIFICATIONS
      // --------------------------------------

      const existingNotification =
        await Notification.findOne({
          userId,
          recordId,
          type: "OVERDUE",
        });

      if (existingNotification) {
        return existingNotification;
      }

      // --------------------------------------
      // FORMAT AMOUNT
      // --------------------------------------

      const formattedAmount =
        Number(
          amount || 0
        ).toLocaleString(
          "en-IN",
          {
            maximumFractionDigits: 2,
          }
        );

      // --------------------------------------
      // CREATE NOTIFICATION
      // --------------------------------------

      return await createNotification({
        userId,

        type:
          "OVERDUE",

        title:
          "Payment overdue",

        message: personName
          ? `${personName} has an overdue balance of ₹${formattedAmount}.`
          : `A record has an overdue balance of ₹${formattedAmount}.`,

        recordId,
      });
    } catch (error) {
      console.error(
        "Create overdue notification error:",
        error
      );

      return null;
    }
  };