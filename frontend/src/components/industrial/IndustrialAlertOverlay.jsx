import React from 'react';
import { AlertTriangle, Zap, ArrowRight, ShieldAlert, Timer, DollarSign } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

/**
 * IndustrialAlertOverlay: Sistema de alerta de alto impacto con sentido común.
 * Proporciona contexto de pérdida económica y acciones inmediatas.
 */
const IndustrialAlertOverlay = ({ alert, onAction, onClose }) => {
    if (!alert) return null;

    const { assetName, currentKw, limitKw, wastePerHour, duration } = alert;
    const overConsumptionPercent = ((currentKw / limitKw) - 1) * 100;

    return (
        <div className="fixed inset-x-0 top-0 z-[100] p-6 flex justify-center pointer-events-none">
            <Card className="max-w-4xl w-full bg-red-950/90 backdrop-blur-2xl border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)] pointer-events-auto flex flex-col md:flex-row items-stretch overflow-hidden animate-in slide-in-from-top duration-500">

                {/* Lado Izquierdo: Impacto Visual */}
                <div className="bg-red-600 p-8 flex flex-col items-center justify-center text-white gap-4 md:w-56 shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                    <ShieldAlert size={48} className="relative z-10" />
                    <div className="text-center relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Sobre-Carga</p>
                        <p className="text-3xl font-display font-black leading-none">+{overConsumptionPercent.toFixed(0)}%</p>
                    </div>
                </div>

                {/* Centro: Información Crítica */}
                <div className="flex-1 p-8 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">
                                Anomalía detectada en {assetName}
                            </h3>
                            <p className="text-red-200 text-sm font-medium flex items-center gap-2">
                                <Timer size={14} /> Activo hace {duration} minutos
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Pérdida Estimada</p>
                            <p className="text-2xl font-display font-bold text-emerald-400 flex items-center justify-end">
                                <DollarSign size={20} />{wastePerHour} <span className="text-xs ml-1 text-slate-400">/hr</span>
                            </p>
                        </div>
                    </div>

                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min(overConsumptionPercent + 50, 100)}%` }}
                        ></div>
                    </div>

                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex flex-col gap-1">
                            <span>Consumo Actual</span>
                            <span className="text-white text-sm">{currentKw} kW</span>
                        </div>
                        <div className="h-8 w-px bg-white/10"></div>
                        <div className="flex flex-col gap-1">
                            <span>Límite Nominal</span>
                            <span className="text-slate-200 text-sm">{limitKw} kW</span>
                        </div>
                    </div>
                </div>

                {/* Acciones de Sentido Común */}
                <div className="p-8 bg-black/20 border-l border-white/5 flex flex-col justify-center gap-3 md:w-72 shrink-0">
                    <Button
                        onClick={() => onAction('optimize')}
                        className="w-full h-14 bg-white text-red-600 hover:bg-red-50 font-black text-xs uppercase tracking-widest shadow-xl"
                    >
                        Optimizar vía IA
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => onAction('manual')}
                        className="w-full h-12 text-white/70 hover:text-white border border-white/10 font-bold text-[10px] uppercase tracking-widest"
                    >
                        Intervención Manual
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default IndustrialAlertOverlay;
