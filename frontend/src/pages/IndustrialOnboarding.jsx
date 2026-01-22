import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap, Leaf, Factory, Cpu, BarChart3, ShieldCheck,
    ArrowRight, ChevronDown, LineChart, Brain,
    Globe, TrendingUp, Building2, ClipboardCheck
} from 'lucide-react';
import '../onboarding.css';

const IndustrialOnboarding = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleStart = () => {
        navigate('/industrial-config');
    };

    const floatingIcons = [
        Factory, Cpu, BarChart3, Zap, ShieldCheck, TrendingUp,
        Building2, ClipboardCheck, Globe, Brain, LineChart, Zap
    ];

    return (
        <div className="bg-slate-950 font-body text-slate-100 antialiased overflow-x-hidden min-h-screen">
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/80 backdrop-blur-md border-b border-white/10 py-3 shadow-lg' : 'bg-transparent py-6'} px-6 lg:px-20`}>
                <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                            <Factory size={24} fill="currentColor" />
                        </div>
                        <h2 className="font-display text-2xl font-bold tracking-tight text-white select-none">EccoIA <span className="text-blue-500 font-medium text-lg ml-1">Enterprise</span></h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/login')} className="px-6 py-2 text-white font-semibold text-sm hover:underline decoration-2 underline-offset-4 bg-transparent outline-none border-none">
                            Portal Cliente
                        </button>
                        <button onClick={handleStart} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-500 hover:-translate-y-0.5 transition-all border-none">
                            Empezar Diagnóstico
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative flex flex-col min-h-screen">
                <section className="relative flex flex-col items-center justify-center min-h-screen px-4 pt-20 overflow-hidden bg-[radial-gradient(circle_at_50%_0%,_#1e3a8a_0%,_#020617_100%)]">
                    <div className="absolute inset-0 tech-grid-pattern opacity-20 pointer-events-none select-none">
                        <div className="grid grid-cols-6 gap-20 p-20 transform -rotate-12">
                            {floatingIcons.map((Icon, idx) => (
                                <Icon key={idx} className="w-24 h-24 text-blue-400" strokeWidth={0.5} />
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center gap-8">
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
                            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
                            Nueva Solución para el Sector Industrial
                        </div>
                        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight">
                            Eficiencia Energética<br />
                            <span className="text-blue-500">a Escala Industrial.</span>
                        </h1>
                        <p className="text-slate-300 text-lg md:text-xl font-medium max-w-3xl leading-relaxed">
                            Transforma tus datos de consumo en decisiones estratégicas.
                            Reduce costos operativos, optimiza procesos críticos y lidera la transición hacia la sostenibilidad.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-5 mt-4">
                            <button onClick={handleStart} className="group relative bg-blue-600 text-white px-10 py-5 rounded-xl font-black text-lg shadow-2xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all hover:-translate-y-1 flex items-center gap-3 overflow-hidden border-none text-center">
                                <span>Optimizar mi Planta</span>
                                <ArrowRight className="transition-transform group-hover:translate-x-1" />
                            </button>
                            <button className="bg-transparent border-2 border-slate-700 hover:border-slate-500 text-slate-300 px-10 py-5 rounded-xl font-bold text-lg transition-all text-center">
                                Solicitar Demo
                            </button>
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-blue-500/60 animate-bounce cursor-pointer">
                        <span className="text-xs font-bold uppercase tracking-widest">Descubrir Soluciones</span>
                        <ChevronDown />
                    </div>
                </section>

                <section className="py-24 px-6 lg:px-20 bg-slate-950">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="flex flex-col gap-4 mb-20 text-center">
                            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white">Potencia tu Infraestructura</h2>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Herramientas avanzadas de análisis diseñadas específicamente para los desafíos del sector industrial.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                {
                                    icon: TrendingUp,
                                    title: "Reducción de Costos",
                                    desc: "Identifica ineficiencias en tiempo real y reduce tu facturación eléctrica hasta en un 25% mediante gestión inteligente de cargas."
                                },
                                {
                                    icon: ShieldCheck,
                                    title: "Mantenimiento Predictivo",
                                    desc: "Detecta patrones anómalos en maquinaria pesada antes de que ocurran fallas, evitando paradas de producción no planificadas."
                                },
                                {
                                    icon: Globe,
                                    title: "Sostenibilidad Corporativa",
                                    desc: "Reportes automatizados de huella de carbono (Scope 1 \u0026 2) para cumplir con normativas internacionales y mejorar tu ESG score."
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="group p-10 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/5">
                                    <div className="size-16 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110">
                                        <item.icon size={36} />
                                    </div>
                                    <h3 className="font-display text-2xl font-bold mb-4 text-white">{item.title}</h3>
                                    <p className="text-slate-400 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-20 px-6 lg:px-20 bg-slate-950">
                    <div className="max-w-[1200px] mx-auto rounded-[2rem] bg-gradient-to-br from-blue-900/40 to-slate-900 p-12 lg:p-24 border border-blue-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,_rgba(59,130,246,0.15)_0%,_transparent_70%)]"></div>
                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
                            <div className="max-w-2xl text-center lg:text-left">
                                <h2 className="font-display text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
                                    ¿Listo para la <br />
                                    <span className="text-blue-500">Industria 4.0?</span>
                                </h2>
                                <p className="text-slate-300 text-xl leading-relaxed mb-8">
                                    Únete a las empresas líderes que ya están optimizando su consumo con EccoIA Enterprise.
                                    Configura tu perfil industrial en minutos.
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <ClipboardCheck className="text-blue-500" size={20} />
                                        <span className="text-slate-300 text-sm font-medium">Diagnóstico Rápido</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <Brain className="text-blue-500" size={20} />
                                        <span className="text-slate-300 text-sm font-medium">IA Predictiva</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleStart}
                                className="w-full lg:w-auto bg-white text-blue-900 px-12 py-6 rounded-2xl font-black text-xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl shadow-white/10 hover:shadow-blue-600/20 border-none group flex items-center justify-center gap-4"
                            >
                                Empezar Ahora
                                <ArrowRight className="transition-transform group-hover:translate-x-2" />
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-slate-950 border-t border-slate-900 py-16 px-6 lg:px-20">
                <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-12">
                    <div className="flex items-center gap-4">
                        <div className="size-10 bg-blue-600/20 rounded flex items-center justify-center text-blue-500 border border-blue-500/30">
                            <Factory size={24} fill="currentColor" />
                        </div>
                        <h2 className="font-display text-2xl font-bold text-white tracking-widest uppercase">EccoIA</h2>
                    </div>
                    <nav className="flex flex-wrap justify-center gap-x-16 gap-y-6">
                        {['Acuerdos de Servicio', 'Seguridad Industrial', 'API Enterprise', 'Contacto Directo'].map((text, idx) => (
                            <a key={idx} className="text-slate-500 hover:text-blue-400 transition-colors text-sm font-bold uppercase tracking-wider" href="#">{text}</a>
                        ))}
                    </nav>
                    <div className="w-full h-px bg-slate-900"></div>
                    <p className="text-slate-600 text-sm font-medium text-center">
                        © {new Date().getFullYear()} EccoIA Enterprise Solutions. Liderando la eficiencia global.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default IndustrialOnboarding;
