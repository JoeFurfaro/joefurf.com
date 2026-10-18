import { createFileRoute, useSearch } from '@tanstack/react-router'
import { PageLayout } from '../components/PageLayout';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import { Breadcrumbs } from '../components/Decor';
import { ArticleResponses } from '../components/ArticleResponses';
import { articles } from '../articles';
import { useNavigate } from '@tanstack/react-router';
import "../markdown.css";

// Clicking a figure opens it in the lightbox.
const LightboxContext = createContext(() => {});

// Images render as drafting-style figures. The alt text is the caption, and the title is the
// width carried over from Obsidian's ![[image|width]] embeds. Spans keep it valid inside <p>.
const ArticleImage = ({ src, alt, title }) => {
  const open = useContext(LightboxContext);
  return (
    <span className="md-figure" style={{ "--w": title ? `${Math.round(Number(title) * 1.3)}px` : "100%" }}>
      <button type="button" className="md-figure-frame" onClick={() => open({ src, alt })} aria-label={`Enlarge ${alt || "image"}`}>
        <img src={src} alt={alt} loading="lazy" />
      </button>
      {alt && <span className="md-figure-caption">{alt}</span>}
    </span>
  );
};

const Lightbox = ({ image, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={image.alt} onClick={onClose}>
      <figure className="lightbox-figure">
        <span className="lightbox-frame">
          <img src={image.src} alt={image.alt} />
        </span>
        <figcaption>
          <span>{image.alt}</span>
          <span>esc · click to close</span>
        </figcaption>
      </figure>
    </div>
  );
};

export const Route = createFileRoute('/article')({
  component: RouteComponent,
})

function RouteComponent() {

  const search = useSearch({ from: "/article" });
  const [MD, setMD] = useState(null);
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState(null);
  const components = useMemo(() => ({ img: ArticleImage }), []);
  const closeLightbox = useMemo(() => () => setLightbox(null), []);

  const article = articles.filter(f => f.date === search.date)[0];
  const title = article.title;

  useEffect(() => {
    const articlePath = "/articles/" + search.date + ".md";
    fetch(articlePath).then(resp => resp.text()).then(text => {
      setMD(text);
    });
  }, []);

  return (
    <PageLayout>
      <div className="flex flex-col gap-2">
        <Breadcrumbs
          items={[
            { label: "blog", onClick: () => navigate({to: "/blog"}) },
            { label: title },
          ]}
        />
        <p className="text-text-secondary tracking-[0.08em] [font-variant:all-small-caps]">Published on <span className="font-mono text-xs [font-variant:normal] tracking-normal">{search.date}</span> by Joe Furfaro</p>
      </div>
      <div className="markdown-parent flex flex-col gap-4">
        <LightboxContext.Provider value={setLightbox}>
          {MD !== null && <Markdown components={components}>{MD}</Markdown>}
        </LightboxContext.Provider>
      </div>
      {MD !== null && <ArticleResponses slug={search.date} />}
      {lightbox && <Lightbox image={lightbox} onClose={closeLightbox} />}
    </PageLayout>
  );
}