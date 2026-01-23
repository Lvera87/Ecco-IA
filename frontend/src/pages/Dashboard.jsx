import React, { useState, useCallback } from 'react';
import {
  Zap, TrendingDown, Leaf, Trophy, Calendar, ChevronRight,
  Target, Award, DollarSign, Plus, Lightbulb, Wind, AlertCircle, Activity
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
import ResidentialInsightAlert from '../components/ui/ResidentialInsightAlert';
import GamificationBadge from '../components/ui/GamificationBadge';
import MissionWidget from '../components/ui/MissionWidget';
import { useApp } from '../context/AppContext';
import { useEnergyMath } from '../hooks/useEnergyMath';
import { residentialApi } from '../api/residential';
import { gamificationApi } from '../api/gamification';

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
  const [showInsightAlert, setShowInsightAlert] = useState(true);
  const [isMounted, setIsMounted] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => setIsReady(true), 200);
      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  const {
    appliances, missions, claimMission, iconMap, goals,
    consumptionHistory, addConsumptionReading, setAppliances,
    setConsumptionHistory, setUserProfile, updateGoals
  } = useApp();

  const [loading, setLoading] = useState(true);
  const [residentialInsights, setResidentialInsights] = useState(null);
  const [gamificationStats, setGamificationStats] = useState(null);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [profile, assets, history, insights, gamification] = await Promise.all([
        residentialApi.getProfile(),
        residentialApi.getAssets(),
        residentialApi.getConsumptionHistory(),
        residentialApi.getDashboardInsights(),
        gamificationApi.getStats().catch(() => null)
      ]);

      if (profile) {
        setUserProfile(prev => ({ ...prev, type: 'residential', config: profile }));
        updateGoals({ monthlyBudget: profile.target_monthly_bill });
      }

      if (assets) {
        setAppliances(assets.map(a => ({
          id: a.id,
          name: a.name,
          icon: a.icon,
          // Consumo diario real en kWh
          consumption: (a.power_watts * a.daily_hours) / 1000,
          status: a.status,
          category: a.category,
          isHighImpact: a.is_high_impact,
          monthlyCost: a.monthly_cost_estimate
        })));
      }

      if (history) {
        setConsumptionHistory(history.map(r => ({
          id: r.id,
          date: r.date,
          value: r.reading_value,
          type: r.reading_type
        })));
      }

      if (gamification && gamification.active_missions) {
        // Las misiones ahora vienen del backend
        setGamificationStats(gamification);
      }

      setResidentialInsights(insights);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [setUserProfile, updateGoals, setAppliances, setConsumptionHistory]);

  const handleCompleteMission = async (missionId) => {
    try {
      await gamificationApi.completeMission(missionId);
      // Recarga silenciosa para actualizar XP y misiones
      fetchDashboardData(true);
    } catch (error) {
      console.error("Mission Error:", error);
    }
  };

  const {
    latestReading, projectedKwh, projectedBill, vampireMoneyLost,
    co2Footprint, treesEquivalent, kwhPrice, userStratum,
    hasData, hasProfile, formatMoney, enrichedAppliances
  } = useEnergyMath();

  const handleSaveConsumption = async (data) => {
    try {
      // Persistir en backend
      await residentialApi.addReading({
        reading_value: parseFloat(data.value),
        reading_type: 'manual'
      });
      setIsConsumptionModalOpen(false);
      // Refrescar todo el dashboard con los nuevos cálculos del backend
      fetchDashboardData(true);
    } catch (error) {
      console.error("Error saving reading:", error);
    }
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

  // Chart data usando el historial real
  const energyData = hasData ? consumptionHistory.map(r => ({
    time: new Date(r.date).toLocaleDateString([], { day: '2-digit', month: 'short' }),
    value: r.value
  })).reverse() : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="size-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
        <p className="mt-8 text-slate-500 font-display font-bold uppercase tracking-[0.2em] text-xs animate-pulse">Sincronizando con EccoIA Cloud...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-body relative overflow-x-hidden">
      {showInsightAlert && residentialInsights && (
        <ResidentialInsightAlert
          insight={residentialInsights}
          onClose={() => setShowInsightAlert(false)}
        />
      )}
      <main className="relative z-10 p-8 max-w-[1600px] mx-auto space-y-8">

        {/* Header Section */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">¡Hola de nuevo!</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase text-emerald-500 tracking-wider">
                <Activity size={12} className="animate-pulse" /> Hogar Conectado
              </div>
              <p className="text-sm text-slate-500">
                {hasData
                  ? <>Proyección: <span className="text-emerald-500 font-bold">{formatMoney(projectedBill)}</span> este mes</>
                  : 'Registra tu consumo para ver proyecciones'
                }
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <GamificationBadge stats={gamificationStats} loading={loading} />
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
        </section>

        {/* Main Two-Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

          {/* Left Column: Primary Content (3 cols) */}
          <div className="xl:col-span-3 space-y-8">

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Proyección Factura"
                value={residentialInsights ? formatMoney(residentialInsights.projected_bill) : formatMoney(projectedBill)}
                unit="/ mes"
                icon={DollarSign}
                color="emerald"
              />
              <StatCard
                title="Costo Vampiro"
                value={residentialInsights ? formatMoney(residentialInsights.vampire_cost_monthly) : formatMoney(vampireMoneyLost)}
                unit="/ mes"
                icon={TrendingDown}
                color={(residentialInsights?.vampire_cost_monthly || vampireMoneyLost) > 25000 ? "red" : "amber"}
              />
              <StatCard
                title="Eficiencia Eco"
                value={residentialInsights ? residentialInsights.efficiency_score : 85}
                unit="%"
                icon={Award}
                color={(residentialInsights?.efficiency_score || 85) > 80 ? "emerald" : "blue"}
              />
              <StatCard
                title="Meta de Ahorro"
                value={`${dailyProgress}%`}
                unit="ejecutado"
                icon={Target}
                color={dailyProgress > 90 ? "red" : "purple"}
              />
            </div>

            {/* Consumption Monitor */}
            <Card className="p-8 flex flex-col relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
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
                  <div className="flex-1 w-full min-w-0" style={{ minHeight: '250px' }}>
                    {isReady && (
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
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center py-16">
                  <EmptyState
                    title="Sin datos de consumo"
                    description="Necesitamos al menos un reporte para mostrar tu actividad diaria."
                    actionText="Reportar ahora"
                    onAction={() => setIsConsumptionModalOpen(true)}
                  />
                </div>
              )}
            </Card>

            {/* Active Inventory */}
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                  <Lightbulb size={20} className="text-emerald-500" /> Inventario Energético
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
                      <div key={app.id} className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all group cursor-pointer">
                        <div className="size-10 rounded-xl flex items-center justify-center mb-3 bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
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
          </div>

          {/* Right Column: Gamification & Missions (1 col) */}
          <aside className="xl:col-span-1 space-y-6">
            <MissionWidget
              missions={gamificationStats?.active_missions || []}
              onComplete={handleCompleteMission}
              loading={loading}
            />

            {/* AI Insight Card */}
            {residentialInsights?.ai_advice && (
              <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-blue-500/5 border-emerald-500/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg">
                    <Zap size={20} />
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-500/20">Gemini</span>
                </div>
                <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-2">
                  Consejo de IA
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {residentialInsights.ai_advice}
                </p>
              </Card>
            )}

            {/* Eco Progress */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Leaf className="w-5 h-5 text-emerald-200" />
                </div>
                <h4 className="font-bold">Impacto Ambiental</h4>
              </div>
              <p className="text-3xl font-display font-bold mb-1">{treesEquivalent}</p>
              <p className="text-xs text-emerald-100 opacity-80">árboles equivalentes este mes</p>
              <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs">
                <span className="text-emerald-200">CO₂ Evitado</span>
                <span className="font-bold">{co2Footprint} kg</span>
              </div>
            </div>
          </aside>
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

