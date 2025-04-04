import { useLocation, useNavigate, useStableCallback } from '@tanstack/react-router';
import { Button } from "antd";
import { useState } from 'react';
import { AiFillSun, AiFillMoon } from "react-icons/ai";


const NavbarItem = ({label, path}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const selected = path === location.pathname;

    return selected ? <p className="hover:underline cursor-pointer text-hyperlink">{label}</p> : <p className="text-text-main cursor-pointer hover:underline hover:text-text-secondary" onClick={() => navigate({to: path})}>{label}</p>;
}

export const Navbar = ({items}) => {
    const [curTheme, setCurTheme] = useState(localStorage.getItem("theme"));

    const toggleTheme = () => {
        const theme = localStorage.getItem("theme");
        localStorage.setItem("theme", theme === "light" ? "dark" : "light");
        document.body.classList.remove("theme-" + theme);
        document.body.classList.add("theme-" + localStorage.getItem("theme"));
        setCurTheme(localStorage.getItem("theme"));
    };

    return <div className="flex flex-row justify-between">
        <div className="flex gap-4">
            {items.map(item => <NavbarItem key={"navitem-" + item.label} label={item.label} path={item.path} />)}
        </div>
        <Button className="!transition-none !bg-tag-background !border-tag-border !text-text-secondary hover:!text-theme-icon" onClick={toggleTheme}>{curTheme === "light" ? <AiFillSun /> : <AiFillMoon />}</Button>
    </div>
};