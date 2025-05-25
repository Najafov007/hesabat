import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Shield, 
  AlertTriangle, 
  Eye, 
  Download,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  MapPin,
  User,
  Database,
  Wifi,
  Upload,
  Settings,
  ArrowLeft
} from 'lucide-react';

// Custom hook for log management
const useLogFilter = (logs, filters) => {
  return useMemo(() => {
    return logs.filter(log => {
      // Search filter
      if (filters.search && !log.description.toLowerCase().includes(filters.search.toLowerCase()) &&
          !log.ip.includes(filters.search) && !log.source.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Severity filter
      if (filters.severity.length > 0 && !filters.severity.includes(log.severity)) {
        return false;
      }
      
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(log.status)) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange.start && new Date(log.timestamp) < new Date(filters.dateRange.start)) {
        return false;
      }
      if (filters.dateRange.end && new Date(log.timestamp) > new Date(filters.dateRange.end)) {
        return false;
      }
      
      return true;
    });
  }, [logs, filters]);
};

// Mock log data generator
const generateMockLogs = (type, count = 50) => {
  const severities = ['Critical', 'High', 'Medium', 'Low'];
  const statuses = ['Blocked', 'Allowed', 'Monitored', 'Quarantined'];
  const sources = ['External', 'Internal', 'VPN', 'Guest Network'];
  
  const typeSpecificData = {
    ddos: {
      descriptions: [
        'DDoS attack detected from multiple IPs',
        'Traffic spike detected - potential flood attack',
        'Unusual packet rate from single source',
        'SYN flood attack attempt blocked',
        'UDP flood detected and mitigated'
      ],
      ports: [80, 443, 22, 53, 25]
    },
    sql: {
      descriptions: [
        'SQL injection attempt on login form',
        'Malicious query blocked by WAF',
        'Union-based injection detected',
        'Time-based blind injection attempt',
        'Stored XSS payload in SQL query'
      ],
      endpoints: ['/login', '/search', '/profile', '/admin', '/api/users']
    },
    mitm: {
      descriptions: [
        'SSL certificate mismatch detected',
        'ARP poisoning attempt identified',
        'Suspicious DNS responses logged',
        'HTTPS downgrade attack blocked',
        'Rogue access point detected'
      ],
      protocols: ['HTTPS', 'HTTP', 'DNS', 'ARP', 'DHCP']
    },
    malware: {
      descriptions: [
        'Malicious file upload blocked',
        'Suspicious executable detected',
        'Trojan signature matched',
        'Ransomware behavior identified',
        'Cryptominer payload blocked'
      ],
      fileTypes: ['.exe', '.zip', '.pdf', '.doc', '.js']
    }
  };

  return Array.from({ length: count }, (_, i) => {
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    const typeData = typeSpecificData[type];
    const description = typeData.descriptions[Math.floor(Math.random() * typeData.descriptions.length)];
    
    let additionalInfo = {};
    switch(type) {
      case 'ddos':
        additionalInfo = {
          port: typeData.ports[Math.floor(Math.random() * typeData.ports.length)],
          packetCount: Math.floor(Math.random() * 10000) + 1000,
          duration: Math.floor(Math.random() * 300) + 10
        };
        break;
      case 'sql':
        additionalInfo = {
          endpoint: typeData.endpoints[Math.floor(Math.random() * typeData.endpoints.length)],
          payload: `' OR 1=1 --`,
          userAgent: 'Mozilla/5.0 (compatible; scanner)'
        };
        break;
      case 'mitm':
        additionalInfo = {
          protocol: typeData.protocols[Math.floor(Math.random() * typeData.protocols.length)],
          spoofedIP: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          interceptedData: 'credentials, session tokens'
        };
        break;
      case 'malware':
        additionalInfo = {
          fileName: `malicious_file${typeData.fileTypes[Math.floor(Math.random() * typeData.fileTypes.length)]}`,
          fileSize: Math.floor(Math.random() * 10000) + 100,
          hash: Math.random().toString(36).substring(2, 34)
        };
        break;
    }
    
    return {
      id: `${type}_${i}`,
      timestamp: timestamp.toISOString(),
      severity,
      status,
      source,
      ip,
      description,
      type: type.toUpperCase(),
      ...additionalInfo
    };
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

// Filter Panel Component
const FilterPanel = ({ isOpen, onClose, filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  
  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };
  
  const handleReset = () => {
    const resetFilters = {
      search: '',
      severity: [],
      status: [],
      dateRange: { start: '', end: '' },
      source: []
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-700 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={localFilters.search}
                    onChange={(e) => setLocalFilters({...localFilters, search: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400"
                    placeholder="Search logs..."
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
                <div className="space-y-2">
                  {['Critical', 'High', 'Medium', 'Low'].map(severity => (
                    <label key={severity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localFilters.severity.includes(severity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLocalFilters({
                              ...localFilters,
                              severity: [...localFilters.severity, severity]
                            });
                          } else {
                            setLocalFilters({
                              ...localFilters,
                              severity: localFilters.severity.filter(s => s !== severity)
                            });
                          }
                        }}
                        className="mr-2 rounded"
                      />
                      <span className={`text-sm ${
                        severity === 'Critical' ? 'text-red-400' :
                        severity === 'High' ? 'text-orange-400' :
                        severity === 'Medium' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {severity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <div className="space-y-2">
                  {['Blocked', 'Allowed', 'Monitored', 'Quarantined'].map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localFilters.status.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLocalFilters({
                              ...localFilters,
                              status: [...localFilters.status, status]
                            });
                          } else {
                            setLocalFilters({
                              ...localFilters,
                              status: localFilters.status.filter(s => s !== status)
                            });
                          }
                        }}
                        className="mr-2 rounded"
                      />
                      <span className="text-sm text-gray-300">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={localFilters.dateRange.start}
                    onChange={(e) => setLocalFilters({
                      ...localFilters,
                      dateRange: {...localFilters.dateRange, start: e.target.value}
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <input
                    type="date"
                    value={localFilters.dateRange.end}
                    onChange={(e) => setLocalFilters({
                      ...localFilters,
                      dateRange: {...localFilters.dateRange, end: e.target.value}
                    })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleApply}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Log Detail Modal Component
const LogDetailModal = ({ log, isOpen, onClose }) => {
  if (!log) return null;

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Critical': return 'text-red-400 bg-red-400/10';
      case 'High': return 'text-orange-400 bg-orange-400/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'Low': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Blocked': return 'text-red-400 bg-red-400/10';
      case 'Allowed': return 'text-green-400 bg-green-400/10';
      case 'Monitored': return 'text-blue-400 bg-blue-400/10';
      case 'Quarantined': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Log Details</h3>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 mb-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium text-purple-400 bg-purple-400/10">
                      {log.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-400">Timestamp</span>
                      </div>
                      <p className="text-white font-medium">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-400">Source IP</span>
                      </div>
                      <p className="text-white font-medium font-mono">{log.ip}</p>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-400">Description</span>
                    </div>
                    <p className="text-white">{log.description}</p>
                  </div>

                  {log.type === 'DDOS' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <span className="text-sm text-gray-400">Target Port</span>
                        <p className="text-white font-medium">{log.port}</p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <span className="text-sm text-gray-400">Packet Count</span>
                        <p className="text-white font-medium">{log.packetCount?.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <span className="text-sm text-gray-400">Duration (s)</span>
                        <p className="text-white font-medium">{log.duration}</p>
                      </div>
                    </div>
                  )}

                  {log.type === 'SQL' && (
                    <div className="space-y-4">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <span className="text-sm text-gray-400">Endpoint</span>
                        <p className="text-white font-medium font-mono">{log.endpoint}</p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <span className="text-sm text-gray-400">Payload</span>
                        <p className="text-red-400 font-mono text-sm bg-gray-900 p-2 rounded border-l-2 border-red-400">
                          {log.payload}
                        </p>
                      </div>
                    </div>
                  )}

                  {log.type === 'MITM' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <span className="text-sm text-gray-400">Protocol</span>
                        <p className="text-white font-medium">{log.protocol}</p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <span className="text-sm text-gray-400">Spoofed IP</span>
                        <p className="text-white font-medium font-mono">{log.spoofedIP}</p>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg md:col-span-2">
                        <span className="text-sm text-gray-400">Intercepted Data</span>
                        <p className="text-orange-400 font-medium">{log.interceptedData}</p>
                      </div>
                    </div>
                  )}

                  {log.type === 'MALWARE' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <span className="text-sm text-gray-400">File Name</span>
                          <p className="text-white font-medium font-mono">{log.fileName}</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg">
                          <span className="text-sm text-gray-400">File Size</span>
                          <p className="text-white font-medium">{log.fileSize} bytes</p>
                        </div>
                      </div>
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <span className="text-sm text-gray-400">File Hash</span>
                        <p className="text-white font-medium font-mono text-sm break-all">{log.hash}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-400">Source</span>
                    </div>
                    <p className="text-white font-medium">{log.source}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Log Table Component
const LogTable = ({ logs, onRowClick }) => {
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState('desc');

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'timestamp') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [logs, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'Critical': return 'text-red-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Blocked': return 'text-red-400';
      case 'Allowed': return 'text-green-400';
      case 'Monitored': return 'text-blue-400';
      case 'Quarantined': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const SortableHeader = ({ field, children }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          sortDirection === 'asc' ? 
          <ChevronUp className="w-3 h-3" /> : 
          <ChevronDown className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <SortableHeader field="timestamp">Time</SortableHeader>
              <SortableHeader field="type">Type</SortableHeader>
              <SortableHeader field="severity">Severity</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="ip">Source IP</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {sortedLogs.map((log, index) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => onRowClick(log)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-purple-400/10 text-purple-400 rounded-full">
                    {log.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getSeverityColor(log.severity)}`}>
                    {log.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                  {log.ip}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                  {log.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(log);
                    }}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedLogs.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No logs match your current filters</p>
        </div>
      )}
    </div>
  );
};

// Individual Log Page Component
const LogPage = ({ type, onBack }) => {
  const [logs] = useState(() => generateMockLogs(type, 100));
  const [selectedLog, setSelectedLog] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    severity: [],
    status: [],
    dateRange: { start: '', end: '' },
    source: []
  });

  const filteredLogs = useLogFilter(logs, filters);

  const getPageTitle = () => {
    switch(type) {
      case 'ddos': return 'DDoS Attack Logs';
      case 'sql': return 'SQL Injection Logs';
      case 'mitm': return 'Man-in-the-Middle Logs';
      case 'malware': return 'Malware Detection Logs';
      default: return 'Security Logs';
    }
  };

  const getPageIcon = () => {
    switch(type) {
      case 'ddos': return <Wifi className="w-6 h-6" />;
      case 'sql': return <Database className="w-6 h-6" />;
      case 'mitm': return <Shield className="w-6 h-6" />;
      case 'malware': return <Upload className="w-6 h-6" />;
      default: return <Settings className="w-6 h-6" />;
    }
  };

  const activeFiltersCount = 
    (filters.search ? 1 : 0) +
    filters.severity.length +
    filters.status.length +
    (filters.dateRange.start || filters.dateRange.end ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="text-blue-400">
                {getPageIcon()}
              </div>
              <h1 className="text-xl font-bold">{getPageTitle()}</h1>
              <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full">
                {filteredLogs.length} entries
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 w-64"
                  placeholder="Quick search..."
                />
              </div>
              
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-xl border border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Logs</p>
                <p className="text-2xl font-bold text-white">{logs.length}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-xl border border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Critical Threats</p>
                <p className="text-2xl font-bold text-red-400">
                  {logs.filter(log => log.severity === 'Critical').length}
                </p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-xl border border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Blocked</p>
                <p className="text-2xl font-bold text-green-400">
                  {logs.filter(log => log.status === 'Blocked').length}
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-xl border border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Last 24h</p>
                <p className="text-2xl font-bold text-white">
                  {logs.filter(log => 
                    new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length}
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {activeFiltersCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-400">Active filters:</span>
                {filters.search && (
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    Search: "{filters.search}"
                  </span>
                )}
                {filters.severity.map(severity => (
                  <span key={severity} className="px-2 py-1 bg-orange-600 text-white text-xs rounded-full">
                    {severity}
                  </span>
                ))}
                {filters.status.map(status => (
                  <span key={status} className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                    {status}
                  </span>
                ))}
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                    Date Range
                  </span>
                )}
              </div>
              <button
                onClick={() => setFilters({
                  search: '',
                  severity: [],
                  status: [],
                  dateRange: { start: '', end: '' },
                  source: []
                })}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
            </div>
          </motion.div>
        )}

        <LogTable 
          logs={filteredLogs} 
          onRowClick={setSelectedLog}
        />

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {filteredLogs.length} of {logs.length} logs
          </p>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-sm">
              Previous
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">1</span>
            <span className="px-3 py-1 text-gray-400 text-sm">2</span>
            <span className="px-3 py-1 text-gray-400 text-sm">3</span>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded transition-colors text-sm">
              Next
            </button>
          </div>
        </div>
      </div>

      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      <LogDetailModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};

// Main Logs Navigation Component
const LogsNavigation = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            Security Logs Dashboard
          </motion.h1>
          <p className="text-xl text-gray-400">
            Advanced log analysis and threat monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              type: 'ddos',
              title: 'DDoS Attacks',
              description: 'Distributed denial of service attack logs',
              icon: <Wifi className="w-8 h-8" />,
              color: 'red',
              count: 45
            },
            {
              type: 'sql',
              title: 'SQL Injection',
              description: 'Database injection attempt logs',
              icon: <Database className="w-8 h-8" />,
              color: 'orange',
              count: 32
            },
            {
              type: 'mitm',
              title: 'MITM Attacks',
              description: 'Man-in-the-middle interception logs',
              icon: <Shield className="w-8 h-8" />,
              color: 'yellow',
              count: 18
            },
            {
              type: 'malware',
              title: 'Malware Detection',
              description: 'Malicious file upload attempts',
              icon: <Upload className="w-8 h-8" />,
              color: 'purple',
              count: 27
            }
          ].map((item, index) => (
            <motion.div
              key={item.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <button
                onClick={() => onNavigate(item.type)}
                className="w-full text-left bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 p-6 transition-all duration-200 transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${item.color === 'red' ? 'bg-red-500/10 text-red-400' :
                    item.color === 'orange' ? 'bg-orange-500/10 text-orange-400' :
                    item.color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}>
                    {item.icon}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${item.color === 'red' ? 'bg-red-500/20 text-red-400' :
                    item.color === 'orange' ? 'bg-orange-500/20 text-orange-400' :
                    item.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {item.count} logs
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {item.description}
                </p>
                
                <div className="mt-4 flex items-center text-blue-400 text-sm">
                  <span>View Logs</span>
                  <ChevronDown className="w-4 h-4 ml-1 transform -rotate-90 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gray-900 rounded-xl border border-gray-700 p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">122</div>
              <div className="text-gray-400">Total Threats Detected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">98.7%</div>
              <div className="text-gray-400">Threats Blocked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
              <div className="text-gray-400">Monitoring Active</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Main App Component
const SecurityLogs = () => {
  const [currentView, setCurrentView] = useState('navigation'); // 'navigation' or log type
  
  const handleNavigate = (logType) => {
    setCurrentView(logType);
  };
  
  const handleBack = () => {
    setCurrentView('navigation');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {currentView === 'navigation' ? (
        <LogsNavigation onNavigate={handleNavigate} />
      ) : (
        <LogPage type={currentView} onBack={handleBack} />
      )}
      
      <footer className="bg-gray-900 border-t border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p className="text-sm">
              🎓 Educational Cybersecurity Simulation • Created by{' '}
              <span className="text-blue-400 font-medium">Nijat Najafov</span>,{' '}
              <span className="text-blue-400 font-medium">Huseynli Murad</span>,{' '}
              <span className="text-blue-400 font-medium">Elmin Nuriyev</span>
            </p>
            <p className="text-xs mt-1">
              Azerbaijan Technical University • Advanced Security Log Analysis System
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SecurityLogs;