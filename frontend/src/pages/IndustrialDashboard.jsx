import React from 'react';
import {
  Factory, Zap, Activity, Wind, Cpu, Thermometer,
  AlertTriangle, ArrowUpRight, Bell, Search, BarChart3, TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext';
import { useEnergyMath } from '../hooks/useEnergyMath';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import InsightCard from '../components/ui/InsightCard';
import EmptyState from '../components/ui/EmptyState';

const IndustrialDashboard = () => {
  const { userProfile, consumptionHistory } = useApp();
  const {
    latestReading, projectedKwh, projectedBill, energyIntensity,
    efficiencyScore, co2Footprint, kwhPrice, loadDist,
    hasData, formatMoney
  } = useEnergyMath();

  const config = userProfile?.config || {};

  // Mock data for chart if no history
  const chartData = hasData ? [
    { time: '08:00', value: 3200 },
    { time: '09:00', value: 3800 },
    { time: '10:00', value: 4100 },
    { time: '11:00', value: 4250 },
    { time: '12:00', value: 3900 },
    { time: '13:00', value: 4500 },
    { time: '14:00', value: 4800 },
    { time: '15:00', value: 4250 },
    { time: '16:00', value: 3800 },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-body relative overflow-x-hidden">
      <div className="absolute inset-0 tech-grid-pattern pointer-events-none opacity-20"></div>

      <main className="relative z-10 p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                Estado: Operativo
              </span>
              <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">• Sector {config.sector || 'Industrial'}</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-white tracking-tight">
              {config.companyName || 'Monitor de Planta Principal'}
            </h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <Factory size={16} className="text-blue-500" />
              {config.facilityType === 'planta' ? 'Planta de Producción' : 'Instalación Corporativa'} • Medellín, COL
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Buscar sensor..."
                className="bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all w-64 backdrop-blur-sm"
              />
            </div>
            <Button variant="outline" className="bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/50">
              <Bell size={20} />
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/20 font-bold">
              Descargar Informe
            </Button>
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Consumo Proyectado"
            value={projectedKwh.toLocaleString()}
            unit="kWh"
            icon={Zap}
            color="blue"
            trend="up"
            trendValue={5.2}
          />
          <StatCard
            title="Costo Estimado"
            value={formatMoney(projectedBill)}
            unit="/ mes"
            icon={TrendingUp}
            color="emerald"
          />
          <StatCard
            title="Eficiencia"
            value={`${efficiencyScore}%`}
            unit="Score"
            icon={Activity}
            color={parseFloat(efficiencyScore) > 85 ? "emerald" : "amber"}
          />
          <StatCard
            title="Huella Carbono"
            value={Math.round(co2Footprint).toLocaleString()}
            unit="kg CO2"
            icon={Wind}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <Card className="lg:col-span-2 p-8 bg-slate-900/40 border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-display font-bold text-white">Curva de Carga Eléctrica</h3>
                <p className="text-slate-500 text-sm mt-1">Monitoreo de potencia activa en tiempo real</p>
              </div>
            </div>

            <div className="h-80 w-full" style={{ minHeight: '320px' }}>
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis
                      dataKey="time"
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                      itemStyle={{ color: '#3b82f6' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#colorBlue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState
                  title="Sin datos de planta"
                  description="Complete la configuración o reporte consumos manuales."
                />
              )}
            </div>
          </Card>

          {/* Right Column: Alerts & Distribution */}
          <div className="space-y-6">
            <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={24} /> Alertas de Sistema
            </h3>

            <InsightCard
              icon={AlertTriangle}
              title="Mantenimiento Preventivo"
              description="Zona B: Motor principal muestra 15% más de consumo térmico de lo habitual."
              action="Programar revisión"
            />

            <Card className="bg-slate-900/40 border-slate-800 p-6">
              <h3 className="text-white font-display font-bold mb-6 flex items-center gap-2 text-lg">
                <BarChart3 size={20} className="text-blue-500" /> Mezcla Energética
              </h3>
              <div className="space-y-5">
                {loadDist.map((item, i) => {
                  const percentage = (item.value / projectedKwh * 100).toFixed(0);
                  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                        <span>{item.name}</span>
                        <span style={{ color: colors[i] }}>{percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%`, backgroundColor: colors[i] }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IndustrialDashboard;
