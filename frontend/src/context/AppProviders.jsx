import React from 'react';
import { UserProvider } from './UserContext';
import { EnergyProvider } from './EnergyContext';
import { UIProvider } from './UIContext';
import { AppProvider } from './AppContext'; // Mantener como fallback temporal si es necesario

export const AppProviders = ({ children }) => {
    return (
        <UIProvider>
            <UserProvider>
                <EnergyProvider>
                    {/* Legacy AppProvider wrapped inside to allow smooth transition if any legacy hook remains */}
                    <AppProvider>
                        {children}
                    </AppProvider>
                </EnergyProvider>
            </UserProvider>
        </UIProvider>
    );
};
