import React from 'react';
import { NavLink } from 'react-router-dom';

const ResidentialSidebar = () => {
  return (
    <aside className="w-72 bg-sidebar-bg h-full flex flex-col p-6 text-white shrink-0">
      <div className="flex items-center gap-2 mb-10 px-2">
        <span className="material-symbols-outlined text-primary text-3xl font-bold">eco</span>
        <h1 className="text-2xl font-extrabold tracking-tight">EccoIA</h1>
      </div>
      <nav className="flex-1 space-y-2">
        <NavLink to="/residential/dashboard" className="sidebar-item" activeClassName="sidebar-item-active">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-semibold text-sm">Panel de Control</span>
        </NavLink>
        <NavLink to="/residential/billing" className="sidebar-item" activeClassName="sidebar-item-active">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="font-semibold text-sm">Facturación</span>
        </NavLink>
        <NavLink to="/residential/appliances" className="sidebar-item" activeClassName="sidebar-item-active">
          <span className="material-symbols-outlined">kitchen</span>
          <span className="font-semibold text-sm">Electrodomésticos</span>
        </NavLink>
        <NavLink to="/residential/missions" className="sidebar-item" activeClassName="sidebar-item-active">
          <span className="material-symbols-outlined">military_tech</span>
          <span className="font-semibold text-sm">Misiones</span>
        </NavLink>
        <NavLink to="/residential/analysis" className="sidebar-item" activeClassName="sidebar-item-active">
          <span className="material-symbols-outlined">insights</span>
          <span className="font-semibold text-sm">Análisis</span>
        </NavLink>
        <NavLink to="/residential/carbon-footprint" className="sidebar-item" activeClassName="sidebar-item-active">
          <span className="material-symbols-outlined">co2</span>
          <span className="font-semibold text-sm">Huella de Carbono</span>
        </NavLink>
      </nav>
      <div className="mt-auto pt-6 border-t border-white/10">
        <a className="sidebar-item" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span className="font-semibold text-sm">Configuración</span>
        </a>
        <a className="sidebar-item text-danger hover:bg-danger/10" href="#">
          <span className="material-symbols-outlined">logout</span>
          <span className="font-semibold text-sm">Cerrar Sesión</span>
        </a>
      </div>
    </aside>
  );
};

export default ResidentialSidebar;
