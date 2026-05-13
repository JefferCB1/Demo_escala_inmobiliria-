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

  const tokenMedellin = process.env.SIMI_TOKEN_MEDELLIN;
  const tokenSabaneta = process.env.SIMI_TOKEN_SABANETA;

  try {
    const [medellin, sabaneta] = await Promise.all([
      fetchDestacados(tokenMedellin),
      fetchDestacados(tokenSabaneta),
    ]);
    const destacados = [...medellin, ...sabaneta];

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({ destacados });
  } catch (err) {
    // No exponer detalles internos al cliente (A09 - Logging & Alerting)
    console.error('[api/destacados]', err.message);
    res.status(500).json({ error: 'No se pudieron cargar los destacados' });
  }
}
