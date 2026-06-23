// Cliente compartido para la API de Wasi.
// - Inyecta credenciales (id_company + wasi_token) automáticamente.
// - Maneja timeout, errores y normaliza la respuesta de /property/search
//   (Wasi devuelve { "0": prop, "1": prop, ..., total, status }, no un array).

const BASE = 'https://api.wasi.co/v1';
const TIMEOUT_MS = 10000;

function getCreds() {
    const id_company = process.env.WASI_ID_COMPANY;
    const wasi_token = process.env.WASI_TOKEN;
    if (!id_company || !wasi_token) {
        throw new Error('Faltan credenciales WASI_ID_COMPANY/WASI_TOKEN en env');
    }
    return { id_company, wasi_token };
}

/**
 * Hace fetch a Wasi con auth automática.
 * @param {string} path Ej: '/property/search' o '/property/get/123'
 * @param {Object} params Query params adicionales
 * @returns {Promise<Object>} Respuesta JSON parseada
 */
export async function fetchWasi(path, params = {}) {
    const { id_company, wasi_token } = getCreds();
    const url = new URL(`${BASE}${path}`);
    url.searchParams.set('id_company', id_company);
    url.searchParams.set('wasi_token', wasi_token);
    for (const [k, v] of Object.entries(params)) {
        if (v !== null && v !== undefined && v !== '') {
            url.searchParams.set(k, String(v));
        }
    }

    const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const data = await res.json();
    if (data.status === 'error') {
        throw new Error(`Wasi error ${data.code}: ${data.message}`);
    }
    return data;
}

/**
 * Wasi devuelve los items con keys numéricas ("0", "1", ...) junto con `total` y `status`.
 * Esta función extrae solo los items en un array limpio.
 */
export function extractItems(wasiResponse) {
    return Object.entries(wasiResponse)
        .filter(([k]) => /^\d+$/.test(k))
        .map(([, v]) => v);
}

// === Catálogo de tipos en memoria (TTL 1h) ===
// Útil para warm starts. En cold start se re-fetchea (cheap, 1 request).
let _tipoLabelsCache = null;
let _tipoLabelsCacheAt = 0;
const TTL_MS = 60 * 60 * 1000;

/**
 * Devuelve un Map<id_property_type, nombre> con los tipos de propiedad.
 * Cacheado en memoria con TTL de 1h.
 */
export async function getTipoLabels() {
    const now = Date.now();
    if (_tipoLabelsCache && (now - _tipoLabelsCacheAt) < TTL_MS) {
        return _tipoLabelsCache;
    }
    const raw = await fetchWasi('/property-type/all');
    const items = extractItems(raw);
    const map = new Map();
    for (const t of items) {
        if (t.id_property_type && t.name) {
            map.set(Number(t.id_property_type), t.name);
        }
    }
    _tipoLabelsCache = map;
    _tipoLabelsCacheAt = now;
    return map;
}

/**
 * Mapea un objeto propiedad de Wasi al shape que consume el frontend
 * (mismo shape que produce src/services/simiApi.js#mapPropiedad para no romper la UI).
 * @param {Object} p - Objeto propiedad crudo de Wasi
 * @param {Object} [opts] - Opciones
 * @param {Map<number,string>} [opts.tipoLabels] - Map de id_property_type → label
 */
export function mapWasiPropiedad(p, opts = {}) {
    if (!p) return null;
    const tipoLabels = opts.tipoLabels;

    // Precios: vienen como strings ("0", "1800000")
    const salePrice = Number(p.sale_price) || 0;
    const rentPrice = Number(p.rent_price) || 0;

    // Operación: Wasi devuelve "true"/"false" como STRINGS, también acepta boolean/1/0
    const truthy = (v) => v === true || v === 1 || v === '1' || v === 'true';
    const forSale = truthy(p.for_sale);
    const forRent = truthy(p.for_rent);
    const operacion = forRent ? 'Arriendo' : (forSale ? 'Venta' : 'Otro');
    const precio = forRent ? rentPrice : salePrice;

    // Imágenes: main_image es objeto, galleries es array de objetos con url/path
    const mainImg = pickImageUrl(p.main_image);
    const gallery = Array.isArray(p.galleries) ? p.galleries.flatMap(g => extractGalleryUrls(g)) : [];
    const imagenes = [mainImg, ...gallery].filter(Boolean);
    // Dedupe
    const imagenesUniq = [...new Set(imagenes)];

    // Área: priorizamos built_area > area > private_area
    const area = Number(p.built_area) || Number(p.area) || Number(p.private_area) || 0;

    // Ubicación textual para mostrar
    // En Wasi de Escala, los "barrios" están en zone_label (no location_label).
    // location_label viene vacío, zone_label tiene los nombres reales (Calasanz, etc).
    const ciudad = (p.city_label || '').trim();
    const barrio = (p.location_label || p.zone_label || '').trim();
    const ubicacion = [barrio, ciudad].filter(Boolean).join(', ') || ciudad || '';

    return {
        id: String(p.id_property),
        tipo: p.property_type_label || tipoLabels?.get(Number(p.id_property_type)) || String(p.id_property_type || ''),
        operacion,
        precio,
        ubicacion,
        area,
        habitaciones: Number(p.bedrooms) || 0,
        banos: Number(p.bathrooms) || 0,
        parqueadero: Number(p.garages) || 0,
        imagen: imagenesUniq[0] || '',
        imagenes: imagenesUniq,
        descripcion: p.observations || p.comment || '',
        direccion: (p.address || '').trim(),
        estrato: p.stratum || '',
        departamento: p.region_label || 'Antioquia',
        ciudad,
        barrio,
        zona: p.zone_label || '',
        codigo: String(p.id_property),
        administracion: Number(p.maintenance_fee) || 0,
        logo: '',
        agente: null,  // Wasi requiere fetch separado a /v1/user/get/{id_user}
        caracteristicas: Array.isArray(p.features) ? p.features.map(f => f?.name || f?.label).filter(Boolean) : [],
        portales: Array.isArray(p.portals) ? p.portals : [],
        coordenadas: p.latitude && p.longitude
            ? { lat: parseFloat(p.latitude), lng: parseFloat(p.longitude) }
            : null,
        // Campos extra de Wasi que SIMI no exponía (por si se quieren usar luego):
        _titulo: p.title || '',
        _id_user: p.id_user || null,
    };
}

function pickImageUrl(img) {
    if (!img) return '';
    if (typeof img === 'string') return img;
    return img.url || img.path || img.image || img.src || '';
}

function extractGalleryUrls(g) {
    if (!g) return [];
    // Wasi: cada gallery es un objeto con keys numéricas ("0", "1", ...) apuntando
    // a {id, url, ...}, mezclado con meta keys (id_gallery, name, etc.)
    return Object.entries(g)
        .filter(([k]) => /^\d+$/.test(k))
        .map(([, v]) => pickImageUrl(v))
        .filter(Boolean);
}
