import { createFileRoute, useSearch } from '@tanstack/react-router'
import { PageLayout } from '../components/PageLayout';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { Breadcrumb } from 'antd';
import { articles } from '../articles';
import { useNavigate } from '@tanstack/react-router';
import "../markdown.css";

export const Route = createFileRoute('/article')({
  component: RouteComponent,
})

function RouteComponent() {

  const search = useSearch({ from: "/article" });
  const [MD, setMD] = useState(null);
  const navigate = useNavigate();

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
        <Breadcrumb
          items={[
            {
              title: <a onClick={() => navigate({to: "/blog"})}>blog</a>,
            },
            {
              title: title,
            },
          ]}
        />
        <p className="text-text-secondary text-sm">Published on {search.date} by Joe Furfaro</p>
      </div>
      <div className="markdown-parent flex flex-col gap-4">
        {MD !== null && <Markdown>{MD}</Markdown>}
      </div>
    </PageLayout>
  );
}