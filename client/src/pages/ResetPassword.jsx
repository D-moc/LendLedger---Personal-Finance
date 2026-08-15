import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Logo from "../components/ui/Logo";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import api from "../services/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!token) {
      setError("This password reset link is invalid or incomplete.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post(`/auth/reset-password/${token}`, {
        password,
      });

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to reset your password. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Logo />

          {!success && (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft size={14} />
              Back to login
            </Link>
          )}
        </div>
      </header>

      {/* Main */}
      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-[460px]">
          {!success ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm shadow-slate-200/50 sm:p-9">
              {/* Icon */}
              <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <ShieldCheck size={21} />
              </div>

              {/* Heading */}
              <div className="mb-7">
                <p className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-600">
                  Account recovery
                </p>

                <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-slate-900">
                  Create a new password
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Choose a new password for your DueLedger account.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New password */}
                <div className="relative">
                  <Input
                    label="New password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-3 top-[34px] rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {/* Confirm password */}
                <div className="relative">
                  <Input
                    label="Confirm password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Enter password again"
                    autoComplete="new-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    className="absolute right-3 top-[34px] rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 !bg-violet-600 !text-white hover:!bg-violet-700"
                >
                  {loading ? "Updating..." : "Update password"}

                  {!loading && (
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  )}
                </Button>
              </form>

              {/* Security note */}
              <div className="mt-7 flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3.5">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-violet-500"
                />

                <p className="text-[11px] leading-5 text-slate-500">
                  Your reset link is temporary and can only be used once.
                </p>
              </div>
            </div>
          ) : (
            /* Success */
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm shadow-slate-200/50 sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={26} />
              </div>

              <p className="mt-7 font-mono text-[9px] font-semibold uppercase tracking-[0.25em] text-emerald-600">
                Password updated
              </p>

              <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-slate-900">
                You're all set.
              </h1>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-500">
                Your DueLedger password has been successfully changed.
              </p>

              <div className="mx-auto mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck size={14} className="text-emerald-500" />
                Your account is secure.
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-[10px] text-slate-400">
            DueLedger · Personal Finance
          </p>
        </div>
      </section>
    </main>
  );
};

export default ResetPassword;
