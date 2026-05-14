import { enforceRateLimit } from './_lib/rateLimit.js';

const BASE_URL = 'https://simi-api.com';

// Los IDs de SIMI son enteros pequeños. Aceptamos hasta 99999 con whitelist numérica.
const MAX_FILTER_ID = 99999;

function getAuthHeader(token) {
  return 'Basic ' + Buffer.from(`Authorization:${token}`).toString('base64');
}

function safeInt(value, fallback = 0, max = 9999) {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 0 || n > max) return fallback;
  return n;
}

async function fetchBarrios(token, idCiudad) {
  // idZona=0 trae todos los barrios sin filtro por zona
  const url = `${BASE_URL}/ApiSimiweb/response/v2/barrios/idCiudad/${idCiudad}/idZona/0`;
  const res = await fetch(url, {
    headers: { Authorization: getAuthHeader(token) },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;
  return res.json();
}

// Mapeo defensivo: SIMI puede usar idBarrio, id, etc.
function pickId(item) {
  return (
    item?.idBarrio ??
    item?.IdBarrio ??
    item?.id ??
    item?.codigo ??
    null
  );
}

function pickNombre(item) {
  return (
    item?.nombre ??
    item?.Nombre ??
    item?.NombreB ??
    item?.nombreBarrio ??
    item?.descripcion ??
    ''
  );
}

function extractArray(data) {
  if (Array.isArray(data)) return data;
  return (
    data?.response ??
    data?.data ??
    data?.barrios ??
    data?.Barrios ??
    []
  );
}

function mapBarrios(raw) {
  const arr = extractArray(raw);
  if (!Array.isArray(arr)) return [];
  return arr
    .map(item => ({ id: pickId(item), nombre: pickNombre(item) }))
    .filter(x => x.id !== null && x.nombre);
}

function mergeUniq(a = [], b = []) {
  const seen = new Set();
  const out = [];
  for (const item of [...a, ...b]) {
    if (!item?.id || seen.has(String(item.id))) continue;
    seen.add(String(item.id));
    out.push(item);
  }
  return out.sort((x, y) => x.nombre.localeCompare(y.nombre, 'es'));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (enforceRateLimit(req, res, { limit: 60, windowMs: 60_000, key: 'barrios' })) return;

  const ciudad = safeInt(req.query.ciudad, 0, MAX_FILTER_ID);
  if (!ciudad) {
    return res.status(400).json({ error: 'Parámetro ciudad requerido' });
  }

  const tokenMedellin = process.env.SIMI_TOKEN_MEDELLIN;
  const tokenSabaneta = process.env.SIMI_TOKEN_SABANETA;
  if (!tokenMedellin && !tokenSabaneta) {
    return res.status(500).json({ error: 'Configuración inválida' });
  }

  // Modo debug: respuesta cruda para inspeccionar campos
  if (req.query.debug === '1') {
    const [med, sab] = await Promise.all([
      tokenMedellin ? fetchBarrios(tokenMedellin, ciudad).catch(e => ({ error: e.message })) : null,
      tokenSabaneta ? fetchBarrios(tokenSabaneta, ciudad).catch(e => ({ error: e.message })) : null,
    ]);
    return res.status(200).json({
      _debug: true,
      _ciudad: ciudad,
      medellin: med,
      sabaneta: sab,
    });
  }

  try {
    // Consultamos ambas sedes en paralelo y fusionamos resultados únicos por id
    const [medRaw, sabRaw] = await Promise.all([
      tokenMedellin ? fetchBarrios(tokenMedellin, ciudad).catch(() => null) : null,
      tokenSabaneta ? fetchBarrios(tokenSabaneta, ciudad).catch(() => null) : null,
    ]);

    const medBarrios = mapBarrios(medRaw);
    const sabBarrios = mapBarrios(sabRaw);
    const barrios = mergeUniq(medBarrios, sabBarrios);

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({ barrios });
  } catch (err) {
    console.error('[api/barrios]', err.message);
    res.status(500).json({ error: 'No se pudieron cargar los barrios' });
  }
}
