import React, { createContext, useContext } from 'react';
import { UserProvider, useUser } from './UserContext';
import { EnergyProvider, useEnergy, iconMap } from './EnergyContext';
import { UIProvider, useUI } from './UIContext';

const AppContext = createContext();

export { iconMap };

export const AppProvider = ({ children }) => {
    return (
        <UIProvider>
            <UserProvider>
                <EnergyProvider>
                    <AppContextWrapper>
                        {children}
                    </AppContextWrapper>
                </EnergyProvider>
            </UserProvider>
        </UIProvider>
    );
};

// This wrapper bridges the new specialized contexts with the legacy useApp hook
// so we don't break the UI while we refactor components one by one.
const AppContextWrapper = ({ children }) => {
    const { userProfile, setUserProfile, missions, claimMission, addXP } = useUser();
    const {
        appliances, consumptionHistory, dashboardInsights, isSyncing,
        syncEnergyData, addAppliance, removeAppliance, toggleAppliance
    } = useEnergy();
    const {
        theme, setTheme, notifications, addNotification,
        markNotificationAsRead, markAllNotificationsAsRead, clearNotifications,
        unreadNotificationsCount
    } = useUI();

    const value = {
        // User Domain
        userProfile, setUserProfile, missions, claimMission, addXP,

        // Energy Domain
        appliances, consumptionHistory, dashboardInsights, isSyncing,
        addAppliance, removeAppliance, toggleAppliance,
        syncDashboardData: syncEnergyData, // Alias for legacy support

        // UI Domain
        theme, setTheme, notifications, addNotification,
        markNotificationAsRead, markAllNotificationsAsRead, clearNotifications,
        unreadNotificationsCount,

        // Common
        iconMap
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within an AppProvider');
    return context;
};

export default AppContext;
