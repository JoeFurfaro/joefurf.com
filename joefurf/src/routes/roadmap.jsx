import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/PageLayout";
import { useEffect, useRef } from "react";
import { PageTitle } from "../components/Decor";
import { PAGES } from "../lib/pages";

export const Route = createFileRoute("/roadmap")({
  component: RouteComponent,
});

const STATUS = {
  green: { key: "done", label: "done" },
  undefined: { key: "now", label: "in progress" },
  gray: { key: "later", label: "someday" },
};

// Done = solid pine, in progress = spruce (pulsing), someday = cedar outline. The connecting
// line is a progress bar: solid through what's done, dashed after. Milestones snap in on scroll.
const Timeline = ({ items }) => {
  const listRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("seen");
            observer.unobserve(entry.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    listRef.current.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={listRef} className="tl tl-a">
      {items.map((item, i) => {
        const status = STATUS[item.color] ?? STATUS.undefined;
        return (
          <li key={i} className={`tl-item reveal ${status.key}`}>
            <span className="marker" />
            <div className="label">{item.children}</div>
            <span className="status">{status.label}</span>
          </li>
        );
      })}
    </ol>
  );
};

function RouteComponent() {
  return (
    <PageLayout>
      <PageTitle page={PAGES[2]}>Roadmap</PageTitle>
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
            color: "green",
            children: "Travel solo",
          },
          {
            children: "Cook a fully self-sustaining meal — fish I caught, vegetables from the garden",
          },
          {
            children: "Sell Asobi to 5 customers",
          },
          {
            children: "Get my boating license",
          },
          {
            children: "Catch a pike",
          },
          {
            color: "gray",
            children: "Hopefully make a second blog post on this website?",
          },
          {
            color: "gray",
            children: "Go ice fishing",
          },
          {
            color: "gray",
            children: "Sell a woodworking piece",
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
      <h1 className="text-text-main text-2xl font-medium">The End <span className="text-base text-text-secondary">... or maybe not?</span></h1>
    </PageLayout>
  );
}
