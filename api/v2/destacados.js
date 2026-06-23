// GET /api/v2/destacados
//
// Propiedades destacadas (highlighted en Wasi).
// Mismo shape de salida que /api/destacados (SIMI) para compat con la UI.
//
// Opcionalmente acepta ?sede=medellin|sabaneta para filtrar (Opción B).

import { fetchWasi, extractItems, mapWasiPropiedad, getTipoLabels } from './_lib/wasiClient.js';
import { enforceRateLimit } from './_lib/rateLimit.js';

const SEDES = {
    medellin: ['medellín', 'medellin', 'envigado', 'itagui', 'itagüí', 'bello', 'la estrella', 'san antonio de prado'],
    sabaneta: ['sabaneta'],
};
const ALLOWED_SEDES = Object.keys(SEDES);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    // 60 req/min por IP
    if (enforceRateLimit(req, res, { limit: 60, windowMs: 60_000, key: 'destacados' })) return;

    const { sede } = req.query;
    if (sede && !ALLOWED_SEDES.includes(sede)) {
        return res.status(400).json({ error: 'sede inválida' });
    }

    try {
        const [raw, tipoLabels] = await Promise.all([
            fetchWasi('/property/highlighted/'),
            getTipoLabels(),
        ]);

        const items = extractItems(raw);
        let destacados = items.map(p => mapWasiPropiedad(p, { tipoLabels })).filter(Boolean);

        if (sede) {
            const ciudadesPermitidas = SEDES[sede];
            destacados = destacados.filter(p => {
                const c = (p.ciudad || '').toLowerCase().trim();
                return ciudadesPermitidas.includes(c);
            });
        }

        // Cache 5 min + SWR 1h — los destacados pueden cambiar y deben reflejarse rápido
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
        return res.status(200).json({ destacados });
    } catch (err) {
        console.error('[api/v2/destacados]', err.message);
        return res.status(500).json({ error: 'No se pudieron cargar los destacados', detail: err.message });
    }
}
