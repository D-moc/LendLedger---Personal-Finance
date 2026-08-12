import { useState } from "react";

import {
  ArrowUpRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  WalletCards,
  LockKeyhole,
  TrendingUp,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import Logo from "../components/ui/Logo";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      );

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-zinc-900">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">

        {/* =====================================================
            LEFT HERO
        ===================================================== */}

        <section className="relative hidden overflow-hidden border-r border-zinc-200 bg-white lg:block">

          {/* Background decoration */}

          <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-violet-200/50 blur-[110px]" />

          <div className="absolute -bottom-40 right-[-80px] h-[420px] w-[420px] rounded-full bg-indigo-100/70 blur-[120px]" />

          <div className="absolute right-24 top-[28%] h-44 w-44 rounded-full border border-violet-100" />

          <div className="absolute right-32 top-[34%] h-28 w-28 rounded-full border border-violet-100" />

          <div className="absolute right-40 top-[40%] h-14 w-14 rounded-full bg-violet-50" />

          <div className="relative flex h-full flex-col justify-between p-12">

            {/* Logo */}

            <Logo />

            {/* Main hero */}

            <div className="max-w-2xl">

              <div className="mb-6 flex items-center gap-3">

                <span className="h-px w-8 bg-violet-600" />

                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-violet-600">
                  Start taking control
                </p>

              </div>

              <h1 className="font-display text-[76px] font-bold leading-[0.86] tracking-[-0.065em] text-zinc-950">

                EVERY
                <br />

                RUPEE.
                <br />

                EVERY
                <br />

                <span className="text-violet-600">
                  RECORD.
                </span>

              </h1>

              <p className="mt-8 max-w-lg text-base leading-7 text-slate-500">
                One place for everything you owe,
                everything you're owed, and every
                payment in between.
              </p>

              {/* Features */}

              <div className="mt-9 grid max-w-lg grid-cols-2 gap-3">

                <Feature
                  icon={WalletCards}
                  title="Track payments"
                  description="Every transaction organized."
                />

                <Feature
                  icon={TrendingUp}
                  title="Know your balance"
                  description="See what is owed instantly."
                />

                <Feature
                  icon={CheckCircle2}
                  title="Stay organized"
                  description="Keep every record together."
                />

                <Feature
                  icon={LockKeyhole}
                  title="Private by design"
                  description="Your financial data stays yours."
                />

              </div>

            </div>

            {/* Footer */}

            <div className="flex items-center gap-3 text-xs text-slate-500">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <ShieldCheck size={16} />
              </div>

              <div>
                <p className="font-medium text-slate-700">
                  Your financial records stay private.
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Secure personal finance management.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            RIGHT REGISTER
        ===================================================== */}

        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-14">

          <div className="w-full max-w-md">

            {/* Mobile logo */}

            <div className="mb-10 lg:hidden">
              <Logo />
            </div>

            {/* Card */}

            <div className="rounded-[28px] border border-zinc-200 bg-white p-7 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-9">

              {/* Header */}

              <div className="mb-8">

                <div className="mb-4 flex items-center gap-2">

                  <span className="h-px w-7 bg-violet-600" />

                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-600">
                    Get started
                  </p>

                </div>

                <h2 className="font-display text-4xl font-bold tracking-[-0.04em] text-zinc-950">
                  Create account.
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Start managing your personal
                  financial ledger.
                </p>

              </div>

              {/* Error */}

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">

                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />

                  <p className="text-xs leading-5 text-red-600">
                    {error}
                  </p>

                </div>
              )}

              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Name */}

                <Input
                  label="Your name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dinesh"
                  autoComplete="name"
                />

                {/* Email */}

                <Input
                  label="Email address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                {/* Password */}

                <div className="relative">

                  <Input
                    label="Password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-[34px] rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

                {/* Password hint */}

                <div className="flex items-center gap-2 text-[11px] text-slate-400">

                  <LockKeyhole size={13} />

                  <span>
                    Use at least 6 characters.
                  </span>

                </div>

                {/* Submit */}

                <Button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    !rounded-xl
                    !bg-violet-600
                    !px-5
                    !py-3.5
                    !text-white
                    shadow-lg
                    shadow-violet-600/20
                    hover:!bg-violet-700
                  "
                >

                  {loading
                    ? "Creating account..."
                    : "Create account"}

                  {!loading && (
                    <ArrowUpRight
                      size={16}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  )}

                </Button>

              </form>

              {/* Divider */}

              <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-zinc-200" />

                <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
                  Already registered?
                </span>

                <div className="h-px flex-1 bg-zinc-200" />

              </div>

              {/* Login */}

              <Link
                to="/login"
                className="
                  group
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-zinc-200
                  bg-zinc-50
                  py-3.5
                  text-sm
                  font-semibold
                  text-slate-700
                  transition
                  hover:border-violet-200
                  hover:bg-violet-50
                  hover:text-violet-700
                "
              >
                Sign in instead

                <ArrowUpRight
                  size={14}
                  className="
                    opacity-0
                    transition
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                    group-hover:opacity-100
                  "
                />
              </Link>

            </div>

            {/* Bottom */}

            <div className="mt-6 flex items-center justify-center gap-2">

              <ShieldCheck
                size={13}
                className="text-violet-500"
              />

              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-400">
                Your financial data stays yours.
              </p>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
};


/* =========================================================
   FEATURE
========================================================= */

const Feature = ({
  icon: Icon,
  title,
  description,
}) => {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-3.5 backdrop-blur-sm">

      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
        <Icon size={15} />
      </div>

      <p className="text-xs font-semibold text-zinc-800">
        {title}
      </p>

      <p className="mt-1 text-[10px] leading-4 text-slate-400">
        {description}
      </p>

    </div>
  );
};

export default Register;