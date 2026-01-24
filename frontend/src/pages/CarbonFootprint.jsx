import React from 'react';
import {
  Leaf, TrendingDown, TreeDeciduous, Award, Target,
  Recycle, BarChart3, Cloud, Wind, Flame
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import InsightCard from '../components/ui/InsightCard';
import EmptyState from '../components/ui/EmptyState';
import { useUser } from '../context/UserContext';
import { useEnergy } from '../context/EnergyContext';
import { useEnergyMath } from '../hooks/useEnergyMath';

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/50 backdrop-blur-md p-3 rounded-xl shadow-2xl">
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-emerald-400">
          {(payload[0].value || 0).toFixed(1)} <span className="text-xs font-medium text-slate-500">kg CO₂</span>
        </p>
      </div>
    );
  }
  return null;
};

const CarbonFootprint = () => {
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

  const { userProfile } = useUser();
  const { consumptionHistory } = useEnergy();
  const {
    co2Footprint = 0, hasData, enrichedAppliances = [],
    CO2_FACTOR = 0.164
  } = useEnergyMath();

  const config = userProfile?.config || {};
  const details = config.applianceDetails || {};

  // Procesar historial para CO2
  const monthlyData = (consumptionHistory || []).map(entry => ({
    name: new Date(entry.date).toLocaleDateString('es-CO', { weekday: 'short' }),
    value: (entry.value || 0) * CO2_FACTOR
  }));

  // Desglose por fuente (Real según inventario)
  const carbonSources = enrichedAppliances
    .sort((a, b) => (b.monthlyCost || 0) - (a.monthlyCost || 0))
    .slice(0, 4)
    .map(app => ({
      name: app.name,
      amount: Math.round((app.monthlyCost || 0) / 850 * CO2_FACTOR), // Estimado
      percentage: Math.round(((app.monthlyCost || 0) / (Math.max(co2Footprint, 1) * 850 / CO2_FACTOR)) * 100) || 25,
      color: app.icon === 'Refrigerator' ? '#f59e0b' : app.icon === 'AirVent' ? '#3b82f6' : '#10b981'
    }));

  // Eco tips dinámicos
  const ecoTips = [];
  if (details.fridge_check) {
    ecoTips.push({
      icon: Cloud,
      title: 'Renovación de Nevera',
      description: 'Tu equipo antiguo es responsable de emisiones críticas. Cambiarlo ahorraría 15kg CO2/mes.',
      action: 'Analizar ahorro',
      difficulty: 'hard'
    });
  }
  ecoTips.push({
    icon: Wind,
    title: 'Energía Fantasma',
    description: 'Eliminar el consumo vampiro evitaría la emisión de 4kg de CO2 mensualmente.',
    action: 'Ver equipos',
    difficulty: 'easy'
  });
  ecoTips.push({
    icon: Recycle,
    title: 'Ciclos de Lavado',
    description: 'Lavar con agua fría reduce la huella de carbono de tu lavadora en un 35%.',
    action: 'Ver tips',
    difficulty: 'easy'
  });

  const treesEquivalent = Math.round((co2Footprint || 0) / 2); // 1 árbol absorbe aprox 20kg/año -> 1.6kg/mes

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pt-6">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3">
            <Leaf className="text-emerald-500" size={32} />
            Huella de Carbono
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Impacto ambiental de tu consumo energético y proyecciones ecológicas.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-gradient-to-br from-emerald-500 to-teal-600 border-none text-white shadow-xl shadow-emerald-500/20">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <Leaf size={28} />
              </div>
              <div>
                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">CO₂ Mensual</p>
                <p className="text-3xl font-black">{co2Footprint.toFixed(1)} <span className="text-lg font-medium">kg</span></p>
              </div>
            </div>
          </Card>

          <StatCard
            icon={TrendingDown}
            title="Reducción"
            value="12"
            unit="%"
            trend="down"
            trendValue={5}
            color="emerald"
          />

          <StatCard
            icon={TreeDeciduous}
            title="Compensación"
            value={treesEquivalent}
            unit="árboles"
            color="blue"
            tooltip="Número de árboles necesarios para absorber tu impacto mensual."
          />

          <StatCard
            icon={Award}
            title="Estatus ECO"
            value="A+"
            unit="Nivel"
            color="amber"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <Card className="lg:col-span-2 p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Tendencia Ecológica</h2>
                <p className="text-sm text-slate-500">Histórico de emisiones de CO₂ basado en tus reportes.</p>
              </div>
            </div>

            <div className="h-[350px] w-full min-w-0" style={{ minHeight: '350px' }}>
              {hasData && isReady ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                      unit=" kg"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#colorCO2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="Sin datos ambientales"
                  description="Comienza a reportar tu consumo para visualizar tu huella ecológica."
                />
              )}
            </div>
          </Card>

          {/* Distribution Pie Chart */}
          <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-8">Fuentes de Emisión</h2>
            <div className="h-[220px] mb-8 w-full min-w-0" style={{ minHeight: '220px' }}>
              {isReady && (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={carbonSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="amount"
                      stroke="none"
                    >
                      {carbonSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="space-y-4">
              {carbonSources.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full" style={{ backgroundColor: source.color }} />
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{source.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{source.amount} kg</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Eco Tips */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Recycle className="text-emerald-500" size={24} />
            Acciones de Mitigación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ecoTips.map((tip, idx) => (
              <InsightCard
                key={idx}
                icon={tip.icon}
                title={tip.title}
                description={tip.description}
                action={tip.action}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprint;
