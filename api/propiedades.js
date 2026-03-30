const BASE_URL = 'https://simi-api.com';

function getAuthHeader(token) {
  return 'Basic ' + Buffer.from(`Authorization:${token}`).toString('base64');
}

async function fetchSimi(token, params) {
  const url = `${BASE_URL}/ApiSimiweb/response/v2.1.1/filtroInmueble/?${params}`;
  const res = await fetch(url, {
    headers: { Authorization: getAuthHeader(token) },
  });
  if (!res.ok) throw new Error(`SIMI error: ${res.status}`);
  return res.json();
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

  const params = new URLSearchParams();
  params.set('limite', String(parseInt(pagina) * parseInt(limite)));
  params.set('cantidad', limite);
  if (tipo) params.set('tipoInm', tipo);
  if (operacion) params.set('tipOper', operacion);
  if (ciudad) params.set('ciudad', ciudad);
  if (habitaciones && habitaciones !== '3+') params.set('alcobas', habitaciones);
  if (habitaciones === '3+') params.set('alcobas', '3');

  const tokenMedellin = process.env.SIMI_TOKEN_MEDELLIN;
  const tokenSabaneta = process.env.SIMI_TOKEN_SABANETA;

  const tokens = [];
  if (!sede || sede === 'medellin') tokens.push(tokenMedellin);
  if (!sede || sede === 'sabaneta') tokens.push(tokenSabaneta);

  try {
    const results = await Promise.all(tokens.map(token => fetchSimi(token, params)));
    const propiedades = results.flatMap(r => (Array.isArray(r) ? r : r.response || []));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ propiedades, total: propiedades.length });
  } catch (err) {
    console.error('[api/propiedades]', err.message);
    res.status(500).json({ error: 'No se pudieron cargar las propiedades' });
  }
}
