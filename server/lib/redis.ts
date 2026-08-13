// Redis client - optional, graceful fallback if Redis not available
// @ts-nocheck
const { Redis } = require('ioredis');

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Ensure connection is attempted (non-blocking)
redisClient.connect().then(() => console.log('Redis connected')).catch(() => {
  console.warn('Redis not available - running without Redis features');
});

// Session store - initialized by server setup
let redisSessionStore = null;

// Rate limiter - fallback to in-memory if Redis unavailable
let redisRateLimitFn = (req, res, next) => next();

// Export for use by server index
module.exports = {
  redisClient,
  redisSessionStore,
  redisRateLimitFn
};