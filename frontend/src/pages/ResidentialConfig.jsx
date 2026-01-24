import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, Users, MapPin, DollarSign, Zap, Check, ChevronRight, ChevronLeft,
    Sparkles, Target, Thermometer, Tv, WashingMachine, Refrigerator,
    Upload, FileText, Scan, Loader2, X,
    Utensils, Shirt, BedDouble, Monitor, Lightbulb, // Added Lightbulb
    Briefcase, Sun, Moon // Added Lifestyle Icons
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { residentialApi } from '../api/residential';

// Configuration Data
const houseTypes = [
    { id: 'apartment', name: 'Apartamento', icon: BuildingIcon },
    { id: 'house', name: 'Casa', icon: Home },
    { id: 'studio', name: 'Estudio/Loft', icon: MapPin },
];

// Expert Zone Configuration
const roomCategories = [
    {
        id: 'kitchen',
        name: 'Cocina',
        icon: Utensils,
        expertTip: 'La refrigeración es consumo 24/7.',
        items: ['fridge', 'stove_electric', 'airfryer', 'dishwasher'],
        itemsData: [
            { id: 'fridge', name: 'Nevera / Refrigerador', desc: 'Equipo de frío principal', expertCheck: '¿Tiene más de 10 años de antigüedad?', isHighImpact: true },
            { id: 'stove_electric', name: 'Estufa Eléctrica / Inducción', desc: 'Cocción principal', expertCheck: '¿Es de inducción (base de vidrio)?', isHighImpact: true },
            { id: 'airfryer', name: 'Air Fryer / Hornito', desc: 'Uso frecuente para calentar', expertCheck: null },
            { id: 'dishwasher', name: 'Lavavajillas', desc: 'Ciclos de lavado automático', expertCheck: '¿Usas el modo de secado con calor?', isHighImpact: true },
        ]
    },
    {
        id: 'laundry',
        name: 'Zona de Ropas & Agua',
        icon: Shirt,
        expertTip: 'Calentar agua es lo que más gasta.',
        items: ['washer', 'dryer', 'heater_electric'],
        itemsData: [
            { id: 'washer', name: 'Lavadora', desc: 'Lavado de ropa regular', expertCheck: '¿Lavas con agua caliente?', isHighImpact: false },
            { id: 'dryer', name: 'Secadora Eléctrica', desc: 'Secado por calor', expertCheck: '¿La usas más de 2 veces por semana?', isHighImpact: true },
            { id: 'heater_electric', name: 'Calentador de Agua Eléctrico', desc: 'Duchas y agua caliente', expertCheck: '¿Es de paso (sin tanque)?', isHighImpact: true },
        ]
    },
    {
        id: 'hvac',
        name: 'Climatización',
        icon: Thermometer,
        expertTip: 'El confort térmico cuesta.',
        items: ['ac', 'fan', 'heater_portable'],
        itemsData: [
            { id: 'ac', name: 'Aire Acondicionado', desc: 'Refrigeración de espacios', expertCheck: '¿Son tecnología Inverter (ahorradores)?', isHighImpact: true },
            { id: 'fan', name: 'Ventiladores de Techo/Piso', desc: 'Ventilación mecánica', expertCheck: null },
            { id: 'heater_portable', name: 'Calefacción Portátil', desc: 'Radiadores de aceite o resistencia', expertCheck: '¿Se usa toda la noche?', isHighImpact: true },
        ]
    },
    {
        id: 'tech',
        name: 'Entretenimiento',
        icon: Monitor,
        expertTip: 'El consumo "vampiro" silencioso.',
        items: ['tv', 'console', 'desktop'],
        itemsData: [
            { id: 'tv', name: 'Televisores Grandes (>50")', desc: 'Pantallas principales', expertCheck: '¿Quedan en standby (luz roja) siempre?', isHighImpact: false },
            { id: 'console', name: 'Consolas (PS5/Xbox/PC Gamer)', desc: 'Alto rendimiento gráfico', expertCheck: '¿Se usan más de 2 horas diarias?', isHighImpact: true },
            { id: 'desktop', name: 'Oficina en Casa', desc: 'Monitores y Torres de PC', expertCheck: '¿Trabajas desde casa (Home Office)?', isHighImpact: false },
        ]
    },
    {
        id: 'lighting',
        name: 'Iluminación',
        icon: Lightbulb,
        expertTip: 'Tecnología vieja = calor y gasto.',
        items: ['bulbs_old', 'smart_lights'],
        itemsData: [
            { id: 'bulbs_old', name: 'Bombillos Incandescentes/Halógenos', desc: 'Tecnología antigua (luz cálida que calienta)', expertCheck: '¿Son la mayoría de tus bombillos?', isHighImpact: true },
            { id: 'smart_lights', name: 'Iluminación Inteligente/Domótica', desc: 'Bombillos WiFi/Zigbee', expertCheck: null, isHighImpact: false },
        ]
    }
];

