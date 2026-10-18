import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { Figure, GuideRule, SectionHeading, Tag } from "../components/Decor";
import { DiagonalGuide } from "../components/DiagonalGuide";
import { Marquetry } from "../components/Joinery";

import {
  FaLinkedin,
  FaGithub,
  FaLocationDot,
  FaInstagram,
} from "react-icons/fa6";
import me from "../assets/me.jpg";
import stripe from "../assets/stripe.jpeg";
import martinrea from "../assets/martinrea.png";
import airtime from "../assets/airtime.png";
import dipole from "../assets/dipole.png";
import mcmaster from "../assets/mcmaster.png";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

const SocialLink = ({ icon, href, color }) => {
  return (
    <a
      href={href}
      target="_blank"
      className="social-link cursor-pointer text-text-main transition-[color,transform] duration-300 hover:-translate-y-0.5"
      style={{ "--c": `var(--${color})` }}
    >
      {icon}
    </a>
  );
};

const Tags = () => {
  const tags = [
    {label: "Nerd", color: "green"},
    {label: "Athlete", color: "brick"},
    {label: "Adventurer", color: "ochre"},
    {label: "Amateur Fisherman", color: "teal"},
  ];

  return tags.map(tag => <Tag key={"tag-" + tag.label} color={tag.color}>{tag.label}</Tag>);
};

const JobHeader = ({company, logo, role, time}) => {
  return <div className="flex flex-col gap-1 md:gap-2 md:flex-row md:justify-between md:items-center grow">
  <div className="flex items-center gap-2.5">
    <img src={logo} alt={company + " Logo"} className="w-5 rounded-sm" />
    <p className="text-text-main text-[1.05rem]">{company} - <span className="font-medium">{role}</span></p>
  </div>
  <p className="text-text-secondary font-mono text-xs md:text-[0.8rem] pl-7.5 md:pl-0">{time}</p>
</div>
};

const JobDetails = ({items}) => {
  return <ul className="shape-list text-text-main">
    {items}
  </ul>;
}

