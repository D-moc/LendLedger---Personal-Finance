import { Link } from "react-router-dom";

const Logo = ({ light = false }) => {
  return (
    <Link
      to="/dashboard"
      aria-label="Go to dashboard"
      className="inline-flex items-center gap-3 transition-opacity hover:opacity-80"
    >
      {/* Logo mark */}
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-zinc-950 shadow-sm">
        <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-violet-500" />

        <span className="relative font-display text-xl font-bold text-white">
          L
        </span>
      </div>

      {/* Logo text */}
      <div>
        <div
          className={`font-display text-xl font-bold tracking-tight ${
            light ? "text-white" : "text-zinc-950"
          }`}
        >
          LEND
          <span className="text-violet-600">
            LEDGER
          </span>
        </div>

        <div
          className={`font-mono text-[9px] uppercase tracking-[0.25em] ${
            light ? "text-zinc-400" : "text-slate-500"
          }`}
        >
          Personal Finance
        </div>
      </div>
    </Link>
  );
};

export default Logo;