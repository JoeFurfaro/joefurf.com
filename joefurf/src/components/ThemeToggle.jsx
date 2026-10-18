import { useEffect, useId, useState } from "react";
import { chooseTheme, currentTheme, followSystemTheme } from "../lib/theme";

const RAYS = [0, 60, 120, 180, 240, 300];

/**
 * Eclipse: the moon slides across the sun and the rays fold away. Tilts on hover.
 * Pass `dark` + `onToggle` to control it (style guide); with neither it drives the site theme.
 */
export const ThemeToggle = ({ dark: controlledDark, onToggle, size = 34 }) => {
  const maskId = `eclipse-${useId().replace(/:/g, "")}`;
  const [siteTheme, setSiteTheme] = useState(currentTheme);
  const controlled = controlledDark !== undefined;
  const dark = controlled ? controlledDark : siteTheme === "dark";

  useEffect(() => (controlled ? undefined : followSystemTheme(setSiteTheme)), [controlled]);

  const toggle = () => {
    if (controlled) return onToggle?.();
    const next = dark ? "light" : "dark";
    chooseTheme(next);
    setSiteTheme(next);
  };

  return (
    <button
      className={`eclipse-toggle ${dark ? "on" : ""}`}
      style={{ width: size, height: size }}
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} aria-hidden>
        <defs>
          <mask id={maskId}>
            <rect width="24" height="24" fill="white" />
            <circle className="bite" cx="24" cy="4" r="7" fill="black" />
          </mask>
        </defs>
        <circle cx="12" cy="12" r="6.5" fill="currentColor" mask={`url(#${maskId})`} />
        <g className="rays" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {RAYS.map((a) => (
            <line key={a} x1="12" y1="1.5" x2="12" y2="3.5" transform={`rotate(${a} 12 12)`} />
          ))}
        </g>
      </svg>
    </button>
  );
};
