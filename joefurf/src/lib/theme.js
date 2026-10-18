// Theme: follows the visitor's system setting until they pick one with the toggle.
// The initial class is set by an inline script in index.html so there's no flash.
// (The old "theme" key was written automatically for everyone, so it's ignored.)
const KEY = "theme-choice";
const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

export function savedTheme() {
  try {
    const value = localStorage.getItem(KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export const currentTheme = () => (document.body.classList.contains("theme-dark") ? "dark" : "light");

export function applyTheme(theme) {
  document.body.classList.remove("theme-light", "theme-dark");
  document.body.classList.add("theme-" + theme);
}

export function chooseTheme(theme) {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // Private mode etc.: still switch for this visit.
  }
  applyTheme(theme);
}

// Keeps following the system while the visitor hasn't chosen. Returns an unsubscribe function.
export function followSystemTheme(onChange) {
  const query = darkQuery();
  const listener = (e) => {
    if (savedTheme()) return;
    const theme = e.matches ? "dark" : "light";
    applyTheme(theme);
    onChange?.(theme);
  };
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
