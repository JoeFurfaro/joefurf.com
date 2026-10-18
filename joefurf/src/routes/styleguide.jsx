import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import "../styleguide.css";
import { ThemeToggle } from "../components/ThemeToggle";
import { Inlay, Marquetry } from "../components/Joinery";
import me from "../assets/me.jpg";

export const Route = createFileRoute("/styleguide")({
  component: RouteComponent,
});

/* ------------------------------------------------------------------ */
/* Roadmap timelines */

const MILESTONES = [
  { s: "done", t: "Finish a degree" },
  { s: "done", t: "Run a half-marathon" },
  { s: "done", t: "Launch AIRTIME" },
  { s: "now", t: "Cook a fully self-sustaining meal" },
  { s: "now", t: "Sell Asobi to 5 customers" },
  { s: "later", t: "Learn a martial art" },
  { s: "later", t: "Buy a house" },
];

const STATUS_LABEL = { done: "done", now: "in progress", later: "someday" };

const TimelineA = () => (
  <ol className="tl tl-a">
    {MILESTONES.map((m, i) => (
      <li key={i} className={`tl-item ${m.s}`} style={{ animationDelay: `${0.06 * i}s` }}>
        <span className="marker" />
        <span className="label">{m.t}</span>
        <span className="status">{STATUS_LABEL[m.s]}</span>
      </li>
    ))}
  </ol>
);


/* ------------------------------------------------------------------ */
/* Page header preview with alignment guides */

