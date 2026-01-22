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

    /**
     * Create a new industrial asset
     */
    createAsset: async (assetData) => {
        const response = await client.post('/industrial/assets', assetData);
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
    }
};
