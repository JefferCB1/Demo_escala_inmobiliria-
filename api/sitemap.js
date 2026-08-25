// GET /sitemap.xml  (via rewrite en vercel.json -> /api/sitemap)
//
// Sustituye al public/sitemap.xml estático, que solo listaba 5 URLs. Las ~250
// fichas de inmueble no aparecían en ninguna parte y, como el HTML servido no
// contiene enlaces (es una SPA), un rastreador no tenía forma práctica de
// descubrirlas. Este sitemap las enumera todas leyéndolas de Wasi.

import { fetchWasi, extractItems } from './v2/_lib/wasiClient.js';
import { enforceRateLimit } from './v2/_lib/rateLimit.js';

const SITIO = 'https://escalainmobiliaria.com.co';
const TAKE = 100;
const MAX_PAGINAS = 25;  // tope de seguridad: 2500 inmuebles (hoy hay ~914)

// Páginas fijas del sitio. `lastmod` a mano porque cambian muy de vez en cuando.
const ESTATICAS = [
    { ruta: '/', cambio: 'weekly', prioridad: '1.0', lastmod: '2026-08-24' },
    { ruta: '/propiedades', cambio: 'daily', prioridad: '0.9', lastmod: '2026-08-24' },
    { ruta: '/nosotros', cambio: 'monthly', prioridad: '0.8', lastmod: '2026-05-13' },
    { ruta: '/sede-medellin', cambio: 'monthly', prioridad: '0.7', lastmod: '2026-05-13' },
    { ruta: '/sede-sabaneta', cambio: 'monthly', prioridad: '0.7', lastmod: '2026-05-13' },
];

function escXml(v) {
    return String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Solo van al sitemap los inmuebles que siguen disponibles. En el inventario
// hay una minoría ya arrendados ("Rented"): enviarlos a un buscador es pedirle
// que indexe fichas muertas.
function estaDisponible(p) {
    const label = String(p.availability_label || '').toLowerCase();
    return label === '' || label === 'available' || label === 'disponible';
}

// Lee una página con un reintento. Si acaba fallando, LANZA.
//
// Antes cada página tenía un `.catch(() => [])`. Eso convertía un fallo
// transitorio en un sitemap truncado que se cacheaba una hora: en el primer
// arranque en frío tras un deploy salieron 114 fichas en vez de 905 y ahí se
// quedaron. Un sitemap incompleto es peor que ninguno, así que ahora el fallo
// sube y el handler responde 503.
async function traerPagina(skip) {
    let ultimoError;
    for (let intento = 1; intento <= 2; intento++) {
        try {
            return extractItems(await fetchWasi('/property/search', { take: TAKE, skip }));
        } catch (err) {
            ultimoError = err;
            console.warn(`[api/sitemap] fallo leyendo skip=${skip} (intento ${intento}): ${err.message}`);
        }
    }
    throw new Error(`No se pudo leer skip=${skip}: ${ultimoError?.message}`);
}

// Recorre /property/search paginando hasta agotar el total (o el tope).
async function traerIdsPropiedades() {
    const primera = await fetchWasi('/property/search', { take: TAKE, skip: 0 });
    const total = Number(primera.total) || 0;
    const items = extractItems(primera);

    const paginasNecesarias = Math.ceil((total - items.length) / TAKE);
    const restantes = Math.min(paginasNecesarias, MAX_PAGINAS - 1);
    if (restantes < paginasNecesarias) {
        console.warn(`[api/sitemap] el inventario (${total}) supera el tope de ${MAX_PAGINAS * TAKE}: sube MAX_PAGINAS`);
    }

    if (restantes > 0) {
        const paginas = await Promise.all(
            Array.from({ length: restantes }, (_, i) => traerPagina((i + 1) * TAKE))
        );
        for (const p of paginas) items.push(...p);
    }

    // Red de seguridad: si leímos menos de lo que Wasi dice tener (y no es por
    // el tope), algo falló y preferimos no publicar un sitemap a medias.
    const esperado = Math.min(total, MAX_PAGINAS * TAKE);
    if (items.length < esperado) {
        throw new Error(`Inventario incompleto: ${items.length} de ${esperado} esperados`);
    }

    const disponibles = items.filter(estaDisponible);
    console.log(`[api/sitemap] ${items.length} inmuebles leidos, ${items.length - disponibles.length} no disponibles descartados`);

    return [...new Set(disponibles.map(p => p.id_property).filter(Boolean).map(String))];
}

function construirXml(idsPropiedades) {
    const urls = [
        ...ESTATICAS.map(e => `  <url>
    <loc>${escXml(SITIO + e.ruta)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.cambio}</changefreq>
    <priority>${e.prioridad}</priority>
  </url>`),
        // Sin <lastmod> a propósito: Wasi no expone una fecha de modificación
        // fiable y poner la de hoy en todas sería ruido para el rastreador.
        ...idsPropiedades.map(id => `  <url>
    <loc>${escXml(`${SITIO}/propiedad/${id}`)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`),
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return res.status(405).send('Método no permitido');
    }

    if (enforceRateLimit(req, res, { limit: 30, windowMs: 60_000, key: 'sitemap' })) return;

    try {
        const ids = await traerIdsPropiedades();
        const xml = construirXml(ids);

        // 1h en el CDN: el inventario no cambia tan rápido y así el sitemap
        // casi nunca cuesta invocaciones.
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        return res.status(200).send(xml);
    } catch (err) {
        console.error('[api/sitemap]', err.message);
        // Si Wasi falla NO devolvemos un sitemap recortado: pasar de 905 URLs a
        // 5 le está diciendo al buscador que esas páginas desaparecieron. Un 503
        // significa "vuelve luego", y Google conserva el último sitemap bueno.
        // Y sin cachear, para que el siguiente intento reintente de verdad
        // (cachear el fallo lo dejaba pegado 5 minutos).
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Retry-After', '300');
        return res.status(503).send('Sitemap temporalmente no disponible');
    }
}
