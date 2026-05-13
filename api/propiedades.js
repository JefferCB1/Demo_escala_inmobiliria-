import { enforceRateLimit } from './_lib/rateLimit.js';

const BASE_URL = 'https://simi-api.com';

// Whitelists para validación de inputs (A05 - Injection prevention)
const ALLOWED_SEDES = ['medellin', 'sabaneta'];
const ALLOWED_HABITACIONES = ['1', '2', '3', '3+'];
// Campos de ordenamiento aceptados por SIMI (filtroInmueble v2.1.1)
const ALLOWED_CAMPO = ['precio', 'fecha', 'area'];
const ALLOWED_ORDER = ['asc', 'desc'];

// Tope alto para traer todo el catálogo de SIMI cuando no hay filtros server-side.
const MAX_LIMITE = 500;

// Los IDs de SIMI son enteros pequeños (típicamente < 10000).
// Aceptamos hasta 99999 por seguridad pero la validación es estricta.
const MAX_FILTER_ID = 99999;

function getAuthHeader(token) {
  return 'Basic ' + Buffer.from(`Authorization:${token}`).toString('base64');
}

function safeInt(value, fallback = 0, max = 9999) {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 0 || n > max) return fallback;
  return n;
}

async function fetchSimi(token, params) {
  const path = [
    'limite', params.limite,
    'total', params.cantidad,
    'departamento', params.departamento,
    'ciudad', params.ciudad,
    'zona', 0,
    'barrio', 0,
    'tipoInm', params.tipoInm,
    'tipOper', params.tipOper,
    'areamin', 0,
    'areamax', 0,
    'valmin', 0,
    'valmax', 0,
    'campo', params.campo || 0,
    'order', params.order || 0,
    'banios', 0,
    'alcobas', params.alcobas || 0,
    'garajes', 0,
    'sede', 0,
    'usuario', 0,
  ].join('/');

  const url = `${BASE_URL}/ApiSimiweb/response/v2.1.1/filtroInmueble/${path}`;
  const res = await fetch(url, {
    headers: { Authorization: getAuthHeader(token) },
    signal: AbortSignal.timeout(10000),
  });

  const data = await res.json();
  if (data.status === 401 || data.status === 403) return [];
  return data.Inmuebles || data.data || [];
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // 60 req/min por IP — suficiente para uso humano normal (filtros + paginación),
  // bloquea scraping casual.
  if (enforceRateLimit(req, res, { limit: 60, windowMs: 60_000, key: 'propiedades' })) return;

  const { habitaciones, sede } = req.query;

  // Whitelists (A05)
  if (sede && !ALLOWED_SEDES.includes(sede)) {
    return res.status(400).json({ error: 'Parámetro inválido' });
  }
  if (habitaciones && !ALLOWED_HABITACIONES.includes(habitaciones)) {
    return res.status(400).json({ error: 'Parámetro inválido' });
  }

  // Filtros server-side: validados como enteros en rango razonable
  const departamento = safeInt(req.query.departamento, 0, MAX_FILTER_ID);
  const ciudad = safeInt(req.query.ciudad, 0, MAX_FILTER_ID);
  const tipoInm = safeInt(req.query.tipoInm, 0, MAX_FILTER_ID);
  const tipOper = safeInt(req.query.tipOper, 0, MAX_FILTER_ID);
  // Ordenamiento — solo strings de la whitelist, los demás se ignoran (0 = default SIMI)
  const campo = ALLOWED_CAMPO.includes(req.query.campo) ? req.query.campo : 0;
  const order = ALLOWED_ORDER.includes(req.query.order) ? req.query.order : 0;

  // Paginación
  const limite = Math.min(safeInt(req.query.limite, 50), MAX_LIMITE);
  const pagina = safeInt(req.query.pagina, 0, 100);
  const alcobas = habitaciones === '3+' ? '3' : (habitaciones || null);
  const offset = pagina * limite;

  const tokenMedellin = process.env.SIMI_TOKEN_MEDELLIN;
  const tokenSabaneta = process.env.SIMI_TOKEN_SABANETA;

  const tokens = [];
  if (!sede || sede === 'medellin') tokens.push(tokenMedellin);
  if (!sede || sede === 'sabaneta') tokens.push(tokenSabaneta);

  try {
    const simiParams = {
      limite: offset,
      cantidad: limite,
      departamento,
      ciudad,
      tipoInm,
      tipOper,
      campo,
      order,
      alcobas,
    };

    const results = await Promise.all(
      tokens.map(token => fetchSimi(token, simiParams))
    );
    const propiedades = results.flat();

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({ propiedades, total: propiedades.length });
  } catch (err) {
    console.error('[api/propiedades]', err.message);
    res.status(500).json({ error: 'No se pudieron cargar las propiedades' });
  }
}
