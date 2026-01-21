import React, { useState } from 'react';
import {
  Settings, Bell, Shield, User, Building2, Zap, Globe,
  Moon, Sun, ChevronRight, Save, Lock, Mail, Phone,
  CreditCard, FileText, HelpCircle, LogOut, AlertTriangle,
  CheckCircle, Trash2, RefreshCw
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Toggle Switch Component
const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      ${enabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}
      ${disabled && 'opacity-50 cursor-not-allowed'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
      ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

// Setting Item Component
const SettingItem = ({ icon: Icon, title, description, children, danger = false }) => (
  <div className={`flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0
    ${danger ? 'hover:bg-red-50 dark:hover:bg-red-900/10' : ''} transition-colors`}>
    <div className="flex items-center gap-4">
      <div className={`size-10 rounded-lg flex items-center justify-center
        ${danger ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
        <Icon size={20} />
      </div>
      <div>
        <h4 className={`font-bold ${danger ? 'text-red-600' : 'text-slate-800 dark:text-white'}`}>{title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {children}
    </div>
  </div>
);

// Settings Section Component
const SettingsSection = ({ icon: Icon, title, children }) => (
  <Card className="p-6 mb-6">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
      <Icon className="text-blue-500" size={24} />
      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
    </div>
    <div className="space-y-2">
      {children}
    </div>
  </Card>
);

const IndustrialSettings = () => {
  // Settings state
  const [settings, setSettings] = useState({
    // Notifications
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    dailyReports: true,
    weeklyReports: true,
    criticalAlerts: true,

    // Display
    darkMode: false,
    compactView: false,
    showCO2: true,

    // Security
    twoFactor: true,
    sessionTimeout: '30',

    // Energy
    autoOptimize: true,
    peakAlerts: true,
    budgetAlerts: true,
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3">
            <Settings className="text-blue-500" size={32} />
            Configuración Industrial
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Administra las preferencias del sistema de gestión energética.
          </p>
        </div>

        {/* Profile Section */}
        <SettingsSection icon={User} title="Perfil de Empresa">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                defaultValue="Industrias XYZ S.A."
                className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Sector Industrial
              </label>
              <select className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 py-2.5">
                <option>Manufactura</option>
                <option>Logística</option>
                <option>Comercio</option>
                <option>Salud</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Email de Contacto
              </label>
              <input
                type="email"
                defaultValue="energia@industriasxyz.com"
                className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 py-2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                defaultValue="+57 1 234 5678"
                className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 py-2.5"
              />
            </div>
          </div>
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection icon={Bell} title="Notificaciones">
          <SettingItem
            icon={Mail}
            title="Alertas por Email"
            description="Recibir notificaciones de consumo por correo"
          >
            <ToggleSwitch
              enabled={settings.emailAlerts}
              onChange={(v) => updateSetting('emailAlerts', v)}
            />
          </SettingItem>

          <SettingItem
            icon={Phone}
            title="Alertas SMS"
            description="Notificaciones críticas vía mensaje de texto"
          >
            <ToggleSwitch
              enabled={settings.smsAlerts}
              onChange={(v) => updateSetting('smsAlerts', v)}
            />
          </SettingItem>

          <SettingItem
            icon={Bell}
            title="Notificaciones Push"
            description="Alertas en tiempo real en el navegador"
          >
            <ToggleSwitch
              enabled={settings.pushNotifications}
              onChange={(v) => updateSetting('pushNotifications', v)}
            />
          </SettingItem>

          <SettingItem
            icon={FileText}
            title="Reportes Diarios"
            description="Resumen automático de consumo cada día"
          >
            <ToggleSwitch
              enabled={settings.dailyReports}
              onChange={(v) => updateSetting('dailyReports', v)}
            />
          </SettingItem>

          <SettingItem
            icon={AlertTriangle}
            title="Alertas Críticas"
            description="Notificaciones de picos y anomalías"
          >
            <ToggleSwitch
              enabled={settings.criticalAlerts}
              onChange={(v) => updateSetting('criticalAlerts', v)}
            />
          </SettingItem>
        </SettingsSection>

        {/* Energy Management */}
        <SettingsSection icon={Zap} title="Gestión Energética">
          <SettingItem
            icon={RefreshCw}
            title="Optimización Automática"
            description="IA ajusta parámetros para máxima eficiencia"
          >
            <ToggleSwitch
              enabled={settings.autoOptimize}
              onChange={(v) => updateSetting('autoOptimize', v)}
            />
          </SettingItem>

          <SettingItem
            icon={AlertTriangle}
            title="Alertas de Pico"
            description="Aviso cuando se acerca al límite contratado"
          >
            <ToggleSwitch
              enabled={settings.peakAlerts}
              onChange={(v) => updateSetting('peakAlerts', v)}
            />
          </SettingItem>

          <SettingItem
            icon={CreditCard}
            title="Alertas de Presupuesto"
            description="Notificar cuando el gasto excede el límite"
          >
            <ToggleSwitch
              enabled={settings.budgetAlerts}
              onChange={(v) => updateSetting('budgetAlerts', v)}
            />
          </SettingItem>

          <div className="pt-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Límite de Presupuesto Mensual
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                defaultValue="50000"
                className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 py-2.5 pl-8"
              />
            </div>
          </div>
        </SettingsSection>

        {/* Display Settings */}
        <SettingsSection icon={Globe} title="Visualización">
          <SettingItem
            icon={Moon}
            title="Modo Oscuro"
            description="Interfaz con tema oscuro"
          >
            <ToggleSwitch
              enabled={settings.darkMode}
              onChange={(v) => updateSetting('darkMode', v)}
            />
          </SettingItem>

          <SettingItem
            icon={Building2}
            title="Vista Compacta"
            description="Mostrar más información en menos espacio"
          >
            <ToggleSwitch
              enabled={settings.compactView}
              onChange={(v) => updateSetting('compactView', v)}
            />
          </SettingItem>

          <SettingItem
            icon={Zap}
            title="Mostrar CO₂"
            description="Visualizar emisiones junto al consumo"
          >
            <ToggleSwitch
              enabled={settings.showCO2}
              onChange={(v) => updateSetting('showCO2', v)}
            />
          </SettingItem>
        </SettingsSection>

        {/* Security Settings */}
        <SettingsSection icon={Shield} title="Seguridad">
          <SettingItem
            icon={Lock}
            title="Autenticación de Dos Factores"
            description="Capa adicional de seguridad para acceso"
          >
            <ToggleSwitch
              enabled={settings.twoFactor}
              onChange={(v) => updateSetting('twoFactor', v)}
            />
          </SettingItem>

          <div className="py-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Tiempo de Sesión Inactiva (minutos)
            </label>
            <select
              value={settings.sessionTimeout}
              onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
              className="w-full max-w-xs rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 py-2.5"
            >
              <option value="15">15 minutos</option>
              <option value="30">30 minutos</option>
              <option value="60">1 hora</option>
              <option value="120">2 horas</option>
            </select>
          </div>

          <div className="pt-4 flex gap-4">
            <Button variant="ghost" className="border border-slate-200 dark:border-slate-700">
              Cambiar Contraseña
            </Button>
            <Button variant="ghost" className="border border-slate-200 dark:border-slate-700">
              Ver Historial de Acceso
            </Button>
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <Card className="p-6 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-200 dark:border-red-900/30">
            <AlertTriangle className="text-red-600" size={24} />
            <h3 className="text-lg font-bold text-red-600">Zona de Peligro</h3>
          </div>

          <SettingItem
            icon={Trash2}
            title="Eliminar Datos Históricos"
            description="Borra permanentemente el historial de consumo"
            danger
          >
            <Button variant="danger" size="sm">
              Eliminar
            </Button>
          </SettingItem>

          <SettingItem
            icon={LogOut}
            title="Cerrar Todas las Sesiones"
            description="Desconecta todos los dispositivos activos"
            danger
          >
            <Button variant="danger" size="sm">
              Cerrar
            </Button>
          </SettingItem>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button className="bg-blue-500 hover:bg-blue-600" size="lg" icon={Save}>
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IndustrialSettings;
