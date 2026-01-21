import React from 'react';

const ResidentialHeader = () => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <span className="material-symbols-outlined text-primary text-2xl">person</span>
            </div>
            <div className="absolute -bottom-1 -right-1 size-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
              12
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-800">Eco-Explorador</h2>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded uppercase">Nivel 12</span>
            </div>
            <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <div className="w-[70%] h-full bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-sm">add</span>
          Añadir Dispositivo
        </button>
        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </div>
    </header>
  );
};

export default ResidentialHeader;
