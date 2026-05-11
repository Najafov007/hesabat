import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  Database, 
  Eye, 
  Play, 
  Square, 
  Filter,
  MapPin,
  Code,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  //BarChart, Bar, 
  PieChart, Pie, Cell } from 'recharts';

const generateSQLAttacks = () => {
  const attackTypes = [
    "Union-based",
    "Boolean-based blind",
    "Time-based blind", 
    "Error-based",
    "Stacked queries",
    "Second-order"
  ];
  
  const maliciousQueries = [
    "' OR '1'='1' --",
    "'; DROP TABLE users; --",
    "' UNION SELECT password FROM admin_users --",
    "' AND (SELECT COUNT(*) FROM information_schema.tables) > 0 --",
    "'; INSERT INTO users (username, password) VALUES ('hacker', 'pwned') --",
    "' OR 1=1; WAITFOR DELAY '00:00:10' --",
    "' UNION SELECT NULL, username, password FROM users WHERE '1'='1",
    "'; EXEC xp_cmdshell('dir') --",
    "' AND SUBSTRING((SELECT password FROM users WHERE username='admin'),1,1)='a",
    "' OR (SELECT user FROM mysql.user) = 'root' --"
  ];
  
  const endpoints = [
    "/login.php",
    "/search.php", 
    "/profile.php",
    "/admin/dashboard.php",
    "/api/users",
    "/checkout.php",
    "/contact.php",
    "/news.php"
  ];
  
  const countries = ['Russia', 'China', 'North Korea', 'Iran', 'Romania', 'Brazil', 'Ukraine', 'Vietnam'];
  const cities = ['Moscow', 'Beijing', 'Pyongyang', 'Tehran', 'Bucharest', 'São Paulo', 'Kiev', 'Ho Chi Minh City'];
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    sourceIP: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
    query: maliciousQueries[Math.floor(Math.random() * maliciousQueries.length)],
    endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
    attackType: attackTypes[Math.floor(Math.random() * attackTypes.length)],
    severity: ['Critical', 'High', 'Medium'][Math.floor(Math.random() * 3)],
    status: Math.random() > 0.3 ? 'BLOCKED' : 'PASSED',
    location: `${cities[Math.floor(Math.random() * cities.length)]}, ${countries[Math.floor(Math.random() * countries.length)]}`,
    userAgent: 'Mozilla/5.0 (compatible; SQLBot/1.0)',
    attempts: Math.floor(Math.random() * 15) + 1,
    responseTime: Math.floor(Math.random() * 5000) + 100
  }));
};

const useSQLSimulation = () => {
  const [isActive, setIsActive] = useState(false);
  const [attacks, setAttacks] = useState(generateSQLAttacks());
  const [realTimeAttacks, setRealTimeAttacks] = useState([]);
  const intervalRef = useRef();

  const startSimulation = () => {
    setIsActive(true);
    intervalRef.current = setInterval(() => {
      const newAttack = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        sourceIP: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        query: "' OR '1'='1' --",
        endpoint: "/login.php",
        attackType: "Union-based",
        severity: ['Critical', 'High', 'Medium'][Math.floor(Math.random() * 3)],
        status: Math.random() > 0.7 ? 'PASSED' : 'BLOCKED',
        location: "Unknown",
        attempts: 1,
        responseTime: Math.floor(Math.random() * 2000) + 100
      };
      
      setRealTimeAttacks(prev => [newAttack, ...prev.slice(0, 9)]);
      setAttacks(prev => [newAttack, ...prev]);
    }, 2000);
  };

  const stopSimulation = () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { isActive, attacks, realTimeAttacks, startSimulation, stopSimulation };
};

