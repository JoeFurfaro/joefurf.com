import { createFileRoute } from '@tanstack/react-router'
import { PageLayout } from '../components/PageLayout';

export const Route = createFileRoute('/blog')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageLayout>
      <h1 className="font-medium text-slate-700 text-3xl">Blog</h1>
      <div className="flex flex-col gap-6">
        <p className="text-slate-700">
          I'd really love to to write some stuff and post it here some time soon, but the whole idea of it is quite intimidating to me.
        </p>
        <p className="text-slate-700 italic font-medium">
          Check back for soon for my progress on eliminating this insecurity.
        </p>
      </div>
    </PageLayout>
  );
}
