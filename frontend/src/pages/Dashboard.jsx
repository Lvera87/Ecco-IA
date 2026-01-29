import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Zap, TrendingDown, TrendingUp, Leaf, Target, Award, DollarSign, Plus,
  Lightbulb, Wind, AlertCircle, Activity, Cpu, ArrowRight, BarChart2,
  AlertTriangle, Info
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar
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
import ApplianceDetailModal from '../components/ui/ApplianceDetailModal';

import { useUser } from '../context/UserContext';
import { useEnergy, iconMap } from '../context/EnergyContext';
import { useEnergyMath } from '../hooks/useEnergyMath';
import { residentialApi } from '../api/residential';

// Colores para la IA
const AI_COLORS = ['#34d399', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

// Mapeo de imágenes ilustrativas (Unsplash placeholders)
const APPLIANCE_IMAGES = {
  Refrigerator: "/fridge.jpeg",
  Tv: "/tv.webp",
  WashingMachine: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?q=80&w=300&auto=format&fit=crop",
  Microwave: "https://images.unsplash.com/photo-1585659722983-3a675dabf194?q=80&w=300&auto=format&fit=crop",
  Fan: "https://images.unsplash.com/photo-1618941716939-553df5266278?q=80&w=300&auto=format&fit=crop",
  AirVent: "https://images.unsplash.com/photo-1615893095033-d8c72836267f?q=80&w=300&auto=format&fit=crop", // AC
  Lightbulb: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=300&auto=format&fit=crop",
  Monitor: "/computer.jpeg",
  default: "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=300&auto=format&fit=crop"
};

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
  const [showInsightAlert, setShowInsightAlert] = useState(false);
  const [selectedAppliance, setSelectedAppliance] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Lógica para mostrar el popup solo una vez por sesión
    const hasSeenAlert = sessionStorage.getItem('hasSeenInsightAlert');
    if (!hasSeenAlert) {
      setShowInsightAlert(true);
      sessionStorage.setItem('hasSeenInsightAlert', 'true');
    }
  }, []);

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

  // Handler for Mission Completion
  const handleCompleteMission = async (missionId) => {
    try {
      // Optimistic update (simulated) or wait for server
      // The API now returns the NEW full stats object
      const updatedStats = await claimMission(missionId);
      if (updatedStats) {
        setGamificationStats(updatedStats);
        // Check for level up
        if (gamificationStats && updatedStats.profile.current_level > gamificationStats.profile.current_level) {
          // Toast/Confetti could go here
          console.log("LEVEL UP!");
        }
      } else {
        syncDashboardData(true);
      }
    } catch (e) {
      console.error("Mission failed", e);
    }
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

  const activeAppliances = enrichedAppliances.slice(0, 8);
  const metrics = dashboardInsights?.metrics || {};

  // NUEVAS MÉTRICAS BASADAS EN DATOS DE IA
  // Factura estimada: Prioridad -> aiData (IA) -> metrics (dashboard) -> cálculo local
  const displayFactura = aiData?.facturacion?.factura_estimada_cop ?? metrics.projected_bill ?? projectedBill;

  // Costo de Fugas (reemplaza "Costo Vampiro")
  const displayFugasCost = aiData?.fugas?.costo_cop ?? metrics.vampire_cost_monthly ?? vampireMoneyLost;
  const displayFugasKwh = aiData?.fugas?.kwh ?? 0;

  // Comparación con estrato
  const comparacionEstrato = aiData?.comparacion_estrato || null;
  const displayDiferenciaPorcentaje = comparacionEstrato?.diferencia_porcentaje ?? 0;
  const displayPromedioEstrato = comparacionEstrato?.promedio_kwh ?? 0;
  const displayEsEficiente = comparacionEstrato?.es_eficiente ?? true;
  const displayConsumoTotal = aiData?.consumo_total_real ?? 0;
  const displayDiffKwh = displayPromedioEstrato > 0 ? Math.abs(displayConsumoTotal - displayPromedioEstrato).toFixed(0) : 0;

  // Comparación con estrato
  // ... (previous variables kept or replaced if needed, but I need to make sure I don't break scope)
  // Actually, I should insert the calc before the return or inside the component body, but replace_file_content targets specific lines.
  // I will just replace the StatCard value directly if I can calculate it inline or use a helper variable defined previously.
  // I will redefine displayDiffKwh near where displayDiferenciaPorcentaje was.

  // Let's modify the block around line 194 where comparison vars are defined.


  // Eficiencia y árboles
  const displayEfficiency = metrics.efficiency_score ?? (hasData ? 85 : 0);
  const displayTrees = metrics.trees_equivalent ?? treesEquivalent;
  const targetMonthlyBill = userProfile?.config?.target_monthly_bill || 0;

  // Info de tarifa
  const tarifaInfo = aiData?.facturacion || null;

  // Handler for Mission Inspection
  const handleInspectMission = (mission) => {
    if (!mission.related_appliance_type) return;

    const type = mission.related_appliance_type.toLowerCase();
    let targetHelper = null;

    // Smart Matching Logic
    if (type === 'fridge') {
      targetHelper = activeAppliances.find(a => a.icon === 'Refrigerator' || a.name.toLowerCase().includes('nevera'));
    } else if (type === 'wasted_energy') {
      targetHelper = activeAppliances.find(a => ['Tv', 'Monitor', 'Consolas', 'Lightbulb'].includes(a.icon));
    } else {
      // Generic fallback
      targetHelper = activeAppliances.find(a => a.icon.toLowerCase() === type || a.name.toLowerCase().includes(type));
    }

    if (targetHelper) {
      const bgImage = APPLIANCE_IMAGES[targetHelper.icon] || APPLIANCE_IMAGES.default;
      setSelectedAppliance({ ...targetHelper, bgImage });
    } else {
      // Optional: Toast "No appliance found"
      console.log("No matching appliance found for mission");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-body relative overflow-x-hidden">
      {showInsightAlert && dashboardInsights && (
        <ResidentialInsightAlert insight={dashboardInsights} onClose={() => setShowInsightAlert(false)} />
      )}

      {/* Botón flotante minimizado para ver alertas ocultas */}
      {!showInsightAlert && dashboardInsights && (
        <button
          onClick={() => setShowInsightAlert(true)}
          className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white p-3 rounded-full shadow-lg shadow-emerald-500/30 hover:scale-110 transition-transform flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4"
        >
          <Lightbulb size={20} />
          <span className="text-xs font-bold hidden md:inline">Ver Insight</span>
        </button>
      )}

      <main className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
        {/* HEADER */}
        <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              Dashboard Energético
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase text-emerald-500 tracking-wider">
                <Activity size={12} className="animate-pulse" /> En Vivo
              </div>
              <p className="text-sm text-slate-500 line-clamp-1">
                {aiData
                  ? `Análisis de ${aiData.consumo_total_real} kWh`
                  : 'Sin análisis reciente'}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:items-end gap-4 mt-2 lg:mt-0">
            <GamificationBadge stats={gamificationStats} loading={isSyncing && !gamificationStats} />
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* Botón para volver a configurar */}
              <Button onClick={() => navigate('/residential-config')} variant="outline" className="border-slate-700 flex-1 sm:flex-none justify-center">
                Configuración
              </Button>
              <Button onClick={() => setIsConsumptionModalOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 flex-1 sm:flex-none justify-center">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
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
                value={`${displayDiffKwh} kWh`}
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
                rightContent={
                  aiData?.fecha_calculo && (
                    <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-widest">
                      {new Date(aiData.fecha_calculo).toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')}
                    </span>
                  )
                }
                tooltip={aiData?.fecha_calculo ? `Calculado el ${new Date(aiData.fecha_calculo).toLocaleDateString()}` : "Datos estáticos"}
              />
            </div>

            {/* SECCIÓN PRINCIPAL: IA + CONSUMO */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

              {/* TARJETA 1: IA DESAGREGACIÓN */}
              <Card className="xl:col-span-3 p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 relative overflow-hidden flex flex-col">
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

                <div className="flex-1 relative z-10 min-h-[250px]">
                  {aiData ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-center">

                      {/* Left: Disaggregation Pie Chart */}
                      <div className="flex flex-col h-full">
                        <div className="h-48 w-full relative">
                          {/* Center Text for Pie */}
                          <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <span className="text-2xl font-black text-white">{displayConsumoTotal}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">kWh total</span>
                          </div>
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

                        {/* Legend */}
                        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                          {aiChartData.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                              <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full" style={{ backgroundColor: AI_COLORS[index % AI_COLORS.length] }}></div>
                                <span className="text-xs text-slate-300 font-medium">{entry.name}</span>
                              </div>
                              <span className="text-xs font-bold text-white">{entry.value.toFixed(1)} <span className="text-slate-500 text-[10px]">kWh</span></span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Comparative Bar Chart */}
                      <div className="flex flex-col h-full border-l border-white/5 pl-0 lg:pl-8">
                        <h4 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2">
                          <BarChart2 size={16} className="text-blue-400" />
                          Comparativa de Consumo
                        </h4>

                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                { name: 'Tu Hogar', value: displayConsumoTotal, fill: '#10b981' },
                                { name: 'Promedio', value: displayPromedioEstrato, fill: '#64748b' }
                              ]}
                              barSize={40}
                            >
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                              <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                              />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {
                                  [
                                    { name: 'Tu Hogar', value: displayConsumoTotal, fill: displayConsumoTotal > displayPromedioEstrato ? '#ef4444' : '#10b981' },
                                    { name: 'Promedio', fill: '#475569' }
                                  ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))
                                }
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-400 font-medium">Diferencia</span>
                            <span className={`text-sm font-black ${displayConsumoTotal > displayPromedioEstrato ? 'text-red-400' : 'text-emerald-400'}`}>
                              {displayConsumoTotal > displayPromedioEstrato ? '+' : '-'}{Math.abs(displayConsumoTotal - displayPromedioEstrato).toFixed(0)} kWh
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                            {displayConsumoTotal > displayPromedioEstrato
                              ? 'Estás consumiendo más que el promedio de tu estrato. Revisa las fugas.'
                              : '¡Excelente! Tu consumo está por debajo del promedio de tu zona.'}
                          </p>
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


            </div>

            {/* INVENTARIO RÁPIDO */}
            <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                  <Lightbulb size={20} className="text-emerald-500" /> Inventario Energético
                </h3>
              </div>

              {activeAppliances.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {activeAppliances.map((app) => {
                    const bgImage = APPLIANCE_IMAGES[app.icon] || APPLIANCE_IMAGES.default;
                    const isEfficient = app.expertStatus === 'Excellent';

                    return (
                      <div
                        key={app.id}
                        onClick={() => setSelectedAppliance({ ...app, bgImage })}
                        className="relative overflow-hidden group rounded-xl border border-slate-200 dark:border-slate-800 h-28 transform transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                      >
                        {/* Background Image with Overlay */}
                        <div className="absolute inset-0">
                          <img
                            src={bgImage}
                            alt={app.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-slate-950/60 group-hover:bg-slate-950/50 transition-colors" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 p-3 flex flex-col justify-between h-full">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-white font-bold text-sm leading-tight drop-shadow-md line-clamp-2 max-w-[75%]">{app.name}</span>
                            <div className="shrink-0 text-emerald-300 bg-emerald-500/20 p-1.5 rounded-lg backdrop-blur-md border border-emerald-500/30">
                              {React.createElement((iconMap && iconMap[app.icon]) || Zap, { size: 14 })}
                            </div>
                          </div>

                          <div className="flex items-end justify-between">
                            <span className="text-[10px] font-medium text-slate-300 bg-slate-950/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                              {app.monthlyCost ? formatMoney(app.monthlyCost) : 'Est. analizando'}
                            </span>

                            {/* Efficiency Badge (Moved to bottom) */}
                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm z-20 ${isEfficient
                              ? 'bg-emerald-500/90 text-white backdrop-blur-sm'
                              : 'bg-amber-500/90 text-white animate-pulse backdrop-blur-sm'
                              }`}>
                              {isEfficient ? 'Eficiente' : 'Ineficiente'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No hay dispositivos registrados.</p>
              )
              }
            </Card>


          </div >

          {/* COLUMNA DERECHA (1 COL) */}
          < aside className="xl:col-span-1 space-y-6" >
            <MissionWidget missions={dashboardInsights?.missions || []} onComplete={handleCompleteMission} onInspect={handleInspectMission} loading={isSyncing} />

            {/* Eco Card - Enhanced */}
            <div className={`rounded-2xl p-6 text-white shadow-xl transition-all ${displayTrees > 5
              ? 'bg-gradient-to-br from-amber-600 to-orange-700 shadow-amber-500/20'
              : 'bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-500/20'
              }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    {displayTrees > 5 ? <AlertTriangle className="w-5 h-5 text-amber-200" /> : <Leaf className="w-5 h-5 text-emerald-200" />}
                  </div>
                  <div>
                    <h4 className="font-bold leading-tight">Impacto Ambiental</h4>
                    <p className="text-[10px] opacity-80 font-medium uppercase tracking-wider">Huella de Carbono</p>
                  </div>
                </div>

                {/* Educational Tooltip */}
                <div className="group relative cursor-help">
                  <Info size={16} className="opacity-60 hover:opacity-100 transition-opacity" />
                  <div className="absolute right-0 w-48 p-3 bg-slate-900 text-slate-300 text-xs rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none translate-y-2 group-hover:translate-y-0">
                    Calculado con el factor de emisión de la red eléctrica (0.164 kg CO2/kWh). ¡Reduce tu consumo para salvar árboles!
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-display font-black">{displayTrees}</p>
                  <p className="text-xl font-bold opacity-80">árboles</p>
                </div>
                <p className="text-xs font-medium opacity-90">
                  {displayTrees > 5
                    ? '⚠️ Nivel Alto: Se requieren para compensar tu huella.'
                    : '✅ Nivel Sostenible: Equivalente de compensación mensual.'}
                </p>
              </div>

              {/* Mini Trend/Context Bar */}
              <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${displayTrees > 5 ? 'bg-white/90' : 'bg-emerald-300'}`}
                  style={{ width: `${Math.min(100, (displayTrees / 10) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] mt-2 opacity-70 text-right">Meta ideal: &lt; 2 árboles</p>
            </div>
          </aside >
        </div >
      </main >

      <GoalsModal isOpen={isGoalsModalOpen} onClose={() => setIsGoalsModalOpen(false)} />
      <ConsumptionModal isOpen={isConsumptionModalOpen} onClose={() => setIsConsumptionModalOpen(false)} currentGoal={targetMonthlyBill} lastReading={latestReading} onSave={handleSaveConsumption} />

      {/* New Detail Modal */}
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
          if (dashboardInsights?.missions) { // Ensure missions are available in scope
            const missions = dashboardInsights.missions.map(m => m.mission || m); // Handle varied structure

            // Logic: If turning OFF a device (status -> false) and matches Vampire Hunt criteria
            if (newStatus === false) {
              const vampireMission = missions.find(m =>
                (m.status === 'active' || m.status === 'pending') &&
                m.related_appliance_type === 'wasted_energy' &&
                ['Tv', 'Monitor', 'Consolas', 'Lightbulb', 'Fan', 'Microwave'].includes(app.icon)
              );

              if (vampireMission) {
                await handleCompleteMission(vampireMission.id);
              }
            }

            // Logic: If turning ON/Checking (Hogar Consciente - Fridge)
            if (newStatus === true || newStatus === false) {
              const fridgeMission = missions.find(m =>
                (m.status === 'active' || m.status === 'pending') &&
                m.related_appliance_type === 'fridge' &&
                (app.icon === 'Refrigerator' || app.name.toLowerCase().includes('nevera'))
              );

              if (fridgeMission) {
                await handleCompleteMission(fridgeMission.id);
              }
            }
          }
        }}
      />
    </div >
  );
};

export default Dashboard;
