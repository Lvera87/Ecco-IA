import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, User } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { authApi } from '../api/auth';

const Login = () => {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState(''); // Puede ser email o username
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await authApi.login(identifier, password);

            // Redirección inteligente según el tipo de usuario
            if (data.user_type === 'industrial') {
                navigate('/industrial-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión. Revisa tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 font-body">
            {/* Architectural Background */}
            <div className="absolute inset-0 tech-grid-pattern pointer-events-none"></div>

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
                            label="Usuario o Email"
                            type="text"
                            placeholder="ejemplo@empresa.com"
                            icon={User}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
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
                            {error && (
                                <p className="text-xs text-red-500 mt-2 font-medium">
                                    {error}
                                </p>
                            )}
                        </div>

                        <Button
                            className="w-full shadow-lg shadow-primary/20 bg-primary text-slate-900 font-bold h-12"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="size-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></span>
                                    Cargando...
                                </span>
                            ) : 'Iniciar Sesión'}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                        <p className="text-sm text-slate-400">
                            ¿No tienes una cuenta?{' '}
                            <button
                                onClick={() => navigate('/profile-selection')}
                                className="font-bold text-white hover:text-primary transition-colors"
                            >
                                Regístrate
                            </button>
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Login;

