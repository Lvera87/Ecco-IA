import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

export const useEnergyMath = () => {
    const { userProfile, appliances, consumptionHistory } = useApp();

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
        // Base consumption from DB profile
        const baseMonthlyKwh = isIndustrial ? (parseFloat(config.monthly_consumption_avg) || 0) : 150;

        // Current consumption from history (Last reading vs penult reading could be better, but for now latest)
        // Note: consumptionHistory is already sorted desc by date in AppContext
        const latestReading = consumptionHistory.length > 0
            ? consumptionHistory[0].value
            : (isIndustrial ? baseMonthlyKwh / 30 : 0);

        const projectedKwh = latestReading > 0 ? latestReading * 30 : baseMonthlyKwh;
        const projectedBill = projectedKwh * kwhPrice;

        // Vampire & Inefficiency costs
        // We now base this on the logic derived from ResidentialService if possible, 
        // but here we keep a frontend projection for immediate feedback.
        let vampireKwhMonthly = 0;
        if (!isIndustrial) {
            // Check for aging assets or standby icons in appliances list
            const hasInefficientFridge = appliances.some(a => a.icon === 'Refrigerator' && a.isHighImpact);
            const standbyDevicesCount = appliances.filter(a => ['Tv', 'Monitor', 'Consolas'].includes(a.icon)).length;

            if (hasInefficientFridge) vampireKwhMonthly += 15;
            vampireKwhMonthly += standbyDevicesCount * 5;
        } else {
            // Industrial "Waste" calculation (using props from IndustrialSettings if needed)
            // For now simplified as in backend
            vampireKwhMonthly = projectedKwh * 0.15;
        }

        const vampireMoneyLost = vampireKwhMonthly * kwhPrice;

        // Carbon Footprint
        const co2Footprint = projectedKwh * CO2_FACTOR;
        const treesEquivalent = Math.round(co2Footprint / 20);

        // Industrial Specifics
        const floorArea = parseFloat(config.area_sqm) || 1;
        const energyIntensity = projectedKwh / floorArea;
        const efficiencyScore = isIndustrial
            ? Math.max(0, Math.min(100, 100 - ((energyIntensity / 50) * 20))).toFixed(1)
            : null;

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
    }, [consumptionHistory, kwhPrice, userStratum, details, config, isIndustrial]);

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
        const totalNominalKwh = appliances.reduce((sum, app) => sum + (app.consumption || 0), 0);
        const totalMonthlyCost = enrichedAppliances.reduce((sum, app) => sum + (app.monthlyCost || 0), 0);
        return { totalNominalKwh, totalMonthlyCost };
    }, [appliances, enrichedAppliances]);

    return {
        ...calculations,
        ...totals,
        enrichedAppliances,
        formatMoney,
        kwhPrice,
        userStratum,
        CO2_FACTOR,
        isIndustrial
    };
};
