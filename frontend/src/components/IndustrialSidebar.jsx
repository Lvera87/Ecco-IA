import { NavLink, Link } from 'react-router-dom';
import { Factory, LayoutDashboard, Globe, LogOut, MessageSquareText, Settings } from 'lucide-react';

const IndustrialSidebar = ({ isOpen, onClose }) => {
    const navItems = [
        { to: "/industrial-dashboard", icon: LayoutDashboard, label: "Dashboard IA" },
        { to: "/data-assistant", icon: MessageSquareText, label: "Asistente Ecco" },
        { to: "/global-consumption", icon: Globe, label: "Fugas y Desperdicio" },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 h-full flex flex-col p-6 text-slate-300 border-r border-slate-900 shadow-2xl transition-transform duration-300 ease-in-out
                xl:relative xl:translate-x-0 xl:shadow-none
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Link to="/" className="flex items-center gap-3 mb-10 px-2 group cursor-pointer decoration-none">
                    <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                        <Factory size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-display font-bold tracking-tight text-white leading-none">EccoIA <span className="text-blue-500 text-xs block font-mono">INDUSTRIAL</span></h1>
                </Link>

                <nav className="flex-1 space-y-1.5">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                            ${isActive
                                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20'
                                    : 'hover:bg-slate-900 hover:text-white text-slate-400'}
                        `}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="text-sm tracking-tight">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-900 text-slate-400">
                    <a className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer" href="#">
                        <LogOut size={20} />
                        <span className="text-sm font-medium tracking-tight">Cerrar Sesión</span>
                    </a>
                </div>
            </aside>
        </>
    );
};

export default IndustrialSidebar;
