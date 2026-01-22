import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingDown, Calculator,
  PiggyBank, Download, Target, Wallet,
  PieChart as PieIcon, Lightbulb,
  CheckCircle, Play, Info, X
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { useEnergyMath } from '../hooks/useEnergyMath';

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

// Recommendation Card (Internal to this page as it has specialized logic)
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
        <div className="absolute top-0 right-0 p-2">
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-500 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded-full">
            <Play size={10} fill="currentColor" /> En proceso
          </span>
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${difficultyColors[difficulty]}`}>
          {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Medio' : 'Inversión'}
        </span>
        <span className="text-lg font-black text-emerald-500">${savings.toLocaleString()}/año</span>
      </div>
      <h4 className="font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors pr-16 block text-ellipsis">
        {title}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{description}</p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">ROI estimado:</span>
        <span className="font-bold text-emerald-500">{roi} meses</span>
      </div>
    </Card>
  );
};

// Recommendation Modal
const RecommendationModal = ({ isOpen, onClose, recommendation, onImplement }) => {
  if (!isOpen || !recommendation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
          <div>
            <span className="inline-block px-2 py-1 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 mb-2">
              Oportunidad de Ahorro
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{recommendation.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
            {recommendation.description}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Ahorro Estimado</p>
              <p className="text-2xl font-black text-emerald-500">${recommendation.savings.toLocaleString()}<span className="text-sm text-slate-400 font-medium">/año</span></p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Retorno Inversión</p>
              <p className="text-2xl font-black text-blue-500">{recommendation.roi} <span className="text-sm text-slate-400 font-medium">meses</span></p>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex gap-3">
            <Info className="text-amber-500 shrink-0" size={20} />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Esta acción requiere aprobación del departamento técnico. Al iniciar, se generará una solicitud automática.
            </p>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          {recommendation.status !== 'active' ? (
            <Button variant="primary" onClick={() => onImplement(recommendation.id)} icon={Play}>
              Iniciar Implementación
            </Button>
          ) : (
            <Button variant="outline" className="cursor-default border-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" icon={CheckCircle}>
              En Implementación
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const FinancialImpact = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => setIsReady(true), 200);
      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  const { addNotification, consumptionHistory } = useApp();
  const {
    formatMoney, totalMonthlyCost, projectedBill,
    vampireMoneyLost, hasData
  } = useEnergyMath();

  // Recommendations state (Hardcoded for now as they are "expert insights")
  const [recommendations, setRecommendations] = useState([
    { id: 1, title: 'Optimizar horarios de producción', description: 'Mover operaciones a horas de tarifa reducida.', savings: 85000, roi: 3, difficulty: 'easy', status: 'pending' },
    { id: 2, title: 'Actualizar iluminación a LED', description: 'Reemplazar luminarias antiguas en todas las áreas.', savings: 42000, roi: 8, difficulty: 'medium', status: 'pending' },
    { id: 3, title: 'Sistema de gestión energética', description: 'Implementar monitoreo IoT en tiempo real.', savings: 120000, roi: 18, difficulty: 'hard', status: 'pending' },
    { id: 4, title: 'Domótica: Sensores de movimiento', description: 'Instalación de sensores para evitar luces encendidas innecesarias.', savings: 25000, roi: 6, difficulty: 'easy', status: 'pending' },
  ]);

  // Derived stats
  const totalPotentialSavings = recommendations.reduce((sum, r) => sum + r.savings, 0);
  const accumulatedSavings = 145000; // Mock: In a real app, this would come from a 'missions_completed' table

  // Chart Data Generator from Consumption History
  const chartData = consumptionHistory?.slice(-12).map(h => ({
    name: h.date?.split('-')[2] || '?',
    costo: h.consumption * 850, // Mock price
    ahorro: (h.consumption * 850) * 0.12 // Mock baseline comparison
  })) || [];

  // Cost breakdown (Expert logic could make this dynamic based on appliances)
  const costBreakdown = [
    { name: 'Electrodomésticos', value: 45, color: '#3b82f6' },
    { name: 'Iluminación', value: 25, color: '#10b981' },
    { name: 'Vampiro', value: 15, color: '#f59e0b' },
    { name: 'Otros', value: 15, color: '#64748b' },
  ];

  const handleRecClick = (rec) => {
    setSelectedRec(rec);
    setModalOpen(true);
  };

  const handleImplement = (id) => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'active' } : r));
    setModalOpen(false);
    addNotification({
      type: 'success',
      title: 'Implementación Iniciada',
      message: 'Se ha generado la solicitud para implementar esta mejora.'
    });
  };

  const handleExport = () => {
    addNotification({
      type: 'info',
      title: 'Exportando Reporte',
      message: 'El reporte financiero se está generando. La descarga comenzará pronto.'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pt-6">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3">
              <DollarSign className="text-emerald-500" size={32} />
              Impacto Financiero
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Análisis experto de costos y proyecciones de ahorro.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
              {['month', 'year'].map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all
                    ${selectedPeriod === period
                      ? 'bg-primary text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {period === 'month' ? 'Mensual' : 'Anual'}
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
          <Card className="p-6 bg-gradient-to-br from-primary to-blue-600 border-none text-white shadow-xl shadow-primary/20">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <PiggyBank size={28} />
              </div>
              <div>
                <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Ahorro Logrado</p>
                <p className="text-3xl font-black">{formatMoney(accumulatedSavings)}</p>
              </div>
            </div>
          </Card>

          <StatCard
            icon={Wallet}
            title="Costo Operativo"
            value={formatMoney(totalMonthlyCost)}
            unit="/ mes"
            trend="down"
            trendValue={12}
            color="blue"
          />

          <StatCard
            icon={TrendingDown}
            title="Fuga Vampiro"
            value={formatMoney(vampireMoneyLost)}
            unit="/ mes"
            color={vampireMoneyLost > 20000 ? "red" : "amber"}
            tooltip="Costo estimado de dispositivos en modo standby."
          />

          <StatCard
            icon={Target}
            title="Factura Proyectada"
            value={formatMoney(projectedBill)}
            unit="/ mes"
            color="emerald"
          />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cost Trend Chart */}
          <Card className="lg:col-span-2 p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white">Evolución de Costos</h2>
                <p className="text-sm text-slate-500">Histórico de facturación vs potencial de ahorro.</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2 text-blue-500">
                  <div className="size-2 rounded-full bg-blue-500" />
                  <span>Real</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-500">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <span>Optimizado</span>
                </div>
              </div>
            </div>

            <div className="h-[350px] w-full min-w-0" style={{ minHeight: '350px' }}>
              {hasData && isReady ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCosto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAhorro" x1="0" y1="0" x2="0" y2="1">
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
                      tickFormatter={(val) => `$${val / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="costo" name="Costo" stroke="#3b82f6" strokeWidth={3} fill="url(#colorCosto)" />
                    <Area type="monotone" dataKey="ahorro" name="Meta" stroke="#10b981" strokeWidth={3} fill="url(#colorAhorro)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="Sin datos históricos"
                  description="Comienza a reportar tus lecturas para ver proyecciones financieras."
                />
              )}
            </div>
          </Card>

          {/* Cost Breakdown */}
          <Card className="p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-2">
              <PieIcon className="text-primary" size={24} />
              Distribución
            </h2>

            <div className="h-[220px] mb-8 w-full min-w-0" style={{ minHeight: '220px' }}>
              {isReady && (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="space-y-4">
              {costBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-800 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Savings Recommendations */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
              <Lightbulb className="text-amber-500" size={24} />
              Oportunidades de Impacto
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
              <CheckCircle size={14} className="text-emerald-500" />
              Actualizado hoy
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onClick={() => handleRecClick(rec)}
              />
            ))}
          </div>
        </div>

        {/* Summary Action Card */}
        <Card className="p-10 bg-slate-900 border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h3 className="text-3xl font-black text-white mb-3">
                Potencial de Ahorro: <span className="text-emerald-400">{formatMoney(totalPotentialSavings)}</span>
              </h3>
              <p className="text-slate-400 max-w-xl">
                Nuestro algoritmo experto ha identificado estas mejoras prioritarias para optimizar tu flujo de caja energético.
              </p>
            </div>
            <Button size="lg" className="bg-primary text-white font-black px-10" icon={Calculator}>
              Simular Plan de Ahorro
            </Button>
          </div>
        </Card>

        {/* Modal */}
        <RecommendationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          recommendation={selectedRec}
          onImplement={handleImplement}
        />

      </div>
    </div>
  );
};

export default FinancialImpact;
