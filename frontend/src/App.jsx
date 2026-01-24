import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProviders } from './context/AppProviders';
import IndustrialDashboard from './pages/IndustrialDashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import IndustrialSettings from './pages/IndustrialSettings.jsx';
import Appliances from './pages/Appliances.jsx';
import DataAssistant from './pages/DataAssistant.jsx';
import IndustrialConfig from './pages/IndustrialConfig.jsx';
import GlobalConsumption from './pages/GlobalConsumption.jsx';
import ProfileSelection from './pages/ProfileSelection.jsx';
import ResidentialConfig from './pages/ResidentialConfig.jsx';
import ResultsDashboard from './pages/ResultsDashboard.jsx';
import EnergyAnalysis from './pages/EnergyAnalysis.jsx';
import Dashboard from './pages/Dashboard.jsx';
import EnergyManagement from './pages/EnergyManagement.jsx';
import Missions from './pages/Missions.jsx';
import CarbonFootprint from './pages/CarbonFootprint.jsx';
import Onboarding from './pages/Onboarding.jsx';
import DesignSystem from './pages/DesignSystem.jsx';
import UserProfile from './pages/UserProfile.jsx';
import Layout from './components/Layout.jsx';
import IndustrialOnboarding from './pages/IndustrialOnboarding.jsx';
import ResidentialAssistant from './pages/ResidentialAssistant.jsx';

function App() {
  return (
    <AppProviders>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile-selection" element={<ProfileSelection />} />
            <Route path="/residential-config" element={<ResidentialConfig />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/energy-management" element={<EnergyManagement />} />
            <Route path="/appliances" element={<EnergyManagement />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/financial-impact" element={<EnergyManagement />} />
            <Route path="/energy-analysis" element={<EnergyAnalysis />} />
            <Route path="/carbon-footprint" element={<CarbonFootprint />} />
            <Route path="/industrial-dashboard" element={<IndustrialDashboard />} />
            <Route path="/industrial-settings" element={<IndustrialSettings />} />
            <Route path="/industrial-config" element={<IndustrialConfig />} />
            <Route path="/global-consumption" element={<GlobalConsumption />} />
            <Route path="/data-assistant" element={<DataAssistant />} />
            <Route path="/residential-assistant" element={<ResidentialAssistant />} />
            <Route path="/results-dashboard" element={<ResultsDashboard />} />
            <Route path="/design-system" element={<DesignSystem />} />
            <Route path="/industrial-onboarding" element={<IndustrialOnboarding />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </Layout>
      </Router>
    </AppProviders>
  );
}

export default App;