// Helper Icons
function BuildingIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M8 10h.01" />
            <path d="M16 10h.01" />
            <path d="M8 14h.01" />
            <path d="M16 14h.01" />
        </svg>
    );
}

function FlameIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.243-2.143.707-3.1" />
            <path d="M12 14v4" />
        </svg>
    )
}


const ResidentialConfig = () => {
    const navigate = useNavigate();
    const { setUserProfile, userProfile } = useUser();
    const [step, setStep] = useState(0); // Start at Step 0 for Upload
    const totalSteps = 3;

    // Zone Selection State
    const [activeZone, setActiveZone] = useState('kitchen');

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [scannedData, setScannedData] = useState(null);

    const [formData, setFormData] = useState({
        houseType: 'apartment',
        occupants: 2,
        area: 70,
        city: '',
        stratum: null,
        occupancyProfile: 'hybrid', // 'onsite', 'hybrid', 'remote'
        energySource: '',
        monthlyBill: '',
        averageKwh: '', // New field for technical consumption
        historyKwh: [], // New field for historical data
        budgetTarget: '',
        appliances: ['fridge', 'tv', 'washer'],
        applianceDetails: {}, // Stores the expert check answers (e.g., fridge_check: true)
    });

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleFinish = async () => {
        setIsUploading(true); // Reuse uploading state for final save
        // Determine strictness/difficulty based on budget gap
        let difficulty = 'normal';
        if (formData.monthlyBill && formData.budgetTarget) {
            const bill = parseFloat(formData.monthlyBill);
            const target = parseFloat(formData.budgetTarget);
            if (target < bill * 0.8) difficulty = 'hard'; // Seeking >20% savings
        }

        try {
            // 1. Save Profile
            const profileData = {
                house_type: formData.houseType,
                occupants: formData.occupants,
                area_sqm: formData.area,
                city: formData.city,
                stratum: formData.stratum,
                occupancy_profile: formData.occupancyProfile,
                energy_source: formData.energySource,
                monthly_bill_avg: parseFloat(formData.monthlyBill) || 0,
                target_monthly_bill: parseFloat(formData.budgetTarget) || 0,
                average_kwh_captured: parseFloat(formData.averageKwh) || 0,
                history_kwh: formData.historyKwh
            };
            await residentialApi.updateProfile(profileData);

            // 2. Prepare and Save Assets
            const assetsToBatch = formData.appliances.map(appId => {
                const room = roomCategories.find(z => z.items.includes(appId));
                const item = room?.itemsData.find(i => i.id === appId);
                return {
                    name: item?.name || appId,
                    icon: appId,
                    category: room?.id || 'general',
                    is_high_impact: item?.isHighImpact || false,
                    expert_check_value: formData.applianceDetails[appId + '_check'] || false,
                    status: true
                };
            });

            if (assetsToBatch.length > 0) {
                await residentialApi.addAssets(assetsToBatch);
            }

            // Update Global Context (keeping local state for immediate UI feedback)
            setUserProfile({
                type: 'residential',
                config: {
                    ...formData,
                    difficulty,
                    scannedData,
                    target_monthly_bill: parseFloat(formData.budgetTarget) || 0
                }
            });

            navigate('/dashboard');
        } catch (error) {
            console.error("Error saving residential setup:", error);
            // Optionally add a notification here
        } finally {
            setIsUploading(false);
        }
    };

    const toggleAppliance = (id) => {
        setFormData(prev => {
            const apps = prev.appliances.includes(id)
                ? prev.appliances.filter(a => a !== id)
                : [...prev.appliances, id];
            return { ...prev, appliances: apps };
        });
    };

    // File Upload Handlers (Simulated OCR)
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        setIsUploading(true);
        // SIMULATION: In a real app, this would send the file to an OCR backend
        setTimeout(() => {
            // Simulated Extracted Data (Based on user's Enel receipt)
            const extractedData = {
                city: 'bogota',
                stratum: 4,
                monthlyBill: '92470', // Valor Energía
                averageKwh: '115', // Consumo Mes Actual
                historyKwh: [129, 116, 119, 88, 91, 115] // Histórico 6 meses
            };

            setScannedData(extractedData);
            setFormData(prev => ({
                ...prev,
                city: extractedData.city,
                stratum: extractedData.stratum,
                monthlyBill: extractedData.monthlyBill,
                averageKwh: extractedData.averageKwh,
                historyKwh: extractedData.historyKwh
            }));

            setIsUploading(false);
            setStep(1); // Auto-advance to profile confirmation
        }, 2500); // 2.5s simulated delay
    };

    return (
        <div className="min-h-screen bg-slate-950 font-body text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-3xl relative z-10">
                {/* Header & Progress */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
                        Configuración Inicial
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                        {step === 0 ? 'Carga tu Recibo' : 'Personaliza tu Hogar'}
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        {step === 0
                            ? 'Déjanos extraer la información difícil por ti. Escanea tu factura y ahorra tiempo.'
                            : 'Ayúdanos a calibrar EcoIA para ofrecerte las mejores recomendaciones.'}
                    </p>
                </div>

                {/* Progress Bar (Visible from Step 1 onwards) */}
                {step > 0 && (
                    <div className="mb-12 animate-fadeIn">
                        <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 px-1">
                            <span className={step >= 1 ? "text-emerald-400" : ""}>Perfil</span>
                            <span className={step >= 2 ? "text-emerald-400" : ""}>Consumo</span>
                            <span className={step >= 3 ? "text-emerald-400" : ""}>Equipos</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 ease-out"
                                style={{ width: `${(step / totalSteps) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Content Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden transition-all duration-300">

                    {/* Step 0: Upload Receipt */}
                    {step === 0 && (
                        <div className="animate-fadeIn space-y-8 text-center">

                            {isUploading ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                                        <Scan size={64} className="text-emerald-400 animate-pulse relative z-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Analizando Recibo con IA...</h3>
                                    <p className="text-slate-400">Extrayendo consumo, estrato y tarifas</p>
                                    <Loader2 className="animate-spin text-emerald-500 mt-4" size={32} />
                                </div>
                            ) : (
                                <>
                                    <div
                                        className={`border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer group
                                        ${dragActive ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]' : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50'}`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById('file-upload').click()}
                                    >
                                        <input
                                            id="file-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*,.pdf"
                                            onChange={handleChange}
                                        />
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="size-20 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                <Upload size={32} className="text-emerald-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold text-white">Sube una foto de tu factura</h3>
                                                <p className="text-slate-400">Arrastra aquí o haz clic para seleccionar</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800 mt-2">
                                                <FileText size={12} />
                                                Soporta JPG, PNG, PDF
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative py-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-slate-800"></div>
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="bg-slate-900 px-4 text-slate-500 font-bold uppercase tracking-wider">O prefiere</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(1)}
                                        className="w-full py-4 text-slate-400 hover:text-white font-bold hover:bg-slate-800/50 rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        Ingresar datos manualmente
                                        <ChevronRight size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* Step 1: Home Profile & Location */}
                    {step === 1 && (
                        <div className="space-y-8 animate-fadeIn">
                            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                <Users className="text-emerald-400" size={28} />
                                Perfil y Ocupación
                            </h2>

                            {/* Occupancy Profile (Expert Addition) */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                                    Rutina del Hogar
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'onsite', icon: Briefcase, title: 'Fuera de Casa', desc: 'Vacío 8am-6pm. Consumo tarde/noche.' },
                                        { id: 'hybrid', icon: Sun, title: 'Híbrido / WFH', desc: 'Al menos una persona siempre en casa.' },
                                        { id: 'full', icon: Users, title: 'Casa Llena', desc: 'Múltiples personas y uso constante.' }
                                    ].map(profile => (
                                        <button
                                            key={profile.id}
                                            onClick={() => setFormData({ ...formData, occupancyProfile: profile.id })}
                                            className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all cursor-pointer
                                                ${formData.occupancyProfile === profile.id
                                                    ? 'bg-emerald-500/10 border-emerald-500 text-white'
                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'}`}
                                        >
                                            <profile.icon className="mb-2" size={24} />
                                            <span className="font-bold block">{profile.title}</span>
                                            <span className="text-xs opacity-70 mt-1">{profile.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {scannedData && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3 mb-6">
                                    <Sparkles className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <h4 className="font-bold text-emerald-400">¡Datos detectados!</h4>
                                        <p className="text-sm text-emerald-200/70">
                                            Detectamos que estás en <strong>Bogotá</strong> (Estrato 4). Verifica si es correcto.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Region and Stratum */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                                        Ciudad / Región
                                    </label>
                                    <select
                                        value={formData.city || ''}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="" disabled>Selecciona tu ciudad...</option>
                                        <option value="bogota">Bogotá (Frío)</option>
                                        <option value="medellin">Medellín (Templado)</option>
                                        <option value="cali">Cali (Cálido)</option>
                                        <option value="barranquilla">Barranquilla (Muy Cálido)</option>
                                        <option value="otros">Otra</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                                        Estrato Socioeconómico
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5, 6].map((st) => (
                                            <button
                                                key={st}
                                                onClick={() => setFormData({ ...formData, stratum: st })}
                                                className={`flex-1 h-12 rounded-lg font-bold border transition-all
                                            ${formData.stratum === st
                                                        ? 'bg-emerald-500 border-emerald-500 text-slate-900'
                                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-emerald-500/50'}`}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {houseTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => setFormData({ ...formData, houseType: type.id })}
                                        className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200
                                    ${formData.houseType === type.id
                                                ? 'border-emerald-500 bg-emerald-500/10 text-white'
                                                : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800'
                                            }`}
                                    >
                                        <type.icon size={32} />
                                        <span className="font-bold">{type.name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                                        <Users size={16} className="inline mr-2 mb-0.5" />
                                        Habitantes
                                    </label>
                                    <div className="flex items-center gap-4 bg-slate-950 rounded-xl p-2 border border-slate-800">
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, occupants: Math.max(1, prev.occupants - 1) }))}
                                            className="size-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
                                        >-</button>
                                        <span className="flex-1 text-center text-xl font-black text-white">{formData.occupants}</span>
                                        <button
                                            onClick={() => setFormData(prev => ({ ...prev, occupants: Math.min(20, prev.occupants + 1) }))}
                                            className="size-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
                                        >+</button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                                        <MapPin size={16} className="inline mr-2 mb-0.5" />
                                        Área Aprox. (m²)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.area}
                                        onChange={(e) => setFormData({ ...formData, area: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold text-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Consumption & Energy Source */}
                    {step === 2 && (
                        <div className="space-y-8 animate-fadeIn">
                            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                                <Target className="text-emerald-400" size={28} />
                                Energía y Metas
                            </h2>

                            {/* Energy Source Mix */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                                    Fuente de Cocina y Calentador
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'gas', label: 'Gas Natural', desc: 'Más común en cocina/agua' },
                                        { id: 'electric', label: 'Todo Eléctrico', desc: 'Inducción, duchas eléctricas' }
                                    ].map(source => (
                                        <button
                                            key={source.id}
                                            onClick={() => setFormData({ ...formData, energySource: source.id })}
                                            className={`p-4 rounded-xl border-2 text-left transition-all
                                        ${formData.energySource === source.id
                                                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                                                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'}`}
                                        >
                                            <div className="font-bold text-lg">{source.label}</div>
                                            <div className="text-xs opacity-70">{source.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* KWh Section (New) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative group">
                                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 block">
                                            Consumo (kWh/mes)
                                        </label>
                                        <div className="relative">
                                            <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500" size={20} />
                                            <input
                                                type="number"
                                                placeholder="Ej. 115"
                                                value={formData.averageKwh || ''}
                                                onChange={(e) => setFormData({ ...formData, averageKwh: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold text-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                                            />
                                        </div>
                                        {formData.historyKwh?.length > 0 && (
                                            <p className="text-xs text-emerald-400 mt-2 ml-1 flex items-center gap-1">
                                                <Check size={12} />
                                                Histórico extraído (6 meses)
                                            </p>
                                        )}
                                    </div>

                                    <div className="relative group">
                                        <label className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 block">
                                            Factura Promedio ($)
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                                            <input
                                                type="number"
                                                placeholder="Ej. 150000"
                                                value={formData.monthlyBill}
                                                onChange={(e) => setFormData({ ...formData, monthlyBill: e.target.value })}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold text-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2 ml-1">
                                            {scannedData
                                                ? 'Dato extraído automáticamente de tu factura.'
                                                : 'Usaremos esto para calcular tu ahorro potencial.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 block">
                                        Meta de Presupuesto ($)
                                    </label>
                                    <div className="relative">
                                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
                                        <input
                                            type="number"
                                            placeholder="Ej. 120000"
                                            value={formData.budgetTarget}
                                            onChange={(e) => setFormData({ ...formData, budgetTarget: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white font-bold text-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Zone-based Expert Configuration */}
                    {step === 3 && (
                        <div className="animate-fadeIn h-full flex flex-col md:flex-row gap-8">

                            {/* Left: Zones Navigation */}
                            <div className="md:w-1/3 space-y-4">
                                <h2 className="text-2xl font-display font-bold text-white mb-2">
                                    Recorrido Virtual
                                </h2>
                                <p className="text-slate-400 text-sm mb-6">
                                    Vamos espacio por espacio. Un experto necesita saber estos detalles para encontrar "vampiros" de energía.
                                </p>

                                <div className="space-y-2">
                                    {roomCategories.map((zone) => {
                                        const isActive = activeZone === zone.id;
                                        const count = zone.items.filter(id => formData.appliances.includes(id)).length;

                                        return (
                                            <button
                                                key={zone.id}
                                                onClick={() => setActiveZone(zone.id)}
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all relative overflow-hidden
                                                ${isActive
                                                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                                                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                                            >
                                                <div className="flex items-center gap-3 relative z-10">
                                                    <zone.icon size={20} className={isActive ? 'text-emerald-400' : 'text-slate-500'} />
                                                    <span className="font-bold">{zone.name}</span>
                                                </div>
                                                {count > 0 && (
                                                    <span className="bg-emerald-500 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {count}
                                                    </span>
                                                )}
                                                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent"></div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right: Specific Questions for Active Zone */}
                            <div className="md:w-2/3 bg-slate-950/50 rounded-2xl border border-slate-800 p-6 relative">
                                {roomCategories.map((zone) => (
                                    activeZone === zone.id && (
                                        <div key={zone.id} className="space-y-6 animate-fadeIn">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                    {zone.name}
                                                    <span className="text-xs font-normal text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">
                                                        {zone.expertTip}
                                                    </span>
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                {zone.itemsData.map((item) => {
                                                    const isSelected = formData.appliances.includes(item.id);
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            className={`p-4 rounded-xl border transition-all ${isSelected ? 'bg-slate-900 border-emerald-500/50' : 'bg-slate-900/20 border-slate-800'}`}
                                                        >
                                                            <div className="flex items-start gap-4">
                                                                <button
                                                                    onClick={() => toggleAppliance(item.id)}
                                                                    className={`mt-1 size-6 rounded border flex items-center justify-center shrink-0 transition-all
                                                                    ${isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600 hover:border-emerald-500'}`}
                                                                >
                                                                    {isSelected && <Check size={14} strokeWidth={4} />}
                                                                </button>

                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleAppliance(item.id)}>
                                                                        <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                                                            {item.name}
                                                                        </span>
                                                                        {item.isHighImpact && (
                                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                                                Alto Consumo
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>

                                                                    {/* Expert Follow-up Question (Only if selected) */}
                                                                    {isSelected && item.expertCheck && (
                                                                        <div className="mt-3 pl-3 border-l-2 border-slate-700">
                                                                            <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="accent-emerald-500 size-4 rounded"
                                                                                    checked={formData.applianceDetails?.[item.id + '_check'] || false}
                                                                                    onChange={(e) => setFormData(prev => ({
                                                                                        ...prev,
                                                                                        applianceDetails: {
                                                                                            ...prev.applianceDetails,
                                                                                            [item.id + '_check']: e.target.checked
                                                                                        }
                                                                                    }))}
                                                                                />
                                                                                {item.expertCheck}
                                                                            </label>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation Actions */}
                    <div className="pt-10 mt-6 border-t border-slate-800 flex items-center justify-between">
                        {step > 0 && (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                                <ChevronLeft size={20} />
                                Atrás
                            </button>
                        )}

                        {step > 0 && (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-xl font-black text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all ml-auto"
                            >
                                {step === totalSteps ? 'Finalizar Configuración' : 'Siguiente Paso'}
                                {step === totalSteps ? <Sparkles size={20} /> : <ChevronRight size={20} />}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ResidentialConfig;
