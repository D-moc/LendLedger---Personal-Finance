import { useState } from "react";

import {
  ArrowUpRight,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import Logo from "../components/ui/Logo";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import api from "../services/api";

const ResetPassword = () => {
  const navigate = useNavigate();

  const { token } = useParams();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!token) {
      setError(
        "Invalid or missing password reset link."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      await api.post(
        `/auth/reset-password/${token}`,
        {
          password,
        }
      );

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

        {/* ==========================================
            LEFT
        ========================================== */}

        <section className="relative hidden overflow-hidden border-r border-white/[0.06] lg:block">

          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />

          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

          <div className="relative flex h-full flex-col justify-between p-12">

            <Logo />

            <div>

              <p className="mb-6 font-mono text-xs uppercase tracking-[0.35em] text-violet-400">
                New credentials
              </p>

              <h1 className="font-display text-7xl font-bold leading-[0.88] tracking-[-0.06em]">

                SECURE
                <br />

                YOUR
                <br />

                <span className="text-violet-400">
                  LEDGER.
                </span>

              </h1>

              <p className="mt-8 max-w-md text-base leading-7 text-zinc-500">
                Choose a new password and get
                back to managing your financial
                records.
              </p>

            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-600">

              <ShieldCheck
                size={15}
                className="text-violet-400"
              />

              Secure account recovery.

            </div>

          </div>
        </section>


        {/* ==========================================
            RIGHT
        ========================================== */}

        <section className="flex min-h-screen items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            <div className="mb-12 lg:hidden">
              <Logo />
            </div>


            {!success ? (
              <>

                <div className="mb-9">

                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-violet-400">
                    Reset password
                  </p>

                  <h2 className="font-display text-4xl font-bold tracking-tight">
                    Choose a new password.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Use at least 6 characters.
                  </p>

                </div>


                {error && (
                  <div className="mb-5 rounded-xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3.5 text-xs leading-5 text-red-400">
                    {error}
                  </div>
                )}


                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* PASSWORD */}

                  <div className="relative">

                    <Input
                      label="New password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      className="absolute right-3 top-[34px] rounded-lg p-1.5 text-zinc-600 transition hover:text-zinc-300"
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>


                  {/* CONFIRM PASSWORD */}

                  <div className="relative">

                    <Input
                      label="Confirm password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
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
                        setShowConfirmPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      className="absolute right-3 top-[34px] rounded-lg p-1.5 text-zinc-600 transition hover:text-zinc-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>


                  {/* SUBMIT */}

                  <div className="pt-2">

                    <Button
                      type="submit"
                      disabled={loading}
                      className="group flex w-full items-center justify-center gap-2"
                    >

                      {loading
                        ? "Updating password..."
                        : "Reset password"}

                      {!loading && (
                        <ArrowUpRight
                          size={16}
                          className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      )}

                    </Button>

                  </div>

                </form>

              </>
            ) : (

              /* ======================================
                 SUCCESS
              ====================================== */

              <div className="text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.06] text-emerald-400">

                  <CheckCircle2
                    size={28}
                  />

                </div>


                <h2 className="mt-7 font-display text-4xl font-bold tracking-tight">
                  Password updated.
                </h2>


                <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-zinc-500">
                  Your password has been
                  successfully changed.
                </p>


                <button
                  type="button"
                  onClick={() =>
                    navigate("/login")
                  }
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:bg-violet-400"
                >

                  Continue to login

                  <ArrowUpRight
                    size={15}
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