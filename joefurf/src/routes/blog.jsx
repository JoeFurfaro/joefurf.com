import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PageLayout } from '../components/PageLayout';
import { articles } from '../articles';

export const Route = createFileRoute('/blog')({
  component: RouteComponent,
});

function RouteComponent() {

  const navigate = useNavigate();

  return (
    <PageLayout>
      <h1 className="font-medium text-text-main text-3xl">Blog</h1>
      <div className="flex flex-col gap-6">
        <p className="text-text-main">
          I'd really love to to write some stuff and post it here some time soon, but the whole idea of it is quite intimidating to me.
        </p>
        <p className="text-text-main italic font-medium">
          Check back for soon for my progress on eliminating this insecurity.
        </p>
        <h2 className="font-medium text-text-main text-2xl">Posts</h2>
        <div className="flex flex-col gap-2">
          {articles.map(article => <div key={"article-" + article.title} onClick={() => navigate({to: "/article?date=" + article.date})} className="flex flex-row group cursor-pointer justify-between md:justify-start">
            <p className="md:w-1/2 text-hyperlink group-hover:underline">{article.title}</p>
            <p className="text-text-secondary group-hover:underline">{article.date}</p>
          </div>)}
        </div>
      </div>
    </PageLayout>
  );
}
