import { useState } from "react";

import {
  ArrowUpRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import { Link } from "react-router-dom";

import Logo from "../components/ui/Logo";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import api from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email: normalizedEmail,
      });

      setSuccess(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT */}
        <section className="relative hidden overflow-hidden border-r border-white/[0.06] lg:block">

          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />

          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

          <div className="absolute right-1/4 top-1/3 h-72 w-72 rounded-full bg-violet-500/[0.04] blur-[100px]" />

          <div className="relative flex h-full flex-col justify-between p-12">

            <Logo />

            <div>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.35em] text-violet-400">
                Account recovery
              </p>

              <h1 className="max-w-xl font-display text-7xl font-bold leading-[0.88] tracking-[-0.06em]">
                GET
                <br />
                BACK
                <br />
                TO YOUR
                <br />
                <span className="text-violet-400">
                  LEDGER.
                </span>
              </h1>

              <p className="mt-8 max-w-md text-base leading-7 text-zinc-500">
                Reset your password securely and
                continue keeping every rupee
                accounted for.
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

        {/* RIGHT */}
        <section className="flex min-h-screen items-center justify-center px-6 py-12">

          <div className="w-full max-w-md">

            <div className="mb-12 lg:hidden">
              <Logo />
            </div>

            {!success ? (
              <>
                <div className="mb-9">

                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-violet-400">
                    Password recovery
                  </p>

                  <h2 className="font-display text-4xl font-bold tracking-tight">
                    Forgot your password?
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Enter the email associated with
                    your LendLedger account and we'll
                    send you a reset link.
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

                  <Input
                    label="Email address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                  />

                  <div className="pt-2">

                    <Button
                      type="submit"
                      disabled={loading}
                      className="group flex w-full items-center justify-center gap-2"
                    >
                      {loading
                        ? "Sending reset link..."
                        : "Send reset link"}

                      {!loading && (
                        <ArrowUpRight
                          size={16}
                          className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      )}
                    </Button>

                  </div>

                </form>

                <div className="mt-8 text-center">

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

                <h2 className="mt-7 font-display text-4xl font-bold tracking-tight">
                  Check your email.
                </h2>

                <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-zinc-500">
                  If an account exists for{" "}
                  <span className="text-zinc-300">
                    {email.trim()}
                  </span>
                  , we've sent a password reset link.
                </p>

                <div className="mx-auto mt-6 rounded-xl border border-white/[0.06] bg-white/[0.025] px-5 py-4">
                  <p className="text-xs leading-5 text-zinc-500">
                    Your reset link will expire in{" "}
                    <span className="font-medium text-zinc-300">
                      15 minutes
                    </span>
                    .
                  </p>
                </div>

                <p className="mt-5 text-xs leading-5 text-zinc-600">
                  Check your inbox and spam folder.
                  If you don't receive an email,
                  you can try again.
                </p>

                <Link
                  to="/login"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
                >
                  <ArrowLeft size={15} />
                  Back to login
                </Link>

              </div>
            )}

          </div>
        </section>
      </div>
    </main>
  );
};

export default ForgotPassword;