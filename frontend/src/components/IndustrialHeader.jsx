import React from 'react';
import { Building2, Download, Bell, Settings } from 'lucide-react';
import Button from './ui/Button';

const IndustrialHeader = () => {
    return (
        <header className="h-20 bg-slate-950 border-b border-slate-900 px-8 flex items-center justify-between shrink-0 relative z-10">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner">
                        <Building2 size={24} className="text-blue-500" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="font-display font-bold text-white tracking-tight">Planta Principal</h2>
                            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">Operativo</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">Gerente de Operaciones</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-600/20"
                >
                    <Download size={18} className="mr-2" />
                    <span className="text-sm font-bold">Descargar Reporte</span>
                </Button>

                <div className="relative group">
                    <button className="p-2.5 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl border border-transparent hover:border-slate-800 transition-all">
                        <Bell size={20} />
                    </button>
                    <span className="absolute top-2 right-2 size-2 bg-blue-500 rounded-full border-2 border-slate-950"></span>
                </div>

                <button className="p-2.5 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl border border-transparent hover:border-slate-800 transition-all">
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
};

export default IndustrialHeader;
