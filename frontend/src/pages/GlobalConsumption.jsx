import React, { useState, useEffect } from 'react';
import {
  Globe, TrendingUp, TrendingDown, Zap, Factory, Building2,
  Map, BarChart3, Download, Calendar, Filter, ChevronRight,
  Activity, Gauge, AlertTriangle, Target, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import { useEnergyMath } from '../hooks/useEnergyMath';
import { industrialApi } from '../api/industrial';

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/50 backdrop-blur-md p-4 rounded-xl shadow-2xl">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-base font-bold" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()} kWh
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Zone Card Component
const ZoneCard = ({ name, consumption, change, status, machines }) => {
  const statusColors = {
    optimal: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
    warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
    critical: 'bg-red-100 text-red-600 dark:bg-red-900/30'
  };

  return (
    <Card className="p-5 hover:border-blue-500/50 transition-all cursor-pointer group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
            <Building2 size={20} />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-500 transition-colors">
            {name}
          </h4>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${statusColors[status]}`}>
          {status === 'optimal' ? 'Óptimo' : status === 'warning' ? 'Alerta' : 'Crítico'}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">Consumo mensual</span>
          <span className="font-black text-lg text-slate-800 dark:text-white">{consumption.toLocaleString()} kWh</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">Eficiencia</span>
          <span className={`text-sm font-bold ${change < 5 ? 'text-emerald-500' : 'text-red-500'}`}>
            {100 - Math.round(change * 2)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">Activos</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{machines}</span>
        </div>
      </div>
    </Card>
  );
};

const GlobalConsumption = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [zones, setZones] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && isMounted) {
      const timer = setTimeout(() => setIsReady(true), 150);
      return () => clearTimeout(timer);
    }
  }, [loading, isMounted]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [zonesData, insightsData] = await Promise.all([
        industrialApi.getConsumptionAnalysis(),
        industrialApi.getDashboardInsights()
      ]);
      setZones(zonesData);
      setAiInsights(insightsData);
    } catch (error) {
      console.error("Error fetching global consumption data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total consumption for dynamic scaling of mock trend
  const totalMonthlyConsumption = zones.reduce((acc, z) => acc + z.consumption, 0);

  // Create a realistic trend based on primary and secondary zones
  const mainZones = [...zones].sort((a, b) => b.consumption - a.consumption).slice(0, 2);
  const zone1Name = mainZones[0]?.name || 'Producción';
  const zone2Name = mainZones[1]?.name || 'Logística';
  const zone1Val = mainZones[0]?.consumption || 148000;
  const zone2Val = mainZones[1]?.consumption || 46000;

  const monthlyData = [
    { month: 'Ene', [zone1Name]: Math.round(zone1Val * 0.95), [zone2Name]: Math.round(zone2Val * 0.98) },
    { month: 'Feb', [zone1Name]: Math.round(zone1Val * 0.92), [zone2Name]: Math.round(zone2Val * 0.95) },
    { month: 'Mar', [zone1Name]: Math.round(zone1Val * 1.05), [zone2Name]: Math.round(zone2Val * 1.02) },
    { month: 'Abr', [zone1Name]: Math.round(zone1Val * 0.98), [zone2Name]: Math.round(zone2Val * 0.97) },
    { month: 'May', [zone1Name]: Math.round(zone1Val * 0.90), [zone2Name]: Math.round(zone2Val * 0.92) },
    { month: 'Jun', [zone1Name]: zone1Val, [zone2Name]: zone2Val },
  ];

  // Distribution data from real zones
  const distributionData = zones.map((z, i) => ({
    name: z.name,
    value: z.consumption,
    efficiency: z.efficiency || (100 - (z.change * 2)),
    color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][i % 5]
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="text-blue-500 animate-spin" size={48} />
      </div>
    );
  }

  if (zones.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 flex items-center justify-center">
        <EmptyState
          title="Sin datos de planta"
          description="Comienza agregando activos para ver el análisis de consumo global."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3">
              <Globe className="text-blue-500" size={32} />
              Consumo Global
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Vista consolidada del consumo energético de todas las instalaciones.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
              {['week', 'month', 'quarter', 'year'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors
                    ${selectedPeriod === period
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : period === 'quarter' ? 'Trimestre' : 'Año'}
                </button>
              ))}
            </div>

            <Button variant="ghost" size="md" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Download size={18} className="mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Consumo Proyectado"
            value={Math.round(totalMonthlyConsumption / 1000).toLocaleString()}
            unit="K kWh / mes"
            icon={Zap}
            color="blue"
          />

          <StatCard
            title="Eficiencia Promedio"
            value={aiInsights?.waste_score ? (100 - aiInsights.waste_score).toString() : "85"}
            unit="%"
            icon={TrendingDown}
            color="emerald"
            offset={-2.4}
            trend="down"
          />

          <StatCard
            title="Huella CO2"
            value={Math.round(totalMonthlyConsumption * 0.45).toLocaleString()}
            unit="kg CO2"
            icon={Globe}
            color="purple"
          />

          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meta de Eficiencia</span>
              <span className="text-sm font-bold text-blue-500">85%</span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 bg-blue-500"
                style={{ width: '85%' }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Basado en optimización de IA</p>
          </Card>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Consumption by Zone Chart */}
          <Card className="lg:col-span-2 p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Tendencia de Zonas</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Consumo mensual comparativo</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                {distributionData.slice(0, 3).map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[350px] relative w-full min-w-0 min-h-[350px]">
              {isReady && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorProduccion" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLogistica" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                      tickFormatter={(value) => `${value / 1000}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey={zone1Name} name={zone1Name} stroke="#3b82f6" strokeWidth={2} fill="url(#colorProduccion)" />
                    <Area type="monotone" dataKey={zone2Name} name={zone2Name} stroke="#10b981" strokeWidth={2} fill="url(#colorLogistica)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Distribution Pie */}
          <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Distribución por Carga</h2>

            <div className="h-[200px] mb-6 relative w-full min-w-0 min-h-[200px]">
              {isReady && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="space-y-3">
              {distributionData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">{item.name}</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">
                    {Math.round((item.value / totalMonthlyConsumption) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Zones Grid */}
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <Map className="text-blue-500" size={24} />
          Zonas de Operación Reales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {zones.map((zone, idx) => (
            <ZoneCard key={idx} {...zone} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalConsumption;
