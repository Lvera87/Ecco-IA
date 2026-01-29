import React from 'react';
import { CheckCircle2, Circle, Trophy, ArrowRight, Zap, Home, Factory } from 'lucide-react';
import Button from './Button';

const ICON_MAP = {
    Zap,
    Home,
    Factory,
    Trophy,
    UserCheck: Trophy,
    TrendingUp: Trophy
};

const MissionWidget = ({ missions, onComplete, onInspect, loading }) => {
    if (loading) {
        return <div className="animate-pulse bg-white/5 h-64 rounded-2xl"></div>;
    }

    if (!missions || missions.length === 0) {
        return (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                <Trophy className="w-10 h-10 text-emerald-500/50 mx-auto mb-3" />
                <h3 className="text-white font-medium">¡Todo al día!</h3>
                <p className="text-sm text-white/50">Has completado todas tus misiones disponibles por ahora.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    Misiones Activas
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-tighter font-bold">
                    +{missions.reduce((acc, m) => acc + (m.mission?.xp_reward || m.xp_reward || 0), 0)} XP Total
                </span>
            </div>

            <div className="divide-y divide-white/5">
                {missions.map((um, idx) => {
                    const missionData = um.mission || um;
                    if (!missionData) return null;
                    const IconComp = ICON_MAP[missionData.icon] || Zap;

                    return (
                        <div key={um.id || idx} className="p-4 hover:bg-white/5 transition-colors group">
                            <div className="flex gap-4">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl h-fit border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                                    <IconComp className="w-5 h-5 text-emerald-400" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                                            {missionData.title}
                                        </h4>
                                        <span className="text-[10px] text-emerald-400 font-mono">
                                            +{missionData.xp_reward} XP
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/60 line-clamp-2 mb-3">
                                        {missionData.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 max-w-[120px] h-1 bg-white/10 rounded-full mr-4">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full"
                                                style={{ width: `${(um.progress || 0) * 100}%` }}
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (missionData.related_appliance_type && onInspect) {
                                                    onInspect(missionData);
                                                } else {
                                                    onComplete(missionData.id);
                                                }
                                            }}
                                            className="text-[10px] h-7 px-3 py-0 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                        >
                                            {missionData.related_appliance_type ? 'Ver Equipo' : 'Completar'} <ArrowRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default MissionWidget;
