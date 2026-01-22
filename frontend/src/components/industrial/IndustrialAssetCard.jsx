import React from 'react';
import Card from '../ui/Card';

const IndustrialAssetCard = ({ asset, onClick }) => {
    const isEfficient = asset.efficiency_percentage > 85;

    return (
        <Card
            onClick={() => onClick(asset)}
            className="p-6 cursor-pointer hover:border-blue-500/40 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200 dark:border-white/5 transition-all duration-300 group hover:shadow-2xl hover:shadow-blue-500/5"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 group-hover:border-blue-500/20 transition-all">
                    <span className="text-2xl font-display font-bold text-slate-900 dark:text-white">{asset.nominal_power_kw}</span>
                    <span className="text-[10px] text-slate-400 font-black ml-1 uppercase">kW</span>
                </div>
                <div className="relative">
                    <div className={`size-3 rounded-full ${isEfficient
                            ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]'
                            : 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                        } animate-pulse`}></div>
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-[9px] text-blue-500 font-black tracking-[0.2em] uppercase">{asset.asset_type}</p>
                <h4 className="text-lg font-display font-bold text-slate-900 dark:text-white uppercase leading-tight truncate group-hover:text-blue-500 transition-colors">
                    {asset.name}
                </h4>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Uso Diario</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{asset.daily_usage_hours}h / 24h</span>
                </div>
                <div className="flex flex-col gap-1 items-end">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Eficiencia IA</span>
                    <span className={`text-xs font-bold ${isEfficient ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {asset.efficiency_percentage}%
                    </span>
                </div>
            </div>

            {/* Indicador de zona sutil */}
            <div className="mt-4 flex items-center gap-2 opacity-50">
                <div className="size-1 bg-slate-400 rounded-full"></div>
                <span className="text-[8px] font-bold uppercase tracking-tighter text-slate-500 truncate">
                    {asset.location || 'Zona General'}
                </span>
            </div>
        </Card>
    );
};

export default IndustrialAssetCard;
