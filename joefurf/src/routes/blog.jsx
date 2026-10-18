import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PageLayout } from '../components/PageLayout';
import { PageTitle } from '../components/Decor';
import { PAGES } from '../lib/pages';
import { articles } from '../articles';

export const Route = createFileRoute('/blog')({
  component: RouteComponent,
});

function RouteComponent() {

  const navigate = useNavigate();

  return (
    <PageLayout>
      <PageTitle page={PAGES[1]}>Blog</PageTitle>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          {articles.map(article => <div key={"article-" + article.title} onClick={() => navigate({to: "/article?date=" + article.date})} className="flex flex-row items-baseline gap-3 group cursor-pointer" style={{ "--trail": "var(--brick)" }}>
            <p className="trail font-display text-xl text-text-main">{article.title}</p>
            <span className="leader" />
            <p className="font-mono text-xs text-text-secondary group-hover:text-brick transition-colors">{article.date}</p>
          </div>)}
        </div>
      </div>
    </PageLayout>
  );
}
