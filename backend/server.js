const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { Client } = require('pg');
const redis = require('redis');
const promClient = require('prom-client');

// Инициализация Express
const app = express();
const PORT = process.env.PORT || 8000;

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  registers: [register]
});

// Database connection
const dbClient = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'security_dashboard',
  user: process.env.DB_USER || 'security_user',
  password: process.env.DB_PASSWORD || 'secure_password_123'
});

// Redis connection
console.log(`🔄 Connecting to Redis at ${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`);

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    reconnectStrategy: (retries) => {
      console.log(`Redis reconnect attempt ${retries}`);
      if (retries > 10) {
        console.log('Redis max reconnect attempts reached');
        return false;
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    });
    httpRequestDuration.observe({
      method: req.method,
      route: req.route?.path || req.path
    }, duration);
  });
  
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await dbClient.query('SELECT 1');
    
    // Check Redis connection
    if (redisClient.isOpen) {
      await redisClient.ping();
    }
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: redisClient.isOpen ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: 'error',
        redis: redisClient.isOpen ? 'connected' : 'disconnected'
      }
    });
  }
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Security Dashboard endpoints
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    let cachedStats = null;
    
    // Try to get cached stats from Redis if connected
    if (redisClient.isOpen) {
      try {
        cachedStats = await redisClient.get('dashboard:stats');
      } catch (redisError) {
        console.warn('Redis get failed:', redisError.message);
      }
    }
    
    if (cachedStats) {
      return res.json(JSON.parse(cachedStats));
    }

    // If no cache, get from database
    const result = await dbClient.query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_severity,
        COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_severity,
        COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_severity,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h
      FROM security_events
    `);

    const stats = {
      totalEvents: parseInt(result.rows[0].total_events),
      highSeverity: parseInt(result.rows[0].high_severity),
      mediumSeverity: parseInt(result.rows[0].medium_severity),
      lowSeverity: parseInt(result.rows[0].low_severity),
      last24Hours: parseInt(result.rows[0].last_24h),
      timestamp: new Date().toISOString()
    };

    // Cache for 5 minutes if Redis is connected
    if (redisClient.isOpen) {
      try {
        await redisClient.setEx('dashboard:stats', 300, JSON.stringify(stats));
      } catch (redisError) {
        console.warn('Redis setEx failed:', redisError.message);
      }
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/dashboard/events', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const result = await dbClient.query(`
      SELECT id, event_type, severity, description, source_ip, created_at
      FROM security_events
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await dbClient.query('SELECT COUNT(*) FROM security_events');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      events: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/dashboard/events', async (req, res) => {
  try {
    const { event_type, severity, description, source_ip } = req.body;
    
    const result = await dbClient.query(`
      INSERT INTO security_events (event_type, severity, description, source_ip, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, created_at
    `, [event_type, severity, description, source_ip]);

    // Invalidate cache if Redis is connected
    if (redisClient.isOpen) {
      try {
        await redisClient.del('dashboard:stats');
      } catch (redisError) {
        console.warn('Redis del failed:', redisError.message);
      }
    }

    res.status(201).json({
      id: result.rows[0].id,
      created_at: result.rows[0].created_at,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// System monitoring endpoints
app.get('/api/system/metrics', async (req, res) => {
  try {
    const metrics = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString()
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Error getting system metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Initialize connections and start server
async function startServer() {
  try {
    console.log('🔄 Starting server initialization...');
    
    // Connect to PostgreSQL
    console.log(`🔄 Connecting to PostgreSQL at ${process.env.DB_HOST || 'postgres'}:${process.env.DB_PORT || 5432}`);
    await dbClient.connect();
    console.log('✅ Connected to PostgreSQL');

    // Connect to Redis
    console.log(`🔄 Attempting Redis connection to ${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`);
    
    // Setup Redis event listeners before connecting
    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
    });
    
    redisClient.on('connect', () => {
      console.log('🔗 Redis connecting...');
    });
    
    redisClient.on('ready', () => {
      console.log('✅ Redis connection ready');
    });
    
    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
    
    redisClient.on('end', () => {
      console.log('📡 Redis connection ended');
    });

    try {
      await redisClient.connect();
      console.log('✅ Connected to Redis successfully');
    } catch (redisError) {
      console.warn('⚠️  Redis connection failed, continuing without cache:', redisError.message);
      console.warn('⚠️  Application will work without Redis caching');
    }

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API available at: http://localhost:${PORT}/api`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
      console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
      console.log(`🔧 Redis status: ${redisClient.isOpen ? 'Connected' : 'Disconnected'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  try {
    await dbClient.end();
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  try {
    await dbClient.end();
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
});

startServer();