// One-open-at-a-time accordion with smooth expand.
const Accordion = ({ items }) => {
  const [open, setOpen] = useState(null);

  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => {
        const isOpen = open === item.key;
        return (
          <div key={item.key} className={`accordion-item ${isOpen ? "open" : ""}`}>
            <button
              onClick={() => setOpen(isOpen ? null : item.key)}
              className="accordion-row group flex w-full flex-row items-start md:items-center gap-3 py-2.5 text-left cursor-pointer"
            >
              <span className="accordion-icon mt-1 md:mt-0 font-mono text-text-secondary group-hover:text-text-main">›</span>
              {item.label}
            </button>
            <div className="accordion-body">
              <div>
                <div className="pt-1 pb-4 pl-7">{item.children}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Career = () => {
  const items = [
    {
      key: '1',
      label: <JobHeader company="Stripe" logo={stripe} role="Software Engineer" time="April 2025 - Current" />,
      children: <JobDetails items={[
        <li key="1">Building infrastructure for how businesses organize and structure their accounts and relationships in the online money movement ecosystem</li>
      ]} />,
    },
    {
      key: '2',
      label: <JobHeader company="Asobi (start-up)" logo={airtime} role="Tech Lead" time="Current" />,
      children: <JobDetails items={[
        <li key="1">Developing booking & company management platform for sports training organizations. Launched for <a href="https://airtimeathletics.com" target="_blank" rel="noreferrer" className="trail">AIRTIME Athletics</a> in April, 2026</li>
      ]} />,
    },
    {
      key: '3',
      label: <JobHeader company="Martinrea" logo={martinrea} role="Engineering Supervisor" time="2023-2025" />,
      children: <JobDetails items={[
        <li key="1">Became a strong, confident, and purpose-driven leader</li>,
        <li key="2">Founded, designed, and implemented Martinrea's internal deployment platform <span className="text-fe">Factory Engine</span></li>,
        <li key="3">Led and mentored 20+ people in Software Engineering and UI/UX design</li>,
        <li key="4">Worked with C-Suite and senior operations leadership to develop standards & ship</li>,
        <li key="5"><span className="text-text-secondary">Distributed edge containerization pipelines, compilers, developer experience tooling, beautiful interfaces, automatic build systems, platform documentation, and many more fun things!</span></li>
      ]} />,
    },
    {
      key: '4',
      label: <JobHeader company="Martinrea" logo={martinrea} role="SWE Intern" time="2018-2022" />,
      children: <JobDetails items={[
        <li key="1">Developed web-based UI tools for Martinrea's Autonomous Mobile Robot (AMR) product</li>,
        <li key="2">Optimized computer vision and navigation algorithms for AMRs</li>,
        <li key="3">Shipped an eCommerce store for selling medical masks during the COVID-19 pandemic</li>,
      ]} />,
    },
    {
      key: '5',
      label: <JobHeader company="eatDipole (start-up)" logo={dipole} role="Co-Founder" time="2019-2021" />,
      children: <JobDetails items={[
        <li key="1">Developed a software product & management platform for an order-ahead cloud kitchen start-up</li>,
        <li key="2">Deployed and delivered food to 150+ customers in Hamilton, Ontario</li>,
        <li key="3" className="text-text-secondary">Order scheduling, route optimization, Stripe payment processing, on-call production support</li>,
        <li key="4" className="text-closed">Closed in 2021 due to difficulties in operating during COVID-19 pandemic</li>,
      ]} />,
    },
  ];

  return <Accordion items={items} />
}

const Education = () => {
  const items = [
    {
      key: '1',
      label: <JobHeader company="McMaster University" logo={mcmaster} role="Computer Science" time="2019-2023" />,
      children: <JobDetails items={[
        <li key="1">Learned fundamentals of computer science and made some great friends and memories along the way</li>,
        <li key="2" className="text-text-secondary">Data structures & algorithms, computer architecture, concurrent systems, computer networks & security, discrete math, human computer interfaces, compilers</li>
      ]} />,
    },
  ];

  return <Accordion items={items} />
}

const getAge = () => {
  const today = new Date();
  const birthDate = new Date("2001-04-14");

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

function RouteComponent() {
  const portraitRef = useRef(null);

  return (
    <PageLayout overlay={<DiagonalGuide targetRef={portraitRef} />}>
      <div className="flex flex-col-reverse gap-8 md:flex-row items-center md:items-start md:justify-between">
        <div className="snap-in flex flex-col gap-4 md:pt-2">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <h1 className="text-5xl text-text-main font-medium">Joe Furfaro</h1>
            <a
              href="https://maps.app.goo.gl/W1VfnKGWiUPyQS9w6"
              target="_blank"
              className="group text-lg text-text-secondary cursor-pointer flex flex-row gap-1.5 items-center tracking-[0.08em] [font-variant:all-small-caps] hover:text-brick transition-colors"
            >
              <p>Toronto, Ontario, Canada</p>
              <span className="text-sm">
                <FaLocationDot />
              </span>
            </a>
          </div>
          <div className="flex flex-row gap-3.5 flex-wrap gap-y-3 justify-center md:justify-start">
            <Tags />
          </div>
          <div className="flex flex-row gap-4 md:gap-3 text-4xl md:text-2xl mt-1 text-text-main justify-center md:justify-start">
            <SocialLink
              href="https://www.linkedin.com/in/joe-furfaro/"
              icon={<FaLinkedin />}
              color="teal"
            />
            <SocialLink
              href="https://github.com/JoeFurfaro"
              icon={<FaGithub />}
              color="green"
            />
            <SocialLink
              href="https://www.instagram.com/joefurf/"
              icon={<FaInstagram />}
              color="brick"
            />
          </div>
        </div>
        <Figure src={me} alt="Joe Furfaro" caption="fig. 1 — me" size={164} className="snap-in [animation-delay:0.12s]" frameRef={portraitRef} />
      </div>
      <GuideRule label="§ intro" />
      <div className="flex flex-col gap-5 text-text-main">
        <p>
          Hello fellow human 👋 welcome to my corner of the internet!
        </p>
        <p>
          I am a {getAge()} year-old software engineer who gets a thrill out of designing large systems, playing any sport with a ball, enjoying nature, visiting new places, singing, speedrunning Minecraft, and many other things.
        </p>
        <p>
          Whether it be with my family, my friends, or my girlfriend, I value deep conversations and meaningful connection highly. I'm also trying to slow down more and enjoy the small moments.
        </p>
        <p>
          I am always happy to connect and get to know each other! Feel free to shoot me a connect request on <a className="trail" href="https://www.linkedin.com/in/joe-furfaro/" target="_blank">LinkedIn</a>.
        </p>
      </div>
      <GuideRule label="§ career" />
      <div className="px-4 pt-8 pb-6">
        <Marquetry cols={8} rows={1} size={56} gap={12} />
      </div>
      <SectionHeading number="01" color="green">My Career</SectionHeading>
      <Career />
      <GuideRule label="§ education" className="mt-4" />
      <SectionHeading number="02" color="teal">My Education</SectionHeading>
      <Education />
    </PageLayout>
  );
}
