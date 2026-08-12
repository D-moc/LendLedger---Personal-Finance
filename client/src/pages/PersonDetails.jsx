import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Wallet,
  Percent,
  FileText,
  CalendarDays,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import AddRecordModal from "../components/people/AddRecordModal";

import api from "../services/api";

// =========================================================
// HELPERS
// =========================================================

const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =========================================================
// PERSON DETAILS
// =========================================================

const PersonDetails = () => {
  const { personId } = useParams();
  const navigate = useNavigate();

  const [person, setPerson] = useState(null);
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [addRecordOpen, setAddRecordOpen] =
    useState(false);

  // =======================================================
  // FETCH PERSON
  // =======================================================

  const fetchPerson = async () => {
    try {
      setError("");

      const [
        personResponse,
        summaryResponse,
        recordsResponse,
      ] = await Promise.all([
        api.get(`/people/${personId}`),

        api.get(
          `/people/${personId}/summary`
        ),

        api.get(
          `/records?personId=${personId}`
        ),
      ]);

      setPerson(
        personResponse.data.person
      );

      setSummary(
        summaryResponse.data.summary
      );

      setRecords(
        recordsResponse.data.records || []
      );
    } catch (error) {
      console.error(
        "Person details error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load person details."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPerson();
  }, [personId]);

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPerson();
  };

  // =======================================================
  // RECORD CREATED
  // =======================================================

  const handleRecordCreated = async () => {
    setAddRecordOpen(false);
    await fetchPerson();
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <DashboardLayout>

        <div className="mx-auto max-w-7xl">

          <div className="mb-6 h-5 w-28 animate-pulse rounded-lg bg-slate-200" />

          <div className="mb-6 h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  h-32
                  animate-pulse
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                "
              />
            ))}

          </div>

          <div className="mt-6 h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />

        </div>

      </DashboardLayout>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error || !person) {
    return (
      <DashboardLayout>

        <div className="mx-auto max-w-7xl">

          <button
            type="button"
            onClick={() =>
              navigate("/people")
            }
            className="
              mb-6
              inline-flex
              items-center
              gap-2
              text-xs
              font-medium
              text-slate-500
              transition
              hover:text-violet-600
            "
          >
            <ArrowLeft size={14} />

            Back to people
          </button>

          <div
            className="
              rounded-2xl
              border
              border-red-100
              bg-red-50
              px-5
              py-4
              text-sm
              text-red-600
            "
          >
            {error || "Person not found."}
          </div>

        </div>

      </DashboardLayout>
    );
  }

  // =======================================================
  // INITIALS
  // =======================================================

  const initials =
    person.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  // =======================================================
  // MAIN
  // =======================================================

  return (
    <DashboardLayout>

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate("/people")
          }
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            text-xs
            font-medium
            text-slate-500
            transition
            hover:text-violet-600
          "
        >
          <ArrowLeft size={14} />

          Back to people
        </button>


        {/* =================================================
            PERSON HEADER
        ================================================= */}

        <section
          className="
            mb-7
            flex
            flex-col
            gap-5
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            shadow-slate-200/40
            sm:p-6
            md:flex-row
            md:items-center
            md:justify-between
          "
        >

          <div className="flex items-center gap-4">

            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-violet-50
                font-display
                text-lg
                font-bold
                text-violet-600
              "
            >
              {initials}
            </div>


            <div>

              <p
                className="
                  mb-1
                  font-mono
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.25em]
                  text-violet-600
                "
              >
                Person profile
              </p>

              <h1
                className="
                  font-display
                  text-2xl
                  font-semibold
                  tracking-tight
                  text-slate-900
                  sm:text-3xl
                "
              >
                {person.name}
              </h1>

              {person.phone && (
                <p
                  className="
                    mt-1
                    text-xs
                    text-slate-400
                  "
                >
                  {person.phone}
                </p>
              )}

            </div>

          </div>


          {/* ACTIONS */}

          <div className="flex gap-2">

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-2.5
                text-xs
                font-medium
                text-slate-500
                transition
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-800
                disabled:opacity-50
              "
            >

              <RefreshCw
                size={14}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh

            </button>


            <button
              type="button"
              onClick={() =>
                setAddRecordOpen(true)
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-violet-600
                px-4
                py-2.5
                text-xs
                font-semibold
                text-white
                shadow-sm
                shadow-violet-200
                transition
                hover:bg-violet-700
                active:scale-[0.98]
              "
            >

              <Plus size={15} />

              Add record

            </button>

          </div>

        </section>


        {/* =================================================
            SUMMARY
        ================================================= */}

        <section
          className="
            grid
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >

          <SummaryCard
            label="MONEY GIVEN"
            value={formatCurrency(
              summary?.totalGiven
            )}
            icon={ArrowUpRight}
            iconClass="bg-emerald-50 text-emerald-600"
          />


          <SummaryCard
            label="MONEY BORROWED"
            value={formatCurrency(
              summary?.totalBorrowed
            )}
            icon={ArrowDownLeft}
            iconClass="bg-orange-50 text-orange-600"
          />


          <SummaryCard
            label="PRINCIPAL OUTSTANDING"
            value={formatCurrency(
              summary?.outstandingPrincipal
            )}
            icon={Wallet}
            iconClass="bg-violet-50 text-violet-600"
          />


          <SummaryCard
            label="INTEREST OUTSTANDING"
            value={formatCurrency(
              summary?.outstandingInterest
            )}
            icon={Percent}
            iconClass="bg-red-50 text-red-600"
          />

        </section>


        {/* =================================================
            TOTAL OUTSTANDING
        ================================================= */}

        <section
          className="
            mt-6
            rounded-2xl
            border
            border-violet-100
            bg-gradient-to-r
            from-violet-50
            to-white
            p-6
          "
        >

          <div
            className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div>

              <p
                className="
                  font-mono
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.25em]
                  text-violet-600
                "
              >
                Total outstanding
              </p>

              <p
                className="
                  mt-2
                  font-display
                  text-3xl
                  font-semibold
                  tracking-tight
                  text-slate-900
                "
              >
                {formatCurrency(
                  summary?.totalOutstanding
                )}
              </p>

            </div>


            <div className="sm:text-right">

              <p
                className="
                  font-mono
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Financial records
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  font-semibold
                  text-slate-800
                "
              >
                {summary?.recordCount || 0}
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            NOTES
        ================================================= */}

        {person.notes && (
          <section
            className="
              mt-6
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              shadow-slate-200/30
            "
          >

            <div className="flex gap-3">

              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-slate-50
                  text-slate-500
                "
              >
                <FileText size={16} />
              </div>


              <div>

                <p
                  className="
                    font-mono
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-wider
                    text-slate-400
                  "
                >
                  Notes
                </p>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-slate-600
                  "
                >
                  {person.notes}
                </p>

              </div>

            </div>

          </section>
        )}


        {/* =================================================
            RECORDS
        ================================================= */}

        <section className="mt-9">

          <div
            className="
              mb-5
              flex
              items-end
              justify-between
            "
          >

            <div>

              <div className="flex items-center gap-2">

                <CalendarDays
                  size={14}
                  className="text-violet-600"
                />

                <p
                  className="
                    font-mono
                    text-[9px]
                    font-medium
                    uppercase
                    tracking-[0.25em]
                    text-violet-600
                  "
                >
                  Ledger
                </p>

              </div>

              <h2
                className="
                  mt-1
                  font-display
                  text-xl
                  font-semibold
                  text-slate-900
                "
              >
                Financial records
              </h2>

            </div>


            <span
              className="
                font-mono
                text-[9px]
                font-medium
                uppercase
                tracking-wider
                text-slate-400
              "
            >
              {records.length}{" "}
              {records.length === 1
                ? "record"
                : "records"}
            </span>

          </div>


          {records.length === 0 ? (

            <EmptyRecords
              onAdd={() =>
                setAddRecordOpen(true)
              }
            />

          ) : (

            <div className="space-y-3">

              {records.map((record) => (
                <FinancialRecordCard
                  key={record._id}
                  record={record}
                  onClick={() =>
                    navigate(
                      `/records/${record._id}`
                    )
                  }
                />
              ))}

            </div>

          )}

        </section>


        {/* =================================================
            ADD RECORD MODAL
        ================================================= */}

        <AddRecordModal
          open={addRecordOpen}
          person={person}
          onClose={() =>
            setAddRecordOpen(false)
          }
          onCreated={
            handleRecordCreated
          }
        />

      </div>

    </DashboardLayout>
  );
};


