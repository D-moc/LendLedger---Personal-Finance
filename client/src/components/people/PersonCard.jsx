import {
  ArrowDownLeft,
  ArrowUpRight,
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  Phone,
  UserRound,
} from "lucide-react";

const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const PersonCard = ({
  person,
  summary,
  onView,
  onEdit,
  onArchive,
  onRestore,
}) => {
  const initials = person.name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isArchived = Boolean(person.isArchived);

  return (
    <div
      className={`
        group rounded-2xl border bg-white p-5
        shadow-sm shadow-slate-200/30
        transition-all duration-200
        ${
          isArchived
            ? "border-slate-200"
            : "border-slate-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md hover:shadow-slate-200/50"
        }
      `}
    >
      {/* TOP */}

      <div className="flex items-start justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {/* Avatar */}

          <div
            className={`
              flex h-12 w-12 shrink-0 items-center
              justify-center rounded-xl
              font-display text-sm font-bold
              ${
                isArchived
                  ? "bg-slate-100 text-slate-500"
                  : "bg-violet-50 text-violet-600"
              }
            `}
          >
            {initials || <UserRound size={18} />}
          </div>

          {/* Person information */}

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h3
                className="
                  truncate
                  font-display
                  text-xl
                  font-bold
                  leading-tight
                  tracking-[-0.02em]
                  text-slate-900
                "
              >
                {person.name}
              </h3>

              {isArchived && (
                <span
                  className="
                    shrink-0 rounded-md
                    bg-slate-100 px-2 py-1
                    font-mono text-[8px]
                    font-semibold uppercase
                    tracking-wider text-slate-500
                  "
                >
                  Archived
                </span>
              )}
            </div>

            {person.phone ? (
              <div
                className="
                  mt-1.5 flex items-center
                  gap-1.5 text-slate-400
                "
              >
                <Phone size={11} />

                <span className="text-[11px]">
                  {person.phone}
                </span>
              </div>
            ) : (
              <p
                className="
                  mt-1.5 text-[9px]
                  font-medium uppercase
                  tracking-wider text-slate-400
                "
              >
                No phone number
              </p>
            )}
          </div>
        </div>

        {/* Edit */}

        <button
          type="button"
          aria-label="Edit person"
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.(person);
          }}
          className="
            rounded-lg p-2
            text-slate-400
            transition
            hover:bg-slate-50
            hover:text-slate-700
          "
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* STATS */}

      <div className="mt-6 grid grid-cols-3 gap-2">
        <Stat
          label="GIVEN"
          value={formatCurrency(summary?.totalGiven)}
          icon={ArrowUpRight}
          iconClass="text-emerald-500"
        />

        <Stat
          label="BORROWED"
          value={formatCurrency(summary?.totalBorrowed)}
          icon={ArrowDownLeft}
          iconClass="text-orange-500"
        />

        <Stat
          label="DUE"
          value={formatCurrency(summary?.totalOutstanding)}
        />
      </div>

      {/* FOOTER */}

      <div
        className="
          mt-5 flex items-center
          justify-between
          border-t border-slate-100
          pt-4
        "
      >
        <span
          className="
            text-[9px]
            font-medium
            uppercase
            tracking-wider
            text-slate-400
          "
        >
          {summary?.recordCount || 0}{" "}
          {summary?.recordCount === 1
            ? "record"
            : "records"}
        </span>

        <button
          type="button"
          onClick={() => onView?.(person)}
          className="
            text-xs
            font-semibold
            text-violet-600
            transition
            hover:text-violet-700
          "
        >
          View details
          <span className="ml-1">→</span>
        </button>
      </div>

      {/* ARCHIVE / RESTORE */}

      {isArchived ? (
        <button
          type="button"
          onClick={() => onRestore?.(person)}
          className="
            mt-3 flex w-full
            items-center justify-center
            gap-1.5 rounded-lg
            py-2
            text-[10px]
            font-semibold
            text-violet-600
            transition
            hover:bg-violet-50
            hover:text-violet-700
          "
        >
          <ArchiveRestore size={13} />
          Restore person
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onArchive?.(person)}
          className="
            mt-3 flex w-full
            items-center justify-center
            gap-1.5 rounded-lg
            py-2
            text-[10px]
            font-medium
            text-slate-400
            transition
            hover:bg-red-50
            hover:text-red-500
          "
        >
          <Archive size={13} />
          Archive person
        </button>
      )}
    </div>
  );
};

const Stat = ({
  label,
  value,
  icon: Icon,
  iconClass,
}) => {
  return (
    <div
      className="
        min-w-0
        rounded-xl
        border border-slate-100
        bg-slate-50/70
        p-3
      "
    >
      <div className="flex items-center gap-1">
        {Icon && (
          <Icon
            size={11}
            className={iconClass}
          />
        )}

        <span
          className="
            font-mono
            text-[8px]
            font-medium
            tracking-wider
            text-slate-400
          "
        >
          {label}
        </span>
      </div>

      <p
        className="
          mt-2
          truncate
          font-mono
          text-sm
          font-semibold
          text-slate-700
        "
      >
        {value}
      </p>
    </div>
  );
};

export default PersonCard;