import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AddPaymentModal from "../components/payments/AddPaymentModal";

import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Clock,
  CreditCard,
  FileText,
  Percent,
  RefreshCw,
  Wallet,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
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
// INTEREST STATUS
// =========================================================

const getInterestStatus = (record) => {
  if (record.interestType !== "MONTHLY") {
    return {
      label: "No interest",
      description:
        "This record does not use monthly interest.",
      className:
        "border-slate-200 bg-slate-50 text-slate-500",
    };
  }

  if (record.status === "SETTLED") {
    return {
      label: "Settled",
      description:
        "This financial record has been fully settled.",
      className:
        "border-emerald-100 bg-emerald-50 text-emerald-600",
    };
  }

  if (!record.nextInterestDate) {
    return {
      label: "Not scheduled",
      description:
        "The next interest date has not been scheduled.",
      className:
        "border-slate-200 bg-slate-50 text-slate-500",
    };
  }

  const today = new Date();
  const nextDate = new Date(
    record.nextInterestDate
  );

  today.setHours(0, 0, 0, 0);
  nextDate.setHours(0, 0, 0, 0);

  const difference =
    nextDate.getTime() - today.getTime();

  const daysRemaining = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  if (daysRemaining < 0) {
    return {
      label: "Overdue",
      description: `${Math.abs(
        daysRemaining
      )} day(s) overdue`,
      className:
        "border-red-100 bg-red-50 text-red-600",
    };
  }

  if (daysRemaining === 0) {
    return {
      label: "Due today",
      description:
        "Interest is due today.",
      className:
        "border-amber-100 bg-amber-50 text-amber-600",
    };
  }

  if (daysRemaining <= 7) {
    return {
      label: "Due soon",
      description: `Due in ${daysRemaining} day(s)`,
      className:
        "border-amber-100 bg-amber-50 text-amber-600",
    };
  }

  return {
    label: "Upcoming",
    description: `Due in ${daysRemaining} days`,
    className:
      "border-emerald-100 bg-emerald-50 text-emerald-600",
  };
};

// =========================================================
// DAYS UNTIL INTEREST
// =========================================================

