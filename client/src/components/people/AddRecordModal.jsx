import { useState } from "react";
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  FilePlus2,
} from "lucide-react";

import api from "../../services/api";

const AddRecordModal = ({
  open,
  person,
  onClose,
  onCreated,
}) => {
  const getInitialForm = () => ({
    direction: "GIVEN",
    originalPrincipal: "",
    interestType: "MONTHLY",
    interestRate: "",
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [form, setForm] = useState(getInitialForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !person) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const amount = Number(form.originalPrincipal);
    const interestRate = Number(form.interestRate || 0);

    if (!amount || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (interestRate < 0 || interestRate > 100) {
      setError("Interest rate must be between 0% and 100%.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/records", {
        personId: person._id,
        direction: form.direction,
        originalPrincipal: amount,
        interestType: form.interestType,
        interestRate,
        startDate: form.startDate,
        notes: form.notes.trim(),
      });

      await onCreated();

      setForm(getInitialForm());
      onClose();
    } catch (error) {
      console.error("Create record error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create financial record."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <FilePlus2 size={17} />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              Add record
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              New financial record for{" "}
              <span className="font-semibold text-slate-600">
                {person.name}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Direction */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Transaction type
            </label>

            <div className="grid grid-cols-2 gap-2">
              <DirectionButton
                active={form.direction === "GIVEN"}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    direction: "GIVEN",
                  }))
                }
                icon={ArrowUpRight}
                title="Money given"
              />

              <DirectionButton
                active={form.direction === "BORROWED"}
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    direction: "BORROWED",
                  }))
                }
                icon={ArrowDownLeft}
                title="Money borrowed"
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Amount <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                ₹
              </span>

              <input
                type="number"
                name="originalPrincipal"
                value={form.originalPrincipal}
                onChange={handleChange}
                placeholder="50,000"
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-9 pr-4 font-mono text-lg font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-violet-300 focus:bg-white"
              />
            </div>
          </div>

          {/* Interest */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Interest
              </label>

              <select
                name="interestType"
                value={form.interestType}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-violet-300"
              >
                <option value="MONTHLY">Monthly interest</option>
                <option value="NONE">No interest</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Interest rate
              </label>

              <div className="relative">
                <input
                  type="number"
                  name="interestRate"
                  value={form.interestRate}
                  onChange={handleChange}
                  placeholder="3"
                  min="0"
                  max="100"
                  step="0.01"
                  disabled={form.interestType === "NONE"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 pr-9 text-sm text-slate-700 outline-none focus:border-violet-300 disabled:cursor-not-allowed disabled:bg-slate-100"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Start date
            </label>

            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-violet-300"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Notes
            </label>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Optional notes..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-violet-300 focus:bg-white"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DirectionButton = ({
  active,
  onClick,
  icon: Icon,
  title,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
        active
          ? "border-violet-200 bg-violet-50 text-violet-600"
          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      }`}
    >
      <Icon size={17} />

      <span className="text-sm font-semibold">
        {title}
      </span>
    </button>
  );
};

export default AddRecordModal;