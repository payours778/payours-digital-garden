import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// 验证码 Redis 存储
// key 约定：
//   sms:code:<phone>   -> 验证码（5 分钟过期）
//   sms:last:<phone>   -> 上次发送时间戳（用于 60s 频率限制）

const CODE_TTL_SECONDS = 5 * 60; // 验证码有效期 5 分钟
const COOLDOWN_SECONDS = 60;     // 同一手机号发送间隔 60s

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

// 生成 6 位随机验证码
export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// 检查是否在冷却期内（60s 内不允许重复发送）
export async function checkCooldown(phone: string): Promise<number> {
  const client = getRedis();
  if (!client) {
    // Redis 不可用时退化为允许发送（代码层面 net，避免短信彻底不可用）
    return 0;
  }
  const last = await client.get(`sms:last:${phone}`);
  if (!last) return 0;
  const elapsed = Math.floor(Date.now() / 1000) - Number(last);
  return Math.max(0, COOLDOWN_SECONDS - elapsed);
}

// 存储验证码
export async function saveCode(phone: string, code: string): Promise<void> {
  const client = getRedis();
  if (!client) return;
  const now = Math.floor(Date.now() / 1000);
  await client.multi()
    .set(`sms:code:${phone}`, code, 'EX', CODE_TTL_SECONDS)
    .set(`sms:last:${phone}`, String(now), 'EX', COOLDOWN_SECONDS)
    .exec();
}

// 校验验证码（原子取出即删除，保证一次性；用 Lua 脚本防止并发重复消费）
export async function verifyCode(phone: string, code: string): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;
  const key = `sms:code:${phone}`;
  // 原子：比较-删除，避免竞态导致验证码可被重复使用
  const lua = `
    local got = redis.call('GET', KEYS[1])
    if got and got == ARGV[1] then
      redis.call('DEL', KEYS[1])
      return 1
    end
    return 0
  `;
  const result = await client.eval(lua, 1, key, code);
  return result === 1;
}