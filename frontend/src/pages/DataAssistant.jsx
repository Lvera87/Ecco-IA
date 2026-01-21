import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Zap, Users, Refrigerator, AirVent, Tv, WashingMachine,
  Lightbulb, ChevronRight, ChevronLeft, Shield, Sparkles,
  Check, Building2, Factory
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Step Indicator Component
const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex justify-between items-center mb-12 max-w-2xl mx-auto relative">
    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -z-10" />
    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
      <div
        key={step}
        className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-950 px-4"
      >
        <div className={`size-10 rounded-full border-2 flex items-center justify-center font-bold transition-all
          ${step <= currentStep
            ? 'border-primary text-primary bg-white dark:bg-slate-900'
            : 'border-slate-200 dark:border-slate-700 text-slate-400 bg-white dark:bg-slate-900'}`}
        >
          {step < currentStep ? <Check size={20} /> : step}
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider
          ${step <= currentStep ? 'text-primary' : 'text-slate-400'}`}>
          Paso {step}
        </span>
      </div>
    ))}
  </div>
);

// Number Stepper Component
const NumberStepper = ({ value, onChange, min = 1, max = 20 }) => (
  <div className="flex items-center gap-4">
    <button
      onClick={() => onChange(Math.max(min, value - 1))}
      className="size-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
    >
      -
    </button>
    <span className="text-xl font-bold w-8 text-center text-slate-800 dark:text-white">{value}</span>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      className="size-10 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
    >
      +
    </button>
  </div>
);

// Appliance Toggle Card Component
const ApplianceToggle = ({ icon: Icon, name, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 cursor-pointer transition-all
      ${selected
        ? 'border-primary/50 bg-primary/5 dark:bg-primary/10'
        : 'border-slate-100 dark:border-slate-800 hover:border-primary/30'}`}
  >
    <Icon size={32} className={selected ? 'text-primary' : 'text-slate-400'} />
    <span className={`text-xs font-bold text-center ${selected ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>
      {name}
    </span>
  </div>
);

const DataAssistant = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form state
  const [formData, setFormData] = useState({
    estrato: '3',
    consumoMensual: '',
    personas: 4,
    nevera: true,
    neveraTipo: 'inverter',
    aireAcondicionado: false,
    television: true,
    lavadora: false,
    iluminacion: true,
    calentador: false,
  });

  const appliances = [
    { key: 'aireAcondicionado', name: 'Aire Acondicionado', icon: AirVent },
    { key: 'television', name: 'Televisión', icon: Tv },
    { key: 'lavadora', name: 'Lavadora', icon: WashingMachine },
    { key: 'iluminacion', name: 'Iluminación', icon: Lightbulb },
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Navigate to results
      navigate('/results');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleAppliance = (key) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body text-slate-900 dark:text-slate-100">
      <main className="pt-8 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="font-display text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Configuración de Datos Residencial
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Complete la información para optimizar su consumo energético.
            </p>
          </div>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

          {/* Step 1: Housing Profile */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8">
                <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                  <Home className="text-primary" size={24} />
                  Perfil de Vivienda
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Estrato
                    </label>
                    <select
                      value={formData.estrato}
                      onChange={(e) => setFormData({ ...formData, estrato: e.target.value })}
                      className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary py-3"
                    >
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Consumo Mensual (kWh)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.consumoMensual}
                        onChange={(e) => setFormData({ ...formData, consumoMensual: e.target.value })}
                        placeholder="Ej: 150"
                        className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary focus:border-primary pl-4 pr-16 py-3"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                        kWh
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Número de Personas
                    </label>
                    <NumberStepper
                      value={formData.personas}
                      onChange={(v) => setFormData({ ...formData, personas: v })}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                  <Refrigerator className="text-primary" size={24} />
                  Electrodomésticos
                </h3>
                <div className="space-y-6">
                  {/* Nevera Section */}
                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-200">
                        <Refrigerator size={18} /> Nevera
                      </span>
                      <input
                        type="checkbox"
                        checked={formData.nevera}
                        onChange={() => setFormData({ ...formData, nevera: !formData.nevera })}
                        className="rounded text-primary focus:ring-primary"
                      />
                    </div>
                    {formData.nevera && (
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Tipo de Nevera
                        </label>
                        <select
                          value={formData.neveraTipo}
                          onChange={(e) => setFormData({ ...formData, neveraTipo: e.target.value })}
                          className="w-full text-sm rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                        >
                          <option value="inverter">Tecnología Inverter</option>
                          <option value="tradicional">Tradicional/Antigua</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Other Appliances */}
                  <div className="grid grid-cols-2 gap-4">
                    {appliances.map(appliance => (
                      <ApplianceToggle
                        key={appliance.key}
                        icon={appliance.icon}
                        name={appliance.name}
                        selected={formData[appliance.key]}
                        onClick={() => toggleAppliance(appliance.key)}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 2: Usage Patterns */}
          {currentStep === 2 && (
            <Card className="p-8 max-w-2xl mx-auto">
              <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                <Zap className="text-primary" size={24} />
                Patrones de Uso
              </h3>
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
                    ¿En qué horario usas más energía?
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['Mañana (6-12h)', 'Tarde (12-18h)', 'Noche (18-24h)'].map((time, idx) => (
                      <button
                        key={idx}
                        className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary transition-all text-center"
                      >
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{time}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
                    ¿Cuántas horas al día hay alguien en casa?
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    defaultValue="12"
                    className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between mt-2 text-xs text-slate-400 font-bold">
                    <span>0h</span>
                    <span>12h</span>
                    <span>24h</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
                    ¿Trabajas desde casa?
                  </label>
                  <div className="flex gap-4">
                    <button className="flex-1 p-4 rounded-xl border-2 border-primary bg-primary/5 text-primary font-bold">
                      Sí
                    </button>
                    <button className="flex-1 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:border-slate-300">
                      No
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <Card className="p-8 max-w-2xl mx-auto text-center">
              <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={40} className="text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 text-slate-800 dark:text-white">
                ¡Todo listo para el análisis!
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Hemos recopilado toda la información necesaria. Nuestro sistema de IA analizará tus datos para ofrecerte recomendaciones personalizadas.
              </p>

              {/* Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mb-8 text-left">
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-4">Resumen de datos:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Estrato:</span>
                    <span className="ml-2 font-bold text-slate-800 dark:text-white">{formData.estrato}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Personas:</span>
                    <span className="ml-2 font-bold text-slate-800 dark:text-white">{formData.personas}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Consumo:</span>
                    <span className="ml-2 font-bold text-slate-800 dark:text-white">{formData.consumoMensual || '---'} kWh</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Electrodomésticos:</span>
                    <span className="ml-2 font-bold text-slate-800 dark:text-white">
                      {[formData.nevera, formData.aireAcondicionado, formData.television, formData.lavadora, formData.iluminacion].filter(Boolean).length} activos
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-slate-400 text-sm flex items-center justify-center gap-2 mb-6">
                <Shield size={16} className="text-primary" />
                Tus datos están protegidos y son usados solo para el análisis de EccoIA.
              </p>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 flex flex-col items-center gap-6">
            <div className="flex gap-4">
              {currentStep > 1 && (
                <Button variant="ghost" size="lg" onClick={handleBack} className="px-8">
                  <ChevronLeft size={20} />
                  Anterior
                </Button>
              )}
              <Button
                variant="primary"
                size="lg"
                onClick={handleNext}
                className="px-12 shadow-lg shadow-primary/20"
              >
                {currentStep === totalSteps ? 'Analizar ahora' : 'Siguiente'}
                {currentStep === totalSteps ? <Sparkles size={20} /> : <ChevronRight size={20} />}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataAssistant;
