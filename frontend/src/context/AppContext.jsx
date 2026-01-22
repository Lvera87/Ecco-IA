import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    Refrigerator, AirVent, Tv, WashingMachine, Lightbulb,
    Microwave, Fan, Monitor, Droplets, Flame,
    Zap, Clock, Leaf, Target, Crown
} from 'lucide-react';

// Initial appliances data
const defaultAppliances = [
    { id: 1, name: 'Nevera Inteligente', icon: 'Refrigerator', consumption: 1.2, status: true, efficiency: 'high', mode: 'eco', usageHours: 24, category: 'cocina' },
    { id: 2, name: 'Aire Acondicionado', icon: 'AirVent', consumption: 2.5, status: true, efficiency: 'medium', mode: 'eco', usageHours: 8, category: 'climatizacion' },
    { id: 3, name: 'Televisor Salón', icon: 'Tv', consumption: 0.15, status: false, efficiency: 'off', mode: 'normal', usageHours: 4, category: 'entretenimiento' },
    { id: 4, name: 'Lavadora', icon: 'WashingMachine', consumption: 0.8, status: true, efficiency: 'medium', mode: 'eco', usageHours: 2, category: 'lavanderia' },
    { id: 5, name: 'Iluminación LED', icon: 'Lightbulb', consumption: 0.2, status: true, efficiency: 'high', mode: 'auto', usageHours: 6, category: 'iluminacion' },
];

// Initial notifications
const defaultNotifications = [
    { id: 1, type: 'alert', title: 'Consumo elevado detectado', message: 'El aire acondicionado ha superado el límite diario.', time: 'Hace 5 min', read: false },
    { id: 2, type: 'tip', title: 'Consejo de ahorro', message: 'Programa tu lavadora en horario nocturno para ahorrar un 15%.', time: 'Hace 1 hora', read: false },
    { id: 3, type: 'achievement', title: '¡Logro desbloqueado!', message: 'Has completado 7 días de ahorro consecutivo.', time: 'Hace 2 horas', read: true },
    { id: 4, type: 'system', title: 'Actualización disponible', message: 'Nueva versión de EccoIA con mejoras de rendimiento.', time: 'Ayer', read: true },
];

// User goals
const defaultGoals = {
    monthlyBudget: 150000,
    savingsTarget: 15,
    co2Reduction: 20,
    efficiencyScore: 85,
};

