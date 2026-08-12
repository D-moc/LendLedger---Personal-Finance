import { useState } from "react";

import {
  X,
  UserPlus,
} from "lucide-react";

const AddPersonModal = ({
  open,
  onClose,
  onCreated,
}) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Please enter a name.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onCreated({
        name: form.name.trim(),
        phone: form.phone.trim(),
        notes: form.notes.trim(),
      });

      setForm({
        name: "",
        phone: "",
        notes: "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create person."
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
          w-full
          max-w-md
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
              <UserPlus size={18} />
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
              Add new person
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-slate-400
              "
            >
              Add someone to your financial ledger.
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
          className="space-y-5 p-6"
        >

          <Field
            label="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Mahesh Uncle"
            required
          />


          <Field
            label="Phone number"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="Optional"
          />


          {/* Notes */}

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
              placeholder="Optional notes..."
              rows={3}
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

          </div>


          {/* Error */}

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


          {/* Buttons */}

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
                ? "Adding..."
                : "Add person"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};


// =========================================================
// FIELD
// =========================================================

const Field = ({
  label,
  required,
  type = "text",
  ...props
}) => {
  return (
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
        {label}

        {required && (
          <span className="ml-1 text-violet-600">
            *
          </span>
        )}
      </label>

      <input
        {...props}
        type={type}
        className="
          w-full
          rounded-xl
          border
          border-slate-200
          bg-slate-50/50
          px-4
          py-3
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

    </div>
  );
};

export default AddPersonModal;