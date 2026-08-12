import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Percent,
} from "lucide-react";

const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const RecordCard = ({ record, onClick }) => {
  const isGiven = record.direction === "GIVEN";

  const outstandingPrincipal = Number(
    record.outstandingPrincipal || 0
  );

  const outstandingInterest = Number(
    record.outstandingInterest || 0
  );

  const totalOutstanding =
    outstandingPrincipal + outstandingInterest;

  return (
    <button
      onClick={onClick}
      className="
        group w-full rounded-2xl
        border border-slate-200
        bg-white
        p-5 text-left
        shadow-sm shadow-slate-900/[0.03]
        transition-all duration-200
        hover:-translate-y-[1px]
        hover:border-violet-200
        hover:shadow-md hover:shadow-violet-900/[0.04]
      "
    >
      {/* Main row */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div className="flex min-w-0 items-center gap-4">
          {/* Direction icon */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
              isGiven
                ? "bg-emerald-50 text-emerald-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            {isGiven ? (
              <ArrowUpRight size={20} />
            ) : (
              <ArrowDownLeft size={20} />
            )}
          </div>

          {/* Person */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-display text-lg font-bold tracking-tight text-slate-900">
                {record.personId?.name || "Unknown person"}
              </h3>

              <StatusBadge status={record.status} />
            </div>

            <p className="mt-1 text-xs font-medium text-slate-500">
              {isGiven
                ? "Money you gave"
                : "Money you borrowed"}
            </p>
          </div>
        </div>

        {/* Amount */}
        <div className="lg:text-right">
          <p className="font-mono text-xl font-bold text-slate-900">
            {formatCurrency(totalOutstanding)}
          </p>

          <p className="mt-1 font-mono text-[9px] font-medium uppercase tracking-wider text-slate-400">
            Total outstanding
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
        <Info
          label="ORIGINAL"
          value={formatCurrency(record.originalPrincipal)}
        />

        <Info
          label="PRINCIPAL DUE"
          value={formatCurrency(outstandingPrincipal)}
        />

        <Info
          label="INTEREST DUE"
          value={formatCurrency(outstandingInterest)}
        />

        <Info
          label="INTEREST"
          value={
            record.interestType === "NONE"
              ? "No interest"
              : `${record.interestRate || 0}% / month`
          }
        />
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <CalendarDays size={11} />

            <span className="font-mono text-[9px]">
              {formatDate(record.startDate)}
            </span>
          </div>

          {record.interestType !== "NONE" && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <Percent size={11} />

              <span className="font-mono text-[9px]">
                Monthly
              </span>
            </div>
          )}
        </div>

        <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-600 transition group-hover:text-violet-700">
          View record
          <ChevronRight
            size={13}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </button>
  );
};

const Info = ({ label, value }) => {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[8px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate font-mono text-xs font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: "bg-violet-50 text-violet-700 border-violet-100",

    OVERDUE:
      "bg-red-50 text-red-600 border-red-100",

    DUE_SOON:
      "bg-amber-50 text-amber-700 border-amber-100",

    PARTIALLY_PAID:
      "bg-blue-50 text-blue-700 border-blue-100",

    SETTLED:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  return (
    <span
      className={`
        rounded-md border px-2 py-1
        font-mono text-[8px]
        font-semibold uppercase tracking-wider
        ${
          styles[status] ||
          "border-slate-200 bg-slate-50 text-slate-500"
        }
      `}
    >
      {status || "ACTIVE"}
    </span>
  );
};

const formatDate = (date) => {
  if (!date) return "No date";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

export default RecordCard;