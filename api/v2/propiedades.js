// GET /api/v2/propiedades?sede=medellin|sabaneta&limite=N&pagina=N
//
// Reemplazo de /api/propiedades (SIMI) → ahora consume Wasi.
// NO toca el endpoint anterior, corre en paralelo bajo /api/v2.
//
// Estrategia "Opción B" para sedes:
// - sede=medellin → Medellín + Envigado + Itagüí + Bello + La Estrella + San Antonio de Prado
// - sede=sabaneta → Sabaneta
// - sin sede     → todas las propiedades

import { fetchWasi, extractItems, mapWasiPropiedad, getTipoLabels } from './_lib/wasiClient.js';

// Ciudades que sirve cada sede (case-insensitive, match exacto sobre city_label de Wasi)
const SEDES = {
    medellin: ['medellín', 'medellin', 'envigado', 'itagui', 'itagüí', 'bello', 'la estrella', 'san antonio de prado'],
    sabaneta: ['sabaneta'],
};

// IDs de ciudad en Wasi por sede (para filtrado server-side eficiente)
const SEDE_CITY_IDS = {
    medellin: [496, 291, 389, 89, 416, 858669],  // Medellín, Envigado, Itagüí, Bello, La Estrella, San Antonio de Prado
    sabaneta: [698],                              // Sabaneta
};

const ALLOWED_SEDES = Object.keys(SEDES);
const MAX_LIMITE = 100;  // Wasi tope: 100 por request

function safeInt(value, fallback, max = 99999) {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 0 || n > max) return fallback;
    return n;
}

// Trae todas las propiedades de Wasi en paralelo.
// Hace primero un call de probing para saber el total, luego lanza el resto en paralelo.
async function fetchAllWasi(min_bedrooms, max_bedrooms) {
    const TAKE = 100;
    const MAX_PAGES = 10;  // tope de seguridad: 1000 propiedades

    const baseParams = {};
    if (min_bedrooms) baseParams.min_bedrooms = min_bedrooms;
    if (max_bedrooms) baseParams.max_bedrooms = max_bedrooms;

    // Primer call: descubre el total
    const first = await fetchWasi('/property/search', { ...baseParams, take: TAKE, skip: 0 });
    const total = first.total ?? 0;
    const all = extractItems(first);
    if (all.length >= total) return all;

    // Calcula páginas restantes y las lanza en paralelo
    const remainingPages = Math.min(Math.ceil((total - all.length) / TAKE), MAX_PAGES - 1);
    const promises = [];
    for (let i = 1; i <= remainingPages; i++) {
        promises.push(
            fetchWasi('/property/search', { ...baseParams, take: TAKE, skip: i * TAKE })
                .then(r => extractItems(r))
                .catch(() => [])
        );
    }
    const pages = await Promise.all(promises);
    for (const items of pages) all.push(...items);
    return all;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { sede, habitaciones } = req.query;

    if (sede && !ALLOWED_SEDES.includes(sede)) {
        return res.status(400).json({ error: 'sede inválida' });
    }

    const limite = Math.min(safeInt(req.query.limite, 50), MAX_LIMITE);
    const pagina = safeInt(req.query.pagina, 0, 100);
    const skip = pagina * limite;

    // Filtros Wasi
    const wasiParams = { take: limite, skip };
    if (habitaciones) {
        // habitaciones puede venir como "1","2","3","3+"
        if (habitaciones === '3+') {
            wasiParams.min_bedrooms = 3;
        } else {
            const h = parseInt(habitaciones, 10);
            if (!isNaN(h) && h > 0 && h < 20) {
                wasiParams.min_bedrooms = h;
                wasiParams.max_bedrooms = h;
            }
        }
    }

    // Filtros por ID — ciudad/barrio/tipo. Wasi acepta natívamente.
    // El barrio en esta cuenta es zone, no location.
    const id_city = safeInt(req.query.ciudad, 0, 9999999);
    const id_zone = safeInt(req.query.barrio, 0, 9999999);
    const id_property_type = safeInt(req.query.tipoInm, 0, 99999);
    if (id_city) wasiParams.id_city = id_city;
    if (id_zone) wasiParams.id_zone = id_zone;
    if (id_property_type) wasiParams.id_property_type = id_property_type;

    // Operación — frontend envía "arriendo"/"venta" o id numérico SIMI
    // En Wasi son booleans for_sale/for_rent
    const tipOper = String(req.query.tipOper || '').toLowerCase();
    if (tipOper === 'arriendo' || tipOper === '2' || tipOper === 'rent') {
        wasiParams.for_rent = 'true';
    } else if (tipOper === 'venta' || tipOper === '1' || tipOper === 'sale') {
        wasiParams.for_sale = 'true';
    }

    // Ordenamiento — mapear SIMI campo/order a Wasi order_by/order
    const campoToWasi = { precio: 'sale_price', fecha: 'created_at', area: 'area' };
    if (req.query.campo && campoToWasi[req.query.campo]) {
        wasiParams.order_by = campoToWasi[req.query.campo];
    }
    if (req.query.order && (req.query.order === 'asc' || req.query.order === 'desc')) {
        wasiParams.order = req.query.order;
    }

    try {
        const tipoLabels = await getTipoLabels();

        let mapeadas;
        let wasiTotal = 0;

        if (sede) {
            // Con filtro de sede: lanzamos un fetch por cada id_city de la sede
            // en paralelo (mucho más rápido que fetchAllWasi + filter en memoria).
            const cityIds = SEDE_CITY_IDS[sede];
            const baseParams = {};
            if (wasiParams.min_bedrooms) baseParams.min_bedrooms = wasiParams.min_bedrooms;
            if (wasiParams.max_bedrooms) baseParams.max_bedrooms = wasiParams.max_bedrooms;
            if (wasiParams.for_rent) baseParams.for_rent = wasiParams.for_rent;
            if (wasiParams.for_sale) baseParams.for_sale = wasiParams.for_sale;
            if (wasiParams.id_property_type) baseParams.id_property_type = wasiParams.id_property_type;

            const results = await Promise.all(
                cityIds.map(id =>
                    fetchWasi('/property/search', { ...baseParams, id_city: id, take: 100, skip: 0 })
                        .then(r => extractItems(r))
                        .catch(() => [])
                )
            );
            const allItems = results.flat();
            wasiTotal = allItems.length;
            const allMapeadas = allItems
                .map(p => mapWasiPropiedad(p, { tipoLabels }))
                .filter(Boolean);

            // Paginación en memoria
            mapeadas = allMapeadas.slice(skip, skip + limite);
            res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
            return res.status(200).json({
                propiedades: mapeadas,
                total: allMapeadas.length,
                _wasi_total: wasiTotal,
                _sede_filter: sede,
            });
        }

        // Sin sede: paginación nativa de Wasi
        const raw = await fetchWasi('/property/search', wasiParams);
        const items = extractItems(raw);
        mapeadas = items.map(p => mapWasiPropiedad(p, { tipoLabels })).filter(Boolean);

        res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
        return res.status(200).json({
            propiedades: mapeadas,
            total: raw.total ?? mapeadas.length,
            _wasi_total: raw.total ?? null,
            _sede_filter: null,
        });
    } catch (err) {
        console.error('[api/v2/propiedades]', err.message);
        return res.status(500).json({ error: 'No se pudieron cargar las propiedades', detail: err.message });
    }
}
