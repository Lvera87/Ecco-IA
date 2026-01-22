import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Factory, Building2, Warehouse, Store, GraduationCap, Truck,
  ChevronRight, ChevronLeft, Shield, Sparkles, Check, Zap,
  Settings, Users, MapPin, Calendar, Refrigerator, AirVent, Lightbulb
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useApp } from '../context/AppContext';

// Step Indicator Component
const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex flex-col gap-3 mb-8">
    <div className="flex justify-between items-end">
      <div>
        <span className="text-blue-500 font-bold text-sm uppercase tracking-wider">
          Paso {currentStep} de {totalSteps}
        </span>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Configuración Inicial</p>
      </div>
      <p className="text-2xl font-black text-blue-500">{Math.round((currentStep / totalSteps) * 100)}%</p>
    </div>
    <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-500"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
  </div>
);

// Sector Card Component
const SectorCard = ({ icon: Icon, name, description, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`group cursor-pointer p-5 border-2 rounded-xl flex gap-4 transition-all
      ${selected
        ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10'
        : 'border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-800/50 bg-white dark:bg-slate-900/30'}`}
  >
    <div className={`size-12 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110
      ${selected ? 'bg-blue-500 text-white' : 'bg-blue-500/10 text-blue-500'}`}>
      <Icon size={28} />
    </div>
    <div className="space-y-1 flex-1">
      <div className="flex justify-between items-center">
        <h4 className="font-bold text-lg text-slate-800 dark:text-white">{name}</h4>
        {selected && (
          <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center">
            <Check size={14} className="text-white" />
          </div>
        )}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

// Facility Type Card
const FacilityCard = ({ icon: Icon, name, description, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`group cursor-pointer p-5 border-2 rounded-xl flex gap-4 transition-all
      ${selected
        ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-500/10'
        : 'border-slate-200 dark:border-slate-700 hover:border-blue-500/50 bg-white dark:bg-slate-900/30'}`}
  >
    <div className={`size-12 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110
      ${selected ? 'bg-blue-500 text-white' : 'bg-blue-500/10 text-blue-500'}`}>
      <Icon size={28} />
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-lg text-slate-800 dark:text-white">{name}</h4>
      <p className="text-slate-500 dark:text-slate-400 text-sm">{description}</p>
    </div>
  </div>
);

const IndustrialConfig = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // Form state
  const [formData, setFormData] = useState({
    sector: 'manufactura',
    facilityType: 'oficina',
    companyName: '',
    employees: '',
    area: '',
    operatingHours: '8',
  });

  // Sectors data
  const sectors = [
    { id: 'manufactura', icon: Factory, name: 'Manufactura e Industria Pesada', description: 'Instalaciones de producción masiva, manufactura y procesos químicos.' },
    { id: 'salud', icon: Building2, name: 'Salud y Biotecnología', description: 'Hospitales, clínicas, laboratorios y centros de investigación médica.' },
    { id: 'comercio', icon: Store, name: 'Comercio y Retail', description: 'Tiendas, supermercados, centros comerciales y puntos de venta.' },
    { id: 'educacion', icon: GraduationCap, name: 'Educación e Investigación', description: 'Universidades, colegios, centros de formación y laboratorios.' },
    { id: 'logistica', icon: Truck, name: 'Logística y Transporte', description: 'Almacenes, centros de distribución y flotas de transporte.' },
  ];

  // Facility types
  const facilityTypes = [
    { id: 'planta', icon: Factory, name: 'Planta Industrial', description: 'Instalaciones de producción masiva' },
    { id: 'oficina', icon: Building2, name: 'Oficina', description: 'Espacios administrativos y corporativos' },
    { id: 'almacen', icon: Warehouse, name: 'Almacén', description: 'Centros de logística y almacenamiento' },
    { id: 'comercial', icon: Store, name: 'Centro Comercial', description: 'Espacios de retail y comercio' },
  ];

  const { setUserProfile, addNotification } = useApp();

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      setUserProfile({
        type: 'industrial',
        config: formData
      });
      addNotification({
        type: 'success',
        title: 'Perfil Industrial Configurado',
        message: 'Bienvenido a EccoIA Enterprise.'
      });
      navigate('/industrial-dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body">
      <main className="py-10 px-6">
        <div className="max-w-[800px] w-full mx-auto space-y-8">
          {/* Progress Indicator */}
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

          {/* Page Heading */}
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tight leading-tight text-slate-800 dark:text-white">
              Configuración de Perfil Industrial
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
              Personalice su experiencia definiendo el sector económico y las características de sus instalaciones principales.
            </p>
          </div>

          {/* Step 1: Sector Selection */}
          {currentStep === 1 && (
            <div className="space-y-8">
              {/* Sector Dropdown */}
              <Card className="p-6">
                <label className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Settings className="text-blue-500" size={20} />
                    <span className="text-slate-800 dark:text-white font-bold text-lg">Sector Económico</span>
                  </div>
                  <div className="relative">
                    <select
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      className="appearance-none block w-full px-4 py-4 pr-10 text-base border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all dark:text-white"
                    >
                      <option value="" disabled>Seleccione el sector de su empresa...</option>
                      <option value="manufactura">🏭 Manufactura e Industria Pesada</option>
                      <option value="salud">🏥 Salud y Biotecnología</option>
                      <option value="comercio">🛍️ Comercio y Retail</option>
                      <option value="educacion">🎓 Educación e Investigación</option>
                      <option value="logistica">🚚 Logística y Transporte</option>
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={20} />
                  </div>
                </label>
              </Card>

              {/* Facility Type */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Building2 className="text-blue-500" size={20} />
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Tipo de Instalación</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {facilityTypes.map(facility => (
                    <FacilityCard
                      key={facility.id}
                      {...facility}
                      selected={formData.facilityType === facility.id}
                      onClick={() => setFormData({ ...formData, facilityType: facility.id })}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Operational Metrics */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                  <h1 className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">Métricas Operativas</h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Defina los parámetros clave para el análisis de eficiencia energética por IA.</p>
                </div>

                <div className="p-8 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Monthly Consumption */}
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wide">Consumo Mensual Promedio (kWh)</label>
                      <div className="relative group">
                        <input
                          type="number"
                          placeholder="Ej. 15000"
                          value={formData.consumption || ''}
                          onChange={(e) => setFormData({ ...formData, consumption: e.target.value })}
                          className="w-full h-14 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all px-4 pr-16 text-lg font-semibold text-slate-900 dark:text-white"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">kWh</div>
                      </div>
                      <p className="text-xs text-slate-500">Basado en su última factura de suministro.</p>
                    </div>

                    {/* Operational Area */}
                    <div className="flex flex-col gap-2">
                      <label className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wide">Área Operativa Total (m²)</label>
                      <div className="relative group">
                        <input
                          type="number"
                          placeholder="Ej. 500"
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                          className="w-full h-14 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all px-4 pr-16 text-lg font-semibold text-slate-900 dark:text-white"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">m²</div>
                      </div>
                      <p className="text-xs text-slate-500">Incluyendo áreas de producción y almacén.</p>
                    </div>

                    {/* Shifts */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wide">Número de Turnos de Trabajo</label>
                      <div className="flex flex-wrap gap-4 mt-1">
                        {[
                          { id: '1', label: '1 Turno', icon: 'sunny' },
                          { id: '2', label: '2 Turnos', icon: 'schedule' },
                          { id: '3', label: '3 Turnos (24/7)', icon: 'nights_stay' }
                        ].map(shift => (
                          <button
                            key={shift.id}
                            onClick={() => setFormData({ ...formData, shifts: shift.id })}
                            className={`flex-1 min-w-[100px] h-14 border-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                              ${formData.shifts === shift.id
                                ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-500/50'}`}
                          >
                            <span>{shift.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Major Loads */}
                  <div className="pt-6">
                    <h4 className="text-slate-900 dark:text-white text-lg font-bold mb-6 flex items-center gap-2">
                      <Zap className="text-blue-500" size={24} />
                      Principales Cargas Energéticas
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { id: 'heavy_machinery', label: 'Maquinaria Pesada', icon: Factory },
                        { id: 'hvac', label: 'HVAC (Climatización)', icon: AirVent },
                        { id: 'lighting', label: 'Iluminación Industrial', icon: Lightbulb },
                        { id: 'cooling', label: 'Refrigeración a gran escala', icon: Refrigerator } // Assuming Refrigerator is imported
                      ].map(load => (
                        <div key={load.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                          <div className="flex items-center gap-4">
                            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
                              <load.icon size={20} />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">{load.label}</span>
                          </div>
                          <div className="relative inline-block w-12 align-middle">
                            <input
                              type="checkbox"
                              checked={formData.loads?.[load.id] || false}
                              onChange={(e) => setFormData({
                                ...formData,
                                loads: { ...formData.loads, [load.id]: e.target.checked }
                              })}
                              className="accent-blue-500 w-5 h-5"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-10 flex flex-col md:flex-row gap-4 items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 italic">
              * Todos los datos son tratados bajo normativas de privacidad industrial.
            </p>
            <div className="flex gap-4">
              {currentStep > 1 && (
                <Button variant="ghost" size="lg" onClick={handleBack}>
                  <ChevronLeft size={20} />
                  Anterior
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="min-w-[200px] bg-blue-500 hover:bg-blue-600 text-white py-4 px-8 shadow-lg shadow-blue-500/20"
              >
                {currentStep === totalSteps ? 'Finalizar' : 'Siguiente'}
                {currentStep === totalSteps ? <Sparkles size={20} /> : <ChevronRight size={20} />}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-slate-200 dark:border-slate-800 mt-10">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
          EccoIA Industrial Wizard v2.4
        </p>
      </footer>
    </div>
  );
};

export default IndustrialConfig;
