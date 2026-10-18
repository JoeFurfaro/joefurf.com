import logoMask from "../assets/logo-j-mask.png";

// The J from the site logo, tinted with a palette colour.
export const LogoJ = ({ color = "green", size = 24, className = "" }) => (
  <span
    className={`logo-j inline-block ${className}`}
    style={{
      width: size * 0.66,
      height: size,
      background: `var(--${color})`,
      WebkitMask: `url(${logoMask}) center / contain no-repeat`,
      mask: `url(${logoMask}) center / contain no-repeat`,
    }}
    aria-hidden
  />
);

// A drafting crosshair.
export const Cross = ({ className = "" }) => <span className={`cross ${className}`} aria-hidden />;

// A dashed guide across the full width of the layout, with crosshairs where it meets the column guides.
export const GuideRule = ({ label, className = "" }) => (
  <div className={`guide-rule ${className}`} aria-hidden>
    <Cross className="left" />
    <Cross className="right" />
    {label && <span className="guide-label">{label}</span>}
  </div>
);

// Section heading: crosshair on the column guide, index number, title, and a dashed leader to the edge.
export const SectionHeading = ({ children, number, color = "green" }) => (
  <div className="section-heading" style={{ "--c": `var(--${color})` }}>
    <Cross className="anchor" />
    {number && <span className="font-mono text-xs text-[var(--c)]">{number}</span>}
    <h2 className="text-2xl text-text-main font-medium">{children}</h2>
    <span className="section-leader" />
  </div>
);

// Page title with a mono annotation of the page path, sitting on a dashed guide.
export const PageTitle = ({ children, page, note }) => (
  <div className="flex flex-col gap-3" style={{ "--c": `var(--${page.color})` }}>
    <div className="flex flex-row items-end justify-between gap-4">
      <h1 className="snap-in font-medium text-text-main text-4xl">{children}</h1>
      <span className="font-mono text-xs text-text-secondary pb-1.5">
        <span className="text-[var(--c)]">■</span> {note ?? page.path}
      </span>
    </div>
    <GuideRule />
  </div>
);

// Tag: hairline frame with coloured registration ticks at two corners.
export const Tag = ({ color = "green", children }) => (
  <span className="spec-tag" style={{ "--c": `var(--${color})` }}>
    {children}
  </span>
);

// "a › b" trail of links.
export const Breadcrumbs = ({ items }) => (
  <nav className="flex flex-row flex-wrap items-center gap-2 font-mono text-xs text-text-secondary">
    {items.map((item, i) => (
      <span key={i} className="flex flex-row items-center gap-2">
        {i > 0 && <span className="opacity-60">›</span>}
        {item.onClick ? (
          <a className="trail cursor-pointer" onClick={item.onClick}>
            {item.label}
          </a>
        ) : (
          <span className="text-text-main">{item.label}</span>
        )}
      </span>
    ))}
  </nav>
);

// An image framed like a figure in a manual: offset outline, registration marks, mono caption.
// `frameRef` points at the image box (used by the 45° construction line); `diagonal` draws
// that line's segment over the photo so it reads as split along its diagonal.
export const Figure = ({ src, alt = "", caption, size = 160, className = "", frameRef, diagonal = false }) => (
  <figure className={`figure ${className}`} style={{ "--fig": `${size}px` }}>
    <span className="figure-frame" ref={frameRef}>
      <img src={src} alt={alt} />
      {diagonal && (
        <svg className="figure-diagonal" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <line x1="0" y1="0" x2="100" y2="100" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </span>
    {caption && <figcaption>{caption}</figcaption>}
  </figure>
);
