import React from 'react';
import { Wind, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';

const IndustrialInsightBanner = ({ insight, onClick }) => {
    if (!insight?.top_waste_reason) return null;

    return (
        <Card
            className="p-1 gap-1 bg-red-500/5 border-red-500/20 cursor-pointer hover:bg-red-500/10 transition-all duration-500 flex flex-col md:flex-row items-stretch group overflow-hidden"
            onClick={onClick}
        >
            <div className="md:w-32 bg-red-500 text-white flex items-center justify-center p-6 md:rounded-l-2xl shadow-2xl shadow-red-500/20 group-hover:scale-[1.02] transition-transform">
                <Wind size={42} className="animate-pulse" />
            </div>

            <div className="flex-1 p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                        <span className="px-3 py-1 bg-red-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-red-500/20">
                            AI technical Audit
                        </span>
                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest animate-pulse">
                            Impacto Crítico
                        </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white uppercase leading-tight">
                        Fuga de Eficiencia: <span className="text-red-500">{insight.top_waste_reason}</span>
                    </h3>

                    <div className="flex items-center gap-4 mt-3 justify-center md:justify-start">
                        <p className="text-slate-500 text-sm font-medium">
                            Ahorro mensual potencial: <span className="text-emerald-500 font-bold text-base">{insight.potential_savings}</span>
                        </p>
                        <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Recomendación lista</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-6 border-l border-red-500/10 hidden md:flex">
                    <span className="text-[10px] font-black uppercase text-red-500 tracking-widest whitespace-nowrap">Ver Solución</span>
                    <div className="size-12 rounded-full border border-red-500/20 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" size={24} />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default IndustrialInsightBanner;
