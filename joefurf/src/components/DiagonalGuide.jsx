import { useEffect, useRef, useState } from "react";

/**
 * A 45° dashed construction line through the whole page, passing exactly through the
 * top-left and bottom-right corners of `targetRef` (the portrait), with a small "45°"
 * angle annotation at the top-left corner. The portrait sits above it, so the line shows on either side. Re-measures whenever the page resizes.
 * Render it as a direct child of the positioned page frame.
 */
export const DiagonalGuide = ({ targetRef }) => {
  const svgRef = useRef(null);
  const [geo, setGeo] = useState(null);

  // A passive effect: the portrait (rendered later in the tree) has its ref attached by now.
  useEffect(() => {
    const svg = svgRef.current;
    const target = targetRef.current;
    if (!svg || !target) return;
    const frame = svg.parentElement;

    const measure = () => {
      const s = svg.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      setGeo({ height: s.height, x: t.left - s.left, y: t.top - s.top });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    observer.observe(target);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [targetRef]);

  let line = null;
  if (geo) {
    // y = x - x0 + y0 (slope 1: down and to the right through the photo's top-left corner)
    const { x, y, height } = geo;
    const startX = x - y; // where the line meets y = 0
    const r = 26;
    // Annotation at the photo's top-left corner, in the open space: a short horizontal reference
    // line to the left, and an arc from it up to the diagonal, labelled 45°.
    line = (
      <>
        <line className="diag-line" x1={startX} y1={0} x2={startX + height} y2={height} />
        <line className="diag-tick" x1={x} y1={y} x2={x - 48} y2={y} />
        <path className="diag-arc" d={`M${x - r},${y} A${r},${r} 0 0 1 ${x - r * Math.SQRT1_2},${y - r * Math.SQRT1_2}`} />
        <text className="diag-label" x={x - r - 6} y={y - 9} textAnchor="end">
          45°
        </text>
      </>
    );
  }

  return (
    <svg ref={svgRef} className="diagonal-guide" aria-hidden>
      {line}
    </svg>
  );
};
