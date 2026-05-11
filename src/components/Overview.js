import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate  } from 'react-router-dom';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Database, 
  Network, 
  Upload, 
  FileText, 
  BarChart3, 
  Moon, 
  Sun,
  Menu,
  X,
  Cpu,
  Users,
  Globe
} from 'lucide-react';

// Dark Mode Context
const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

// Custom Hook for Server Status
const useServerStatus = () => {
  const [status, setStatus] = useState({
    isOnline: true,
    cpu: 45,
    memory: 67,
    activeUsers: 142,
    responseTime: 12,
    openPorts: 8
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        cpu: Math.max(20, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(30, Math.min(85, prev.memory + (Math.random() - 0.5) * 8)),
        activeUsers: Math.max(100, Math.min(200, prev.activeUsers + Math.floor((Math.random() - 0.5) * 20))),
        responseTime: Math.max(5, Math.min(50, prev.responseTime + (Math.random() - 0.5) * 5))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return status;
};

// Navigation Component
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { isDark } = useDarkMode();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Activity, label: 'Overview', color: 'text-blue-400' },
    { path: '/ddos', icon: AlertTriangle, label: 'DDoS Attack', color: 'text-red-400' },
    { path: '/sql-injection', icon: Database, label: 'SQL Injection', color: 'text-orange-400' },
    { path: '/mitm', icon: Network, label: 'MITM Attack', color: 'text-purple-400' },
    { path: '/malware-upload', icon: Upload, label: 'Malware Upload', color: 'text-yellow-400' },
    { path: '/security-logs', icon: FileText, label: 'Security Logs', color: 'text-green-400' },
    { path: '/threat-intelligence', icon: BarChart3, label: 'Analytics', color: 'text-cyan-400' }
  ];

  if (!isOpen) return null;

  const handleNavigation = (path) => {
    navigate(path);
    toggleSidebar();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={toggleSidebar}
      />
      <div
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out'
        }}
        className={`fixed left-0 top-0 h-full w-64 z-50 lg:relative lg:translate-x-0 ${
          isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        } border-r shadow-xl`}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-red-500" />
              <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                SCADA Shield
              </span>
            </div>
            <button onClick={toggleSidebar} className="lg:hidden">
              <X className={`h-6 w-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-105 ${
                window.location.pathname === item.path
                  ? isDark 
                    ? 'bg-gray-800 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-900 shadow-md'
                  : isDark 
                    ? 'text-gray-300 hover:bg-gray-800' 
                    : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`h-5 w-5 ${item.color}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

// Top Navigation Bar
const TopNavbar = ({ toggleSidebar }) => {
  const { isDark, toggleDarkMode } = useDarkMode();
  const serverStatus = useServerStatus();

  return (
    <header className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className={` p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
          >
            <Menu className={`h-6 w-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${serverStatus.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                System {serverStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Cpu className={`h-4 w-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>CPU: {serverStatus.cpu.toFixed(0)}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className={`h-4 w-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{serverStatus.activeUsers} Users</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-all hover:scale-105 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'}`}>
            SIMULATION MODE
          </div>
        </div>
      </div>
    </header>
  );
};

// Footer Component
const Footer = () => {
  const { isDark } = useDarkMode();
  
  return (
    <footer className={`${isDark ? 'bg-gray-900 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'} border-t mt-auto`}>
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
          <div className="text-sm">
            <span className="font-semibold">Educational Cybersecurity Simulation</span> - 
            Safe for classrooms and conferences
          </div>
          <div className="text-sm font-medium">
            By <span className="text-blue-400">Nijat Najafov</span>, 
            <span className="text-green-400"> Huseynli Murad</span>, 
            <span className="text-purple-400"> Elmin Nuriyev</span> - 
            <span className="text-orange-400"> Azerbaijan Technical University</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Dashboard Overview Component with detailed stats
const DashboardOverview = () => {
  const { isDark } = useDarkMode();
  const navigate = useNavigate();
  const [threatStats, setThreatStats] = useState({
    totalThreats: 1247,
    blocked: 1198,
    activeAttacks: 3,
    riskLevel: 'Medium'
  });

  // Simulate real-time threat updates
  useEffect(() => {
    const interval = setInterval(() => {
      setThreatStats(prev => ({
        ...prev,
        totalThreats: prev.totalThreats + Math.floor(Math.random() * 5),
        blocked: prev.blocked + Math.floor(Math.random() * 3),
        activeAttacks: Math.max(0, prev.activeAttacks + Math.floor((Math.random() - 0.5) * 2))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Security Overview
        </h1>
        <div className={`px-4 py-2 rounded-lg ${threatStats.activeAttacks === 0 ? 
          (isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') :
          (isDark ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-800')
        }`}>
          <span className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              threatStats.activeAttacks === 0 ? 'bg-green-500' : 'bg-orange-500'
            }`} />
            <span className="text-sm font-medium">
              {threatStats.activeAttacks === 0 ? 'All Systems Secure' : `${threatStats.activeAttacks} Active Threats`}
            </span>
          </span>
        </div>
      </div>
      
      {/* Threat Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Threats</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{threatStats.totalThreats.toLocaleString()}</p>
              <p className="text-xs text-green-400 mt-1">↗ +12 this hour</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Blocked</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{threatStats.blocked.toLocaleString()}</p>
              <p className="text-xs text-green-400 mt-1">96.1% success rate</p>
            </div>
            <Shield className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active Attacks</p>
              <p className={`text-2xl font-bold ${threatStats.activeAttacks > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {threatStats.activeAttacks}
              </p>
              <p className="text-xs text-gray-400 mt-1">Real-time monitoring</p>
            </div>
            <Activity className={`h-8 w-8 ${threatStats.activeAttacks > 0 ? 'text-red-400 animate-pulse' : 'text-green-400'}`} />
          </div>
        </div>

        <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Risk Level</p>
              <p className={`text-2xl font-bold text-orange-400`}>{threatStats.riskLevel}</p>
              <p className="text-xs text-gray-400 mt-1">Updated 2m ago</p>
            </div>
            <Globe className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          🎛️ Simulation Controls
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => navigate('/ddos')} className="flex items-center space-x-2 p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            <AlertTriangle className="h-5 w-5" />
            <span>Start DDoS Sim</span>
          </button>
          <button onClick={() => navigate('/sql-injection')} className="flex items-center space-x-2 p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
            <Database className="h-5 w-5" />
            <span>SQL Injection</span>
          </button>
          <button onClick={() => navigate('/mitm')} className="flex items-center space-x-2 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            <Network className="h-5 w-5" />
            <span>MITM Attack</span>
          </button>
          <button onClick={() => navigate('/malware-upload')} className="flex items-center space-x-2 p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
            <Upload className="h-5 w-5" />
            <span>Malware Upload</span>
          </button>
        </div>
      </div>
      
      {/* System Information */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          📊 Foundation Complete - Part 1 
        </h3>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>✅ <strong>Core Infrastructure:</strong> Dark/Light mode, responsive layout, navigation system</p>
          <p>✅ <strong>Real-time Monitoring:</strong> Live server status, threat counters, animated indicators</p>
          <p>✅ <strong>Modern UI/UX:</strong> Smooth transitions, hover effects, professional styling</p>
          <p>✅ <strong>Custom Hooks:</strong> useDarkMode, useServerStatus, useRouter for state management</p>
          <p>✅ <strong>Educational Branding:</strong> University credits, simulation mode indicators</p>
        </div>
        <div className="mt-6 p-4 bg-blue-900 rounded-lg">
          <p className="text-blue-300 text-sm">
            <strong>Ready for Part 2:</strong> DDoS Attack Simulation with live packet monitoring, 
            IP flood animations, and interactive controls. Each module will build upon this foundation.
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Layout Component
const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark } = useDarkMode();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
      />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <TopNavbar toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 p-6">
          <div 
            style={{
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'opacity 0.3s ease, transform 0.3s ease'
            }}
          >
            <DashboardOverview />
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

// Dark Mode Provider
const DarkModeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Dark mode by default

  const toggleDarkMode = () => setIsDark(!isDark);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
      <div className={isDark ? 'dark' : ''}>
        {children}
      </div>
    </DarkModeContext.Provider>
  );
};

// Main App Component
export default function Foundation() {
  return (
    <DarkModeProvider>
      <HomePage />
    </DarkModeProvider>
  );
}