import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import IndustrialDashboard from '../pages/IndustrialDashboard';
import { industrialApi } from '../api/industrial';
import { AppProvider } from '../context/AppContext';
import { BrowserRouter } from 'react-router-dom';

// Mocking the API
vi.mock('../api/industrial', () => ({
    industrialApi: {
        getAssets: vi.fn(),
        getDashboardInsights: vi.fn(),
    }
}));

// Mock Recharts to avoid JSDOM issues
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
    AreaChart: ({ children }) => <div>{children}</div>,
    Area: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
}));

// Mocking useEnergyMath hook if necessary, or just rely on the component
// Since IndustrialDashboard uses useApp and useEnergyMath, we might need to wrap it

const renderDashboard = () => {
    return render(
        <AppProvider>
            <BrowserRouter>
                <IndustrialDashboard />
            </BrowserRouter>
        </AppProvider>
    );
};

describe('IndustrialDashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('muestra el estado de carga inicialmente', () => {
        industrialApi.getAssets.mockReturnValue(new Promise(() => { })); // Never resolves
        industrialApi.getDashboardInsights.mockReturnValue(new Promise(() => { }));

        renderDashboard();

        expect(screen.getByText(/Analizando eficiencia industrial/i)).toBeInTheDocument();
    });

    it('renderiza los datos de la IA correctamente cuando carga', async () => {
        const mockAssets = [
            { id: 1, name: 'Motor 1', nominal_power_kw: 50, asset_type: 'Motor', daily_usage_hours: 8, efficiency_percentage: 90 }
        ];
        const mockInsights = {
            waste_score: 25,
            top_waste_reason: 'Baja eficiencia en Motor 1',
            potential_savings: '$500',
            recommendation_highlight: 'Optimizar Motor 1',
            ai_interpretation: 'El Motor 1 está operando fuera de rango.'
        };

        industrialApi.getAssets.mockResolvedValue(mockAssets);
        industrialApi.getDashboardInsights.mockResolvedValue(mockInsights);

        renderDashboard();

        // Esperar a que desaparezca el cargando y aparezcan los datos
        await waitFor(() => {
            expect(screen.getByText(/Baja eficiencia/i)).toBeInTheDocument();
        }, { timeout: 5000 });

        expect(screen.getByText(/fuera de rango/i)).toBeInTheDocument();
        expect(screen.getByText(/\$500/i)).toBeInTheDocument();
        expect(screen.getByText(/Motor 1/i)).toBeInTheDocument();
    });

    it('muestra un estado vacío si no hay activos', async () => {
        industrialApi.getAssets.mockResolvedValue([]);
        industrialApi.getDashboardInsights.mockResolvedValue({});

        renderDashboard();

        await waitFor(() => {
            // Buscamos el título del EmptyState que definimos en el código
            expect(screen.getByText(/Sin activos industriales/i)).toBeInTheDocument();
        });
    });
});
