import client from './client';

/**
 * Residential API services
 */
export const residentialApi = {
    /**
     * Profile
     */
    getProfile: async () => {
        const response = await client.get('/residential/profile');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await client.post('/residential/profile', profileData);
        return response.data;
    },

    /**
     * Assets (Appliances)
     */
    getAssets: async () => {
        const response = await client.get('/residential/assets');
        return response.data;
    },

    createAsset: async (assetData) => {
        const response = await client.post('/residential/assets', assetData);
        return response.data;
    },

    createAssetBatch: async (assets) => {
        const response = await client.post('/residential/assets/batch', assets);
        return response.data;
    },

    deleteAsset: async (assetId) => {
        const response = await client.delete(`/residential/assets/${assetId}`);
        return response.data;
    },

    /**
     * Consumption
     */
    getConsumptionHistory: async () => {
        const response = await client.get('/residential/consumption');
        return response.data;
    },

    addReading: async (readingData) => {
        const response = await client.post('/residential/consumption', readingData);
        return response.data;
    },

    /**
     * Insights
     */
    getDashboardInsights: async () => {
        const response = await client.get('/residential/dashboard-insights');
        return response.data;
    },

    askAssistant: async (message) => {
        const response = await client.post(`/residential/assistant/chat?message=${encodeURIComponent(message)}`);
        return response.data;
    }
};
