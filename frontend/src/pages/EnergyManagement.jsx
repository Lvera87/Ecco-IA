import React, { useState, useEffect, useMemo } from 'react';
import {
    DollarSign, TrendingDown, Calculator,
    PiggyBank, Download, Target, Wallet,
    PieChart as PieIcon, Lightbulb,
    CheckCircle, Play, Info, X, Plus, Search,
    Filter, Trash2, Edit3, CheckCircle2, AlertTriangle,
    Wind, ShieldAlert, Zap, UploadCloud
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
    ComposedChart, Bar, Line, BarChart
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import InsightCard from '../components/ui/InsightCard';
import AddApplianceModal from '../components/ui/AddApplianceModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
// Micro-Contexts Architecture
import { useUser } from '../context/UserContext';
import { useEnergy, iconMap } from '../context/EnergyContext';
import { useUI } from '../context/UIContext';
import { useEnergyMath } from '../hooks/useEnergyMath';
import ApplianceDetailModal from '../components/ui/ApplianceDetailModal';
import BillUploadModal from '../components/ui/BillUploadModal'; // New Import
import MissionsPanel from '../components/MissionsPanel';

// Mapeo de imágenes ilustrativas (Duplicado de Dashboard para consistencia)
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

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 border border-slate-700/50 backdrop-blur-md p-4 rounded-xl shadow-2xl">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{label}</p>
                {payload.map((entry, idx) => (
                    <p key={idx} className="text-base font-bold" style={{ color: entry.color }}>
                        {entry.name}: ${entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const RecommendationCard = ({ recommendation, onClick }) => {
    const { title, description, savings, roi, difficulty, status } = recommendation;
    const difficultyColors = {
        easy: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
        medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
        hard: 'bg-red-100 text-red-600 dark:bg-red-900/30'
    };

    return (
        <Card
            className={`p-5 hover:border-emerald-500/50 transition-all cursor-pointer group relative overflow-hidden ${status === 'active' ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
            onClick={onClick}
        >
            {status === 'active' && (
                <div className="absolute top-0 right-0 p-2 text-emerald-500">
                    <Zap size={14} fill="currentColor" />
                </div>
            )}
            <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${difficultyColors[difficulty]}`}>
                    {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Inversión'}
                </span>
                <span className="text-lg font-black text-emerald-500">${savings.toLocaleString()}/año</span>
            </div>
            <h4 className="font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors block">
                {title}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{description}</p>
        </Card>
    );
};

const EnergyManagement = () => {
    const [activeTab, setActiveTab] = useState('inventory'); // 'finances' or 'inventory'
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedAppliance, setSelectedAppliance] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [applianceToDelete, setApplianceToDelete] = useState(null);
    const [isReady, setIsReady] = useState(false);

    // Bill Upload State
    const [isBillUploadOpen, setIsBillUploadOpen] = useState(false);
    const [lastUploadedBill, setLastUploadedBill] = useState(null);

    // Micro-Contexts: User domain
    const { userProfile } = useUser();

    // Micro-Contexts: Energy domain
    const {
        appliances, consumptionHistory, removeAppliance,
        toggleAppliance, syncEnergyData: syncDashboardData,
        addConsumptionReading
    } = useEnergy();

    // Micro-Contexts: UI domain
    const { addNotification } = useUI();

    const {
        formatMoney, totalMonthlyCost, projectedBill,
        vampireMoneyLost, hasData, enrichedAppliances,
        totalNominalKwh, loadDist, kwhPrice
    } = useEnergyMath();

    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 200);
        return () => clearTimeout(timer);
    }, []);

    // Inventory Filtering
    const filteredAppliances = enrichedAppliances.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ||
            (filter === 'active' && app.status) ||
            (filter === 'warning' && app.warning);
        return matchesSearch && matchesFilter;
    });

    // Mock Recommendations (Expert insights)
    const [recommendations, setRecommendations] = useState([
        { id: 1, title: 'Optimizar horarios de producción', description: 'Mover operaciones a horas de tarifa reducida.', savings: 85000, roi: 3, difficulty: 'easy', status: 'pending' },
        { id: 2, title: 'Actualizar iluminación a LED', description: 'Reemplazar luminarias antiguas en todas las áreas.', savings: 42000, roi: 8, difficulty: 'medium', status: 'pending' },
        { id: 3, title: 'Sistema de gestión energética', description: 'Implementar monitoreo IoT en tiempo real.', savings: 120000, roi: 18, difficulty: 'hard', status: 'pending' },
    ]);

    const totalPotentialSavings = recommendations.reduce((sum, r) => sum + r.savings, 0);

    const chartData = useMemo(() => {
        if (!consumptionHistory || consumptionHistory.length === 0) return [];

        // 1. Clonar y ordenar cronológicamente (Antiguo -> Nuevo)
        const sortedData = [...consumptionHistory].sort((a, b) => new Date(a.date) - new Date(b.date));

        // 2. Tomar los últimos 12 meses
        return sortedData.slice(-12).map(h => ({
            name: new Date(h.date).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
            costo: h.cost || (h.value * 850), // Usar costo real si existe, sino estimado
            ahorro: (h.cost || (h.value * 850)) * 0.12,
            consumo: h.value
        }));
    }, [consumptionHistory]);

    // --- LOGIC FROM ENERGY ANALYSIS ---
    // Hourly distribution (Mock based on profile)
    const isNightOwl = userProfile?.config?.occupancyProfile === 'night_owl';
    const hourlyData = [
        { hora: '00:00', value: isNightOwl ? 0.8 : 0.2 },
        { hora: '04:00', value: 0.1 },
        { hora: '08:00', value: 1.5 },
        { hora: '12:00', value: 1.2 },
        { hora: '16:00', value: 0.8 },
        { hora: '20:00', value: isNightOwl ? 2.8 : 1.6 },
    ];

    // Daily/Weekly Breakdown (Simulated from history for granularity)
    const processedAnalysisData = consumptionHistory.slice(0, 7).map(entry => ({
        name: new Date(entry.date).toLocaleDateString('es-CO', { weekday: 'short' }),
        consumo: entry.value,
        promedio: 12.5, // Mock baseline
        costo: entry.value * kwhPrice
    }));

    const handleToggle = (id) => toggleAppliance(id);
    const handleDelete = async (id) => {
        await removeAppliance(id);
        setApplianceToDelete(null);
        addNotification({ type: 'info', title: 'Inventario actualizado', message: 'Dispositivo eliminado.' });
    };

    // Feature Flags (Driven by User Preferences)
    const showFinancialAnalysis = userProfile?.config?.show_financial_analysis ?? true;

    const handleBillParsed = async (data) => {
        setLastUploadedBill(data);
        addNotification({
            type: 'success',
            title: 'Factura Procesada',
            message: `Consumo: ${data.total_kwh} kWh. Total: $${data.total_cost?.toLocaleString()}`
        });

        // Create a list of readings to process (Current + Historical)
        const readingsToSave = [];

        // 1. Current reading (Priority)
        if (data.total_kwh) {
            // Prefer end date of the period, otherwise today
            const readingDate = data.period_end ? new Date(data.period_end).toISOString() : new Date().toISOString();

            readingsToSave.push({
                value: data.total_kwh,
                type: 'bill_scan',
                date: readingDate,
                cost: data.total_cost
            });
        }

        // 2. Historical readings (if AI extracted them)
        if (data.historical_consumption && Array.isArray(data.historical_consumption)) {
            console.log("Processing historical data points:", data.historical_consumption.length);
            data.historical_consumption.forEach(item => {
                // Determine valid date
                const histDate = item.date ? new Date(item.date).toISOString() : null;
                if (histDate && item.kwh) {
                    readingsToSave.push({
                        value: item.kwh,
                        type: 'bill_scan_history',
                        date: histDate,
                        cost: item.cost
                    });
                }
            });
        }

        // 3. Process all readings
        let savedCount = 0;
        for (const reading of readingsToSave) {
            // Avoid duplicates? The backend doesn't check uniquely, but dates help.
            await addConsumptionReading(reading);
            savedCount++;
        }

        if (savedCount > 0) {
            addNotification({ type: 'info', title: 'Historial Actualizado', message: `Se han añadido ${savedCount} registros a tu gráfico de consumo.` });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pt-6">
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                            <DollarSign className="text-emerald-500" size={32} />
                            Gestión Integral de Energía
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Relación directa entre tu inventario de equipos y el costo de tu factura.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all
                                    ${activeTab === 'inventory' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Inventario Energético
                            </button>
                            {showFinancialAnalysis && (
                                <button
                                    onClick={() => setActiveTab('finances')}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all
                                        ${activeTab === 'finances' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Análisis Económico
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('missions')}
                                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all
                                    ${activeTab === 'missions' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Misiones
                            </button>
                        </div>
                        {activeTab === 'inventory' && (
                            <Button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-primary text-white font-bold px-6"
                                icon={Plus}
                            >
                                Añadir Equipo
                            </Button>
                        )}
                        {activeTab === 'finances' && showFinancialAnalysis && (
                            <Button
                                onClick={() => setIsBillUploadOpen(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 border-none shadow-emerald-500/20 shadow-lg"
                                icon={UploadCloud}
                            >
                                Subir Factura
                            </Button>
                        )}
                    </div>
                </div>

                {/* Unified Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 border-none text-white shadow-xl shadow-emerald-500/20">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                                <Target size={28} />
                            </div>
                            <div>
                                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Factura Proyectada</p>
                                <p className="text-3xl font-black text-emerald-100">{formatMoney(projectedBill)}</p>
                            </div>
                        </div>
                    </Card>

                    <StatCard
                        icon={Wallet}
                        title="Costo Operativo"
                        value={formatMoney(totalMonthlyCost)}
                        unit="/ mes"
                        color="blue"
                        tooltip="Consumo estimado basado en tu inventario actual."
                    />

                    <StatCard
                        icon={TrendingDown}
                        title="Fuga Ineficiente"
                        value={formatMoney(vampireMoneyLost)}
                        unit="/ mes"
                        color={vampireMoneyLost > 20000 ? "red" : "amber"}
                        tooltip="Costo por equipos en standby o ineficientes."
                    />

                    <StatCard
                        icon={Zap}
                        title="Carga Nominal"
                        value={totalNominalKwh.toFixed(1)}
                        unit="kWh"
                        color="primary"
                    />
                </div>



                {/* Main Content Tabs */}
                {activeTab === 'missions' ? (
                    <MissionsPanel />
                ) : activeTab === 'finances' && showFinancialAnalysis ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
                        {/* Cost Trend Chart */}
                        <Card className="lg:col-span-2 p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white">Análisis de Tendencias</h2>
                                    <p className="text-sm text-slate-500">Histórico de comportamiento financiero vs potencial de ahorro.</p>
                                </div>
                            </div>

                            <div className="h-[350px] w-full min-w-0">
                                {isReady && (
                                    <ResponsiveContainer width="100%" height={350}>
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorCosto" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.1} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} tickFormatter={(val) => `$${val / 1000}k`} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Area type="monotone" dataKey="costo" name="Costo" stroke="#3b82f6" strokeWidth={3} fill="url(#colorCosto)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </Card>

                        {/* Cost Breakdown */}
                        <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-2">
                                <PieIcon className="text-primary" size={24} />
                                <span className="truncate">Distribución por Carga</span>
                            </h2>

                            <div className="h-[220px] mb-8">
                                {isReady && (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie
                                                data={loadDist.length > 0 ? loadDist : [{ name: 'Sin datos', value: 100, color: '#e2e8f0' }]}
                                                cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none"
                                            >
                                                {loadDist.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            <div className="space-y-4">
                                {loadDist.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[100px]">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-800 dark:text-white">{formatMoney(item.value * kwhPrice)}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Billing History Table - FULL WIDTH */}
                        <Card className="lg:col-span-3 p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white">Histórico de Facturación</h2>
                                    <p className="text-sm text-slate-500">Registro detallado de tus facturas y lecturas de consumo.</p>
                                </div>
                                <Button
                                    onClick={() => {/* Download Export logic would go here */ }}
                                    variant="outline"
                                    className="border-slate-200 dark:border-slate-700"
                                    icon={Download}
                                >
                                    Exportar
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <th className="pb-4 pl-4">Fecha</th>
                                            <th className="pb-4 text-center">Fuente</th>
                                            <th className="pb-4 text-right">Consumo (kWh)</th>
                                            <th className="pb-4 text-right">Costo Real ($)</th>
                                            <th className="pb-4 text-right pr-4">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {consumptionHistory && consumptionHistory.length > 0 ? (
                                            consumptionHistory.map((record) => (
                                                <tr key={record.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="py-4 pl-4 font-bold text-slate-700 dark:text-slate-300">
                                                        {new Date(record.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 text-center">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase ${record.type === 'bill_scan'
                                                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                            }`}>
                                                            {record.type === 'bill_scan' ? 'Factura IA' : 'Manual'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right font-medium text-slate-600 dark:text-slate-400">
                                                        {record.value.toFixed(1)} kWh
                                                    </td>
                                                    <td className="py-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                                                        {record.cost ? formatMoney(record.cost) : <span className="text-slate-300 dark:text-slate-600 italic">--</span>}
                                                    </td>
                                                    <td className="py-4 text-right pr-4">
                                                        <div className="flex justify-end">
                                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-slate-400 italic">
                                                    No hay registros de facturas aún. Sube tu primera factura para comenzar.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Alerts for inefficient devices */}
                        {enrichedAppliances.some(a => a.warning) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {enrichedAppliances.filter(a => a.warning).slice(0, 2).map((app, idx) => (
                                    <InsightCard
                                        key={idx}
                                        icon={ShieldAlert}
                                        title={`Impacto Crítico: ${app.name}`}
                                        description={`${app.warning}. Cuesta ${formatMoney(app.monthlyCost)}/mes.`}
                                        action="Marcar para reemplazo"
                                        onClick={() => addNotification({ type: 'info', title: 'Plan de Eficiencia', message: 'Hemos añadido este equipo a tu lista de reemplazos prioritaria.' })}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Appliances Inventory with Cost Context */}
                        <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Buscar equipo..."
                                        className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 dark:text-white"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                    {[{ id: 'all', label: 'Todos' }, { id: 'active', label: 'Activos' }, { id: 'warning', label: 'Ineficientes' }].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setFilter(opt.id)}
                                            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-widest ${filter === opt.id ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipo</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Cantidad</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Consumo Total</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Costo Total</th>
                                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Agrupación Visual */}
                                        {Object.values(filteredAppliances.reduce((acc, app) => {
                                            // Clave única de agrupación: Nombre + Consumo + Categoría
                                            const key = `${app.name}-${app.consumption}-${app.category}`;
                                            if (!acc[key]) {
                                                acc[key] = {
                                                    ...app,
                                                    quantity: 0,
                                                    ids: [],
                                                    totalMonthlyCost: 0,
                                                    totalConsumption: 0
                                                };
                                            }
                                            acc[key].quantity += 1;
                                            acc[key].ids.push(app.id);

                                            // Only sum cost/consumption if the device is active
                                            if (app.status) {
                                                acc[key].totalMonthlyCost += app.monthlyCost;
                                                acc[key].totalConsumption += (app.monthlyCost / 850);
                                            }

                                            return acc;
                                        }, {})).map((group) => {
                                            const AppIcon = iconMap?.[group.icon] || Wind;
                                            const bgImage = APPLIANCE_IMAGES[group.icon] || APPLIANCE_IMAGES.default;

                                            // Preparamos el objeto para el modal (usando el primer item del grupo como base + datos agregados)
                                            const modalData = {
                                                ...group,
                                                bgImage,
                                                // Aseguramos que el status refleje si alguno del grupo está encendido o el estado general
                                                status: group.status
                                            };

                                            return (
                                                <tr
                                                    key={group.ids[0]}
                                                    onClick={() => setSelectedAppliance(modalData)}
                                                    className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`size-10 rounded-xl flex items-center justify-center ${group.warning ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                                                <AppIcon size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                                    {group.name}
                                                                </p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{group.consumption.toFixed(2)} kWh/día (u)</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs px-3 py-1 rounded-full">
                                                            x{group.quantity}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => group.ids.forEach(id => handleToggle(id))}
                                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${group.status ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                                                title="Alternar todos"
                                                            >
                                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${group.status ? 'translate-x-6' : 'translate-x-1'}`} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right font-bold text-slate-600 dark:text-slate-300">
                                                        {group.totalConsumption.toFixed(1)} kWh/mes
                                                    </td>
                                                    <td className="px-6 py-5 text-right font-black text-slate-800 dark:text-white">
                                                        {formatMoney(group.totalMonthlyCost)}
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setApplianceToDelete({ id: group.ids[0], name: group.name, isGroup: group.quantity > 1 });
                                                            }}
                                                            className="p-2 hover:bg-red-50 text-red-300 hover:text-red-500 rounded-lg transition-colors"
                                                            title="Eliminar uno"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Shared Action Zone: Savings Opportunities */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Lightbulb className="text-amber-500" size={24} />
                        Plan de Acción Recomendado
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recommendations.map((rec) => (
                            <RecommendationCard
                                key={rec.id}
                                recommendation={rec}
                                onClick={() => addNotification({ type: 'info', title: rec.title, message: 'Simulando impacto en tu próxima factura...' })}
                            />
                        ))}
                    </div>
                </div>

                {/* Modals */}
                <AddApplianceModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
                <ConfirmationModal
                    isOpen={!!applianceToDelete}
                    onClose={() => setApplianceToDelete(null)}
                    onConfirm={() => handleDelete(applianceToDelete.id)}
                    title="Eliminar del Inventario"
                    message={`Si eliminas "${applianceToDelete?.name}", se recalculará tu costo operativo inmediatamente.`}
                />

                {/* Detail Modal */}
                <ApplianceDetailModal
                    isOpen={!!selectedAppliance}
                    onClose={() => setSelectedAppliance(null)}
                    appliance={selectedAppliance}
                    onToggle={(app) => {
                        if (app.ids && app.ids.length > 0) {
                            app.ids.forEach(id => handleToggle(id));
                        } else {
                            handleToggle(app.id);
                        }
                        // Update local modal state for immediate feedback
                        setSelectedAppliance(prev => ({ ...prev, status: !prev.status }));
                    }}
                />

                <BillUploadModal
                    isOpen={isBillUploadOpen}
                    onClose={() => setIsBillUploadOpen(false)}
                    onDataParsed={handleBillParsed}
                />

            </div>
        </div >
    );
};

export default EnergyManagement;
