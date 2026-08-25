// ENDPOINT TEMPORAL DE DIAGNÓSTICO — BORRAR DESPUÉS DE USAR.
//
// No envía ningún correo. Solo hace una llamada de LECTURA a la API de Resend
// con la key que tenga producción, para distinguir:
//   - key válida pero restringida a envío  -> 401 "restricted_api_key"
//   - key revocada o incorrecta            -> 401 "validation_error" / "invalid"
//   - key ausente                          -> no configurada
// Nunca devuelve el valor de la key: solo longitud, prefijo y el veredicto.

const TOKEN = 'diag-8f3a91c2';

export default async function handler(req, res) {
    if (req.query.token !== TOKEN) {
        return res.status(404).json({ error: 'No encontrado' });
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
