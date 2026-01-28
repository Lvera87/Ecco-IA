import React from 'react';
import {
  Leaf, TrendingDown, TreeDeciduous, Award, Target,
  Recycle, BarChart3, Cloud, Wind, Flame, Car, Smartphone, Trash2, Factory
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
  const [activeMetric, setActiveMetric] = React.useState('co2'); // co2, car, phone, tree

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

  // Configuración de métricas interactivas
  const METRICS_CONFIG = {
    co2: { label: 'Emisiones CO₂', unit: 'kg', factor: 1, color: '#10b981', icon: Cloud },
    car: { label: 'Km en Auto', unit: 'km', factor: 4, color: '#ef4444', icon: Car },
    phone: { label: 'Cargas Celular', unit: 'cargas', factor: 120, color: '#3b82f6', icon: Smartphone },
    tree: { label: 'Árboles Req.', unit: 'árboles', factor: 0.5, color: '#22c55e', icon: TreeDeciduous }
  };

  const currentMetric = METRICS_CONFIG[activeMetric];

  // Procesar historial dinámico O generar proyección
  const getChartData = () => {
    // Si hay historial real, lo usamos
    if (consumptionHistory && consumptionHistory.length > 0) {
      return (consumptionHistory || []).map(entry => ({
        name: new Date(entry.date).toLocaleDateString('es-CO', { weekday: 'short' }),
        value: parseFloat(((entry.value || 0) * CO2_FACTOR * currentMetric.factor).toFixed(1)),
        isProjection: false
      }));
    }

    // Si NO hay historial, generamos PROYECCIÓN a 6 meses
    const currentImpact = co2Footprint * currentMetric.factor;
    const months = ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6'];

    return months.map((month, idx) => {
      // Simulamos una reducción progresiva gracias a EccoIA (hasta 30% en mes 6)
      const savingsFactor = 1 - (0.05 * (idx + 1));
      return {
        name: month,
        value: parseFloat(currentImpact.toFixed(1)), // Línea base (si no hace nada)
        optimized: parseFloat((currentImpact * savingsFactor).toFixed(1)), // Con EccoIA
        isProjection: true
      };
    });
  };

  const chartData = getChartData();
  const isProjection = chartData.length > 0 && chartData[0].isProjection;

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

        {/* EQUIVALENCIAS TANGIBLES (NUEVA SECCIÓN) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-500">
              <Car size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Recorrido Auto</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {(co2Footprint * 4).toFixed(0)} <span className="text-sm font-medium text-slate-400">km</span>
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-500">
              <Smartphone size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Cargas Celular</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {(co2Footprint * 120).toFixed(0)} <span className="text-sm font-medium text-slate-400">cargas</span>
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-500">
              <Trash2 size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Residuos</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {(co2Footprint * 2.5).toFixed(1)} <span className="text-sm font-medium text-slate-400">bolsas</span>
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
              <Factory size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Ind. Textil</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {(co2Footprint * 0.1).toFixed(1)} <span className="text-sm font-medium text-slate-400">camisetas</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <Card className="lg:col-span-2 p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">
                  {isProjection ? 'Proyección de Impacto Futuro' : 'Tendencia de Impacto'}
                </h2>
                <p className="text-sm text-slate-500">
                  {isProjection
                    ? 'Potencial de reducción usando las recomendaciones de EccoIA.'
                    : 'Visualiza tu historial en diferentes unidades equivalentes.'}
                </p>
              </div>

              {/* SELECTOR DE MÉTRICA */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                {Object.entries(METRICS_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveMetric(key)}
                      className={`
                        p-2 rounded-md transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider
                        ${activeMetric === key
                          ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}
                      `}
                      title={config.label}
                    >
                      <Icon size={16} className={activeMetric === key ? `text-[${config.color}]` : ''} style={{ color: activeMetric === key ? config.color : 'currentColor' }} />
                      <span className="hidden sm:inline">{config.unit}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-[350px] w-full min-w-0" style={{ minHeight: '350px' }}>
              {chartData.length > 0 && isReady ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id={`color-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOptimized" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
                      unit={` ${currentMetric.unit}`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900/95 border border-slate-700/50 backdrop-blur-md p-3 rounded-xl shadow-2xl">
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{label}</p>
                              {/* Valor Actual / Base */}
                              <div className="flex items-center gap-2 mb-1">
                                <div className="size-2 rounded-full" style={{ backgroundColor: currentMetric.color }} />
                                <p className="text-sm font-bold text-slate-300">
                                  {isProjection ? 'Actual:' : 'Impacto:'} <span className="text-white font-black text-lg">{payload[0].value}</span>
                                </p>
                              </div>

                              {/* Valor Optimizado (Solo en proyección) */}
                              {isProjection && payload[1] && (
                                <div className="flex items-center gap-2">
                                  <div className="size-2 rounded-full bg-violet-500" />
                                  <p className="text-sm font-bold text-violet-300">
                                    Con EccoIA: <span className="text-white font-black text-lg">{payload[1].value}</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    {/* Área Principal (Actual o Histórica) */}
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={currentMetric.color}
                      strokeWidth={3}
                      fill={`url(#color-${activeMetric})`}
                      name="Actual"
                    />

                    {/* Área Optimizada (Solo proyección) */}
                    {isProjection && (
                      <Area
                        type="monotone"
                        dataKey="optimized"
                        stroke="#8b5cf6" // Violeta para el futuro optimizado
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        fill="url(#colorOptimized)"
                        name="Con EccoIA"
                      />
                    )}

                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="Calculando impacto..."
                  description="Estamos analizando tus datos de consumo."
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
