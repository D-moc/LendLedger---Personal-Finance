import { useEffect, useState } from "react";

import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  ExternalLink,
  Inbox,
  Percent,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";

// =========================================================
// HELPERS
// =========================================================

const getNotificationIcon = (type) => {
  switch (type) {
    case "PAYMENT_RECEIVED":
      return CreditCard;

    case "INTEREST_DUE":
      return Percent;

    case "OVERDUE":
      return AlertTriangle;

    default:
      return Bell;
  }
};

const getNotificationIconStyle = (type) => {
  switch (type) {
    case "PAYMENT_RECEIVED":
      return "bg-emerald-50 text-emerald-600";

    case "INTEREST_DUE":
      return "bg-amber-50 text-amber-600";

    case "OVERDUE":
      return "bg-red-50 text-red-600";

    default:
      return "bg-violet-50 text-violet-600";
  }
};

const formatDate = (date) => {
  if (!date) return "";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return value.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// =========================================================
// COMPONENT
// =========================================================

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [processingId, setProcessingId] =
    useState(null);

  const [markingAll, setMarkingAll] =
    useState(false);

  // =======================================================
  // LOAD
  // =======================================================

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/notifications");

      setNotifications(
        response.data.notifications || []
      );

      setUnreadCount(
        response.data.unreadCount || 0
      );
    } catch (error) {
      console.error(
        "Load notifications error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // =======================================================
  // MARK ONE READ
  // =======================================================

  const handleMarkAsRead = async (
    notification
  ) => {
    if (notification.isRead) {
      return;
    }

    try {
      setProcessingId(
        notification._id
      );

      await api.patch(
        `/notifications/${notification._id}/read`
      );

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                isRead: true,
                readAt: new Date(),
              }
            : item
        )
      );

      setUnreadCount((previous) =>
        Math.max(0, previous - 1)
      );
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =======================================================
  // MARK ALL READ
  // =======================================================

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      setMarkingAll(true);

      await api.patch(
        "/notifications/read-all"
      );

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true,
          readAt:
            item.readAt || new Date(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // =======================================================
  // DELETE
  // =======================================================

  const handleDelete = async (
    notification
  ) => {
    try {
      setProcessingId(
        notification._id
      );

      await api.delete(
        `/notifications/${notification._id}`
      );

      setNotifications((previous) =>
        previous.filter(
          (item) =>
            item._id !== notification._id
        )
      );

      if (!notification.isRead) {
        setUnreadCount((previous) =>
          Math.max(0, previous - 1)
        );
      }
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =======================================================
  // OPEN RECORD
  // =======================================================

  const handleOpenNotification = async (
    notification
  ) => {
    await handleMarkAsRead(
      notification
    );

    if (
      notification.recordId?._id
    ) {
      navigate(
        `/records/${notification.recordId._id}`
      );
    }
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="text-center">

            <RefreshCw
              size={20}
              className="
                mx-auto
                animate-spin
                text-violet-600
              "
            />

            <p className="mt-3 text-sm text-slate-400">
              Loading notifications...
            </p>

          </div>

        </div>
      </DashboardLayout>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error) {
    return (
      <DashboardLayout>

        <div className="flex min-h-[60vh] items-center justify-center">

          <div className="max-w-md text-center">

            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                border
                border-red-100
                bg-red-50
                text-red-500
              "
            >
              <AlertCircle size={20} />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-slate-900">
              Unable to load notifications
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadNotifications}
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-violet-600
                px-4
                py-2.5
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-violet-700
              "
            >
              <RefreshCw size={14} />

              Try again
            </button>

          </div>

        </div>

      </DashboardLayout>
    );
  }

  // =======================================================
  // MAIN
  // =======================================================

  return (
    <DashboardLayout>

      <div className="mx-auto max-w-4xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            mb-7
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >

          <div>

            <div className="flex items-center gap-2">

              <Bell
                size={16}
                className="text-violet-600"
              />

              <p
                className="
                  font-mono
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.25em]
                  text-violet-600
                "
              >
                Activity
              </p>

            </div>

            <div className="mt-2 flex items-center gap-3">

              <h1
                className="
                  font-display
                  text-3xl
                  font-semibold
                  tracking-tight
                  text-slate-900
                "
              >
                Notifications
              </h1>

              {unreadCount > 0 && (
                <span
                  className="
                    rounded-full
                    bg-violet-50
                    px-2.5
                    py-1
                    font-mono
                    text-[9px]
                    font-medium
                    text-violet-600
                  "
                >
                  {unreadCount} unread
                </span>
              )}

            </div>

            <p className="mt-2 text-sm text-slate-500">
              Stay updated with your DueLedger activity.
            </p>

          </div>


          {/* MARK ALL */}

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-xs
                font-medium
                text-slate-600
                transition
                hover:border-violet-200
                hover:bg-violet-50
                hover:text-violet-600
                disabled:opacity-50
              "
            >

              {markingAll ? (
                <RefreshCw
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <CheckCheck size={14} />
              )}

              Mark all as read

            </button>
          )}

        </div>


        {/* =================================================
            EMPTY
        ================================================= */}

        {notifications.length === 0 ? (

          <div
            className="
              flex
              min-h-[420px]
              items-center
              justify-center
              rounded-2xl
              border
              border-slate-200
              bg-white
            "
          >

            <div className="max-w-sm px-6 text-center">

              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-slate-50
                  text-slate-400
                "
              >
                <Inbox size={23} />
              </div>

              <h2 className="mt-5 text-sm font-semibold text-slate-800">
                You're all caught up
              </h2>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                New payment, interest and overdue
                notifications will appear here.
              </p>

            </div>

          </div>

        ) : (

          /* =================================================
             LIST
          ================================================= */

          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
              shadow-slate-200/40
            "
          >

            <div className="divide-y divide-slate-100">

              {notifications.map(
                (notification) => {

                  const Icon =
                    getNotificationIcon(
                      notification.type
                    );

                  const iconStyle =
                    getNotificationIconStyle(
                      notification.type
                    );

                  const isProcessing =
                    processingId ===
                    notification._id;

                  return (
                    <div
                      key={
                        notification._id
                      }
                      className={`
                        relative
                        flex
                        gap-4
                        px-5
                        py-4
                        transition
                        hover:bg-slate-50
                        ${
                          !notification.isRead
                            ? "bg-violet-50/30"
                            : "bg-white"
                        }
                      `}
                    >

                      {/* UNREAD DOT */}

                      {!notification.isRead && (
                        <span
                          className="
                            absolute
                            left-2
                            top-7
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-violet-600
                          "
                        />
                      )}


                      {/* ICON */}

                      <div
                        className={`
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          ${iconStyle}
                        `}
                      >
                        <Icon size={17} />
                      </div>


                      {/* CONTENT */}

                      <button
                        type="button"
                        onClick={() =>
                          handleOpenNotification(
                            notification
                          )
                        }
                        className="
                          min-w-0
                          flex-1
                          text-left
                        "
                      >

                        <div className="flex flex-wrap items-center gap-2">

                          <p
                            className={`
                              text-sm
                              font-medium
                              ${
                                notification.isRead
                                  ? "text-slate-600"
                                  : "text-slate-900"
                              }
                            `}
                          >
                            {notification.title}
                          </p>

                          {!notification.isRead && (
                            <span
                              className="
                                rounded-full
                                bg-violet-50
                                px-2
                                py-0.5
                                font-mono
                                text-[8px]
                                font-medium
                                uppercase
                                tracking-wider
                                text-violet-600
                              "
                            >
                              New
                            </span>
                          )}

                        </div>


                        <p
                          className="
                            mt-1
                            max-w-2xl
                            text-xs
                            leading-5
                            text-slate-500
                          "
                        >
                          {notification.message}
                        </p>


                        <div
                          className="
                            mt-2
                            flex
                            flex-wrap
                            items-center
                            gap-2
                            text-[10px]
                            text-slate-400
                          "
                        >

                          <span>
                            {formatDate(
                              notification.createdAt
                            )}
                          </span>

                          {notification.recordId && (
                            <>
                              <span>•</span>

                              <span className="inline-flex items-center gap-1 text-violet-600">
                                View record
                                <ExternalLink
                                  size={10}
                                />
                              </span>
                            </>
                          )}

                        </div>

                      </button>


                      {/* ACTIONS */}

                      <div
                        className="
                          flex
                          shrink-0
                          items-start
                          gap-1
                        "
                      >

                        {!notification.isRead && (
                          <button
                            type="button"
                            title="Mark as read"
                            onClick={() =>
                              handleMarkAsRead(
                                notification
                              )
                            }
                            disabled={
                              isProcessing
                            }
                            className="
                              rounded-lg
                              p-2
                              text-slate-400
                              transition
                              hover:bg-emerald-50
                              hover:text-emerald-600
                              disabled:opacity-40
                            "
                          >
                            <Check size={15} />
                          </button>
                        )}


                        <button
                          type="button"
                          title="Delete"
                          onClick={() =>
                            handleDelete(
                              notification
                            )
                          }
                          disabled={
                            isProcessing
                          }
                          className="
                            rounded-lg
                            p-2
                            text-slate-400
                            transition
                            hover:bg-red-50
                            hover:text-red-500
                            disabled:opacity-40
                          "
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>
        )}

      </div>

    </DashboardLayout>
  );
};

export default Notifications;