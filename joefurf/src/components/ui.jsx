// Small form primitives styled with the site's theme tokens so they work in light and dark mode.

export const Button = ({ variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-card border border-rule text-text-main hover:border-text-secondary",
    primary: "btn-pressable bg-green border border-transparent text-paper",
    danger: "bg-card border border-rule text-brick hover:border-brick",
  };
  return (
    <button
      className={`px-4 py-2 rounded-[4px] font-display text-[1.05rem] cursor-pointer transition-[transform,box-shadow,border-color] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

const fieldClass =
  "w-full px-3 py-2 rounded-[4px] border border-rule bg-card text-text-main placeholder:text-text-secondary/70 focus:outline-none focus:border-green transition-colors";

export const Input = ({ className = "", ...props }) => <input className={`${fieldClass} ${className}`} {...props} />;

export const TextArea = ({ className = "", ...props }) => <textarea className={`${fieldClass} ${className}`} {...props} />;

export const Field = ({ label, hint, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-text-secondary tracking-[0.08em] [font-variant:all-small-caps]">{label}</span>
    {children}
    {hint && <span className="text-sm text-text-secondary">{hint}</span>}
  </label>
);

export const Badge = ({ tone = "slate", children }) => {
  const tones = {
    slate: "text-text-secondary",
    green: "text-green",
    red: "text-brick",
  };
  return (
    <span
      className={`inline-block font-mono text-[11px] font-medium uppercase tracking-[0.08em] px-1.5 py-px rounded-[3px] border-[1.5px] border-current whitespace-nowrap ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

export const ErrorText = ({ error }) => (error ? <p className="text-sm text-closed">{error.message ?? String(error)}</p> : null);

export const Loading = () => <p className="text-text-secondary italic">Loading…</p>;
