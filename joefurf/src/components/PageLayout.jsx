import { Navbar } from "./Navbar";

const nav_items = [
    {label: "me", path: "/"},
    {label: "blog", path: "/blog"},
    {label: "roadmap", path: "/roadmap"},
]

export const PageLayout = ({children}) => {
    return <div className="mx-auto flex flex-col gap-8 container max-w-[768px] p-8">
        <Navbar items={nav_items} />
        {children}
    </div>
};