  import React from 'react';
  import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
  } from 'react-router-dom';

  import DashboardOverview from './pages/part1-foundation';
  import DDosSimulation from './pages/part2-ddos';
  import SqlInjectionSimulation from './pages/part3-sql';
  import MitmSimulation from './pages/part4-mitm';
  import MalwareUploadSimulation from './pages/part5-file-logs';
  import SecurityLogs from './pages/part6-seclogs';
  import Analytics from './pages/part7-observe';

  const AppRouter = () => {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/overview" replace />} />
          <Route path="/dashboard/overview" element={<DashboardOverview />} />
          <Route path="/dashboard/ddos" element={<DDosSimulation />} />
          <Route path="/dashboard/sql-injection" element={<SqlInjectionSimulation />} />
          <Route path="/dashboard/mitm" element={<MitmSimulation />} />
          <Route path="/dashboard/malware-upload" element={<MalwareUploadSimulation />} />
          <Route path="/logs/overview" element={<SecurityLogs />} />
          <Route path="/charts" element={<Analytics />} />
          {/* Optional: 404 */}
          <Route path="*" element={<div>404 - Not Found</div>} />
        </Routes>
      </Router>
    );
  };

  export default AppRouter;
