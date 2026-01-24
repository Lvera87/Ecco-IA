import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Zap, Home, Factory, User, Mail, Lock, MapPin, Users, Building2,
    ArrowRight, ArrowLeft, CheckCircle, Loader2, Eye, EyeOff
} from 'lucide-react';
import Button from '../components/ui/Button';
import { authApi } from '../api/auth';

const InputField = ({ icon: Icon, label, ...props }) => (
    <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="relative">
            <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                {...props}
            />
        </div>
    </div>
);

const Register = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const userType = searchParams.get('type') || 'residential';

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        // Cuenta
        username: '',
        email: '',
        password: '',
        full_name: '',
        user_type: userType,
        // Residencial
        city: '',
        stratum: 3,
        occupants: 1,
        house_type: 'apartment',
        // Industrial
        company_name: ''
    });



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await authApi.register(formData);
            // Redirigir al dashboard correspondiente
            navigate(formData.user_type === 'residential' ? '/dashboard' : '/industrial-dashboard');

        } catch (err) {
            setError(err.message || 'Error al crear la cuenta');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1 && (!formData.full_name || !formData.email)) {
            setError('Por favor completa todos los campos');
            return;
        }
        if (step === 2 && (!formData.username || !formData.password || formData.password.length < 6)) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        setStep(s => s + 1);
        setError('');
    };

    return (
        <div className="min-h-screen bg-slate-950 font-body flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
                <div className={`absolute inset-0 ${formData.user_type === 'residential' ? 'bg-gradient-to-br from-emerald-600 to-teal-900' : 'bg-gradient-to-br from-blue-600 to-indigo-900'}`} />
                <div className="absolute inset-0 opacity-10">
                    <div className="grid grid-cols-4 gap-8 p-8 transform -rotate-12 scale-150">
                        {[...Array(16)].map((_, i) => (
                            formData.user_type === 'residential'
                                ? <Home key={i} className="w-16 h-16 text-white" />
                                : <Factory key={i} className="w-16 h-16 text-white" />
                        ))}
                    </div>
                </div>

                <div className="relative z-10 p-12 flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                            <Zap className="text-white" size={28} />
                        </div>
                        <span className="font-display text-2xl font-bold text-white">EccoIA</span>
                    </div>

                    <div className="space-y-6">
                        <h1 className="font-display text-5xl font-bold text-white leading-tight">
                            {formData.user_type === 'residential' ? 'Tu hogar, más inteligente' : 'Industria optimizada'}
                        </h1>

                        <p className="text-white/70 text-lg leading-relaxed max-w-md">
                            {formData.user_type === 'residential'
                                ? 'Controla el consumo energético de tu hogar con inteligencia artificial. Ahorra hasta un 30% en tu factura mensual.'
                                : 'Maximiza la eficiencia de tu planta industrial. Análisis predictivo y optimización en tiempo real.'}
                        </p>

                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-white/60 text-sm">
                                <CheckCircle size={16} className="text-emerald-400" />
                                <span>Configuración en 2 minutos</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60 text-sm">
                                <CheckCircle size={16} className="text-emerald-400" />
                                <span>IA integrada</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-white/40 text-sm">
                        © {new Date().getFullYear()} EccoIA. Energía consciente.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Progress */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex-1 h-1 rounded-full overflow-hidden bg-slate-800">
                                <div
                                    className={`h-full transition-all duration-500 ${step >= s ? (formData.user_type === 'residential' ? 'bg-emerald-500' : 'bg-blue-500') : ''}`}
                                    style={{ width: step >= s ? '100%' : '0%' }}
                                />

                            </div>
                        ))}
                    </div>

                    {/* Back Button */}
                    {step > 1 && (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft size={16} /> Atrás
                        </button>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Step 1: Info Personal */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="space-y-2">
                                    <h2 className="font-display text-3xl font-bold text-white">¡Bienvenido!</h2>
                                    <p className="text-slate-400">Cuéntanos un poco sobre ti</p>
                                </div>

                                <InputField
                                    icon={User}
                                    label="Nombre completo"
                                    name="full_name"
                                    type="text"
                                    placeholder="Juan García"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                />

                                <InputField
                                    icon={Mail}
                                    label="Correo electrónico"
                                    name="email"
                                    type="email"
                                    placeholder="juan@ejemplo.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className={`w-full h-14 text-white font-bold ${formData.user_type === 'residential' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'}`}

                                >
                                    Continuar <ArrowRight size={18} className="ml-2" />
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Credenciales */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="space-y-2">
                                    <h2 className="font-display text-3xl font-bold text-white">Crea tu cuenta</h2>
                                    <p className="text-slate-400">Elige tus credenciales de acceso</p>
                                </div>

                                <InputField
                                    icon={User}
                                    label="Nombre de usuario"
                                    name="username"
                                    type="text"
                                    placeholder="juangarcia"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            placeholder="Mínimo 6 caracteres"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-12 py-4 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className={`w-full h-14 text-white font-bold ${formData.user_type === 'residential' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'}`}

                                >
                                    Continuar <ArrowRight size={18} className="ml-2" />
                                </Button>
                            </div>
                        )}

                        {/* Step 3: Perfil Específico */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div className="space-y-2">
                                    <h2 className="font-display text-3xl font-bold text-white">
                                        {formData.user_type === 'residential' ? 'Tu hogar' : 'Tu empresa'}
                                    </h2>

                                    <p className="text-slate-400">
                                        {formData.user_type === 'residential' ? 'Configuración básica de tu vivienda' : 'Datos de tu organización'}
                                    </p>
                                </div>

                                {formData.user_type === 'residential' ? (

                                    <>
                                        <InputField
                                            icon={MapPin}
                                            label="Ciudad"
                                            name="city"
                                            type="text"
                                            placeholder="Bogotá"
                                            value={formData.city}
                                            onChange={handleChange}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estrato</label>
                                                <select
                                                    name="stratum"
                                                    value={formData.stratum}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-4 text-white focus:border-emerald-500 outline-none"
                                                >
                                                    {[1, 2, 3, 4, 5, 6].map(s => (
                                                        <option key={s} value={s}>Estrato {s}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Habitantes</label>
                                                <div className="relative">
                                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                    <input
                                                        type="number"
                                                        name="occupants"
                                                        min="1"
                                                        max="20"
                                                        value={formData.occupants}
                                                        onChange={handleChange}
                                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white focus:border-emerald-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo de vivienda</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { value: 'apartment', label: 'Apartamento', icon: Building2 },
                                                    { value: 'house', label: 'Casa', icon: Home }
                                                ].map((opt) => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setFormData(p => ({ ...p, house_type: opt.value }))}
                                                        className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.house_type === opt.value
                                                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                                            : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                                            }`}
                                                    >
                                                        <opt.icon size={20} />
                                                        <span className="font-medium">{opt.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <InputField
                                        icon={Factory}
                                        label="Nombre de la empresa"
                                        name="company_name"
                                        type="text"
                                        placeholder="Metalúrgica Norte S.A.S"
                                        value={formData.company_name}
                                        onChange={handleChange}
                                    />
                                )}

                                {error && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full h-14 text-white font-bold ${formData.user_type === 'residential' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'} disabled:opacity-50`}
                                >

                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="mr-2 animate-spin" /> Creando cuenta...
                                        </>
                                    ) : (
                                        <>
                                            Crear cuenta <CheckCircle size={18} className="ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {error && step < 3 && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-slate-500 mt-8">
                        ¿Ya tienes cuenta?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className={`font-bold hover:underline ${formData.user_type === 'residential' ? 'text-emerald-500' : 'text-blue-500'}`}
                        >

                            Inicia sesión
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
