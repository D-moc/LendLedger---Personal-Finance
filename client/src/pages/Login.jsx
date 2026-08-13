import { useState } from "react";

import {
  ArrowUpRight,
  ShieldCheck,
  Eye,
  EyeOff,
  WalletCards,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import Logo from "../components/ui/Logo";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

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

  // ==========================================
  // LOGIN
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      await login(
        formData.email.trim(),
        formData.password
      );

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-zinc-900">

      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">

        {/* =====================================================
            LEFT VISUAL PANEL
        ===================================================== */}

        <section className="relative hidden overflow-hidden border-r border-zinc-200 bg-[#f3f0ff] lg:block">

          {/* Background glow */}

          <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-violet-300/30 blur-[130px]" />

          <div className="absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full bg-indigo-200/40 blur-[130px]" />

          {/* Decorative grid */}

          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "linear-gradient(#7c3aed12 1px, transparent 1px), linear-gradient(90deg, #7c3aed12 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />

          <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">

            {/* Logo */}

            <Logo />


            {/* Main content */}

            <div className="relative">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-3 py-1.5 backdrop-blur-sm">

                <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />

                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.25em] text-violet-700">
                  Personal finance
                </span>

              </div>


              <h1 className="max-w-xl font-display text-[68px] font-bold leading-[0.92] tracking-[-0.065em] text-zinc-950 xl:text-[78px]">

                KNOW

                <br />

                WHERE YOUR

                <br />

                <span className="text-violet-600">
                  MONEY GOES.
                </span>

              </h1>


              <p className="mt-7 max-w-lg text-[15px] leading-7 text-slate-500">
                DueLedger keeps your lending,
                borrowing, repayments and
                outstanding balances organized
                in one simple financial workspace.
              </p>


              {/* Mini stats */}

              <div className="mt-9 flex flex-wrap gap-3">

                <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-sm">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                    <WalletCards size={17} />
                  </div>

                  <div>
                    <p className="font-display text-sm font-semibold text-zinc-900">
                      Every record
                    </p>

                    <p className="font-mono text-[8px] uppercase tracking-wider text-slate-400">
                      Organized
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-sm">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp size={17} />
                  </div>

                  <div>
                    <p className="font-display text-sm font-semibold text-zinc-900">
                      Clear insights
                    </p>

                    <p className="font-mono text-[8px] uppercase tracking-wider text-slate-400">
                      Stay informed
                    </p>
                  </div>

                </div>

              </div>


              {/* Floating ledger preview */}

              <div className="absolute -right-8 -top-4 hidden w-56 rotate-3 rounded-2xl border border-white bg-white/90 p-4 shadow-2xl shadow-violet-200/40 xl:block">

                <div className="mb-4 flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                      <CircleDollarSign size={14} />
                    </div>

                    <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400">
                      Ledger
                    </span>

                  </div>

                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                </div>


                <div className="space-y-3">

                  <div className="flex items-center justify-between">

                    <div>
                      <div className="h-2 w-20 rounded-full bg-slate-100" />
                      <div className="mt-1.5 h-1.5 w-12 rounded-full bg-slate-50" />
                    </div>

                    <span className="text-xs font-semibold text-emerald-600">
                      +₹8,500
                    </span>

                  </div>


                  <div className="h-px bg-slate-100" />


                  <div className="flex items-center justify-between">

                    <div>
                      <div className="h-2 w-24 rounded-full bg-slate-100" />
                      <div className="mt-1.5 h-1.5 w-14 rounded-full bg-slate-50" />
                    </div>

                    <span className="text-xs font-semibold text-orange-500">
                      -₹3,200
                    </span>

                  </div>


                  <div className="h-px bg-slate-100" />


                  <div className="flex items-center justify-between">

                    <div>
                      <div className="h-2 w-16 rounded-full bg-slate-100" />
                      <div className="mt-1.5 h-1.5 w-10 rounded-full bg-slate-50" />
                    </div>

                    <span className="text-xs font-semibold text-violet-600">
                      ₹12,400
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* Bottom */}

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 text-violet-600 shadow-sm">
                  <ShieldCheck size={16} />
                </div>

                <div>

                  <p className="text-xs font-medium text-slate-600">
                    Private by design
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Your financial data stays yours.
                  </p>

                </div>

              </div>


              <span className="hidden font-mono text-[8px] uppercase tracking-[0.3em] text-slate-400 xl:block">
                DueLedger / 01
              </span>

            </div>

          </div>

        </section>


        {/* =====================================================
            RIGHT LOGIN AREA
        ===================================================== */}

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">

          <div className="w-full max-w-[430px]">

            {/* Mobile logo */}

            <div className="mb-12 lg:hidden">
              <Logo />
            </div>


            {/* Login card */}

            <div className="rounded-[28px] border border-zinc-200/80 bg-white p-7 shadow-[0_20px_70px_-25px_rgba(15,23,42,0.18)] sm:p-9">

              {/* Header */}

              <div className="mb-8">

                <div className="mb-4 flex items-center gap-2">

                  <span className="h-px w-7 bg-violet-600" />

                  <p className="font-mono text-[9px] font-medium uppercase tracking-[0.3em] text-violet-600">
                    Welcome back
                  </p>

                </div>


                <h2 className="font-display text-[36px] font-bold tracking-[-0.04em] text-zinc-950">
                  Sign in.
                </h2>


                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Continue managing your
                  financial records.
                </p>

              </div>


              {/* Error */}

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

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
                    placeholder="••••••••"
                    autoComplete="current-password"
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
                    className="absolute right-3 top-[34px] rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-violet-600"
                  >

                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}

                  </button>

                </div>


                {/* Forgot + Login */}

                <div className="flex items-center justify-between gap-4 pt-1">

                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-slate-500 transition hover:text-violet-600"
                  >
                    Forgot password?
                  </Link>


                  <Button
                    type="submit"
                    disabled={loading}
                    className="group flex items-center gap-2"
                  >

                    {loading
                      ? "Signing in..."
                      : "Sign in"}

                    {!loading && (
                      <ArrowUpRight
                        size={16}
                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    )}

                  </Button>

                </div>

              </form>


              {/* Divider */}

              <div className="my-8 flex items-center gap-4">

                <div className="h-px flex-1 bg-zinc-200" />

                <span className="font-mono text-[8px] uppercase tracking-[0.25em] text-slate-400">
                  New here?
                </span>

                <div className="h-px flex-1 bg-zinc-200" />

              </div>


              {/* Register */}

              <Link
                to="/register"
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-slate-50 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
              >

                Create your DueLedger account

                <ArrowUpRight
                  size={14}
                  className="opacity-0 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                />

              </Link>

            </div>


            {/* Bottom */}

            <p className="mt-6 text-center font-mono text-[8px] uppercase tracking-[0.25em] text-slate-400">
              Secure access · Personal finance · DueLedger
            </p>

          </div>

        </section>

      </div>

    </main>
  );
};

export default Login;