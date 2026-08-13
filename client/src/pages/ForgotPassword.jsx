import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
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

    const normalizedEmail = email.trim().toLowerCase();

    setError("");

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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top navigation */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/login" className="transition-opacity hover:opacity-80">
            <Logo />
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      </header>

      {/* Main */}
      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-12">
        <div className="w-full max-w-[460px]">
          {!success ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm shadow-slate-200/50 sm:p-9">
              {/* Icon */}
              <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Mail size={21} />
              </div>

              {/* Heading */}
              <div>
                <p className="mb-2 font-mono text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-600">
                  Account recovery
                </p>

                <h1 className="font-display text-3xl font-bold tracking-[-0.03em] text-slate-900">
                  Forgot your password?
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  No problem. Enter your email address and we'll send you a
                  secure link to reset your password.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 !bg-violet-600 !text-white hover:!bg-violet-700"
                >
                  {loading ? "Sending..." : "Send reset link"}

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
                  For your security, password reset links are temporary and
                  can only be used once.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm shadow-slate-200/50 sm:p-10">
              {/* Success icon */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={26} />
              </div>

              <p className="mt-7 font-mono text-[9px] font-semibold uppercase tracking-[0.25em] text-emerald-600">
                Request sent
              </p>

              <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] text-slate-900">
                Check your email
              </h1>

              <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-500">
                If an account exists for{" "}
                <span className="font-medium text-slate-700">
                  {email.trim()}
                </span>
                , we've sent you a password reset link.
              </p>

              {/* Expiry */}
              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
                <p className="text-xs text-slate-500">
                  The reset link expires in{" "}
                  <span className="font-semibold text-slate-700">
                    15 minutes
                  </span>
                  .
                </p>
              </div>

              <p className="mt-5 text-[11px] leading-5 text-slate-400">
                Didn't receive it? Check your spam folder or try again.
              </p>

              <Link
                to="/login"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <ArrowLeft size={15} />
                Back to login
              </Link>
            </div>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-[10px] text-slate-400">
            DueLedger · Personal Finance
          </p>
        </div>
      </section>
    </main>
  );
};

export default ForgotPassword;