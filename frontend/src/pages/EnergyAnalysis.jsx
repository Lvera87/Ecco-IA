import React, { useState } from 'react';
import {
  BarChart3, Zap, Calendar,
  Download, Clock, DollarSign, Lightbulb, Target,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Line, ComposedChart
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import InsightCard from '../components/ui/InsightCard';
import EmptyState from '../components/ui/EmptyState';
import GoalsModal from '../components/ui/GoalsModal';
import { useApp } from '../context/AppContext';
import { useEnergyMath } from '../hooks/useEnergyMath';

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/50 backdrop-blur-md p-4 rounded-xl shadow-2xl">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} className="text-base font-black" style={{ color: entry.color }}>
            {entry.name}: {entry.value} {entry.unit || 'kWh'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const EnergyAnalysis = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => setIsReady(true), 200);
      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  const { userProfile, consumptionHistory, addNotification } = useApp();

  const {
    latestReading, projectedKwh, kwhPrice, hasData,
    formatMoney, enrichedAppliances
  } = useEnergyMath();

  const config = userProfile?.config || {};
  const details = config.applianceDetails || {};
  const userStratum = config.stratum ? parseInt(config.stratum) : 3;

  // Procesar historial de consumo real
  const processedData = consumptionHistory.map(entry => ({
    name: new Date(entry.date).toLocaleDateString('es-CO', { weekday: 'short' }),
    consumo: entry.value,
    promedio: 12.5, // Mock baseline
    costo: entry.value * kwhPrice
  }));

  // Hourly distribution (Basado en occupancyProfile)
  const isNightOwl = config.occupancyProfile === 'night_owl';
  const hourlyData = [
    { hora: '00:00', value: isNightOwl ? 0.8 : 0.2 },
    { hora: '04:00', value: 0.1 },
    { hora: '08:00', value: 1.5 },
    { hora: '12:00', value: 1.2 },
    { hora: '16:00', value: 0.8 },
    { hora: '20:00', value: isNightOwl ? 2.8 : 1.6 },
  ];

  // Desglose por dispositivo
  const deviceData = enrichedAppliances
    .sort((a, b) => b.monthlyCost - a.monthlyCost)
    .slice(0, 5)
    .map(app => ({
      name: app.name,
      value: app.monthlyCost,
      percentage: Math.round((app.monthlyCost / (projectedKwh * kwhPrice)) * 100) || 0
    }));

  const handleExport = () => {
    addNotification({
      type: 'success',
      title: 'Reporte Generado',
      message: `Análisis de Estrato ${userStratum} exportado correctamente.`
    });
  };

  // Generación de Insights Expertos
  const insights = [];
  if (details.fridge_check) {
    insights.push({
      icon: Zap,
      title: 'Eficiencia de Refrigeración',
      description: 'Tu nevera antigua es responsable de un consumo base desproporcionado.',
      action: 'Ver detalles'
    });
  }
  if (config.occupancyProfile === 'remote_work') {
    insights.push({
      icon: Clock,
      title: 'Patrón de Teletrabajo',
      description: 'Consumo diurno 25% superior a la media. Revisa el modo standby.',
      action: 'Optimizar'
    });
  }
  insights.push({
    icon: Target,
    title: 'Meta de Ahorro',
    description: `Para el Estrato ${userStratum}, reducir un 10% ahorraría ${formatMoney(projectedKwh * 0.1 * kwhPrice)} al mes.`,
    action: 'Ajustar meta'
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pt-6">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3">
              <BarChart3 className="text-primary" size={32} />
              Análisis de Energía
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Desglose técnico de tus patrones de consumo.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
              {['week', 'month'].map(period => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all
                    ${timeRange === period
                      ? 'bg-primary text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {period === 'week' ? 'Semanal' : 'Mensual'}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="md"
              icon={Download}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              onClick={handleExport}
            >
              Exportar
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Zap}
            title="Último Reporte"
            value={latestReading > 0 ? latestReading : '--'}
            unit="kWh"
            color="primary"
            tooltip="Consumo reportado en la última lectura del medidor."
          />
          <StatCard
            icon={DollarSign}
            title="Costo Operativo"
            value={formatMoney(projectedKwh * kwhPrice)}
            unit="/ mes"
            trend="down"
            trendValue={5}
            color="emerald"
          />
          <StatCard
            icon={Target}
            title="Eficiencia"
            value="A"
            unit="Nivel"
            color="blue"
            tooltip="Clasificación basada en el promedio de tu estrato."
          />
          <StatCard
            icon={Calendar}
            title="Proyección Anual"
            value={formatMoney(projectedKwh * kwhPrice * 12)}
            unit="/ año"
            color="purple"
          />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Consumption Chart */}
          <Card className="lg:col-span-2 p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Curva de Consumo</h2>
                <p className="text-sm text-slate-500">Histórico diario comparado con el promedio ideal.</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2 text-primary">
                  <div className="size-2 rounded-full bg-primary" />
                  <span>Real</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <div className="size-2 rounded-full bg-slate-300" />
                  <span>Línea Base</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full min-w-0" style={{ minHeight: '300px' }}>
              {hasData && isReady ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={processedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.1} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                      unit=" kWh"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="consumo" fill="#00c2cc" radius={[6, 6, 0, 0]} barSize={40} />
                    <Line
                      type="monotone"
                      dataKey="promedio"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="Sin datos reportados"
                  description="Comienza a ingresar tus lecturas para generar la curva de consumo."
                />
              )}
            </div>
          </Card>

          {/* Device Distribution */}
          <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-8">Impacto por Dispositivo</h2>
            <div className="space-y-6">
              {deviceData.length > 0 ? deviceData.map((device, idx) => (
                <div key={idx} className="space-y-2 group">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                    <span className="group-hover:text-primary transition-colors">{device.name}</span>
                    <span className="text-slate-900 dark:text-white">{device.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-1000"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              )) : (
                <EmptyState title="Inventario vacío" description="Agrega dispositivos para ver su impacto." />
              )}
            </div>
          </Card>
        </div>

        {/* Hourly Distribution */}
        <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Distribución Horaria</h2>
              <p className="text-sm text-slate-500">Patrón de uso estimado según tu perfil de ocupación.</p>
            </div>
          </div>

          <div className="h-[250px] w-full min-w-0" style={{ minHeight: '250px' }}>
            {isReady && (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00c2cc" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00c2cc" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.1} />
                  <XAxis
                    dataKey="hora"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    unit=" kWh"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#00c2cc"
                    strokeWidth={3}
                    fill="url(#colorHourly)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Insights Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Lightbulb className="text-amber-500" size={24} />
            Insights Inteligentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight, idx) => (
              <InsightCard
                key={idx}
                icon={insight.icon}
                title={insight.title}
                description={insight.description}
                action={insight.action}
                onClick={() => insight.action === 'Ajustar meta' ? setIsGoalsModalOpen(true) : null}
              />
            ))}
          </div>
        </div>

        <GoalsModal
          isOpen={isGoalsModalOpen}
          onClose={() => setIsGoalsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default EnergyAnalysis;
