import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { gamificationApi } from '../api/gamification';
import { residentialApi } from '../api/residential';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    // Perfil del usuario (residencial/industrial config)
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

    // Gamificación (sincronizada con backend)
    const [gamificationStats, setGamificationStats] = useState(null);
    const [missions, setMissions] = useState([]);
    const [isLoadingGamification, setIsLoadingGamification] = useState(false);

    // Persist profile locally as cache
    useEffect(() => {
        localStorage.setItem('eccoIA_userProfile', JSON.stringify(userProfile));
    }, [userProfile]);

    /**
     * Sincroniza los datos de gamificación desde el backend.
     * Combina el perfil de gamificación del servidor con el perfil local.
     */
    const syncGamification = useCallback(async (silent = false) => {
        if (!silent) setIsLoadingGamification(true);
        try {
            const stats = await gamificationApi.getStats();
            setGamificationStats(stats);

            // Actualizar misiones con formato compatible con el frontend
            const formattedMissions = stats.active_missions.map(um => ({
                id: um.mission.id,
                title: um.mission.title,
                description: um.mission.description,
                xp: um.mission.xp_reward,
                points: um.mission.point_reward,
                icon: um.mission.icon,
                category: um.mission.category,
                progress: um.progress * 100, // Backend usa 0-1, frontend usa 0-100
                maxProgress: 100,
                status: um.status === 'completed' ? 'completed' : (um.progress >= 1 ? 'claimable' : 'active'),
                missionType: um.mission.mission_type
            }));
            setMissions(formattedMissions);

            // Sincronizar nivel y XP del backend con el perfil local
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
            console.error("Gamification Sync Error:", error);
            // Fallback a misiones por defecto si no hay conexión
            if (missions.length === 0) {
                setMissions([
                    { id: 1, title: 'Eco-Onboarding', description: 'Completa tu perfil para empezar', xp: 200, progress: 0, maxProgress: 100, status: 'active', icon: 'UserCheck' },
                    { id: 2, title: 'Caza de Vampiros', description: 'Identifica equipos con alto consumo standby', xp: 150, progress: 0, maxProgress: 100, status: 'active', icon: 'Zap' },
                ]);
            }
        } finally {
            if (!silent) setIsLoadingGamification(false);
        }
    }, []);

    /**
     * Sincroniza el perfil del usuario desde el backend.
     */
    const syncUserProfile = useCallback(async () => {
        try {
            const profile = await residentialApi.getProfile();
            if (profile) {
                setUserProfile(prev => ({
                    ...prev,
                    type: 'residential',
                    config: profile
                }));
            }
        } catch (error) {
            console.error("Profile Sync Error:", error);
        }
    }, []);

    /**
     * Completa una misión en el backend y recarga los stats.
     */
    const claimMission = useCallback(async (missionId) => {
        try {
            await gamificationApi.completeMission(missionId);
            // Recargar stats para reflejar cambios en XP y nivel
            await syncGamification(true);
            return true;
        } catch (error) {
            console.error("Mission Claim Error:", error);
            return false;
        }
    }, [syncGamification]);

    /**
     * Actualiza el perfil localmente (para compatibilidad con componentes existentes).
     * También sincroniza con el backend si hay cambios de config.
     */
    const updateProfile = useCallback((updates) => {
        setUserProfile(prev => ({ ...prev, ...updates }));
    }, []);

    /**
     * Añade XP localmente (para compatibilidad).
     * En el flujo ideal, el backend maneja esto automáticamente al completar misiones.
     */
    const addXP = useCallback((amount) => {
        setUserProfile(prev => {
            let { xp, level, xpToNext } = prev;
            xp += amount;
            while (xp >= xpToNext) {
                xp -= xpToNext;
                level += 1;
                xpToNext = Math.floor(xpToNext * 1.2);
            }
            return { ...prev, xp, level, xpToNext };
        });
    }, []);

    const value = {
        // User Profile
        userProfile,
        setUserProfile: updateProfile,
        syncUserProfile,

        // Gamification
        missions,
        setMissions,
        gamificationStats,
        isLoadingGamification,
        syncGamification,
        claimMission,
        addXP
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};
