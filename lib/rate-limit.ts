import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const memoryStore = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 24 * 60 * 60 * 1000;
const LIMIT = 10;

const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const upstashLimiter = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.fixedWindow(LIMIT, "1 d"),
      analytics: false,
      prefix: "ekho-cosa",
    })
  : null;

export async function rateLimitCheck(ip: string): Promise<{ ok: boolean; remaining: number }> {
  if (upstashLimiter) {
    const r = await upstashLimiter.limit(ip);
    return { ok: r.success, remaining: r.remaining };
  }
  const now = Date.now();
  const entry = memoryStore.get(ip);
  if (!entry || entry.resetAt < now) {
    memoryStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: LIMIT - 1 };
  }
  entry.count += 1;
  if (entry.count > LIMIT) return { ok: false, remaining: 0 };
  return { ok: true, remaining: LIMIT - entry.count };
}

export function ipFromHeaders(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    "anonymous"
  );
}
