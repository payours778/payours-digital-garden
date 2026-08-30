import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// 短信发送频率 Redis 存储（验证码本身由阿里云号码认证服务管理）
// key 约定：
//   sms:last:<purpose>:<phone> -> 上次发送时间戳（用于 60s 频率限制）

const COOLDOWN_SECONDS = 60;     // 同一手机号发送间隔 60s
export type SmsPurpose = 'register' | 'login';

let redis: Redis | null = null;
let redisError: Error | null = null;

function getRedis(): Redis | null {
  if (redisError) return null;
  if (redis) return redis;
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT || 6379),
      password: process.env.REDIS_PASSWORD || undefined,
      // 连接失败不阻塞整个应用
      lazyConnect: false,
      enableReadyCheck: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // 失败不无限重试
    });
    redis.on('error', (err) => {
      redisError = err;
      console.error('[SMS/Redis] Redis error:', err.message);
    });
    redis.on('ready', () => {
      redisError = null;
      console.log('[SMS/Redis] Redis connected');
    });
    return redis;
  } catch (err: any) {
    redisError = err;
    console.error('[SMS/Redis] Redis init failed:', err.message);
    return null;
  }
}

export function isRedisAvailable(): boolean {
  return !redisError && !!redis;
}

// 检查是否在冷却期内（60s 内不允许重复发送）
export async function checkCooldown(phone: string, purpose: SmsPurpose): Promise<number> {
  const client = getRedis();
  if (!client) {
    // Redis 不可用时退化为允许发送（代码层面 net，避免短信彻底不可用）
    return 0;
  }
  const last = await client.get(`sms:last:${purpose}:${phone}`);
  if (!last) return 0;
  const elapsed = Math.floor(Date.now() / 1000) - Number(last);
  return Math.max(0, COOLDOWN_SECONDS - elapsed);
}

// 记录发送时间
export async function markCooldown(phone: string, purpose: SmsPurpose): Promise<void> {
  const client = getRedis();
  if (!client) return;
  const now = Math.floor(Date.now() / 1000);
  await client.set(`sms:last:${purpose}:${phone}`, String(now), 'EX', COOLDOWN_SECONDS);
}
