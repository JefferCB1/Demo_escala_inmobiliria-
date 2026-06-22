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

    try {
        const tipoLabels = await getTipoLabels();

        let mapeadas;
        let wasiTotal = 0;

        if (sede) {
            // Con filtro de sede: traemos TODO el catálogo Wasi (varias páginas de 100)
            // y filtramos en memoria. Necesario porque Wasi no expone filtro por
            // múltiples ciudades en un solo call.
            const allItems = await fetchAllWasi(wasiParams.min_bedrooms, wasiParams.max_bedrooms);
            wasiTotal = allItems.length;
            const ciudadesPermitidas = SEDES[sede];
            const allMapeadas = allItems
                .map(p => mapWasiPropiedad(p, { tipoLabels }))
                .filter(Boolean)
                .filter(p => ciudadesPermitidas.includes((p.ciudad || '').toLowerCase().trim()));

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
