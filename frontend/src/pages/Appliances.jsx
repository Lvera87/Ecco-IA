import React, { useState } from 'react';
import {
  Wind, Tv, Speaker, Lamp, Zap, Plus, Search,
  Filter, Trash2, Edit3, CheckCircle2, AlertTriangle,
  Flame, Cloud, DollarSign, TrendingDown, Info, ShieldAlert,
  Loader2
} from 'lucide-react';
import { residentialApi } from '../api/residential';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import InsightCard from '../components/ui/InsightCard';
import EmptyState from '../components/ui/EmptyState';
import AddApplianceModal from '../components/ui/AddApplianceModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { useApp } from '../context/AppContext';
import { useEnergyMath } from '../hooks/useEnergyMath';

const Appliances = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [applianceToDelete, setApplianceToDelete] = useState(null);

  const {
    iconMap, removeAppliance, toggleAppliance,
    addNotification, syncDashboardData, isSyncing
  } = useApp();


  React.useEffect(() => {
    syncDashboardData();
  }, []);

  const {
    enrichedAppliances, totalNominalKwh, totalMonthlyCost,
    vampireMoneyLost, formatMoney
  } = useEnergyMath();

  const filteredAppliances = enrichedAppliances.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === 'active' && app.status) ||
      (filter === 'inactive' && !app.status) ||
      (filter === 'warning' && app.warning);
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id) => {
    await removeAppliance(id);
    setApplianceToDelete(null);
    addNotification({
      type: 'info',
      title: 'Dispositivo eliminado',
      message: 'El inventario ha sido actualizado.'
    });
  };

  const handleToggle = (id) => {
    toggleAppliance(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pt-6">
      <div className="max-w-[1600px] mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Inventario Energético</h1>
            <p className="text-slate-500 dark:text-slate-400">Gestiona los dispositivos que impactan tu factura mensual.</p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary text-white font-bold px-6"
            icon={Plus}
          >
            Nuevo Dispositivo
          </Button>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Consumo Nominal"
            value={totalNominalKwh.toFixed(1)}
            unit="kWh"
            icon={Zap}
            color="primary"
          />
          <StatCard
            title="Costo Operativo"
            value={formatMoney(totalMonthlyCost)}
            unit="/ mes"
            icon={DollarSign}
            color="emerald"
          />
          <StatCard
            title="Fuga Ineficiente"
            value={formatMoney(vampireMoneyLost)}
            unit="/ mes"
            icon={TrendingDown}
            color={vampireMoneyLost > 25000 ? "red" : "amber"}
          />
        </div>

        {/* Alert Zone (Experimental) */}
        {enrichedAppliances.some(a => a.warning) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrichedAppliances.filter(a => a.warning).slice(0, 2).map((app, idx) => (
              <InsightCard
                key={idx}
                icon={ShieldAlert}
                title={`Alerta de Ineficiencia: ${app.name}`}
                description={app.warning}
                action="Ver detalles técnicos"
                onClick={() => addNotification({ type: 'info', title: 'Análisis Experto', message: `Estamos analizando el ciclo de vida de tu ${app.name}.` })}
              />
            ))}
          </div>
        )}

        {/* Filters & Content */}
        <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar dispositivo..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/50 transition-all dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'active', label: 'Encendidos' },
                { id: 'warning', label: 'Alertas' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilter(opt.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === opt.id
                    ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredAppliances.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispositivo</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Salud</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Costo Estimado</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppliances.map((app) => {
                    const AppIcon = iconMap?.[app.icon] || Wind;
                    return (
                      <tr key={app.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                              <AppIcon size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white">{app.name}</p>
                              <p className="text-xs text-slate-500">{app.consumption} kWh / hora</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleToggle(app.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${app.status ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${app.status ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                              />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${app.expertStatus === 'Excellent' ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                            app.expertStatus === 'Warning' ? 'bg-amber-100 text-amber-600 border-amber-200' :
                              'bg-red-100 text-red-600 border-red-200'
                            }`}>
                            {app.expertStatus === 'Excellent' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                            {app.expertStatus === 'Excellent' ? 'Óptimo' : 'Crítico'}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right font-black text-slate-800 dark:text-white">
                          {formatMoney(app.monthlyCost)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => setApplianceToDelete(app)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-20">
                <EmptyState
                  title="No hay dispositivos"
                  description="Ajusta los filtros o agrega un nuevo dispositivo a tu inventario."
                  actionText="Agregar Dispositivo"
                  onAction={() => setIsAddModalOpen(true)}
                />
              </div>
            )}
          </div>
        </Card>
      </div>

      <AddApplianceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={!!applianceToDelete}
        onClose={() => setApplianceToDelete(null)}
        onConfirm={() => handleDelete(applianceToDelete.id)}
        title="Eliminar Dispositivo"
        message={`¿Estás seguro de eliminar "${applianceToDelete?.name}"? Esto afectará los cálculos de proyección.`}
      />
    </div>
  );
};

export default Appliances;
