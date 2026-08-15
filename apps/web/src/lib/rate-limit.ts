type Bucket = { count: number; resetAt: number };

declare global {
  // eslint-disable-next-line no-var
  var __flytheBgRateLimit: Map<string, Bucket> | undefined;
}

const buckets = globalThis.__flytheBgRateLimit ?? new Map<string, Bucket>();
globalThis.__flytheBgRateLimit = buckets;

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function consumeAnonymousRateLimit(key: string) {
  const limit = Math.max(1, Math.floor(positiveNumber(process.env.RATE_LIMIT_ANONYMOUS, 30)));
  const windowSeconds = Math.max(10, Math.floor(positiveNumber(process.env.RATE_LIMIT_WINDOW_SECONDS, 600)));
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    const resetAt = now + windowSeconds * 1000;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, limit, remaining: limit - 1, resetAt };
  }

  current.count += 1;
  if (buckets.size > 10_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey);
    }
    if (buckets.size > 20_000) {
      let removed = 0;
      for (const bucketKey of buckets.keys()) {
        buckets.delete(bucketKey);
        if (++removed >= 5_000) break;
      }
    }
  }

  return {
    allowed: current.count <= limit,
    limit,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
}
