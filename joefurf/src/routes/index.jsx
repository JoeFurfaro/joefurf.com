import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "../components/PageLayout";
import { Tag, Collapse } from 'antd';

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

const SocialLink = ({ icon, href }) => {
  return (
    <a
      href={href}
      target="_blank"
      className="cursor-pointer, text-slate-700 hover:text-slate-500"
    >
      {icon}
    </a>
  );
};

const Tags = () => {
  const tags = [
    {label: "Nerd (Engineer)", variant: "slate"},
    {label: "Athlete", variant: "slate"},
    {label: "Adventurer", variant: "slate"},
    {label: "Zac Main", variant: "green"},
  ];

  return tags.map(tag => {
    if(tag.variant === "slate")
      return <Tag key={"tag-" + tag.label} className="!bg-slate-200 !text-slate-700 !border-slate-300 !mx-0">{tag.label}</Tag>;
    else if(tag.variant === "green")
      return <Tag key={"tag-" + tag.label} className="!bg-emerald-100 !text-emerald-800 !border-emerald-300 !mx-0">{tag.label}</Tag>;

  });
};

const JobHeader = ({company, logo, role, time}) => {
  return <div className="flex flex-col gap-3 md:gap-2 md:flex-row md:justify-between md:items-center">
  <div className="flex items-center gap-2">
    <img src={logo} alt={company + " Logo"} className="w-5 rounded-sm" />
    <p className="!text-slate-700 !text-sm md:!text-base">{company} - <span className="font-medium">{role}</span></p>
  </div>
  <p className="!text-slate-500 md:!text-base !text-sm">{time}</p>
</div>
};

const JobDetails = ({items}) => {
  return <ul className="list-disc ml-6 text-slate-700">
    {items}
  </ul>;
}

const Career = () => {
  const items = [
    {
      key: '1',
      label: <JobHeader company="Stripe" logo={stripe} role="Software Engineer" time="Starting April, 2025" />,
      children: <JobDetails items={[
        <li><span className="text-slate-500">Starting in April, 2025</span> - building Stripe's <a href="https://docs.stripe.com/get-started/account/orgs" target="_blank" className="!text-indigo-700 hover:!underline cursor-pointer">Organizations & Auth</a> product</li>
      ]} />,
    },
    {
      key: '2',
      label: <JobHeader company="AIRTIME (start-up)" logo={airtime} role="Tech Lead" time="Current" />,
      children: <JobDetails items={[
        <li>Developing booking & company management suite for high-performance youth volleyball clinics</li>,
        <li className="text-slate-500">Target launch of new platform is Summer, 2026</li>
      ]} />,
    },
    {
      key: '3',
      label: <JobHeader company="Martinrea" logo={martinrea} role="Engineering Supervisor" time="2023-2025" />,
      children: <JobDetails items={[
        <li>Became a strong, confident, and purpose-driven leader through excellent mentorship from <a className="!text-emerald-700 hover:!underline" href="https://www.linkedin.com/in/jeffrey-j-liaw-p-eng-973542a/" target="_blank">Jeffrey Liaw</a> and <a className="!text-emerald-700 hover:!underline" href="https://www.linkedin.com/in/david-petkovsek/" target="_blank">David Petkovsek</a></li>,
        <li>Founded, designed, and implemented Martinrea's internal deployment platform <span className="text-indigo-500">Factory Engine</span></li>,
        <li>Led and mentored 20+ people in Software Engineering and UI/UX design</li>,
        <li>Worked with C-Suite and senior operations leadership to develop standards & ship</li>,
        <li><span className="text-slate-500">Distributed edge containerization pipelines, compilers, developer experience tooling, beautiful interfaces, automatic build systems, platform documentation, and many more fun things!</span></li>
      ]} />,
    },
    {
      key: '4',
      label: <JobHeader company="Martinrea" logo={martinrea} role="SWE Intern" time="2018-2022" />,
      children: <JobDetails items={[
        <li>Developed web-based UI tools for Martinrea's Autonomous Mobile Robot (AMR) product</li>,
        <li>Optimized computer vision and navigation algorithms for AMRs</li>,
        <li>Shipped an eCommerce store for selling medical masks during the COVID-19 pandemic</li>,
      ]} />,
    },
    {
      key: '5',
      label: <JobHeader company="eatDipole (start-up)" logo={dipole} role="Co-Founder" time="2019-2021" />,
      children: <JobDetails items={[
        <li>Developed a software product & management platform for an order-ahead cloud kitchen start-up</li>,
        <li>Deployed and delivered food to 150+ customers in Hamilton, Ontario</li>,
        <li className="text-slate-500">Order scheduling, route optimization, Stripe payment processing, on-call production support</li>,
        <li className="text-rose-900">Closed in 2021 due to difficulties in operating during COVID-19 pandemic</li>,
      ]} />,
    },
  ];

  return <Collapse accordion items={items} />
}

