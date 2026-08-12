import { Link } from "react-router-dom";

const Logo = ({ light = false }) => {
  return (
    <Link
      to="/dashboard"
      className="flex items-center gap-3 transition-opacity hover:opacity-80"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-950">
        <img
          src="/logo.png"
          alt="LendLedger"
          className="h-full w-full object-cover"
        />
      </div>

      <div>
        <div
          className={`font-display text-xl font-bold tracking-tight ${
            light ? "text-white" : "text-slate-950"
          }`}
        >
          Lend
          <span className="text-violet-600">Ledger</span>
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