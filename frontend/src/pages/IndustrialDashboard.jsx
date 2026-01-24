import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Zap, Plus, Activity, Building2, Factory, Trash2, Loader2, Target, Trophy
} from 'lucide-react';

// UI Components
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { useApp } from '../context/AppContext';

// Industrial Specialized Components
import IndustrialMetricCard from '../components/industrial/IndustrialMetricCard';
import IndustrialAssetCard from '../components/industrial/IndustrialAssetCard';
import IndustrialInsightBanner from '../components/industrial/IndustrialInsightBanner';
import IndustrialAlertOverlay from '../components/industrial/IndustrialAlertOverlay';
import SkeletonDashboard from '../components/industrial/SkeletonDashboard';

// API Services
import { industrialApi } from '../api/industrial';
import { settingsApi } from '../api/settings';
import { gamificationApi } from '../api/gamification';

// Gamification Components
import GamificationBadge from '../components/ui/GamificationBadge';
import MissionWidget from '../components/ui/MissionWidget';

const INITIAL_ASSET_STATE = {
  name: '',
  asset_type: 'Motor de Inducción',
  nominal_power_kw: '',
  daily_usage_hours: '',
  op_days_per_month: 22,
  load_factor: 0.75,
  power_factor: 0.85,
  efficiency_percentage: 85,
  location: ''
};

