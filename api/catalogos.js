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
    item?.idTipoInm ??
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

// Fusiona dos catálogos eliminando duplicados por ID.
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

// Carga catálogos de un solo token (departamentos, tipos, gestiones, ciudades de Antioquia).
async function loadCatalogosForToken(token, idDepDefault) {
  const [depRaw, tipRaw, gesRaw] = await Promise.all([
    fetchSimi(token, '/ApiSimiweb/response/v2/departamento').catch(() => null),
    fetchSimi(token, '/ApiSimiweb/response/v2/tipoInmuebles/unique/1').catch(() => null),
    fetchSimi(token, '/ApiSimiweb/response/gestion').catch(() => null),
  ]);
  const departamentos = mapCatalogo(depRaw);
  const antioquia = departamentos.find(d => /antioquia/i.test(d.nombre));
  const idDep = antioquia?.id || idDepDefault;

  const ciuRaw = await fetchSimi(token, `/ApiSimiweb/response/v2/ciudad/idDepartamento/${idDep}`)
    .catch(() => null);

  return {
    departamentos,
    ciudades: mapCatalogo(ciuRaw),
    tipos: mapCatalogo(tipRaw),
    gestiones: mapCatalogo(gesRaw),
    _rawDep: depRaw,
    _rawCiu: ciuRaw,
    _rawTip: tipRaw,
    _rawGes: gesRaw,
    _idDep: idDep,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // 30 req/min por IP — los catálogos cambian poco, no hay razón legítima
  // para llamar más seguido.
  if (enforceRateLimit(req, res, { limit: 30, windowMs: 60_000, key: 'catalogos' })) return;

  const tokenMedellin = process.env.SIMI_TOKEN_MEDELLIN;
  const tokenSabaneta = process.env.SIMI_TOKEN_SABANETA;
  if (!tokenMedellin && !tokenSabaneta) {
    return res.status(500).json({ error: 'Configuración inválida' });
  }

  const ID_ANTIOQUIA_DEFAULT = 11008;

  try {
    // Carga ambas sedes en paralelo y fusiona resultados — así las ciudades
    // exclusivas de Sabaneta (ej. la propia Sabaneta) aparecen en el filtro.
    const [med, sab] = await Promise.all([
      tokenMedellin
        ? loadCatalogosForToken(tokenMedellin, ID_ANTIOQUIA_DEFAULT)
        : Promise.resolve({}),
      tokenSabaneta
        ? loadCatalogosForToken(tokenSabaneta, ID_ANTIOQUIA_DEFAULT)
        : Promise.resolve({}),
    ]);

    // Modo debug: devuelve respuestas crudas de AMBAS sedes para inspección.
    if (req.query.debug === '1') {
      return res.status(200).json({
        _debug: true,
        _note: 'Respuestas crudas de SIMI por sede. Las ciudades únicas aparecen en /api/catalogos sin debug.',
        medellin: {
          _idDepartamentoUsado: med._idDep,
          departamentos: med._rawDep,
          ciudades: med._rawCiu,
          tipos: med._rawTip,
          gestiones: med._rawGes,
        },
        sabaneta: {
          _idDepartamentoUsado: sab._idDep,
          departamentos: sab._rawDep,
          ciudades: sab._rawCiu,
          tipos: sab._rawTip,
          gestiones: sab._rawGes,
        },
      });
    }

    // Fusión: tomamos catálogos de cualquiera de las dos sedes, deduplicando por ID.
    const departamentos = mergeUniq(med.departamentos, sab.departamentos);
    const ciudades = mergeUniq(med.ciudades, sab.ciudades);
    const tipos = mergeUniq(med.tipos, sab.tipos);
    const gestiones = mergeUniq(med.gestiones, sab.gestiones);

    // Cache CDN 24h + SWR 7d
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({ departamentos, ciudades, tipos, gestiones });
  } catch (err) {
    console.error('[api/catalogos]', err.message);
    res.status(500).json({ error: 'No se pudieron cargar los catálogos' });
  }
}
