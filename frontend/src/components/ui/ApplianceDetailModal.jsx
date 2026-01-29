import React from 'react';
import { X, Zap, Clock, DollarSign, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const ApplianceDetailModal = ({ isOpen, onClose, appliance, onToggle }) => {
    if (!isOpen || !appliance) return null;

    const isOnline = appliance.status;
    const isEfficient = appliance.expertStatus === 'Excellent';

    // Formatear moneda
    const formatMoney = (val) => new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(val);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">

                {/* Header Image */}
                <div className="relative h-56 w-full group">
                    <img
                        src={appliance.bgImage || "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=300&auto=format&fit=crop"}
                        alt={appliance.name}
                        className="w-full h-full object-cover"
                    />
                    {/* Gradient only at the bottom for text readability */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="absolute bottom-4 left-6 right-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${isOnline ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                                }`}>
                                {isOnline ? 'Encendido' : 'Apagado'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${isEfficient ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                }`}>
                                {isEfficient ? 'Eficiente' : 'Ineficiente'}
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-white leading-none drop-shadow-lg tracking-tight">{appliance.name}</h2>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-6">

                    {/* Main Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                                <Zap size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Consumo</span>
                            </div>
                            <p className="text-xl font-black text-slate-900 dark:text-white">
                                {appliance.consumption ? (appliance.consumption * 30).toFixed(1) : '0'} <span className="text-sm font-medium text-slate-400">kWh/mes</span>
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                                <DollarSign size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Costo Est.</span>
                            </div>
                            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                                {appliance.monthlyCost ? formatMoney(appliance.monthlyCost) : '$0'}
                            </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400">
                                <Activity size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Estado</span>
                            </div>
                            <p className={`text-xl font-black ${isOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                {isOnline ? 'Activo' : 'Inactivo'}
                            </p>
                        </div>
                    </div>

                    {/* Analysis Section */}
                    <div className={`p-4 rounded-2xl border ${isEfficient
                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                        : 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
                        }`}>
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full shrink-0 ${isEfficient ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                {isEfficient ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                            </div>
                            <div>
                                <h4 className={`font-bold mb-1 ${isEfficient ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'
                                    }`}>
                                    {isEfficient ? 'Funcionamiento Óptimo' : 'Atención Requerida'}
                                </h4>
                                <p className={`text-sm leading-relaxed ${isEfficient ? 'text-emerald-800 dark:text-emerald-200/80' : 'text-amber-800 dark:text-amber-200/80'
                                    }`}>
                                    {isEfficient
                                        ? 'Este dispositivo presenta un consumo acorde a su categoría y uso esperado.'
                                        : appliance.warning || 'Se ha detectado un consumo superior al promedio. Considere revisar el equipo o sus hábitos de uso.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="pt-2">
                        <button
                            onClick={() => {
                                if (onToggle) onToggle(appliance);
                            }}
                            className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all transform active:scale-95 ${isOnline
                                    ? 'bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700'
                                    : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-emerald-500/30'
                                }`}
                        >
                            {isOnline ? 'Apagar Dispositivo' : 'Encender Dispositivo'}
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ApplianceDetailModal;
