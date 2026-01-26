import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { gamificationApi } from '../api/gamification';
import { residentialApi } from '../api/residential';
import { authApi } from '../api/auth';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    // Perfil del usuario con persistencia
    const [userProfile, setUserProfile] = useState(() => {
        const saved = localStorage.getItem('eccoIA_userProfile');
        return saved ? JSON.parse(saved) : {
            type: null,
            name: 'Eco-Explorador',
            level: 1,
            xp: 0,
            xpToNext: 1000,
            streak: 0,
        };
    });

    const [gamificationStats, setGamificationStats] = useState(null);
    const [missions, setMissions] = useState([]);
    const [isLoadingGamification, setIsLoadingGamification] = useState(false);

    // Sincronización automática del cache local
    useEffect(() => {
        localStorage.setItem('eccoIA_userProfile', JSON.stringify(userProfile));
    }, [userProfile]);

    /**
     * Sincroniza el perfil residencial incluyendo la gráfica de IA
     */
    const syncUserProfile = useCallback(async () => {
        try {
            const profile = await residentialApi.getProfile();
            if (profile) {
                setUserProfile(prev => {
                    const updated = {
                        ...prev,
                        type: 'residential',
                        config: profile,
                        residential_profile: profile
                    };
                    return updated;
                });
            }
        } catch (error) {
            console.error("Error al sincronizar perfil residencial:", error);
        }
    }, []);

    /**
     * Sincroniza datos de gamificación
     */
    const syncGamification = useCallback(async (silent = false) => {
        if (!silent) setIsLoadingGamification(true);
        try {
            const stats = await gamificationApi.getStats();
            setGamificationStats(stats);

            const formattedMissions = stats.active_missions.map(um => ({
                id: um.mission.id,
                title: um.mission.title,
                description: um.mission.description,
                xp: um.mission.xp_reward,
                points: um.mission.point_reward,
                icon: um.mission.icon,
                category: um.mission.category,
                progress: um.progress * 100,
                maxProgress: 100,
                status: um.status === 'completed' ? 'completed' : (um.progress >= 1 ? 'claimable' : 'active'),
                missionType: um.mission.mission_type
            }));
            setMissions(formattedMissions);

            if (stats.profile) {
                setUserProfile(prev => ({
                    ...prev,
                    level: stats.profile.current_level,
                    xp: stats.profile.total_xp,
                    xpToNext: stats.next_level_xp,
                    ecoPoints: stats.profile.eco_points
                }));
            }
        } catch (error) {
            console.error("Error al sincronizar gamificación:", error);
        } finally {
            if (!silent) setIsLoadingGamification(false);
        }
    }, []);

    const claimMission = useCallback(async (missionId) => {
        try {
            await gamificationApi.completeMission(missionId);
            await syncGamification(true);
            return true;
        } catch (error) {
            console.error("Error al reclamar misión:", error);
            return false;
        }
    }, [syncGamification]);

    const updateProfile = useCallback((updates) => {
        setUserProfile(prev => ({ ...prev, ...updates }));
    }, []);

    const logout = useCallback(() => {
        // 1. Limpiar estado local
        setUserProfile({
            type: null,
            name: 'Eco-Explorador',
            level: 1,
            xp: 0,
            xpToNext: 1000,
            streak: 0,
        });
        setGamificationStats(null);
        setMissions([]);

        // 2. Limpiar persistencia local específica del contexto
        localStorage.removeItem('eccoIA_userProfile');

        // 3. Limpiar tokens de autenticación
        authApi.logout();
    }, []);

    const value = {
        userProfile,
        setUserProfile: updateProfile,
        syncUserProfile,
        missions,
        gamificationStats,
        isLoadingGamification,
        syncGamification,
        claimMission,
        logout
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};
