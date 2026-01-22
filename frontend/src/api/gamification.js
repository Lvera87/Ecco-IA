import axios from 'axios';

const API_BAR_URL = '/api/v1/gamification';

export const gamificationApi = {
    getStats: async () => {
        const response = await axios.get(`${API_BAR_URL}/stats`);
        return response.data;
    },

    completeMission: async (missionId) => {
        const response = await axios.post(`${API_BAR_URL}/missions/${missionId}/complete`);
        return response.data;
    },

    seedMissions: async () => {
        const response = await axios.post(`${API_BAR_URL}/seed`);
        return response.data;
    }
};
