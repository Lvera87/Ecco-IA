import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Factory, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';

const ProfileSelection = () => {
  const navigate = useNavigate();

  const handleSelect = (type) => {
    if (type === 'residential') {
      navigate('/residential-config');
    } else {
      navigate('/industrial-config');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 font-body relative overflow-hidden px-4">
      {/* Architectural Background */}
      <div className="absolute inset-0 tech-grid-pattern pointer-events-none opacity-40"></div>

      <div className="relative z-10 text-center mb-16 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/50 text-xs font-medium text-slate-400 uppercase tracking-widest mb-6">
          <span>Selección de Entorno</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Elige tu Espacio
        </h1>
        <p className="text-slate-400 text-lg">
          Dos interfaces especializadas. Una sola inteligencia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl w-full relative z-10">
        {/* Residential Card */}
        <button
          onClick={() => handleSelect('residential')}
          className="group relative flex flex-col text-left p-1 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl hover:from-slate-700 hover:to-slate-800 transition-all duration-500 shadow-2xl hover:shadow-emerald-900/20"
        >
          <div className="absolute inset-0 bg-slate-900 rounded-[22px] m-[1px] z-0"></div>
          <div className="relative z-10 p-8 md:p-12 h-full flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-900 transition-colors duration-300">
                <Home size={32} strokeWidth={1.5} />
              </div>
              <ArrowRight className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
            </div>

            <div className="mt-auto">
              <h2 className="font-display text-3xl font-bold text-white mb-3 tracking-tight group-hover:text-emerald-400 transition-colors">Residencial</h2>
              <p className="text-slate-500 group-hover:text-slate-400 text-sm leading-relaxed border-l-2 border-slate-800 pl-4 group-hover:border-emerald-500/50 transition-all">
                Gestión doméstica. Control de dispositivos y ahorro personal.
              </p>
            </div>
          </div>
        </button>

        {/* Industrial Card */}
        <button
          onClick={() => handleSelect('industrial')}
          className="group relative flex flex-col text-left p-1 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl hover:from-slate-700 hover:to-slate-800 transition-all duration-500 shadow-2xl hover:shadow-blue-900/20"
        >
          <div className="absolute inset-0 bg-slate-900 rounded-[22px] m-[1px] z-0"></div>
          <div className="relative z-10 p-8 md:p-12 h-full flex flex-col">
            <div className="flex justify-between items-start mb-10">
              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <Factory size={32} strokeWidth={1.5} />
              </div>
              <ArrowRight className="text-slate-600 group-hover:text-blue-400 transition-colors" />
            </div>

            <div className="mt-auto">
              <h2 className="font-display text-3xl font-bold text-white mb-3 tracking-tight group-hover:text-blue-400 transition-colors">Industrial</h2>
              <p className="text-slate-500 group-hover:text-slate-400 text-sm leading-relaxed border-l-2 border-slate-800 pl-4 group-hover:border-blue-500/50 transition-all">
                Infraestructura crítica. Optimización de procesos y maquinaria.
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-12 p-6 text-center">
        <a href="#" className="text-slate-600 hover:text-white text-xs font-mono tracking-wider uppercase transition-colors">Realizar diagnóstico previo</a>
      </div>
    </div>
  );
};

export default ProfileSelection;
