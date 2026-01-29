import React, { useState, useEffect } from 'react';
import {
  Trophy, Star, Target, Flame, Clock, Zap, Leaf, Award,
  ChevronRight, CheckCircle, Lock, Gift, TrendingUp,
  Coins, Medal, Crown, Shield
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
// Micro-Contexts Architecture
import { useUser } from '../context/UserContext';
import { useEnergy, iconMap } from '../context/EnergyContext';
import ApplianceDetailModal from '../components/ui/ApplianceDetailModal';

// Mapeo de imágenes ilustrativas (Duplicado de Dashboard por seguridad - Idealmente mover a constantes)
const APPLIANCE_IMAGES = {
  Refrigerator: "/fridge.jpeg",
  Tv: "/tv.webp",
  WashingMachine: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?q=80&w=300&auto=format&fit=crop",
  Microwave: "https://images.unsplash.com/photo-1585659722983-3a675dabf194?q=80&w=300&auto=format&fit=crop",
  Fan: "https://images.unsplash.com/photo-1618941716939-553df5266278?q=80&w=300&auto=format&fit=crop",
  AirVent: "https://images.unsplash.com/photo-1615893095033-d8c72836267f?q=80&w=300&auto=format&fit=crop",
  Lightbulb: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=300&auto=format&fit=crop",
  Monitor: "/computer.jpeg",
  default: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=300&auto=format&fit=crop"
};

// Mission Card Component
const MissionCard = ({ mission, onClaim, iconMap }) => {
  const { title, description, xp, progress, maxProgress, status, difficulty, icon, category } = mission;

  const progressPercent = (progress / maxProgress) * 100;

  const statusStyles = {
    active: 'border-primary/30 hover:border-primary',
    completed: 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10',
    locked: 'border-slate-200 dark:border-slate-700 opacity-60',
    claimable: 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/10 animate-pulse'
  };

  const difficultyColors = {
    easy: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
    medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
    hard: 'bg-red-100 text-red-600 dark:bg-red-900/30'
  };

  const categoryColors = {
    daily: 'text-blue-500',
    weekly: 'text-purple-500',
    challenge: 'text-amber-500',
    special: 'text-pink-500'
  };

  // Resolve Icon
  const MissionIcon = (iconMap && iconMap[icon]) || Star;

  return (
    <Card className={`p-6 border-2 transition-all cursor-pointer ${statusStyles[status]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`size-12 rounded-xl flex items-center justify-center 
            ${status === 'locked' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-primary/10 text-primary'}`}>
            {status === 'locked' ? <Lock size={24} /> : <MissionIcon size={24} />}
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${categoryColors[category]}`}>
              {category === 'daily' ? 'Diaria' : category === 'weekly' ? 'Semanal' : category === 'challenge' ? 'Desafío' : 'Especial'}
            </span>
            <h4 className="font-bold text-slate-800 dark:text-white">{title}</h4>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${difficultyColors[difficulty]}`}>
          {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Difícil'}
        </span>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{description}</p>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="font-bold text-slate-600 dark:text-slate-300">Progreso</span>
          <span className="font-black text-primary">{progress}/{maxProgress}</span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500
              ${status === 'completed' || status === 'claimable' ? 'bg-emerald-500' : 'bg-primary'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-amber-500" fill="currentColor" />
          <span className="font-black text-slate-800 dark:text-white">{xp} XP</span>
        </div>

        {status === 'claimable' && (
          <Button variant="primary" size="sm" onClick={onClaim}>
            Reclamar
          </Button>
        )}
        {status === 'completed' && (
          <span className="flex items-center gap-1 text-emerald-500 text-sm font-bold">
            <CheckCircle size={16} /> Completada
          </span>
        )}
        {status === 'active' && mission.related_appliance_type ? (
          <Button variant="ghost" size="sm" onClick={() => onClaim(mission, true)}>
            Ver Equipo <ChevronRight size={16} className="ml-1" />
          </Button>
        ) : status === 'active' ? (
          <ChevronRight size={20} className="text-slate-400" />
        ) : null}
      </div>
    </Card>
  );
};

// Achievement Badge Component
const AchievementBadge = ({ achievement }) => {
  const { name, icon: Icon, unlocked, rarity } = achievement;

  const rarityColors = {
    common: 'from-slate-400 to-slate-500',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-amber-600'
  };

  return (
    <div className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all
      ${unlocked ? 'cursor-pointer hover:scale-105' : 'opacity-40 grayscale'}`}>
      <div className={`size-16 rounded-2xl flex items-center justify-center text-white shadow-lg
        ${unlocked ? `bg-gradient-to-br ${rarityColors[rarity]}` : 'bg-slate-300 dark:bg-slate-700'}`}>
        {unlocked ? <Icon size={32} /> : <Lock size={24} />}
      </div>
      <span className="text-xs font-bold text-center text-slate-600 dark:text-slate-300">{name}</span>
    </div>
  );
};

const Missions = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Micro-Context: User domain (gamification)
  const { missions, claimMission, userProfile, syncGamification } = useUser();

  // Sync gamification data on mount
  useEffect(() => {
    syncGamification();
  }, []);

  const { appliances: activeAppliances, toggleAppliance } = useEnergy();
  const [selectedAppliance, setSelectedAppliance] = useState(null);

  const handleAction = (mission, isInspect) => {
    if (isInspect) {
      handleInspectMission(mission);
    } else {
      claimMission(mission.id);
    }
  };

  const handleInspectMission = (mission) => {
    if (!mission.related_appliance_type) return;
    // We need to fetch the detailed mission object if 'mission' is just the summary, 
    // but 'mission' prop usually has what we need based on UserContext logic.

    // Note: backend 'related_appliance_type' is on the MISSION model, accessible via 'mission' prop here.
    // But in formattedMissions (UserContext), we flattened it? 
    // Let's check UserContext. formattedMissions copies properties but might miss 'related_appliance_type'.
    // I should verify UserContext formatting first.

    // Assuming it's passed (I will verify next).
    const type = (mission.related_appliance_type || '').toLowerCase();
    if (!type) {
      // Fallback if formatting was missed, try to guess from icon or title? 
      // Better to rely on the field.
      return;
    }

    let targetHelper = null;
    if (type === 'fridge') {
      targetHelper = activeAppliances.find(a => a.icon === 'Refrigerator' || a.name.toLowerCase().includes('nevera'));
    } else if (type === 'wasted_energy') {
      targetHelper = activeAppliances.find(a => ['Tv', 'Monitor', 'Consolas', 'Lightbulb'].includes(a.icon));
    } else {
      targetHelper = activeAppliances.find(a => a.icon.toLowerCase() === type || a.name.toLowerCase().includes(type));
    }

    if (targetHelper) {
      const bgImage = APPLIANCE_IMAGES[targetHelper.icon] || APPLIANCE_IMAGES.default;
      setSelectedAppliance({ ...targetHelper, bgImage });
    }
  };

  const achievements = [
    { id: 1, name: 'Primer Paso', icon: Star, unlocked: true, rarity: 'common' },
    { id: 2, name: '7 Días Eco', icon: Flame, unlocked: true, rarity: 'rare' },
    { id: 3, name: 'Ahorrador', icon: Coins, unlocked: true, rarity: 'rare' },
    { id: 4, name: 'Maestro Eco', icon: Medal, unlocked: false, rarity: 'epic' },
    { id: 5, name: 'Leyenda Verde', icon: Crown, unlocked: false, rarity: 'legendary' },
    { id: 6, name: 'Guardián', icon: Shield, unlocked: true, rarity: 'epic' },
  ];

  const filteredMissions = activeTab === 'all'
    ? missions
    : missions.filter(m => m.category === activeTab);

  // Safely calculate progress to avoid NaN
  const safeXp = userProfile?.xp || 0;
  const safeXpToNext = userProfile?.xpToNext || 1000;
  const xpProgress = Math.min((safeXp / safeXpToNext) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Misiones y Logros</h1>
          <p className="text-slate-500 dark:text-slate-400">Completa desafíos, gana XP y desbloquea recompensas exclusivas.</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Level Card */}
          <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-primary to-blue-600 border-none text-white">
            <div className="flex items-center gap-6">
              <div className="size-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Trophy size={40} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-black">{userProfile?.name || 'Explorador'}</h3>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                    Nivel {userProfile?.level || 1}
                  </span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="opacity-80">Progreso al siguiente nivel</span>
                    <span className="font-bold">{safeXp}/{safeXpToNext} XP</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Streak Card */}
          <Card className="p-6 flex items-center gap-4">
            <div className="size-14 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-500">
              <Flame size={28} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Racha Actual</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">{userProfile?.streak || 0} <span className="text-lg">días</span></p>
            </div>
          </Card>

          {/* Total Missions Card */}
          <Card className="p-6 flex items-center gap-4">
            <div className="size-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
              <Target size={28} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Misiones Completadas</p>
              <p className="text-3xl font-black text-slate-800 dark:text-white">
                {missions.filter(m => m.status === 'completed').length}
              </p>
            </div>
          </Card>
        </div>

        {/* Achievements Section */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Award className="text-amber-500" size={24} />
              Logros Recientes
            </h2>
            <Button variant="ghost" size="sm">Ver todos</Button>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {achievements.map(achievement => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </Card>

        {/* Missions Section */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="font-display text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Target className="text-primary" size={24} />
              Misiones Disponibles
            </h2>

            {/* Tabs */}
            <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'daily', label: 'Diarias' },
                { id: 'weekly', label: 'Semanales' },
                { id: 'challenge', label: 'Desafíos' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors
                    ${activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMissions.map(mission => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onClaim={(m, isInspect) => handleAction(m || mission, isInspect)}
                iconMap={iconMap}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <ApplianceDetailModal
        isOpen={!!selectedAppliance}
        onClose={() => setSelectedAppliance(null)}
        appliance={selectedAppliance}
        onToggle={async (app) => {
          // 1. Execute Toggle
          await toggleAppliance(app.id);

          // 2. Update Modal State
          const newStatus = !app.status;
          setSelectedAppliance(prev => ({ ...prev, status: newStatus }));

          // 3. Check Mission Completion (Auto-Claim)
          // Logic: If turning OFF a device (status -> false) and matches Vampire Hunt criteria
          if (newStatus === false) {
            const vampireMission = missions.find(m =>
              m.status === 'active' &&
              m.related_appliance_type === 'wasted_energy' &&
              ['Tv', 'Monitor', 'Consolas', 'Lightbulb', 'Fan', 'Microwave'].includes(app.icon)
            );

            if (vampireMission) {
              await claimMission(vampireMission.id);
            }
          }

          // Logic: If turning ON/Checking (Hogar Consciente - Fridge)
          // Tricky: usually just "Inspecting" is enough for some, but let's say "Interacting" counts.
          if (newStatus === true || newStatus === false) {
            const fridgeMission = missions.find(m =>
              m.status === 'active' &&
              m.related_appliance_type === 'fridge' &&
              (app.icon === 'Refrigerator' || app.name.toLowerCase().includes('nevera'))
            );

            if (fridgeMission) {
              await claimMission(fridgeMission.id);
            }
          }
        }}
      />
    </div>
  );
};

export default Missions;
