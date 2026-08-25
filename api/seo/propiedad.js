// GET /propiedad/:id  (via rewrite en vercel.json -> /api/seo/propiedad?id=:id)
//
// El sitio es una SPA: el HTML que se sirve es siempre el mismo cascarón con
// <div id="root"></div> y un <title> genérico. Para un buscador, las ~250
// fichas de inmueble son la misma página vacía.
//
// Esta función devuelve ese mismo index.html pero con el <head> real de la
// propiedad (title, description, canonical, Open Graph, JSON-LD) y un bloque
// de contenido dentro de #root. React usa createRoot(), que vacía el
// contenedor al montar, así que ese bloque desaparece en cuanto arranca el JS
// — pero los rastreadores y los previsualizadores de enlaces (WhatsApp,
// Facebook, X), que no ejecutan JS, sí lo ven.
//
// Los textos se generan con las MISMAS plantillas que usa <Helmet> en
// src/pages/PropertyDetail.jsx, para que lo que ve el rastreador y lo que ve
// el usuario coincidan exactamente.

import { enforceRateLimit } from '../v2/_lib/rateLimit.js';

const SITIO = 'https://escalainmobiliaria.com.co';
const VALID_ID = /^\d{1,15}$/;

// El index.html no cambia dentro de un mismo deployment: lo cacheamos en
// memoria para no pedirlo en cada invocación en caliente.
let _plantilla = null;

async function getPlantilla() {
    if (_plantilla) return _plantilla;
    const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : SITIO;
    const res = await fetch(`${base}/index.html`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`No se pudo leer index.html: HTTP ${res.status}`);
    _plantilla = await res.text();
    return _plantilla;
}

async function getPropiedad(id) {
    const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : SITIO;
    const res = await fetch(`${base}/api/v2/propiedad/${id}`, { signal: AbortSignal.timeout(8000) });
    if (res.status === 404) return { noExiste: true };
    if (!res.ok) throw new Error(`API v2 devolvió HTTP ${res.status}`);
    const data = await res.json();
    return { propiedad: data.propiedad };
}