const SQLHighlighter = ({ query, showLineNumbers = false, title = null }) => {
  const highlightSQL = (sql) => {
    const keywords = /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|UNION|OR|AND|NOT|NULL|TRUE|FALSE|EXEC|WAITFOR|DELAY|SUBSTRING|COUNT|INFORMATION_SCHEMA|TABLES|USERS|PASSWORD|USERNAME|ADMIN|ALL|DISTINCT|TOP|AS|ORDER|BY|GROUP|HAVING|JOIN|INNER|LEFT|RIGHT|OUTER|ON|CASE|WHEN|THEN|ELSE|END|IF|EXISTS|IN|LIKE|BETWEEN|IS|DECLARE|SET|CAST|CONVERT|CHAR|VARCHAR|INT|FLOAT|DATETIME)\b/gi;
    const strings = /('([^'\\]|\\.)*'|"([^"\\]|\\.)*")/g;
    const comments = /(--.*$|\/\*[\s\S]*?\*\/)/gm;
    // const operators = /(\=|\<\=|\>\=|\<\>|\<|\>|\!|\+|\-|\*|\/|\%|\|\||&&)/g;
    // const numbers = /\b\d+(\.\d+)?\b/g;
    // const functions = /\b(COUNT|SUM|AVG|MAX|MIN|LEN|UPPER|LOWER|TRIM|LTRIM|RTRIM|REPLACE|CONCAT|ISNULL|COALESCE)\s*\(/gi;
    // const maliciousParts = /(\'\s*OR\s*\'\d\'\s*\=\s*\'\d\'|DROP\s+TABLE|xp_cmdshell|WAITFOR\s+DELAY|\-\-|\#|\/\*|\*\/)/gi;
    const operators = /(=|<=|>=|<>|<|>|!|\+|-|\*|\/|%|\|\||&&)/g;
    const numbers = /\b\d+(\.\d+)?\b/g;
    const functions = /\b(COUNT|SUM|AVG|MAX|MIN|LEN|UPPER|LOWER|TRIM|LTRIM|RTRIM|REPLACE|CONCAT|ISNULL|COALESCE)\s*\(/gi;
    const maliciousParts = /('\s*OR\s*'\d'\s*=\s*'\d'|DROP\s+TABLE|xp_cmdshell|WAITFOR\s+DELAY|--|#|\/\*|\*\/)/gi;


    return sql
      .replace(maliciousParts, '<span class="bg-red-500/30 text-red-300 px-1 rounded font-bold animate-pulse">$1</span>')
      .replace(keywords, '<span class="text-cyan-400 font-semibold">$1</span>')
      .replace(functions, '<span class="text-purple-400 font-medium">$1</span>')
      .replace(strings, '<span class="text-emerald-400">$1</span>')
      .replace(numbers, '<span class="text-orange-400">$1</span>')
      .replace(comments, '<span class="text-gray-500 italic">$1</span>')
      .replace(operators, '<span class="text-pink-400 font-bold">$1</span>');
  };

  const lines = query.split('\n');

  return (
    <div className="relative">
      {title && (
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg border border-gray-600">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-300 text-sm font-medium ml-2">{title}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>SQL</span>
          </div>
        </div>
      )}
      
      <div className={`bg-gradient-to-br from-gray-900 to-gray-800 ${title ? 'rounded-b-lg' : 'rounded-lg'} border border-gray-700 font-mono text-sm overflow-x-auto relative`}>
        {showLineNumbers ? (
          <div className="flex">
            <div className="bg-gray-800/50 px-3 py-3 text-gray-500 text-right border-r border-gray-700 select-none">
              {lines.map((_, i) => (
                <div key={i} className="leading-6">
                  {(i + 1).toString().padStart(2, '0')}
                </div>
              ))}
            </div>
            <div className="flex-1 p-3">
              {lines.map((line, i) => (
                <div key={i} className="leading-6" dangerouslySetInnerHTML={{ 
                  __html: highlightSQL(line) || '&nbsp;' 
                }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div dangerouslySetInnerHTML={{ __html: highlightSQL(query) }} />
          </div>
        )}
      </div>
    </div>
  );
};

const StatsCards = ({ attacks }) => {
  const totalAttempts = attacks.length;
  const blockedCount = attacks.filter(a => a.status === 'BLOCKED').length;
  const criticalCount = attacks.filter(a => a.severity === 'Critical').length;
  const uniqueIPs = new Set(attacks.map(a => a.sourceIP)).size;

  const cards = [
    {
      title: 'Total Attempts',
      value: totalAttempts,
      icon: Database,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'Blocked',
      value: blockedCount,
      icon: Shield,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      title: 'Critical Threats',
      value: criticalCount,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    },
    {
      title: 'Unique IPs',
      value: uniqueIPs,
      icon: MapPin,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-6 rounded-xl border ${card.bgColor} ${card.borderColor} backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color} mt-1`}>
                {card.value.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Компонент лога атак в реальном времени
const RealTimeLog = ({ attacks, isActive }) => {
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-400" />
          Live Attack Feed
        </h3>
        <div className="flex items-center gap-2">
          {isActive && (
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-2 text-red-400"
            >
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-sm font-medium">LIVE</span>
            </motion.div>
          )}
        </div>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {attacks.map((attack) => (
            <motion.div
              key={attack.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  attack.status === 'BLOCKED' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <div className="text-sm">
                  <span className="text-gray-300">{attack.sourceIP}</span>
                  <span className="text-gray-500 mx-2">→</span>
                  <span className="text-blue-400">{attack.endpoint}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  attack.status === 'BLOCKED' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {attack.status}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(attack.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Компонент графиков анализа атак
const AttackAnalysisChart = ({ attacks }) => {
  const hourlyData = attacks.reduce((acc, attack) => {
    const hour = new Date(attack.timestamp).getHours();
    const key = `${hour}:00`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(hourlyData).map(([hour, count]) => ({
    hour,
    attacks: count,
    blocked: Math.floor(count * 0.7),
    passed: Math.floor(count * 0.3)
  })).slice(-12);

  const attackTypeData = attacks.reduce((acc, attack) => {
    acc[attack.attackType] = (acc[attack.attackType] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(attackTypeData).map(([type, count]) => ({
    name: type,
    value: count
  }));

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Attack Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="hour" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
            <Line type="monotone" dataKey="attacks" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="blocked" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="passed" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Attack Types Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
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
    </div>
  );
};

// Модальное окно с деталями атаки
const AttackDetailModal = ({ attack, onClose }) => {
  if (!attack) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Attack Analysis</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <XCircle className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Source IP</label>
                <p className="text-white font-mono">{attack.sourceIP}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Endpoint</label>
                <p className="text-blue-400 font-mono">{attack.endpoint}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Attack Type</label>
                <p className="text-white">{attack.attackType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Severity</label>
                <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                  attack.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                  attack.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {attack.severity}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Status</label>
                <div className="flex items-center gap-2">
                  {attack.status === 'BLOCKED' ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                  <span className={`font-medium ${
                    attack.status === 'BLOCKED' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {attack.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Timestamp</label>
                <p className="text-white">{new Date(attack.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Location</label>
                <p className="text-white">{attack.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Response Time</label>
                <p className="text-white">{attack.responseTime}ms</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 mb-3 block flex items-center gap-2">
              <Code className="h-4 w-4" />
              Malicious Query Analysis
            </label>
            <SQLHighlighter 
              query={attack.query} 
              showLineNumbers={false}
              title="Detected SQL Injection Payload"
            />
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              Threat Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Attack Vector:</span>
                <p className="text-white font-medium">SQL Parameter Manipulation</p>
              </div>
              <div>
                <span className="text-gray-400">Injection Point:</span>
                <p className="text-white font-medium">User Input Field</p>
              </div>
              <div>
                <span className="text-gray-400">Payload Type:</span>
                <p className="text-white font-medium">{attack.attackType}</p>
              </div>
              <div>
                <span className="text-gray-400">Risk Level:</span>
                <span className={`font-medium ${
                  attack.severity === 'Critical' ? 'text-red-400' :
                  attack.severity === 'High' ? 'text-orange-400' :
                  'text-yellow-400'
                }`}>
                  {attack.severity}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">Educational Note</h4>
            <p className="text-gray-300 text-sm">
              This {attack.attackType} SQL injection attempt tries to manipulate the database query. 
              {attack.status === 'BLOCKED' 
                ? ' Our WAF successfully detected and blocked this malicious query.'
                : ' This query bypassed initial filters and requires immediate attention.'
              }
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SQLInjectionSimulation = () => {
  const { isActive, attacks, realTimeAttacks, startSimulation, stopSimulation } = useSQLSimulation();
  const [selectedAttack, setSelectedAttack] = useState(null);
  const [filter, setFilter] = useState('all');

  const filteredAttacks = attacks.filter(attack => {
    if (filter === 'all') return true;
    if (filter === 'blocked') return attack.status === 'BLOCKED';
    if (filter === 'passed') return attack.status === 'PASSED';
    if (filter === 'critical') return attack.severity === 'Critical';
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-red-500/20 rounded-full">
              <Database className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              SQL Injection Simulation
            </h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Monitor and analyze SQL injection attempts with real-time threat detection and query analysis
          </p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 rounded-xl border border-gray-700 p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={isActive ? stopSimulation : startSimulation}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  isActive
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isActive ? (
                  <>
                    <Square className="h-5 w-5" />
                    Stop Simulation
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Start Simulation
                  </>
                )}
              </button>
              
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-red-400"
                >
                  <Zap className="h-5 w-5" />
                  <span className="font-medium">Active Simulation</span>
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Attacks</option>
                  <option value="blocked">Blocked Only</option>
                  <option value="passed">Passed Only</option>
                  <option value="critical">Critical Only</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <StatsCards attacks={filteredAttacks} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Real-time Log */}
          <div className="lg:col-span-1">
            <RealTimeLog attacks={realTimeAttacks} isActive={isActive} />
          </div>

          {/* Attack History Table */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-400" />
                Attack History
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3 text-gray-400 font-medium">Time</th>
                      <th className="text-left p-3 text-gray-400 font-medium">Source IP</th>
                      <th className="text-left p-3 text-gray-400 font-medium">Endpoint</th>
                      <th className="text-left p-3 text-gray-400 font-medium">Query</th>
                      <th className="text-left p-3 text-gray-400 font-medium">Type</th>
                      <th className="text-left p-3 text-gray-400 font-medium">Severity</th>
                      <th className="text-left p-3 text-gray-400 font-medium">Status</th>
                      <th className="text-left p-3 text-gray-400 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttacks.slice(0, 10).map((attack) => (
                      <tr
                        key={attack.id}
                        className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="p-3 text-gray-300">
                          {new Date(attack.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-3 text-gray-300 font-mono">
                          {attack.sourceIP}
                        </td>
                        <td className="p-3 text-blue-400 font-mono">
                          {attack.endpoint}
                        </td>
                        <td className="p-3 max-w-xs">
                          <div className="font-mono text-xs">
                            <span className="text-red-400">
                              {attack.query.length > 30 
                                ? attack.query.substring(0, 30) + '...' 
                                : attack.query}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-gray-300">
                          {attack.attackType}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            attack.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                            attack.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {attack.severity}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            attack.status === 'BLOCKED' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {attack.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedAttack(attack)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <AttackAnalysisChart attacks={filteredAttacks} />

        {/* Educational Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 p-6 text-center"
        >
          <p className="text-gray-300 mb-2">
            <strong className="text-blue-400">Educational Simulation</strong> - 
            This SQL injection simulator demonstrates common attack patterns for cybersecurity training purposes.
          </p>
          <p className="text-sm text-gray-500">
            Created by <strong>Nijat Najafov, Huseynli Murad, Elmin Nuriyev</strong> - Azerbaijan Technical University
          </p>
        </motion.div>
      </div>

      {/* Attack Detail Modal */}
      <AnimatePresence>
        {selectedAttack && (
          <AttackDetailModal 
            attack={selectedAttack} 
            onClose={() => setSelectedAttack(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SQLInjectionSimulation;