const getDaysUntilInterest = (
  nextInterestDate
) => {
  if (!nextInterestDate) {
    return null;
  }

  const today = new Date();
  const nextDate = new Date(nextInterestDate);

  today.setHours(0, 0, 0, 0);
  nextDate.setHours(0, 0, 0, 0);

  return Math.ceil(
    (nextDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
};

// =========================================================
// INTEREST ALERT
// =========================================================

const getInterestAlert = (record) => {
  if (record.interestType !== "MONTHLY") {
    return null;
  }

  if (record.status === "SETTLED") {
    return {
      type: "success",
      title: "Record settled",
      message:
        "No further interest will be generated.",
      className:
        "border-emerald-100 bg-emerald-50 text-emerald-700",
    };
  }

  const outstandingInterest = Number(
    record.outstandingInterest || 0
  );

  if (outstandingInterest > 0) {
    return {
      type: "danger",
      title: "Interest outstanding",
      message: `${formatCurrency(
        outstandingInterest
      )} interest is currently due.`,
      className:
        "border-red-100 bg-red-50 text-red-700",
    };
  }

  if (!record.nextInterestDate) {
    return {
      type: "neutral",
      title: "Interest schedule unavailable",
      message:
        "The next interest date has not been scheduled.",
      className:
        "border-slate-200 bg-slate-50 text-slate-600",
    };
  }

  const today = new Date();
  const nextDate = new Date(
    record.nextInterestDate
  );

  today.setHours(0, 0, 0, 0);
  nextDate.setHours(0, 0, 0, 0);

  const days = Math.ceil(
    (nextDate.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (days < 0) {
    return {
      type: "danger",
      title: "Interest overdue",
      message: `The next interest date passed ${Math.abs(
        days
      )} day${
        Math.abs(days) === 1 ? "" : "s"
      } ago.`,
      className:
        "border-red-100 bg-red-50 text-red-700",
    };
  }

  if (days === 0) {
    return {
      type: "warning",
      title: "Interest due today",
      message:
        "Interest is due today and will be processed automatically.",
      className:
        "border-amber-100 bg-amber-50 text-amber-700",
    };
  }

  if (days <= 7) {
    return {
      type: "warning",
      title: "Interest due soon",
      message: `Next interest is due in ${days} day${
        days === 1 ? "" : "s"
      }.`,
      className:
        "border-amber-100 bg-amber-50 text-amber-700",
    };
  }

  return {
    type: "success",
    title: "Interest scheduled",
    message: `Next interest is due in ${days} days.`,
    className:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
  };
};

// =========================================================
// RECORD DETAILS
// =========================================================

const RecordDetails = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [addPaymentOpen, setAddPaymentOpen] =
    useState(false);

  const [transactions, setTransactions] =
    useState([]);

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  // =======================================================
  // FETCH
  // =======================================================

  const fetchRecord = async () => {
    try {
      setError("");

      const response = await api.get(
        `/records/${recordId}`
      );

      const transactionsResponse =
        await api.get(`/payments/${recordId}`);

      setRecord(response.data.record);

      setTransactions(
        transactionsResponse.data.transactions ||
          []
      );
    } catch (error) {
      console.error(
        "Record details error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load this financial record."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [recordId]);

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecord();
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="h-5 w-24 animate-pulse rounded-lg bg-slate-200" />

          <div className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />

          <div className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />

          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </DashboardLayout>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (error || !record) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() =>
              navigate("/records")
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
            Back to records
          </button>

          <div className="
            rounded-2xl
            border
            border-red-100
            bg-red-50
            px-5
            py-4
            text-sm
            text-red-600
          ">
            {error || "Record not found."}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =======================================================
  // VALUES
  // =======================================================

  const isGiven =
    record.direction === "GIVEN";

  const principal = Number(
    record.outstandingPrincipal || 0
  );

  const interest = Number(
    record.outstandingInterest || 0
  );

  const totalOutstanding =
    principal + interest;

  const personName =
    record.personId?.name ||
    "Unknown person";

  const interestAlert =
    getInterestAlert(record);

  // =======================================================
  // UI
  // =======================================================

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">

        {/* BACK */}

        <button
          type="button"
          onClick={() => navigate(-1)}
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
          Back
        </button>


        {/* HEADER */}

        <section className="
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
        ">

          <div>
            <p className="
              mb-1
              font-mono
              text-[9px]
              font-medium
              uppercase
              tracking-[0.25em]
              text-violet-600
            ">
              Financial record
            </p>

            <h1 className="
              font-display
              text-2xl
              font-semibold
              tracking-tight
              text-slate-900
              sm:text-3xl
            ">
              {personName}
            </h1>

            <div className="
              mt-3
              flex
              flex-wrap
              items-center
              gap-2
            ">

              <div className={`
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                ${
                  isGiven
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-orange-50 text-orange-600"
                }
              `}>
                {isGiven ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownLeft size={14} />
                )}
              </div>

              <span className="
                text-xs
                text-slate-500
              ">
                {isGiven
                  ? "Money you gave"
                  : "Money you borrowed"}
              </span>

              <StatusBadge
                status={record.status}
              />
            </div>
          </div>


          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="
              inline-flex
              w-fit
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

        </section>


        {/* TOTAL OUTSTANDING */}

        <section className="
          rounded-2xl
          border
          border-violet-100
          bg-gradient-to-r
          from-violet-50
          to-white
          p-6
          sm:p-8
        ">

          <p className="
            font-mono
            text-[9px]
            font-medium
            uppercase
            tracking-[0.25em]
            text-violet-600
          ">
            Total outstanding
          </p>

          <p className="
            mt-2
            font-display
            text-4xl
            font-semibold
            tracking-tight
            text-slate-900
            sm:text-5xl
          ">
            {formatCurrency(
              totalOutstanding
            )}
          </p>

          <p className="
            mt-2
            text-xs
            text-slate-500
          ">
            Current amount remaining on this record.
          </p>

        </section>


        {/* INTEREST ALERT */}

        {interestAlert && (
          <section className={`
            mt-4
            rounded-2xl
            border
            p-4
            ${interestAlert.className}
          `}>

            <div className="flex items-center gap-3">

              <div className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-white/70
              ">
                {interestAlert.type ===
                "danger" ? (
                  <Percent size={15} />
                ) : interestAlert.type ===
                  "warning" ? (
                  <Clock size={15} />
                ) : (
                  <CalendarDays size={15} />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold">
                  {interestAlert.title}
                </p>

                <p className="
                  mt-1
                  text-[11px]
                  opacity-70
                ">
                  {interestAlert.message}
                </p>
              </div>

            </div>

          </section>
        )}


        {/* FINANCIAL BREAKDOWN */}

        <section className="
          mt-6
          grid
          gap-4
          sm:grid-cols-2
          lg:grid-cols-4
        ">

          <AmountCard
            label="ORIGINAL PRINCIPAL"
            value={formatCurrency(
              record.originalPrincipal
            )}
            icon={Wallet}
          />

          <AmountCard
            label="PRINCIPAL OUTSTANDING"
            value={formatCurrency(principal)}
            icon={CreditCard}
          />


          <div className={`
            rounded-2xl
            border
            bg-white
            p-5
            shadow-sm
            shadow-slate-200/30
            ${
              interest > 0
                ? "border-red-100"
                : "border-slate-200"
            }
          `}>

            <div className={`
              mb-5
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              ${
                interest > 0
                  ? "bg-red-50 text-red-600"
                  : "bg-violet-50 text-violet-600"
              }
            `}>
              <Percent size={15} />
            </div>

            <p className="
              font-mono
              text-[8px]
              font-medium
              uppercase
              tracking-wider
              text-slate-400
            ">
              INTEREST OUTSTANDING
            </p>

            <p className={`
              mt-2
              font-display
              text-lg
              font-semibold
              ${
                interest > 0
                  ? "text-red-600"
                  : "text-slate-800"
              }
            `}>
              {formatCurrency(interest)}
            </p>

            <p className="
              mt-1
              text-[10px]
              text-slate-400
            ">
              {interest > 0
                ? "Payment required"
                : "Nothing currently due"}
            </p>

          </div>


          <AmountCard
            label="INTEREST RATE"
            value={
              record.interestType ===
              "NONE"
                ? "No interest"
                : `${record.interestRate || 0}% / month`
            }
            icon={Percent}
          />

        </section>


        {/* INTEREST SUMMARY */}

        {record.interestType ===
        "MONTHLY" ? (

          <section className="
            mt-6
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            shadow-slate-200/30
          ">

            <div className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-start
              sm:justify-between
            ">

              <div className="flex items-center gap-3">

                <div className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-amber-50
                  text-amber-600
                ">
                  <Percent size={17} />
                </div>

                <div>

                  <p className="
                    font-display
                    text-lg
                    font-semibold
                    text-slate-900
                  ">
                    Interest summary
                  </p>

                  <p className="
                    mt-1
                    text-xs
                    text-slate-400
                  ">
                    Monthly interest details for this record.
                  </p>

                </div>

              </div>


              <div className="
                rounded-xl
                border
                border-amber-100
                bg-amber-50
                px-4
                py-3
              ">

                <p className="
                  font-mono
                  text-[8px]
                  uppercase
                  tracking-wider
                  text-amber-600/60
                ">
                  RATE
                </p>

                <p className="
                  mt-1
                  font-mono
                  text-lg
                  font-semibold
                  text-amber-700
                ">
                  {record.interestRate || 0}%
                  <span className="
                    ml-1
                    text-[10px]
                    font-normal
                    text-amber-600/60
                  ">
                    / month
                  </span>
                </p>

              </div>

            </div>


            {/* AMOUNTS */}

            <div className="
              mt-6
              grid
              gap-3
              sm:grid-cols-2
            ">

              <div className="
                rounded-xl
                border
                border-red-100
                bg-red-50
                p-4
              ">

                <p className="
                  font-mono
                  text-[8px]
                  uppercase
                  tracking-wider
                  text-red-500/60
                ">
                  INTEREST OUTSTANDING
                </p>

                <p className="
                  mt-2
                  font-display
                  text-xl
                  font-semibold
                  text-red-600
                ">
                  {formatCurrency(interest)}
                </p>

                <p className="
                  mt-1
                  text-[10px]
                  text-red-500/60
                ">
                  {interest > 0
                    ? "Payment required"
                    : "Amount currently due"}
                </p>

              </div>


              <div className="
                rounded-xl
                border
                border-emerald-100
                bg-emerald-50
                p-4
              ">

                <p className="
                  font-mono
                  text-[8px]
                  uppercase
                  tracking-wider
                  text-emerald-600/60
                ">
                  INTEREST PAID
                </p>

                <p className="
                  mt-2
                  font-display
                  text-xl
                  font-semibold
                  text-emerald-600
                ">
                  {formatCurrency(
                    record.interestPaid || 0
                  )}
                </p>

                <p className="
                  mt-1
                  text-[10px]
                  text-emerald-600/60
                ">
                  Total interest paid so far
                </p>

              </div>

            </div>


            {/* STATUS */}

            <div className="mt-6">

              {(() => {
                const interestStatus =
                  getInterestStatus(record);

                return (
                  <div className={`
                    rounded-xl
                    border
                    px-4
                    py-4
                    ${interestStatus.className}
                  `}>

                    <div className="
                      flex
                      items-center
                      justify-between
                      gap-4
                    ">

                      <div className="
                        flex
                        items-center
                        gap-3
                      ">

                        <div className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-lg
                          bg-white/70
                        ">
                          <Clock size={15} />
                        </div>

                        <div>

                          <p className="
                            font-mono
                            text-[9px]
                            uppercase
                            tracking-wider
                            opacity-60
                          ">
                            INTEREST STATUS
                          </p>

                          <p className="
                            mt-1
                            text-sm
                            font-semibold
                          ">
                            {interestStatus.label}
                          </p>

                        </div>

                      </div>

                      <p className="
                        text-right
                        text-[10px]
                        opacity-60
                      ">
                        {interestStatus.description}
                      </p>

                    </div>

                  </div>
                );
              })()}

            </div>


            {/* DATES */}

            <div className="
              mt-3
              grid
              gap-3
              sm:grid-cols-2
            ">

              <DateBox
                icon={Clock}
                label="LAST INTEREST CHARGED"
                value={
                  record.lastInterestDate
                    ? formatDate(
                        record.lastInterestDate
                      )
                    : "Not generated yet"
                }
              />


              <div className="
                rounded-xl
                border
                border-slate-200
                bg-slate-50/50
                p-4
              ">

                <div className="
                  flex
                  items-center
                  gap-2
                ">
                  <CalendarDays
                    size={13}
                    className="text-slate-400"
                  />

                  <p className="
                    font-mono
                    text-[8px]
                    uppercase
                    tracking-wider
                    text-slate-400
                  ">
                    NEXT INTEREST DATE
                  </p>
                </div>

                <p className="
                  mt-2
                  font-mono
                  text-xs
                  font-medium
                  text-slate-700
                ">
                  {record.nextInterestDate
                    ? formatDate(
                        record.nextInterestDate
                      )
                    : "Not scheduled"}
                </p>

                {record.nextInterestDate &&
                  record.status !==
                    "SETTLED" && (
                    <p className="
                      mt-1
                      font-mono
                      text-[9px]
                      text-slate-400
                    ">
                      {(() => {
                        const days =
                          getDaysUntilInterest(
                            record.nextInterestDate
                          );

                        if (days < 0) {
                          return `${Math.abs(
                            days
                          )} day(s) overdue`;
                        }

                        if (days === 0) {
                          return "Due today";
                        }

                        return `In ${days} day(s)`;
                      })()}
                    </p>
                  )}

              </div>

            </div>

          </section>

        ) : (

          <section className="
            mt-6
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            shadow-slate-200/30
          ">

            <div className="
              flex
              items-center
              gap-3
            ">

              <div className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-slate-50
                text-slate-500
              ">
                <Percent size={16} />
              </div>

              <div>

                <p className="
                  font-display
                  text-lg
                  font-semibold
                  text-slate-900
                ">
                  No interest
                </p>

                <p className="
                  mt-1
                  text-xs
                  text-slate-400
                ">
                  This record does not have monthly interest.
                </p>

              </div>

            </div>

          </section>
        )}


        {/* AGREEMENT DETAILS */}

        <section className="
          mt-6
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
          shadow-slate-200/30
        ">

          <div className="mb-5">

            <p className="
              font-display
              text-lg
              font-semibold
              text-slate-900
            ">
              Agreement details
            </p>

            <p className="
              mt-1
              text-xs
              text-slate-400
            ">
              Important information about this financial record.
            </p>

          </div>


          <div className="
            grid
            gap-5
            sm:grid-cols-2
            lg:grid-cols-4
          ">

            <Detail
              icon={CalendarDays}
              label="TRANSACTION DATE"
              value={formatDate(
                record.startDate
              )}
            />

            <Detail
              icon={Percent}
              label="INTEREST"
              value={
                record.interestType ===
                "NONE"
                  ? "No interest"
                  : `${record.interestRate || 0}% monthly`
              }
            />

            <Detail
              icon={Clock}
              label="STATUS"
              value={
                record.status || "ACTIVE"
              }
            />

            <Detail
              icon={FileText}
              label="RECORD ID"
              value={record._id?.slice(-8)}
            />

          </div>

        </section>


        {/* NOTES */}

        {record.notes && (
          <section className="
            mt-6
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            shadow-slate-200/30
          ">

            <div className="
              flex
              items-center
              gap-2
            ">

              <FileText
                size={14}
                className="text-slate-400"
              />

              <p className="
                font-mono
                text-[9px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-slate-400
              ">
                Notes
              </p>

            </div>

            <p className="
              mt-3
              text-sm
              leading-6
              text-slate-600
            ">
              {record.notes}
            </p>

          </section>
        )}


        {/* TRANSACTION HISTORY */}

        <section className="
          mt-6
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-6
          shadow-sm
          shadow-slate-200/30
        ">

          <div className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          ">

            <div>

              <p className="
                font-display
                text-lg
                font-semibold
                text-slate-900
              ">
                Transaction history
              </p>

              <p className="
                mt-1
                text-xs
                text-slate-400
              ">
                Complete financial activity for this record.
              </p>

            </div>


            <button
              type="button"
              onClick={() =>
                setAddPaymentOpen(true)
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
              <CreditCard size={14} />
              Add payment
            </button>

          </div>


          <div className="mt-6">

            {transactions.length === 0 ? (

              <div className="
                rounded-xl
                border
                border-dashed
                border-slate-200
                bg-slate-50/50
                p-8
                text-center
              ">

                <FileText
                  size={20}
                  className="
                    mx-auto
                    mb-3
                    text-slate-300
                  "
                />

                <p className="
                  text-sm
                  font-medium
                  text-slate-500
                ">
                  No transactions recorded yet.
                </p>

                <p className="
                  mt-1
                  text-[11px]
                  text-slate-400
                ">
                  Payments and interest charges will appear here.
                </p>

              </div>

            ) : (

              <div className="space-y-2">

                {transactions.map(
                  (transaction) => (
                    <TransactionRow
                      key={transaction._id}
                      transaction={transaction}
                      onClick={() =>
                        setSelectedTransaction(
                          transaction
                        )
                      }
                    />
                  )
                )}

              </div>

            )}

          </div>

        </section>


        {/* PAYMENT MODAL */}

        <AddPaymentModal
          open={addPaymentOpen}
          record={record}
          onClose={() =>
            setAddPaymentOpen(false)
          }
          onCreated={async () => {
            setAddPaymentOpen(false);
            await fetchRecord();
          }}
        />


        {/* TRANSACTION MODAL */}

        {selectedTransaction && (
          <TransactionDetailsModal
            transaction={selectedTransaction}
            record={record}
            onClose={() =>
              setSelectedTransaction(null)
            }
          />
        )}

      </div>
    </DashboardLayout>
  );
};


// =========================================================
// AMOUNT CARD
// =========================================================

const AmountCard = ({
  label,
  value,
  icon: Icon,
}) => {
  return (
    <div className="
      rounded-2xl
      border
      border-slate-200
      bg-white
      p-5
      shadow-sm
      shadow-slate-200/30
    ">

      <div className="
        mb-5
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-xl
        bg-violet-50
        text-violet-600
      ">
        <Icon size={15} />
      </div>

      <p className="
        font-mono
        text-[8px]
        font-medium
        uppercase
        tracking-wider
        text-slate-400
      ">
        {label}
      </p>

      <p className="
        mt-2
        font-display
        text-lg
        font-semibold
        text-slate-900
      ">
        {value}
      </p>

    </div>
  );
};


// =========================================================
// DETAIL
// =========================================================

const Detail = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="
      flex
      items-start
      gap-3
    ">

      <Icon
        size={15}
        className="mt-0.5 text-slate-400"
      />

      <div>

        <p className="
          font-mono
          text-[8px]
          font-medium
          uppercase
          tracking-wider
          text-slate-400
        ">
          {label}
        </p>

        <p className="
          mt-1
          font-mono
          text-xs
          font-medium
          text-slate-700
        ">
          {value || "—"}
        </p>

      </div>

    </div>
  );
};


// =========================================================
// DATE BOX
// =========================================================

const DateBox = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="
      rounded-xl
      border
      border-slate-200
      bg-slate-50/50
      p-4
    ">

      <div className="
        flex
        items-center
        gap-2
      ">

        <Icon
          size={13}
          className="text-slate-400"
        />

        <p className="
          font-mono
          text-[8px]
          uppercase
          tracking-wider
          text-slate-400
        ">
          {label}
        </p>

      </div>

      <p className="
        mt-2
        font-mono
        text-xs
        font-medium
        text-slate-700
      ">
        {value}
      </p>

    </div>
  );
};


// =========================================================
// TRANSACTION ROW
// =========================================================

const TransactionRow = ({
  transaction,
  onClick,
}) => {
  const {
    type,
    principalAmount = 0,
    interestAmount = 0,
    totalAmount = 0,
    transactionDate,
    note,
  } = transaction;

  const getTitle = () => {
    switch (type) {
      case "INITIAL":
        return "Initial amount";

      case "PRINCIPAL_PAYMENT":
        return "Principal payment";

      case "INTEREST_PAYMENT":
        return "Interest payment";

      case "BOTH_PAYMENT":
        return "Principal + interest payment";

      case "INTEREST_CHARGE":
        return "Interest charged";

      case "ADJUSTMENT":
        return "Balance adjustment";

      default:
        return "Transaction";
    }
  };

  const isInterestCharge =
    type === "INTEREST_CHARGE";

  const isPayment =
    type === "PRINCIPAL_PAYMENT" ||
    type === "INTEREST_PAYMENT" ||
    type === "BOTH_PAYMENT";

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        w-full
        rounded-xl
        border
        border-slate-200
        bg-white
        p-4
        text-left
        transition
        hover:border-violet-200
        hover:bg-violet-50/30
      "
    >

      <div className="
        flex
        flex-col
        gap-4
        sm:flex-row
        sm:items-center
        sm:justify-between
      ">

        <div className="
          flex
          items-center
          gap-3
        ">

          <div className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            ${
              isInterestCharge
                ? "bg-amber-50 text-amber-600"
                : isPayment
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-violet-50 text-violet-600"
            }
          `}>

            {isInterestCharge ? (
              <Percent size={15} />
            ) : isPayment ? (
              <CreditCard size={15} />
            ) : (
              <FileText size={15} />
            )}

          </div>


          <div>

            <p className="
              text-sm
              font-semibold
              text-slate-800
            ">
              {getTitle()}
            </p>

            <p className="
              mt-1
              font-mono
              text-[9px]
              text-slate-400
            ">
              {formatDate(transactionDate)}
            </p>

          </div>

        </div>


        <p className={`
          font-display
          text-lg
          font-semibold
          ${
            isInterestCharge
              ? "text-amber-600"
              : isPayment
                ? "text-emerald-600"
                : "text-slate-800"
          }
        `}>
          {formatCurrency(totalAmount)}
        </p>

      </div>


      <div className="
        mt-4
        grid
        grid-cols-2
        gap-3
        border-t
        border-slate-100
        pt-3
        sm:grid-cols-3
      ">

        <TransactionDetail
          label="PRINCIPAL"
          value={principalAmount}
        />

        <TransactionDetail
          label="INTEREST"
          value={interestAmount}
        />

        <div className="
          col-span-2
          sm:col-span-1
        ">

          <p className="
            font-mono
            text-[8px]
            uppercase
            text-slate-400
          ">
            NOTE
          </p>

          <p className="
            mt-1
            truncate
            font-mono
            text-xs
            text-slate-600
          ">
            {note || "—"}
          </p>

        </div>

      </div>

    </button>
  );
};


// =========================================================
// TRANSACTION DETAILS MODAL
// =========================================================

const TransactionDetailsModal = ({
  transaction,
  record,
  onClose,
}) => {
  if (!transaction) {
    return null;
  }

  const {
    type,
    principalAmount = 0,
    interestAmount = 0,
    totalAmount = 0,
    transactionDate,
    note,
  } = transaction;

  const isInterestCharge =
    type === "INTEREST_CHARGE";

  const isPayment =
    type === "PRINCIPAL_PAYMENT" ||
    type === "INTEREST_PAYMENT" ||
    type === "BOTH_PAYMENT";

  const personName =
    record?.personId?.name ||
    "Unknown person";

  const direction =
    record?.direction === "GIVEN"
      ? "Money you gave"
      : "Money you borrowed";

  const getTitle = () => {
    switch (type) {
      case "INITIAL":
        return "Initial amount";

      case "PRINCIPAL_PAYMENT":
        return "Principal payment";

      case "INTEREST_PAYMENT":
        return "Interest payment";

      case "BOTH_PAYMENT":
        return "Principal + interest payment";

      case "INTEREST_CHARGE":
        return "Interest charged";

      case "ADJUSTMENT":
        return "Balance adjustment";

      default:
        return "Transaction";
    }
  };

  return (
    <div className="
      fixed
      inset-0
      z-[120]
      flex
      items-center
      justify-center
      bg-slate-950/30
      p-4
      backdrop-blur-sm
    ">

      <button
        type="button"
        aria-label="Close transaction details"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />


      <div className="
        relative
        w-full
        max-w-lg
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-2xl
        shadow-slate-900/10
      ">

        {/* HEADER */}

        <div className="
          flex
          items-start
          justify-between
          border-b
          border-slate-100
          p-6
        ">

          <div>

            <p className="
              font-mono
              text-[9px]
              font-medium
              uppercase
              tracking-[0.25em]
              text-violet-600
            ">
              Transaction details
            </p>

            <h2 className="
              mt-2
              font-display
              text-xl
              font-semibold
              text-slate-900
            ">
              {getTitle()}
            </h2>

            <p className="
              mt-1
              text-xs
              text-slate-400
            ">
              {formatDate(transactionDate)}
            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-slate-50
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            ×
          </button>

        </div>


        {/* BODY */}

        <div className="space-y-4 p-6">

          {/* TOTAL */}

          <div className={`
            rounded-xl
            border
            p-5
            ${
              isInterestCharge
                ? "border-amber-100 bg-amber-50"
                : isPayment
                  ? "border-emerald-100 bg-emerald-50"
                  : "border-violet-100 bg-violet-50"
            }
          `}>

            <p className="
              font-mono
              text-[8px]
              uppercase
              tracking-wider
              text-slate-400
            ">
              TRANSACTION AMOUNT
            </p>

            <p className={`
              mt-2
              font-display
              text-3xl
              font-semibold
              ${
                isInterestCharge
                  ? "text-amber-700"
                  : isPayment
                    ? "text-emerald-700"
                    : "text-slate-900"
              }
            `}>
              {formatCurrency(totalAmount)}
            </p>

          </div>


          {/* PERSON / RECORD */}

          <div className="
            grid
            grid-cols-2
            gap-3
          ">

            <ModalInfo
              label="PERSON"
              value={personName}
            />

            <ModalInfo
              label="RECORD"
              value={direction}
            />

            <ModalInfo
              label="DATE"
              value={formatDate(
                transactionDate
              )}
            />

            <ModalInfo
              label="TYPE"
              value={getTitle()}
            />

          </div>


          {/* BREAKDOWN */}

          <div className="
            rounded-xl
            border
            border-slate-200
            bg-slate-50/50
            p-5
          ">

            <p className="
              font-mono
              text-[8px]
              uppercase
              tracking-wider
              text-slate-400
            ">
              PAYMENT BREAKDOWN
            </p>

            <div className="
              mt-4
              space-y-3
            ">

              <ModalAmount
                label="Principal"
                amount={principalAmount}
              />

              <ModalAmount
                label="Interest"
                amount={interestAmount}
              />

              <div className="
                border-t
                border-slate-200
                pt-3
              ">
                <ModalAmount
                  label="Total"
                  amount={totalAmount}
                  strong
                />
              </div>

            </div>

          </div>


          {/* NOTE */}

          <div className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-4
          ">

            <p className="
              font-mono
              text-[8px]
              uppercase
              tracking-wider
              text-slate-400
            ">
              NOTE
            </p>

            <p className="
              mt-2
              text-xs
              leading-5
              text-slate-600
            ">
              {note || "No note added."}
            </p>

          </div>


          {/* CLOSE */}

          <button
            type="button"
            onClick={onClose}
            className="
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-xs
              font-medium
              text-slate-600
              transition
              hover:bg-slate-50
              hover:text-slate-900
            "
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
};


// =========================================================
// MODAL INFO
// =========================================================

const ModalInfo = ({
  label,
  value,
}) => {
  return (
    <div className="
      rounded-xl
      border
      border-slate-200
      bg-slate-50/50
      p-4
    ">

      <p className="
        font-mono
        text-[8px]
        uppercase
        tracking-wider
        text-slate-400
      ">
        {label}
      </p>

      <p className="
        mt-2
        text-xs
        font-medium
        text-slate-700
      ">
        {value}
      </p>

    </div>
  );
};


// =========================================================
// MODAL AMOUNT
// =========================================================

const ModalAmount = ({
  label,
  amount,
  strong = false,
}) => {
  return (
    <div className="
      flex
      items-center
      justify-between
      gap-4
    ">

      <span className={
        strong
          ? "text-xs font-semibold text-slate-700"
          : "text-xs text-slate-500"
      }>
        {label}
      </span>

      <span className={
        strong
          ? "font-mono text-sm font-semibold text-slate-900"
          : "font-mono text-xs text-slate-600"
      }>
        {formatCurrency(amount)}
      </span>

    </div>
  );
};


// =========================================================
// TRANSACTION DETAIL
// =========================================================

const TransactionDetail = ({
  label,
  value,
}) => {
  return (
    <div>

      <p className="
        font-mono
        text-[8px]
        uppercase
        text-slate-400
      ">
        {label}
      </p>

      <p className="
        mt-1
        font-mono
        text-xs
        text-slate-600
      ">
        {formatCurrency(value || 0)}
      </p>

    </div>
  );
};


// =========================================================
// STATUS BADGE
// =========================================================

const StatusBadge = ({
  status,
}) => {
  const styles = {
    ACTIVE:
      "bg-violet-50 text-violet-600",

    OVERDUE:
      "bg-red-50 text-red-600",

    DUE_SOON:
      "bg-amber-50 text-amber-600",

    PARTIALLY_PAID:
      "bg-blue-50 text-blue-600",

    SETTLED:
      "bg-emerald-50 text-emerald-600",
  };

  const labels = {
    ACTIVE: "ACTIVE",
    OVERDUE: "OVERDUE",
    DUE_SOON: "DUE SOON",
    PARTIALLY_PAID: "PARTIALLY PAID",
    SETTLED: "SETTLED",
  };

  return (
    <span className={`
      rounded-md
      px-2
      py-1
      font-mono
      text-[8px]
      font-medium
      uppercase
      ${
        styles[status] ||
        "bg-slate-100 text-slate-500"
      }
    `}>
      {labels[status] ||
        status ||
        "ACTIVE"}
    </span>
  );
};

export default RecordDetails;