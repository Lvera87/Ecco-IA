import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Zap, Factory, Lightbulb, Thermometer, Settings2,
  DollarSign, BarChart3, ArrowLeft, Loader2, AlertTriangle,
  TrendingUp, Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { industrialApi } from '../api/industrial';
import { useUser } from '../context/UserContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// Colores para el gráfico
const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6'];

// Nombres de los sectores
const SECTOR_NAMES = {
  1: "Minas y Canteras",
  2: "Suministro Electricidad/Gas",
  3: "Distribución de Agua",
  4: "Industrias Manufactureras",
  5: "Salud y Asistencia Social",
  6: "Construcción",
  7: "Alojamiento y Comida",
  8: "Comercio al por Mayor/Menor",
  9: "Información y Comunicaciones",
  10: "Educación",
  11: "Actividades Financieras",
  12: "Servicios Administrativos",
  13: "Actividades Profesionales/Cient.",
  14: "Inmobiliarias",
  15: "Admin. Pública y Defensa",
  16: "Arte y Entretenimiento",
  17: "Otras Actividades de Servicios",
};

const SECTOR_AVERAGES = {
  1: 1603915, // Minas y Canteras
  2: 173723,  // Suministro Electricidad/Gas
  3: 502228,  // Distribución de Agua
  4: 229845,  // Industrias Manufactureras
  5: 204954,  // Salud y Asistencia Social
  6: 50515,   // Construcción
  7: 83736,   // Alojamiento y Comida
  8: 78315,   // Comercio al por Mayor/Menor
  9: 67853,   // Información y Comunicaciones
  10: 57194,  // Educación
  11: 21866,  // Actividades Financieras
  12: 23493,  // Servicios Administrativos
  13: 50305,  // Actividades Profesionales/Cient.
  14: 501662, // Inmobiliarias
  15: 289557, // Admin. Pública y Defensa
  16: 18516,  // Arte y Entretenimiento
  17: 93892,  // Otras Actividades de Servicios
};

const IndustrialDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userProfile } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // Obtener parámetros de la URL o del contexto
  // Estado local para configuración activa
  const [configData, setConfigData] = useState({
    sector_id: parseInt(searchParams.get('sector_id')) || userProfile?.config?.sector_id || null,
    consumo_total: parseFloat(searchParams.get('consumo_total')) || userProfile?.config?.consumo_total || null,
    area_m2: parseFloat(searchParams.get('area_m2')) || userProfile?.config?.area_m2 || null
  });

  useEffect(() => {
    let isMounted = true;

    // Timeout de seguridad: Si en 5s no carga, forzar fin de loading
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Timeout de carga alcanzado sin configuración");
        setLoading(false);
      }
    }, 5000);

    const loadDashboardData = async () => {
      // Si ya tenemos predicción y config, no recargar (evita loops)
      if (prediction && configData.sector_id) return;

      if (isMounted) setLoading(true);

      // Intentar refrescar configuración desde Params/Profile si acaba de llegar
      let currentConfig = {
        sector_id: parseInt(searchParams.get('sector_id')) || userProfile?.config?.sector_id || configData.sector_id,
        consumo_total: parseFloat(searchParams.get('consumo_total')) || userProfile?.config?.consumo_total || configData.consumo_total,
        area_m2: parseFloat(searchParams.get('area_m2')) || userProfile?.config?.area_m2 || configData.area_m2
      };

      // Si no hay datos locales, intentar Backend (Persistencia)
      if (!currentConfig.sector_id || !currentConfig.consumo_total) {
        try {
          const settings = await industrialApi.getSettings();
          if (isMounted && settings && settings.baseline_consumption_kwh > 0) {
            currentConfig = {
              sector_id: settings.sector_id,
              consumo_total: settings.baseline_consumption_kwh,
              area_m2: settings.area_m2
            };
            setConfigData(currentConfig);
          }
        } catch (err) {
          console.log("No hay configuración guardada en backend:", err);
        }
      }

      // Si aun así no tenemos datos, terminar
      if (!currentConfig.sector_id || !currentConfig.consumo_total) {
        if (isMounted) setLoading(false);
        return;
      }

      // Predecir
      try {
        const result = await industrialApi.predict({
          sector_id: currentConfig.sector_id,
          consumo_total: currentConfig.consumo_total,
          area_m2: currentConfig.area_m2,
          tarifa_kwh: 479.12
        });
        if (isMounted) setPrediction(result);
      } catch (err) {
        console.error('Error fetching prediction:', err);
        if (isMounted) setError('No se pudo conectar con el motor de IA Industrial.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, userProfile]);

  // 4. Renderizado condicional: Loading o Config Requerida
  const hasValidConfig = prediction || (configData.sector_id && configData.consumo_total);

  if (!loading && !hasValidConfig) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <Card className="max-w-md text-center p-8 bg-slate-900 border-slate-800">
          <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-4">Configuración Requerida</h2>
          <p className="text-slate-400 mb-6">
            Para ver el análisis de IA, primero debes configurar los datos de tu instalación industrial.
          </p>
          <Button
            onClick={() => navigate('/industrial-config')}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            Ir a Configuración
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
          <p className="text-slate-400 text-lg">Analizando tu instalación con IA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <Card className="max-w-md text-center p-8 bg-slate-900 border-slate-800">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            Reintentar
          </Button>
        </Card>
      </div>
    );
  }

  // Preparar datos para los gráficos
  const pieData = prediction ? [
    { name: 'Maquinaria', value: prediction.desglose.maquinaria_produccion, icon: Factory },
    { name: 'Iluminación', value: prediction.desglose.iluminacion, icon: Lightbulb },
    { name: 'Climatización', value: prediction.desglose.climatizacion, icon: Thermometer },
    { name: 'Otros', value: prediction.desglose.otros_auxiliares, icon: Settings2 },
  ] : [];

  const barData = prediction ? [
    { name: 'Maquinaria', kWh: prediction.desglose.maquinaria_produccion, fill: COLORS[0] },
    { name: 'Iluminación', kWh: prediction.desglose.iluminacion, fill: COLORS[1] },
    { name: 'Climatización', kWh: prediction.desglose.climatizacion, fill: COLORS[2] },
    { name: 'Otros', kWh: prediction.desglose.otros_auxiliares, fill: COLORS[3] },
  ] : [];

  const totalDesglose = pieData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/industrial-config')}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Volver a configuración
            </button>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <Sparkles className="text-blue-500" />
              Análisis de IA Industrial
            </h1>
            <p className="text-slate-400 mt-2">
              Sector: <span className="text-blue-400 font-semibold">{SECTOR_NAMES[configData.sector_id]}</span>
            </p>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Consumo Total */}
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Zap className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-wide">Consumo Total</p>
                <p className="text-2xl font-bold text-white">{configData.consumo_total.toLocaleString()} <span className="text-sm text-slate-500">kWh/mes</span></p>
              </div>
            </div>
          </Card>

          {/* Factura Estimada */}
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <DollarSign className="text-emerald-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-wide">Factura Estimada</p>
                <p className="text-2xl font-bold text-white">$ {prediction?.factura_estimada_cop?.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm text-slate-500">COP</span></p>
                <p className="text-xs text-slate-500 mt-1">Tarifa: $ 479,12 / kWh</p>
              </div>
            </div>
          </Card>

          {/* Área */}
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Factory className="text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-wide">Área Instalación</p>
                <p className="text-2xl font-bold text-white">{configData.area_m2.toLocaleString()} <span className="text-sm text-slate-500">m²</span></p>
              </div>
            </div>
          </Card>

          {/* Consumo por m² */}
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <TrendingUp className="text-yellow-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-wide">Consumo/m²</p>
                <p className="text-2xl font-bold text-white">{prediction?.consumo_por_m2} <span className="text-sm text-slate-500">kWh/m²</span></p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de Pie */}
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="text-blue-400" />
              Desglose de Consumo por Área
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString()} kWh`, '']}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Gráfico de Comparación con Sector */}
          <Card className="p-6 bg-slate-900/50 border-slate-800">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="text-emerald-400" />
              Tu Consumo vs. Promedio Sector
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Tu Planta', value: configData.consumo_total, fill: '#3B82F6' }, // Blue
                    { name: 'Promedio Sector', value: SECTOR_AVERAGES[configData.sector_id] || 0, fill: '#64748b' } // Slate
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#ffffff', fontSize: 12, fontWeight: 500 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#ffffff', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#ffffff' }}
                    itemStyle={{ color: '#ffffff' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value) => [`${value.toLocaleString()} kWh`, 'Consumo']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                    {
                      [
                        { name: 'Tu Planta', value: configData.consumo_total, fill: '#3B82F6' },
                        { name: 'Promedio Sector', value: SECTOR_AVERAGES[configData.sector_id] || 0, fill: '#64748b' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-sm text-slate-400 mt-4">
              Comparativa mensual con empresas del sector <span className="text-emerald-400 font-semibold">{SECTOR_NAMES[configData.sector_id]}</span>
            </p>
          </Card>
        </div>

        {/* Tabla de Desglose */}
        <Card className="p-6 bg-slate-900/50 border-slate-800 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Desglose Detallado del Consumo</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400 font-semibold">Categoría</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-semibold">Consumo (kWh)</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-semibold">Porcentaje</th>
                  <th className="text-right py-3 px-4 text-slate-400 font-semibold">Costo Estimado</th>
                </tr>
              </thead>
              <tbody>
                {pieData.map((item, index) => {
                  const percentage = totalDesglose > 0 ? (item.value / totalDesglose * 100) : 0;
                  const cost = item.value * 479.12;
                  return (
                    <tr key={item.name} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                          <item.icon size={18} className="text-slate-400" />
                          <span className="font-medium text-white">{item.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 font-bold text-white">{item.value.toLocaleString()}</td>
                      <td className="text-right py-4 px-4">
                        <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${COLORS[index]}20`, color: COLORS[index] }}>
                          {percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-right py-4 px-4 text-emerald-400 font-medium">
                        $ {cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        <div className="text-[10px] text-slate-500 font-normal">($ 479,12 / kWh)</div>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-800/50">
                  <td className="py-4 px-4 font-bold text-white">TOTAL</td>
                  <td className="text-right py-4 px-4 font-bold text-white">{totalDesglose.toLocaleString()} kWh</td>
                  <td className="text-right py-4 px-4 font-bold text-white">100%</td>
                  <td className="text-right py-4 px-4 font-bold text-emerald-400">$ {prediction?.factura_estimada_cop?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recomendación de IA */}
        <Card className="p-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Sparkles className="text-blue-400" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Recomendación de IA</h3>
              <p className="text-lg text-slate-300">{prediction?.recomendacion}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default IndustrialDashboard;
