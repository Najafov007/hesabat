import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Play, Square, Shield, AlertTriangle, Zap, Globe, Activity, Server, Eye, EyeOff } from 'lucide-react';

// Custom hook for DDoS simulation data
const useDDoSSimulation = () => {
  const [isActive, setIsActive] = useState(false);
  const [trafficData, setTrafficData] = useState([]);
  const [logs, setLogs] = useState([]);
  const [attackStats, setAttackStats] = useState({
    totalRequests: 0,
    blockedRequests: 0,
    activeIPs: 0,
    peakTraffic: 0
  });

  const generateRandomIP = () => {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  };

  const generateTrafficSpike = () => {
    const baseTraffic = Math.random() * 100 + 50;
    const spike = isActive ? Math.random() * 8000 + 2000 : 0;
    return Math.floor(baseTraffic + spike);
  };

  const threatLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const attackTypes = ['HTTP Flood', 'UDP Flood', 'SYN Flood', 'Ping Flood', 'Slowloris'];

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();
      const traffic = generateTrafficSpike();

      // Update traffic data
      setTrafficData(prev => {
        const newData = [...prev, { time: timeStr, traffic, timestamp: now.getTime() }];
        return newData.slice(-20); // Keep last 20 data points
      });

      if (isActive) {
        // Generate attack logs
        const newLog = {
          id: Date.now() + Math.random(),
          timestamp: now.toISOString(),
          sourceIP: generateRandomIP(),
          targetPort: Math.random() > 0.5 ? '80' : '443',
          attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
          threatLevel: threatLevels[Math.floor(Math.random() * threatLevels.length)],
          packets: Math.floor(Math.random() * 10000) + 1000,
          status: Math.random() > 0.3 ? 'BLOCKED' : 'ANALYZING'
        };

        setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep last 50 logs

        // Update stats
        setAttackStats(prev => ({
          totalRequests: prev.totalRequests + Math.floor(Math.random() * 100) + 50,
          blockedRequests: prev.blockedRequests + Math.floor(Math.random() * 80) + 30,
          activeIPs: Math.floor(Math.random() * 500) + 100,
          peakTraffic: Math.max(prev.peakTraffic, traffic)
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  return {
    isActive,
    setIsActive,
    trafficData,
    logs,
    attackStats
  };
};

const DDoSAttackSimulation = () => {
  const { isActive, setIsActive, trafficData, logs, attackStats } = useDDoSSimulation();
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogs, setShowLogs] = useState(true);
  const logContainerRef = useRef(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current && isActive) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs, isActive]);

  const getThreatColor = (level) => {
    switch (level) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-orange-400';
      case 'CRITICAL': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    return status === 'BLOCKED' ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10';
  };

  // Pie chart data for attack types
  const attackTypeData = logs.reduce((acc, log) => {
    const existing = acc.find(item => item.name === log.attackType);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: log.attackType, value: 1 });
    }
    return acc;
  }, []);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <motion.div
              animate={isActive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className="p-3 bg-red-500/20 rounded-lg"
            >
              <Zap className="w-8 h-8 text-red-400" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold">DDoS Attack Simulation</h1>
              <p className="text-gray-400">Distributed Denial of Service Attack Monitor</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                isActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isActive ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isActive ? 'Stop Simulation' : 'Start Simulation'}</span>
            </motion.button>
          </div>
        </div>

        {/* Status Banner */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="flex items-center space-x-2"
                >
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <span className="text-red-400 font-bold text-lg">🚨 DDOS ATTACK IN PROGRESS 🚨</span>
                </motion.div>
                <div className="flex items-center space-x-4 ml-auto">
                  <span className="text-sm text-gray-400">Status:</span>
                  <span className="text-red-400 font-semibold">UNDER ATTACK</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Requests</p>
              <p className="text-2xl font-bold text-white">{attackStats.totalRequests.toLocaleString()}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Blocked Requests</p>
              <p className="text-2xl font-bold text-green-400">{attackStats.blockedRequests.toLocaleString()}</p>
            </div>
            <Shield className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Attack IPs</p>
              <p className="text-2xl font-bold text-orange-400">{attackStats.activeIPs}</p>
            </div>
            <Globe className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Peak Traffic</p>
              <p className="text-2xl font-bold text-red-400">{attackStats.peakTraffic.toLocaleString()}</p>
              <p className="text-xs text-gray-500">packets/sec</p>
            </div>
            <Server className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Traffic Chart */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span>Real-time Traffic Monitor</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="traffic" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fill="url(#trafficGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attack Types Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Attack Types</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attackTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attackTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {attackTypeData.slice(0, 3).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-gray-300">{item.name}</span>
                </div>
                <span className="text-white font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logs Section */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span>Attack Logs</span>
            <span className="text-sm text-gray-400">({logs.length})</span>
          </h3>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            {showLogs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showLogs ? 'Hide' : 'Show'} Logs</span>
          </button>
        </div>

        <AnimatePresence>
          {showLogs && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6">
                <div 
                  ref={logContainerRef}
                  className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto space-y-2"
                >
                  <AnimatePresence>
                    {logs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
                        onClick={() => setSelectedLog(log)}
                      >
                        <div className="flex items-center space-x-4">
                          <span className="text-xs text-gray-500 w-20">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="font-mono text-sm text-blue-400 w-32">
                            {log.sourceIP}
                          </span>
                          <span className="text-sm text-gray-300 w-24">
                            {log.attackType}
                          </span>
                          <span className={`text-xs font-semibold ${getThreatColor(log.threatLevel)}`}>
                            {log.threatLevel}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-gray-400">
                            {log.packets.toLocaleString()} packets
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {logs.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No attack logs detected</p>
                      <p className="text-sm">Start simulation to monitor DDoS attacks</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Log Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedLog(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 max-w-lg w-full border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold mb-4">Attack Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Timestamp:</span>
                  <span className="font-mono">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Source IP:</span>
                  <span className="font-mono text-blue-400">{selectedLog.sourceIP}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Target Port:</span>
                  <span className="font-mono">{selectedLog.targetPort}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Attack Type:</span>
                  <span>{selectedLog.attackType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Threat Level:</span>
                  <span className={getThreatColor(selectedLog.threatLevel)}>{selectedLog.threatLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Packets:</span>
                  <span>{selectedLog.packets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={getStatusColor(selectedLog.status).split(' ')[0]}>{selectedLog.status}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="mt-6 w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Educational Footer */}
      <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-yellow-400 mt-1" />
          <div>
            <h4 className="font-semibold text-yellow-400 mb-2">Educational Notice</h4>
            <p className="text-gray-300 text-sm mb-2">
              This DDoS simulation demonstrates how Distributed Denial of Service attacks overwhelm servers with massive traffic from multiple sources. 
              Real DDoS attacks can cause significant service disruptions and financial damage.
            </p>
            <p className="text-xs text-gray-500">
              Developed by <strong>Nijat Najafov, Huseynli Murad, Elmin</strong> – Azerbaijan Technical University
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DDoSAttackSimulation;