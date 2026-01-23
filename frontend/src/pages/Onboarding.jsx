import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Leaf, Activity, Sprout, Factory, Home, Sun, Wind,
  Thermometer, Cpu, BarChart, Grid, ArrowRight, ChevronDown,
  LineChart, Brain, Share2, Network, Globe
} from 'lucide-react';
import '../onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleStart = () => {
    navigate('/profile-selection');
  };

  const floatingIcons = [
    Leaf, Activity, Sprout, Zap, Factory, Home,
    Sun, Wind, Thermometer, Cpu, BarChart, Grid
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark font-body text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden min-h-screen">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background-dark/80 backdrop-blur-md border-b border-white/10 py-3 shadow-lg' : 'bg-transparent py-6'} px-6 lg:px-20`}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
              <Zap size={24} fill="currentColor" className="text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-white select-none">EccoIA</h2>
          </div>
          {/* Navigation Menu Removed */}
          <div className="flex items-center gap-4">
            <button onClick={handleLogin} className="px-6 py-2 text-white font-semibold text-sm hover:underline decoration-2 underline-offset-4 bg-transparent outline-none border-none">
              Iniciar sesión
            </button>
            <button onClick={handleStart} className="bg-white text-primary px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-center border-none">
              Empezar
            </button>
          </div>
        </div>
      </header>

      <main className="relative flex flex-col min-h-screen">
        <section className="hero-gradient relative flex flex-col items-center justify-center min-h-screen px-4 pt-20 overflow-hidden">
          <div className="absolute inset-0 icon-grid-pattern opacity-10 pointer-events-none select-none">
            <div className="grid grid-cols-6 gap-20 p-20 transform -rotate-12">
              {floatingIcons.map((Icon, idx) => (
                <Icon key={idx} className="w-24 h-24 text-white" strokeWidth={1} />
              ))}
            </div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-4">
              <span className="flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
              Monitoreando más de 1.2M de Hogares
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight">
              Domina tu Energía,<br />
              <span className="text-white/80">Salva el Planeta.</span>
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
              La forma más inteligente de monitorear el consumo de tu hogar o negocio.
              Información inteligente para un futuro sostenible.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-5 mt-4">
              <button onClick={handleStart} className="group relative bg-white text-primary px-10 py-5 rounded-xl font-black text-lg shadow-2xl hover:shadow-primary/40 transition-all hover:-translate-y-1 flex items-center gap-3 overflow-hidden border-none text-center">
                <span>Empezar ahora</span>
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate('/register?type=industrial')}
                className="bg-transparent border-2 border-white/40 hover:border-white text-white px-10 py-5 rounded-xl font-bold text-lg transition-all text-center flex items-center gap-2"
              >
                <Factory size={20} />
                Soluciones Enterprise
              </button>
            </div>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 animate-bounce cursor-pointer">
            <span className="text-xs font-bold uppercase tracking-widest">Saber más</span>
            <ChevronDown />
          </div>
        </section>

        <section className="py-24 px-6 lg:px-20 bg-background-light dark:bg-background-dark">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col gap-4 mb-16 text-center lg:text-left">
              <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white">¿Por qué elegir EccoIA?</h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">Empoderándote con herramientas inteligentes para una huella más verde.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: LineChart, title: "Monitoreo en Tiempo Real", desc: "Rastrea tu uso de energía mientras ocurre con alta precisión. Identifica electrodomésticos 'vampiro' y optimiza al instante." },
                { icon: Brain, title: "Información Inteligente", desc: "Recomendaciones basadas en IA adaptadas a tu comportamiento. Reduce el desperdicio y ahorra hasta un 30% en tus facturas mensuales." },
                { icon: Leaf, title: "Eco-Consciente", desc: "Comprende tu huella de carbono en tiempo real. Contribuye a un futuro sostenible optimizando tu consumo." }
              ].map((item, idx) => (
                <div key={idx} className="group p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-primary/50 transition-all hover:shadow-xl">
                  <div className="size-14 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <item.icon size={32} />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3 text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-20">
          <div className="max-w-[1200px] mx-auto rounded-3xl bg-slate-900 dark:bg-slate-800/50 p-12 lg:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 size-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-xl text-center md:text-left">
                <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">¿Listo para tomar el control?</h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Únete a miles de usuarios que marcan la diferencia hoy. La configuración toma menos de 5 minutos.
                </p>
              </div>
              <button onClick={handleStart} className="w-full md:w-auto bg-primary text-slate-900 px-10 py-5 rounded-xl font-black text-lg hover:bg-white transition-all shadow-xl bg-primary border-none text-center">
                Empezar ahora
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 py-12 px-6 lg:px-20">
        <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-10">
          <div className="flex items-center gap-3 opacity-60">
            <div className="size-8 bg-primary rounded flex items-center justify-center text-white">
              <Zap size={20} fill="currentColor" />
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">EccoIA</h2>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            {['Política de Privacidad', 'Términos de Servicio', 'Centro de Soporte', 'Ajustes de Cookies'].map((text, idx) => (
              <a key={idx} className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-sm" href="#">{text}</a>
            ))}
          </nav>
          <div className="flex items-center gap-6">
            {[Share2, Network, Globe].map((Icon, idx) => (
              <a key={idx} className="size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-colors" href="#">
                <Icon size={20} />
              </a>
            ))}
          </div>
          <p className="text-slate-400 dark:text-slate-600 text-sm font-medium text-center">
            © {new Date().getFullYear()} EccoIA Inc. Empoderando una red más limpia.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Onboarding;
