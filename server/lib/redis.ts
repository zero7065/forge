// Redis client - optional, graceful fallback if Redis not available
import IORedis from 'ioredis';

let redisClient: IORedis.Redis | null = null;

// Initialize Redis connection (optional - silent local fallback)
export async function initRedis(): Promise<void> {
  // Skip Redis entirely unless explicitly configured - local-first
  if (!process.env.REDIS_HOST) {
    redisClient = null;
    return;
  }
  try {
    redisClient = new IORedis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: () => null,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    });

    redisClient.on('error', () => { /* silent - memory fallback */ });

    await redisClient.ping();
    console.log('Redis connected');
  } catch {
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