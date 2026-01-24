import React, { useState } from 'react';
import {
    User, Mail, Phone, MapPin, Edit2, Camera, Shield, Bell,
    Palette, Globe, LogOut, ChevronRight, Moon, Sun, Check,
    Zap, Trophy, Target, Leaf
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useUI } from '../context/UIContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Toggle Switch Component
const ToggleSwitch = ({ enabled, onChange, label }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
        <button
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        ${enabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);

// Stat Badge
const StatBadge = ({ icon: Icon, value, label, color }) => (
    <div className="text-center">
        <div className={`size-12 mx-auto mb-2 rounded-xl ${color} flex items-center justify-center`}>
            <Icon size={24} className="text-white" />
        </div>
        <p className="text-xl font-black text-slate-800 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
);

const UserProfile = () => {
    const navigate = useNavigate();
    const { userProfile } = useUser();
    const { theme, setTheme } = useUI();
    // Default fallback values until goals are properly implemented in backend
    const goals = { monthlyBudget: 150000, co2Reduction: 15 };

    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@email.com',
        phone: '+57 310 555 1234',
        location: 'Medellín, Colombia',
    });

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        weekly: true,
        tips: true,
    });

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Profile Header */}
                <Card className="relative overflow-hidden">
                    {/* Background gradient banner */}
                    <div className="h-40 bg-gradient-to-r from-emerald-500 to-cyan-500 relative">
                        {/* Pattern overlay for premium feel */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    </div>

                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-end -mt-16 gap-6 relative z-10">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="size-32 rounded-full bg-white dark:bg-slate-900 border-4 border-white dark:border-slate-900 shadow-2xl flex items-center justify-center overflow-hidden">
                                    <div className="size-full bg-gradient-to-br from-primary/10 to-cyan-400/10 flex items-center justify-center">
                                        <User size={48} className="text-primary" />
                                    </div>
                                </div>
                                <button className="absolute bottom-1 right-1 size-8 rounded-full bg-slate-800 text-white border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-lg hover:bg-slate-700 transition-colors">
                                    <Camera size={14} />
                                </button>
                                {/* Level badge */}
                                <div className="absolute top-1 right-1 size-8 rounded-full bg-emerald-500 text-white border-2 border-white dark:border-slate-900 flex items-center justify-center text-sm font-black shadow-lg">
                                    {userProfile.level}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center md:text-left mb-2">
                                <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
                                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{profileData.name}</h1>
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider">
                                        {userProfile.name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <Mail size={14} />
                                        {profileData.email}
                                    </span>
                                    <span className="hidden md:flex items-center gap-1.5">
                                        <MapPin size={14} />
                                        Medellín, CO
                                    </span>
                                </div>
                            </div>

                            {/* XP Bar & Actions */}
                            <div className="flex flex-col items-end gap-4 w-full md:w-auto mb-2">
                                <Button
                                    size="sm"
                                    variant={editMode ? 'primary' : 'outline'}
                                    className={!editMode ? "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800" : ""}
                                    icon={editMode ? Check : Edit2}
                                    onClick={() => setEditMode(!editMode)}
                                >
                                    {editMode ? 'Guardar' : 'Editar Perfil'}
                                </Button>
                            </div>
                        </div>

                        {/* XP Progress - Full width under info */}
                        <div className="mt-8 max-w-2xl mx-auto md:mx-0">
                            <div className="flex justify-between text-xs mb-2 font-bold tracking-wide">
                                <span className="text-slate-500 uppercase">Progreso de Nivel</span>
                                <span className="text-primary">{userProfile.xp} / {userProfile.xpToNext} XP</span>
                            </div>
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                    style={{ width: `${(userProfile.xp / userProfile.xpToNext) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="relative z-10 grid grid-cols-4 gap-6 mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                        <StatBadge icon={Zap} value="94%" label="Eficiencia" color="bg-blue-500" />
                        <StatBadge icon={Target} value={`$${(goals.monthlyBudget / 1000).toFixed(0)}K`} label="Presupuesto" color="bg-emerald-500" />
                        <StatBadge icon={Leaf} value={`${goals.co2Reduction}%`} label="Reducción CO₂" color="bg-teal-500" />
                        <StatBadge icon={Trophy} value={userProfile.streak} label="Días racha" color="bg-amber-500" />
                    </div>
                </Card>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Info */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <User className="text-primary" size={20} />
                            Información Personal
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Nombre completo
                                </label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary"
                                    />
                                ) : (
                                    <p className="text-slate-800 dark:text-white font-medium flex items-center gap-2">
                                        <User size={16} className="text-slate-400" />
                                        {profileData.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Email
                                </label>
                                {editMode ? (
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary"
                                    />
                                ) : (
                                    <p className="text-slate-800 dark:text-white font-medium flex items-center gap-2">
                                        <Mail size={16} className="text-slate-400" />
                                        {profileData.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Teléfono
                                </label>
                                {editMode ? (
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary"
                                    />
                                ) : (
                                    <p className="text-slate-800 dark:text-white font-medium flex items-center gap-2">
                                        <Phone size={16} className="text-slate-400" />
                                        {profileData.phone}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Ubicación
                                </label>
                                {editMode ? (
                                    <input
                                        type="text"
                                        value={profileData.location}
                                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                        className="w-full rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary"
                                    />
                                ) : (
                                    <p className="text-slate-800 dark:text-white font-medium flex items-center gap-2">
                                        <MapPin size={16} className="text-slate-400" />
                                        {profileData.location}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Preferences */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Palette className="text-primary" size={20} />
                            Preferencias
                        </h2>

                        <div className="space-y-6">
                            {/* Theme */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    Tema de la aplicación
                                </label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all
                      ${theme === 'light'
                                                ? 'border-primary bg-primary/5'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                                    >
                                        <Sun size={20} className={theme === 'light' ? 'text-primary' : 'text-slate-400'} />
                                        <span className={theme === 'light' ? 'font-bold text-primary' : 'text-slate-600 dark:text-slate-300'}>
                                            Claro
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`flex-1 p-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all
                      ${theme === 'dark'
                                                ? 'border-primary bg-primary/5'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'}`}
                                    >
                                        <Moon size={20} className={theme === 'dark' ? 'text-primary' : 'text-slate-400'} />
                                        <span className={theme === 'dark' ? 'font-bold text-primary' : 'text-slate-600 dark:text-slate-300'}>
                                            Oscuro
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Notifications */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    Notificaciones
                                </label>
                                <div className="space-y-3">
                                    <ToggleSwitch
                                        label="Notificaciones por email"
                                        enabled={notifications.email}
                                        onChange={(v) => setNotifications({ ...notifications, email: v })}
                                    />
                                    <ToggleSwitch
                                        label="Notificaciones push"
                                        enabled={notifications.push}
                                        onChange={(v) => setNotifications({ ...notifications, push: v })}
                                    />
                                    <ToggleSwitch
                                        label="Resumen semanal"
                                        enabled={notifications.weekly}
                                        onChange={(v) => setNotifications({ ...notifications, weekly: v })}
                                    />
                                    <ToggleSwitch
                                        label="Tips de ahorro"
                                        enabled={notifications.tips}
                                        onChange={(v) => setNotifications({ ...notifications, tips: v })}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Security */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Shield className="text-primary" size={20} />
                            Seguridad
                        </h2>

                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Cambiar contraseña</span>
                                <ChevronRight size={20} className="text-slate-400" />
                            </button>

                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Autenticación de dos factores</span>
                                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-bold">
                                    Activo
                                </span>
                            </button>

                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Dispositivos conectados</span>
                                <span className="text-sm text-slate-400">3 dispositivos</span>
                            </button>

                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Historial de sesiones</span>
                                <ChevronRight size={20} className="text-slate-400" />
                            </button>
                        </div>
                    </Card>

                    {/* Actions */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Globe className="text-primary" size={20} />
                            Cuenta
                        </h2>

                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Idioma</span>
                                <span className="text-sm text-slate-400 flex items-center gap-1">
                                    🇪🇸 Español
                                    <ChevronRight size={16} />
                                </span>
                            </button>

                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Exportar mis datos</span>
                                <ChevronRight size={20} className="text-slate-400" />
                            </button>

                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="font-medium text-slate-700 dark:text-slate-300">Términos y condiciones</span>
                                <ChevronRight size={20} className="text-slate-400" />
                            </button>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-bold"
                            >
                                <LogOut size={20} />
                                Cerrar sesión
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
