import { createHash } from 'crypto';

let redis: import('ioredis').Redis | null = null;
let redisAvailable = false;

const REDIS_URL = process.env.REDIS_URL || '';
const CACHE_TTL = parseInt(process.env.REDIS_CACHE_TTL || '3600', 10); // 1 hour default

function getRedis() {
  if (redis !== null) return redis;
  if (!REDIS_URL) {
    redis = null;
    redisAvailable = false;
    return null;
  }
  try {
    const IORedis = require('ioredis');
    const client = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      lazyConnect: true,
    });
    client.on('error', () => { redisAvailable = false; });
    client.connect().then(() => { redisAvailable = true; }).catch(() => { redisAvailable = false; });
    redis = client;
  } catch {
    redis = null;
    redisAvailable = false;
  }
  return redis;
}

export function cacheKey(language: string, code: string, testcaseInput: string): string {
  const hash = createHash('sha256').update(`${language}|${code}|${testcaseInput}`).digest('hex');
  return `judge:${hash}`;
}

export async function cacheGet(key: string): Promise<string | null> {
  const client = getRedis();
  if (!client || !redisAvailable) return null;
  try {
    return await client.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string): Promise<void> {
  const client = getRedis();
  if (!client || !redisAvailable) return;
  try {
    await client.setex(key, CACHE_TTL, value);
  } catch {
    // silent
  }
}
