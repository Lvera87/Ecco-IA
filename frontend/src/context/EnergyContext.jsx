import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    Refrigerator, AirVent, Tv, WashingMachine, Lightbulb,
    Microwave, Fan, Monitor, Droplets, Flame, Zap, Clock, Target, Leaf, Crown
} from 'lucide-react';
import { residentialApi } from '../api/residential';

const EnergyContext = createContext();

export const iconMap = {
    Refrigerator, AirVent, Tv, WashingMachine, Lightbulb,
    Microwave, Fan, Monitor, Droplets, Flame, Zap, Clock, Target, Leaf, Crown
};

export const EnergyProvider = ({ children }) => {
    const [appliances, setAppliances] = useState(() => {
        const saved = localStorage.getItem('eccoIA_appliances');
        return saved ? JSON.parse(saved) : [];
    });

    const [consumptionHistory, setConsumptionHistory] = useState(() => {
        const saved = localStorage.getItem('eccoIA_consumptionHistory');
        return saved ? JSON.parse(saved) : [];
    });

    const [dashboardInsights, setDashboardInsights] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        localStorage.setItem('eccoIA_appliances', JSON.stringify(appliances));
    }, [appliances]);

    useEffect(() => {
        localStorage.setItem('eccoIA_consumptionHistory', JSON.stringify(consumptionHistory));
    }, [consumptionHistory]);

    const syncEnergyData = async (silent = false) => {
        if (!silent) setIsSyncing(true);
        try {
            const [profile, assets, history] = await Promise.all([
                residentialApi.getProfile(),
                residentialApi.getAssets(),
                residentialApi.getConsumptionHistory()
            ]);

            if (assets) {
                setAppliances(assets.map(a => ({
                    id: a.id,
                    name: a.name,
                    icon: a.icon,
                    consumption: (a.power_watts * a.daily_hours) / 1000,
                    status: a.status,
                    category: a.category,
                    isHighImpact: a.is_high_impact,
                    monthlyCost: a.monthly_cost_estimate
                })));
            }

            if (history) {
                setConsumptionHistory(history.map(r => ({
                    id: r.id,
                    date: r.date,
                    value: r.reading_value,
                    type: r.reading_type
                })));
            }

            // Sync insights in background
            residentialApi.getDashboardInsights()
                .then(setDashboardInsights)
                .catch(console.error);

            return { profile };
        } catch (error) {
            console.error("Energy Sync Error:", error);
            return null;
        } finally {
            if (!silent) setIsSyncing(false);
        }
    };

    const addAppliance = async (appliance) => {
        try {
            const backendAppliance = {
                name: appliance.name,
                category: appliance.category,
                icon: appliance.icon,
                power_watts: Math.round(appliance.consumption * 1000),
                daily_hours: appliance.usageHours || 4,
                is_high_impact: appliance.consumption > 0.5
            };
            const savedAssets = await residentialApi.addAssets([backendAppliance]);
            const newApp = savedAssets[0];

            setAppliances(prev => [...prev, {
                id: newApp.id,
                name: newApp.name,
                icon: newApp.icon,
                consumption: (newApp.power_watts * newApp.daily_hours) / 1000,
                status: newApp.status,
                category: newApp.category,
                isHighImpact: newApp.is_high_impact,
                monthlyCost: newApp.monthly_cost_estimate
            }]);
            return true;
        } catch (error) {
            console.error("Error adding appliance:", error);
            return false;
        }
    };

    const removeAppliance = async (id) => {
        try {
            await residentialApi.deleteAsset(id);
            setAppliances(prev => prev.filter(a => a.id !== id));
            return true;
        } catch (error) {
            console.error("Error removing appliance:", error);
            return false;
        }
    };

    const toggleAppliance = async (id) => {
        try {
            const appliance = appliances.find(a => a.id === id);
            if (!appliance) return;
            const newStatus = !appliance.status;
            await residentialApi.updateAsset(id, { status: newStatus });
            setAppliances(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
        } catch (error) {
            console.error("Error toggling appliance:", error);
        }
    };

    const value = {
        appliances,
        consumptionHistory,
        dashboardInsights,
        isSyncing,
        syncEnergyData,
        addAppliance,
        removeAppliance,
        toggleAppliance,
        iconMap
    };

    return <EnergyContext.Provider value={value}>{children}</EnergyContext.Provider>;
};

export const useEnergy = () => {
    const context = useContext(EnergyContext);
    if (!context) throw new Error('useEnergy must be used within an EnergyProvider');
    return context;
};
