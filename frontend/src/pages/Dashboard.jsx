import React, { useState, useCallback, useMemo } from 'react';
import {
  Zap, TrendingDown, Leaf, ChevronRight,
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
// Micro-Contexts Architecture: Import specialized hooks instead of monolithic useApp
import { useUser } from '../context/UserContext';
import { useEnergy, iconMap } from '../context/EnergyContext';
import { useEnergyMath } from '../hooks/useEnergyMath';
import { residentialApi } from '../api/residential';

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

  // Micro-Contexts: User domain (profile, gamification)
  const { userProfile, gamificationStats, missions, claimMission, syncGamification } = useUser();

  // Micro-Contexts: Energy domain (appliances, consumption, insights)
  const {
    appliances, consumptionHistory, dashboardInsights,
    isSyncing, syncEnergyData: syncDashboardData, addConsumptionReading
  } = useEnergy();


  React.useEffect(() => {
    // Sync both energy data and gamification on mount
    syncDashboardData();
    syncGamification();
  }, []);

  const handleCompleteMission = async (missionId) => {
    try {
      const success = await claimMission(missionId);
      if (success) {
        // Recarga silenciosa de dashboard data
        syncDashboardData(true);
      }
    } catch (error) {
      console.error("Mission Error:", error);
    }
  };

  const {
    latestReading, projectedKwh: hookProjectedKwh, projectedBill: hookProjectedBill, vampireMoneyLost: hookVampireMoneyLost,
    co2Footprint: hookCo2Footprint, treesEquivalent: hookTreesEquivalent, kwhPrice, userStratum,
    hasData, hasProfile, formatMoney, enrichedAppliances
  } = useEnergyMath();

  // Prioritize Backend Insights for Metrics (High Honesty Logic)
  const metrics = dashboardInsights?.metrics || {};
  const displayProjectedBill = metrics.projected_bill ?? hookProjectedBill;
  const displayVampireCost = metrics.vampire_cost_monthly ?? hookVampireMoneyLost;
  const displayEfficiency = metrics.efficiency_score ?? (hasData ? 85 : 0);
  const displayCo2 = metrics.co2_footprint ?? hookCo2Footprint;
  const displayTrees = metrics.trees_equivalent ?? hookTreesEquivalent;
  const displayProjectedKwh = metrics.projected_kwh ?? hookProjectedKwh;

  const targetMonthlyBill = userProfile.config?.target_monthly_bill || 0;
  const currentActualAvg = userProfile.config?.monthly_bill_avg || metrics.total_estimated_monthly_cost;



  const handleSaveConsumption = async (data) => {
    try {
      // Persistir en backend
      await residentialApi.addReading({
        reading_value: parseFloat(data.reading),
        reading_type: 'manual'
      });
      setIsConsumptionModalOpen(false);
      // Refrescar todo el dashboard con los nuevos cálculos del backend
      syncDashboardData(true);
    } catch (error) {
      console.error("Error saving reading:", error);
    }
  };

  // Chart data flags (Jerarquía: 1. Lecturas diarias, 2. Histórico de factura)
  const historyFromProfile = userProfile?.config?.history_kwh || [];
  const hasManualReadings = consumptionHistory.length > 0;
  const hasHistoricalData = historyFromProfile.length > 0;
  const displayHasData = hasManualReadings || hasHistoricalData;

  // Occupancy-based efficiency status (Honest fallback)
  const occupants = userProfile.config?.occupants || 3;
  const kwhPerPerson = displayProjectedKwh / occupants;
  const efficiencyStatus = !displayHasData ? 'unknown' : (kwhPerPerson < 45 ? 'excellent' : kwhPerPerson < 70 ? 'good' : 'bad');


  // Progress toward goal (Only show if target exists)
  const hasTarget = targetMonthlyBill > 0;
  const monthlyBudgetKwh = hasTarget ? (targetMonthlyBill / kwhPrice) : 150;
  const dailyGoal = monthlyBudgetKwh / 30;

  // Real progress: how much of the "allowance" for today/month is consumed
  // If no readings, progress is 0. If no target, progress is based on typical consumption.
  const dailyProgress = (latestReading > 0 && hasTarget)
    ? Math.min(Math.round((latestReading / dailyGoal) * 100), 100)
    : 0;


  const activeAppliances = enrichedAppliances.filter(a => a.status).slice(0, 4);

  const energyData = useMemo(() => {
    if (hasManualReadings) {
      return consumptionHistory.map(r => ({
        time: new Date(r.date).toLocaleDateString([], { day: '2-digit', month: 'short' }),
        value: r.value,
        type: 'diario'
      })).reverse();
    } else if (hasHistoricalData) {
      // Usar los meses del recibo (ordenados de más viejo a más nuevo)
      const months = ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']; // O genéricos
      return historyFromProfile.map((val, i) => ({
        time: `Mes ${i + 1}`,
        value: val,
        type: 'mensual'
      }));
    }
    return [];
  }, [consumptionHistory, historyFromProfile, hasManualReadings, hasHistoricalData]);

  if (isSyncing && !dashboardInsights) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="size-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
        <p className="mt-8 text-slate-500 font-display font-bold uppercase tracking-[0.2em] text-xs animate-pulse">Sincronizando con EccoIA Cloud...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-body relative overflow-x-hidden">
      {showInsightAlert && dashboardInsights && (
        <ResidentialInsightAlert
          insight={dashboardInsights}
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
                {displayHasData
                  ? <>Proyección: <span className="text-emerald-500 font-bold">{formatMoney(displayProjectedBill)}</span> este mes</>
                  : 'Registra tu consumo para ver proyecciones'
                }
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <GamificationBadge stats={gamificationStats} loading={isSyncing && !gamificationStats} />
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

            {/* Home Profile Summary Card */}
            {userProfile?.config && (
              <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
                <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
                  {/* Left: House Info */}
                  <div className="flex items-center gap-4">
                    <div className={`size-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${efficiencyStatus === 'excellent' ? 'bg-emerald-500/10 border-emerald-500/20' :
                      efficiencyStatus === 'good' ? 'bg-blue-500/10 border-blue-500/20' :
                        efficiencyStatus === 'bad' ? 'bg-red-500/10 border-red-500/20' :
                          'bg-slate-500/10 border-slate-500/20'
                      }`}>
                      <Zap size={24} className={
                        efficiencyStatus === 'excellent' ? 'text-emerald-400' :
                          efficiencyStatus === 'good' ? 'text-blue-400' :
                            efficiencyStatus === 'bad' ? 'text-red-400' :
                              'text-slate-400'
                      } />
                    </div>

                    <div>
                      <h3 className="text-lg font-display font-bold text-white">
                        {userProfile.config.house_type === 'apartment' ? '🏢 Apartamento' :
                          userProfile.config.house_type === 'house' ? '🏠 Casa' : '🏬 Estudio'}
                        {userProfile.config.area_sqm ? ` de ${userProfile.config.area_sqm}m²` : ''}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {userProfile.config.city ? userProfile.config.city.charAt(0).toUpperCase() + userProfile.config.city.slice(1) : 'Colombia'}
                        {userProfile.config.stratum ? ` • Estrato ${userProfile.config.stratum}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Center: Occupancy & Energy */}
                  <div className="flex flex-wrap gap-6">
                    <div className="text-center px-4 border-l border-slate-700/50">
                      <span className="text-2xl font-display font-bold text-white">{userProfile.config.occupants || 1}</span>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Habitantes</p>
                    </div>
                    <div className="text-center px-4 border-l border-slate-700/50">
                      <span className="text-sm font-bold text-white capitalize">
                        {userProfile.config.occupancy_profile === 'onsite' ? '🏃 Fuera de Casa' :
                          userProfile.config.occupancy_profile === 'hybrid' ? '💻 Híbrido' : '👨‍👩‍👧 Casa Llena'}
                      </span>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Rutina</p>
                    </div>
                    <div className="text-center px-4 border-l border-slate-700/50">
                      <span className="text-sm font-bold text-white">
                        {userProfile.config.energy_source === 'gas' ? '🔥 Gas Natural' : '⚡ Todo Eléctrico'}
                      </span>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Fuente</p>
                    </div>
                  </div>

                  {/* Right: Budget Goals */}
                  <div className="flex items-center gap-4 bg-slate-950/50 rounded-xl p-3 border border-slate-700/50">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Meta Mensual</p>
                      <p className="text-lg font-display font-bold text-emerald-400">
                        {targetMonthlyBill ? formatMoney(targetMonthlyBill) : 'Sin definir'}
                      </p>
                    </div>
                    <div className="w-px h-10 bg-slate-700"></div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Promedio Actual</p>
                      <p className="text-lg font-display font-bold text-amber-400">
                        {currentActualAvg ? formatMoney(currentActualAvg) : 'Sin datos'}
                      </p>
                    </div>

                  </div>
                </div>

                {/* Tariff Info Bar */}
                <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Tarifa aplicada: <span className="text-emerald-400 font-bold">${dashboardInsights?.metrics?.kwh_price || kwhPrice}/kWh</span>
                  </span>
                  <span className="text-slate-500">
                    {activeAppliances.length} dispositivos registrados
                  </span>
                  {userProfile.config.average_kwh_captured > 0 && (
                    <span className="text-slate-500">
                      Consumo capturado: <span className="text-white font-bold">{userProfile.config.average_kwh_captured} kWh/mes</span>
                    </span>
                  )}
                </div>
              </Card>
            )}

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Proyección Factura"
                value={formatMoney(displayProjectedBill)}
                unit="/ mes"
                icon={DollarSign}
                color="emerald"
              />
              <StatCard
                title="Costo Vampiro"
                value={formatMoney(displayVampireCost)}
                unit="/ mes"
                icon={TrendingDown}
                color={displayVampireCost > 25000 ? "red" : "amber"}
              />
              <StatCard
                title="Eficiencia Eco"
                value={displayEfficiency}
                unit="%"
                icon={Award}
                color={displayEfficiency > 80 ? "emerald" : "blue"}
              />
              <StatCard
                title="Meta de Ahorro"
                value={hasTarget ? `${dailyProgress}%` : "Sin Meta"}
                unit={hasTarget ? "ejecutado" : "Click para definir"}

                icon={Target}
                color={dailyProgress > 90 ? "red" : "purple"}
              />
            </div>

            {/* Consumption Monitor */}
            <Card className="p-8 flex flex-col relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                    {hasManualReadings ? 'Consumo Diario' : 'Historial de Factura'}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {hasManualReadings ? 'Basado en tus reportes' : 'Análisis de los últimos 6 meses'}
                  </p>
                </div>
                {displayHasData && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Monitor Activo</span>
                  </div>
                )}
              </div>

              {displayHasData ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-baseline gap-3 mb-8">
                    <span className="text-6xl font-display font-bold text-slate-900 dark:text-white tracking-tighter">
                      {hasManualReadings ? latestReading : historyFromProfile[historyFromProfile.length - 1]}
                    </span>
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
              missions={dashboardInsights?.missions || []}
              onComplete={handleCompleteMission}
              loading={isSyncing}
            />

            {/* AI Insight Card */}
            {dashboardInsights?.ai_advice && (
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
                  {dashboardInsights.ai_advice}
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
              <p className="text-3xl font-display font-bold mb-1">{displayTrees}</p>
              <p className="text-xs text-emerald-100 opacity-80">árboles equivalentes este mes</p>
              <div className="mt-4 pt-4 border-t border-white/20 flex justify-between text-xs">
                <span className="text-emerald-200">CO₂ Evitado</span>
                <span className="font-bold">{displayCo2} kg</span>
              </div>
            </div>

            {/* High Impact Assets */}
            {dashboardInsights?.analysis?.high_impact_assets?.length > 0 && (
              <Card className="p-5 bg-amber-500/5 border-amber-500/20">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={18} className="text-amber-500" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Principales Consumidores</h4>
                </div>
                <div className="space-y-3">
                  {dashboardInsights.analysis.high_impact_assets.map((asset, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{asset.name}</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{formatMoney(asset.cost)}/mes</span>
                    </div>
                  ))}
                </div>
                {dashboardInsights.metrics?.potential_savings && (
                  <div className="mt-4 pt-3 border-t border-amber-500/20 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Ahorro Potencial</p>
                    <p className="text-lg font-display font-bold text-emerald-500">{dashboardInsights.metrics.potential_savings}</p>
                  </div>
                )}
              </Card>
            )}

            {/* Top Waste Reason */}
            {dashboardInsights?.analysis?.top_waste_reason && (
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <p className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-1">Principal Causa de Desperdicio</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{dashboardInsights.analysis.top_waste_reason}</p>
              </div>
            )}
          </aside>
        </div>
      </main>

      <GoalsModal isOpen={isGoalsModalOpen} onClose={() => setIsGoalsModalOpen(false)} />
      <ConsumptionModal
        isOpen={isConsumptionModalOpen}
        onClose={() => setIsConsumptionModalOpen(false)}
        currentGoal={targetMonthlyBill}
        lastReading={latestReading}
        onSave={handleSaveConsumption}
      />
    </div>
  );
};

export default Dashboard;

