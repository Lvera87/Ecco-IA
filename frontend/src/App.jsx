import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndustrialDashboard from './pages/IndustrialDashboard.jsx';
import Login from './pages/Login.jsx';
import IndustrialSettings from './pages/IndustrialSettings.jsx';
import Appliances from './pages/Appliances.jsx';
import DataAssistant from './pages/DataAssistant.jsx';
import IndustrialConfig from './pages/IndustrialConfig.jsx';
import GlobalConsumption from './pages/GlobalConsumption.jsx';
import ProfileSelection from './pages/ProfileSelection.jsx';
import FinancialImpact from './pages/FinancialImpact.jsx';
import ResultsDashboard from './pages/ResultsDashboard.jsx';
import EnergyAnalysis from './pages/EnergyAnalysis.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Missions from './pages/Missions.jsx';
import CarbonFootprint from './pages/CarbonFootprint.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Layout from './components/Layout.jsx';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile-selection" element={<ProfileSelection />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appliances" element={<Appliances />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/financial-impact" element={<FinancialImpact />} />
          <Route path="/energy-analysis" element={<EnergyAnalysis />} />
          <Route path="/carbon-footprint" element={<CarbonFootprint />} />
          <Route path="/industrial-dashboard" element={<IndustrialDashboard />} />
          <Route path="/industrial-settings" element={<IndustrialSettings />} />
          <Route path="/industrial-config" element={<IndustrialConfig />} />
          <Route path="/global-consumption" element={<GlobalConsumption />} />
          <Route path="/data-assistant" element={<DataAssistant />} />
          <Route path="/results-dashboard" element={<ResultsDashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
