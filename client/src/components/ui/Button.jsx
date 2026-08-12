const Button = ({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) => {
  const variants = {
    primary:
      "bg-violet-600 text-white shadow-sm shadow-violet-200 hover:bg-violet-700",

    secondary:
      "border border-zinc-200 bg-white text-zinc-700 shadow-sm hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700",

    danger:
      "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        rounded-xl px-5 py-3
        font-body text-sm font-semibold
        transition-all duration-200
        active:scale-[0.98]
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variants[variant] || variants.primary}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;