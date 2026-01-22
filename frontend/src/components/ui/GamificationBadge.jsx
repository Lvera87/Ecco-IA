import React from 'react';
import { Trophy, Star, TrendingUp } from 'lucide-react';

const GamificationBadge = ({ stats, loading }) => {
    if (loading || !stats) {
        return (
            <div className="animate-pulse bg-white/10 rounded-full h-10 w-32"></div>
        );
    }

    const { profile, next_level_xp } = stats;
    const progressPercent = Math.min((profile.total_xp / next_level_xp) * 100, 100);

    return (
        <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-900/40 to-emerald-900/40 border border-emerald-500/30 rounded-full px-4 py-1.5 backdrop-blur-md hover:scale-105 transition-transform cursor-default select-none shadow-lg shadow-emerald-500/10">
            {/* Level Circle */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-emerald-500 rounded-full blur opacity-20 group-hover:opacity-40 transition"></div>
                <div className="relative w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm border-2 border-emerald-400">
                    {profile.current_level}
                </div>
            </div>

            {/* XP Info */}
            <div className="flex flex-col min-w-[100px]">
                <div className="flex justify-between items-center text-[10px] text-emerald-300/80 mb-0.5 uppercase tracking-wider font-bold">
                    <span className="flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-emerald-400" />
                        {profile.total_xp} XP
                    </span>
                    <span>LVL {profile.current_level + 1}</span>
                </div>

                {/* Progress Bar Container */}
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Points */}
            <div className="flex items-center gap-1.5 ml-1 border-l border-white/10 pl-3">
                <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                    <TrendingUp className="w-3.5 h-3.5 text-yellow-500" />
                </div>
                <span className="text-sm font-bold text-yellow-500">
                    {profile.eco_points}
                </span>
            </div>
        </div>
    );
};

export default GamificationBadge;
