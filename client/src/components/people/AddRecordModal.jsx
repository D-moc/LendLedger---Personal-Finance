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
  const [form, setForm] = useState({
    direction: "GIVEN",
    originalPrincipal: "",
    interestType: "MONTHLY",
    interestRate: "",
    startDate: new Date()
      .toISOString()
      .split("T")[0],
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !person) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const selectDirection = (direction) => {
    setForm((current) => ({
      ...current,
      direction,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const amount = Number(form.originalPrincipal);
    const interestRate = Number(
      form.interestRate || 0
    );

    if (!amount || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    if (interestRate < 0 || interestRate > 100) {
      setError(
        "Interest rate must be between 0% and 100%."
      );
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

      setForm({
        direction: "GIVEN",
        originalPrincipal: "",
        interestType: "MONTHLY",
        interestRate: "",
        startDate: new Date()
          .toISOString()
          .split("T")[0],
        notes: "",
      });

      onClose();
    } catch (error) {
      console.error(
        "Create record error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to create financial record."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-slate-950/30
        p-4
        backdrop-blur-sm
      "
    >
      {/* Overlay */}

      <div
        className="absolute inset-0"
        onClick={onClose}
      />


      {/* Modal */}

      <div
        className="
          relative
          my-8
          w-full
          max-w-2xl
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-2xl
          shadow-slate-900/10
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-slate-100
            px-6
            py-5
          "
        >

          <div>

            <div
              className="
                mb-4
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-violet-50
                text-violet-600
              "
            >
              <FilePlus2 size={18} />
            </div>


            <h2
              className="
                font-display
                text-xl
                font-bold
                tracking-tight
                text-slate-900
              "
            >
              Add financial record
            </h2>


            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              Create a new financial agreement for{" "}
              <span className="font-semibold text-slate-600">
                {person.name}
              </span>
              .
            </p>

          </div>


          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              rounded-lg
              p-2
              text-slate-400
              transition
              hover:bg-slate-50
              hover:text-slate-700
            "
          >
            <X size={18} />
          </button>

        </div>


        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >

          {/* =================================================
              DIRECTION
          ================================================= */}

          <div>

            <label
              className="
                mb-3
                block
                text-xs
                font-semibold
                text-slate-600
              "
            >
              What type?
            </label>


            <div className="
              grid
              gap-3
              sm:grid-cols-2
            ">

              <DirectionButton
                active={
                  form.direction === "GIVEN"
                }
                type="GIVEN"
                onClick={() =>
                  selectDirection("GIVEN")
                }
                icon={ArrowUpRight}
                title="Money given"
                description="Money you gave someone"
                activeClass="
                  border-emerald-200
                  bg-emerald-50
                  text-emerald-600
                "
              />


              <DirectionButton
                active={
                  form.direction === "BORROWED"
                }
                type="BORROWED"
                onClick={() =>
                  selectDirection("BORROWED")
                }
                icon={ArrowDownLeft}
                title="Money borrowed"
                description="Money you took from someone"
                activeClass="
                  border-orange-200
                  bg-orange-50
                  text-orange-600
                "
              />

            </div>

          </div>


          {/* =================================================
              AMOUNT
          ================================================= */}

          <div>

            <label
              className="
                mb-2
                block
                text-xs
                font-semibold
                text-slate-600
              "
            >
              Original amount
              <span className="text-red-500"> *</span>
            </label>


            <div className="relative">

              <span
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-sm
                  font-semibold
                  text-slate-400
                "
              >
                ₹
              </span>


              <input
                type="number"
                name="originalPrincipal"
                value={
                  form.originalPrincipal
                }
                onChange={handleChange}
                placeholder="50,000"
                min="0"
                step="0.01"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50/50
                  py-3.5
                  pl-9
                  pr-4
                  font-mono
                  text-lg
                  font-semibold
                  text-slate-800
                  outline-none
                  transition
                  placeholder:text-slate-300
                  focus:border-violet-300
                  focus:bg-white
                  focus:ring-4
                  focus:ring-violet-500/5
                "
              />

            </div>

          </div>


          {/* =================================================
              INTEREST
          ================================================= */}

          <div className="
            grid
            gap-4
            sm:grid-cols-2
          ">

            <div>

              <label
                className="
                  mb-2
                  block
                  text-xs
                  font-semibold
                  text-slate-600
                "
              >
                Interest type
              </label>


              <select
                name="interestType"
                value={form.interestType}
                onChange={handleChange}
                className="
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-slate-700
                  outline-none
                  transition
                  focus:border-violet-300
                  focus:ring-4
                  focus:ring-violet-500/5
                "
              >

                <option value="MONTHLY">
                  Monthly Interest
                </option>

                <option value="NONE">
                  No Interest
                </option>

              </select>

            </div>


            <div>

              <label
                className="
                  mb-2
                  block
                  text-xs
                  font-semibold
                  text-slate-600
                "
              >
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
                  disabled={
                    form.interestType === "NONE"
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50/50
                    px-4
                    py-3
                    pr-10
                    font-mono
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    placeholder:text-slate-300
                    focus:border-violet-300
                    focus:bg-white
                    focus:ring-4
                    focus:ring-violet-500/5
                    disabled:cursor-not-allowed
                    disabled:bg-slate-100
                    disabled:text-slate-400
                  "
                />


                <span
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-xs
                    font-semibold
                    text-slate-400
                  "
                >
                  %
                </span>

              </div>

            </div>

          </div>


          {/* =================================================
              DATE
          ================================================= */}

          <div>

            <label
              className="
                mb-2
                block
                text-xs
                font-semibold
                text-slate-600
              "
            >
              Start date
            </label>


            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-sm
                text-slate-700
                outline-none
                transition
                focus:border-violet-300
                focus:ring-4
                focus:ring-violet-500/5
              "
            />

          </div>


          {/* =================================================
              NOTES
          ================================================= */}

          <div>

            <label
              className="
                mb-2
                block
                text-xs
                font-semibold
                text-slate-600
              "
            >
              Notes
            </label>


            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Optional details about this agreement..."
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-slate-200
                bg-slate-50/50
                px-4
                py-3
                text-sm
                text-slate-700
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-violet-300
                focus:bg-white
                focus:ring-4
                focus:ring-violet-500/5
              "
            />

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="
                rounded-xl
                border
                border-red-100
                bg-red-50
                px-4
                py-3
                text-xs
                text-red-600
              "
            >
              {error}
            </div>
          )}


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div
            className="
              flex
              gap-3
              border-t
              border-slate-100
              pt-5
            "
          >

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                flex-1
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                text-sm
                font-medium
                text-slate-600
                transition
                hover:bg-slate-50
                hover:text-slate-800
                disabled:opacity-50
              "
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={loading}
              className="
                flex-1
                rounded-xl
                bg-violet-600
                px-4
                py-3
                text-sm
                font-semibold
                text-white
                shadow-sm
                shadow-violet-200
                transition
                hover:bg-violet-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Creating..."
                : "Create record"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};


// =========================================================
// DIRECTION BUTTON
// =========================================================

const DirectionButton = ({
  active,
  onClick,
  icon: Icon,
  title,
  description,
  activeClass,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-xl
        border
        p-4
        text-left
        transition-all
        ${
          active
            ? activeClass
            : `
              border-slate-200
              bg-white
              text-slate-600
              hover:border-slate-300
              hover:bg-slate-50
            `
        }
      `}
    >

      <Icon size={19} />

      <p
        className="
          mt-3
          text-sm
          font-semibold
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-[10px]
          leading-4
          text-slate-400
        "
      >
        {description}
      </p>

    </button>
  );
};

export default AddRecordModal;