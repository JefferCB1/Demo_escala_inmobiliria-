const BASE_URL = 'http://simi-api.com';

// Valores permitidos para validación de inputs (A05 - Injection prevention)
const ALLOWED_SEDES = ['medellin', 'sabaneta'];
const ALLOWED_HABITACIONES = ['1', '2', '3', '3+'];
const MAX_LIMITE = 100;

function getAuthHeader(token) {
  return 'Basic ' + Buffer.from(`Authorization:${token}`).toString('base64');
}

// Sanitiza parámetros numéricos — solo permite dígitos (A05 Injection)
function safeInt(value, fallback = 0, max = 9999) {
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 0 || n > max) return fallback;
  return n;
}

async function fetchSimi(token, { limite, cantidad, alcobas }) {
  const path = [
    'limite', limite,
    'total', cantidad,
    'departamento', 0,
    'ciudad', 0,
    'zona', 0,
    'barrio', 0,
    'tipoInm', 0,
    'tipOper', 0,
    'areamin', 0,
    'areamax', 0,
    'valmin', 0,
    'valmax', 0,
    'campo', 0,
    'order', 0,
    'banios', 0,
    'alcobas', alcobas || 0,
    'garajes', 0,
    'sede', 0,
    'usuario', 0,
  ].join('/');

  const url = `${BASE_URL}/ApiSimiweb/response/v2.1.1/filtroInmueble/${path}`;
  const res = await fetch(url, {
    headers: { Authorization: getAuthHeader(token) },
    signal: AbortSignal.timeout(10000), // Timeout 10s (A10 - Exceptional conditions)
  });

  const data = await res.json();
  if (data.status === 401 || data.status === 403) return [];
  return data.Inmuebles || data.data || [];
}

export default async function handler(req, res) {
  // Solo GET permitido (A01 - Access Control)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { habitaciones, sede } = req.query;

  // Validar sede contra lista blanca (A05 - Injection)
  if (sede && !ALLOWED_SEDES.includes(sede)) {
    return res.status(400).json({ error: 'Parámetro inválido' });
  }

  // Validar habitaciones contra lista blanca
  if (habitaciones && !ALLOWED_HABITACIONES.includes(habitaciones)) {
    return res.status(400).json({ error: 'Parámetro inválido' });
  }

  // Sanitizar numéricos con límites
  const limite = Math.min(safeInt(req.query.limite, 20), MAX_LIMITE);
  const pagina = safeInt(req.query.pagina, 0, 100);
  const alcobas = habitaciones === '3+' ? '3' : (habitaciones || null);
  const offset = pagina * limite;

  const tokenMedellin = process.env.SIMI_TOKEN_MEDELLIN;
  const tokenSabaneta = process.env.SIMI_TOKEN_SABANETA;

  const tokens = [];
  if (!sede || sede === 'medellin') tokens.push(tokenMedellin);
  if (!sede || sede === 'sabaneta') tokens.push(tokenSabaneta);

  try {
    const results = await Promise.all(
      tokens.map(token => fetchSimi(token, { limite: offset, cantidad: limite, alcobas }))
    );
    const propiedades = results.flat();

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({ propiedades, total: propiedades.length });
  } catch (err) {
    // No exponer detalles internos al cliente (A09 - Logging & Alerting)
    console.error('[api/propiedades]', err.message);
    res.status(500).json({ error: 'No se pudieron cargar las propiedades' });
  }
}
