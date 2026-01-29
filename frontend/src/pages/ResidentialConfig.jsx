import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap, Users, Tv, Monitor, Wind, Snowflake,
    CheckCircle, HelpCircle, Home, ArrowRight, Loader2
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { iaApi } from '../api/iaService';
import { residentialApi } from '../api/residential'; // Importar API residencial
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ResidentialConfig = () => {
    const navigate = useNavigate();
    const { userProfile, refreshProfile } = useUser();
    const [loading, setLoading] = useState(false);

    // ESTADO: Los 9 datos exactos del Dataset
    const [formData, setFormData] = useState({
        estrato: 3,          // [0]
        consumo: 200,        // [1] - kWh Mensuales
        personas: 3,         // [2]
        tvs: 1,              // [3]
        pcs: 1,              // [4]
        lavadoras: 1,        // [5]
        aire: false,         // [6] (Binary)
        nevera_vieja: false, // [7] (Binary)
        nevera_inverter: true // [8] (Binary)
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : Number(value)
        }));
    };

    const handleFinish = async () => {
        // Validación simple
        if (formData.consumo <= 0) return alert("Por favor ingresa un consumo mayor a 0 kWh");

        setLoading(true);
        try {
            // 1. PREPARAR EL ARRAY EXACTO PARA LA IA (Orden estricto)
            const featuresArray = [
                formData.estrato,
                formData.consumo,
                formData.personas,
                formData.tvs,
                formData.pcs,
                formData.lavadoras,
                formData.aire ? 1 : 0,
                formData.nevera_vieja ? 1 : 0,
                formData.nevera_inverter ? 1 : 0
            ];

            console.log("📤 Enviando datos a IA (Features):", featuresArray);

            // 2. SECUENCIAL: PRIMERO IA, LUEGO GUARDAR
            // Paso A: Obtener predicción
            const aiResult = await iaApi.predict({
                client_type: 'residencial',
                features: featuresArray
            });

            console.log("📥 Resultado IA Recibido:", aiResult);

            // Paso B: Guardar Perfil + Resultado IA (Persistencia)
            await residentialApi.updateProfile({
                stratum: formData.estrato,
                monthly_bill_avg: formData.consumo * 850,
                occupants: formData.personas,
                // GUARDAMOS EL RESULTADO DE LA IA EN EL CAMPO history_kwh (JSON)
                // Esto permite que el Dashboard recupere los datos si se recarga la página
                history_kwh: aiResult
            });

            // Paso C: Guardar Activos
            await saveInitialAssets();

            console.log("✅ Todo guardado correctamente");

            // 3. ACTUALIZAR CONTEXTO
            if (refreshProfile) await refreshProfile();

            // 4. IR AL DASHBOARD
            // Pasamos el estado también por si acaso, pero ya está en BD
            navigate('/results-dashboard', { state: { aiResult } });

        } catch (error) {
            console.error("❌ Error en Proceso:", error);
            alert("Hubo un error al procesar. Revisa la consola.");
        } finally {
            setLoading(false);
        }
    };

    // Función auxiliar para construir y guardar activos
    const saveInitialAssets = async () => {
        const assetsToCreate = [];

        // Helper para añadir n veces un item
        const addItems = (count, name, icon, watts, category, hours = 4) => {
            for (let i = 0; i < count; i++) {
                assetsToCreate.push({
                    name: count > 1 ? `${name} ${i + 1}` : name,
                    icon,
                    power_watts: watts,
                    daily_hours: hours,
                    category,
                    is_high_impact: watts > 500
                });
            }
        };

        // Mapeo de inputs a activos reales (Estimaciones ajustadas a promedio real)
        // TV LED 40-50": ~80W
        addItems(formData.tvs, 'Televisor', 'Tv', 80, 'entretenimiento', 4);
        // Laptop/PC Oficina: ~150W
        addItems(formData.pcs, 'Computador', 'Monitor', 150, 'entretenimiento', 6);
        // Lavadora: ~500W (Motor) * 1h (Ciclo lavado)
        addItems(formData.lavadoras, 'Lavadora', 'WashingMachine', 500, 'lavanderia', 1);

        if (formData.aire) {
            // Aire Acondicionado: 1000W (9000 BTU) * 4h = 4kWh/día = 120kWh/mes
            addItems(1, 'Aire Acondicionado', 'AirVent', 1000, 'climatizacion', 4);
        }

        // Lógica de Neveras (Ciclo de trabajo real ~30-40% o Watts promedio)
        // Usaremos Watts "Efectivos" para 24h o Watts Nominales con horas reducidas.
        // Estrategia: Watts Nominales * 8 horas (equivale al ciclo de compresión)
        if (formData.nevera_vieja) {
            // Nevera Vieja: ~250W * 10h = 2.5kWh/día = 75kWh/mes
            addItems(1, 'Nevera Antigua', 'Refrigerator', 250, 'cocina', 10);
        } else if (formData.nevera_inverter) {
            // Inverter: ~100W * 8h = 0.8kWh/día = 24kWh/mes
            addItems(1, 'Nevera Inverter', 'Refrigerator', 120, 'cocina', 6);
        } else {
            // Estándar: ~180W * 8h = 1.44kWh/día = 43kWh/mes (Coincide con IA ~40kWh)
            addItems(1, 'Nevera Estándar', 'Refrigerator', 180, 'cocina', 8);
        }

        // --- GAP FILLER: Ajuste para que coincida con la factura real ---
        // Calculamos cuánto suman los equipos que acabamos de definir
        const currentTotalKwh = assetsToCreate.reduce((acc, item) => {
            return acc + ((item.power_watts * item.daily_hours * 30) / 1000);
        }, 0);

        const targetKwh = formData.consumo; // El consumo que el usuario dijo tener
        const gapKwh = targetKwh - currentTotalKwh;

        // Si falta consumo para llegar al total (muy probable por luces, plancha, etc.)
        if (gapKwh > 5) { // Solo si la diferencia es significativa (>5 kWh)
            const gapWatts = (gapKwh * 1000) / (30 * 6); // Asumiendo 6h diarias de uso "base"
            assetsToCreate.push({
                name: 'Iluminación y Varios', // Consumo base del hogar
                icon: 'Lightbulb',
                power_watts: Math.round(gapWatts),
                daily_hours: 6,
                category: 'iluminacion',
                is_high_impact: false
            });
        }
        // ---------------------------------------------------------------

        if (assetsToCreate.length > 0) {
            console.log("Limpiando activos anteriores...");
            await residentialApi.resetAssets(); // <--- EVITA DUPLICADOS

            console.log("Guardando activos iniciales:", assetsToCreate);
            await residentialApi.addAssets(assetsToCreate);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 font-body">

            <div className="max-w-lg md:max-w-3xl w-full space-y-8">

                {/* Encabezado */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-full mb-4">
                        <Zap size={32} className="text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                        Calibración Inteligente
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                        Ingresa los datos de tu hogar tal como aparecen en tu recibo para que nuestra IA pueda desagregar tu consumo.
                    </p>
                </div>

                <Card className="p-8 border-t-4 border-t-emerald-500 shadow-2xl">
                    <div className="space-y-8">

                        {/* SECCIÓN 1: DATOS DEL RECIBO */}
                        <section>
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                                <Home size={20} className="text-emerald-500" /> Datos Generales
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Estrato */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Estrato Socioeconómico
                                    </label>
                                    <select
                                        name="estrato"
                                        value={formData.estrato}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-transparent focus:border-emerald-500 focus:ring-0 transition-all"
                                    >
                                        {[1, 2, 3, 4, 5, 6].map(n => (
                                            <option key={n} value={n}>Estrato {n}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Consumo Total */}
                                <div className="relative">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Consumo Mensual (kWh)
                                        </label>
                                        <span className="text-xs text-emerald-600 font-medium cursor-help flex items-center gap-1">
                                            <HelpCircle size={12} /> ¿Dónde lo encuentro?
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="consumo"
                                            value={formData.consumo}
                                            onChange={handleChange}
                                            min="1"
                                            className="w-full p-3 pl-4 pr-12 bg-slate-100 dark:bg-slate-800 rounded-xl border-transparent focus:border-emerald-500 focus:ring-0 transition-all font-mono font-bold text-lg"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">kWh</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Revisa la gráfica de barras en tu factura de energía.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* SECCIÓN 2: HABITANTES Y TECNOLOGÍA */}
                        <section>
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                                <Users size={20} className="text-blue-500" /> Ocupantes y Equipos
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                                {/* Personas */}
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                                    <Users className="mx-auto mb-2 text-slate-400" size={24} />
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Personas</label>
                                    <input type="number" name="personas" min="1" value={formData.personas} onChange={handleChange} className="w-full text-center bg-transparent font-bold text-xl focus:outline-none" />
                                </div>

                                {/* TVs */}
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                                    <Tv className="mx-auto mb-2 text-slate-400" size={24} />
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Televisores</label>
                                    <input type="number" name="tvs" min="0" value={formData.tvs} onChange={handleChange} className="w-full text-center bg-transparent font-bold text-xl focus:outline-none" />
                                </div>

                                {/* PCs */}
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                                    <Monitor className="mx-auto mb-2 text-slate-400" size={24} />
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Computadores</label>
                                    <input type="number" name="pcs" min="0" value={formData.pcs} onChange={handleChange} className="w-full text-center bg-transparent font-bold text-xl focus:outline-none" />
                                </div>

                                {/* Lavadoras */}
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                                    <div className="mx-auto mb-2 text-slate-400 font-mono text-xl border-2 border-slate-400 w-8 h-8 rounded-full flex items-center justify-center">L</div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Lavadoras</label>
                                    <input type="number" name="lavadoras" min="0" value={formData.lavadoras} onChange={handleChange} className="w-full text-center bg-transparent font-bold text-xl focus:outline-none" />
                                </div>

                            </div>
                        </section>

                        {/* SECCIÓN 3: GRANDES CONSUMIDORES (CHECKBOXES) */}
                        <section>
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                                <Wind size={20} className="text-orange-500" /> Equipos Especiales
                            </h3>

                            <div className="space-y-3">
                                {/* Aire Acondicionado */}
                                <label className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${formData.aire ? 'bg-emerald-500/10 border-emerald-500 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${formData.aire ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                            <Wind size={20} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-slate-900 dark:text-white">Aire Acondicionado</span>
                                            <span className="text-xs text-slate-500">¿Tienes algún equipo de aire instalado?</span>
                                        </div>
                                    </div>
                                    <input type="checkbox" name="aire" checked={formData.aire} onChange={handleChange} className="w-6 h-6 accent-emerald-500" />
                                </label>

                                {/* Nevera Vieja */}
                                <label className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${formData.nevera_vieja ? 'bg-emerald-500/10 border-emerald-500 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${formData.nevera_vieja ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                            <Snowflake size={20} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-slate-900 dark:text-white">Nevera Antigua (&gt;10 años)</span>
                                            <span className="text-xs text-slate-500">Suelen consumir el doble de energía.</span>
                                        </div>
                                    </div>
                                    <input type="checkbox" name="nevera_vieja" checked={formData.nevera_vieja} onChange={handleChange} className="w-6 h-6 accent-emerald-500" />
                                </label>

                                {/* Nevera Inverter */}
                                <label className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${formData.nevera_inverter ? 'bg-emerald-500/10 border-emerald-500 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${formData.nevera_inverter ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <span className="block font-bold text-slate-900 dark:text-white">Tecnología Inverter</span>
                                            <span className="text-xs text-slate-500">¿Tienes nevera o lavadora moderna (Ahorradora)?</span>
                                        </div>
                                    </div>
                                    <input type="checkbox" name="nevera_inverter" checked={formData.nevera_inverter} onChange={handleChange} className="w-6 h-6 accent-emerald-500" />
                                </label>
                            </div>
                        </section>

                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            onClick={handleFinish}
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 text-lg shadow-xl shadow-emerald-500/20 rounded-xl transition-transform active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <Loader2 className="animate-spin" /> Procesando con IA...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Generar Diagnóstico <ArrowRight size={20} />
                                </span>
                            )}
                        </Button>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default ResidentialConfig;