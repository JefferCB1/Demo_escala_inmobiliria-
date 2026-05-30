import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Buzón por sede. El formulario manda el campo `sede` ("medellin" | "sabaneta")
// y aquí decidimos a qué inbox real va el correo.
const DESTINOS_POR_SEDE = {
    medellin: 'escalainmbiliariamedellin@gmail.com',
    sabaneta: 'escalainmobiliariasabaneta@gmail.com',
};
// Copia ciega opcional — descomenta si quieres recibir copia interna de cada PQRS:
// const BCC = ['carvajalberriojefferson@gmail.com'];

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { tipo, nombre, tipoDoc, numDoc, email, telefono, sede, relacion, asunto, descripcion, radicado } = req.body;

    if (!tipo || !nombre || !numDoc || !email || !telefono || !asunto || !descripcion) {
        return res.status(400).json({ error: 'Campos requeridos incompletos' });
    }

    const sedeNombre = sede === 'medellin' ? 'Sede Medellín' : 'Sede Sabaneta';
    const accentColor = sede === 'medellin' ? '#059669' : '#ea580c';

    const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;background:#f8fafc;padding:32px;">
      <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,${accentColor},${sede === 'medellin' ? '#0d9488' : '#b91c1c'});padding:28px 32px;">
          <h1 style="color:white;margin:0;font-size:20px;font-weight:700;">📋 Nueva PQRS — ${sedeNombre}</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:13px;letter-spacing:0.03em;">Radicado: <strong>${radicado}</strong></p>
        </div>
        <div style="padding:32px;">
          <table style="width:100%;border-collapse:collapse;">
            ${[
                ['Tipo de solicitud', `<strong style="color:${accentColor}">${tipo}</strong>`],
                ['Nombre completo', nombre],
                ['Identificación', `${tipoDoc} ${numDoc}`],
                ['Email', `<a href="mailto:${email}" style="color:${accentColor};text-decoration:none;">${email}</a>`],
                ['Teléfono', telefono],
                ['Relación con Escala', relacion],
                ['Sede', sedeNombre],
                ['Asunto', `<strong>${asunto}</strong>`],
            ].map(([label, value]) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;width:38%;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;vertical-align:top;">${label}</td>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#1e293b;font-size:14px;">${value}</td>
              </tr>
            `).join('')}
          </table>
          <div style="margin-top:24px;">
            <p style="color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">Descripción completa</p>
            <div style="background:#f1f5f9;border-left:4px solid ${accentColor};border-radius:0 8px 8px 0;padding:16px 20px;color:#1e293b;font-size:14px;line-height:1.7;white-space:pre-wrap;">${descripcion.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          </div>
          <div style="margin-top:24px;padding:14px 16px;background:#fefce8;border:1px solid #fde047;border-radius:8px;">
            <p style="margin:0;color:#713f12;font-size:12px;line-height:1.5;">⚠️ Según la <strong>Ley 1755 de 2015</strong>, debe dar respuesta en un plazo máximo de <strong>15 días hábiles</strong> para peticiones, quejas, reclamos o solicitudes.</p>
          </div>
        </div>
        <div style="background:#f8fafc;padding:14px 32px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:11px;">Escala Inmobiliaria · ${sedeNombre} · ${radicado}</p>
        </div>
      </div>
    </div>`;

    const destinatario = DESTINOS_POR_SEDE[sede];
    if (!destinatario) {
        return res.status(400).json({ error: `Sede desconocida: ${sede}` });
    }

    try {
        await resend.emails.send({
            // Mientras no haya dominio verificado en Resend, usamos su sandbox.
            // Cuando verifiques escalainmobiliaria.com.co cambia a:
            //   'PQRS Escala <pqrs@escalainmobiliaria.com.co>'
            from: 'PQRS Escala Inmobiliaria <onboarding@resend.dev>',
            to: destinatario,
            reply_to: email,
            subject: `[${radicado}] ${tipo} – ${sedeNombre} | ${asunto}`,
            html: htmlBody,
        });

        return res.status(200).json({ ok: true, radicado });
    } catch (error) {
        console.error('Resend error:', error);
        return res.status(500).json({ error: 'Error al enviar el correo. Intenta nuevamente.' });
    }
}
