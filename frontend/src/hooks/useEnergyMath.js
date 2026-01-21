import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

export const useEnergyMath = () => {
    const { userProfile, appliances, consumptionHistory } = useApp();

    const config = userProfile?.config || {};
    const details = config.applianceDetails || {};

    // Constants
    const ESTRATO_TARIFFS = { 1: 350, 2: 450, 3: 680, 4: 850, 5: 1100, 6: 1400 };
    const CO2_FACTOR = 0.164; // kg CO2e per kWh

    const userStratum = useMemo(() => config.stratum ? parseInt(config.stratum) : 3, [config.stratum]);
    const kwhPrice = useMemo(() => ESTRATO_TARIFFS[userStratum] || 680, [userStratum]);

    const formatMoney = (val) => new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(val);

    // Core Calculations
    const calculations = useMemo(() => {
        // Current consumption from history
        const latestReading = consumptionHistory.length > 0
            ? consumptionHistory[consumptionHistory.length - 1].value
            : 0;

        const projectedKwh = latestReading > 0 ? latestReading * 30 : 0;
        const projectedBill = projectedKwh * kwhPrice;

        // Vampire & Inefficiency costs
        let vampireKwhMonthly = 0;
        if (details.fridge_check) vampireKwhMonthly += 15;
        if (details.tv_check) vampireKwhMonthly += 5;
        if (config.appliances?.includes('bulbs_old')) vampireKwhMonthly += 10;

        const vampireMoneyLost = vampireKwhMonthly * kwhPrice;

        // Carbon Footprint
        const co2Footprint = projectedKwh * CO2_FACTOR;
        const treesEquivalent = Math.round(co2Footprint / 20);

        return {
            latestReading,
            projectedKwh,
            projectedBill,
            vampireKwhMonthly,
            vampireMoneyLost,
            co2Footprint,
            treesEquivalent,
            hasData: consumptionHistory.length > 0,
            hasProfile: !!config.stratum
        };
    }, [consumptionHistory, kwhPrice, userStratum, details, config.appliances]);

    // Enriched appliances with financial data
    const enrichedAppliances = useMemo(() => {
        return appliances.map(app => {
            let expertStatus = 'Excellent';
            let warning = null;
            let monthlyCost = app.consumption * 30 * kwhPrice;

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

            return { ...app, expertStatus, warning, monthlyCost };
        });
    }, [appliances, kwhPrice, details, config.appliances]);

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
        CO2_FACTOR
    };
};

