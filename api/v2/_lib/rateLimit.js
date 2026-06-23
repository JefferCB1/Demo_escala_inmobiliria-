// Rate limiter en memoria, sliding window por IP.
//
// Limitaciones conocidas:
// - Memoria es local a cada instancia warm de Vercel. Un atacante distribuido
//   o requests muy paralelos pueden caer en distintas instancias y evadirlo.
// - Para protección robusta contra DDoS: activar Vercel Firewall (Settings →
//   Firewall → Rate limiting) o usar @upstash/ratelimit + Upstash Redis.
//
// Este rate limit cubre el 90% de casos: bots simples, scrapers casuales,
// scripts mal configurados y abuse desde una sola IP.

const buckets = new Map();

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

function cleanup(now) {
  if (buckets.size < 1000) return;
  for (const [ip, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(ip);
  }
}

export function rateLimit(req, { limit = 60, windowMs = 60_000, key = '' } = {}) {
  const ip = getClientIp(req);
  const bucketKey = key ? `${ip}:${key}` : ip;
  const now = Date.now();

  cleanup(now);

  const bucket = buckets.get(bucketKey);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count++;
  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 };
}

export function enforceRateLimit(req, res, opts) {
  const result = rateLimit(req, opts);
  res.setHeader('X-RateLimit-Limit', opts?.limit ?? 60);
  res.setHeader('X-RateLimit-Remaining', result.remaining);

  if (!result.ok) {
    res.setHeader('Retry-After', result.retryAfter);
    res.status(429).json({ error: 'Demasiadas peticiones. Inténtalo más tarde.' });
    return true;
  }
  return false;
}
