import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Eye, 
  Key, 
  AlertTriangle, 
  Network, 
  Unlock,
  Activity,
  Users,
  Globe,
  ArrowRight,
  Play,
  Square,
  RefreshCw,
  Info
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Генерация фейковых пакетов
const generateMockPacket = () => {
  const sources = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '192.168.1.200'];
  const destinations = ['login.bank.com', 'mail.company.com', 'api.secure.net', 'www.shop.com'];
  const protocols = ['HTTPS', 'HTTP', 'FTP', 'SMTP'];
  const payloadTypes = ['Login Form', 'Credit Card', 'Email Auth', 'File Transfer', 'API Key'];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    sourceIP: sources[Math.floor(Math.random() * sources.length)],
    destIP: destinations[Math.floor(Math.random() * destinations.length)],
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    payloadType: payloadTypes[Math.floor(Math.random() * payloadTypes.length)],
    intercepted: Math.random() > 0.3,
    credentials: Math.random() > 0.6 ? {
      username: ['admin', 'user123', 'john.doe', 'alice'][Math.floor(Math.random() * 4)],
      password: '********',
      type: ['Password', 'Token', 'Certificate'][Math.floor(Math.random() * 3)]
    } : null,
    size: Math.floor(Math.random() * 2048) + 256,
    encrypted: Math.random() > 0.4
  };
};

// Моковые перехваченные учетные данные
const mockCredentials = [
  { id: 1, username: 'admin', password: '********', site: 'login.bank.com', timestamp: '14:23:45', type: 'Password' },
  { id: 2, username: 'john.doe', password: '********', site: 'mail.company.com', timestamp: '14:22:18', type: 'Token' },
  { id: 3, username: 'alice.smith', password: '********', site: 'api.secure.net', timestamp: '14:21:03', type: 'API Key' },
  { id: 4, username: 'user123', password: '********', site: 'www.shop.com', timestamp: '14:19:44', type: 'Session' }
];

