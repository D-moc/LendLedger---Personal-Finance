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
      setError("Invalid or missing password reset link.");
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
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to reset password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left */}
        <section className="relative hidden overflow-hidden border-r border-white/[0.06] lg:flex">
          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />

          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" />

          <div className="relative flex w-full flex-col justify-between p-12">
            <Logo />

            <div>
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.3em] text-violet-400">
                New credentials
              </p>

              <h1 className="font-display text-6xl font-bold leading-[0.9] tracking-[-0.06em] xl:text-7xl">
                SECURE
                <br />
                YOUR
                <br />
                <span className="text-violet-400">LEDGER.</span>
              </h1>

              <p className="mt-7 max-w-md text-sm leading-6 text-zinc-500">
                Choose a new password and get back to managing your financial
                records.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-600">
              <ShieldCheck size={14} className="text-violet-400" />
              Secure account recovery
            </div>
          </div>
        </section>

        {/* Right */}
        <section className="flex min-h-screen items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <Logo />
            </div>

            {!success ? (
              <>
                <div className="mb-8">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.3em] text-violet-400">
                    Reset password
                  </p>

                  <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    Create a new password.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Choose a secure password with at least 6 characters.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3 text-xs leading-5 text-red-400">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Password */}
                  <div className="relative">
                    <Input
                      label="New password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      className="absolute right-3 top-[34px] rounded-lg p-1.5 text-zinc-600 transition hover:bg-white/[0.04] hover:text-zinc-300"
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>

                  {/* Confirm password */}
                  <div className="relative">
                    <Input
                      label="Confirm password"
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Enter password again"
                      autoComplete="new-password"
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
                      className="absolute right-3 top-[34px] rounded-lg p-1.5 text-zinc-600 transition hover:bg-white/[0.04] hover:text-zinc-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="group flex w-full items-center justify-center gap-2"
                  >
                    {loading ? "Updating..." : "Reset password"}

                    {!loading && (
                      <ArrowUpRight
                        size={16}
                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    )}
                  </Button>
                </form>

                <div className="mt-7 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition hover:text-white"
                  >
                    <ArrowLeft size={14} />
                    Back to login
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.06] text-emerald-400">
                  <CheckCircle2 size={28} />
                </div>

                <h2 className="mt-6 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Password updated.
                </h2>

                <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-zinc-500">
                  Your password has been successfully changed. You can now
                  sign in with your new password.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:bg-violet-400"
                >
                  Continue to login

                  <ArrowUpRight
                    size={15}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ResetPassword;