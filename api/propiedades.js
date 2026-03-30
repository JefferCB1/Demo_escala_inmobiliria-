const BASE_URL = 'http://simi-api.com';

function getAuthHeader(token) {
  return 'Basic ' + Buffer.from(`Authorization:${token}`).toString('base64');
}

async function fetchSimi(token, { limite, cantidad, tipo, operacion, ciudad, alcobas }) {
  const path = [
    'limite', limite,
    'total', cantidad,
    'departamento', 0,
    'ciudad', ciudad || 0,
    'zona', 0,
    'barrio', 0,
    'tipoInm', tipo || 0,
    'tipOper', operacion || 0,
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
  console.log('[SIMI URL]', url);

  const res = await fetch(url, {
    headers: { Authorization: getAuthHeader(token) },
  });

  console.log('[SIMI STATUS]', res.status);
  const text = await res.text();
  console.log('[SIMI RAW]', text.slice(0, 500));

  if (!res.ok) throw new Error(`SIMI error: ${res.status}`);

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`SIMI JSON parse error: ${text.slice(0, 200)}`);
  }
}

export default async function handler(req, res) {
  const {
    operacion,
    tipo,
    ciudad,
    habitaciones,
    limite = '20',
    pagina = '0',
    sede,
  } = req.query;

  const alcobas = habitaciones === '3+' ? '3' : (habitaciones || null);
  const offset = parseInt(pagina) * parseInt(limite);

  const params = { limite: offset, cantidad: parseInt(limite), tipo, operacion, ciudad, alcobas };

  const tokenMedellin = process.env.SIMI_TOKEN_MEDELLIN;
  const tokenSabaneta = process.env.SIMI_TOKEN_SABANETA;

  console.log('[TOKENS]', tokenMedellin ? 'MED:ok' : 'MED:missing', tokenSabaneta ? 'SAB:ok' : 'SAB:missing');

  const tokens = [];
  if (!sede || sede === 'medellin') tokens.push(tokenMedellin);
  if (!sede || sede === 'sabaneta') tokens.push(tokenSabaneta);

  try {
    const results = await Promise.all(tokens.map(token => fetchSimi(token, params)));
    console.log('[RESULTS KEYS]', results.map(r => Object.keys(r)));
    const propiedades = results.flatMap(r => r.data || []);

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ propiedades, total: propiedades.length });
  } catch (err) {
    console.error('[api/propiedades ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
}
