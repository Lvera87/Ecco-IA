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

// 1. DATA MODELS (CALCO DE RESIDENCIAL ADAPTADO A INDUSTRIA)
const houseTypes = [
  { id: 'planta', name: 'Planta Industrial', icon: Factory },
  { id: 'almacen', name: 'Almacén/Logística', icon: Warehouse },
  { id: 'office', name: 'Corporativo', icon: Building2 },
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
    appliances: ['motors', 'chillers'],
    applianceDetails: {},
  });

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else handleFinish();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = () => {
    setUserProfile(prev => ({
      ...prev,
      type: 'industrial',
      config: { ...formData, isIndustrial: true }
    }));
    if (formData.budgetTarget) {
      updateGoals({ monthlyBudget: parseFloat(formData.budgetTarget) });
    }
    navigate('/industrial-dashboard');
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
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">Presupuesto Objetivo</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
                  <input
                    type="number"
                    value={formData.budgetTarget}
                    onChange={(e) => setFormData({ ...formData, budgetTarget: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold text-xl outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Zones */}
          {step === 3 && (
            <div className="animate-fadeIn h-full flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3 space-y-2">
                <h2 className="text-xl font-bold text-white mb-2">Secciones</h2>
                {roomCategories.map((zone) => {
                  const isActive = activeZone === zone.id;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => setActiveZone(zone.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all
                                                ${isActive ? 'bg-blue-500/10 border-blue-500 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400'}`}
                    >
                      <div className="flex items-center gap-3">
                        <zone.icon size={20} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                        <span className="font-bold text-sm">{zone.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="md:w-2/3 bg-slate-950/50 rounded-2xl border border-slate-800 p-6 relative">
                {roomCategories.find(z => z.id === activeZone)?.itemsData.map(item => {
                  const isSelected = formData.appliances.includes(item.id);
                  return (
                    <div key={item.id} className={`p-4 rounded-xl border mb-3 transition-all ${isSelected ? 'bg-slate-900 border-blue-500/50' : 'bg-slate-900/20 border-slate-800'}`}>
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleAppliance(item.id)}
                          className={`mt-1 size-6 rounded border flex items-center justify-center shrink-0 transition-all
                                                        ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-600 hover:border-blue-500'}`}
                        >
                          {isSelected && <Check size={14} strokeWidth={4} />}
                        </button>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-white" onClick={() => toggleAppliance(item.id)}>{item.name}</div>
                          <p className="text-[10px] text-slate-500">{item.desc}</p>
                          {isSelected && item.expertCheck && (
                            <div className="mt-3 pl-3 border-l-2 border-slate-700">
                              <label className="flex items-center gap-3 text-xs text-slate-300">
                                <input
                                  type="checkbox"
                                  className="accent-blue-500 size-4 rounded"
                                  checked={formData.applianceDetails[item.id] || false}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    applianceDetails: { ...prev.applianceDetails, [item.id]: e.target.checked }
                                  }))}
                                />
                                {item.expertCheck}
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-400 text-white px-8 py-4 rounded-xl font-black text-lg shadow-lg shadow-blue-500/20 ml-auto"
            >
              {step === totalSteps ? 'Finalizar' : 'Siguiente Paso'}
              <ChevronRight size={20} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default IndustrialConfig;
