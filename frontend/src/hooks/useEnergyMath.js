import { useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useEnergy } from '../context/EnergyContext';

export const useEnergyMath = () => {
    // Micro-Contexts Architecture
    const { userProfile } = useUser();
    const { appliances, consumptionHistory, dashboardInsights } = useEnergy();

    const config = userProfile?.config || {};
    const details = config.applianceDetails || {};
    const type = userProfile?.type || 'residential';
    const isIndustrial = type === 'industrial';

    // Constants
    const ESTRATO_TARIFFS = { 1: 350, 2: 450, 3: 680, 4: 850, 5: 1100, 6: 1400 };
    const INDUSTRIAL_TARIFF = 950;
    const CO2_FACTOR = 0.164; // kg CO2e per kWh

    const userStratum = useMemo(() => config.stratum ? parseInt(config.stratum) : 3, [config.stratum]);
    const kwhPrice = useMemo(() => {
        if (isIndustrial) return INDUSTRIAL_TARIFF;
        return ESTRATO_TARIFFS[userStratum] || 680;
    }, [userStratum, isIndustrial]);

    const formatMoney = (val) => new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(val);

    // Core Calculations
    const calculations = useMemo(() => {
        // Backend-First: Si el backend ya calculó las métricas, preferirlas
        const backendMetrics = dashboardInsights?.metrics || {};

        // Prioridad de consumo base: 1. Capturado (Factura) 2. Promedio declarado 3. Default
        const baseMonthlyKwh = isIndustrial
            ? (parseFloat(config.monthly_consumption_avg) || 0)
            : (parseFloat(config.average_kwh_captured) || (config.monthly_bill_avg / kwhPrice) || 150);

        // Current consumption from history
        const latestReading = consumptionHistory.length > 0
            ? consumptionHistory[0].value
            : 0;

        // Use backend values when available, fallback to local calculation
        const projectedKwh = backendMetrics.projected_kwh || (latestReading > 0 ? latestReading * 30 : baseMonthlyKwh);
        const projectedBill = backendMetrics.projected_bill || (projectedKwh * kwhPrice);

        // Vampire & Inefficiency costs (Fisica de Sentido Común)
        let vampireKwhMonthly = 0;
        if (!isIndustrial) {
            // Equipos modernos < 1W = 0.7 kWh/mes. Equipos viejos/highImpact = 2.5 kWh/mes
            appliances.forEach(a => {
                if (['Tv', 'Monitor', 'Consolas', 'tv', 'monitor', 'console'].includes(a.icon)) {
                    vampireKwhMonthly += a.isHighImpact ? 2.5 : 0.7;
                } else if (a.isHighImpact && (a.icon === 'Refrigerator' || a.icon === 'fridge')) {
                    vampireKwhMonthly += 8.0;
                }
            });
        } else {
            vampireKwhMonthly = projectedKwh * 0.15;
        }

        // Prefer backend values for vampire cost when available
        const vampireMoneyLost = backendMetrics.vampire_cost_monthly || (vampireKwhMonthly * kwhPrice);

        // Carbon Footprint - prefer backend
        const co2Footprint = backendMetrics.co2_footprint || (projectedKwh * CO2_FACTOR);
        const treesEquivalent = backendMetrics.trees_equivalent || Math.round(co2Footprint / 20);

        // Specific Metrics
        const floorArea = parseFloat(config.area_sqm) || 1;
        const energyIntensity = projectedKwh / floorArea;
        const occupants = parseInt(config.occupants) || 1;
        const kwhPerPerson = projectedKwh / occupants;

        // Efficiency Score - prefer backend (uses same algorithm from energy_logic.py)
        const localEfficiencyScore = isIndustrial
            ? Math.max(0, Math.min(100, 100 - ((energyIntensity / 50) * 20))).toFixed(1)
            : Math.max(0, Math.min(100, 100 - (Math.max(0, kwhPerPerson - 35) * 1.5))).toFixed(0);
        const efficiencyScore = backendMetrics.efficiency_score || localEfficiencyScore;

        // Load Estimates (Percent of total) based on Industrial Zones
        const loadDist = [];
        if (isIndustrial) {
            const selectedApps = config.appliances || [];
            if (selectedApps.includes('motors') || selectedApps.includes('power_quality'))
                loadDist.push({ name: 'Producción', value: projectedKwh * 0.55 });
            if (selectedApps.includes('chillers') || selectedApps.includes('boilers'))
                loadDist.push({ name: 'Térmico/HVAC', value: projectedKwh * 0.30 });
            if (selectedApps.includes('high_bay') || selectedApps.includes('scada_bms'))
                loadDist.push({ name: 'Gestión/Luz', value: projectedKwh * 0.15 });
        } else {
            if (config.loads?.heavy_machinery) loadDist.push({ name: 'Maquinaria', value: projectedKwh * 0.5 });
            if (config.loads?.hvac) loadDist.push({ name: 'Climatización', value: projectedKwh * 0.25 });
            if (config.loads?.lighting) loadDist.push({ name: 'Iluminación', value: projectedKwh * 0.15 });
            if (config.loads?.cooling) loadDist.push({ name: 'Refrigeración', value: projectedKwh * 0.1 });
        }

        return {
            latestReading,
            projectedKwh,
            projectedBill,
            vampireKwhMonthly,
            vampireMoneyLost,
            co2Footprint,
            treesEquivalent,
            energyIntensity: energyIntensity.toFixed(1),
            efficiencyScore,
            loadDist,
            hasData: consumptionHistory.length > 0 || (isIndustrial && baseMonthlyKwh > 0),
            hasProfile: isIndustrial ? !!config.sector : !!config.stratum
        };
    }, [consumptionHistory, kwhPrice, userStratum, details, config, isIndustrial, dashboardInsights]);

    // Enriched appliances with financial data
    const enrichedAppliances = useMemo(() => {
        return appliances.map(app => {
            let expertStatus = 'Excellent';
            let warning = null;
            let monthlyCost = app.consumption * 30 * kwhPrice;

            if (!isIndustrial) {
                if (app.icon === 'Refrigerator' && details.fridge_check) {
                    expertStatus = 'Warning';
                    warning = "Equipo ineficiente (+10 años)";
                    monthlyCost *= 1.4;
                }
                if ((app.icon === 'Tv' || app.icon === 'Monitor') && details.tv_check) {
                    expertStatus = 'Warning';
                    warning = "Consumo vampiro detectado";
                }
                if (app.icon === 'Lightbulb' && config.appliances?.includes('bulbs_old')) {
                    expertStatus = 'Warning';
                    warning = "Bombillos tradicionales";
                }
            } else {
                // Industrial rules could be added here
            }

            return { ...app, expertStatus, warning, monthlyCost };
        });
    }, [appliances, kwhPrice, details, config.appliances, isIndustrial]);

    // Totals from appliances
    const totals = useMemo(() => {
        const totalNominalKwh = appliances.reduce((sum, app) => sum + (app.status ? (app.consumption || 0) : 0), 0);
        const totalMonthlyCost = enrichedAppliances.reduce((sum, app) => sum + (app.status ? (app.monthlyCost || 0) : 0), 0);
        return { totalNominalKwh, totalMonthlyCost };
    }, [appliances, enrichedAppliances]);

    // Dynamic calculations based on active inventory
    const dynamicCo2 = (totals.totalNominalKwh * 30) * CO2_FACTOR;
    const dynamicTrees = Math.round(dynamicCo2 / 20);

    return {
        ...calculations,
        ...totals,
        // Override projected metrics with dynamic totals to reflect toggle changes immediately
        projectedBill: calculations.projectedBill > 0 && dashboardInsights?.metrics?.projected_bill
            ? calculations.projectedBill
            : totals.totalMonthlyCost,

        // Dynamic Environmental Impact
        co2Footprint: calculations.co2Footprint > 0 && dashboardInsights?.metrics?.co2_footprint
            ? calculations.co2Footprint
            : dynamicCo2,

        treesEquivalent: calculations.treesEquivalent > 0 && dashboardInsights?.metrics?.trees_equivalent
            ? calculations.treesEquivalent
            : dynamicTrees,

        enrichedAppliances,
        formatMoney,
        kwhPrice,
        userStratum,
        CO2_FACTOR,
        isIndustrial
    };
};
