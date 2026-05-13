import { enforceRateLimit } from './_lib/rateLimit.js';

const BASE_URL = 'https://simi-api.com';

function getAuthHeader(token) {
  return 'Basic ' + Buffer.from(`Authorization:${token}`).toString('base64');
}

async function fetchSimi(token, path) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { Authorization: getAuthHeader(token) },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`SIMI ${path} → ${res.status}`);
  return res.json();
}

// Mapeo defensivo: SIMI puede usar distintos nombres de campo según el catálogo.
// Tomamos el primer campo no-vacío entre los candidatos.
function pickId(item) {
  return (
    item?.idDepartamento ??
    item?.idCiudad ??
    item?.idZona ??
    item?.idBarrio ??
    item?.idTipoInmueble ??
    item?.idGestion ??
    item?.idTpInm ??
    item?.id ??
    item?.codigo ??
    item?.Codigo ??
    null
  );
}

function pickNombre(item) {
  return (
    item?.nombre ??
    item?.Nombre ??
    item?.nombreCiudad ??
    item?.nombreDepartamento ??
    item?.nombreTipo ??
    item?.descripcion ??
    item?.tipoInmueble ??
    item?.gestion ??
    item?.NombreG ??
    item?.NombreC ??
    item?.NombreD ??
    ''
  );
}

function extractArray(data) {
  // SIMI envuelve respuestas de diferentes formas según el endpoint.
  if (Array.isArray(data)) return data;
  return (
    data?.response ??
    data?.data ??
    data?.Inmuebles ??
    data?.departamentos ??
    data?.ciudades ??
    data?.tipoInmuebles ??
    data?.gestion ??
    []
  );
}

function mapCatalogo(raw) {
  const arr = extractArray(raw);
  if (!Array.isArray(arr)) return [];
  return arr
    .map(item => ({ id: pickId(item), nombre: pickNombre(item) }))
    .filter(x => x.id !== null && x.nombre);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // 30 req/min por IP — los catálogos cambian poco, no hay razón legítima
  // para llamar más seguido.
  if (enforceRateLimit(req, res, { limit: 30, windowMs: 60_000, key: 'catalogos' })) return;

  const token = process.env.SIMI_TOKEN_MEDELLIN;
  if (!token) {
    return res.status(500).json({ error: 'Configuración inválida' });
  }

  // Antioquia es el departamento principal de la inmobiliaria.
  // Si quisiéramos multi-departamento, descubriríamos ID dinámicamente.
  const ID_ANTIOQUIA_DEFAULT = 5;

  // Modo debug: devuelve respuesta cruda de SIMI para inspeccionar campos.
  // Útil solo en preview/dev — protegido por rate limit estricto.
  if (req.query.debug === '1') {
    try {
      const [dep, ciu, tip, ges] = await Promise.all([
        fetchSimi(token, '/ApiSimiweb/response/v2/departamento').catch(e => ({ error: e.message })),
        fetchSimi(token, `/ApiSimiweb/response/v2/ciudad/idDepartamento/${ID_ANTIOQUIA_DEFAULT}`).catch(e => ({ error: e.message })),
        fetchSimi(token, '/ApiSimiweb/response/v2/tipoInmuebles/unique/1').catch(e => ({ error: e.message })),
        fetchSimi(token, '/ApiSimiweb/response/gestion').catch(e => ({ error: e.message })),
      ]);
      return res.status(200).json({
        _debug: true,
        _note: 'Respuestas crudas de SIMI. Inspecciona los nombres de campo y compártelos.',
        departamentos: dep,
        ciudadesAntioquia: ciu,
        tipos: tip,
        gestiones: ges,
      });
    } catch (err) {
      return res.status(500).json({ error: 'Debug falló', message: err.message });
    }
  }

  try {
    const [depRaw, tipRaw, gesRaw] = await Promise.all([
      fetchSimi(token, '/ApiSimiweb/response/v2/departamento'),
      fetchSimi(token, '/ApiSimiweb/response/v2/tipoInmuebles/unique/1'),
      fetchSimi(token, '/ApiSimiweb/response/gestion'),
    ]);

    const departamentos = mapCatalogo(depRaw);

    // Si encontramos Antioquia en el catálogo, usamos su ID real. Si no, el default.
    const antioquia = departamentos.find(d => /antioquia/i.test(d.nombre));
    const idDep = antioquia?.id || ID_ANTIOQUIA_DEFAULT;

    const ciuRaw = await fetchSimi(token, `/ApiSimiweb/response/v2/ciudad/idDepartamento/${idDep}`);

    // Cache CDN 24h, revalidación SWR 7 días — los catálogos cambian rara vez.
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({
      departamentos,
      ciudades: mapCatalogo(ciuRaw),
      tipos: mapCatalogo(tipRaw),
      gestiones: mapCatalogo(gesRaw),
    });
  } catch (err) {
    console.error('[api/catalogos]', err.message);
    res.status(500).json({ error: 'No se pudieron cargar los catálogos' });
  }
}