function esc(v) {
    return String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const formatearPrecio = (n) => {
    const num = Number(n) || 0;
    if (!num) return 'Consultar precio';
    return '$' + num.toLocaleString('es-CO');
};

// Mismas cadenas que produce <Helmet> en PropertyDetail.jsx
function construirMeta(p) {
    const titulo = `${p.tipo} en ${p.operacion} - ${p.ubicacion}`;
    return {
        titulo,
        tituloPagina: `${titulo} | Escala Inmobiliaria`,
        descripcion: `${p.tipo} en ${String(p.operacion).toLowerCase()} en ${p.ubicacion}. ${p.habitaciones} alcobas, ${p.banos} baños, ${p.area}m². Código ${p.codigo}. Contáctanos por WhatsApp.`,
        ogDescripcion: `${p.tipo} en ${p.ubicacion} - ${p.area}m² · ${p.habitaciones} alcobas · Código ${p.codigo}`,
        url: `${SITIO}/propiedad/${p.id}`,
        imagen: p.imagenOg || (p.imagenes && p.imagenes[0]) || p.imagen || `${SITIO}/og-image.jpg`,
    };
}

// Mismo objeto que el schemaData de PropertyDetail.jsx
function construirSchema(p, meta) {
    return {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: meta.titulo,
        description: p.descripcion,
        url: meta.url,
        image: p.imagenes?.length ? p.imagenes : p.imagen,
        numberOfRooms: p.habitaciones,
        numberOfBathroomsTotal: p.banos,
        numberOfBedrooms: p.habitaciones,
        floorSize: { '@type': 'QuantitativeValue', value: p.area, unitCode: 'MTK' },
        address: {
            '@type': 'PostalAddress',
            streetAddress: p.direccion || undefined,
            addressLocality: p.ciudad || p.ubicacion,
            addressRegion: p.departamento,
            addressCountry: 'CO',
        },
        ...(p.coordenadas ? {
            geo: { '@type': 'GeoCoordinates', latitude: p.coordenadas.lat, longitude: p.coordenadas.lng },
        } : {}),
        ...(p.caracteristicas?.length ? {
            amenityFeature: p.caracteristicas.map(c => ({ '@type': 'LocationFeatureSpecification', name: c })),
        } : {}),
        offers: {
            '@type': 'Offer',
            price: p.precio,
            priceCurrency: 'COP',
            availability: 'https://schema.org/InStock',
            url: meta.url,
            seller: {
                '@type': 'RealEstateAgent',
                name: 'Escala Inmobiliaria',
                telephone: '+573009122101',
                url: SITIO,
            },
        },
    };
}

// Sustituye el <head> genérico por el de la propiedad.
function inyectarHead(html, p, meta) {
    const schema = construirSchema(p, meta);

    let out = html
        .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(meta.tituloPagina)}</title>`)
        .replace(/<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${esc(meta.descripcion)}" />`)
        .replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${esc(meta.url)}" />`)
        .replace(/<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${esc(meta.titulo)}" />`)
        .replace(/<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${esc(meta.ogDescripcion)}" />`)
        .replace(/<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${esc(meta.url)}" />`)
        .replace(/<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${esc(meta.imagen)}" />`)
        .replace(/<meta\s+property="twitter:title"[^>]*>/i, `<meta property="twitter:title" content="${esc(meta.titulo)}" />`)
        .replace(/<meta\s+property="twitter:description"[^>]*>/i, `<meta property="twitter:description" content="${esc(meta.ogDescripcion)}" />`)
        .replace(/<meta\s+property="twitter:image"[^>]*>/i, `<meta property="twitter:image" content="${esc(meta.imagen)}" />`)
        .replace(/<meta\s+property="twitter:url"[^>]*>/i, `<meta property="twitter:url" content="${esc(meta.url)}" />`);

    // El JSON-LD de la ficha se añade justo antes de </head>. No sustituimos
    // los bloques ld+json existentes (WebSite y RealEstateAgent): son válidos
    // y complementarios.
    const ld = `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`;
    out = out.replace(/<\/head>/i, `  ${ld}\n</head>`);

    return out;
}

// Contenido real dentro de #root. React lo reemplaza al montar; mientras
// tanto pinta antes que el JS, así que además adelanta el primer contenido
// visible en lugar de retrasarlo.
function inyectarCuerpo(html, p, meta) {
    const specs = [
        p.area > 0 ? `${esc(p.area)} m²` : null,
        p.habitaciones > 0 ? `${esc(p.habitaciones)} alcobas` : null,
        p.banos > 0 ? `${esc(p.banos)} baños` : null,
        p.parqueadero > 0 ? `${esc(p.parqueadero)} parqueadero(s)` : null,
        p.estrato ? `Estrato ${esc(p.estrato)}` : null,
    ].filter(Boolean);

    const bloque = `
<div style="max-width:1100px;margin:0 auto;padding:96px 24px 48px;font-family:Inter,system-ui,sans-serif;color:#1a1a1a">
  <p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#FF6B00;font-weight:700;margin:0 0 8px">${esc(p.operacion)} · Código ${esc(p.codigo)}</p>
  <h1 style="font-size:32px;line-height:1.2;font-weight:800;margin:0 0 12px">${esc(meta.titulo)}</h1>
  <p style="font-size:26px;font-weight:800;color:#FF6B00;margin:0 0 16px">${esc(formatearPrecio(p.precio))}</p>
  <p style="font-size:16px;color:#4b5563;margin:0 0 20px">${esc([p.direccion, p.barrio, p.ciudad, p.departamento].filter(Boolean).join(', '))}</p>
  ${specs.length ? `<ul style="list-style:none;padding:0;margin:0 0 24px;display:flex;flex-wrap:wrap;gap:16px;color:#374151;font-size:15px">${specs.map(s => `<li>${s}</li>`).join('')}</ul>` : ''}
  ${meta.imagen ? `<img src="${esc(meta.imagen)}" alt="${esc(meta.titulo)}" width="600" height="450" style="max-width:100%;height:auto;border-radius:16px;margin:0 0 24px" />` : ''}
  ${p.descripcion ? `<p style="font-size:16px;line-height:1.7;color:#374151;white-space:pre-wrap;margin:0 0 24px">${esc(String(p.descripcion).slice(0, 1200))}</p>` : ''}
  ${p.caracteristicas?.length ? `<h2 style="font-size:20px;font-weight:700;margin:0 0 12px">Características</h2><ul style="color:#374151;font-size:15px;line-height:1.8;margin:0 0 24px">${p.caracteristicas.slice(0, 30).map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
  <nav style="font-size:15px">
    <a href="/propiedades" style="color:#FF6B00;font-weight:600;margin-right:20px">Ver todas las propiedades</a>
    <a href="/sede-medellin" style="color:#FF6B00;font-weight:600;margin-right:20px">Sede Medellín</a>
    <a href="/sede-sabaneta" style="color:#FF6B00;font-weight:600">Sede Sabaneta</a>
  </nav>
</div>`;

    return html.replace('<div id="root"></div>', `<div id="root">${bloque}</div>`);
}

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return res.status(405).send('Método no permitido');
    }

    // Generoso: es una página, no una API. Solo frena scraping masivo.
    if (enforceRateLimit(req, res, { limit: 120, windowMs: 60_000, key: 'seo-propiedad' })) return;

    const id = String(req.query.id || '');

    // Ante cualquier problema servimos el cascarón tal cual: la SPA se
    // encarga. Nunca dejamos la página rota por culpa del SEO.
    const servirCascaron = async (status = 200) => {
        try {
            const html = await getPlantilla();
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', status === 404
                ? 's-maxage=60, stale-while-revalidate=300'
                : 'no-store');
            return res.status(status).send(html);
        } catch (err) {
            console.error('[api/seo/propiedad] no se pudo servir el cascarón:', err.message);
            return res.status(500).send('Error');
        }
    };

    if (!VALID_ID.test(id)) return servirCascaron(404);

    try {
        const [html, resultado] = await Promise.all([getPlantilla(), getPropiedad(id)]);

        if (resultado.noExiste || !resultado.propiedad) {
            return servirCascaron(404);
        }

        const p = resultado.propiedad;
        const meta = construirMeta(p);
        const salida = inyectarCuerpo(inyectarHead(html, p, meta), p, meta);

        // Mismo TTL que /api/v2/propiedad para que precio y disponibilidad se
        // refresquen al mismo ritmo.
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
        return res.status(200).send(salida);
    } catch (err) {
        console.error('[api/seo/propiedad]', id, err.message);
        // Wasi caído o error de red: 200 con el cascarón, que la SPA reintente.
        return servirCascaron(200);
    }
}