const MITMSimulation = () => {
  const [isActive, setIsActive] = useState(false);
  const [packets, setPackets] = useState([]);
  const [interceptedCount, setInterceptedCount] = useState(0);
  const [credentialsFound, setCredentialsFound] = useState(0);
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [networkFlow, setNetworkFlow] = useState('normal');
  const [chartData, setChartData] = useState([]);

  // Генерация данных для графика
  useEffect(() => {
    const data = [];
    for (let i = 0; i < 20; i++) {
      data.push({
        time: `${14 + Math.floor(i/4)}:${String((i % 4) * 15).padStart(2, '0')}`,
        intercepted: Math.floor(Math.random() * 50) + (isActive ? 20 : 5),
        total: Math.floor(Math.random() * 200) + 100
      });
    }
    setChartData(data);
  }, [isActive]);

  // Логика генерации пакетов
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const newPacket = generateMockPacket();
      setPackets(prev => [newPacket, ...prev.slice(0, 49)]);
      
      if (newPacket.intercepted) {
        setInterceptedCount(prev => prev + 1);
      }
      
      if (newPacket.credentials) {
        setCredentialsFound(prev => prev + 1);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isActive]);

  const startSimulation = () => {
    setIsActive(true);
    setNetworkFlow('intercepting');
    setPackets([]);
    setInterceptedCount(0);
    setCredentialsFound(0);
  };

  const stopSimulation = () => {
    setIsActive(false);
    setNetworkFlow('normal');
  };

  const resetSimulation = () => {
    setIsActive(false);
    setNetworkFlow('normal');
    setPackets([]);
    setInterceptedCount(0);
    setCredentialsFound(0);
    setSelectedPacket(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Шапка */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Network className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Man-in-the-Middle Simulation</h1>
              <p className="text-gray-400">Packet interception and credential harvesting demonstration</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isActive ? stopSimulation : startSimulation}
              className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 ${
                isActive 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {isActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isActive ? 'Stop Simulation' : 'Start MITM Attack'}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetSimulation}
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Баннер статуса */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border-l-4 ${
            isActive 
              ? 'bg-red-900/50 border-red-400 text-red-100' 
              : 'bg-gray-800/50 border-gray-400 text-gray-100'
          }`}
        >
          <div className="flex items-center space-x-2">
            {isActive ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </motion.div>
            ) : (
              <Shield className="w-5 h-5 text-gray-400" />
            )}
            <span className="font-medium">
              {isActive ? '🚨 MITM ATTACK IN PROGRESS 🚨' : 'Network Monitoring Active'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Packets Intercepted</p>
              <p className="text-2xl font-bold text-orange-400">{interceptedCount}</p>
            </div>
            <Eye className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Credentials Found</p>
              <p className="text-2xl font-bold text-red-400">{credentialsFound}</p>
            </div>
            <Key className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Connections</p>
              <p className="text-2xl font-bold text-blue-400">{packets.length}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Network Status</p>
              <p className={`text-lg font-bold ${networkFlow === 'intercepting' ? 'text-red-400' : 'text-green-400'}`}>
                {networkFlow === 'intercepting' ? 'COMPROMISED' : 'SECURE'}
              </p>
            </div>
            <Network className={`w-8 h-8 ${networkFlow === 'intercepting' ? 'text-red-400' : 'text-green-400'}`} />
          </div>
        </motion.div>
      </div>

      {/* Визуализация сетевого потока */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
          <Globe className="w-5 h-5" />
          <span>Network Flow Visualization</span>
        </h3>
        
        <div className="flex items-center justify-center space-x-8 py-8">
          {/* Клиент */}
          <div className="text-center">
            <motion.div
              animate={isActive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mb-2"
            >
              <Users className="w-8 h-8" />
            </motion.div>
            <p className="text-sm text-gray-400">Client</p>
            <p className="text-xs text-blue-400">192.168.1.100</p>
          </div>

          {/* Стрелка 1 */}
          <motion.div
            animate={isActive ? { x: [0, 10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ArrowRight className={`w-6 h-6 ${isActive ? 'text-red-400' : 'text-gray-400'}`} />
          </motion.div>

          {/* Атакующий (MITM) */}
          <div className="text-center">
            <motion.div
              animate={isActive ? { 
                scale: [1, 1.2, 1],
                boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 20px rgba(239, 68, 68, 0)', '0 0 0 0 rgba(239, 68, 68, 0)']
              } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`w-16 h-16 rounded-lg flex items-center justify-center mb-2 ${
                isActive ? 'bg-red-500' : 'bg-gray-600'
              }`}
            >
              <Eye className="w-8 h-8" />
            </motion.div>
            <p className="text-sm text-gray-400">Attacker</p>
            <p className={`text-xs ${isActive ? 'text-red-400' : 'text-gray-400'}`}>
              {isActive ? 'INTERCEPTING' : 'DORMANT'}
            </p>
          </div>

          {/* Стрелка 2 */}
          <motion.div
            animate={isActive ? { x: [0, 10, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
          >
            <ArrowRight className={`w-6 h-6 ${isActive ? 'text-red-400' : 'text-gray-400'}`} />
          </motion.div>

          {/* Сервер */}
          <div className="text-center">
            <motion.div
              animate={isActive ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center mb-2"
            >
              <Globe className="w-8 h-8" />
            </motion.div>
            <p className="text-sm text-gray-400">Server</p>
            <p className="text-xs text-green-400">login.bank.com</p>
          </div>
        </div>

        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4 p-3 bg-red-900/30 rounded-lg border border-red-500/50"
          >
            <p className="text-red-300 text-sm">
              ⚠️ Traffic is being intercepted and analyzed by the attacker
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Графики и данные */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* График перехвата */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold mb-4">Packet Interception Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stackId="1"
                stroke="#3B82F6" 
                fill="#3B82F6"
                fillOpacity={0.3}
                name="Total Packets"
              />
              <Area 
                type="monotone" 
                dataKey="intercepted" 
                stackId="2"
                stroke="#F59E0B" 
                fill="#F59E0B"
                fillOpacity={0.8}
                name="Intercepted"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Перехваченные учетные данные */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Key className="w-5 h-5 text-red-400" />
            <span>Intercepted Credentials</span>
          </h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {mockCredentials.map((cred) => (
              <motion.div
                key={cred.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-gray-700 rounded-lg border border-red-500/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-red-300">{cred.username}</span>
                  <span className="text-xs text-gray-400">{cred.timestamp}</span>
                </div>
                <div className="text-sm text-gray-300">
                  <p>Site: <span className="text-orange-300">{cred.site}</span></p>
                  <p>Type: <span className="text-blue-300">{cred.type}</span></p>
                </div>
                <div className="flex items-center mt-2">
                  <Unlock className="w-4 h-4 text-red-400 mr-2" />
                  <span className="text-xs text-red-300">Password: {cred.password}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Лайв-поток пакетов */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <span>Live Packet Stream</span>
          </h3>
          <div className="flex items-center space-x-2">
            {isActive && (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-3 h-3 bg-red-400 rounded-full"
              />
            )}
            <span className="text-sm text-gray-400">
              {isActive ? 'CAPTURING' : 'IDLE'}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {packets.map((packet) => (
              <motion.div
                key={packet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-700/50 ${
                  packet.intercepted 
                    ? 'bg-red-900/30 border-red-500/50' 
                    : 'bg-gray-700/30 border-gray-600'
                }`}
                onClick={() => setSelectedPacket(packet)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {packet.intercepted ? (
                        <Eye className="w-4 h-4 text-red-400" />
                      ) : (
                        <Network className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm font-mono">{packet.timestamp}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-blue-300">{packet.sourceIP}</span>
                      <ArrowRight className="w-3 h-3 inline mx-2 text-gray-400" />
                      <span className="text-green-300">{packet.destIP}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      packet.protocol === 'HTTPS' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {packet.protocol}
                    </span>
                    <span className="text-xs text-gray-400">{packet.size}B</span>
                    {packet.credentials && (
                      <Key className="w-4 h-4 text-orange-400" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {packets.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No packets captured yet. Start the simulation to begin monitoring.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Образовательный футер */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-800 rounded-lg p-6 border border-gray-700"
      >
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-blue-400 mb-2">Educational Information</h4>
            <p className="text-gray-300 text-sm mb-3">
              Man-in-the-Middle (MITM) attacks involve intercepting communication between two parties 
              without their knowledge. Attackers can eavesdrop on sensitive data, steal credentials, 
              and even modify transmitted information. This simulation demonstrates how such attacks 
              work in a controlled, educational environment.
            </p>
            <p className="text-xs text-gray-400">
              <strong>Created by:</strong> Nijat Najafov, Huseynli Murad, Elmin – Azerbaijan Technical University
            </p>
          </div>
        </div>
      </motion.div>

      {/* Модальное окно с деталями пакета */}
      <AnimatePresence>
        {selectedPacket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPacket(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-2xl w-full max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Packet Details</h3>
                <button
                  onClick={() => setSelectedPacket(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Source IP</p>
                    <p className="font-mono text-blue-300">{selectedPacket.sourceIP}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Destination</p>
                    <p className="font-mono text-green-300">{selectedPacket.destIP}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Protocol</p>
                    <p className="font-mono">{selectedPacket.protocol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Payload Type</p>
                    <p className="font-mono">{selectedPacket.payloadType}</p>
                  </div>
                </div>
                
                {selectedPacket.credentials && (
                  <div className="p-4 bg-red-900/30 rounded-lg border border-red-500/50">
                    <h4 className="font-bold text-red-300 mb-2">Intercepted Credentials</h4>
                    <div className="space-y-2">
                      <p><span className="text-gray-400">Username:</span> <span className="text-red-300">{selectedPacket.credentials.username}</span></p>
                      <p><span className="text-gray-400">Password:</span> <span className="text-red-300">{selectedPacket.credentials.password}</span></p>
                      <p><span className="text-gray-400">Type:</span> <span className="text-red-300">{selectedPacket.credentials.type}</span></p>
                    </div>
                  </div>
                )}
                
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h4 className="font-bold mb-2">Packet Headers</h4>
                  <div className="font-mono text-sm text-gray-300 space-y-1">
                    <p>GET /login HTTP/1.1</p>
                    <p>Host: {selectedPacket.destIP}</p>
                    <p>User-Agent: Mozilla/5.0 (Spoofed)</p>
                    <p>Accept: text/html,application/xhtml+xml</p>
                    <p>Content-Length: {selectedPacket.size}</p>
                    {selectedPacket.encrypted && <p className="text-yellow-400">⚠️ Encrypted payload detected</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MITMSimulation;