import { Navbar } from "./Navbar";
import { GuideRule, LogoJ } from "./Decor";
import { Marquetry } from "./Joinery";

const Footer = () => (
  <footer className="mt-4 flex flex-col gap-5">
    <GuideRule />
    <div className="flex flex-row items-center justify-between gap-4">
      <div className="flex flex-row items-center gap-3">
        <LogoJ size={22} />
        <span className="text-text-secondary tracking-[0.08em] [font-variant:all-small-caps]">Joe Furfaro · Toronto</span>
      </div>
      <div className="w-[118px]">
        <Marquetry cols={4} rows={1} size={24} gap={7} rulers={false} guides={false} />
      </div>
    </div>
  </footer>
);

// `overlay` renders inside the positioned frame, behind the content (e.g. page-wide construction lines).
export const PageLayout = ({ children, overlay }) => {
  return (
    <div className="page-frame flex flex-col gap-8 pt-8 pb-12">
      <span className="column-guide left" aria-hidden />
      <span className="column-guide right" aria-hidden />
      {overlay}
      <Navbar />
      <GuideRule className="-mt-3" />
      <div className="flex flex-col gap-8">{children}</div>
      <Footer />
    </div>
  );
};
