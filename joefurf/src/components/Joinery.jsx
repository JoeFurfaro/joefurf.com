// Joinery motifs: pieces that assemble into place, with drafting guides and measurements.
/* ------------------------------------------------------------------ */
/* Inlay. Four pieces arrive from four sides and assemble into a perfect square. */
// Wraps a piece so it can slide outward on hover (an exploded view), separate from its entrance animation.
const Explode = ({ dx, dy, amount, children }) => (
  <g className="explode" style={{ "--hx": `${dx * amount}px`, "--hy": `${dy * amount}px` }}>
    {children}
  </g>
);

export const Inlay = ({ size = 120, px = 180, guides = true, className = "" }) => {
  const s = size;
  const h = s / 2;
  return (
    <svg viewBox={`-30 -30 ${s + 60} ${s + 60}`} className={`inlay overflow-visible ${className}`} style={{ width: px, height: px }} aria-hidden>
      {/* Hover target covering the whole square, so the exploded gaps don't flicker */}
      <rect x="0" y="0" width={s} height={s} fill="transparent" />
      <Explode dx={-1} dy={-1} amount={s * 0.07}>
        <rect className="inlay-piece from-left" x="0" y="0" width={h} height={h} fill="var(--green)" />
      </Explode>
      <Explode dx={1} dy={-1} amount={s * 0.07}>
        <polygon className="inlay-piece from-top" points={`${h},0 ${s},0 ${s},${h}`} fill="var(--brick)" />
      </Explode>
      <Explode dx={0.6} dy={0.15} amount={s * 0.07}>
        <polygon className="inlay-piece from-right" points={`${h},0 ${s},${h} ${h},${h}`} fill="var(--teal)" />
      </Explode>
      <Explode dx={0} dy={1} amount={s * 0.07}>
        <rect className="inlay-piece from-bottom" x="0" y={h} width={s} height={h} fill="var(--ochre)" />
      </Explode>
      {guides && <Guides width={s} height={s} label={`${s} × ${s}`} />}
    </svg>
  );
};

/* Marquetry. Each tile is a small inlay: 2–4 pieces that fill the square exactly. Tiles sit on an
   even grid with gaps, mirrored around the centre, with rulers and crosshairs in the gaps. */
const TILE_PIECES = {
  // Each piece: [svg element builder, slide-in direction]
  diag: (s) => [
    [<polygon points={`0,0 ${s},0 0,${s}`} />, [-1, -1]],
    [<polygon points={`${s},0 ${s},${s} 0,${s}`} />, [1, 1]],
  ],
  quarter: (s) => [
    [<path d={`M0,0 L${s},0 A${s},${s} 0 0 1 0,${s} Z`} />, [-1, -1]],
    [<path d={`M${s},0 L${s},${s} L0,${s} A${s},${s} 0 0 0 ${s},0 Z`} />, [1, 1]],
  ],
  arch: (s) => [
    [<path d={`M0,0 H${s} V${s} A${s / 2},${s / 2} 0 0 0 0,${s} Z`} />, [0, -1]],
    [<path d={`M0,${s} A${s / 2},${s / 2} 0 0 1 ${s},${s} Z`} />, [0, 1]],
  ],
  inlay: (s) => [
    [<rect width={s / 2} height={s / 2} />, [-1, 0]],
    [<polygon points={`${s / 2},0 ${s},0 ${s},${s / 2}`} />, [0, -1]],
    [<polygon points={`${s / 2},0 ${s},${s / 2} ${s / 2},${s / 2}`} />, [1, 0]],
    [<rect y={s / 2} width={s} height={s / 2} />, [0, 1]],
  ],
  halves: (s) => [
    [<rect width={s} height={s / 2} />, [0, -1]],
    [<rect y={s / 2} width={s / 2} height={s / 2} />, [-1, 1]],
    [<rect x={s / 2} y={s / 2} width={s / 2} height={s / 2} />, [1, 1]],
  ],
  frame: (s) => [
    [<path d={`M0,0 H${s} V${s} H0 Z M${s * 0.25},${s * 0.25} V${s * 0.75} H${s * 0.75} V${s * 0.25} Z`} />, [0, 1]],
    [<rect x={s * 0.25} y={s * 0.25} width={s / 2} height={s / 2} />, [0, -1]],
  ],
};
const SLOT_COLORS = ["green", "teal", "ochre", "brick"];

// Left half of each row, [kind, rotation]; the right half mirrors it.
const LAYOUT = [
  [["inlay", 0], ["quarter", 90], ["diag", 0], ["arch", 180], ["frame", 0], ["halves", 0]],
  [["arch", 0], ["frame", 0], ["quarter", 270], ["halves", 180], ["diag", 90], ["inlay", 90]],
];

