import {
  Factory, Zap, Activity, Wind, Cpu, Thermometer,
  AlertTriangle, ArrowUpRight, Bell, Search, BarChart3
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
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Industrial Data Mockup
const industrialEnergyData = [
  { time: '08:00', value: 3200 },
  { time: '09:00', value: 3800 },
  { time: '10:00', value: 4100 },
  { time: '11:00', value: 4250 },
  { time: '12:00', value: 3900 },
  { time: '13:00', value: 4500 },
  { time: '14:00', value: 4800 },
  { time: '15:00', value: 4250 },
  { time: '16:00', value: 3800 },
];

const IndustrialTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/50 backdrop-blur-xl p-3 rounded-lg shadow-2xl border-l-4 border-l-blue-500">
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">{payload[0].payload.time}</p>
        <p className="text-xl font-display font-bold text-blue-400">
          {payload[0].value.toLocaleString()} <span className="text-xs font-medium text-slate-500">kWh</span>
        </p>
      </div>
    );
  }
  return null;
};

// Utility component for grid items
const GridItem = ({ className, children, title, icon: Icon, value, trend, trendValue, color = "blue" }) => {
  const colorClasses = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10",
    orange: "text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-orange-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10",
    red: "text-red-500 bg-red-500/10 border-red-500/20 shadow-red-500/10",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-purple-500/10",
  };

  return (
    <Card className={`bg-slate-900/50 border-slate-800 p-6 flex flex-col group hover:border-blue-500/50 transition-all duration-500 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border ${colorClasses[color]} shadow-lg`}>
            {Icon && <Icon size={20} />}
          </div>
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{title}</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? '+' : '-'}{trendValue}%
            <ArrowUpRight size={14} className={trend === 'down' ? 'rotate-90' : ''} />
          </div>
        )}
      </div>

      <div className="mt-auto">
        <div className="text-3xl font-display font-bold text-white tracking-tight leading-none">{value}</div>
      </div>
      {children}
    </Card>
  );
};

const IndustrialDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-body relative overflow-x-hidden">
      <div className="absolute inset-0 tech-grid-pattern pointer-events-none opacity-20"></div>

      <main className="relative z-10 p-8 max-w-[1600px] mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Estado: Operativo</span>
              <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">• Actualizado hace 2m</span>
            </div>
            <h1 className="text-4xl font-display font-bold text-white tracking-tight">Monitor de Planta Principal</h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <Factory size={16} className="text-blue-500" />
              Sector Industrial A-12 • Medellín, COL
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

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Main High-Priority Metric - Span 2 */}
          <GridItem
            title="Consumo Proyectado vs Real"
            icon={Zap}
            value="4,250 kWh"
            trend="up"
            trendValue="12.5"
            className="md:col-span-2 md:row-span-2 bg-slate-900/40"
            color="blue"
          >
            <div className="mt-8 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={industrialEnergyData}>
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
                    dy={10}
                  />
                  <YAxis
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip content={<IndustrialTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorBlue)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GridItem>

          {/* Secondary Metrics */}
          <GridItem title="Eficiencia de Planta" icon={Activity} value="94.2%" trend="up" trendValue="2.1" color="emerald" />
          <GridItem title="Carga de Red" icon={Wind} value="Low" color="blue" />
          <GridItem title="Factor de Potencia" icon={Cpu} value="0.98" color="purple" />
          <GridItem title="Sensor Temp" icon={Thermometer} value="24.5°C" color="orange" />

          {/* Wide Alert Section */}
          <Card className="md:col-span-2 bg-slate-900/40 border-slate-800 flex items-center p-0 overflow-hidden group hover:border-red-500/30 transition-all cursor-pointer shadow-xl">
            <div className="h-full w-2 bg-red-500 group-hover:w-3 transition-all"></div>
            <div className="p-6 flex-1 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 shadow-lg shadow-red-500/5">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Turbina 3: Vibración Crítica</h3>
                  <p className="text-slate-500 text-sm mt-1">Se requiere inspección técnica inmediata en Zona B.</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold uppercase tracking-widest text-[10px]">
                Prioridad Alta <ArrowUpRight size={16} className="ml-2" />
              </Button>
            </div>
          </Card>

          {/* Machinery Status - Tall */}
          <Card className="md:col-span-2 md:row-span-2 bg-slate-900/40 border-slate-800 p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-display font-bold flex items-center gap-2 text-lg">
                <Cpu size={20} className="text-blue-500" /> Nodos de Procesamiento
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">3 Online</span>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((id) => (
                <div key={id} className="group flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30 hover:border-blue-500/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                      <Cpu size={20} className="text-slate-500 group-hover:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white uppercase tracking-tight">Compresor Ind-0{id}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Zona B • 8h operando</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-300">92.5%</div>
                    <div className="text-[9px] text-emerald-500 font-bold uppercase">Optimal</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Energy Mix */}
          <Card className="md:col-span-2 bg-slate-900/40 border-slate-800 p-6 shadow-xl">
            <h3 className="text-white font-display font-bold mb-6 flex items-center gap-2 text-lg">
              <BarChart3 size={20} className="text-blue-500" /> Fuentes de Energía
            </h3>
            <div className="space-y-5">
              {[
                { label: 'Energía Solar', value: 45, color: '#eab308' },
                { label: 'Red Pública', value: 30, color: '#3b82f6' },
                { label: 'Generación Eólica', value: 25, color: '#14b8a6' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                    <span>{item.label}</span>
                    <span style={{ color: item.color }}>{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${item.value}%`, backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}40` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default IndustrialDashboard;
