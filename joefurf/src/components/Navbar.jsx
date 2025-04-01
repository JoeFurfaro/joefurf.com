import { useLocation, useNavigate } from '@tanstack/react-router';

const NavbarItem = ({label, path}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const selected = path === location.pathname;

    return selected ? <p className="hover:underline cursor-pointer text-emerald-700">{label}</p> : <p className="text-slate-700 cursor-pointer hover:underline hover:text-slate-500" onClick={() => navigate({to: path})}>{label}</p>;
}

export const Navbar = ({items}) => {
    return <div className="flex gap-4">
        {items.map(item => <NavbarItem key={"navitem-" + item.label} label={item.label} path={item.path} />)}
    </div>
};