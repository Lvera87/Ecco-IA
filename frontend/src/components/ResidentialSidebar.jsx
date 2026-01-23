import React, { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Refrigerator,
  Trophy,
  LineChart,
  Leaf,
  Settings,
  LogOut,
  Zap,
  MessageSquareText
} from 'lucide-react';
import ConfirmationModal from './ui/ConfirmationModal';

const ResidentialSidebar = () => {
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Panel de Control" },
    { to: "/financial-impact", icon: Receipt, label: "Facturación" },
    { to: "/appliances", icon: Refrigerator, label: "Electrodomésticos" },
    { to: "/residential-assistant", icon: MessageSquareText, label: "Asistente Ecco" },
    { to: "/missions", icon: Trophy, label: "Misiones" },
    { to: "/energy-analysis", icon: LineChart, label: "Análisis" },
    { to: "/carbon-footprint", icon: Leaf, label: "Huella de Carbono" },
  ];

  const handleLogout = () => {
    // Aquí iría la lógica de logout (limpiar storage, context, etc.)
    localStorage.removeItem('userProfile');
    localStorage.removeItem('appliances');
    navigate('/');
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <aside className="w-72 bg-slate-950 h-full flex flex-col p-6 text-slate-300 shrink-0 border-r border-slate-900">
        <Link to="/" className="flex items-center gap-3 mb-10 px-2 group cursor-pointer decoration-none">
          <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Zap size={24} className="text-slate-950" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-white leading-none">EccoIA</h1>
        </Link>

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                              ${isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
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

        <div className="mt-auto pt-6 space-y-1.5 border-t border-slate-900 text-slate-400">
          <a className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-900 hover:text-white transition-all cursor-pointer" href="#">
            <Settings size={20} />
            <span className="text-sm font-medium tracking-tight">Configuración</span>
          </a>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer text-left"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium tracking-tight">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="¿Cerrar Sesión?"
        message="Estás a punto de cerrar sesión. Tendrás que ingresar tus credenciales nuevamente para acceder."
        confirmText="Sí, Cerrar Sesión"
        cancelText="Cancelar"
      />
    </>
  );
};

export default ResidentialSidebar;
