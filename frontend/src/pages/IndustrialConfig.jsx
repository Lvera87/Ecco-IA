import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Factory, Building2, MapPin, DollarSign, Zap, Check, ChevronRight, ChevronLeft,
  Sparkles, Target, Thermometer, Cpu, Warehouse,
  Upload, FileText, Scan, Loader2, X,
  Briefcase, Lightbulb, Box
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { industrialApi } from '../api/industrial';
import { settingsApi } from '../api/settings';

// 1. DATA MODELS (CALCO DE RESIDENCIAL ADAPTADO A INDUSTRIA)
const houseTypes = [
  { id: 'planta', name: 'Planta Industrial', icon: Factory },
  { id: 'almacen', name: 'Almacén/Logística', icon: Warehouse },
  { id: 'office', name: 'Corporativo', icon: Building2 },
];

const industrialAssetTypes = [
  'Motor de Inducción',
  'Compresor de Aire',
  'Chiller / Enfriador',
  'Caldera / Vapor',
  'Bomba Centrífuga',
  'Transformador',
  'Sistema HVAC',
  'Iluminación Planta',
  'Maquinaria CNC',
  'Horno Industrial',
  'Cinta Transportadora',
  'Otro'
];

const roomCategories = [
  {
    id: 'production',
    name: 'Producción y Potencia',
    icon: Cpu,
    expertTip: 'Los motores y la calidad de energía definen tu eficiencia operativa.',
    itemsData: [
      { id: 'motors', name: 'Motores de Inducción', desc: 'Sistemas motrices de planta', expertCheck: '¿Más del 50% operan con Variadores de Frecuencia (VFD)?', isHighImpact: true },
      { id: 'power_quality', name: 'Calidad de Energía', desc: 'Transformadores y bancos', expertCheck: '¿Cuentan con filtros de armónicos activos y bancos de condensadores?', isHighImpact: true },
      { id: 'compressors', name: 'Aire Comprimido', desc: 'Compresores industriales', expertCheck: '¿Cuentan con controlador de secuencia para múltiples unidades?', isHighImpact: true },
    ]
  },
  {
    id: 'hvac',
    name: 'Climatización Crítica',
    icon: Thermometer,
    expertTip: 'El enfriamiento mal gestionado es la mayor fuga térmica de presupuesto.',
    itemsData: [
      { id: 'chillers', name: 'Chillers Centrales', desc: 'Sistemas de refrigeración', expertCheck: '¿Utilizan bombeo de caudal variable (VPD)?', isHighImpact: true },
      { id: 'cooling_towers', name: 'Torres de Enfriamiento', desc: 'Disipación de calor', expertCheck: '¿Los motores son de alta eficiencia (IE3/IE4)?', isHighImpact: false },
      { id: 'boilers', name: 'Calderas / Vapor', desc: 'Sistemas térmicos', expertCheck: '¿Tienen sistema de recuperación de calor de purgas?', isHighImpact: true },
    ]
  },
  {
    id: 'lighting',
    name: 'Iluminación y Gestión',
    icon: Lightbulb,
    expertTip: 'El control automatizado reduce el gasto pasivo en un 40%.',
    itemsData: [
      { id: 'high_bay', name: 'Bahías de Carga (LED)', desc: 'Techos de gran altura', expertCheck: '¿Integran sensores de luz natural (Daylight Harvesting)?', isHighImpact: true },
      { id: 'scada_bms', name: 'Sistemas SCADA/BMS', desc: 'Monitoreo centralizado', expertCheck: '¿El sistema reporta consumo por línea de proceso en tiempo real?', isHighImpact: true },
    ]
  }
];

