import {
  useEffect,
  useState,
} from "react";

import {
  User,
  Bell,
  LogOut,
  Save,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";

const Settings = () => {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);

  const [notifications, setNotifications] =
    useState({
      interestDue: true,
      paymentReceived: true,
      overdue: true,
    });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // =========================================================
  // LOAD SETTINGS
  // =========================================================

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/auth/settings");

      const data =
        response.data.settings;

      setSettings(data);

      setNotifications({
        interestDue:
          data.notificationPreferences
            ?.interestDue ?? true,

        paymentReceived:
          data.notificationPreferences
            ?.paymentReceived ?? true,

        overdue:
          data.notificationPreferences
            ?.overdue ?? true,
      });
    } catch (error) {
      console.error(
        "Load settings error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // =========================================================
  // SAVE SETTINGS
  // =========================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const response =
        await api.put(
          "/auth/settings",
          notifications
        );

      const data =
        response.data.settings;

      setSettings(data);

      setNotifications({
        interestDue:
          data.notificationPreferences
            ?.interestDue ?? true,

        paymentReceived:
          data.notificationPreferences
            ?.paymentReceived ?? true,

        overdue:
          data.notificationPreferences
            ?.overdue ?? true,
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Save settings error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    try {
      setError("");

      await api.post("/auth/logout");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      navigate("/login", {
        replace: true,
      });
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

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
              Loading settings...
            </p>

          </div>

        </div>
      </DashboardLayout>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !settings) {
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
              Unable to load settings
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadSettings}
              className="
                mt-5
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
              Try again
            </button>

          </div>

        </div>
      </DashboardLayout>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <DashboardLayout>

      <div className="mx-auto max-w-4xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

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
            Account
          </p>

          <h1
            className="
              mt-2
              font-display
              text-3xl
              font-semibold
              tracking-tight
              text-slate-900
            "
          >
            Settings
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your account and notification preferences.
          </p>

        </div>


        {/* =================================================
            ACCOUNT
        ================================================= */}

        <SettingsSection
          icon={User}
          title="Account"
          description="Your DueLedger account information."
        >

          <div className="grid gap-4 sm:grid-cols-2">

            <InfoCard
              label="Name"
              value={
                settings?.name || "—"
              }
            />

            <InfoCard
              label="Email"
              value={
                settings?.email || "—"
              }
            />

          </div>

        </SettingsSection>


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <div className="mt-6">

          <SettingsSection
            icon={Bell}
            title="Notifications"
            description="Choose which notifications you want to receive."
          >

            <div className="divide-y divide-slate-100">

              <ToggleSetting
                label="Interest due"
                description="Notify me when interest is generated."
                checked={
                  notifications.interestDue
                }
                onChange={() =>
                  setNotifications(
                    (previous) => ({
                      ...previous,
                      interestDue:
                        !previous.interestDue,
                    })
                  )
                }
              />

              <ToggleSetting
                label="Payment received"
                description="Notify me when a payment is recorded."
                checked={
                  notifications.paymentReceived
                }
                onChange={() =>
                  setNotifications(
                    (previous) => ({
                      ...previous,
                      paymentReceived:
                        !previous.paymentReceived,
                    })
                  )
                }
              />

              <ToggleSetting
                label="Overdue records"
                description="Notify me when a record becomes overdue."
                checked={
                  notifications.overdue
                }
                onChange={() =>
                  setNotifications(
                    (previous) => ({
                      ...previous,
                      overdue:
                        !previous.overdue,
                    })
                  )
                }
              />

            </div>

          </SettingsSection>

        </div>


        {/* =================================================
            SAVE
        ================================================= */}

        <div
          className="
            mt-6
            flex
            flex-col
            gap-4
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

            {saved ? (

              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">

                <CheckCircle2 size={15} />

                Settings saved successfully.

              </div>

            ) : error ? (

              <div className="flex items-center gap-2 text-xs text-red-500">

                <AlertCircle size={15} />

                {error}

              </div>

            ) : (

              <p className="text-xs text-slate-400">
                Changes are saved to your account.
              </p>

            )}

          </div>


          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-violet-600
              px-5
              py-2.5
              text-xs
              font-semibold
              text-white
              transition
              hover:bg-violet-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            {saving ? (
              <>
                <RefreshCw
                  size={14}
                  className="animate-spin"
                />

                Saving...
              </>
            ) : (
              <>
                <Save size={14} />

                Save changes
              </>
            )}

          </button>

        </div>


        {/* =================================================
            SESSION
        ================================================= */}

        <div className="mt-6">

          <SettingsSection
            icon={LogOut}
            title="Session"
            description="Manage your current session."
          >

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-sm font-medium text-slate-800">
                  Sign out
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Sign out of your DueLedger account on this device.
                </p>

              </div>


              <button
                type="button"
                onClick={handleLogout}
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-red-100
                  bg-red-50
                  px-4
                  py-2.5
                  text-xs
                  font-medium
                  text-red-500
                  transition
                  hover:bg-red-100
                "
              >
                <LogOut size={14} />

                Logout

              </button>

            </div>

          </SettingsSection>

        </div>

      </div>

    </DashboardLayout>
  );
};


// =========================================================
// SETTINGS SECTION
// =========================================================

const SettingsSection = ({
  icon: Icon,
  title,
  description,
  children,
}) => {
  return (
    <section>

      <div className="mb-3 flex items-center gap-3">

        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            border-slate-200
            bg-white
            text-violet-600
          "
        >
          <Icon size={16} />
        </div>

        <div>

          <h2 className="text-sm font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-0.5 text-[11px] text-slate-400">
            {description}
          </p>

        </div>

      </div>


      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-5
          shadow-sm
          shadow-slate-200/40
        "
      >
        {children}
      </div>

    </section>
  );
};


// =========================================================
// INFO CARD
// =========================================================

const InfoCard = ({
  label,
  value,
}) => {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-100
        bg-slate-50/70
        p-4
      "
    >

      <p
        className="
          font-mono
          text-[9px]
          font-medium
          uppercase
          tracking-wider
          text-slate-400
        "
      >
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-medium text-slate-800">
        {value}
      </p>

    </div>
  );
};


// =========================================================
// TOGGLE
// =========================================================

const ToggleSetting = ({
  label,
  description,
  checked,
  onChange,
}) => {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        py-4
      "
    >

      <div>

        <p className="text-sm font-medium text-slate-800">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>

      </div>


      <button
        type="button"
        onClick={onChange}
        aria-label={label}
        aria-pressed={checked}
        className={`
          relative
          h-6
          w-11
          shrink-0
          rounded-full
          transition-colors
          ${
            checked
              ? "bg-violet-600"
              : "bg-slate-200"
          }
        `}
      >

        <span
          className={`
            absolute
            top-1
            h-4
            w-4
            rounded-full
            bg-white
            shadow-sm
            transition-all
            ${
              checked
                ? "left-6"
                : "left-1"
            }
          `}
        />

      </button>

    </div>
  );
};


export default Settings;