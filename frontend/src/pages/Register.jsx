import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Zap, Home, Factory, User, Mail, Lock,
    ArrowRight, CheckCircle, Loader2, Eye, EyeOff
} from 'lucide-react';
import Button from '../components/ui/Button';
import { authApi } from '../api/auth';

const InputField = ({ icon: Icon, label, ...props }) => (
    <div className="space-y-2 text-left">
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

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        full_name: '',
        user_type: userType,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'email') {
                newData.username = value; // Sync username with email
            }
            return newData;
        });
        setError('');
    };

    // --- AQUÍ ESTÁ EL CAMBIO IMPORTANTE ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.full_name || !formData.email || !formData.password) {
            setError('Por favor completa todos los campos obligatorios');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            setLoading(false);
            return;
        }

        try {
            // 1. REGISTRAR EL USUARIO
            console.log("Creando usuario...");
            await authApi.register(formData);

            // 2. AUTO-LOGIN (Iniciar sesión automáticamente)
            console.log("Iniciando sesión automática...");
            const loginResponse = await authApi.login({
                username: formData.email,
                password: formData.password
            });

            // 3. GUARDAR EL TOKEN (Esto arregla el error 401)
            if (loginResponse.access_token) {
                localStorage.setItem('token', loginResponse.access_token);
                console.log("✅ Token guardado correctamente");
            }

            // 4. REDIRIGIR
            navigate(formData.user_type === 'residential' ? '/residential-config' : '/industrial-onboarding');

        } catch (err) {
            console.error("Error en registro:", err);
            setError(err.message || 'Error al crear la cuenta. Intenta iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };
    // --------------------------------------

    return (
        <div className="min-h-screen bg-slate-950 font-body text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className={`absolute top-[-10%] right-[-5%] w-[500px] h-[500px] ${formData.user_type === 'residential' ? 'bg-emerald-500/10' : 'bg-blue-500/10'} rounded-full blur-[100px]`}></div>
                <div className={`absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] ${formData.user_type === 'residential' ? 'bg-emerald-500/5' : 'bg-blue-500/5'} rounded-full blur-[100px]`}></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="mb-8 text-center flex flex-col items-center">
                    <div className={`inline-flex items-center justify-center p-3 rounded-2xl border ${formData.user_type === 'residential' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'} mb-6 shadow-xl`}>
                        {formData.user_type === 'residential' ? <Home size={28} /> : <Factory size={28} />}
                    </div>
                    <h1 className="font-display text-3xl font-bold text-white mb-2">Crea tu cuenta</h1>
                    <p className="text-slate-400">
                        Estás a un paso de optimizar tu energía {formData.user_type === 'residential' ? 'hogar' : 'negocio'}.
                    </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <InputField
                            icon={User}
                            label="Nombre Completo"
                            name="full_name"
                            type="text"
                            placeholder="Juan Pérez"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                        />

                        <InputField
                            icon={Mail}
                            label="Correo Electrónico"
                            name="email"
                            type="email"
                            placeholder="juan@ejemplo.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <div className="space-y-2 relative">
                            <InputField
                                icon={Lock}
                                label="Contraseña"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[38px] text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-shake">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className={`w-full h-14 text-white font-black text-lg transition-all transform active:scale-[0.98] ${formData.user_type === 'residential'
                                ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                                : 'bg-blue-500 hover:bg-blue-400 shadow-blue-500/20'} shadow-lg`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-3 justify-center">
                                    <Loader2 size={20} className="animate-spin" />
                                    Creando cuenta...
                                </span>
                            ) : (
                                <span className="flex items-center gap-3 justify-center">
                                    Siguiente paso
                                    <ArrowRight size={20} />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                        <p className="text-sm text-slate-500">
                            ¿Ya tienes cuenta?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className={`font-bold hover:underline ${formData.user_type === 'residential' ? 'text-emerald-400' : 'text-blue-400'}`}
                            >
                                Inicia sesión
                            </button>
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-slate-600">
                    <CheckCircle size={14} className="text-emerald-500/50" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Conexión Encriptada AES-256</span>
                </div>
            </div>
        </div>
    );
};

export default Register;