const HeaderPreview = () => (
  <div className="hp">
    <span className="hp-guide left" />
    <span className="hp-guide right" />
    <div className="hp-row">
      <div className="flex flex-col gap-2">
        <span className="hp-cross" />
        <h1 className="hp-name">Joe Furfaro</h1>
        <span className="hp-sub">Toronto, Ontario, Canada</span>
        <div className="mt-2">
          <Marquetry cols={6} rows={1} size={30} gap={8} rulers={false} />
        </div>
      </div>
      <figure className="hp-portrait">
        <img src={me} alt="" />
        <figcaption>fig. 1 — 176 × 176</figcaption>
      </figure>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */

const Panel = ({ title, note, children }) => (
  <section className="flex flex-col gap-3">
    <div>
      <h2 className="sg2-h2">{title}</h2>
      {note && <p className="sg2-note">{note}</p>}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="theme-light sg2-pane">{children("light")}</div>
      <div className="theme-dark sg2-pane">{children("dark")}</div>
    </div>
  </section>
);

const TAGS = [
  ["Nerd", "green"],
  ["Athlete", "brick"],
  ["Adventurer", "ochre"],
  ["Amateur Fisherman", "teal"],
];

const TAG_STYLES = [
  { id: "spec", name: "A · Specimen labels (current)" },
  { id: "corners", name: "B · Registration corners: hairline frame, ticks at two corners like the portrait" },
  { id: "index", name: "C · Catalog index: numbered entries with coloured mono numbers" },
  { id: "slash", name: "D · Inline list: small caps separated by coloured slashes" },
  { id: "underline", name: "E · Underlined: coloured rule under each word, like the nav" },
  { id: "chip", name: "F · Legend chips: colour square + text, no box" },
];

const TagStyle = ({ variant }) => (
  <div className={`tagset tagset-${variant}`}>
    {TAGS.map(([label, color], i) => (
      <span key={label} className="t" style={{ "--c": `var(--${color})`, animationDelay: `${0.05 * i}s` }}>
        {variant === "index" && <b>{String(i + 1).padStart(2, "0")}</b>}
        {(variant === "spec" || variant === "chip") && <i />}
        {label}
      </span>
    ))}
  </div>
);

const ToggleDemo = ({ startDark, size }) => {
  const [dark, setDark] = useState(startDark);
  return <ThemeToggle dark={dark} onToggle={() => setDark(!dark)} size={size} />;
};

const PALETTE_NAMES = ["pine", "spruce", "moss", "cedar"];

const PaletteSample = ({ names }) => (
  <div className="ps">
    <h3>Joe Furfaro</h3>
    <span className="sc">Toronto, Ontario, Canada</span>
    <p>
      I'm also trying to slow down more and enjoy the small moments. Feel free to shoot me a connect request on{" "}
      <a className="trail">LinkedIn</a>.
    </p>
    <div className="legend">
      {["green", "teal", "ochre", "brick"].map((c, i) => (
        <span key={c} className="legend-item" style={{ "--c": `var(--${c})` }}>
          <i />
          {["Nerd (Engineer)", "Athlete", "Adventurer", "Woodworker"][i]}
        </span>
      ))}
    </div>
    <div className="dots">
      {[
        ["--paper", "paper"],
        ["--ink", "ink"],
        ["--green", names[0]],
        ["--teal", names[1]],
        ["--ochre", names[2]],
        ["--brick", names[3]],
      ].map(([v, label]) => (
        <span key={v}>
          <i style={{ background: `var(${v})`, boxShadow: "0 0 0 1px var(--rule)" }} />
          {label}
        </span>
      ))}
    </div>
  </div>
);

function RouteComponent() {
  const [run, setRun] = useState(0);

  return (
    <div className="sg2-page" key={run}>
      <div className="mx-auto max-w-[1180px] flex flex-col gap-14 px-4 py-10">
        <div className="flex flex-row flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="sg2-h1">Style guide: precision craft</h1>
            <p className="sg2-note max-w-[46em]">
              Joinery as the motif: pieces that slide together and lock, with visible guides and measurements. Click
              toggles to try them.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button className="sg2-replay" onClick={() => setRun(run + 1)}>
              ↻ replay all animations
            </button>
          </div>
        </div>

        <Panel title="Palette · Lake & Pine" note="Pine, spruce blue, moss and cedar on cool linen. Dark mode is deep lake-night blue.">
          {() => <PaletteSample names={PALETTE_NAMES} />}
        </Panel>



        <Panel title="Inlay" note="Four pieces arrive from four sides and assemble into one perfect square, then the guides and dimension draw in. Could be a logo mark or section opener.">
          {() => (
            <div className="flex justify-center py-4">
              <Inlay />
            </div>
          )}
        </Panel>

        <Panel title="Marquetry" note="Each tile is a small inlay: 2–4 pieces that fill the square exactly, sliding in from their sides. Even gaps between tiles, mirrored around the centre, with numbered rulers, crosshairs where the gaps meet, and the dimension line.">
          {() => (
            <div className="pt-10 pb-8 px-10">
              <Marquetry />
            </div>
          )}
        </Panel>

        <Panel title="Tags · six styles" note="Same four tags, six treatments. Hover each one.">
          {() => (
            <div className="flex flex-col gap-6 p-8">
              {TAG_STYLES.map((t) => (
                <div key={t.id} className="flex flex-col gap-2">
                  <span className="sg2-cap">{t.name}</span>
                  <TagStyle variant={t.id} />
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Header with alignment guides" note="Column guides at the content edges, a crosshair where the section starts, name snaps in, portrait framed like a figure in a manual. A small marquetry strip as the rule.">
          {() => <HeaderPreview />}
        </Panel>

        <Panel title="Theme toggle · eclipse" note="The moon slides across the sun and the rays fold away. Tilts on hover. Shown at nav size and enlarged.">
          {(mode) => (
            <div className="flex flex-row flex-wrap items-center gap-12 p-8">
              <div className="flex flex-col items-center gap-2">
                <ToggleDemo startDark={mode === "dark"} size={34} />
                <span className="sg2-cap">nav size</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ToggleDemo startDark={mode === "dark"} size={96} />
                <span className="sg2-cap">enlarged</span>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Roadmap" note="Done = solid pine, in progress = spruce blue (pulsing), someday = cedar outline, with the status in mono on the right. The line is a progress bar: solid up to now, dashed after.">
          {() => (
            <div className="p-6">
              <TimelineA />
            </div>
          )}
        </Panel>

      </div>
    </div>
  );
}
