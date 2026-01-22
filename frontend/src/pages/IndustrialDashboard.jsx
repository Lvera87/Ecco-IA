import React, { useState, useEffect } from 'react';
import {
  Zap, TrendingDown, Leaf, Trophy, Calendar, ChevronRight,
  Target, Award, DollarSign, Plus, Lightbulb, Wind, AlertCircle,
  Factory, Building2, Activity, BarChart3
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
  const { userProfile, consumptionHistory } = useApp();
  const config = userProfile?.config || {};

  const {
    latestReading, projectedKwh, projectedBill, efficiencyScore,
    co2Footprint, energyIntensity, kwhPrice, loadDist,
    vampireMoneyLost, hasData, formatMoney
  } = useEnergyMath();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Chart data for industrial loads
  const chartData = hasData ? [
    { time: '00:00', value: 2450 }, { time: '04:00', value: 2150 },
    { time: '08:00', value: 4880 }, { time: '12:00', value: 5420 },
    { time: '16:00', value: 5150 }, { time: '20:00', value: 3820 },
    { time: '22:00', value: 2850 },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-body relative overflow-x-hidden">
      <main className="relative z-10 p-8 max-w-[1600px] mx-auto space-y-8">

        {/* Header - EXACT SAME STRUCTURE AS RESIDENTIAL */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              {config.companyName ? `¡Hola, ${config.companyName}!` : 'Dashboard Industrial'}
            </h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2">
              <Factory size={16} className="text-blue-500" />
              {hasData
                ? <span>Tu proyección de costos operativos es de <span className="text-blue-500 font-bold">{formatMoney(projectedBill)}</span> esta mensualidad.</span>
                : <span>Monitorea el consumo de tu planta en tiempo real.</span>
              }
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end px-4 border-r border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{config.sector || 'Industrial'}</span>
              <span className="text-xl font-display font-bold text-blue-500">${kwhPrice}/kWh</span>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
            >
              <Plus size={18} className="mr-2" />
              Reportar Lectura
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {/* Consumption Monitor */}
          <Card className="md:col-span-2 md:row-span-2 p-8 flex flex-col relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Curva de Carga Eléctrica</h3>
                <p className="text-slate-500 text-sm mt-1">Estimación de potencia activa por turno</p>
              </div>
              {hasData && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <div className="size-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Planta en Línea</span>
                </div>
              )}
            </div>

            {hasData ? (
              <div className="flex-1 flex flex-col">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-display font-bold text-slate-900 dark:text-white tracking-tighter">
                      {latestReading.toLocaleString()}
                    </span>
                    <span className="text-2xl font-display font-medium text-slate-400 uppercase tracking-widest">kWh</span>
                  </div>

                  {/* NUEVO: Monitor de Desperdicio dentro del card principal */}
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
                    <div className="size-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                      <TrendingDown size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-red-500/70 uppercase tracking-widest">Dinero en Fugas/Desperdicio</p>
                      <p className="text-xl font-display font-bold text-red-500">{formatMoney(vampireMoneyLost)} <span className="text-xs">/ mes</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex-1" style={{ minHeight: '300px' }}>
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValueInd" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[0, 'auto']} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fill="url(#colorValueInd)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  title="Sin datos de planta"
                  description="Complete la configuración o reporte consumos manuales."
                />
              </div>
            )}
          </Card>

          {/* Vital Stats - SAME AS RESIDENTIAL BUT INDUSTRIAL METRICS */}
          <StatCard
            title="Proyección Mensual"
            value={Math.round(projectedKwh / 1000).toLocaleString()}
            unit="MWh / mes"
            icon={Zap}
            color="blue"
          />
          <StatCard
            title="Intensidad Energética"
            value={energyIntensity}
            unit="kWh / m²"
            icon={Activity}
            color="purple"
          />
          <StatCard
            title="Score Eficiencia"
            value={`${efficiencyScore}%`}
            unit="Score"
            icon={Award}
            color={parseFloat(efficiencyScore) > 85 ? "emerald" : "amber"}
          />
          <StatCard
            title="Huella Carbono"
            value={Math.round(co2Footprint).toLocaleString()}
            unit="kg CO2"
            icon={Leaf}
            color="emerald"
          />

          {/* Equipment Inventory */}
          <Card className="md:col-span-2 p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                <Building2 size={20} className="text-blue-500" /> Distribución de Carga
              </h3>
              <button className="text-xs text-slate-500 hover:text-blue-500 transition-colors flex items-center gap-1 font-bold uppercase tracking-widest">
                Detalles <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {loadDist.map((item, i) => {
                const percentage = (item.value / projectedKwh * 100).toFixed(0);
                const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">
                      <span>{item.name}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${colors[i % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Industrial Insight */}
          <Card className="md:col-span-1 lg:col-span-2 p-6 bg-gradient-to-br from-blue-500/10 to-emerald-500/5 border-blue-500/20 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg">
                  <Lightbulb size={24} />
                </div>
                <span className="bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/20">Optimización</span>
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Ahorro en Horas Pico</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                Desplazar el uso de maquinaria pesada fuera del horario de 6 PM a 9 PM podría reducir su factura en un 8%.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-amber-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Potencial: $1.2M / mes</span>
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                Ver Plan
              </Button>
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
};

export default IndustrialDashboard;
