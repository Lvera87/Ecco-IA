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
        let inefficiencyCostMonthly = 0;

        if (details.fridge_check) vampireKwhMonthly += 15; // Rough estimate for old fridge overconsumed kWh
        if (details.tv_check) vampireKwhMonthly += 5; // Standby devices
        if (config.appliances?.includes('bulbs_old')) vampireKwhMonthly += 10;

        const vampireMoneyLost = vampireKwhMonthly * kwhPrice;

        // Carbon Footprint
        const currentMonthlyCO2 = projectedKwh * CO2_FACTOR;
        const treesEquivalent = Math.round(currentMonthlyCO2 / 20);

        return {
            latestReading,
            projectedKwh,
            projectedBill,
            vampireKwhMonthly,
            vampireMoneyLost,
            currentMonthlyCO2,
            treesEquivalent,
            kwhPrice,
            userStratum,
            hasData: consumptionHistory.length > 0,
            hasProfile: !!config.stratum
        };
    }, [consumptionHistory, kwhPrice, userStratum, details, config.appliances]);

    // Enriched appliances with financial data
    const enrichedAppliances = useMemo(() => {
        return appliances.map(app => {
            let expertStatus = 'normal';
            let warning = null;
            let monthlyCost = app.consumption * 30 * kwhPrice;

            if (app.icon === 'Refrigerator' && details.fridge_check) {
                expertStatus = 'intensive';
                warning = "Equipo ineficiente (+10 años)";
                monthlyCost *= 1.4;
            }
            if ((app.icon === 'Tv' || app.icon === 'Monitor') && details.tv_check) {
                expertStatus = 'intensive';
                warning = "Consumo vampiro detectado";
            }
            if (app.icon === 'Lightbulb' && config.appliances?.includes('bulbs_old')) {
                expertStatus = 'intensive';
                warning = "Bombillos tradicionales";
            }

            return { ...app, expertStatus, warning, monthlyCost };
        });
    }, [appliances, kwhPrice, details, config.appliances]);

    return {
        ...calculations,
        enrichedAppliances,
        formatMoney,
        CO2_FACTOR
    };
};
