// // backend/server.js
// const express = require('express');
// const cors = require('cors');
// const { Pool } = require('pg');

// const app = express();
// const PORT = process.env.PORT || 8000;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Database connection
// const pool = new Pool({
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 5432,
//   database: process.env.DB_NAME || 'security_dashboard',
//   user: process.env.DB_USER || 'security_user',
//   password: process.env.DB_PASSWORD || 'secure_password_123',
// });

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // API Routes для вашего Security Dashboard
// app.get('/api/threats', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT id, threat_type, severity, status, source_ip, target_ip, 
//              description, detected_at, resolved_at 
//       FROM security.threats 
//       ORDER BY detected_at DESC 
//       LIMIT 100
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error fetching threats:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.get('/api/threats/stats', async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//         threat_type,
//         severity,
//         COUNT(*) as count,
//         COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count
//       FROM security.threats 
//       WHERE detected_at >= NOW() - INTERVAL '24 hours'
//       GROUP BY threat_type, severity
//     `);
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error fetching threat stats:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// app.post('/api/threats', async (req, res) => {
//   try {
//     const { threat_type, severity, source_ip, target_ip, description } = req.body;
    
//     const result = await pool.query(`
//       INSERT INTO security.threats (threat_type, severity, source_ip, target_ip, description)
//       VALUES ($1, $2, $3, $4, $5)
//       RETURNING *
//     `, [threat_type, severity, source_ip, target_ip, description]);
    
//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     console.error('Error creating threat:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Security logs endpoints
// app.get('/api/logs', async (req, res) => {
//   try {
//     const limit = req.query.limit || 50;
//     const result = await pool.query(`
//       SELECT id, timestamp, log_level, source, event_type, 
//              source_ip, message, metadata
//       FROM logs.security_logs 
//       ORDER BY timestamp DESC 
//       LIMIT $1
//     `, [limit]);
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error fetching logs:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Dashboard metrics
// app.get('/api/dashboard/metrics', async (req, res) => {
//   try {
//     const metrics = {
//       total_threats: 0,
//       active_threats: 0,
//       resolved_threats: 0,
//       critical_threats: 0
//     };

//     // Общее количество угроз за последние 24 часа
//     const totalResult = await pool.query(`
//       SELECT COUNT(*) as count 
//       FROM security.threats 
//       WHERE detected_at >= NOW() - INTERVAL '24 hours'
//     `);
//     metrics.total_threats = parseInt(totalResult.rows[0].count);

//     // Активные угрозы
//     const activeResult = await pool.query(`
//       SELECT COUNT(*) as count 
//       FROM security.threats 
//       WHERE status IN ('detected', 'investigating') 
//       AND detected_at >= NOW() - INTERVAL '24 hours'
//     `);
//     metrics.active_threats = parseInt(activeResult.rows[0].count);

//     // Решенные угрозы
//     const resolvedResult = await pool.query(`
//       SELECT COUNT(*) as count 
//       FROM security.threats 
//       WHERE status = 'resolved'
//       AND detected_at >= NOW() - INTERVAL '24 hours'
//     `);
//     metrics.resolved_threats = parseInt(resolvedResult.rows[0].count);

//     // Критические угрозы
//     const criticalResult = await pool.query(`
//       SELECT COUNT(*) as count 
//       FROM security.threats 
//       WHERE severity = 'critical'
//       AND detected_at >= NOW() - INTERVAL '24 hours'
//     `);
//     metrics.critical_threats = parseInt(criticalResult.rows[0].count);

//     res.json(metrics);
//   } catch (error) {
//     console.error('Error fetching dashboard metrics:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Test database connection
// app.get('/api/db-test', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT NOW() as current_time');
//     res.json({ 
//       message: 'Database connected successfully', 
//       timestamp: result.rows[0].current_time 
//     });
//   } catch (error) {
//     console.error('Database connection error:', error);
//     res.status(500).json({ error: 'Database connection failed' });
//   }
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ error: 'Route not found' });
// });

// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Security Dashboard Backend running on port ${PORT}`);
//   console.log(`📊 Health check: http://localhost:${PORT}/health`);
//   console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
// });

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('SIGTERM received, shutting down gracefully');
//   pool.end(() => {
//     console.log('Database pool closed');
//     process.exit(0);
//   });
// });

// process.on('SIGINT', () => {
//   console.log('SIGINT received, shutting down gracefully');
//   pool.end(() => {
//     console.log('Database pool closed');
//     process.exit(0);
//   });
// });

// backend/server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'security_dashboard',
  user: process.env.DB_USER || 'security_user',
  password: process.env.DB_PASSWORD || 'secure_password_123',
});

// Redis connection
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
});

redisClient.on('error', (err) => {
  console.log('Redis Client Error', err);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

// Инициализация подключения к Redis
redisClient.connect().catch(console.error);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Проверяем подключения к БД и Redis
    const dbResult = await pool.query('SELECT NOW() as db_time');
    await redisClient.ping();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      redis: 'connected',
      db_time: dbResult.rows[0].db_time
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// ========== REDIS API ENDPOINTS ==========

// Redis статистика
app.get('/api/redis/stats', async (req, res) => {
  try {
    const info = await redisClient.info();
    const dbSize = await redisClient.dbSize();
    
    res.json({
      connected: true,
      dbSize: dbSize,
      info: info.split('\r\n').reduce((acc, line) => {
        if (line && line.includes(':')) {
          const [key, value] = line.split(':');
          acc[key] = value;
        }
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Установить значение в Redis
app.post('/api/redis/set', async (req, res) => {
  try {
    const { key, value, ttl } = req.body;
    
    if (ttl) {
      await redisClient.setEx(key, ttl, value);
    } else {
      await redisClient.set(key, value);
    }
    
    res.json({ success: true, key, value, ttl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить значение из Redis
app.get('/api/redis/get/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = await redisClient.get(key);
    const ttl = await redisClient.ttl(key);
    
    res.json({ key, value, ttl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все ключи
app.get('/api/redis/keys', async (req, res) => {
  try {
    const keys = await redisClient.keys('*');
    const result = [];
    
    for (const key of keys) {
      const value = await redisClient.get(key);
      const ttl = await redisClient.ttl(key);
      result.push({ key, value, ttl });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить ключ
app.delete('/api/redis/del/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await redisClient.del(key);
    
    res.json({ success: result > 0, key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ОРИГИНАЛЬНЫЕ API ENDPOINTS ==========

// API Routes для вашего Security Dashboard
app.get('/api/threats', async (req, res) => {
  try {
    // Проверяем кэш сначала
    const cacheKey = 'threats:latest';
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return res.json({
        data: JSON.parse(cached),
        source: 'cache'
      });
    }

    // Если нет в кэше, запрашиваем из БД
    const result = await pool.query(`
      SELECT id, threat_type, severity, status, source_ip, target_ip, 
             description, detected_at, resolved_at 
      FROM security.threats 
      ORDER BY detected_at DESC 
      LIMIT 100
    `);
    
    // Кэшируем на 30 секунд
    await redisClient.setEx(cacheKey, 30, JSON.stringify(result.rows));
    
    res.json({
      data: result.rows,
      source: 'database'
    });
  } catch (error) {
    console.error('Error fetching threats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/threats/stats', async (req, res) => {
  try {
    // Кэш для статистики
    const cacheKey = 'threats:stats';
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return res.json({
        data: JSON.parse(cached),
        source: 'cache'
      });
    }

    const result = await pool.query(`
      SELECT 
        threat_type,
        severity,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count
      FROM security.threats 
      WHERE detected_at >= NOW() - INTERVAL '24 hours'
      GROUP BY threat_type, severity
    `);
    
    // Кэшируем на 60 секунд
    await redisClient.setEx(cacheKey, 60, JSON.stringify(result.rows));
    
    res.json({
      data: result.rows,
      source: 'database'
    });
  } catch (error) {
    console.error('Error fetching threat stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/threats', async (req, res) => {
  try {
    const { threat_type, severity, source_ip, target_ip, description } = req.body;
    
    const result = await pool.query(`
      INSERT INTO security.threats (threat_type, severity, source_ip, target_ip, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [threat_type, severity, source_ip, target_ip, description]);
    
    // Инвалидируем кэш при добавлении новой угрозы
    await redisClient.del('threats:latest');
    await redisClient.del('threats:stats');
    await redisClient.del('dashboard:metrics');
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating threat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Security logs endpoints
app.get('/api/logs', async (req, res) => {
  try {
    const limit = req.query.limit || 50;
    const cacheKey = `logs:${limit}`;
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return res.json({
        data: JSON.parse(cached),
        source: 'cache'
      });
    }

    const result = await pool.query(`
      SELECT id, timestamp, log_level, source, event_type, 
             source_ip, message, metadata
      FROM logs.security_logs 
      ORDER BY timestamp DESC 
      LIMIT $1
    `, [limit]);
    
    // Кэшируем на 15 секунд
    await redisClient.setEx(cacheKey, 15, JSON.stringify(result.rows));
    
    res.json({
      data: result.rows,
      source: 'database'
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard metrics с кэшированием
app.get('/api/dashboard/metrics', async (req, res) => {
  try {
    const cacheKey = 'dashboard:metrics';
    const cached = await redisClient.get(cacheKey);
    
    if (cached) {
      return res.json({
        ...JSON.parse(cached),
        source: 'cache'
      });
    }

    const metrics = {
      total_threats: 0,
      active_threats: 0,
      resolved_threats: 0,
      critical_threats: 0
    };

    // Общее количество угроз за последние 24 часа
    const totalResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM security.threats 
      WHERE detected_at >= NOW() - INTERVAL '24 hours'
    `);
    metrics.total_threats = parseInt(totalResult.rows[0].count);

    // Активные угрозы
    const activeResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM security.threats 
      WHERE status IN ('detected', 'investigating') 
      AND detected_at >= NOW() - INTERVAL '24 hours'
    `);
    metrics.active_threats = parseInt(activeResult.rows[0].count);

    // Решенные угрозы
    const resolvedResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM security.threats 
      WHERE status = 'resolved'
      AND detected_at >= NOW() - INTERVAL '24 hours'
    `);
    metrics.resolved_threats = parseInt(resolvedResult.rows[0].count);

    // Критические угрозы
    const criticalResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM security.threats 
      WHERE severity = 'critical'
      AND detected_at >= NOW() - INTERVAL '24 hours'
    `);
    metrics.critical_threats = parseInt(criticalResult.rows[0].count);

    // Кэшируем на 45 секунд
    await redisClient.setEx(cacheKey, 45, JSON.stringify(metrics));
    
    res.json({
      ...metrics,
      source: 'database'
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test database connection
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      message: 'Database connected successfully', 
      timestamp: result.rows[0].current_time 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Redis тест для демонстрации
app.get('/api/redis/demo', async (req, res) => {
  try {
    const testData = {
      timestamp: new Date().toISOString(),
      random: Math.floor(Math.random() * 1000),
      message: 'Hello from Redis demo!'
    };
    
    // Записываем тестовые данные
    await redisClient.setEx('demo:test', 120, JSON.stringify(testData));
    await redisClient.setEx('demo:counter', 300, '1');
    await redisClient.setEx('demo:status', 60, 'active');
    
    // Читаем обратно
    const storedData = await redisClient.get('demo:test');
    const counter = await redisClient.get('demo:counter');
    const status = await redisClient.get('demo:status');
    
    res.json({
      success: true,
      written: testData,
      read: {
        test: JSON.parse(storedData),
        counter: counter,
        status: status
      },
      message: 'Redis demo completed - check Redis Commander at http://localhost:8081'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Security Dashboard Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔴 Redis Demo: http://localhost:${PORT}/api/redis/demo`);
  console.log(`🌐 Redis Commander: http://localhost:8081`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  Promise.all([
    pool.end(),
    redisClient.quit()
  ]).then(() => {
    console.log('Database pool and Redis connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  Promise.all([
    pool.end(),
    redisClient.quit()
  ]).then(() => {
    console.log('Database pool and Redis connection closed');
    process.exit(0);
  });
});