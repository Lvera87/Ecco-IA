import React from 'react';
import Card from '../ui/Card';

const IndustrialMetricCard = ({
    title,
    value,
    unit,
    icon: Icon,
    colorClass = "text-blue-500",
    trend,
    isPremium = false
}) => {
    return (
        <Card className={`p-8 flex flex-col justify-between transition-all duration-300 group hover:translate-y-[-4px] ${isPremium
            ? 'bg-slate-900 border-blue-500/20 relative overflow-hidden'
            : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-200 dark:border-white/5 hover:border-blue-500/30'
            }`}>
            {isPremium && (
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-150 transition-transform duration-1000">
                    <Icon size={140} className={colorClass} />
                </div>
            )}

            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isPremium ? 'text-blue-400' : 'text-slate-400'}`}>
                        {title}
                    </p>
                    <Icon className={`${colorClass} group-hover:scale-110 transition-transform duration-500 shadow-glow`} size={20} />
                </div>

                <div className="mt-8 flex items-baseline gap-2">
                    <h2 className={`text-5xl font-display font-bold leading-none tracking-tight ${isPremium ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {value}
                    </h2>
                    {unit && (
                        <div className="flex flex-col">
                            <span className={`text-[10px] uppercase font-bold tracking-widest ${isPremium ? 'text-blue-400' : 'text-slate-400'}`}>
                                {unit}
                            </span>
                        </div>
                    )}
                </div>

                {trend && (
                    <div className="mt-4 flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                            }`}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">vs mes anterior</span>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default IndustrialMetricCard;