export const Marquetry = ({ cols = 8, rows = 2, size = 56, gap = 12, rulers = true, guides = true }) => {
  const step = size + gap;
  const width = cols * step - gap;
  const height = rows * step - gap;
  const half = cols / 2;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible" aria-hidden>
      {rulers && (
        <g className="mq-rulers" stroke="var(--muted)" strokeWidth="0.8" fill="var(--muted)">
          <line x1="0" y1="-12" x2={width} y2="-12" />
          {Array.from({ length: cols }).map((_, c) => (
            <g key={c}>
              <line x1={c * step} y1="-12" x2={c * step} y2="-6" />
              <line x1={c * step + size} y1="-12" x2={c * step + size} y2="-6" />
              <line x1={c * step + size / 2} y1="-12" x2={c * step + size / 2} y2="-9" />
              <text x={c * step + size / 2} y="-16" textAnchor="middle" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="7">
                {String(c + 1).padStart(2, "0")}
              </text>
            </g>
          ))}
          <line x1="-12" y1="0" x2="-12" y2={height} />
          {Array.from({ length: rows }).map((_, r) => (
            <g key={r}>
              <line x1="-12" y1={r * step} x2="-6" y2={r * step} />
              <line x1="-12" y1={r * step + size} x2="-6" y2={r * step + size} />
              <text x="-17" y={r * step + size / 2 + 2.5} textAnchor="middle" stroke="none" fontFamily="IBM Plex Mono, monospace" fontSize="7">
                {String.fromCharCode(65 + r)}
              </text>
            </g>
          ))}
          {/* Crosshairs where the gaps meet */}
          {Array.from({ length: (cols - 1) * (rows + 1) }).map((_, i) => {
            const c = i % (cols - 1);
            const r = Math.floor(i / (cols - 1));
            const x = c * step + size + gap / 2;
            const y = r === 0 ? -gap / 2 + 2 : r === rows ? height + gap / 2 - 2 : r * step - gap / 2;
            return (
              <g key={i} strokeWidth="0.7">
                <line x1={x - 2.5} y1={y} x2={x + 2.5} y2={y} />
                <line x1={x} y1={y - 2.5} x2={x} y2={y + 2.5} />
              </g>
            );
          })}
        </g>
      )}
      {Array.from({ length: cols * rows }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const mirrored = col >= half;
        const src = mirrored ? cols - 1 - col : col;
        const [kind, rot] = LAYOUT[row % LAYOUT.length][src % LAYOUT[0].length];
        const offset = (src + row) % 4;
        const flip = mirrored ? ` translate(${size} 0) scale(-1 1)` : "";
        return (
          <g key={i} className="mq-tile" transform={`translate(${col * step} ${row * step})${flip} rotate(${rot} ${size / 2} ${size / 2})`}>
            <rect width={size} height={size} fill="transparent" />
            {TILE_PIECES[kind](size).map(([shape, [dx, dy]], p) => (
              <Explode key={p} dx={dx} dy={dy} amount={size * 0.1}>
                <g
                  className="mq-piece"
                  fill={`var(--${SLOT_COLORS[(p + offset) % 4]})`}
                  style={{
                    "--dx": `${dx * size * 0.35}px`,
                    "--dy": `${dy * size * 0.35}px`,
                    animationDelay: `${0.25 + 0.06 * (Math.abs(col - (cols - 1) / 2) + row) + p * 0.07}s`,
                  }}
                >
                  {shape}
                </g>
              </Explode>
            ))}
          </g>
        );
      })}
      {guides && <Guides width={width} height={height} label={`${cols} × ${rows} · ${width} mm`} />}
    </svg>
  );
};

// Dashed alignment guides past the edges, crosshairs at the corners, and a dimension line.
export const Guides = ({ width, height, label }) => (
  <g className="guides" fill="none" stroke="var(--muted)" strokeWidth="0.8">
    <line x1="-24" y1="0" x2={width + 24} y2="0" strokeDasharray="3 3" />
    <line x1="-24" y1={height} x2={width + 24} y2={height} strokeDasharray="3 3" />
    <line x1="0" y1="-14" x2="0" y2={height + 14} strokeDasharray="3 3" />
    <line x1={width} y1="-14" x2={width} y2={height + 14} strokeDasharray="3 3" />
    {[
      [0, 0],
      [width, 0],
      [0, height],
      [width, height],
    ].map(([x, y], i) => (
      <g key={i} stroke="var(--ink)" strokeWidth="1">
        <line x1={x - 5} y1={y} x2={x + 5} y2={y} />
        <line x1={x} y1={y - 5} x2={x} y2={y + 5} />
      </g>
    ))}
    <g stroke="var(--ink)" strokeWidth="0.8">
      <line x1="0" y1={height + 22} x2={width} y2={height + 22} />
      <line x1="0" y1={height + 18} x2="0" y2={height + 26} />
      <line x1={width} y1={height + 18} x2={width} y2={height + 26} />
    </g>
    <text
      x={width / 2}
      y={height + 19}
      textAnchor="middle"
      fill="var(--muted)"
      stroke="none"
      fontFamily="IBM Plex Mono, monospace"
      fontSize="9"
    >
      {label ?? `${width} mm`}
    </text>
  </g>
);
