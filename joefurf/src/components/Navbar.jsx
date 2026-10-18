import { Link, useLocation } from "@tanstack/react-router";
import { PAGES, pageFor } from "../lib/pages";
import { ThemeToggle } from "./ThemeToggle";

export const Navbar = () => {
  const location = useLocation();
  const current = pageFor(location.pathname);
  const inAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-row justify-between items-center">
      <div className="flex gap-5">
        {PAGES.map((page) => {
          const selected = page === current && !inAdmin;
          return (
            <Link
              key={page.path}
              to={page.path}
              className={`nav-link relative font-display text-[1.1rem] ${selected ? "selected" : "text-text-main"}`}
              style={{ "--c": `var(--${page.color})` }}
            >
              {page.label}
              <span className="nav-underline" />
            </Link>
          );
        })}
      </div>
      <ThemeToggle />
    </div>
  );
};
