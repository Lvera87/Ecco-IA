import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Factory, LayoutDashboard, Globe, LogOut, MessageSquareText, Settings } from 'lucide-react';
import { useUser } from '../context/UserContext';

const IndustrialSidebar = () => {
    const { logout } = useUser();
    const navigate = useNavigate();
    const navItems = [
        { to: "/industrial-dashboard", icon: LayoutDashboard, label: "Dashboard IA" },
        { to: "/carbon-footprint-industrial", icon: Globe, label: "Huella de Carbono" },
    ];

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <aside className="w-72 bg-slate-950 h-full flex flex-col p-6 text-slate-300 shrink-0 border-r border-slate-900">
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
                    <button
                        onClick={handleLogoutClick}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
                    >
                        <LogOut size={20} />
                        <span className="text-sm font-medium tracking-tight">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                                <LogOut size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">¿Cerrar Sesión?</h3>
                                <p className="text-slate-400 text-sm">
                                    Tendrás que iniciar sesión nuevamente para acceder a tu panel industrial.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-500 font-bold transition-colors shadow-lg shadow-red-600/20"
                                >
                                    Salir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default IndustrialSidebar;