const Education = () => {
  const items = [
    {
      key: '1',
      label: <JobHeader company="McMaster University" logo={mcmaster} role="Computer Science" time="2019-2023" />,
      children: <JobDetails items={[
        <li>Learned fundamentals of computer science and made some great friends and memories along the way</li>,
        <li className="text-slate-500">Data structures & algorithms, computer architecture, concurrent systems, computer networks & security, discrete math, human computer interfaces, compilers</li>
      ]} />,
    },
  ];

  return <Collapse accordion items={items} />
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
  return (
    <PageLayout>
      <div className="flex flex-col-reverse gap-4 md:flex-row items-center md:justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <h1 className="text-4xl text-slate-700 font-medium">Joe Furfaro</h1>
            <a
              href="https://maps.app.goo.gl/W1VfnKGWiUPyQS9w6"
              target="_blank"
              className="group text-lg text-slate-500 cursor-pointer hover:underline flex flex-row gap-1 items-center"
            >
              <p>Toronto, Ontario, Canada</p>
              <span className="group-hover:text-slate-600">
                <FaLocationDot />
              </span>
            </a>
          </div>
          <div className="flex flex-row gap-1 flex-wrap gap-y-2 justify-center md:justify-start">
            <Tags />
          </div>
          <div className="flex flex-row gap-3 md:gap-2 text-4xl md:text-2xl mt-1 text-slate-700 justify-center md:justify-start">
            <SocialLink
              href="https://www.linkedin.com/in/joe-furfaro/"
              icon={<FaLinkedin />}
            />
            <SocialLink
              href="https://github.com/JoeFurfaro"
              icon={<FaGithub />}
            />
            <SocialLink
              href="https://www.instagram.com/joefurf/"
              icon={<FaInstagram />}
            />
          </div>
        </div>
        <img
          src={me}
          className="h-40 w-40 rounded-full shadow-xl"
        />
      </div>
      <div className="flex flex-col gap-6 text-slate-700">
        <p>
          Hello fellow human 👋 welcome to my very small corner of the internet!
        </p>
        <p>
          I am a {getAge()} year-old software engineer who gets a thrill out of designing large systems, playing any sport with a ball <span className="italic text-slate-500">(or without, I suppose)</span>, enjoying nature, visiting new places, singing, playing League of Legends, speedrunning Minecraft, and many other things.
        </p>
        <p>
          Whether it be with my family, my friends, or <a className="text-emerald-700 hover:underline" href="https://www.linkedin.com/in/briana-da-silva-2000/" target="_blank">my beautiful girlfriend Briana</a>, I value deep conversations and meaningful connection above most other things. However, I am <span className="font-medium italic">*slowly*</span> learning to also appreciate the simple things more: <span className="text-blue-800">a cool breeze</span> on a summer day or <span className="text-amber-700">the taste of fresh salmon sashimi</span> on the first bite.
        </p>
        <p>
          I am <span className="italic text-slate-500">(almost)</span> always happy to connect and get to know each other! Feel free to shoot me a connect request on <a className="text-emerald-700 hover:underline" href="https://www.linkedin.com/in/joe-furfaro/" target="_blank">LinkedIn</a>.
        </p>
      </div>
      <h2 className="text-2xl text-slate-700 font-medium">My Career</h2>
      <Career />
      <h2 className="text-2xl text-slate-700 font-medium">My Education</h2>
      <Education />
      
    </PageLayout>
  );
}
