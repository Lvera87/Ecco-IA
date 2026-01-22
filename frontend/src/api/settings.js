import client from './client';

/**
 * Settings API services
 */
export const settingsApi = {
    /**
     * Get industrial settings for the current user
     */
    getSettings: async () => {
        const response = await client.get('/settings/');
        return response.data;
    },

    /**
     * Update industrial settings
     */
    updateSettings: async (settingsData) => {
        const response = await client.put('/settings/', settingsData);
        return response.data;
    }
};
