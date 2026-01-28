import client from './client';

/**
 * Industrial API services
 */
export const industrialApi = {
    /**
     * Get all industrial assets
     */
    getAssets: async () => {
        const response = await client.get('/industrial/assets');
        return response.data;
    },

    createAsset: async (assetData) => {
        const response = await client.post('/industrial/assets', assetData);
        return response.data;
    },

    /**
     * Create multiple industrial assets in one batch
     */
    createAssetBatch: async (assets) => {
        const response = await client.post('/industrial/assets/batch', { assets });
        return response.data;
    },

    /**
     * Get AI-driven dashboard insights (Liquid Backend)
     */
    getDashboardInsights: async () => {
        const response = await client.get('/industrial/dashboard-insights');
        return response.data;
    },

    /**
     * Chat with the Industrial AI Assistant
     */
    askAssistant: async (message) => {
        const response = await client.post(`/industrial/assistant/chat?message=${encodeURIComponent(message)}`);
        return response.data;
    },

    /**
     * Get consumption analysis by zone
     */
    getConsumptionAnalysis: async () => {
        const response = await client.get('/industrial/consumption-analysis');
        return response.data;
    },

    deleteAsset: async (assetId) => {
        const response = await client.delete(`/industrial/assets/${assetId}`);
        return response.data;
    },

    /**
     * Save an ROI scenario for an asset
     */
    saveRoiScenario: async (assetId, roiData) => {
        const response = await client.post(`/industrial/assets/${assetId}/roi-scenarios`, roiData);
        return response.data;
    },

    /**
     * Get ROI scenarios for an asset
     */
    getRoiScenarios: async (assetId) => {
        const response = await client.get(`/industrial/assets/${assetId}/roi-scenarios`);
        return response.data;
    },

    /**
     * Get Industrial Settings (Sector, Consumption, Area)
     */
    getSettings: async () => {
        const response = await client.get('/industrial/settings');
        return response.data;
    },

    /**
     * Update Industrial Settings
     * @param {Object} settings - { sector_id, baseline_consumption_kwh, area_m2, ... }
     */
    updateSettings: async (settings) => {
        const response = await client.put('/industrial/settings', settings);
        return response.data;
    },

    /**
     * Get AI prediction for industrial consumption breakdown
     * @param {Object} data - { sector_id, consumo_total, area_m2, tarifa_kwh? }
     * @returns {Object} - { desglose, factura_estimada_cop, recomendacion, ... }
     */
    predict: async (data) => {
        const response = await client.post('/industrial/predict', data);
        return response.data;
    }
};
