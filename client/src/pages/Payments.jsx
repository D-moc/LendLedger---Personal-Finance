import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  FileText,
  IndianRupee,
  Search,
  X,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import api from "../services/api";

// =====================================================
// HELPERS
// =====================================================

const formatCurrency = (amount = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getPaymentType = (type) => {
  switch (type) {
    case "PRINCIPAL_PAYMENT":
      return "Principal";

    case "INTEREST_PAYMENT":
      return "Interest";

    case "BOTH_PAYMENT":
      return "Principal + Interest";

    default:
      return "Payment";
  }
};

// =====================================================
// PAYMENTS
// =====================================================

const Payments = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [selectedPayment, setSelectedPayment] = useState(null);

  // ===================================================
  // FETCH PAYMENTS
  // ===================================================

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/payments/all");

      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error("Payments page error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load payments."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD
  // ===================================================

  useEffect(() => {
    fetchPayments();

    const handlePaymentCreated = () => {
      fetchPayments();
    };

    window.addEventListener(
      "DueLedger:payment-created",
      handlePaymentCreated
    );

    return () => {
      window.removeEventListener(
        "DueLedger:payment-created",
        handlePaymentCreated
      );
    };
  }, []);

  // ===================================================
  // SUMMARY
  // ===================================================

  const summary = useMemo(() => {
    let total = 0;
    let principal = 0;
    let interest = 0;

    transactions.forEach((transaction) => {
      total += Number(transaction.totalAmount) || 0;
      principal += Number(transaction.principalAmount) || 0;
      interest += Number(transaction.interestAmount) || 0;
    });

    return {
      total,
      principal,
      interest,
      count: transactions.length,
    };
  }, [transactions]);

  // ===================================================
  // FILTER
  // ===================================================

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const personName =
        transaction.recordId?.personId?.name || "";

      const direction =
        transaction.recordId?.direction || "";

      const type = transaction.type || "";

      const matchesSearch =
        !query ||
        personName.toLowerCase().includes(query) ||
        type.toLowerCase().includes(query);

      let matchesFilter = true;

      if (filter === "GIVEN") {
        matchesFilter = direction === "GIVEN";
      }

      if (filter === "BORROWED") {
        matchesFilter = direction === "BORROWED";
      }

      return matchesSearch && matchesFilter;
    });
  }, [transactions, search, filter]);

  // ===================================================
  // UI
  // ===================================================

  return (
    <DashboardLayout>

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <CreditCard
            size={15}
            className="text-violet-600"
          />

          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-600">
            Financial activity
          </span>
        </div>

        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900">
          Payments
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          View and manage your payment history.
        </p>
      </section>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <SummaryCard
          label="TOTAL PAID"
          value={formatCurrency(summary.total)}
          icon={IndianRupee}
          iconClass="bg-violet-50 text-violet-600"
        />

        <SummaryCard
          label="PRINCIPAL PAID"
          value={formatCurrency(summary.principal)}
          icon={CreditCard}
          iconClass="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          label="INTEREST PAID"
          value={formatCurrency(summary.interest)}
          icon={IndianRupee}
          iconClass="bg-amber-50 text-amber-600"
        />

        <SummaryCard
          label="PAYMENTS"
          value={summary.count}
          icon={FileText}
          iconClass="bg-emerald-50 text-emerald-600"
        />

      </section>


      {/* =================================================
          SEARCH + FILTER
      ================================================= */}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02]">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          {/* Search */}

          <div className="relative w-full lg:max-w-xl">

            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search person or payment..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                pl-11
                pr-10
                text-sm
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-violet-300
                focus:bg-white
                focus:ring-4
                focus:ring-violet-500/5
              "
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  rounded-md
                  p-1
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                "
              >
                <X size={14} />
              </button>
            )}

          </div>


          {/* Filters */}

          <div className="flex gap-2">

            <FilterButton
              active={filter === "ALL"}
              onClick={() => setFilter("ALL")}
            >
              All
            </FilterButton>

            <FilterButton
              active={filter === "GIVEN"}
              onClick={() => setFilter("GIVEN")}
            >
              Given
            </FilterButton>

            <FilterButton
              active={filter === "BORROWED"}
              onClick={() => setFilter("BORROWED")}
            >
              Borrowed
            </FilterButton>

          </div>

        </div>

      </section>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}


      {/* =================================================
          PAYMENT HISTORY
      ================================================= */}

      <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">

        {/* Section header */}

        <div className="border-b border-slate-100 px-5 py-5">

          <p className="font-display text-lg font-bold text-slate-900">
            Payment history
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {filteredPayments.length} payment
            {filteredPayments.length === 1 ? "" : "s"} found
          </p>

        </div>


        {/* Loading */}

        {loading && (
          <div className="space-y-3 p-5">

            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl bg-slate-50"
              />
            ))}

          </div>
        )}


        {/* Empty */}

        {!loading && filteredPayments.length === 0 && (
          <div className="p-12 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
              <CreditCard size={20} />
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700">
              No payments found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Payments recorded against your financial
              records will appear here.
            </p>

          </div>
        )}


        {/* Desktop table */}

        {!loading && filteredPayments.length > 0 && (
          <div className="hidden overflow-x-auto md:block">

            <table className="w-full">

              <thead>
                <tr className="border-b border-slate-100">

                  <TableHead>
                    DATE
                  </TableHead>

                  <TableHead>
                    PERSON
                  </TableHead>

                  <TableHead>
                    DIRECTION
                  </TableHead>

                  <TableHead>
                    TYPE
                  </TableHead>

                  <TableHead>
                    PRINCIPAL
                  </TableHead>

                  <TableHead>
                    INTEREST
                  </TableHead>

                  <TableHead align="right">
                    TOTAL
                  </TableHead>

                </tr>
              </thead>


              <tbody>

                {filteredPayments.map((payment) => (
                  <PaymentRow
                    key={payment._id}
                    payment={payment}
                    onClick={() =>
                      setSelectedPayment(payment)
                    }
                  />
                ))}

              </tbody>

            </table>

          </div>
        )}


        {/* Mobile */}

        {!loading && filteredPayments.length > 0 && (
          <div className="space-y-2 p-3 md:hidden">

            {filteredPayments.map((payment) => (
              <MobilePaymentCard
                key={payment._id}
                payment={payment}
                onClick={() =>
                  setSelectedPayment(payment)
                }
              />
            ))}

          </div>
        )}

      </section>


      {/* =================================================
          DETAILS MODAL
      ================================================= */}

      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() =>
            setSelectedPayment(null)
          }
        />
      )}

    </DashboardLayout>
  );
};


