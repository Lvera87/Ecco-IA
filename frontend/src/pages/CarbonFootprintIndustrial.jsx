import React, { useState, useEffect } from 'react';
import {
    Leaf, TrendingDown, TreeDeciduous, Award, Factory, Cloud, Wind,
    Car, Smartphone, Trash2, AlertTriangle, Loader2, Recycle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import InsightCard from '../components/ui/InsightCard';
import EmptyState from '../components/ui/EmptyState';
import { industrialApi } from '../api/industrial'; // Industrial API
import Button from '../components/ui/Button';

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 border border-slate-700/50 backdrop-blur-md p-3 rounded-xl shadow-2xl">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{label}</p>
                <p className="text-xl font-black text-emerald-400">
                    {(payload[0].value || 0).toLocaleString()} <span className="text-xs font-medium text-slate-500">kg CO₂</span>
                </p>
            </div>
        );
    }
    return null;
};

const CarbonFootprintIndustrial = () => {
    const [loading, setLoading] = useState(true);
    const [activeMetric, setActiveMetric] = useState('co2'); // co2, car, phone, tree
    const [data, setData] = useState(null);

    // Factor de emisión (aproximado para red eléctrica industrial en Colombia)
    const CO2_FACTOR = 0.164; // kg CO2 per kWh

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // 1. Get Settings (Base Consumption)
                const settings = await industrialApi.getSettings();

                let consumption = 0;
                let prediction = null;

                if (settings && settings.baseline_consumption_kwh > 0) {
                    consumption = settings.baseline_consumption_kwh;

                    // 2. Get Prediction Breakdown (if possible, to populate pie chart)
                    try {
                        prediction = await industrialApi.predict({
                            sector_id: settings.sector_id || 1,
                            consumo_total: consumption,
                            area_m2: settings.area_m2 || 1000
                        });
                    } catch (err) {
                        console.warn("Could not fetch prediction for breakdown", err);
                    }
                }

                setData({
                    consumption,
                    prediction,
                    co2Footprint: consumption * CO2_FACTOR
                });

            } catch (error) {
                console.error("Error loading industrial carbon data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
            </div>
        );
    }

    const { co2Footprint, consumption, prediction } = data || {};

    // Configuración de métricas interactivas
    const METRICS_CONFIG = {
        co2: { label: 'Emisiones CO₂', unit: 'kg', factor: 1, color: '#10b981', icon: Cloud },
        car: { label: 'Km en Camión', unit: 'km', factor: 0.8, color: '#ef4444', icon: Car }, // Adjusted for truck/industrial transport
        phone: { label: 'Cargas Industrial', unit: 'ciclos', factor: 50, color: '#3b82f6', icon: Smartphone }, // Abstraction
        tree: { label: 'Hectáreas Bosque', unit: 'has', factor: 0.001, color: '#22c55e', icon: TreeDeciduous } // Scaled down for massive numbers
    };

    const currentMetric = METRICS_CONFIG[activeMetric];

    // Proyección a 6 meses (Simulada para IA)
    const getChartData = () => {
        const currentImpact = co2Footprint * currentMetric.factor;
        const months = ['Mes 1', 'Mes 2', 'Mes 3', 'Mes 4', 'Mes 5', 'Mes 6'];

        return months.map((month, idx) => {
            // Optimización industrial progresiva (hasta 15% en 6 meses)
            const savingsFactor = 1 - (0.025 * (idx + 1));
            return {
                name: month,
                value: parseFloat(currentImpact.toFixed(1)), // Línea base
                optimized: parseFloat((currentImpact * savingsFactor).toFixed(1)), // Con EccoIA
                isProjection: true
            };
        });
    };

    const chartData = getChartData();

    // Desglose por fuente (Usando predicción industrial o genérico)
    const carbonSources = prediction ? [
        { name: 'Maquinaria', amount: prediction.desglose.maquinaria_produccion * CO2_FACTOR, color: '#f59e0b' },
        { name: 'Climatización', amount: prediction.desglose.climatizacion * CO2_FACTOR, color: '#3b82f6' },
        { name: 'Iluminación', amount: prediction.desglose.iluminacion * CO2_FACTOR, color: '#10b981' },
        { name: 'Otros', amount: prediction.desglose.otros_auxiliares * CO2_FACTOR, color: '#64748b' }
    ].sort((a, b) => b.amount - a.amount) : [
        { name: 'Procesos', amount: co2Footprint * 0.6, color: '#f59e0b' },
        { name: 'HVAC', amount: co2Footprint * 0.25, color: '#3b82f6' },
        { name: 'Iluminación', amount: co2Footprint * 0.15, color: '#10b981' }
    ];

    const treesEquivalent = Math.round((co2Footprint || 0) / 20); // Árboles maduros necesarios

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3">
                        <Leaf className="text-emerald-500" size={32} />
                        Huella de Carbono Industrial
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Impacto ambiental de tu planta y proyecciones de reducción (ESG).
                    </p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 border-none text-white shadow-xl shadow-emerald-500/20">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                <Factory size={28} />
                            </div>
                            <div>
                                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Emisiones Mensuales</p>
                                <p className="text-3xl font-black">{co2Footprint.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-lg font-medium">kg</span></p>
                            </div>
                        </div>
                    </Card>

                    <StatCard
                        icon={TrendingDown}
                        title="Potencial Reducción"
                        value="15"
                        unit="%"
                        trend="down"
                        trendValue={15}
                        color="emerald"
                        tooltip="Reducción estimada al implementar recomendaciones de IA."
                    />

                    <StatCard
                        icon={TreeDeciduous}
                        title="Compensación Req."
                        value={treesEquivalent}
                        unit="árboles"
                        color="blue"
                        tooltip="Árboles necesarios para compensar la huella mensual."
                    />

                    <StatCard
                        icon={Award}
                        title="Certificación"
                        value="B"
                        unit="ISO 50001"
                        color="amber"
                    />
                </div>

                {/* EQUIVALENCIAS DE IMPACTO */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-500">
                            <Car size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Flota Camiones</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">
                                {(co2Footprint / 2.6).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm font-medium text-slate-400">km</span>
                            </p>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-500">
                            <Wind size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Volumen Gas</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">
                                {(co2Footprint * 559).toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm font-medium text-slate-400">m³</span>
                            </p>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-500">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Residuos Ind.</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">
                                {(co2Footprint * 0.3).toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-sm font-medium text-slate-400">ton</span>
                            </p>
                        </div>
                    </Card>

                    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center gap-4">
                        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
                            <Factory size={24} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Barriles Petróleo</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">
                                {(co2Footprint * 0.0023).toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-sm font-medium text-slate-400">barriles</span>
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart Section */}
                    <Card className="lg:col-span-2 p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">
                                    Trayectoria de Descarbonización
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Proyección de impacto implementando plan de eficiencia energética.
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
                                    <Tooltip content={<CustomTooltip />} />

                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={currentMetric.color}
                                        strokeWidth={3}
                                        fill={`url(#color-${activeMetric})`}
                                        name="Línea Base"
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="optimized"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        strokeDasharray="5 5"
                                        fill="url(#colorOptimized)"
                                        name="Objetivo NetZero"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Distribution Pie Chart */}
                    <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-black text-slate-800 dark:text-white mb-8">Fuentes de Emisión</h2>
                        <div className="h-[220px] mb-8 w-full min-w-0" style={{ minHeight: '220px' }}>
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
                        </div>
                        <div className="space-y-4">
                            {carbonSources.map((source, idx) => (
                                <div key={idx} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="size-2 rounded-full" style={{ backgroundColor: source.color }} />
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{source.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{Math.round(source.amount).toLocaleString()} kg</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Eco Tips (Acciones Correctivas) */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Recycle className="text-emerald-500" size={24} />
                        Acciones de Mitigación Recomendadas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InsightCard
                            icon={Factory}
                            title="Motores Eficientes (IE4)"
                            description="Reemplazar motores antiguos reduciría 2.5 ton CO2/año."
                            action="Ver ROI"
                        />
                        <InsightCard
                            icon={Wind}
                            title="Fugas de Aire Comprimido"
                            description="Reparar fugas detectadas ahorraría 800 kg CO2/mes."
                            action="Localizar"
                        />
                        <InsightCard
                            icon={Cloud}
                            title="Optimización HVAC"
                            description="Ajustar setpoints reduciría emisiones térmicas un 12%."
                            action="Ajustar"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarbonFootprintIndustrial;
