// Plugin Vite que sirve los handlers de /api/v2/* en el dev server.
// Solo se activa en modo dev. No afecta el build de producción (ahí los sirve Vercel).
//
// Cómo funciona:
// 1. Lee .env y .env.local al iniciar Vite.
// 2. Intercepta requests a /api/v2/*.
// 3. Resuelve el path al archivo handler correspondiente:
//      /api/v2/propiedades         → api/v2/propiedades.js
//      /api/v2/propiedad/10074945  → api/v2/propiedad/[id].js (con id en query)
//      /api/v2/catalogos           → api/v2/catalogos.js
// 4. Invoca el handler con req/res mockeados estilo Vercel.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const API_ROOT = resolve(process.cwd(), 'api');
const WASI_API_FILE = resolve(process.cwd(), 'src/services/wasiApi.js');

function loadEnvFile(path) {
    if (!existsSync(path)) return;
    const content = readFileSync(path, 'utf8');
    for (const line of content.split('\n')) {
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        const i = t.indexOf('=');
        if (i < 0) continue;
        const key = t.slice(0, i).trim();
        const value = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = value;
    }
}

// Resuelve "/api/v2/propiedad/10074945" → { handlerPath, params: {id: '10074945'} }
// Resuelve "/api/v2/propiedades" → { handlerPath, params: {} }
function resolveHandler(pathname) {
    // pathname: "/api/v2/..."
    const rel = pathname.replace(/^\/api\//, '').split('?')[0];
    const segments = rel.split('/').filter(Boolean);
    if (segments.length === 0) return null;

    // Intento 1: ruta exacta como archivo
    const directFile = join(API_ROOT, ...segments) + '.js';
    if (existsSync(directFile)) {
        return { handlerPath: directFile, params: {} };
    }

    // Intento 2: ruta dinámica con [param].js
    // Ej: /api/v2/propiedad/123 → api/v2/propiedad/[id].js con id=123
    // Buscamos el directorio padre y un archivo [xxx].js dentro.
    for (let i = segments.length - 1; i >= 0; i--) {
        const dir = join(API_ROOT, ...segments.slice(0, i));
        if (!existsSync(dir)) continue;
        try {
            const entries = readdirSync(dir);
            const dynamic = entries.find(e => /^\[[^\]]+\]\.js$/.test(e));
            if (dynamic) {
                const paramName = dynamic.slice(1, -4);  // remueve [ y ].js
                return {
                    handlerPath: join(dir, dynamic),
                    params: { [paramName]: segments[i] },
                };
            }
        } catch (e) {
            console.warn('[vite-api] dir scan error:', e.message);
        }
    }
    return null;
}

// Helper: parsea body JSON si viene en POST/PUT
async function readBody(req) {
    return new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => {
            if (!data) return resolve({});
            try { resolve(JSON.parse(data)); } catch { resolve({}); }
        });
    });
}

/**
 * Plugin secundario: cuando VITE_USE_WASI=true, intercepta imports de
 * src/services/simiApi.js y los redirige a wasiApi.js.
 * NO modifica ningún archivo. La sustitución es solo a nivel de resolución
 * de módulos en dev, completamente reversible apagando el flag.
 */
export function wasiSwitcherPlugin() {
    return {
        name: 'wasi-switcher',
        enforce: 'pre',
        resolveId(id, importer) {
            const enabled = process.env.VITE_USE_WASI === 'true';
            if (!enabled) return null;
            if (!importer) return null;
            // Acepta cualquier forma de import: relativo o absoluto
            const normalized = id.replace(/\\/g, '/');
            if (/(\/|^)simiApi(\.js)?$/.test(normalized)) {
                return WASI_API_FILE;
            }
            return null;
        },
        // En build de producción con VITE_USE_WASI=true, redirige el preload
        // de /api/destacados → /api/v2/destacados para que apunte al endpoint correcto.
        transformIndexHtml(html) {
            if (process.env.VITE_USE_WASI !== 'true') return html;
            return html.replace(/\/api\/destacados/g, '/api/v2/destacados');
        },
    };
}

export function apiPlugin() {
    return {
        name: 'escala-api-v2',
        configureServer(server) {
            // Cargar .env al iniciar
            loadEnvFile(join(process.cwd(), '.env'));
            loadEnvFile(join(process.cwd(), '.env.local'));

            const wasiActive = process.env.VITE_USE_WASI === 'true';
            console.log(`\n  \x1b[36m[escala-api-v2]\x1b[0m  ${wasiActive ? '\x1b[32mWasi activo\x1b[0m (VITE_USE_WASI=true)' : '\x1b[33mSIMI activo\x1b[0m (default)'}\n`);

            server.middlewares.use(async (req, res, next) => {
                if (!req.url?.startsWith('/api/')) return next();

                const url = new URL(req.url, 'http://localhost');
                const resolved = resolveHandler(url.pathname);
                if (!resolved) {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: `No handler found for ${url.pathname}` }));
                    return;
                }

                // Construir req estilo Vercel
                const query = Object.fromEntries(url.searchParams.entries());
                Object.assign(query, resolved.params);
                let body = {};
                if (req.method === 'POST' || req.method === 'PUT') {
                    body = await readBody(req);
                }
                const vercelReq = {
                    method: req.method,
                    query,
                    body,
                    headers: req.headers,
                    url: req.url,
                };

                // Construir res estilo Vercel
                const headers = {};
                let statusCode = 200;
                const vercelRes = {
                    setHeader: (k, v) => { headers[k] = v; res.setHeader(k, v); },
                    status: (c) => { statusCode = c; return vercelRes; },
                    json: (obj) => {
                        res.statusCode = statusCode;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(obj));
                        return vercelRes;
                    },
                };

                try {
                    // Importar handler con cache-busting en dev (HMR friendly)
                    const mod = await import(pathToFileURL(resolved.handlerPath).href + '?t=' + Date.now());
                    const handler = mod.default;
                    if (typeof handler !== 'function') {
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: 'Handler no exporta default function' }));
                        return;
                    }
                    await handler(vercelReq, vercelRes);
                } catch (err) {
                    console.error(`[vite-api] ${url.pathname} →`, err.message);
                    if (!res.headersSent) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Internal error', detail: err.message }));
                    }
                }
            });
        },
    };
}
