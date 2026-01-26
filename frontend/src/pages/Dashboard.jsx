import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Zap, TrendingDown, TrendingUp, Leaf, Target, Award, DollarSign, Plus,
  Lightbulb, Wind, AlertCircle, Activity, Cpu, ArrowRight, BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import GoalsModal from '../components/ui/GoalsModal';
import ConsumptionModal from '../components/ui/ConsumptionModal';
import ResidentialInsightAlert from '../components/ui/ResidentialInsightAlert';
import GamificationBadge from '../components/ui/GamificationBadge';
import MissionWidget from '../components/ui/MissionWidget';

import { useUser } from '../context/UserContext';
import { useEnergy, iconMap } from '../context/EnergyContext';
import { useEnergyMath } from '../hooks/useEnergyMath';
import { residentialApi } from '../api/residential';

// Colores para la IA
const AI_COLORS = ['#34d399', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/90 border border-slate-700/50 backdrop-blur-md p-3 rounded-xl shadow-2xl">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">
          {data.name || data.time}
        </p>
        <p className="text-xl font-display font-bold text-emerald-400">
          {payload[0].value} <span className="text-xs font-medium text-slate-500">kWh</span>
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, gamificationStats, claimMission, syncGamification, syncUserProfile } = useUser();

  // --- LÓGICA DE DATOS IA (PERSISTENCIA) ---
  // Modificado: Usamos useMemo para priorizar navegación -> base de datos -> null
  const aiData = useMemo(() => {
    // 1. Datos frescos de la navegación (recién calculado)
    if (location.state?.aiResult) return location.state.aiResult;

    // 2. Datos guardados en la base de datos (Recuperados del perfil)
    // Buscamos en varias posibles ubicaciones según venga del backend
    const savedData = userProfile?.residential_profile?.history_kwh ||
      userProfile?.history_kwh ||
      userProfile?.config?.history_kwh;

    // Validamos que sea un objeto con la estructura de IA (y no un array antiguo)
    if (savedData && !Array.isArray(savedData) && savedData.desglose) {
      return savedData;
    }

    return null;
  }, [location.state, userProfile]);

  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
  const [showInsightAlert, setShowInsightAlert] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => setIsReady(true), 200);
      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  const {
    consumptionHistory, dashboardInsights,
    isSyncing, syncEnergyData: syncDashboardData
  } = useEnergy();

  useEffect(() => {
    syncDashboardData();
    syncGamification();
    syncUserProfile(); // Cargar perfil con datos de IA desde la BD
  }, []);

  const {
    latestReading, projectedBill, vampireMoneyLost,
    co2Footprint, treesEquivalent, kwhPrice,
    hasData, enrichedAppliances, formatMoney
  } = useEnergyMath();

  // --- DATOS PARA GRÁFICOS ---
  // 1. Gráfico de Consumo (AreaChart)
  // Protección: Aseguramos que sea un array (si es el objeto JSON de IA, lo ignoramos aquí)
  const rawHistory = userProfile?.config?.history_kwh;
  const historyFromProfile = Array.isArray(rawHistory) ? rawHistory : [];

  const hasManualReadings = consumptionHistory.length > 0;
  const hasHistoricalData = historyFromProfile.length > 0;
  const displayHasData = hasManualReadings || hasHistoricalData;

  const energyData = useMemo(() => {
    if (hasManualReadings) {
      return consumptionHistory.map(r => ({
        time: new Date(r.date).toLocaleDateString([], { day: '2-digit', month: 'short' }),
        value: r.value,
        type: 'diario'
      })).reverse();
    } else if (hasHistoricalData) {
      return historyFromProfile.map((val, i) => ({
        time: `Mes ${i + 1}`,
        value: val,
        type: 'mensual'
      }));
    }
    return [];
  }, [consumptionHistory, historyFromProfile, hasManualReadings, hasHistoricalData]);

  // 2. Gráfico de IA (PieChart)
  const aiChartData = aiData ? [
    { name: 'Refrigeración', value: aiData.desglose.refrigeracion },
    { name: 'Climatización', value: aiData.desglose.climatizacion },
    { name: 'Entretenimiento', value: aiData.desglose.entretenimiento },
    { name: 'Cocina/Lavado', value: aiData.desglose.cocina_lavado },
    { name: 'Otros/Fugas', value: aiData.otros_fugas },
  ] : [];

  const handleSaveConsumption = async (data) => {
    try {
      await residentialApi.addReading({
        reading_value: parseFloat(data.reading),
        reading_type: 'manual'
      });
      setIsConsumptionModalOpen(false);
      syncDashboardData(true);
    } catch (error) { console.error("Error saving reading:", error); }
  };

  const handleCompleteMission = async (missionId) => {
    try { await claimMission(missionId); syncDashboardData(true); } catch (e) { }
  };

  // Render Loading
  if (isSyncing && !dashboardInsights && !userProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="size-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
        <p className="mt-8 text-slate-500 font-display font-bold uppercase tracking-[0.2em] text-xs animate-pulse">Sincronizando Dashboard...</p>
      </div>
    );
  }

  const activeAppliances = enrichedAppliances.filter(a => a.status).slice(0, 4);
  const metrics = dashboardInsights?.metrics || {};

  // NUEVAS MÉTRICAS BASADAS EN DATOS DE IA
  // Factura estimada: Prioridad -> aiData (IA) -> metrics (dashboard) -> cálculo local
  const displayFactura = aiData?.facturacion?.factura_estimada_cop ?? metrics.projected_bill ?? projectedBill;

  // Costo de Fugas (reemplaza "Costo Vampiro")
  const displayFugasCost = aiData?.fugas?.costo_cop ?? metrics.vampire_cost_monthly ?? vampireMoneyLost;
  const displayFugasKwh = aiData?.fugas?.kwh ?? 0;

  // Comparación con estrato
  const comparacionEstrato = aiData?.comparacion_estrato || null;
  const displayEsEficiente = comparacionEstrato?.es_eficiente ?? true;
  const displayDiferenciaPorcentaje = comparacionEstrato?.diferencia_porcentaje ?? 0;
  const displayPromedioEstrato = comparacionEstrato?.promedio_kwh ?? 0;

  // Eficiencia y árboles
  const displayEfficiency = metrics.efficiency_score ?? (hasData ? 85 : 0);
  const displayTrees = metrics.trees_equivalent ?? treesEquivalent;
  const targetMonthlyBill = userProfile?.config?.target_monthly_bill || 0;

  // Info de tarifa
  const tarifaInfo = aiData?.facturacion || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-body relative overflow-x-hidden">
      {showInsightAlert && dashboardInsights && (
        <ResidentialInsightAlert insight={dashboardInsights} onClose={() => setShowInsightAlert(false)} />
      )}

      <main className="relative z-10 p-8 max-w-[1600px] mx-auto space-y-8">

        {/* HEADER */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Dashboard Energético</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase text-emerald-500 tracking-wider">
                <Activity size={12} className="animate-pulse" /> En Vivo
              </div>
              <p className="text-sm text-slate-500">
                {aiData
                  ? `Análisis basado en consumo de ${aiData.consumo_total_real} kWh`
                  : 'Sin análisis reciente'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-4">
            <GamificationBadge stats={gamificationStats} loading={isSyncing && !gamificationStats} />
            <div className="flex items-center gap-4">
              {/* Botón para volver a configurar */}
              <Button onClick={() => navigate('/residential-config')} variant="outline" className="border-slate-700">
                Configuración
              </Button>
              <Button onClick={() => setIsConsumptionModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20">
                <Plus size={18} className="mr-2" /> Reportar
              </Button>
            </div>
          </div>
        </section>

        {/* LAYOUT PRINCIPAL */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

          {/* COLUMNA IZQUIERDA (3 COLS) */}
          <div className="xl:col-span-3 space-y-8">

            {/* STAT CARDS - MÉTRICAS BASADAS EN IA */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Factura Estimada */}
              <StatCard
                title="Factura Estimada"
                value={formatMoney(displayFactura)}
                unit="/ mes"
                icon={DollarSign}
                color="emerald"
              />

              {/* Costo de Fugas (antes era "Costo Vampiro") */}
              <StatCard
                title="Costo Fugas"
                value={formatMoney(displayFugasCost)}
                unit={`${displayFugasKwh} kWh`}
                icon={AlertCircle}
                color={displayFugasCost > 20000 ? "red" : "amber"}
              />

              {/* Comparación con Estrato */}
              <StatCard
                title="vs Promedio Estrato"
                value={`${Math.abs(displayDiferenciaPorcentaje)}%`}
                unit={`${displayEsEficiente ? "menos" : "más"} (Prom: ${displayPromedioEstrato} kWh)`}
                icon={displayEsEficiente ? TrendingDown : TrendingUp}
                color={displayEsEficiente ? "emerald" : "red"}
              />

              {/* Tipo de Tarifa */}
              <StatCard
                title={tarifaInfo?.tipo_tarifa || "Tarifa"}
                value={tarifaInfo ? `E${tarifaInfo.estrato}` : "—"}
                unit={tarifaInfo ? `$${tarifaInfo.tarifa_kwh}/kWh` : ""}
                icon={BarChart2}
                color={tarifaInfo?.subsidio_porcentaje < 0 ? "blue" : (tarifaInfo?.subsidio_porcentaje > 0 ? "purple" : "slate")}
              />
            </div>

            {/* SECCIÓN PRINCIPAL: IA + CONSUMO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* TARJETA 1: IA DESAGREGACIÓN */}
              <Card className="lg:col-span-2 p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                      <Cpu size={24} className="text-emerald-400" />
                      Inteligencia Artificial
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Desagregación estimada de consumo</p>
                  </div>
                  {aiData?.alerta_fuga && (
                    <div className="animate-pulse flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-xs font-bold uppercase tracking-widest">
                      <AlertCircle size={14} /> Fuga Detectada
                    </div>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center relative z-10 min-h-[250px]">
                  {aiData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-center">
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={aiChartData} cx="50%" cy="50%"
                              innerRadius={60} outerRadius={80}
                              paddingAngle={5} dataKey="value" stroke="none"
                            >
                              {aiChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={AI_COLORS[index % AI_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3">
                        {aiChartData.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="size-3 rounded-full" style={{ backgroundColor: AI_COLORS[index % AI_COLORS.length] }}></div>
                              <span className="text-sm text-slate-300">{entry.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="block text-sm font-bold text-white">{entry.value.toFixed(1)} kWh</span>
                            </div>
                          </div>
                        ))}
                        <div className="pt-3 border-t border-slate-700 flex justify-between">
                          <span className="text-xs text-slate-500">Total Analizado</span>
                          <span className="text-sm font-bold text-emerald-400">{aiData.consumo_total_real} kWh</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center max-w-xs">
                      <div className="p-4 bg-slate-800 rounded-full inline-flex mb-4">
                        <Zap size={32} className="text-slate-500" />
                      </div>
                      <h4 className="text-white font-bold mb-2">Análisis Pendiente</h4>
                      <p className="text-sm text-slate-400 mb-6">Configura tu perfil para que la IA pueda detectar tus consumos.</p>
                      <Button onClick={() => navigate('/residential-config')} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                        Comenzar Análisis <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* TARJETA 2: GRÁFICO HISTÓRICO */}
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Tendencia</h3>
                <div className="flex-1 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={energyData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fill="url(#colorValue)" />
                      <XAxis dataKey="time" hide />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800 text-center">
                  <p className="text-xs text-slate-500">Basado en tus últimos reportes</p>
                </div>
              </Card>
            </div>

            {/* INVENTARIO RÁPIDO */}
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                  <Lightbulb size={20} className="text-emerald-500" /> Dispositivos Activos
                </h3>
              </div>
              {activeAppliances.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {activeAppliances.map((app) => (
                    <div key={app.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                          {React.createElement((iconMap && iconMap[app.icon]) || Zap, { size: 16 })}
                        </div>
                        <span className="text-sm font-bold dark:text-white truncate">{app.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No hay dispositivos registrados.</p>
              )}
            </Card>

          </div>

          {/* COLUMNA DERECHA (1 COL) */}
          <aside className="xl:col-span-1 space-y-6">
            <MissionWidget missions={dashboardInsights?.missions || []} onComplete={handleCompleteMission} loading={isSyncing} />

            {/* Eco Card */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg"><Leaf className="w-5 h-5 text-emerald-200" /></div>
                <h4 className="font-bold">Impacto Ambiental</h4>
              </div>
              <p className="text-3xl font-display font-bold mb-1">{displayTrees}</p>
              <p className="text-xs text-emerald-100 opacity-80">árboles equivalentes</p>
            </div>
          </aside>
        </div>
      </main>

      <GoalsModal isOpen={isGoalsModalOpen} onClose={() => setIsGoalsModalOpen(false)} />
      <ConsumptionModal isOpen={isConsumptionModalOpen} onClose={() => setIsConsumptionModalOpen(false)} currentGoal={targetMonthlyBill} lastReading={latestReading} onSave={handleSaveConsumption} />
    </div>
  );
};

export default Dashboard;
