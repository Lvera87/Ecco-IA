import React, { useState } from 'react';
import {
  Globe, TrendingUp, TrendingDown, Zap, Factory, Building2,
  Map, BarChart3, Download, Calendar, Filter, ChevronRight,
  Activity, Gauge, AlertTriangle, Target
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
import { useApp } from '../context/AppContext';

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
          <span className="text-sm text-slate-500 dark:text-slate-400">Consumo actual</span>
          <span className="font-black text-lg text-slate-800 dark:text-white">{consumption.toLocaleString()} kWh</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">vs. Promedio</span>
          <span className={`text-sm font-bold ${change < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500 dark:text-slate-400">Máquinas activas</span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{machines}</span>
        </div>
      </div>
    </Card>
  );
};

const GlobalConsumption = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  const { consumptionHistory } = useApp();
  const { projectedKwh, co2Footprint, hasData } = useEnergyMath();

  // Monthly consumption by zone (Mock extended for better chart)
  const monthlyData = [
    { month: 'Ene', produccion: 145000, logistica: 45000, oficinas: 28000 },
    { month: 'Feb', produccion: 138000, logistica: 42000, oficinas: 26000 },
    { month: 'Mar', produccion: 152000, logistica: 48000, oficinas: 29000 },
    { month: 'Abr', produccion: 142000, logistica: 44000, oficinas: 27000 },
    { month: 'May', produccion: 135000, logistica: 41000, oficinas: 25000 },
    { month: 'Jun', produccion: 148000, logistica: 46000, oficinas: 28000 },
  ];

  // Zones data
  const zones = [
    { name: 'Planta Producción', consumption: 62500, change: -5.2, status: 'optimal', machines: 24 },
    { name: 'Centro Logístico', consumption: 18200, change: 2.1, status: 'warning', machines: 8 },
    { name: 'Oficinas Centrales', consumption: 12400, change: -8.5, status: 'optimal', machines: 3 },
    { name: 'Almacén Norte', consumption: 8900, change: 15.3, status: 'critical', machines: 6 },
  ];

  // Distribution data
  const distributionData = [
    { name: 'Producción', value: 62, color: '#3b82f6' },
    { name: 'Logística', value: 18, color: '#10b981' },
    { name: 'Oficinas', value: 12, color: '#f59e0b' },
    { name: 'Almacén', value: 8, color: '#8b5cf6' },
  ];

  const monthlyGoal = 500000;
  const goalProgress = (projectedKwh / monthlyGoal) * 100;

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
            title="Consumo Mensual"
            value={Math.round(projectedKwh / 1000).toLocaleString()}
            unit="K kWh"
            icon={Zap}
            color="blue"
          />

          <StatCard
            title="Eficiencia Global"
            value="-10"
            unit="%"
            icon={TrendingDown}
            color="emerald"
            trend="down"
            trendValue={2.4}
          />

          <StatCard
            title="Huella CO2"
            value={Math.round(co2Footprint).toLocaleString()}
            unit="kg"
            icon={Globe}
            color="purple"
          />

          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meta Mensual</span>
              <span className="text-sm font-bold text-blue-500">{goalProgress.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${goalProgress > 90 ? 'bg-red-500' : goalProgress > 75 ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(goalProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">{Math.round(projectedKwh).toLocaleString()} / {monthlyGoal.toLocaleString()} kWh</p>
          </Card>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Consumption by Zone Chart */}
          <Card className="lg:col-span-2 p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Consumo por Zona</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tendencia mensual comparativa</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                {[
                  { name: 'Producción', color: '#3b82f6' },
                  { name: 'Logística', color: '#10b981' },
                  { name: 'Oficinas', color: '#f59e0b' },
                ].map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[350px]">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
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
                      <linearGradient id="colorOficinas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
                    <Area type="monotone" dataKey="produccion" name="Producción" stroke="#3b82f6" strokeWidth={2} fill="url(#colorProduccion)" />
                    <Area type="monotone" dataKey="logistica" name="Logística" stroke="#10b981" strokeWidth={2} fill="url(#colorLogistica)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Distribution Pie */}
          <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Distribución</h2>

            <div className="h-[200px] mb-6">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%">
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
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="space-y-3">
              {distributionData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600 dark:text-slate-300 flex-1">{item.name}</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Zones Grid */}
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <Map className="text-blue-500" size={24} />
          Zonas de Operación
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