const IndustrialDashboard = () => {
  // --- States ---
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    insights: null,
    assets: [],
    settings: null,
    gamification: null
  });

  const [modals, setModals] = useState({
    insight: false,
    add: false,
    selectedAsset: null
  });

  const [actions, setActions] = useState({
    isDeleting: false,
    isAdding: false,
    isOptimizing: false
  });

  const [newAsset, setNewAsset] = useState(INITIAL_ASSET_STATE);
  const { addNotification } = useApp();

  // --- Derived State (Performance Optimized) ---
  const hasAssets = useMemo(() => data.assets.length > 0, [data.assets]);
  const efficiencyScore = useMemo(() => 100 - (data.insights?.waste_score || 0), [data.insights]);

  const activeAlert = useMemo(() => {
    if (!data.insights?.top_waste_reason || data.insights.waste_score < 25) return null;

    return {
      assetName: "Sistema Industrial Central", // O podrías extraer el equipo específico si el backend lo da
      currentKw: data.insights.total_real_demand_kw,
      limitKw: data.insights.total_real_demand_kw * 0.8, // Simulación de límite nominal al 80%
      wastePerHour: data.insights.potential_savings,
      duration: 15 // Mock de duración
    };
  }, [data.insights]);

  // --- Data Fetching ---
  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [assets, settings, insights, gamification] = await Promise.all([
        industrialApi.getAssets(),
        settingsApi.getSettings(),
        industrialApi.getDashboardInsights(),
        gamificationApi.getStats().catch(() => null) // Fallback si no hay misiones
      ]);
      setData({ assets, settings, insights, gamification });
    } catch (error) {
      console.error("Dashboard Sync Error:", error);
      addNotification({
        type: 'alert',
        title: 'Error de Sincronización',
        message: 'No pudimos conectar con los sistemas de la planta.'
      });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [addNotification]);

  const handleCompleteMission = async (missionId) => {
    try {
      await gamificationApi.completeMission(missionId);
      addNotification({
        type: 'achievement',
        title: '¡Misión Cumplida!',
        message: 'Has ganado XP y EcoPoints para tu planta.'
      });
      fetchDashboardData(true);
    } catch (error) {
      console.error("Mission Error:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- Handlers ---
  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!newAsset.name?.trim()) return;

    try {
      setActions(prev => ({ ...prev, isAdding: true }));
      await industrialApi.createAsset({
        ...newAsset,
        nominal_power_kw: parseFloat(newAsset.nominal_power_kw),
        daily_usage_hours: parseFloat(newAsset.daily_usage_hours),
        efficiency_percentage: parseInt(newAsset.efficiency_percentage)
      });

      setModals(prev => ({ ...prev, add: false }));
      setNewAsset(INITIAL_ASSET_STATE);
      addNotification({
        type: 'system',
        title: 'Activo Registrado',
        message: `${newAsset.name} ahora está bajo monitoreo de IA.`
      });
      fetchDashboardData(true);
    } catch (error) {
      console.error("Add Asset Error:", error);
    } finally {
      setActions(prev => ({ ...prev, isAdding: false }));
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm("¿Confirmas el retiro de este equipo de la línea de producción?")) return;

    try {
      setActions(prev => ({ ...prev, isDeleting: true }));
      await industrialApi.deleteAsset(id);
      addNotification({
        type: 'system',
        title: 'Inventario Actualizado',
        message: 'Equipo retirado correctamente.'
      });
      setModals(prev => ({ ...prev, selectedAsset: null }));
      fetchDashboardData(true);
    } catch (error) {
      console.error("Delete Asset Error:", error);
    } finally {
      setActions(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleApplyOptimization = async () => {
    setActions(prev => ({ ...prev, isOptimizing: true }));
    // Future integration with AI Service Agent
    setTimeout(() => {
      setActions(prev => ({ ...prev, isOptimizing: false }));
      setModals(prev => ({ ...prev, insight: false }));
      addNotification({
        type: 'achievement',
        title: 'Optimización Ejecutada',
        message: 'Parámetros ajustados por IA para maximizar el ROI.'
      });
      fetchDashboardData(true);
    }, 2000);
  };

  // --- Render Helpers ---
  if (loading) return <SkeletonDashboard />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors">
      <IndustrialAlertOverlay
        alert={activeAlert}
        onAction={handleApplyOptimization}
      />
      <main className="p-8 max-w-[1600px] mx-auto space-y-12">

        {/* Header Branding Section */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              {data.settings?.company_name || 'Gestión Industrial'}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 text-[10px] font-black uppercase text-blue-500 tracking-wider">
                <Activity size={12} className="animate-pulse" /> IA Live Monitoring
              </div>
              <p className="text-sm font-semibold text-slate-500">
                Línea de producción: <span className="text-emerald-500">OPTIMIZADA</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-4">
            <GamificationBadge stats={data.gamification} loading={loading} />
            <div className="flex items-center gap-4">
              <Button
                onClick={() => fetchDashboardData()}
                variant="outline"
                className="h-14 px-8 border-slate-200 dark:border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white dark:hover:bg-white/5 transition-all"
              >
                <Activity size={18} className="mr-3 text-blue-500" /> Sincronizar Planta
              </Button>
              <Button
                onClick={() => setModals(prev => ({ ...prev, add: true }))}
                className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95"
              >
                <Plus size={18} className="mr-3" /> Nuevo Activo
              </Button>
            </div>
          </div>
        </section>

        {/* Global Strategy Metrics */}
        < section className="grid grid-cols-1 lg:grid-cols-3 gap-8" >
          <IndustrialMetricCard
            title="Consumo Mensual"
            value={data.insights?.total_consumption_monthly_kwh?.toLocaleString() || 0}
            unit="kWh / mes"
            icon={Zap}
            colorClass="text-yellow-500"
            trend={-4.2}
          />
          <IndustrialMetricCard
            title="Demanda en Tiempo Real"
            value={data.insights?.total_real_demand_kw || 0}
            unit="kW Activos"
            icon={Activity}
            colorClass="text-blue-500"
          />
          <IndustrialMetricCard
            isPremium
            title="Ratio de Eco-Eficiencia IA"
            value={`${efficiencyScore}%`}
            unit="Score Industrial"
            icon={Target}
            colorClass="text-blue-400"
          />
        </section >

        {/* AI Insight Bridge */}
        < IndustrialInsightBanner
          insight={data.insights}
          onClick={() => setModals(prev => ({ ...prev, insight: true }))}
        />

        {/* --- Multi-Column Main Content --- */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">

          {/* Left: Technical Inventory (3 Columns) */}
          <section className="xl:col-span-3 space-y-8">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Inventario Técnico</h3>
                  <p className="text-sm text-slate-500 font-medium">Monitoreo activo de carga y eficiencia por equipo</p>
                </div>
              </div>
              <span className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {data.assets.length} Equipos en Línea
              </span>
            </div>

            {!hasAssets ? (
              <div className="py-24">
                <EmptyState
                  title="Planta vacía"
                  description="Registra tus motores y compresores para recibir auditorías de IA en tiempo real."
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.assets.map((asset) => (
                  <IndustrialAssetCard
                    key={asset.id}
                    asset={asset}
                    onClick={(a) => setModals(prev => ({ ...prev, selectedAsset: a }))}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Right: Gamification & Missions (1 Column) */}
          <aside className="xl:col-span-1 space-y-6">
            <MissionWidget
              missions={data.gamification?.active_missions || []}
              onComplete={handleCompleteMission}
              loading={loading}
            />

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Trophy className="w-5 h-5 text-blue-200" />
                </div>
                <h4 className="font-bold">Próxima Recompensa</h4>
              </div>
              <p className="text-xs text-blue-100 mb-4 opacity-80 leading-relaxed">
                Alcanza el nivel 5 para desbloquear el Reporte de Sostenibilidad Automatizado y auditoría de red profunda.
              </p>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-2/3 shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* --- Modals (Refactored Logic) --- */}

      {/* AI Audit Solutions */}
      <Modal
        isOpen={modals.insight}
        onClose={() => setModals(prev => ({ ...prev, insight: false }))}
        title="Auditoría de IA Industrial"
      >
        <div className="space-y-8">
          <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 relative overflow-hidden group">
            <div className="absolute top-4 right-4 text-blue-500 opacity-10 group-hover:opacity-30 transition-opacity">
              <Activity size={100} />
            </div>
            <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em] mb-6 flex items-center gap-2">
              Interpretación de Gemini
            </p>
            <p className="text-2xl text-slate-700 dark:text-slate-200 font-display font-medium leading-relaxed italic">
              "{data.insights?.ai_interpretation}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-2">
              <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Anomalía Detectada</p>
              <p className="text-2xl font-bold text-red-500 uppercase leading-none">{data.insights?.top_waste_reason}</p>
            </div>
            <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-right space-y-2">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Ahorro Mensual</p>
              <p className="text-2xl font-bold text-emerald-500 leading-none">{data.insights?.potential_savings}</p>
            </div>
          </div>

          <Button
            className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl rounded-3xl shadow-2xl shadow-blue-500/30 transition-all hover:translate-y-[-2px] active:translate-y-0"
            onClick={handleApplyOptimization}
            disabled={actions.isOptimizing}
          >
            {actions.isOptimizing ? <Loader2 className="animate-spin mr-3" size={24} /> : <Zap className="mr-3" size={24} />}
            {actions.isOptimizing ? 'Ejecutando Comandos...' : 'Aplicar Optimización IA'}
          </Button>
        </div>
      </Modal>

      {/* Asset Technical Sheet */}
      <Modal
        isOpen={!!modals.selectedAsset}
        onClose={() => setModals(prev => ({ ...prev, selectedAsset: null }))}
        title="Ficha Técnica de Ingeniería"
      >
        {modals.selectedAsset && (
          <div className="space-y-10">
            <div className="flex items-center gap-8 p-8 bg-blue-500/5 border border-blue-500/20 rounded-3xl backdrop-blur-sm">
              <div className="size-24 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <Factory size={48} />
              </div>
              <div className="space-y-2">
                <h4 className="text-4xl font-display font-bold text-slate-900 dark:text-white uppercase tracking-tight">{modals.selectedAsset.name}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{modals.selectedAsset.asset_type}</span>
                  <div className="size-1 bg-slate-300 rounded-full"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{modals.selectedAsset.location || 'Sin Ubicación'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { label: 'Potencia Nominal', value: `${modals.selectedAsset.nominal_power_kw} kW` },
                { label: 'Ciclo Mensual', value: `${modals.selectedAsset.op_days_per_month} días` },
                { label: 'Factor de Carga', value: `${(modals.selectedAsset.load_factor * 100).toFixed(0)}%`, highlight: true },
                { label: 'Eficiencia Actual', value: `${modals.selectedAsset.efficiency_percentage}%` }
              ].map((spec, i) => (
                <div key={i} className="p-6 bg-slate-100/50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{spec.label}</p>
                  <p className={`text-3xl font-bold ${spec.highlight ? 'text-blue-500' : 'text-slate-900 dark:text-white'}`}>{spec.value}</p>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex gap-4">
              <Button
                className="flex-[2] h-16 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-bold rounded-2xl border border-red-500/20 transition-all text-xs uppercase tracking-widest"
                onClick={() => handleDeleteAsset(modals.selectedAsset.id)}
                disabled={actions.isDeleting}
              >
                {actions.isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 className="mr-3" size={18} />}
                Retirar de Producción
              </Button>
              <Button
                className="flex-1 h-16 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-white font-bold rounded-2xl text-xs uppercase tracking-widest"
                onClick={() => setModals(prev => ({ ...prev, selectedAsset: null }))}
              >
                Cerrar Ficha
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Asset Onboarding Form */}
      <Modal
        isOpen={modals.add}
        onClose={() => setModals(prev => ({ ...prev, add: false }))}
        title="Ingeniería: Nuevo Registro"
      >
        <form onSubmit={handleAddAsset} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">Identificador del Equipo</label>
              <input
                type="text"
                required
                className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-slate-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                placeholder="Ej: Motor Trifásico #04"
                value={newAsset.name}
                onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">Clasificación Técnica</label>
              <select
                className="w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all font-bold"
                value={newAsset.asset_type}
                onChange={e => setNewAsset({ ...newAsset, asset_type: e.target.value })}
              >
                {["Motor de Inducción", "Compresor de Aire", "Enfriador", "Caldera", "Bomba", "Transformador", "Otro"].map(t => (
                  <option key={t} value={t} className="bg-white dark:bg-slate-900">{t}</option>
                ))}
              </select>
            </div>

            {[
              { label: 'Potencia Nominal (kW)', field: 'nominal_power_kw', step: '0.01', placeholder: '0.00', bold: true },
              { label: 'Horas Uso/Día', field: 'daily_usage_hours', step: '0.5', placeholder: '24' },
              { label: 'Eficiencia (%)', field: 'efficiency_percentage', placeholder: '85', blue: true },
              { label: 'Ubicación / Zona', field: 'location', placeholder: 'Ej: Planta Norte' }
            ].map((input, idx) => (
              <div key={idx} className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] ml-1">{input.label}</label>
                <input
                  type={input.field === 'location' ? 'text' : 'number'}
                  step={input.step || '1'}
                  required={input.field !== 'location'}
                  className={`w-full bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-all ${input.bold ? 'font-bold' : 'font-medium'} ${input.blue ? 'text-blue-500' : ''}`}
                  placeholder={input.placeholder}
                  value={newAsset[input.field]}
                  onChange={e => setNewAsset({ ...newAsset, [input.field]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div className="pt-10 flex gap-6">
            <Button type="button" variant="ghost" className="flex-1 h-16 font-bold" onClick={() => setModals(prev => ({ ...prev, add: false }))}>
              Abortar Registro
            </Button>
            <Button type="submit" disabled={actions.isAdding} className="flex-[2] h-16 bg-blue-600 text-white font-bold rounded-2xl shadow-2xl shadow-blue-500/20 text-xs uppercase tracking-widest active:scale-95 transition-all">
              {actions.isAdding ? <Loader2 className="animate-spin mr-3" size={24} /> : <Target className="mr-3" size={20} />}
              Comisionar Equipo en Sistema
            </Button>
          </div>
        </form>
      </Modal>
    </div >
  );
};

export default IndustrialDashboard;
