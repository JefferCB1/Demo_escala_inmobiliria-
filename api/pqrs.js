// POST /api/pqrs — radicación de PQRS con envío por Resend.
//
// IMPORTANTE sobre el manejo de errores:
// El SDK de Resend NO lanza excepción cuando la API rechaza el envío: devuelve
// { data, error }. Antes este handler ignoraba ese retorno y respondía 200
// siempre, así que cualquier fallo (key revocada, cuota agotada, dominio sin
// verificar) se traducía en "PQRS radicada exitosamente" sin que se enviara
// nada y sin dejar rastro. Ahora se inspecciona `error` y se responde 502.

import { Resend } from 'resend';
import { randomBytes } from 'node:crypto';
import { enforceRateLimit } from './v2/_lib/rateLimit.js';

// El cliente se crea de forma perezosa: el constructor de Resend LANZA si la
// key falta, y a nivel de módulo eso tumba la función entera con un 500 opaco.
// Así el fallo sale como 502 con log, igual que cualquier otro error de envío.
let _resend = null;
function getResend() {
    if (_resend) return _resend;
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY no está configurada en el entorno');
    _resend = new Resend(key);
    return _resend;
}

// Buzón por sede. El formulario manda el campo `sede` ("medellin" | "sabaneta")
// y aquí decidimos a qué inbox real va el correo.
const DESTINOS_POR_SEDE = {
    medellin: 'escalainmobiliariamedellin@gmail.com',
    sabaneta: 'escalainmobiliariasabaneta@gmail.com',
};

