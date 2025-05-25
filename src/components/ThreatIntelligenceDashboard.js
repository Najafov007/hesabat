import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { 
  Shield, AlertTriangle, Eye,
  Play, Pause, Download, Bell, Settings, Wifi, WifiOff,
  Server, Target,
  TrendingUp, TrendingDown, CheckCircle, AlertCircle,
  Radar, Network
} from 'lucide-react';

// Custom Hooks for Real-time Data
const useRealTimeData = () => {
  const [isLive, setIsLive] = useState(true);
  const [data, setData] = useState({
    threats: [],
    incidents: [],
    systemStatus: {},
    networkTraffic: [],
    alertQueue: []
  });
  
  const intervalRef = useRef();

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(() => {
        setData(_prevData => ({
          threats: generateThreatData(),
          incidents: generateIncidentData(),
          systemStatus: generateSystemStatus(),
          networkTraffic: generateNetworkTraffic(),
          alertQueue: generateAlertQueue()
        }));
      }, 2000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isLive]);

  const generateThreatData = () => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: `threat-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - i * 10000).toISOString(),
      type: ['DDoS', 'SQL Injection', 'MITM', 'Malware', 'Brute Force'][Math.floor(Math.random() * 5)],
      severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
      source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      target: ['PLC-01', 'HMI-02', 'SCADA-Main', 'DB-Server', 'Web-Gateway'][Math.floor(Math.random() * 5)],
      status: ['Active', 'Blocked', 'Investigating', 'Resolved'][Math.floor(Math.random() * 4)],
      confidence: Math.floor(Math.random() * 40) + 60,
      country: ['USA', 'China', 'Russia', 'Germany', 'Brazil'][Math.floor(Math.random() * 5)]
    }));
  };

  const generateIncidentData = () => {
    return Array.from({ length: 8 }, (_, _i) => ({
      id: `INC-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      title: [
        'Suspicious Network Activity Detected',
        'Multiple Failed Login Attempts',
        'Unusual Database Queries',
        'Unauthorized File Access',
        'Potential Data Exfiltration',
        'System Performance Anomaly'
      ][Math.floor(Math.random() * 6)],
      severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
      status: ['Open', 'In Progress', 'Resolved', 'Closed'][Math.floor(Math.random() * 4)],
      assignee: ['Security Team', 'SOC Analyst', 'Admin', 'Auto-Response'][Math.floor(Math.random() * 4)],
      created: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      updated: new Date().toISOString()
    }));
  };

  const generateSystemStatus = () => ({
    servers: {
      total: 12,
      online: 11,
      offline: 1,
      maintenance: 0
    },
    network: {
      status: Math.random() > 0.1 ? 'Operational' : 'Degraded',
      latency: Math.floor(Math.random() * 50) + 10,
      bandwidth: Math.floor(Math.random() * 30) + 70,
      connections: Math.floor(Math.random() * 500) + 1000
    },
    security: {
      firewall: Math.random() > 0.05 ? 'Active' : 'Warning',
      ids: Math.random() > 0.05 ? 'Active' : 'Alert',
      antivirus: Math.random() > 0.02 ? 'Active' : 'Update Required',
      threatLevel: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)]
    }
  });

  const generateNetworkTraffic = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19 - i) * 30000).toLocaleTimeString(),
      inbound: Math.floor(Math.random() * 1000) + 500,
      outbound: Math.floor(Math.random() * 800) + 300,
      threats: Math.floor(Math.random() * 50),
      blocked: Math.floor(Math.random() * 40)
    }));
  };

  const generateAlertQueue = () => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `alert-${Date.now()}-${i}`,
      type: ['Security', 'Performance', 'System', 'Network'][Math.floor(Math.random() * 4)],
      message: [
        'Multiple failed authentication attempts detected',
        'Unusual outbound traffic patterns observed',
        'System resource utilization above threshold',
        'Potential malware signature detected',
        'Database query anomaly identified'
      ][Math.floor(Math.random() * 5)],
      severity: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
      timestamp: new Date(Date.now() - Math.random() * 300000).toISOString(),
      acknowledged: Math.random() > 0.7
    }));
  };

  return { data, isLive, setIsLive };
};

// Real-time Status Widget
const StatusWidget = ({ title, value, status, icon: Icon, trend }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'operational':
      case 'online':
        return 'text-green-400';
      case 'warning':
      case 'degraded':
        return 'text-yellow-400';
      case 'critical':
      case 'offline':
      case 'alert':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={20} className={getStatusColor(status)} />
          <span className="text-sm text-gray-400">{title}</span>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="text-xs">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className={`text-sm font-medium ${getStatusColor(status)}`}>
        {status}
      </div>
    </motion.div>
  );
};

