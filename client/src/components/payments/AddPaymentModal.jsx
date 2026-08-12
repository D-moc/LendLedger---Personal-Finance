import { useState } from "react";

import {
  X,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

import api from "../../services/api";

const AddPaymentModal = ({
  open,
  record,
  onClose,
  onCreated,
}) => {
  const [paymentType, setPaymentType] = useState("BOTH");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestAmount, setInterestAmount] = useState("");

  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !record) return null;

  const outstandingPrincipal = Number(
    record.outstandingPrincipal || 0
  );

  const outstandingInterest = Number(
    record.outstandingInterest || 0
  );

  const totalOutstanding =
    outstandingPrincipal + outstandingInterest;

  const handleTypeChange = (type) => {
    setPaymentType(type);
    setError("");

    if (type === "PRINCIPAL") {
      setInterestAmount("");
    }

    if (type === "INTEREST") {
      setPrincipalAmount("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const principal = Number(principalAmount || 0);
    const interest = Number(interestAmount || 0);

    if (
      !Number.isFinite(principal) ||
      !Number.isFinite(interest)
    ) {
      setError("Enter valid payment amounts.");
      return;
    }

    if (principal < 0 || interest < 0) {
      setError("Payment amounts cannot be negative.");
      return;
    }

    if (
      paymentType === "PRINCIPAL" &&
      principal <= 0
    ) {
      setError("Enter a principal payment amount.");
      return;
    }

    if (
      paymentType === "INTEREST" &&
      interest <= 0
    ) {
      setError("Enter an interest payment amount.");
      return;
    }

    if (
      paymentType === "BOTH" &&
      principal + interest <= 0
    ) {
      setError("Enter a payment amount.");
      return;
    }

    if (principal > outstandingPrincipal) {
      setError(
        "Principal payment cannot exceed the outstanding principal."
      );
      return;
    }

    if (interest > outstandingInterest) {
      setError(
        "Interest payment cannot exceed the outstanding interest."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/payments", {
        recordId: record._id,
        principalAmount: principal,
        interestAmount: interest,
        transactionDate: paymentDate,
        note: notes.trim(),
      });

      const {
        transaction,
        record: updatedRecord,
      } = response.data;

      window.dispatchEvent(
        new CustomEvent(
          "lendledger:payment-created",
          {
            detail: {
              transaction,
              record: updatedRecord,
              recordId: record._id,
            },
          }
        )
      );

      if (onCreated) {
        await onCreated(response.data);
      }

      setPaymentType("BOTH");
      setPrincipalAmount("");
      setInterestAmount("");
      setPaymentDate(
        new Date().toISOString().split("T")[0]
      );
      setNotes("");
      setError("");

      onClose();
    } catch (error) {
      console.error("Payment error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to record payment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm">

      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <CreditCard size={17} />
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">
                Record payment
              </h2>

              <p className="text-xs text-slate-400">
                Add payment to this record
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          >
            <X size={17} />
          </button>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >

          {/* Outstanding */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Outstanding
              </p>

              <p className="mt-1 font-mono text-xl font-bold text-slate-900">
                ₹{totalOutstanding.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="text-right text-xs text-slate-500">
              <p>
                Principal: ₹
                {outstandingPrincipal.toLocaleString("en-IN")}
              </p>

              <p className="mt-1">
                Interest: ₹
                {outstandingInterest.toLocaleString("en-IN")}
              </p>
            </div>

          </div>

          {/* Payment Type */}
          <div>

            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Payment type
            </label>

            <div className="grid grid-cols-3 gap-2">

              <PaymentType
                active={paymentType === "PRINCIPAL"}
                onClick={() =>
                  handleTypeChange("PRINCIPAL")
                }
                label="Principal"
                icon={ArrowUpRight}
              />

              <PaymentType
                active={paymentType === "INTEREST"}
                onClick={() =>
                  handleTypeChange("INTEREST")
                }
                label="Interest"
                icon={CreditCard}
              />

              <PaymentType
                active={paymentType === "BOTH"}
                onClick={() =>
                  handleTypeChange("BOTH")
                }
                label="Both"
                icon={ArrowDownLeft}
              />

            </div>

          </div>

          {/* Amounts */}
          <div className="grid gap-3 sm:grid-cols-2">

            {(paymentType === "PRINCIPAL" ||
              paymentType === "BOTH") && (
              <AmountInput
                label="Principal"
                value={principalAmount}
                onChange={setPrincipalAmount}
                max={outstandingPrincipal}
              />
            )}

            {(paymentType === "INTEREST" ||
              paymentType === "BOTH") && (
              <AmountInput
                label="Interest"
                value={interestAmount}
                onChange={setInterestAmount}
                max={outstandingInterest}
              />
            )}

          </div>

          {/* Date */}
          <div>

            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Payment date
            </label>

            <input
              type="date"
              value={paymentDate}
              onChange={(event) =>
                setPaymentDate(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10"
            />

          </div>

          {/* Note */}
          <div>

            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Note
            </label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              rows={2}
              maxLength={500}
              placeholder="Optional note..."
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10"
            />

          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">

            <span className="text-xs font-medium text-slate-500">
              Payment total
            </span>

            <span className="font-mono text-lg font-bold text-slate-900">
              ₹
              {(
                Number(principalAmount || 0) +
                Number(interestAmount || 0)
              ).toLocaleString("en-IN")}
            </span>

          </div>

          {/* Buttons */}
          <div className="flex gap-2">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {loading
                ? "Recording..."
                : "Record payment"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

const PaymentType = ({
  active,
  onClick,
  label,
  icon: Icon,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center justify-center gap-2
        rounded-xl border px-3 py-2.5
        text-xs font-semibold transition
        ${
          active
            ? "border-violet-200 bg-violet-50 text-violet-700"
            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
        }
      `}
    >
      <Icon size={14} />
      {label}
    </button>
  );
};

const AmountInput = ({
  label,
  value,
  onChange,
  max,
}) => {
  return (
    <div>

      <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <div className="relative">

        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
          ₹
        </span>

        <input
          type="number"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          min="0"
          max={max}
          step="0.01"
          placeholder="0"
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-8 pr-3 font-mono text-sm text-slate-700 outline-none placeholder:text-slate-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10"
        />

      </div>

      <p className="mt-1 text-[9px] text-slate-400">
        Max ₹{max.toLocaleString("en-IN")}
      </p>

    </div>
  );
};

export default AddPaymentModal;