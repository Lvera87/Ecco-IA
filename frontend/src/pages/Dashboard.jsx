import React, { useState } from 'react';
import {
  Zap, TrendingDown, Leaf, Trophy, Calendar, ChevronRight,
  Target, Award, DollarSign, Plus, Lightbulb, Wind, AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import InsightCard from '../components/ui/InsightCard';
import EmptyState from '../components/ui/EmptyState';
import GoalsModal from '../components/ui/GoalsModal';
import ConsumptionModal from '../components/ui/ConsumptionModal';
import { useApp } from '../context/AppContext';
import { useEnergyMath } from '../hooks/useEnergyMath';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-700/50 backdrop-blur-md p-3 rounded-xl shadow-2xl">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{payload[0].payload.time}</p>
        <p className="text-xl font-display font-bold text-emerald-400">
          {payload[0].value} <span className="text-xs font-medium text-slate-500">kW/h</span>
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);

  const {
    appliances, missions, claimMission, iconMap, goals,
    consumptionHistory, addConsumptionReading
  } = useApp();

  const {
    latestReading, projectedKwh, projectedBill, vampireMoneyLost,
    currentMonthlyCO2, treesEquivalent, kwhPrice, userStratum,
    hasData, hasProfile, formatMoney, enrichedAppliances
  } = useEnergyMath();

  const handleSaveConsumption = (data) => {
    addConsumptionReading(data);
    setIsConsumptionModalOpen(false);
  };

  // Occupancy-based efficiency status
  const occupants = 3; // Mock or from profile
  const kwhPerPerson = projectedKwh / occupants;
  const efficiencyStatus = kwhPerPerson < 45 ? 'excellent' : kwhPerPerson < 70 ? 'good' : 'bad';

  // Progress toward goal
  const monthlyBudgetKwh = goals?.monthlyBudget ? (goals.monthlyBudget / kwhPrice) : 150;
  const dailyGoal = monthlyBudgetKwh / 30;
  const dailyProgress = latestReading > 0 ? Math.min(Math.round((latestReading / dailyGoal) * 100), 100) : 0;

  const activeAppliances = enrichedAppliances.filter(a => a.status).slice(0, 4);
  const suggestedMission = missions?.find(m => m.status === 'claimable') || missions?.find(m => m.status === 'active');
  const MissionIcon = suggestedMission ? (iconMap?.[suggestedMission.icon] || Zap) : Zap;

  // Chart data
  const energyData = hasData ? [
    { time: '00:00', value: 0.45 }, { time: '04:00', value: 0.35 },
    { time: '08:00', value: 0.88 }, { time: '12:00', value: 0.72 },
    { time: '16:00', value: 0.85 }, { time: '20:00', value: 0.82 },
    { time: '22:00', value: 0.65 },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-body relative overflow-x-hidden">
      <main className="relative z-10 p-8 max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">¡Hola de nuevo!</h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2">
              <Calendar size={16} className="text-emerald-500" />
              {hasData
                ? <span>Tu proyección financiera es de <span className="text-emerald-500 font-bold">{formatMoney(projectedBill)}</span> este mes.</span>
                : <span>Empieza a registrar tu consumo para ver proyecciones.</span>
              }
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end px-4 border-r border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Estrato {userStratum}</span>
              <span className="text-xl font-display font-bold text-emerald-500">${kwhPrice}/kWh</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsGoalsModalOpen(true)}
              className="border-slate-200 dark:border-slate-800"
            >
              Presupuesto
            </Button>
            <Button
              onClick={() => setIsConsumptionModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20"
            >
              <Plus size={18} className="mr-2" />
              Reportar
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {/* Consumption Monitor */}
          <Card className="md:col-span-2 md:row-span-2 p-8 flex flex-col relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Consumo Diario</h3>
                <p className="text-slate-500 text-sm mt-1">Estimación basada en tus reportes</p>
              </div>
              {hasData && (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Monitor Activo</span>
                </div>
              )}
            </div>

            {hasData ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-baseline gap-3 mb-8">
                  <span className="text-6xl font-display font-bold text-slate-900 dark:text-white tracking-tighter">{latestReading}</span>
                  <span className="text-2xl font-display font-medium text-slate-400 uppercase tracking-widest">kWh</span>
                </div>
                <div className="flex-1" style={{ minHeight: '250px' }}>
                  <ResponsiveContainer width="100%" height={256}>
                    <AreaChart data={energyData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide />
                      <YAxis hide domain={[0, 'auto']} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  title="Sin datos de consumo"
                  description="Necesitamos al menos un reporte para mostrar tu actividad diaria."
                  actionText="Reportar ahora"
                  onAction={() => setIsConsumptionModalOpen(true)}
                />
              </div>
            )}
          </Card>

          {/* Vital Stats */}
          <StatCard
            title="Proyección Factura"
            value={formatMoney(projectedBill)}
            unit="/ mes"
            icon={DollarSign}
            color="emerald"
          />
          <StatCard
            title="Costo Vampiro"
            value={formatMoney(vampireMoneyLost)}
            unit="/ mes"
            icon={TrendingDown}
            color={vampireMoneyLost > 25000 ? "red" : "amber"}
          />
          <StatCard
            title="Consumo Per Cápita"
            value={kwhPerPerson.toFixed(1)}
            unit="kWh / mes"
            icon={Award}
            color={efficiencyStatus === 'excellent' ? "emerald" : efficiencyStatus === 'good' ? "blue" : "red"}
          />
          <StatCard
            title="Meta de Ahorro"
            value={`${dailyProgress}%`}
            unit="ejecutado"
            icon={Target}
            color={dailyProgress > 90 ? "red" : "purple"}
          />

          {/* Active Inventory */}
          <Card className="md:col-span-2 p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                <Lightbulb size={20} className="text-emerald-500" /> Inventorio Energético
              </h3>
              <button className="text-xs text-slate-500 hover:text-emerald-500 transition-colors flex items-center gap-1 font-bold uppercase tracking-widest">
                Gestionar <ChevronRight size={14} />
              </button>
            </div>

            {activeAppliances.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {activeAppliances.map((app) => {
                  const AppIcon = (iconMap && iconMap[app.icon]) || Wind;
                  return (
                    <div key={app.id} className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all">
                      <div className="size-10 rounded-xl flex items-center justify-center mb-3 bg-emerald-500/10 text-emerald-500">
                        <AppIcon size={20} />
                      </div>
                      <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{app.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{formatMoney(app.monthlyCost)} / mes</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-slate-400 text-sm italic">
                No hay dispositivos activos registrados.
              </div>
            )}
          </Card>

          {/* Suggested Action */}
          {suggestedMission && (
            <Card className="md:col-span-1 lg:col-span-2 p-6 bg-gradient-to-br from-emerald-500/10 to-blue-500/5 border-emerald-500/20 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg">
                    <MissionIcon size={24} />
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">Misión Activa</span>
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">{suggestedMission.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">{suggestedMission.description}</p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-500" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">+{suggestedMission.xp} XP</span>
                </div>
                {suggestedMission.status === 'claimable' ? (
                  <Button
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold"
                    onClick={() => claimMission(suggestedMission.id)}
                  >
                    Reclamar
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="text-xs">
                    Ver más
                  </Button>
                )}
              </div>
            </Card>
          )}

        </div>
      </main>

      <GoalsModal isOpen={isGoalsModalOpen} onClose={() => setIsGoalsModalOpen(false)} />
      <ConsumptionModal
        isOpen={isConsumptionModalOpen}
        onClose={() => setIsConsumptionModalOpen(false)}
        currentGoal={goals?.monthlyBudget}
        lastReading={latestReading}
        onSave={handleSaveConsumption}
      />
    </div>
  );
};

export default Dashboard;