// Threat Intelligence Feed
const ThreatFeed = ({ threats, title = "Live Threat Feed" }) => {
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-900 text-red-300 border-red-700';
      case 'high': return 'bg-orange-900 text-orange-300 border-orange-700';
      case 'medium': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      case 'low': return 'bg-green-900 text-green-300 border-green-700';
      default: return 'bg-gray-900 text-gray-300 border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <AlertTriangle className="text-red-400" size={16} />;
      case 'blocked': return <Shield className="text-green-400" size={16} />;
      case 'investigating': return <Eye className="text-yellow-400" size={16} />;
      case 'resolved': return <CheckCircle className="text-green-400" size={16} />;
      default: return <AlertCircle className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {threats.map((threat, index) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(threat.status)}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{threat.type}</span>
                    <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(threat.severity)}`}>
                      {threat.severity}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {threat.source} → {threat.target}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-white">{threat.confidence}% confidence</div>
                <div className="text-xs text-gray-400">
                  {new Date(threat.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Incident Response Dashboard
const IncidentDashboard = ({ incidents }) => {
  const [_selectedIncident, setSelectedIncident] = useState(null);

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Active Incidents</h3>
        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
          Create Incident
        </button>
      </div>

      <div className="space-y-3">
        {incidents.map((incident, index) => (
          <motion.div
            key={incident.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors cursor-pointer"
            onClick={() => setSelectedIncident(incident)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">{incident.id}</span>
                <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(incident.severity)}`}>
                  {incident.severity}
                </span>
                <span className="text-xs text-gray-400 px-2 py-1 bg-gray-700 rounded">
                  {incident.status}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {new Date(incident.created).toLocaleDateString()}
              </div>
            </div>
            
            <div className="text-sm text-gray-300 mb-2">{incident.title}</div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Assigned to: {incident.assignee}</span>
              <span>Updated: {new Date(incident.updated).toLocaleTimeString()}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Network Traffic Visualizer
const NetworkTrafficChart = ({ data, isLive }) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Network Traffic</h3>
        <div className="flex items-center gap-2">
          {isLive && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
          <span className="text-sm text-gray-400">{isLive ? 'Live' : 'Paused'}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#fff'
            }} 
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="inbound" 
            stackId="1" 
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.6}
            name="Inbound (MB/s)"
          />
          <Area 
            type="monotone" 
            dataKey="outbound" 
            stackId="1" 
            stroke="#10b981" 
            fill="#10b981" 
            fillOpacity={0.6}
            name="Outbound (MB/s)"
          />
          <Area 
            type="monotone" 
            dataKey="threats" 
            stackId="2" 
            stroke="#ef4444" 
            fill="#ef4444" 
            fillOpacity={0.8}
            name="Threats"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Alert Queue Component
const AlertQueue = ({ alerts }) => {
  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return <AlertTriangle className="text-red-400" size={16} />;
      case 'high': return <AlertCircle className="text-orange-400" size={16} />;
      case 'medium': return <Bell className="text-yellow-400" size={16} />;
      case 'low': return <CheckCircle className="text-green-400" size={16} />;
      default: return <Bell className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Alert Queue</h3>
        <div className="flex items-center gap-2">
          <button className="p-1 text-gray-400 hover:text-white transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg border-l-4 ${
              alert.acknowledged 
                ? 'bg-gray-800 border-l-gray-600' 
                : 'bg-gray-800/80 border-l-blue-500'
            } hover:bg-gray-700 transition-colors cursor-pointer`}
          >
            <div className="flex items-start gap-3">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{alert.type}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-gray-300">{alert.message}</div>
              </div>
              {!alert.acknowledged && (
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Main Threat Intelligence Dashboard
const ThreatIntelligenceDashboard = () => {
  const { data, isLive, setIsLive } = useRealTimeData();

  return (
    <div className="p-6 bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Threat Intelligence Center</h1>
          <p className="text-gray-400">Real-time monitoring and incident response</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              isLive 
                ? 'bg-green-600 border-green-500 text-white hover:bg-green-700' 
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {isLive ? <Pause size={16} /> : <Play size={16} />}
            {isLive ? 'Pause' : 'Resume'} Live Feed
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatusWidget 
          title="Servers Online" 
          value={`${data.systemStatus.servers?.online || 0}/${data.systemStatus.servers?.total || 0}`}
          status={data.systemStatus.servers?.offline > 0 ? 'Warning' : 'Operational'}
          icon={Server}
          trend={5}
        />
        <StatusWidget 
          title="Network Status" 
          value={`${data.systemStatus.network?.bandwidth || 0}%`}
          status={data.systemStatus.network?.status || 'Unknown'}
          icon={data.systemStatus.network?.status === 'Operational' ? Wifi : WifiOff}
          trend={-2}
        />
        <StatusWidget 
          title="Firewall" 
          value="Active"
          status={data.systemStatus.security?.firewall || 'Unknown'}
          icon={Shield}
        />
        <StatusWidget 
          title="IDS/IPS" 
          value="Monitoring"
          status={data.systemStatus.security?.ids || 'Unknown'}
          icon={Radar}
        />
        <StatusWidget 
          title="Threat Level" 
          value={data.systemStatus.security?.threatLevel || 'Unknown'}
          status={data.systemStatus.security?.threatLevel || 'Unknown'}
          icon={Target}
        />
        <StatusWidget 
          title="Connections" 
          value={data.systemStatus.network?.connections || 0}
          status="Active"
          icon={Network}
          trend={12}
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2">
          <ThreatFeed threats={data.threats} />
        </div>
        <div>
          <AlertQueue alerts={data.alertQueue} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <NetworkTrafficChart data={data.networkTraffic} isLive={isLive} />
        <IncidentDashboard incidents={data.incidents} />
      </div>

      {/* Educational Footer */}
      <div className="mt-12 p-6 bg-gray-900 border border-gray-700 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Real-time Threat Intelligence Simulation</h3>
          <p className="text-gray-400 mb-4">
            This dashboard simulates a Security Operations Center (SOC) environment with real-time threat detection,
            incident management, and system monitoring capabilities. All threats and incidents are simulated for educational purposes.
          </p>
          <div className="text-sm text-gray-500">
            Created by <span className="text-blue-400">Nijat Najafov</span>, <span className="text-blue-400">Huseynli Murad</span>, <span className="text-blue-400">Elmin</span> - Azerbaijan Technical University
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatIntelligenceDashboard;