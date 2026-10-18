// Small form primitives styled with the site's theme tokens so they work in light and dark mode.

export const Button = ({ variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-tag-background border-tag-border text-text-main hover:border-text-secondary",
    primary: "bg-text-main border-text-main text-main-bg hover:opacity-90",
    danger: "bg-tag-background border-tag-border text-closed hover:border-closed",
  };
  return (
    <button
      className={`px-4 py-2 rounded-md border text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

const fieldClass =
  "w-full px-3 py-2 rounded-md border border-tag-border bg-main-bg text-text-main placeholder:text-text-secondary focus:outline-none focus:border-text-secondary";

export const Input = ({ className = "", ...props }) => <input className={`${fieldClass} ${className}`} {...props} />;

export const TextArea = ({ className = "", ...props }) => <textarea className={`${fieldClass} ${className}`} {...props} />;

export const Field = ({ label, hint, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-sm font-medium text-text-main">{label}</span>
    {children}
    {hint && <span className="text-xs text-text-secondary">{hint}</span>}
  </label>
);

export const Badge = ({ tone = "slate", children }) => {
  const tones = {
    slate: "bg-tag-background text-text-main border-tag-border",
    green: "bg-tag-background-green text-tag-text-green border-tag-border-green",
    red: "bg-tag-background text-closed border-tag-border",
  };
  return <span className={`inline-block px-2 py-0.5 text-xs rounded border ${tones[tone]}`}>{children}</span>;
};

export const ErrorText = ({ error }) => (error ? <p className="text-sm text-closed">{error.message ?? String(error)}</p> : null);

export const Loading = () => <p className="text-text-secondary">Loading…</p>;
