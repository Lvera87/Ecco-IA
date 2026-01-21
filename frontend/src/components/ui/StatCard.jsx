import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import Card from './Card';

const StatCard = ({
    title,
    value,
    unit,
    icon: Icon,
    color = 'primary',
    trend,
    trendValue,
    tooltip,
    className = ""
}) => {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary border-primary/20',
        emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        red: 'bg-red-500/10 text-red-500 border-red-500/20',
        purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    };

    return (
        <Card className={`p-6 flex flex-col group hover:border-emerald-500/30 transition-all duration-300 ${className}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl border ${colorClasses[color]} shadow-sm`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-bold ${trend === 'down' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trend === 'down' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                        {trendValue}%
                    </div>
                )}
            </div>
            <div className="mt-auto">
                <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
                    {tooltip && (
                        <div className="group/tip relative">
                            <Info size={12} className="text-slate-300 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-[10px] text-white rounded-lg opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-50">
                                {tooltip}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</span>
                    <span className="text-sm font-bold text-slate-400">{unit}</span>
                </div>
            </div>
        </Card>
    );
};

export default StatCard;
