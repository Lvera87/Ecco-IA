import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Factory, Building2, Warehouse, Zap, ChevronRight,
  Sparkles, Loader2, Briefcase
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import Button from '../components/ui/Button';
import { industrialApi } from '../api/industrial';

// Sectores Industriales (correspondientes a Sector_ID del modelo)
const industrialSectors = [
  { id: 1, name: 'Minas y Canteras', icon: Factory },
  { id: 2, name: 'Suministro Electricidad/Gas', icon: Zap },
  { id: 3, name: 'Distribución de Agua', icon: Building2 },
  { id: 4, name: 'Industrias Manufactureras', icon: Factory },
  { id: 5, name: 'Salud y Asistencia Social', icon: Briefcase },
  { id: 6, name: 'Construcción', icon: Building2 },
  { id: 7, name: 'Alojamiento y Comida', icon: Warehouse },
  { id: 8, name: 'Comercio al por Mayor/Menor', icon: Warehouse },
  { id: 9, name: 'Información y Comunicaciones', icon: Briefcase },
  { id: 10, name: 'Educación', icon: Building2 },
  { id: 11, name: 'Actividades Financieras', icon: Briefcase },
  { id: 12, name: 'Servicios Administrativos', icon: Briefcase },
  { id: 13, name: 'Actividades Profesionales/Cient.', icon: Briefcase },
  { id: 14, name: 'Inmobiliarias', icon: Building2 },
  { id: 15, name: 'Admin. Pública y Defensa', icon: Building2 },
  { id: 16, name: 'Arte y Entretenimiento', icon: Sparkles },
  { id: 17, name: 'Otras Actividades de Servicios', icon: Briefcase },
];

const IndustrialConfig = () => {
  const navigate = useNavigate();
  const { setUserProfile } = useUser();

  const [formData, setFormData] = useState({
    sector_id: 1,        // Sector_ID del modelo
    consumo_total: '',   // Consumo_Total (kWh/mes)
    area_m2: '',         // Area_m2 (metros cuadrados)
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.consumo_total || parseFloat(formData.consumo_total) <= 0) {
      setError('El consumo total debe ser mayor a 0');
      return;
    }
    if (!formData.area_m2 || parseFloat(formData.area_m2) <= 0) {
      setError('El área debe ser mayor a 0');
      return;
    }

    try {
      setSaving(true);

      // Preparar datos para la predicción
      const predictionData = {
        sector_id: formData.sector_id,
        consumo_total: parseFloat(formData.consumo_total),
        area_m2: parseFloat(formData.area_m2),
        tarifa_kwh: 850 // Tarifa promedio COP
      };

      // Guardar en Backend (Persistencia Real)
      try {
        await industrialApi.updateSettings({
          sector_id: formData.sector_id,
          baseline_consumption_kwh: parseFloat(formData.consumo_total),
          area_m2: parseFloat(formData.area_m2)
        });
      } catch (saveErr) {
        console.warn("No se pudo guardar la config en backend, usando solo estado local", saveErr);
      }

      console.log("DEBUG: Navegando...");

      // Navegación forzada (Hard Navigation) para evitar problemas de estado React
      const params = new URLSearchParams({
        sector_id: formData.sector_id,
        consumo_total: formData.consumo_total,
        area_m2: formData.area_m2
      });

      // Usamos window.location para asegurar un refresh limpio del estado
      window.location.assign(`/industrial-dashboard?${params.toString()}`);
    } catch (err) {
      console.error("Error saving config:", err);
      setError("Error al guardar la configuración. Por favor reintenta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-body text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-slate-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles size={14} className="mr-2" />
            Configuración Industrial
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Configura tu Planta
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Ingresa los datos de tu instalación industrial para recibir un análisis personalizado de eficiencia energética.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit}>
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">

            <div className="space-y-8">
              {/* 1. Sector Industrial */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <Factory size={16} className="text-blue-400" />
                  Sector Industrial
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {industrialSectors.map(sector => (
                    <button
                      key={sector.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, sector_id: sector.id })}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-left
                        ${formData.sector_id === sector.id
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-800 hover:border-slate-700'}`}
                    >
                      <sector.icon size={18} className="shrink-0" />
                      <span className="font-medium text-xs leading-tight">{sector.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Consumo Total */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <Zap size={16} className="text-yellow-400" />
                  Consumo Total Mensual
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.consumo_total}
                    onChange={(e) => setFormData({ ...formData, consumo_total: e.target.value })}
                    placeholder="Ej: 15000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-4 pr-20 text-white font-bold text-xl outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    kWh/mes
                  </span>
                </div>
                <p className="text-xs text-slate-600">Consumo eléctrico promedio de tu instalación</p>
              </div>

              {/* 3. Área */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <Building2 size={16} className="text-emerald-400" />
                  Área de la Instalación
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.area_m2}
                    onChange={(e) => setFormData({ ...formData, area_m2: e.target.value })}
                    placeholder="Ej: 2500"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-4 pr-16 text-white font-bold text-xl outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    m²
                  </span>
                </div>
                <p className="text-xs text-slate-600">Superficie total de la planta o instalación</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-10 mt-6 border-t border-slate-800">
              <Button
                type="submit"
                disabled={saving}
                className={`w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-5 rounded-xl font-black text-lg shadow-lg shadow-blue-500/20 transition-all ${saving ? 'opacity-50 cursor-wait' : ''}`}
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Analizando...
                  </>
                ) : (
                  <>
                    Analizar Instalación
                    <ChevronRight size={20} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-sm mt-6">
          Nuestro modelo de IA analizará tu instalación y generará recomendaciones personalizadas.
        </p>
      </div>
    </div>
  );
};

export default IndustrialConfig;
