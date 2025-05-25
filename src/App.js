import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OverviewPage from './pages/OverviewPage';
import DDoSPage from './pages/DDoSPage';
import SQLInjectionPage from './pages/SQLInjectionPage';
import MITMPage from './pages/MITMPage';
import FileLogsPage from './pages/FileLogsPage';
import SecurityLogsPage from './pages/SecurityLogsPage';
import DashboardPage from './pages/DashboardPage';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/ddos" element={<DDoSPage />} />
        <Route path="/sql-injection" element={<SQLInjectionPage />} />
        <Route path="/mitm" element={<MITMPage />} />
        <Route path="/malware-upload" element={<FileLogsPage />} />
        <Route path="/security-logs" element={<SecurityLogsPage />} />
        <Route path="/threat-intelligence" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;