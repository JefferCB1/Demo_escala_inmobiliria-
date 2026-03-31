const BASE_URL = 'https://simi-api.com';

function getAuthHeader(token) {
  return 'Basic ' + Buffer.from(`Authorization:${token}`).toString('base64');
}

async function fetchSimi(token, id) {
  const url = `${BASE_URL}/ApiSimiweb/response/v2/inmueble/codInmueble/${id}`;
  const res = await fetch(url, {
    headers: { Authorization: getAuthHeader(token) },
  });
  if (!res.ok) throw new Error(`SIMI error: ${res.status}`);
  return res.json();
}

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID requerido' });
  }

  const tokenMedellin = process.env.SIMI_TOKEN_MEDELLIN;
  const tokenSabaneta = process.env.SIMI_TOKEN_SABANETA;

  // Try Medellín first, then Sabaneta if not found
  try {
    let data = await fetchSimi(tokenMedellin, id);
    if (!data || (Array.isArray(data) && data.length === 0)) {
      data = await fetchSimi(tokenSabaneta, id);
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    const propiedad = Array.isArray(data) ? data[0] : data;

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({ propiedad });
  } catch (err) {
    console.error('[api/propiedad/[id]]', err.message);
    res.status(500).json({ error: 'No se pudo cargar la propiedad' });
  }
}
