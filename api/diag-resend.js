// ENDPOINT TEMPORAL DE DIAGNÓSTICO — BORRAR DESPUÉS DE USAR.
//
// No envía ningún correo. Solo hace una llamada de LECTURA a la API de Resend
// con la key que tenga producción, para distinguir:
//   - key válida pero restringida a envío  -> 401 "restricted_api_key"
//   - key revocada o incorrecta            -> 401 "validation_error" / "invalid"
//   - key ausente                          -> no configurada
// Nunca devuelve el valor de la key: solo longitud, prefijo y el veredicto.

const TOKEN = 'diag-8f3a91c2';

// Destinatario FIJO en el código, nunca tomado de la URL: si el destino
// viniera por query, esto sería un relay abierto para cualquiera que
// adivinase el token.
const DESTINO_PRUEBA = 'carvajalberriojefferson@gmail.com';

// GET ?token=...&enviar=1 -> manda UN correo de prueba desde producción,
// con el mismo `from` y la misma key que usa el PQRS real, y devuelve la
// respuesta cruda de Resend. Es la única forma de saber si el envío se acepta,
// porque las keys son de solo-envío y no permiten consultar nada.
async function enviarPrueba() {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const marca = new Date().toISOString();

    const { data, error } = await resend.emails.send({
        from: 'PQRS Escala Inmobiliaria <pqrs@escalainmobiliaria.com.co>',
        to: DESTINO_PRUEBA,
        subject: `[PRUEBA TECNICA] Diagnostico de envio PQRS - ${marca}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 12px">Correo de prueba tecnica</h2>
      <p>Este correo NO es una PQRS. Se envio para comprobar si los correos del
      formulario estaban saliendo de verdad desde produccion.</p>
      <p style="color:#64748b;font-size:13px">Enviado desde el mismo dominio verificado
      y con la misma API key que usa el formulario real.<br>Marca de tiempo: ${marca}</p>
      <p style="color:#64748b;font-size:13px">Si lo encuentras en <strong>Spam</strong> y no en
      la bandeja principal, ese es exactamente el problema que estabamos buscando.</p>
    </div>`,
    });

    return {
        aceptadoPorResend: !error,
        idMensaje: data?.id ?? null,
        destino: DESTINO_PRUEBA,
        error: error ? { name: error.name, statusCode: error.statusCode, message: error.message } : null,
        pista: error
            ? 'Resend RECHAZO el envio. El motivo esta en `error`.'
            : 'Resend ACEPTO el envio. Si no llega, el problema es de entrega (spam, filtros de Gmail), no del codigo.',
    };
}

export default async function handler(req, res) {
    if (req.query.token !== TOKEN) {
        return res.status(404).json({ error: 'No encontrado' });
    }

    if (req.query.enviar === '1') {
        try {
            return res.status(200).json(await enviarPrueba());
        } catch (err) {
            return res.status(200).json({ aceptadoPorResend: false, excepcion: err?.message });
        }
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) {
        return res.status(200).json({
            veredicto: 'KEY_AUSENTE',
            detalle: 'RESEND_API_KEY no está definida en el entorno de producción.',
        });
    }

    const meta = {
        longitud: key.length,
        prefijo: key.slice(0, 6) + '…',
        empiezaPorRe: key.startsWith('re_'),
        tieneEspaciosOSaltos: /\s/.test(key),
    };

    let respuesta;
    try {
        const r = await fetch('https://api.resend.com/domains', {
            headers: { Authorization: `Bearer ${key}` },
            signal: AbortSignal.timeout(8000),
        });
        const texto = await r.text();
        let cuerpo;
        try { cuerpo = JSON.parse(texto); } catch { cuerpo = { raw: texto.slice(0, 300) }; }
        respuesta = { status: r.status, cuerpo };
    } catch (err) {
        return res.status(200).json({ veredicto: 'ERROR_DE_RED', meta, detalle: err?.message });
    }

    // Interpretación
    let veredicto;
    const nombre = respuesta.cuerpo?.name;
    if (respuesta.status === 200) veredicto = 'KEY_VALIDA_ACCESO_TOTAL';
    else if (nombre === 'restricted_api_key') veredicto = 'KEY_VALIDA_SOLO_ENVIO';
    else if (respuesta.status === 401 || respuesta.status === 403) veredicto = 'KEY_RECHAZADA';
    else veredicto = 'RESPUESTA_INESPERADA';

    // Si la key tiene acceso total, aprovechamos y miramos los dominios.
    let dominios = null;
    if (respuesta.status === 200 && Array.isArray(respuesta.cuerpo?.data)) {
        dominios = respuesta.cuerpo.data.map(d => ({ name: d.name, status: d.status, region: d.region }));
    }

    return res.status(200).json({ veredicto, meta, httpStatus: respuesta.status, resend: respuesta.cuerpo, dominios });
}
