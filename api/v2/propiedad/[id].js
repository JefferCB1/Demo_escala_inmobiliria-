// GET /api/v2/propiedad/[id]
//
// Detalle completo de una propiedad, incluye:
// - Datos del inmueble vía /v1/property/get/{id}
// - Ficha del asesor vía /v1/user/get/{id_user} (en paralelo, con cache 1h)
// - Catálogo de tipos resuelto a label

import { fetchWasi, mapWasiPropiedad, getTipoLabels } from '../_lib/wasiClient.js';

const VALID_ID = /^\d{1,15}$/;

// Cache de usuarios (asesores) en memoria — TTL 1h.
const _userCache = new Map();
const USER_TTL = 60 * 60 * 1000;

async function getUserCached(idUser) {
    const now = Date.now();
    const cached = _userCache.get(idUser);
    if (cached && (now - cached.at) < USER_TTL) return cached.data;

    try {
        const data = await fetchWasi(`/user/get/${idUser}`);
        // Wasi devuelve datos del user directamente al top-level
        const user = {
            nombre: [data.first_name, data.last_name].filter(Boolean).join(' ').trim() || data.name || '',
            telefono: normalizePhone(data.cell_phone || data.phone || ''),
            email: data.email || '',
            foto: data.photo || '',
            whatsapp: data.with_whatsapp === '1' || data.with_whatsapp === true,
        };
        _userCache.set(idUser, { data: user, at: now });
        return user;
    } catch {
        return null;
    }
}

// Normaliza el teléfono al formato local de 10 dígitos.
// Wasi devuelve a veces "573002358763" (con código país) y a veces "3002358763".
// El frontend prepende "+57" para el wa.me/tel: link, así que necesitamos solo los 10 dígitos.
function normalizePhone(raw) {
    if (!raw) return '';
    // Solo dígitos
    let s = String(raw).replace(/\D/g, '');
    // Si empieza con 57 y total son 12 dígitos → quita el 57
    if (s.length === 12 && s.startsWith('57')) s = s.slice(2);
    return s;
}

function mapFeatures(features) {
    if (!features) return [];
    const out = [];
    const sources = [
        ...(Array.isArray(features.internal) ? features.internal : []),
        ...(Array.isArray(features.external) ? features.external : []),
    ];
    for (const f of sources) {
        const label = (f?.nombre || f?.name || '').trim();
        if (label) out.push(label);
    }
    return out;
}

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { id } = req.query;
    if (!id || !VALID_ID.test(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        // 1. Detalle propiedad + catálogo tipos en paralelo
        const [raw, tipoLabels] = await Promise.all([
            fetchWasi(`/property/get/${id}`),
            getTipoLabels(),
        ]);

        if (!raw || raw.status === 'error' || !raw.id_property) {
            return res.status(404).json({ error: 'Propiedad no encontrada' });
        }

        // 2. Mapear al shape estándar (compatible con simiApi)
        const propiedad = mapWasiPropiedad(raw, { tipoLabels });

        // 3. Enriquecer con campos de detalle que no estaban en /search
        propiedad.descripcion = stripHtml(raw.observations || raw.comment || propiedad.descripcion);
        propiedad.titulo = raw.title || propiedad._titulo || '';
        propiedad.caracteristicas = mapFeatures(raw.features);
        propiedad.referencia = raw.reference || '';
        propiedad.piso = Number(raw.floor) || 0;
        propiedad.maintenanceFeeLabel = raw.maintenance_fee_label || '';
        propiedad.salePriceLabel = raw.sale_price_label || '';
        propiedad.rentPriceLabel = raw.rent_price_label || '';
        propiedad.video = raw.video || '';
        propiedad.url360 = raw.url_360 || '';

        // 4. Asesor — fetch en paralelo con timeout corto (no bloquear si falla)
        if (raw.id_user) {
            propiedad.agente = await getUserCached(raw.id_user);
        }

        res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
        return res.status(200).json({ propiedad });
    } catch (err) {
        console.error('[api/v2/propiedad]', err.message);
        return res.status(500).json({ error: 'No se pudo cargar la propiedad', detail: err.message });
    }
}

// Limpia tags HTML básicos y decodifica entidades comunes del campo observations
function stripHtml(s) {
    if (!s) return '';
    const entities = {
        '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>',
        '&quot;': '"', '&#39;': "'", '&aacute;': 'á', '&eacute;': 'é',
        '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú', '&Aacute;': 'Á',
        '&Eacute;': 'É', '&Iacute;': 'Í', '&Oacute;': 'Ó', '&Uacute;': 'Ú',
        '&ntilde;': 'ñ', '&Ntilde;': 'Ñ', '&uuml;': 'ü', '&Uuml;': 'Ü',
    };
    let result = String(s)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?p>/gi, '\n')
        .replace(/<[^>]+>/g, '');
    for (const [k, v] of Object.entries(entities)) {
        result = result.replaceAll(k, v);
    }
    return result
        .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
