import { useEffect, useState } from "react";

import MoneyChart from "../components/dashboard/MoneyChart";
import OutstandingChart from "../components/dashboard/OutstandingChart";

import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  IndianRupee,
  Activity,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const Dashboard = () => {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryResponse, recordsResponse] =
        await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/records"),
        ]);

      setSummary(summaryResponse.data.summary);
      setRecords(recordsResponse.data.records || []);
    } catch (error) {
      console.error("Dashboard error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = [
    {
      label: "MONEY GIVEN",
      value: formatCurrency(summary?.totalGiven),
      description: "Total money you've given",
      icon: ArrowUpRight,
      iconClass:
        "bg-emerald-50 text-emerald-600",
      accent:
        "group-hover:border-emerald-200",
    },
    {
      label: "MONEY BORROWED",
      value: formatCurrency(summary?.totalBorrowed),
      description: "Total money you've borrowed",
      icon: ArrowDownLeft,
      iconClass:
        "bg-orange-50 text-orange-600",
      accent:
        "group-hover:border-orange-200",
    },
    {
      label: "OUTSTANDING",
      value: formatCurrency(summary?.totalOutstanding),
      description: "Total amount outstanding",
      icon: Wallet,
      iconClass:
        "bg-violet-50 text-violet-600",
      accent:
        "group-hover:border-violet-200",
    },
    {
      label: "OVERDUE",
      value: summary?.overdueRecords ?? 0,
      description: "Records needing attention",
      icon: AlertCircle,
      iconClass:
        "bg-red-50 text-red-600",
      accent:
        "group-hover:border-red-200",
    },
  ];

  return (
    <DashboardLayout>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

        <div>

          <div className="mb-3 flex items-center gap-2">

            <span className="h-px w-7 bg-violet-600" />

            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-600">
              Financial command center
            </p>

          </div>

          <h1 className="font-display text-4xl font-bold tracking-[-0.045em] text-zinc-950 sm:text-5xl">

            Hello,{" "}

            <span className="text-violet-600">
              {user?.name?.split(" ")[0] || "there"}
            </span>
            .

          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Your money, records and outstanding balances —
            all organized in one place.
          </p>

        </div>

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="
            flex w-fit items-center gap-2
            rounded-xl
            border border-zinc-200
            bg-white
            px-4 py-2.5
            text-xs font-semibold
            text-slate-600
            shadow-sm
            transition
            hover:border-violet-200
            hover:bg-violet-50
            hover:text-violet-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={14}
            className={
              loading ? "animate-spin" : ""
            }
          />

          Refresh
        </button>

      </section>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

          <AlertCircle size={16} />

          <span>{error}</span>

        </div>
      )}


      {/* =====================================================
          MAIN STATS
      ===================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className={`
                group
                rounded-2xl
                border border-zinc-200
                bg-white
                p-5
                shadow-sm
                transition-all duration-200
                hover:-translate-y-0.5
                hover:shadow-md
                ${stat.accent}
              `}
            >

              <div className="mb-7 flex items-center justify-between">

                <div
                  className={`
                    flex h-10 w-10
                    items-center justify-center
                    rounded-xl
                    ${stat.iconClass}
                  `}
                >
                  <Icon size={18} />
                </div>

                <span className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  {stat.label}
                </span>

              </div>

              {loading ? (
                <div className="h-9 w-28 animate-pulse rounded-lg bg-slate-100" />
              ) : (
                <p className="font-mono text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
                  {stat.value}
                </p>
              )}

              <p className="mt-2 text-xs text-slate-400">
                {stat.description}
              </p>

            </div>
          );
        })}

      </section>


      {/* =====================================================
          SECONDARY SUMMARY
      ===================================================== */}

      <section className="mt-5 grid gap-4 sm:grid-cols-3">

        <SummaryMiniCard
          icon={ArrowUpRight}
          label="PRINCIPAL GIVEN OUTSTANDING"
          value={formatCurrency(
            summary?.outstandingGiven
          )}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <SummaryMiniCard
          icon={ArrowDownLeft}
          label="PRINCIPAL BORROWED OUTSTANDING"
          value={formatCurrency(
            summary?.outstandingBorrowed
          )}
          iconClass="bg-orange-50 text-orange-600"
        />

        <SummaryMiniCard
          icon={IndianRupee}
          label="INTEREST DUE"
          value={formatCurrency(
            summary?.interestDue
          )}
          iconClass="bg-violet-50 text-violet-600"
        />

      </section>


      {/* =====================================================
          CHARTS
      ===================================================== */}

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">

        {/* Money overview */}

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-start justify-between">

            <div>

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <Activity size={15} />
                </div>

                <p className="font-display text-lg font-semibold text-zinc-900">
                  Money overview
                </p>

              </div>

              <p className="mt-2 text-xs text-slate-400">
                Given versus borrowed across your ledger.
              </p>

            </div>

          </div>

          <MoneyChart
            given={summary?.totalGiven || 0}
            borrowed={summary?.totalBorrowed || 0}
          />

        </div>


        {/* Outstanding */}

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">

          <div className="mb-5">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <TrendingUp size={15} />
              </div>

              <p className="font-display text-lg font-semibold text-zinc-900">
                Outstanding
              </p>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              Principal versus interest currently due.
            </p>

          </div>

          <OutstandingChart
            principal={
              (summary?.outstandingGiven || 0) +
              (summary?.outstandingBorrowed || 0)
            }
            interest={
              summary?.interestDue || 0
            }
          />

        </div>

      </section>


      {/* =====================================================
          RECENT RECORDS
      ===================================================== */}

      <section className="mt-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">

        <div className="mb-6 flex items-start justify-between">

          <div>

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Wallet size={15} />
              </div>

              <p className="font-display text-lg font-semibold text-zinc-900">
                Recent records
              </p>

            </div>

            <p className="mt-2 text-xs text-slate-400">
              Your latest financial agreements.
            </p>

          </div>

          <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[9px] font-medium text-slate-500">
            {records.length}
          </span>

        </div>


        {loading ? (

          <div className="space-y-3">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl bg-slate-100"
              />
            ))}

          </div>

        ) : records.length === 0 ? (

          <EmptyState />

        ) : (

          <div className="space-y-2">

            {records
              .slice(0, 5)
              .map((record) => (
                <RecordRow
                  key={record._id}
                  record={record}
                />
              ))}

          </div>

        )}

      </section>

    </DashboardLayout>
  );
};


