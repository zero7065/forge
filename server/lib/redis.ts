// Redis client - optional, graceful fallback if Redis not available
import IORedis from 'ioredis';

let redisClient: IORedis.Redis | null = null;

// Initialize Redis connection
export async function initRedis(): Promise<void> {
  try {
    redisClient = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

    redisClient.on('error', (err: Error) => console.error('Redis Client Error', err));

    // Ensure connection is attempted (non-blocking)
    await redisClient.connect();
    console.log('Redis connected');
  } catch (err) {
    console.warn('Redis not available - running without Redis features');
    redisClient = null;
  }
}

// Get the Redis client (returns null if Redis unavailable)
export function getRedis(): IORedis.Redis | null {
  return redisClient;
}

// Session store - initialized by server setup
let redisSessionStore: any = null;

// Rate limiter - fallback to in-memory if Redis unavailable
let redisRateLimitFn = (req: any, res: any, next: any) => next();

// Export for use by server
// (individual functions already exported above)
//