// =====================================================
// SUMMARY CARD
// =====================================================

const SummaryCard = ({
  label,
  value,
  icon: Icon,
  iconClass,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">

      <div
        className={`
          mb-6
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          ${iconClass}
        `}
      >
        <Icon size={16} />
      </div>

      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 font-mono text-xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
};


// =====================================================
// FILTER BUTTON
// =====================================================

const FilterButton = ({
  active,
  children,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-lg
        px-4
        py-2.5
        text-xs
        font-semibold
        transition

        ${
          active
            ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
            : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }
      `}
    >
      {children}
    </button>
  );
};


// =====================================================
// TABLE HEAD
// =====================================================

const TableHead = ({
  children,
  align = "left",
}) => {
  return (
    <th
      className={`
        px-5
        py-3
        text-[9px]
        font-semibold
        tracking-wider
        text-slate-400

        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
};


// =====================================================
// PAYMENT ROW
// =====================================================

const PaymentRow = ({
  payment,
  onClick,
}) => {
  const record = payment.recordId;
  const person = record?.personId;

  const isGiven =
    record?.direction === "GIVEN";

  return (
    <tr
      onClick={onClick}
      className="
        cursor-pointer
        border-b
        border-slate-100
        transition
        hover:bg-slate-50/70
      "
    >

      {/* Date */}

      <td className="px-5 py-4">

        <div className="flex items-center gap-2 text-xs text-slate-500">

          <CalendarDays
            size={13}
            className="text-slate-400"
          />

          {formatDate(
            payment.transactionDate
          )}

        </div>

      </td>


      {/* Person */}

      <td className="px-5 py-4">

        <p className="text-sm font-bold text-slate-900">
          {person?.name || "Unknown"}
        </p>

      </td>


      {/* Direction */}

      <td className="px-5 py-4">

        <div
          className={`
            flex
            w-fit
            items-center
            gap-1.5
            rounded-lg
            px-2.5
            py-1.5
            text-[9px]
            font-semibold
            uppercase

            ${
              isGiven
                ? "bg-emerald-50 text-emerald-600"
                : "bg-orange-50 text-orange-600"
            }
          `}
        >

          {isGiven ? (
            <ArrowUpRight size={11} />
          ) : (
            <ArrowDownLeft size={11} />
          )}

          {isGiven
            ? "Given"
            : "Borrowed"}

        </div>

      </td>


      {/* Type */}

      <td className="px-5 py-4">

        <span className="text-xs font-medium text-slate-500">
          {getPaymentType(payment.type)}
        </span>

      </td>


      {/* Principal */}

      <td className="px-5 py-4">

        <span className="font-mono text-xs font-medium text-slate-600">
          {formatCurrency(
            payment.principalAmount
          )}
        </span>

      </td>


      {/* Interest */}

      <td className="px-5 py-4">

        <span className="font-mono text-xs font-medium text-slate-600">
          {formatCurrency(
            payment.interestAmount
          )}
        </span>

      </td>


      {/* Total */}

      <td className="px-5 py-4 text-right">

        <span className="font-mono text-sm font-bold text-emerald-600">
          {formatCurrency(
            payment.totalAmount
          )}
        </span>

      </td>

    </tr>
  );
};


// =====================================================
// MOBILE PAYMENT CARD
// =====================================================

const MobilePaymentCard = ({
  payment,
  onClick,
}) => {
  const record = payment.recordId;
  const person = record?.personId;

  const isGiven =
    record?.direction === "GIVEN";

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        w-full
        rounded-xl
        border
        border-slate-200
        bg-white
        p-4
        text-left
        transition
        hover:bg-slate-50
      "
    >

      <div className="flex items-center justify-between gap-3">

        <div className="flex items-center gap-3">

          <div
            className={`
              flex
              h-10
              w-10
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
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownLeft size={16} />
            )}
          </div>


          <div>

            <p className="text-sm font-bold text-slate-900">
              {person?.name || "Unknown"}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              {formatDate(
                payment.transactionDate
              )}
            </p>

          </div>

        </div>


        <p className="font-mono text-sm font-bold text-emerald-600">
          {formatCurrency(
            payment.totalAmount
          )}
        </p>

      </div>


      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">

        <MobileDetail
          label="TYPE"
          value={getPaymentType(payment.type)}
        />

        <MobileDetail
          label="PRINCIPAL"
          value={formatCurrency(
            payment.principalAmount
          )}
        />

        <MobileDetail
          label="INTEREST"
          value={formatCurrency(
            payment.interestAmount
          )}
        />

      </div>

    </button>
  );
};


// =====================================================
// MOBILE DETAIL
// =====================================================

const MobileDetail = ({
  label,
  value,
}) => {
  return (
    <div>

      <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[10px] font-medium text-slate-600">
        {value}
      </p>

    </div>
  );
};


// =====================================================
// PAYMENT DETAILS MODAL
// =====================================================

const PaymentDetailsModal = ({
  payment,
  onClose,
}) => {
  const record = payment.recordId;
  const person = record?.personId;

  const isGiven =
    record?.direction === "GIVEN";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-sm">

      {/* Overlay */}

      <div
        className="absolute inset-0"
        onClick={onClose}
      />


      {/* Modal */}

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

          <div>

            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-violet-600">
              Payment details
            </p>

            <h2 className="mt-2 font-display text-xl font-bold text-slate-900">
              {person?.name ||
                "Unknown person"}
            </h2>

          </div>


          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-50
              hover:text-slate-700
            "
          >
            <X size={17} />
          </button>

        </div>


        {/* Content */}

        <div className="p-6">

          {/* Amount */}

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">

            <p className="text-[9px] font-semibold uppercase tracking-wider text-emerald-600">
              Payment amount
            </p>

            <p className="mt-2 font-mono text-3xl font-bold text-emerald-700">
              {formatCurrency(
                payment.totalAmount
              )}
            </p>

          </div>


          {/* Information */}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">

            <PaymentInfo
              label="DATE"
              value={formatDate(
                payment.transactionDate
              )}
            />

            <PaymentInfo
              label="TYPE"
              value={getPaymentType(
                payment.type
              )}
            />

            <PaymentInfo
              label="PRINCIPAL"
              value={formatCurrency(
                payment.principalAmount
              )}
            />

            <PaymentInfo
              label="INTEREST"
              value={formatCurrency(
                payment.interestAmount
              )}
            />

          </div>


          {/* Record */}

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Record
            </p>

            <div className="mt-2 flex items-center gap-2">

              {isGiven ? (
                <ArrowUpRight
                  size={15}
                  className="text-emerald-600"
                />
              ) : (
                <ArrowDownLeft
                  size={15}
                  className="text-orange-600"
                />
              )}

              <span className="text-sm font-medium text-slate-700">
                {isGiven
                  ? "Money given"
                  : "Money borrowed"}
              </span>

            </div>

          </div>


          {/* Note */}

          {payment.note && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">

              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Note
              </p>

              <p className="mt-2 text-sm leading-5 text-slate-600">
                {payment.note}
              </p>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};


// =====================================================
// PAYMENT INFO
// =====================================================

const PaymentInfo = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 font-mono text-xs font-semibold text-slate-700">
        {value}
      </p>

    </div>
  );
};

export default Payments;