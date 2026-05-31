import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/PageLayout";
import { Timeline } from "antd";

export const Route = createFileRoute("/roadmap")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <PageLayout>
      <h1 className="font-medium text-text-main text-3xl">Roadmap</h1>
      <div className="flex flex-col gap-6">
        <p className="text-text-main italic font-medium">
          I know it's strange to have a roadmap for an entire person.
        </p>
        <p className="text-text-main">
          But just for fun, give it a chance - proud moments and planned
          milestones, no rules.
        </p>
        <p className="text-text-secondary">
          Disclaimer: I reserve the right change this roadmap at any time, free of any and all criticism.
        </p>
      </div>
      <Timeline
        className="!text-text-main"
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
            color: "green",
            children: "Run a half-marathon",
          },
          {
            color: "green",
            children: "Make my first blog post on this website",
          },
          {
            color: "green",
            children: "Launch AIRTIME",
          },
          {
            children: "Cook a fully self-sustaining meal — fish I caught, vegetables from the garden",
          },
          {
            children: "Sell Asobi to 5 customers",
          },
          {
            color: "gray",
            children: "Hopefully make a second blog post on this website?",
          },
          {
            color: "gray",
            children: "Learn a martial art",
          },
          {
            color: "gray",
            children: "Produce a \"higher-production\" video",
          },
          {
            color: "gray",
            children: "Speedrun Minecraft in under 10 minutes",
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
      <h1 className="text-text-main text-xl">The End <span className="text-base text-text-secondary">... or maybe not?</span></h1>
    </PageLayout>
  );
}