// Icon mapping
export const iconMap = {
    Refrigerator,
    AirVent,
    Tv,
    WashingMachine,
    Lightbulb,
    Microwave,
    Fan,
    Monitor,
    Droplets,
    Flame,
    Zap,
    Clock,
    Target,
    Leaf,
    Crown,
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
    // User profile state
    const [userProfile, setUserProfile] = useState(() => {
        const saved = localStorage.getItem('eccoIA_userProfile');
        return saved ? JSON.parse(saved) : {
            type: null, // 'residential' or 'industrial'
            name: 'Eco-Explorador',
            level: 12,
            xp: 750,
            xpToNext: 1000,
            streak: 7,
        };
    });

    // Appliances state
    const [appliances, setAppliances] = useState(() => {
        const saved = localStorage.getItem('eccoIA_appliances');
        return saved ? JSON.parse(saved) : defaultAppliances;
    });

    // Notifications state
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('eccoIA_notifications');
        return saved ? JSON.parse(saved) : defaultNotifications;
    });

    // Goals state
    const [goals, setGoals] = useState(() => {
        const saved = localStorage.getItem('eccoIA_goals');
        return saved ? JSON.parse(saved) : defaultGoals;
    });

    // Theme state
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('eccoIA_theme');
        return saved || 'dark';
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('eccoIA_userProfile', JSON.stringify(userProfile));
    }, [userProfile]);

    useEffect(() => {
        localStorage.setItem('eccoIA_appliances', JSON.stringify(appliances));
    }, [appliances]);

    useEffect(() => {
        localStorage.setItem('eccoIA_notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('eccoIA_goals', JSON.stringify(goals));
    }, [goals]);

    useEffect(() => {
        localStorage.setItem('eccoIA_theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    // Missions state
    const [missions, setMissions] = useState(() => {
        const saved = localStorage.getItem('eccoIA_missions');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'Ahorro Matutino', description: 'Reduce tu consumo en un 10% durante las horas pico matutinas.', xp: 50, progress: 8, maxProgress: 10, status: 'active', difficulty: 'easy', icon: 'Zap', category: 'daily' },
            { id: 2, title: 'Semana Verde', description: 'Mantén tu huella de carbono por debajo del promedio durante 7 días.', xp: 200, progress: 7, maxProgress: 7, status: 'claimable', difficulty: 'medium', icon: 'Leaf', category: 'weekly' },
            { id: 3, title: 'Desconexión Nocturna', description: 'Apaga todos los dispositivos no esenciales después de las 10 PM.', xp: 30, progress: 5, maxProgress: 5, status: 'completed', difficulty: 'easy', icon: 'Clock', category: 'daily' },
            { id: 4, title: 'Maestro del Termostato', description: 'Mantén tu AC en modo eco durante toda la semana.', xp: 150, progress: 3, maxProgress: 7, status: 'active', difficulty: 'medium', icon: 'Target', category: 'weekly' },
            { id: 5, title: 'Cazador de Vampiros', description: 'Identifica y elimina 5 fuentes de consumo fantasma.', xp: 100, progress: 2, maxProgress: 5, status: 'active', difficulty: 'medium', icon: 'Flame', category: 'challenge' },
            { id: 6, title: 'Eficiencia Extrema', description: 'Alcanza un puntaje de eficiencia de 95% o superior.', xp: 500, progress: 0, maxProgress: 1, status: 'locked', difficulty: 'hard', icon: 'Crown', category: 'special' },
        ];
    });

    useEffect(() => {
        localStorage.setItem('eccoIA_missions', JSON.stringify(missions));
    }, [missions]);

    // Consumption History state
    const [consumptionHistory, setConsumptionHistory] = useState(() => {
        const saved = localStorage.getItem('eccoIA_consumptionHistory');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('eccoIA_consumptionHistory', JSON.stringify(consumptionHistory));
    }, [consumptionHistory]);

    const claimMission = (missionId) => {
        setMissions(prev => prev.map(m => {
            if (m.id === missionId && m.status === 'claimable') {
                addXP(m.xp);
                addNotification({
                    type: 'achievement',
                    title: '¡Misión Completada!',
                    message: `Has ganado ${m.xp} XP por completar: ${m.title}`,
                });
                return { ...m, status: 'completed' };
            }
            return m;
        }));
    };

    const addConsumptionReading = (reading) => {
        setConsumptionHistory(prev => {
            const newHistory = [...prev, reading];
            // Ordenar por fecha descendente
            return newHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
        });

        addNotification({
            type: 'system',
            title: 'Lectura Registrada',
            message: 'Tu consumo ha sido actualizado.',
        });
    };

    // Appliance actions
    const addAppliance = (appliance) => {
        const newAppliance = {
            ...appliance,
            id: Date.now(),
            status: true,
            efficiency: 'medium',
            mode: 'normal',
        };
        setAppliances(prev => [...prev, newAppliance]);
        addNotification({
            type: 'system',
            title: 'Dispositivo agregado',
            message: `${appliance.name} se ha añadido correctamente.`,
        });
    };

    const updateAppliance = (id, updates) => {
        setAppliances(prev => prev.map(app =>
            app.id === id ? { ...app, ...updates } : app
        ));
    };

    const removeAppliance = (id) => {
        const appliance = appliances.find(a => a.id === id);
        setAppliances(prev => prev.filter(app => app.id !== id));
        if (appliance) {
            addNotification({
                type: 'system',
                title: 'Dispositivo eliminado',
                message: `${appliance.name} se ha eliminado.`,
            });
        }
    };

    const toggleAppliance = (id) => {
        setAppliances(prev => prev.map(app =>
            app.id === id ? { ...app, status: !app.status, efficiency: !app.status ? 'medium' : 'off' } : app
        ));
    };

    // Notification actions
    const addNotification = (notification) => {
        const newNotification = {
            ...notification,
            id: Date.now(),
            time: 'Ahora',
            read: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markNotificationAsRead = (id) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    // Profile actions
    const setProfileType = (type) => {
        setUserProfile(prev => ({ ...prev, type }));
    };

    const addXP = (amount) => {
        setUserProfile(prev => {
            const newXP = prev.xp + amount;
            if (newXP >= prev.xpToNext) {
                return {
                    ...prev,
                    level: prev.level + 1,
                    xp: newXP - prev.xpToNext,
                    xpToNext: Math.floor(prev.xpToNext * 1.2),
                };
            }
            return { ...prev, xp: newXP };
        });
    };

    // Goals actions
    const updateGoals = (newGoals) => {
        setGoals(prev => ({ ...prev, ...newGoals }));
        addNotification({
            type: 'system',
            title: 'Metas actualizadas',
            message: 'Tus objetivos se han guardado correctamente.',
        });
    };

    // Computed values
    const unreadNotificationsCount = notifications.filter(n => !n.read).length;
    const activeAppliancesCount = appliances.filter(a => a.status).length;
    const totalConsumption = appliances.filter(a => a.status).reduce((sum, a) => sum + a.consumption, 0);

    const value = {
        // State
        userProfile,
        appliances,
        notifications,
        goals,
        theme,

        // Computed
        unreadNotificationsCount,
        activeAppliancesCount,
        totalConsumption,

        // Actions
        setUserProfile,
        setAppliances,
        setConsumptionHistory,
        setProfileType,
        addXP,
        addAppliance,
        updateAppliance,
        removeAppliance,
        toggleAppliance,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        updateGoals,
        setTheme,
        // Missions
        missions,
        claimMission,
        iconMap, // Added iconMap to context

        // Consumption
        consumptionHistory,
        addConsumptionReading,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// Hook to use context
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export default AppContext;
