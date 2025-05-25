const express = require('express');
const redis = require('redis');
const router = express.Router();

// Подключение к Redis
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
});

redisClient.on('error', (err) => {
  console.log('Redis Client Error', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Инициализация подключения
redisClient.connect();

// API для демонстрации Redis
router.get('/redis/stats', async (req, res) => {
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
router.post('/redis/set', async (req, res) => {
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
router.get('/redis/get/:key', async (req, res) => {
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
router.get('/redis/keys', async (req, res) => {
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
router.delete('/redis/del/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await redisClient.del(key);
    
    res.json({ success: result > 0, key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Очистить всю базу Redis
router.delete('/redis/flush', async (req, res) => {
  try {
    await redisClient.flushAll();
    res.json({ success: true, message: 'Redis flushed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Пример кэширования данных из PostgreSQL
router.get('/redis/cached-data/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `data:${id}`;
    
    // Сначала проверяем кэш
    let data = await redisClient.get(cacheKey);
    
    if (data) {
      // Данные из кэша
      res.json({
        data: JSON.parse(data),
        source: 'cache',
        cached: true
      });
    } else {
      // Имитация запроса к базе данных
      const dbData = {
        id: id,
        name: `Item ${id}`,
        timestamp: new Date().toISOString(),
        description: 'Data from database'
      };
      
      // Сохраняем в кэш на 60 секунд
      await redisClient.setEx(cacheKey, 60, JSON.stringify(dbData));
      
      res.json({
        data: dbData,
        source: 'database',
        cached: false
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;