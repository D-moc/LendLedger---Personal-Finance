import { useEffect, useState } from "react";

import {
  X,
  UserRoundPen,
} from "lucide-react";

const EditPersonModal = ({
  person,
  open,
  onClose,
  onUpdated,
}) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (person) {
      setForm({
        name: person.name || "",
        phone: person.phone || "",
        notes: person.notes || "",
      });

      setError("");
    }
  }, [person]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await onUpdated(person._id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        notes: form.notes.trim(),
      });

      onClose();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update person."
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
              <UserRoundPen size={18} />
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
              Edit person
            </h2>

            <p className="
              mt-1
              text-xs
              text-slate-400
            ">
              Update this person's details.
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
            placeholder="Enter full name"
          />


          <Field
            label="Phone number"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            type="tel"
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
              rows={3}
              placeholder="Add any notes about this person..."
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

          <div className="
            flex
            gap-3
            border-t
            border-slate-100
            pt-5
          ">

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
                ? "Saving..."
                : "Save changes"}
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

export default EditPersonModal;