import React, { useState, useEffect } from 'react';
import {
  Settings, Bell, Shield, User, Building2, Zap, Globe,
  Moon, Sun, ChevronRight, Save, Lock, Mail, Phone,
  CreditCard, FileText, HelpCircle, LogOut, AlertTriangle,
  CheckCircle, Trash2, RefreshCw, Loader2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { settingsApi } from '../api/settings';

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
  <Card className="p-6 mb-6 overflow-visible">
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
    company_name: '',
    industry_sector: 'Manufactura',
    contact_email: '',
    monthly_budget_limit: 50000.0,
    auto_optimize: true,
    email_alerts: true,
    sms_alerts: false,
    push_notifications: true,
    critical_alerts: true,
    dark_mode: false,
    show_co2: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsApi.getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setMessage({ text: 'Error al cargar la configuración.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const updated = await settingsApi.updateSettings(settings);
      setSettings(updated);
      setMessage({ text: 'Configuración guardada exitosamente.', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ text: 'Error al guardar los cambios.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="text-blue-500 animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 pb-24">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3">
              <Settings className="text-blue-500" size={32} />
              Configuración Industrial
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Administra las preferencias del sistema de gestión energética.
            </p>
          </div>

          {message.text && (
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              <span className="text-sm font-bold">{message.text}</span>
            </div>
          )}
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
                value={settings.company_name}
                onChange={(e) => updateSetting('company_name', e.target.value)}
                className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 py-2.5 px-4 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Sector Industrial
              </label>
              <select
                value={settings.industry_sector}
                onChange={(e) => updateSetting('industry_sector', e.target.value)}
                className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 py-2.5 px-4 outline-none transition-all"
              >
                <option value="Manufactura">Manufactura General</option>
                <option value="Alimentos">Alimentos y Bebidas</option>
                <option value="Textil">Textil y Moda</option>
                <option value="Química">Química y Petróleo</option>
                <option value="Logística">Logística y Almacenamiento</option>
                <option value="Comercio">Retail / Gran Superficie</option>
                <option value="Salud">Centros de Salud / Hospitales</option>
                <option value="Minería">Minería y Energía</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Email de Contacto
              </label>
              <input
                type="email"
                value={settings.contact_email || ''}
                onChange={(e) => updateSetting('contact_email', e.target.value)}
                placeholder="ejemplo@empresa.com"
                className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 py-2.5 px-4 outline-none transition-all"
              />
            </div>
          </div>
        </SettingsSection>

        {/* Energy Management */}
        <SettingsSection icon={Zap} title="Gestión Energética">
          <SettingItem
            icon={RefreshCw}
            title="Optimización Automática"
            description="La IA ajusta parámetros en tiempo real para máxima eficiencia"
          >
            <ToggleSwitch
              enabled={settings.auto_optimize}
              onChange={(v) => updateSetting('auto_optimize', v)}
            />
          </SettingItem>

          <div className="pt-4 max-w-xs">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Límite de Presupuesto Mensual (COP)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                value={settings.monthly_budget_limit}
                onChange={(e) => updateSetting('monthly_budget_limit', parseFloat(e.target.value))}
                className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-blue-500 focus:border-blue-500 py-2.5 pl-8 pr-4 outline-none transition-all"
              />
            </div>
          </div>
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection icon={Bell} title="Notificaciones">
          <SettingItem
            icon={Mail}
            title="Alertas por Email"
            description="Recibir resúmenes y alertas críticas por correo"
          >
            <ToggleSwitch
              enabled={settings.email_alerts}
              onChange={(v) => updateSetting('email_alerts', v)}
            />
          </SettingItem>

          <SettingItem
            icon={Phone}
            title="Alertas SMS"
            description="Notificaciones de emergencia directo a tu móvil"
          >
            <ToggleSwitch
              enabled={settings.sms_alerts}
              onChange={(v) => updateSetting('sms_alerts', v)}
            />
          </SettingItem>

          <SettingItem
            icon={Bell}
            title="Notificaciones Push"
            description="Alertas instantáneas en el panel de control"
          >
            <ToggleSwitch
              enabled={settings.push_notifications}
              onChange={(v) => updateSetting('push_notifications', v)}
            />
          </SettingItem>

          <SettingItem
            icon={AlertTriangle}
            title="Alertas de Anomalías IA"
            description="Aviso inmediato cuando la IA detecta desperdicio líquido"
          >
            <ToggleSwitch
              enabled={settings.critical_alerts}
              onChange={(v) => updateSetting('critical_alerts', v)}
            />
          </SettingItem>
        </SettingsSection>

        {/* Visual Settings */}
        <SettingsSection icon={Globe} title="Visualización">
          <SettingItem
            icon={Moon}
            title="Modo Oscuro"
            description="Activar interfaz visual de alto contraste"
          >
            <ToggleSwitch
              enabled={settings.dark_mode}
              onChange={(v) => updateSetting('dark_mode', v)}
            />
          </SettingItem>

          <SettingItem
            icon={Zap}
            title="Mostrar Huella CO₂"
            description="Visualizar el impacto ambiental junto al consumo"
          >
            <ToggleSwitch
              enabled={settings.show_co2}
              onChange={(v) => updateSetting('show_co2', v)}
            />
          </SettingItem>
        </SettingsSection>

        {/* Save Bar (Fixed at bottom) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 z-50">
          <div className="max-w-[900px] mx-auto flex justify-between items-center">
            <span className="text-sm text-slate-500 hidden md:block">Los cambios se aplicarán a toda la organización.</span>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white min-w-[200px]"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustrialSettings;
