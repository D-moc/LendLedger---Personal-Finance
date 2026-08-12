const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  error,
  autoComplete,
}) => {
  return (
    <div className="space-y-2">

      <label
        htmlFor={name}
        className="font-body text-sm font-medium text-zinc-800"
      >
        {label}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="
          w-full rounded-xl
          border border-zinc-200
          bg-white
          px-4 py-3.5
          text-sm text-zinc-900
          shadow-sm
          outline-none
          placeholder:text-slate-400
          transition-all duration-200
          focus:border-violet-400
          focus:bg-white
          focus:ring-4
          focus:ring-violet-500/10
          hover:border-zinc-300
        "
      />

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}

    </div>
  );
};

export default Input;