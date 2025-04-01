import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/PageLayout";
import { Timeline } from "antd";

export const Route = createFileRoute("/roadmap")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageLayout>
      <h1 className="font-medium text-slate-700 text-3xl">Roadmap</h1>
      <div className="flex flex-col gap-6">
        <p className="text-slate-700 italic font-medium">
          I know it's strange to have a roadmap for an entire person.
        </p>
        <p className="text-slate-700">
          But just for fun, give it a chance - a rough overview of some proud
          past moments and planned milestones of any size. No rules; simply
          how I want to visualize my life story to the public internet.
        </p>
        <p className="text-slate-500">
          Disclaimer: I reserve the right change this roadmap at any time, with no criticism from any project manager, similar title, or any title for that matter. Also, the future items come in no particular order.
        </p>
      </div>
      <Timeline
        items={[
          {
            color: "green",
            children: "Find good friends at school",
          },
          {
            color: "green",
            children: "Meet my dream partner",
          },
          {
            color: "green",
            children: "Become an uncle",
          },
          {
            color: "green",
            children: "Finish a degree",
          },
          {
            color: "green",
            children: <>
              <p>Find a stable full-time job</p>
              <p>Have a positive influence on people at said job</p>
              <p>Implement something big at said job</p>
            </>,
          },
          {
            color: "green",
            children: "Move out of my parents' house",
          },
          {
            children: "Overcome my Kosmemophobia",
          },
          {
            children: "Make my first blog post on this website",
          },
          {
            color: "gray",
            children: "Hopefully make a second blog post on this website?",
          },
          {
            color: "gray",
            children: "Learn how to scale a software system to 1M+ users",
          },
          {
            color: "gray",
            children: "Learn a martial art",
          },
          {
            color: "gray",
            children: "Run a half-marathon",
          },
          {
            color: "gray",
            children: "Produce a \"higher-production\" video",
          },
          {
            color: "gray",
            children: "Launch AIRTIME",
          },
          {
            color: "gray",
            children: "Hit platinum in League of Legends",
          },
          {
            color: "gray",
            children: "Finish another degree?",
          },
          {
            color: "gray",
            children: "Get married.",
          },
          {
            color: "gray",
            children: "Buy a house",
          },
          {
            color: "gray",
            children: "Become a father",
          },
          {
            color: "gray",
            children: "Become a grandfather; a healthy one at that",
          },
          {
            color: "gray",
            children: "Grow old with my loved ones",
          }
        ]}
      />
      <h1 className="text-slate-700 text-xl">The End <span className="text-base text-slate-500">... or maybe not?</span></h1>
    </PageLayout>
  );
}
