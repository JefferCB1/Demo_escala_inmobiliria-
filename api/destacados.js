import { enforceRateLimit } from './_lib/rateLimit.js';

const BASE_URL = 'https://simi-api.com';

function getAuthHeader(token) {
  return 'Basic ' + Buffer.from(`Authorization:${token}`).toString('base64');
}

async function fetchDestacados(token) {
  const url = `${BASE_URL}/ApiSimiweb/response/v21/inmueblesDestacados/`;
  const res = await fetch(url, {
    headers: { Authorization: getAuthHeader(token) },
    signal: AbortSignal.timeout(10000), // Timeout 10s (A10 - Exceptional conditions)
  });
  const data = await res.json();
  if (data.status === 401 || data.status === 403) return [];
  return data.Inmuebles || data.data || data.response || [];
}

export default async function handler(req, res) {
  // Solo GET permitido (A01 - Access Control)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // 60 req/min por IP
  if (enforceRateLimit(req, res, { limit: 60, windowMs: 60_000, key: 'destacados' })) return;

  const tokenMedellin = process.env.SIMI_TOKEN_MEDELLIN;
  const tokenSabaneta = process.env.SIMI_TOKEN_SABANETA;

  try {
    const [medellin, sabaneta] = await Promise.all([
      fetchDestacados(tokenMedellin),
      fetchDestacados(tokenSabaneta),
    ]);
    const destacados = [...medellin, ...sabaneta];

    // Cache CDN 1h + revalida en background durante 24h (SWR)
    // Las destacadas cambian poco; el usuario nunca espera la latencia de SIMI tras el primer hit.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ destacados });
  } catch (err) {
    // No exponer detalles internos al cliente (A09 - Logging & Alerting)
    console.error('[api/destacados]', err.message);
    res.status(500).json({ error: 'No se pudieron cargar los destacados' });
  }
}
