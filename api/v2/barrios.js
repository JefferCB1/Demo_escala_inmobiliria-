// GET /api/v2/barrios?ciudad=<id_city>
//
// Devuelve los barrios (locations) de una ciudad de Wasi.
// Wasi requiere el id_city (numérico), no acepta nombre.

import { fetchWasi, extractItems } from './_lib/wasiClient.js';

const MAX_ID = 9999999;  // San Antonio de Prado es 858669, dejamos margen

function safeInt(value, fallback, max) {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 0 || n > max) return fallback;
    return n;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const ciudad = safeInt(req.query.ciudad, 0, MAX_ID);
    if (!ciudad) {
        return res.status(400).json({ error: 'Parámetro ciudad (id) requerido' });
    }

    try {
        const raw = await fetchWasi(`/location/locations-from-city/${ciudad}`);
        const items = extractItems(raw);
        const barrios = items
            .map(b => ({ id: b.id_location, nombre: b.name }))
            .filter(x => x.id && x.nombre)
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

        // Cache 24h + SWR 7d
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
        return res.status(200).json({ barrios });
    } catch (err) {
        console.error('[api/v2/barrios]', err.message);
        return res.status(500).json({ error: 'No se pudieron cargar los barrios', detail: err.message });
    }
}
