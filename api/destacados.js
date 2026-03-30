const BASE_URL = 'http://simi-api.com';

function getAuthHeader(token) {
  return 'Basic ' + Buffer.from(`Authorization:${token}`).toString('base64');
}

async function fetchDestacados(token) {
  const url = `${BASE_URL}/ApiSimiweb/response/v21/inmueblesDestacados/`;
  const res = await fetch(url, {
    headers: { Authorization: getAuthHeader(token) },
  });
  const data = await res.json();
  if (data.status === 401 || data.status === 403) return [];
  return data.Inmuebles || data.data || data.response || [];
}

export default async function handler(req, res) {
  const tokenMedellin = process.env.SIMI_TOKEN_MEDELLIN;
  const tokenSabaneta = process.env.SIMI_TOKEN_SABANETA;

  try {
    const [medellin, sabaneta] = await Promise.all([
      fetchDestacados(tokenMedellin),
      fetchDestacados(tokenSabaneta),
    ]);
    const destacados = [...medellin, ...sabaneta];

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    res.status(200).json({ destacados });
  } catch (err) {
    console.error('[api/destacados]', err.message);
    res.status(500).json({ error: 'No se pudieron cargar los destacados' });
  }
}
