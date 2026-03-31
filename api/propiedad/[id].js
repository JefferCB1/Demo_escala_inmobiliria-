const BASE_URL = 'https://simi-api.com';

// Solo permite IDs con formato válido de SIMI: números, letras y guion (A05 - Injection)
const VALID_ID_REGEX = /^[\w-]{1,30}$/;

function getAuthHeader(token) {
  return 'Basic ' + Buffer.from(`Authorization:${token}`).toString('base64');
}

async function fetchSimi(token, id) {
  const url = `${BASE_URL}/ApiSimiweb/response/v2/inmueble/codInmueble/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    headers: { Authorization: getAuthHeader(token) },
    signal: AbortSignal.timeout(10000), // Timeout 10s (A10 - Exceptional conditions)
  });
  if (!res.ok) throw new Error(`SIMI error: ${res.status}`);
  return res.json();
}

export default async function handler(req, res) {
  // Solo GET permitido (A01 - Access Control)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  // Validar formato del ID — previene path traversal e inyección (A05)
  if (!id || !VALID_ID_REGEX.test(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const tokenMedellin = process.env.SIMI_TOKEN_MEDELLIN;
  const tokenSabaneta = process.env.SIMI_TOKEN_SABANETA;

  try {
    // Buscar en Medellín primero, luego Sabaneta
    let data = null;
    try {
      data = await fetchSimi(tokenMedellin, id);
    } catch {
      // Token Medellín falló — continuar con Sabaneta
    }

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
    console.error('[api/propiedad]', err.message);
    res.status(500).json({ error: 'No se pudo cargar la propiedad' });
  }
}
