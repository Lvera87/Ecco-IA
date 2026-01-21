
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulating login delay
        setTimeout(() => {
            setLoading(false);
            navigate('/profile-selection');
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 font-body">
            {/* Architectural Background */}
            <div className="absolute inset-0 tech-grid-pattern pointer-events-none"></div>

            {/* Subtle Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>

            <Card className="w-full max-w-md relative z-10 bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-sm p-0 overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary-blue"></div>
                <div className="p-8 md:p-10">
                    <div className="flex flex-col items-center mb-10">
                        <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 mb-6 shadow-inner">
                            <Zap size={24} className="text-primary" fill="currentColor" />
                        </div>
                        <h1 className="font-display text-3xl font-bold text-white tracking-tight">Bienvenido</h1>
                        <p className="text-slate-400 text-sm mt-2 text-center max-w-[250px]">
                            Accede al ecosistema inteligente de EccoIA.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <Input
                            label="Correo Electrónico"
                            type="email"
                            placeholder="ejemplo@empresa.com"
                            icon={Mail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div className="space-y-1">
                            <Input
                                label="Contraseña"
                                type="password"
                                placeholder="••••••••"
                                icon={Lock}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="flex justify-end">
                                <a href="#" className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                        </div>

                        <Button className="w-full shadow-lg shadow-primary/20" size="lg" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Procesando...
                                </span>
                            ) : 'Iniciar Sesión'}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700/50 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            ¿No tienes una cuenta?{' '}
                            <a href="#" className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">
                                Regístrate
                            </a>
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Login;