const IndustrialConfig = () => {
  const navigate = useNavigate();
  const { setUserProfile, updateGoals } = useApp();

  // UI STATES (IDENTICOS A RESIDENCIAL)
  const [step, setStep] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [activeZone, setActiveZone] = useState('production');
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    houseType: 'planta',
    occupants: 1,
    area: 500,
    city: '',
    monthlyBill: '',
    averageKwh: '',
    budgetTarget: '',
    energy_cost_per_kwh: 0.15,
    currency_code: 'USD',
    inventory: [
      { name: 'Motor Línea 1', asset_type: 'Motor de Inducción', nominal_power_kw: 15.5, daily_usage_hours: 12, op_days_per_month: 22, load_factor: 0.75, power_factor: 0.85, location: 'Producción', efficiency_percentage: 88 }
    ],
  });

  const [saving, setSaving] = useState(false);

  const addInventoryRow = () => {
    setFormData(prev => ({
      ...prev,
      inventory: [
        ...prev.inventory,
        { name: '', asset_type: 'Motor de Inducción', nominal_power_kw: '', daily_usage_hours: '', op_days_per_month: 22, load_factor: 0.75, power_factor: 0.85, location: '', efficiency_percentage: 85 }
      ]
    }));
  };

  const removeInventoryRow = (index) => {
    setFormData(prev => ({
      ...prev,
      inventory: prev.inventory.filter((_, i) => i !== index)
    }));
  };

  const updateInventoryRow = (index, field, value) => {
    setFormData(prev => {
      const newInventory = [...prev.inventory];
      newInventory[index] = { ...newInventory[index], [field]: value };
      return { ...prev, inventory: newInventory };
    });
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleFinish();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = async () => {
    try {
      setSaving(true);
      // Validar y limpiar inventario
      const validAssets = formData.inventory.filter(a => a.name && a.nominal_power_kw > 0);

      if (validAssets.length > 0) {
        await industrialApi.createAssetBatch(validAssets);
      }

      setUserProfile(prev => ({
        ...prev,
        type: 'industrial',
        config: { ...formData, isIndustrial: true }
      }));

      if (formData.budgetTarget || formData.energy_cost_per_kwh) {
        await settingsApi.updateSettings({
          company_name: formData.houseType === 'planta' ? 'Planta Principal' : 'Instalación Industrial',
          industry_sector: formData.houseType,
          monthly_budget_limit: parseFloat(formData.budgetTarget) || 50000.0,
          energy_cost_per_kwh: parseFloat(formData.energy_cost_per_kwh) || 0.15,
          currency_code: formData.currency_code || 'USD'
        });
        updateGoals({ monthlyBudget: parseFloat(formData.budgetTarget) });
      }

      navigate('/industrial-dashboard');
    } catch (error) {
      console.error("Error saving records:", error);
      alert("Error al guardar los equipos. Por favor reintenta.");
    } finally {
      setSaving(false);
    }
  };

  const toggleAppliance = (id) => {
    setFormData(prev => {
      const apps = prev.appliances.includes(id)
        ? prev.appliances.filter(a => a !== id)
        : [...prev.appliances, id];
      return { ...prev, appliances: apps };
    });
  };

  const handleSimulateScan = () => {
    setIsUploading(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        monthlyBill: '4500000',
        averageKwh: '5200',
        city: 'medellin'
      }));
      setIsUploading(false);
      setStep(1);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-body text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-slate-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-3xl relative z-10">
        {/* Header & Progress */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            Configuración Industrial
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            {step === 0 ? 'Carga tu Recibo Industrial' : 'Personaliza tu Planta'}
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            {step === 0
              ? 'Déjanos extraer la información difícil por ti. Escanea tu factura y ahorra tiempo.'
              : 'Ayúdanos a calibrar EcoIA para ofrecerte las mejores recomendaciones industriales.'}
          </p>
        </div>

        {/* Progress Bar */}
        {step > 0 && (
          <div className="mb-12 animate-fadeIn">
            <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 px-1">
              <span className={step >= 1 ? "text-blue-400" : ""}>Perfil</span>
              <span className={step >= 2 ? "text-blue-400" : ""}>Consumo</span>
              <span className={step >= 3 ? "text-blue-400" : ""}>Equipos</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Content Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden transition-all duration-300">

          {/* Step 0: Upload Receipt */}
          {step === 0 && (
            <div className="animate-fadeIn space-y-8 text-center">
              {isUploading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                    <Scan size={64} className="text-blue-400 animate-pulse relative z-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Analizando Recibo Industrial...</h3>
                  <Loader2 className="animate-spin text-blue-500 mt-4" size={32} />
                </div>
              ) : (
                <>
                  <div
                    className="border-2 border-dashed border-slate-700 rounded-2xl p-10 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
                    onClick={handleSimulateScan}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="size-20 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload size={32} className="text-blue-400" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white">Sube una foto de tu factura</h3>
                        <p className="text-slate-400">Extraemos consumos y cargos de potencia</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-4 text-slate-400 hover:text-white font-bold hover:bg-slate-800/50 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Ingresar datos manualmente
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 1: Profile */}
          {step === 1 && (
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                <Factory size={28} className="text-blue-400" />
                Perfil Industrial
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">Ciudad</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none"
                  >
                    <option value="">Selecciona...</option>
                    <option value="bogota">Bogotá</option>
                    <option value="medellin">Medellín</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">Área (m²)</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {houseTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setFormData({ ...formData, houseType: type.id })}
                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all
                                            ${formData.houseType === type.id ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-800'}`}
                  >
                    <type.icon size={32} />
                    <span className="font-bold">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Consumption */}
          {step === 2 && (
            <div className="space-y-8 animate-fadeIn">
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                <Target className="text-blue-400" size={28} />
                Consumo y Metas
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">Consumo (kWh/mes)</label>
                  <div className="relative">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
                    <input
                      type="number"
                      value={formData.averageKwh}
                      onChange={(e) => setFormData({ ...formData, averageKwh: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold text-xl outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">Factura Promedio</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
                    <input
                      type="number"
                      value={formData.monthlyBill}
                      onChange={(e) => setFormData({ ...formData, monthlyBill: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold text-xl outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">Costo Energy (per kWh)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.energy_cost_per_kwh}
                      onChange={(e) => setFormData({ ...formData, energy_cost_per_kwh: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold text-xl outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">Moneda</label>
                  <select
                    value={formData.currency_code}
                    onChange={(e) => setFormData({ ...formData, currency_code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none h-[62px]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="COP">COP ($)</option>
                    <option value="MXN">MXN ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Global Asset Inventory */}
          {step === 3 && (
            <div className="animate-fadeIn space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                    <Box className="text-blue-400" size={28} />
                    Inventario de Activos
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">Describe los equipos críticos de tu planta para un análisis detallado.</p>
                </div>
                <Button
                  onClick={addInventoryRow}
                  variant="ghost"
                  className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                >
                  + Agregar Equipo
                </Button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/30">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800">
                      <th className="px-6 py-4">Nombre / Tag</th>
                      <th className="px-4 py-4">Tipo</th>
                      <th className="px-4 py-4">kW</th>
                      <th className="px-4 py-4">Uso (h/d)</th>
                      <th className="px-4 py-4">Días/Mes</th>
                      <th className="px-4 py-4">Carga (%)</th>
                      <th className="px-4 py-4">PF (cos φ)</th>
                      <th className="px-4 py-4">Ubicación</th>
                      <th className="px-4 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {formData.inventory.map((item, idx) => (
                      <tr key={idx} className="group hover:bg-slate-900/40 transition-colors">
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            placeholder="Ej: Extrusora Principal"
                            value={item.name}
                            onChange={(e) => updateInventoryRow(idx, 'name', e.target.value)}
                            className="w-full bg-transparent border-none text-white focus:ring-0 placeholder:text-slate-700 font-medium"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={item.asset_type}
                            onChange={(e) => updateInventoryRow(idx, 'asset_type', e.target.value)}
                            className="bg-transparent border-none text-blue-400 text-sm focus:ring-0 appearance-none cursor-pointer font-bold"
                          >
                            {industrialAssetTypes.map(type => (
                              <option key={type} value={type} className="bg-slate-900 text-white">{type}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            placeholder="0.0"
                            value={item.nominal_power_kw}
                            onChange={(e) => updateInventoryRow(idx, 'nominal_power_kw', parseFloat(e.target.value))}
                            className="w-20 bg-transparent border-none text-white focus:ring-0 placeholder:text-slate-700"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            placeholder="24"
                            max="24"
                            value={item.daily_usage_hours}
                            onChange={(e) => updateInventoryRow(idx, 'daily_usage_hours', parseFloat(e.target.value))}
                            className="w-16 bg-transparent border-none text-white focus:ring-0 placeholder:text-slate-700"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            placeholder="22"
                            value={item.op_days_per_month}
                            onChange={(e) => updateInventoryRow(idx, 'op_days_per_month', parseInt(e.target.value))}
                            className="w-12 bg-transparent border-none text-white focus:ring-0 placeholder:text-slate-700"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.75"
                            value={item.load_factor}
                            onChange={(e) => updateInventoryRow(idx, 'load_factor', parseFloat(e.target.value))}
                            className="w-16 bg-transparent border-none text-emerald-400 focus:ring-0 placeholder:text-slate-700 font-bold"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.85"
                            value={item.power_factor}
                            onChange={(e) => updateInventoryRow(idx, 'power_factor', parseFloat(e.target.value))}
                            className="w-16 bg-transparent border-none text-blue-400 focus:ring-0 placeholder:text-slate-700 font-bold"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            placeholder="Zona A"
                            value={item.location}
                            onChange={(e) => updateInventoryRow(idx, 'location', e.target.value)}
                            className="w-full bg-transparent border-none text-slate-400 focus:ring-0 placeholder:text-slate-700 text-xs"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => removeInventoryRow(idx)}
                            className="p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {formData.inventory.length === 0 && (
                <div className="py-12 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-slate-500 font-medium">No has agregado equipos todavía.</p>
                  <button onClick={addInventoryRow} className="mt-2 text-blue-500 font-bold hover:underline">
                    + Agregar el primer equipo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Actions */}
          <div className="pt-10 mt-6 border-t border-slate-800 flex items-center justify-between">
            {step > 0 && (
              <button onClick={handleBack} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors text-slate-400 hover:text-white hover:bg-slate-800">
                <ChevronLeft size={20} /> Atrás
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={saving}
              className={`flex items-center gap-3 bg-blue-600 hover:bg-blue-400 text-white px-8 py-4 rounded-xl font-black text-lg shadow-lg shadow-blue-500/20 ml-auto transition-all ${saving ? 'opacity-50 cursor-wait' : ''}`}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Guardando...
                </>
              ) : (
                <>
                  {step === totalSteps ? 'Finalizar Configuración' : 'Siguiente Paso'}
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IndustrialConfig;
