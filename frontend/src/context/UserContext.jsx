import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
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

    const [missions, setMissions] = useState(() => {
        const saved = localStorage.getItem('eccoIA_missions');
        return saved ? JSON.parse(saved) : [
            { id: 1, title: 'Ahorro Matutino', description: 'Reduce tu consumo en un 10% durante las horas pico.', xp: 50, progress: 0, maxProgress: 10, status: 'active', difficulty: 'easy', category: 'daily' },
            { id: 2, title: 'Cazador de Vampiros', description: 'Identifica y elimina 5 fuentes de consumo fantasma.', xp: 100, progress: 0, maxProgress: 5, status: 'active', difficulty: 'medium', category: 'challenge' },
        ];
    });

    useEffect(() => {
        localStorage.setItem('eccoIA_userProfile', JSON.stringify(userProfile));
    }, [userProfile]);

    useEffect(() => {
        localStorage.setItem('eccoIA_missions', JSON.stringify(missions));
    }, [missions]);

    const addXP = (amount) => {
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
    };

    const updateProfile = (updates) => {
        setUserProfile(prev => ({ ...prev, ...updates }));
    };

    const claimMission = (missionId) => {
        setMissions(prev => prev.map(m => {
            if (m.id === missionId && (m.status === 'claimable' || m.progress >= m.maxProgress)) {
                addXP(m.xp);
                return { ...m, status: 'completed' };
            }
            return m;
        }));
    };

    const value = {
        userProfile,
        setUserProfile: updateProfile,
        missions,
        setMissions,
        addXP,
        claimMission
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};
