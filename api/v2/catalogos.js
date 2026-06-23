// GET /api/v2/catalogos
//
// Devuelve los catálogos necesarios para el frontend:
// - tipos (id_property_type → label)
// - departamentos / regiones (Antioquia y vecinas)
// - ciudades (las 129 de Antioquia)
// - gestiones (Venta / Arriendo — derivadas de booleans en Wasi)
//
// Mismo shape que producía /api/catalogos con SIMI para compatibilidad con la UI.

import { fetchWasi, extractItems } from './_lib/wasiClient.js';

// Colombia + Antioquia (los datos reales del cliente están todos acá)
const ID_COUNTRY_COLOMBIA = 1;
const ID_REGION_ANTIOQUIA = 2;

// IDs de las 7 ciudades donde Escala tiene propiedades cargadas.
// Filtramos el catálogo Wasi (129 ciudades) a este subset para no abrumar al usuario.
const CIUDADES_ESCALA = new Set([
    496,    // Medellín
    698,    // Sabaneta
    291,    // Envigado
    389,    // Itagüí
    89,     // Bello
    416,    // La Estrella
    858669, // San Antonio de Prado
]);

// "Gestiones" estáticas — en Wasi no son catálogo, son booleans for_sale/for_rent/for_transfer
const GESTIONES = [
    { id: 'arriendo', nombre: 'Arriendo' },
    { id: 'venta', nombre: 'Venta' },
    { id: 'cesion', nombre: 'Cesión' },
];

function mapItem(raw, idKey, nameKey = 'name') {
    return { id: raw[idKey], nombre: raw[nameKey] };
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        // Tres fetches en paralelo — todos chiquitos y cacheables
        const [tiposRaw, regionesRaw, ciudadesRaw] = await Promise.all([
            fetchWasi('/property-type/all'),
            fetchWasi(`/location/regions-from-country/${ID_COUNTRY_COLOMBIA}`),
            fetchWasi(`/location/cities-from-region/${ID_REGION_ANTIOQUIA}`),
        ]);

        const tipos = extractItems(tiposRaw)
            .map(t => mapItem(t, 'id_property_type'))
            .filter(x => x.id && x.nombre)
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

        const departamentos = extractItems(regionesRaw)
            .map(r => mapItem(r, 'id_region'))
            .filter(x => x.id && x.nombre)
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

        const ciudades = extractItems(ciudadesRaw)
            .map(c => mapItem(c, 'id_city'))
            .filter(x => x.id && x.nombre && CIUDADES_ESCALA.has(Number(x.id)))
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

        // Cache largo: estos catálogos cambian raramente
        res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
        return res.status(200).json({
            departamentos,
            ciudades,
            tipos,
            gestiones: GESTIONES,
        });
    } catch (err) {
        console.error('[api/v2/catalogos]', err.message);
        return res.status(500).json({ error: 'No se pudieron cargar los catálogos', detail: err.message });
    }
}