// =========================================================
// SUMMARY CARD
// =========================================================

const SummaryCard = ({
  label,
  value,
  icon: Icon,
  iconClass,
}) => {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        shadow-slate-200/30
      "
    >

      <div className="flex items-center justify-between">

        <div
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            ${iconClass}
          `}
        >
          <Icon size={17} />
        </div>

        <span
          className="
            font-mono
            text-[8px]
            font-medium
            uppercase
            tracking-wider
            text-slate-400
          "
        >
          {label}
        </span>

      </div>


      <p
        className="
          mt-6
          font-display
          text-2xl
          font-semibold
          tracking-tight
          text-slate-900
        "
      >
        {value}
      </p>

    </div>
  );
};


// =========================================================
// FINANCIAL RECORD CARD
// =========================================================

const FinancialRecordCard = ({
  record,
  onClick,
}) => {
  const isGiven =
    record.direction === "GIVEN";

  const totalOutstanding =
    (record.outstandingPrincipal || 0) +
    (record.outstandingInterest || 0);

  const statusClass =
    record.status === "OVERDUE"
      ? "bg-red-50 text-red-600"
      : record.status === "SETTLED"
        ? "bg-emerald-50 text-emerald-600"
        : "bg-violet-50 text-violet-600";

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        w-full
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        text-left
        shadow-sm
        shadow-slate-200/30
        transition
        hover:-translate-y-[1px]
        hover:border-violet-200
        hover:shadow-md
        hover:shadow-slate-200/50
      "
    >

      {/* TOP */}

      <div
        className="
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div className="flex items-center gap-4">

          <div
            className={`
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              ${
                isGiven
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-orange-50 text-orange-600"
              }
            `}
          >
            {isGiven ? (
              <ArrowUpRight size={18} />
            ) : (
              <ArrowDownLeft size={18} />
            )}
          </div>


          <div>

            <div className="flex flex-wrap items-center gap-2">

              <p
                className="
                  text-sm
                  font-semibold
                  text-slate-800
                "
              >
                {isGiven
                  ? "Money Given"
                  : "Money Borrowed"}
              </p>


              <span
                className={`
                  rounded-md
                  px-2
                  py-1
                  font-mono
                  text-[8px]
                  font-medium
                  uppercase
                  ${statusClass}
                `}
              >
                {record.status}
              </span>

            </div>


            <div
              className="
                mt-1
                flex
                flex-wrap
                items-center
                gap-2
              "
            >

              <span
                className="
                  font-mono
                  text-[9px]
                  text-slate-400
                "
              >
                {record.interestRate}% monthly
              </span>

              <span className="text-slate-300">
                •
              </span>

              <span
                className="
                  font-mono
                  text-[9px]
                  text-slate-400
                "
              >
                {record.interestType ||
                  "MONTHLY"}
              </span>

            </div>

          </div>

        </div>


        {/* OUTSTANDING */}

        <div className="sm:text-right">

          <p
            className="
              font-display
              text-xl
              font-semibold
              text-slate-900
            "
          >
            {formatCurrency(
              totalOutstanding
            )}
          </p>

          <p
            className="
              mt-1
              font-mono
              text-[8px]
              font-medium
              uppercase
              tracking-wider
              text-slate-400
            "
          >
            Outstanding
          </p>

        </div>

      </div>


      {/* STATS */}

      <div
        className="
          mt-5
          grid
          grid-cols-2
          gap-4
          border-t
          border-slate-100
          pt-4
          sm:grid-cols-4
        "
      >

        <RecordStat
          label="ORIGINAL"
          value={formatCurrency(
            record.originalPrincipal
          )}
        />


        <RecordStat
          label="PRINCIPAL DUE"
          value={formatCurrency(
            record.outstandingPrincipal
          )}
        />


        <RecordStat
          label="INTEREST DUE"
          value={formatCurrency(
            record.outstandingInterest
          )}
        />


        <RecordStat
          label="START DATE"
          value={formatDate(
            record.startDate
          )}
        />

      </div>

    </button>
  );
};


// =========================================================
// RECORD STAT
// =========================================================

const RecordStat = ({
  label,
  value,
}) => {
  return (
    <div>

      <p
        className="
          font-mono
          text-[8px]
          font-medium
          uppercase
          tracking-wider
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          truncate
          font-mono
          text-xs
          font-medium
          text-slate-700
        "
      >
        {value}
      </p>

    </div>
  );
};


// =========================================================
// EMPTY RECORDS
// =========================================================

const EmptyRecords = ({
  onAdd,
}) => {
  return (
    <div
      className="
        flex
        min-h-[300px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-slate-200
        bg-white
        px-6
        text-center
      "
    >

      <div
        className="
          mb-4
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-violet-50
          text-violet-600
        "
      >
        <Wallet size={20} />
      </div>


      <h3
        className="
          font-display
          text-base
          font-semibold
          text-slate-900
        "
      >
        No financial records
      </h3>


      <p
        className="
          mt-2
          max-w-sm
          text-xs
          leading-5
          text-slate-500
        "
      >
        Add a money given or borrowed
        record for this person.
      </p>


      <button
        type="button"
        onClick={onAdd}
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          rounded-xl
          bg-violet-600
          px-4
          py-2.5
          text-xs
          font-semibold
          text-white
          transition
          hover:bg-violet-700
        "
      >
        <Plus size={14} />

        Add financial record
      </button>

    </div>
  );
};

export default PersonDetails;