/* =========================================================
   SUMMARY MINI CARD
========================================================= */

const SummaryMiniCard = ({
  label,
  value,
  icon: Icon,
  iconClass,
}) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">

      <div
        className={`
          flex h-10 w-10 shrink-0
          items-center justify-center
          rounded-xl
          ${iconClass}
        `}
      >
        <Icon size={16} />
      </div>

      <div className="min-w-0">

        <p className="truncate font-mono text-[8px] font-medium uppercase tracking-[0.16em] text-slate-400">
          {label}
        </p>

        <p className="mt-1.5 font-mono text-lg font-semibold text-zinc-900">
          {value}
        </p>

      </div>

    </div>
  );
};


/* =========================================================
   RECORD ROW
========================================================= */

const RecordRow = ({ record }) => {
  const isGiven =
    record.direction === "GIVEN";

  const totalOutstanding =
    (record.outstandingPrincipal || 0) +
    (record.outstandingInterest || 0);

  return (
    <div
      className="
        flex items-center justify-between
        rounded-xl
        border border-zinc-100
        bg-slate-50/70
        px-4 py-3
        transition
        hover:border-violet-100
        hover:bg-violet-50/40
      "
    >

      <div className="flex min-w-0 items-center gap-3">

        <div
          className={`
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-lg
            ${
              isGiven
                ? "bg-emerald-50 text-emerald-600"
                : "bg-orange-50 text-orange-600"
            }
          `}
        >
          {isGiven ? (
            <ArrowUpRight size={15} />
          ) : (
            <ArrowDownLeft size={15} />
          )}
        </div>


        <div className="min-w-0">

          <p className="truncate text-sm font-semibold text-zinc-800">
            {record.personId?.name ||
              "Unknown"}
          </p>

          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-slate-400">
            {record.direction} ·{" "}
            {record.interestRate || 0}% monthly
          </p>

        </div>

      </div>


      <div className="ml-3 text-right">

        <p className="font-mono text-sm font-semibold text-zinc-900">
          {formatCurrency(totalOutstanding)}
        </p>

        <p
          className={`
            mt-0.5 text-[9px]
            font-medium uppercase
            tracking-wider
            ${
              record.status === "OVERDUE"
                ? "text-red-500"
                : record.status === "SETTLED"
                  ? "text-emerald-600"
                  : "text-slate-400"
            }
          `}
        >
          {record.status}
        </p>

      </div>

    </div>
  );
};


/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = () => {
  return (
    <div className="flex h-52 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-slate-50/60">

      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-500">
        <Wallet size={20} />
      </div>

      <p className="text-sm font-semibold text-zinc-700">
        No financial records yet
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Add your first person and record.
      </p>

    </div>
  );
};

export default Dashboard;