// Copia oculta de respaldo. Se configura con la env var PQRS_BCC
// (uno o varios correos separados por coma). Si no está, no se manda copia.
// Sirve de red de seguridad: si el buzón de la sede falla o se borra el correo,
// queda un segundo ejemplar en otra cuenta.
const BCC = (process.env.PQRS_BCC || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

const TIPOS = ['Petición', 'Queja', 'Reclamo', 'Sugerencia', 'Felicitación'];
const TIPOS_DOC = ['CC', 'CE', 'NIT', 'Pasaporte'];
const RELACIONES = ['Propietario', 'Arrendatario', 'Otro'];

// Límites de longitud — evitan correos gigantes y abuso del cuerpo del mensaje
const LIMITES = {
    nombre: [3, 120],
    numDoc: [3, 30],
    email: [5, 150],
    telefono: [7, 25],
    asunto: [5, 150],
    descripcion: [20, 5000],
};

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const RE_DOC = /^[A-Za-z0-9.\- ]+$/;
const RE_TEL = /^[0-9+\-() ]+$/;

// Escapa TODO lo que venga del usuario antes de meterlo en el HTML del correo.
// Sin esto, un `nombre` con etiquetas HTML se renderiza en la bandeja del
// cliente dentro de un correo firmado por el dominio verificado — material de
// phishing servido desde nuestra propia reputación.
function esc(v) {
    return String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// El asunto no puede llevar saltos de línea (inyección de cabeceras) ni ser
// interminable.
function limpiarAsunto(s) {
    return String(s ?? '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150);
}

// Radicado generado en el SERVIDOR. Antes lo generaba el navegador con
// Math.random() de 4 dígitos: colisionaba y además el cliente podía mandar el
// número que quisiera. 3 bytes de crypto = 16.7M combinaciones por día.
function generarRadicado() {
    const d = new Date();
    const fecha = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `PQRS-${fecha}-${randomBytes(3).toString('hex').toUpperCase()}`;
}

function getClientIp(req) {
    const xff = req.headers['x-forwarded-for'];
    if (xff) return String(xff).split(',')[0].trim();
    return req.headers['x-real-ip'] || 'desconocida';
}

// Valida el payload completo. Devuelve { campos } con los errores por campo,
// vacío si todo está bien. El frontend valida lo mismo, pero el endpoint es
// público: la validación de verdad es esta.
function validar(b) {
    const campos = {};
    const texto = (v) => (typeof v === 'string' ? v.trim() : '');

    if (!TIPOS.includes(texto(b.tipo))) campos.tipo = 'Selecciona el tipo de solicitud.';

    for (const [campo, [min, max]] of Object.entries(LIMITES)) {
        const v = texto(b[campo]);
        if (!v) { campos[campo] = 'Este campo es obligatorio.'; continue; }
        if (v.length < min) campos[campo] = `Mínimo ${min} caracteres.`;
        else if (v.length > max) campos[campo] = `Máximo ${max} caracteres.`;
    }

    const email = texto(b.email);
    if (email && !campos.email && !RE_EMAIL.test(email)) campos.email = 'Correo electrónico no válido.';

    const numDoc = texto(b.numDoc);
    if (numDoc && !campos.numDoc && !RE_DOC.test(numDoc)) campos.numDoc = 'Solo letras, números, punto y guion.';

    const telefono = texto(b.telefono);
    if (telefono && !campos.telefono && !RE_TEL.test(telefono)) campos.telefono = 'Solo números y los signos + - ( ).';

    if (!TIPOS_DOC.includes(texto(b.tipoDoc))) campos.tipoDoc = 'Tipo de documento no válido.';

    const relacion = texto(b.relacion);
    if (relacion && !RELACIONES.includes(relacion)) campos.relacion = 'Opción no válida.';

    // El consentimiento es obligatorio y, además, hay que poder demostrarlo
    // (Ley 1581 de 2012 + Decreto 1377 de 2013). Antes ni se enviaba al backend.
    if (b.autorizo !== true) campos.autorizo = 'Debes autorizar el tratamiento de datos.';

    if (!DESTINOS_POR_SEDE[texto(b.sede)]) campos.sede = 'Sede no válida.';

    return campos;
}

function construirHtml({ datos, sede, sedeNombre, radicado, recibidoEn, ip }) {
    const accentColor = sede === 'medellin' ? '#059669' : '#ea580c';
    const accentColor2 = sede === 'medellin' ? '#0d9488' : '#b91c1c';

    const filas = [
        ['Tipo de solicitud', `<strong style="color:${accentColor}">${esc(datos.tipo)}</strong>`],
        ['Nombre completo', esc(datos.nombre)],
        ['Identificación', `${esc(datos.tipoDoc)} ${esc(datos.numDoc)}`],
        ['Email', `<a href="mailto:${esc(datos.email)}" style="color:${accentColor};text-decoration:none;">${esc(datos.email)}</a>`],
        ['Teléfono', esc(datos.telefono)],
        ['Relación con Escala', esc(datos.relacion) || '—'],
        ['Sede', esc(sedeNombre)],
        ['Asunto', `<strong>${esc(datos.asunto)}</strong>`],
    ];

    return `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#f8fafc;padding:32px;">
      <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,${accentColor},${accentColor2});padding:28px 32px;">
          <h1 style="color:white;margin:0;font-size:20px;font-weight:700;">📋 Nueva PQRS — ${esc(sedeNombre)}</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:13px;letter-spacing:0.03em;">Radicado: <strong>${esc(radicado)}</strong></p>
        </div>
        <div style="padding:32px;">
          <table style="width:100%;border-collapse:collapse;">
            ${filas.map(([label, value]) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;width:38%;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;">${esc(label)}</td>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#1e293b;font-size:14px;">${value}</td>
              </tr>
            `).join('')}
          </table>
          <div style="margin-top:24px;">
            <p style="color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Descripción completa</p>
            <div style="background:#f1f5f9;border-left:4px solid ${accentColor};border-radius:0 8px 8px 0;padding:16px 20px;color:#1e293b;font-size:14px;line-height:1.7;white-space:pre-wrap;">${esc(datos.descripcion)}</div>
          </div>
          <div style="margin-top:24px;padding:14px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
            <p style="margin:0;color:#166534;font-size:12px;line-height:1.5;">✅ <strong>Autorización de tratamiento de datos:</strong> otorgada por el titular el ${esc(recibidoEn)} desde la IP ${esc(ip)}. Conserva este correo como evidencia del consentimiento (Ley 1581 de 2012).</p>
          </div>
          <div style="margin-top:12px;padding:14px 16px;background:#fefce8;border:1px solid #fde047;border-radius:8px;">
            <p style="margin:0;color:#713f12;font-size:12px;line-height:1.5;">⚠️ Según la <strong>Ley 1755 de 2015</strong>, debe dar respuesta en un plazo máximo de <strong>15 días hábiles</strong> para peticiones, quejas, reclamos o solicitudes.</p>
          </div>
        </div>
        <div style="background:#f8fafc;padding:14px 32px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:11px;">Escala Inmobiliaria · ${esc(sedeNombre)} · ${esc(radicado)}</p>
        </div>
      </div>
    </div>`;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    // 5 radicaciones cada 10 min por IP. Este endpoint dispara correos desde el
    // dominio verificado sin autenticación: sin freno, cualquiera inunda los
    // buzones del cliente y quema la cuota de Resend.
    if (enforceRateLimit(req, res, { limit: 5, windowMs: 10 * 60_000, key: 'pqrs' })) return;

    // En Vercel el body ya viene parseado; en el plugin de Vite también.
    // Este guard cubre el caso de que llegue como string.
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { body = {}; }
    }
    if (!body || typeof body !== 'object') body = {};

    // Honeypot: un campo oculto que ninguna persona rellena. Si viene con algo,
    // es un bot. Respondemos 200 para no darle pistas, pero no enviamos nada.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
        console.warn('[api/pqrs] honeypot activado desde', getClientIp(req));
        return res.status(200).json({ ok: true, radicado: generarRadicado() });
    }

    const campos = validar(body);
    if (Object.keys(campos).length > 0) {
        return res.status(400).json({ error: 'Hay campos por corregir.', campos });
    }

    const sede = body.sede.trim();
    const destinatario = DESTINOS_POR_SEDE[sede];
    const sedeNombre = sede === 'medellin' ? 'Sede Medellín' : 'Sede Sabaneta';

    const datos = {
        tipo: body.tipo.trim(),
        nombre: body.nombre.trim(),
        tipoDoc: body.tipoDoc.trim(),
        numDoc: body.numDoc.trim(),
        email: body.email.trim(),
        telefono: body.telefono.trim(),
        relacion: (body.relacion || '').trim(),
        asunto: limpiarAsunto(body.asunto),
        descripcion: body.descripcion.trim(),
    };

    // El radicado lo decide el servidor, no el cliente.
    const radicado = generarRadicado();
    const recibidoEn = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    const ip = getClientIp(req);

    const html = construirHtml({ datos, sede, sedeNombre, radicado, recibidoEn, ip });

    try {
        // OJO: el SDK devuelve { data, error }; no lanza en errores de la API.
        // `replyTo` en camelCase — el SDK arma el payload con lista blanca y
        // descarta `reply_to`, que era lo que se pasaba antes.
        const { data, error } = await getResend().emails.send({
            // Subdominio `mail.`, no el dominio raíz: el raíz está reclamado en
            // Resend por otra cuenta y ningún otro team puede verificarlo. Este
            // subdominio sí está verificado en el team de Escala, así que el
            // envío deja de depender de una cuenta ajena.
            from: 'PQRS Escala Inmobiliaria <pqrs@mail.escalainmobiliaria.com.co>',
            to: destinatario,
            ...(BCC.length > 0 ? { bcc: BCC } : {}),
            replyTo: datos.email,
            subject: `[${radicado}] ${datos.tipo} – ${sedeNombre} | ${datos.asunto}`,
            html,
        });

        if (error) {
            // Este log es lo que faltaba: sin él, los fallos eran invisibles.
            console.error('[api/pqrs] Resend rechazó el envío:', {
                radicado,
                sede,
                name: error.name,
                statusCode: error.statusCode,
                message: error.message,
            });
            return res.status(502).json({
                error: 'No pudimos radicar tu solicitud en este momento. Escríbenos por WhatsApp o inténtalo más tarde.',
                // Detalle técnico para depurar sin exponer nada sensible.
                detail: `${error.name || 'error'}: ${error.message || 'sin mensaje'}`,
            });
        }

        console.log('[api/pqrs] enviada', { radicado, sede, id: data?.id });
        return res.status(200).json({ ok: true, radicado });
    } catch (err) {
        // Llega aquí si falta la configuración o revienta algo fuera de la API.
        console.error('[api/pqrs] fallo inesperado:', { radicado, sede, message: err?.message, stack: err?.stack });
        return res.status(502).json({
            error: 'No pudimos radicar tu solicitud en este momento. Escríbenos por WhatsApp o inténtalo más tarde.',
            detail: err?.message || 'error desconocido',
        });
    }
}
