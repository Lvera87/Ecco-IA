import React from 'react';
import { Sparkles, X, TrendingUp, Wallet, ArrowRight, Lightbulb } from 'lucide-react';
import Card from './Card';
import Button from './Button';

const ResidentialInsightAlert = ({ insight, onClose }) => {
    if (!insight) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-4rem)] max-w-2xl animate-in slide-in-from-bottom-8 duration-700 ease-out">
            <Card className="p-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 rounded-[2.5rem] shadow-[0_20px_50px_rgba(16,185,129,0.3)]">
                <div className="bg-white dark:bg-slate-900 rounded-[2.3rem] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">

                    {/* Decorative Sparkles */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Sparkles size={120} className="text-emerald-500" />
                    </div>

                    <div className="size-20 shrink-0 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 shadow-inner group">
                        <Lightbulb size={40} className="group-hover:scale-110 transition-transform duration-500" />
                    </div>

                    <div className="flex-1 space-y-3 text-center md:text-left">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            <span className="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                                Gemini Consciente
                            </span>
                            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 animate-pulse">
                                <TrendingUp size={14} /> Recomendación de Ahorro
                            </span>
                        </div>

                        <h3 className="text-xl md:text-2xl font-display font-bold text-slate-900 dark:text-white leading-tight">
                            {insight.top_waste_reason || 'Nueva oportunidad de ahorro'}
                        </h3>

                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                            {insight.ai_interpretation || 'He analizado tu consumo y encontré una forma de reducir tu factura.'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
                        <Button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-8 h-14 rounded-2xl flex items-center justify-center gap-2 group shadow-xl">
                            <Wallet size={18} />
                            Ahorrar {insight.potential_savings || '$15k'}
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <button
                            onClick={onClose}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-colors py-2"
                        >
                            Cerrar por ahora
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ResidentialInsightAlert;
