import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle, Gauge, Wallet, Leaf, Award, Lightbulb,
  Thermometer, Plug, LayoutDashboard, Share2, Zap,
  TrendingUp, ArrowRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';
import { useEnergyMath } from '../hooks/useEnergyMath';
import StatCardShared from '../components/ui/StatCard';

// Quick Tip Card Component  
const QuickTipCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-colors cursor-pointer group">
    <h4 className="text-emerald-500 font-bold mb-2 flex items-center gap-2">
      <Icon size={16} />
      {title}
    </h4>
    <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed group-hover:text-slate-700 dark:group-hover:text-white transition-colors">
      {description}
    </p>
  </div>
);

const ResultsDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useUser();
  const {
    efficiencyScore, projectedBill, co2Footprint,
    formatMoney, isIndustrial
  } = useEnergyMath();

  // --- 1. RECUPERAMOS DATOS DE LA IA ---
  const aiData = location.state?.aiResult || null;

  // --- 2. CALCULAMOS PORCENTAJES REALES ---
  const distributionData = useMemo(() => {
    // Si es industrial o no hay datos de IA, usamos los datos por defecto (mock)
    if (isIndustrial || !aiData) {
      return isIndustrial ? [
        { name: 'Maquinaria Pesada', percentage: 60, color: 'bg-blue-600' },
        { name: 'Iluminación Industrial', percentage: 15, color: 'bg-amber-500' },
        { name: 'Sistemas HVAC', percentage: 15, color: 'bg-emerald-500' },
        { name: 'Otros Procesos', percentage: 10, color: 'bg-slate-400' },
      ] : [
        { name: 'Climatización', percentage: 45, color: 'bg-emerald-500' },
        { name: 'Electrodomésticos', percentage: 30, color: 'bg-blue-500' },
        { name: 'Iluminación', percentage: 15, color: 'bg-amber-500' },
        { name: 'Otros', percentage: 10, color: 'bg-slate-400' },
      ];
    }

    // SI HAY DATOS DE IA: Calculamos porcentajes reales
    const total = aiData.consumo_total_real || 1; // Evitar división por cero

    return [
      {
        name: 'Refrigeración',
        percentage: Math.round((aiData.desglose.refrigeracion / total) * 100),
        color: 'bg-blue-500'
      },
      {
        name: 'Climatización',
        percentage: Math.round((aiData.desglose.climatizacion / total) * 100),
        color: 'bg-emerald-500'
      },
      {
        name: 'Entretenimiento',
        percentage: Math.round((aiData.desglose.entretenimiento / total) * 100),
        color: 'bg-purple-500'
      },
      {
        name: 'Cocina y Lavado',
        percentage: Math.round((aiData.desglose.cocina_lavado / total) * 100),
        color: 'bg-amber-500'
      },
      // Si hay fugas significativas, las mostramos
      ...(aiData.otros_fugas > 5 ? [{
        name: 'Otros / Fugas',
        percentage: Math.round((aiData.otros_fugas / total) * 100),
        color: 'bg-red-500'
      }] : [])
    ].sort((a, b) => b.percentage - a.percentage); // Ordenar de mayor a menor

  }, [aiData, isIndustrial]);

  // Manejo de navegación preservando los datos
  const handleGoToMainDashboard = () => {
    navigate(
      userProfile?.type === 'industrial' ? '/industrial-dashboard' : '/dashboard',
      { state: { aiResult: aiData } } // <--- ¡IMPORTANTE! Reenviamos los datos
    );
  };

  const stats = [
    {
      icon: Gauge,
      title: 'Puntaje de Eficiencia',
      value: efficiencyScore || '84',
      unit: '/100',
      badge: '+12% vs mes ant.',
      badgeColor: 'green'
    },
    {
      icon: Wallet,
      title: isIndustrial ? 'Facturación Estimada' : 'Ahorro Potencial',
      // Si la IA detectó fugas, mostramos eso como ahorro potencial
      value: aiData?.otros_fugas > 0 ? formatMoney(aiData.otros_fugas * 900) : (isIndustrial ? formatMoney(projectedBill) : '$52,000'),
      unit: isIndustrial ? '' : 'COP',
      badge: 'Est.',
      badgeColor: 'slate'
    },
    {
      icon: Leaf,
      title: 'Huella de CO2',
      value: Math.round(co2Footprint).toLocaleString(),
      unit: 'kg',
      badge: '-2.4t',
      badgeColor: 'green'
    },
    {
      icon: Award,
      title: 'Rango Eco',
      value: isIndustrial ? 'Platino' : 'Oro',
      badge: 'Top 5%',
      badgeColor: 'amber'
    },
  ];

  const tips = [
    {
      icon: Lightbulb,
      title: 'Iluminación',
      description: 'Cambiar a LED puede ahorrarte un 15% en tu factura eléctrica inmediatamente.'
    },
    {
      icon: Thermometer,
      title: 'Climatización',
      description: 'Mantener el termostato a 24°C reduce el consumo significativamente.'
    },
    {
      icon: Plug,
      title: 'Carga Fantasma',
      description: 'Desconecta dispositivos que no uses para evitar el consumo "vampiro".'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body text-slate-900 dark:text-slate-100">
      {/* Success Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-50" style={{
        background: `radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent),
                     radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.05), transparent)`
      }} />

      <main className="relative z-10 pt-8 pb-20 px-6 lg:px-20">
        <div className="max-w-[1200px] mx-auto">
          {/* Success Header */}
          <div className="flex flex-col items-center text-center mb-12">
            <div className="size-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 text-emerald-500 animate-in zoom-in duration-500">
              <CheckCircle size={48} />
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              ¡Análisis completado!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xl font-medium">
              Tu viaje eco comienza aquí. Hemos desagregado tu consumo.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, idx) => (
              <StatCardShared key={idx} {...stat} color={stat.icon === Gauge ? 'primary' : stat.icon === Wallet ? 'emerald' : stat.icon === Leaf ? 'purple' : 'amber'} />
            ))}
          </div>

          {/* Quick Tips Section */}
          <div className="bg-slate-900 dark:bg-slate-800/50 rounded-3xl p-8 lg:p-12 mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="size-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-500">
                  <Lightbulb size={24} />
                </div>
                <h2 className="font-display text-2xl font-bold text-white">Consejos Rápidos</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tips.map((tip, idx) => (
                  <QuickTipCard key={idx} {...tip} />
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Analysis Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Energy Distribution - AHORA CONECTADO A LA IA */}
            <Card className="p-8">
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Zap className="text-emerald-500" size={24} />
                Distribución Detectada
              </h3>
              <div className="space-y-4">
                {distributionData.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="font-black text-slate-900 dark:text-white">{item.percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-8">
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="text-emerald-500" size={24} />
                Recomendaciones
              </h3>
              <div className="space-y-4">
                {(isIndustrial ? [
                  { priority: 'Alta', title: 'Optimizar turnos de carga pesada', savings: '$1,200/mes' },
                  { priority: 'Media', title: 'Actualizar motores a alta eficiencia', savings: '$850/mes' },
                ] : [
                  // Lógica condicional básica para recomendaciones
                  aiData?.otros_fugas > 10
                    ? { priority: 'Alta', title: 'Revisar fugas de energía detectadas', savings: formatMoney(aiData.otros_fugas * 900) }
                    : { priority: 'Alta', title: 'Optimizar horario del aire acondicionado', savings: '$85/año' },
                  { priority: 'Media', title: 'Reemplazar bombillas incandescentes', savings: '$45/año' },
                  { priority: 'Baja', title: 'Desconectar standby de electrónicos', savings: '$30/año' },
                ]).map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded
                        ${rec.priority === 'Alta' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                          rec.priority === 'Media' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' :
                            'bg-blue-50 text-blue-600 dark:bg-blue-900/20'}`}>
                        Prioridad {rec.priority}
                      </span>
                      <span className="text-sm font-black text-emerald-500">{rec.savings}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-500 transition-colors flex items-center gap-2">
                      {rec.title}
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleGoToMainDashboard} // Usamos la nueva función
              variant="primary"
              size="lg"
              icon={LayoutDashboard}
              className="w-full sm:w-auto shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 border-none text-white"
            >
              Ir al Panel Principal
            </Button>
            <Button
              variant="ghost"
              size="lg"
              icon={Share2}
              className="w-full sm:w-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white"
            >
              Compartir mi impacto
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsDashboard;