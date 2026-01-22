import React, { useState, useEffect } from 'react';
import {
  Zap, TrendingDown, Leaf, Trophy, Calendar, ChevronRight,
  Target, Award, DollarSign, Plus, Lightbulb, Wind, AlertCircle,
  Factory, Building2, Activity, BarChart3, Loader2
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import InsightCard from '../components/ui/InsightCard';
import EmptyState from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { useEnergyMath } from '../hooks/useEnergyMath';
import { industrialApi } from '../api/industrial';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-700/50 backdrop-blur-md p-3 rounded-xl shadow-2xl">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{payload[0].payload.time}</p>
        <p className="text-xl font-display font-bold text-blue-500">
          {payload[0].value.toLocaleString()} <span className="text-xs font-medium text-slate-500">kWh</span>
        </p>
      </div>
    );
  }
  return null;
};

const IndustrialDashboard = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState(null);
  const [assets, setAssets] = useState([]);
  const { userProfile } = useApp();
  const config = userProfile?.config || {};

  const {
    formatMoney
  } = useEnergyMath();

  useEffect(() => {
    setIsMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [assetsData, insightsData] = await Promise.all([
        industrialApi.getAssets(),
        industrialApi.getDashboardInsights()
      ]);
      setAssets(assetsData);
      setAiInsights(insightsData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock chart data if no real trend yet
  const chartData = [
    { time: '00:00', value: 2450 }, { time: '04:00', value: 2150 },
    { time: '08:00', value: 4880 }, { time: '12:00', value: 5420 },
    { time: '16:00', value: 5150 }, { time: '20:00', value: 3820 },
    { time: '22:00', value: 2850 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="relative">
          <div className="size-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Factory className="text-blue-500 animate-pulse" size={24} />
          </div>
        </div>
        <p className="mt-6 text-slate-500 font-display font-medium animate-pulse tracking-widest uppercase text-xs">
          Analizando eficiencia industrial con Gemini 2.5...
        </p>
      </div>
    );
  }

  const hasData = assets.length > 0;
  const efficiencyScore = aiInsights?.waste_score || 0;

  // Simple calculation for the hybrid part
  const totalKw = assets.reduce((acc, curr) => acc + curr.nominal_power_kw, 0);
  const dailyKwh = assets.reduce((acc, curr) => acc + (curr.nominal_power_kw * curr.daily_usage_hours), 0);
  const projectedKwh = dailyKwh * 30;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-body relative overflow-x-hidden">
      <main className="relative z-10 p-8 max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              {config.companyName ? `¡Hola, ${config.companyName}!` : 'Dashboard Industrial'}
            </h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2">
              <Factory size={16} className="text-blue-500" />
              {hasData
                ? <span>Tu planta tiene <span className="text-blue-500 font-bold">{assets.length} activos</span> bajo monitoreo de IA.</span>
                : <span>Monitorea el consumo de tu planta en tiempo real.</span>
              }
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end px-4 border-r border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{config.sector || 'Sistemas Activos'}</span>
              <span className="text-xl font-display font-bold text-blue-500">{totalKw.toFixed(1)} kW Instalados</span>
            </div>
            <Button
              onClick={fetchDashboardData}
              variant="outline"
              className="border-slate-200 dark:border-slate-800"
            >
              <Activity size={18} className="mr-2" />
              Actualizar IA
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
            >
              <Plus size={18} className="mr-2" />
              Nuevo Activo
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {/* Consumption Monitor */}
          <Card className="md:col-span-2 md:row-span-2 p-8 flex flex-col relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Análisis de Desperdicio Industrial</h3>
                <p className="text-slate-500 text-sm mt-1">Visión procesada por Gemini 2.5 Flash-Lite</p>
              </div>
              {hasData && (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">IA Optimizando</span>
                </div>
              )}
            </div>

            {hasData ? (
              <div className="flex-1 flex flex-col">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-display font-bold text-slate-900 dark:text-white tracking-tighter">
                      {projectedKwh.toLocaleString()}
                    </span>
                    <span className="text-2xl font-display font-medium text-slate-400 uppercase tracking-widest">kWh / mes</span>
                  </div>

                  {/* Monitor de Desperdicio Líquido */}
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest">Riesgo Detectado</p>
                      <p className="text-xl font-display font-bold text-red-500">{aiInsights?.top_waste_reason || 'Analizando...'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity size={18} className="text-blue-500" />
                    <h4 className="font-display font-bold text-slate-900 dark:text-white uppercase tracking-widest text-xs">Interpretación de la IA</h4>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    "{aiInsights?.ai_interpretation || 'Sin interpretación disponible.'}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  title="Sin activos industriales"
                  description="Agrega tus motores, calderas o sistemas para iniciar el análisis."
                />
              </div>
            )}
          </Card>

          {/* Stat Cards */}
          <StatCard
            title="Ahorro Potencial"
            value={aiInsights?.potential_savings || "$0"}
            unit="Estimado"
            icon={DollarSign}
            color="emerald"
          />
          <StatCard
            title="Consumo de Red"
            value={(totalKw).toLocaleString()}
            unit="kW Activos"
            icon={Zap}
            color="blue"
          />
          <StatCard
            title="Score de Residuo"
            value={`${efficiencyScore}%`}
            unit="Índice"
            icon={TrendingDown}
            color={efficiencyScore > 50 ? "red" : "emerald"}
          />
          <StatCard
            title="Sugerencia IA"
            value={aiInsights?.recommendation_highlight?.split(' ')[0] || "Ninguna"}
            unit={aiInsights?.recommendation_highlight?.split(' ').slice(1).join(' ') || "Recomendación"}
            icon={Lightbulb}
            color="amber"
          />

          {/* List of Assets */}
          <Card className="md:col-span-2 p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg mb-6">
              <Building2 size={20} className="text-blue-500" /> Inventario de Activos
            </h3>

            <div className="space-y-3">
              {assets.map((asset, i) => (
                <div key={asset.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{asset.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{asset.asset_type} • {asset.daily_usage_hours}h uso</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-display font-bold text-blue-500">{asset.nominal_power_kw} kW</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Eficiencia: {asset.efficiency_percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Big Suggestion Card */}
          <Card className="md:col-span-1 lg:col-span-2 p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none flex flex-col justify-between shadow-xl shadow-blue-500/20">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                  <Target size={24} />
                </div>
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">Meta de Planta</span>
              </div>
              <h3 className="text-2xl font-display font-bold">Optimización Recomendada</h3>
              <p className="text-blue-100 text-sm mt-2 leading-relaxed">
                Gemini ha detectado que el activo <span className="font-bold text-white underline">{aiInsights?.top_waste_reason}</span> es tu prioridad número uno para reducir costos este mes.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb size={20} className="text-amber-300" />
                <span className="text-sm font-bold">{aiInsights?.recommendation_highlight}</span>
              </div>
              <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50 font-bold">
                Aplicar Plan
              </Button>
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default IndustrialDashboard;
