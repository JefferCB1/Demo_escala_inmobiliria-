// Pruebas del handler api/pqrs.js SIN enviar correos.
// Se sustituye globalThis.fetch para interceptar la llamada del SDK de Resend,
// así se puede comprobar el payload exacto y simular respuestas de error.
//
// Ejecutar: node test-pqrs-handler.mjs
// (gitignored por el patrón test-*.js? NO — este es .mjs, borrar al terminar)

process.env.RESEND_API_KEY = 're_key_falsa_para_test';
process.env.PQRS_BCC = 'respaldo@ejemplo.com';

const { default: handler } = await import('./api/pqrs.js');

let capturado = null;
let respuestaFake = null;

globalThis.fetch = async (url, options) => {
    capturado = { url: String(url), options, body: JSON.parse(options?.body ?? '{}') };
    return respuestaFake();
};

const ok = (obj) => () => new Response(JSON.stringify(obj), { status: 200, headers: { 'content-type': 'application/json' } });
const fail = (status, obj) => () => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });

function mockRes() {
    const r = {
        statusCode: null, body: null, headers: {},
        setHeader(k, v) { this.headers[k] = v; return this; },
        status(c) { this.statusCode = c; return this; },
        json(o) { this.body = o; return this; },
    };
    return r;
}

const baseBody = {
    tipo: 'Queja', nombre: 'Ana Pérez', tipoDoc: 'CC', numDoc: '1017234567',
    email: 'ana@ejemplo.com', telefono: '3001234567', sede: 'medellin',
    relacion: 'Arrendatario', asunto: 'Fuga de agua en el apartamento',
    descripcion: 'Llevo tres semanas reportando una fuga y nadie ha venido a revisarla.',
    autorizo: true, website: '',
};

// IPs distintas por test para no chocar con el rate limit (5 / 10 min por IP)
let ipCounter = 0;
function mockReq(body) {
    ipCounter++;
    return { method: 'POST', body, headers: { 'x-forwarded-for': `10.0.0.${ipCounter}` } };
}

let pasadas = 0, falladas = 0;
function check(nombre, condicion, extra = '') {
    if (condicion) { pasadas++; console.log(`  PASA  ${nombre}`); }
    else { falladas++; console.log(`  FALLA ${nombre} ${extra}`); }
}

// ─────────────────────────────────────────────────────────────
console.log('\n1) Resend rechaza el envío -> debe responder 502, NO 200');
respuestaFake = fail(403, { name: 'validation_error', message: 'The escalainmobiliaria.com.co domain is not verified', statusCode: 403 });
let res = mockRes();
await handler(mockReq({ ...baseBody }), res);
check('status 502', res.statusCode === 502, `(fue ${res.statusCode})`);
check('no dice ok:true', res.body?.ok !== true);
check('detalle tecnico presente', typeof res.body?.detail === 'string' && res.body.detail.includes('validation_error'), JSON.stringify(res.body));

// ─────────────────────────────────────────────────────────────
console.log('\n2) Envío correcto -> 200 con radicado del servidor');
respuestaFake = ok({ id: 'a1b2c3d4-0000-1111-2222-333344445555' });
res = mockRes();
await handler(mockReq({ ...baseBody }), res);
check('status 200', res.statusCode === 200, `(fue ${res.statusCode})`);
check('radicado con formato servidor', /^PQRS-\d{8}-[0-9A-F]{6}$/.test(res.body?.radicado || ''), res.body?.radicado);

console.log('\n   payload enviado a Resend:');
check('usa reply_to (mapeado desde replyTo)', capturado.body.reply_to === 'ana@ejemplo.com', JSON.stringify(capturado.body.reply_to));
check('destinatario correcto', capturado.body.to === 'escalainmobiliariamedellin@gmail.com', capturado.body.to);
check('bcc de respaldo aplicado', Array.isArray(capturado.body.bcc) && capturado.body.bcc.includes('respaldo@ejemplo.com'), JSON.stringify(capturado.body.bcc));
check('from del dominio verificado', String(capturado.body.from).includes('pqrs@escalainmobiliaria.com.co'));
check('asunto sin saltos de linea', !/[\r\n]/.test(capturado.body.subject), JSON.stringify(capturado.body.subject));
check('correo registra la autorizacion', capturado.body.html.includes('Autorización de tratamiento de datos'));

// ─────────────────────────────────────────────────────────────
console.log('\n3) Inyección HTML en campos -> debe salir escapada');
respuestaFake = ok({ id: 'x' });
res = mockRes();
await handler(mockReq({
    ...baseBody,
    nombre: '<img src=x onerror="alert(1)">',
    asunto: 'Reclamo <script>alert(2)</script>',
}), res);
check('status 200', res.statusCode === 200);
check('no hay <img crudo en el html', !capturado.body.html.includes('<img src=x'), 'se coló HTML sin escapar');
check('no hay <script> crudo en el html', !capturado.body.html.includes('<script>'), 'se coló un script');
check('sí aparece escapado', capturado.body.html.includes('&lt;img src=x'));

// ─────────────────────────────────────────────────────────────
console.log('\n4) Body vacío -> 400 con errores por campo');
res = mockRes();
await handler(mockReq({}), res);
check('status 400', res.statusCode === 400, `(fue ${res.statusCode})`);
check('devuelve mapa de campos', res.body?.campos && typeof res.body.campos === 'object');
check('marca tipo, nombre, email', ['tipo', 'nombre', 'email'].every(c => res.body?.campos?.[c]), JSON.stringify(res.body?.campos));

// ─────────────────────────────────────────────────────────────
console.log('\n5) Sin autorización de datos -> 400');
res = mockRes();
await handler(mockReq({ ...baseBody, autorizo: false }), res);
check('status 400', res.statusCode === 400, `(fue ${res.statusCode})`);
check('senala el campo autorizo', !!res.body?.campos?.autorizo);

// ─────────────────────────────────────────────────────────────
console.log('\n6) Email inválido -> 400');
res = mockRes();
await handler(mockReq({ ...baseBody, email: 'esto-no-es-un-correo' }), res);
check('status 400', res.statusCode === 400, `(fue ${res.statusCode})`);
check('senala el campo email', !!res.body?.campos?.email);

// ─────────────────────────────────────────────────────────────
console.log('\n7) Honeypot relleno -> 200 falso y NINGUNA llamada a Resend');
capturado = null;
res = mockRes();
await handler(mockReq({ ...baseBody, website: 'http://spam.example' }), res);
check('status 200 (no le damos pistas al bot)', res.statusCode === 200, `(fue ${res.statusCode})`);
check('no se llamó a Resend', capturado === null, 'se envió correo con el honeypot activo');

// ─────────────────────────────────────────────────────────────
console.log('\n8) Rate limit -> la 6ª desde la misma IP debe dar 429');
respuestaFake = ok({ id: 'y' });
const mismaIp = { method: 'POST', body: { ...baseBody }, headers: { 'x-forwarded-for': '203.0.113.99' } };
let ultimoStatus = null;
for (let i = 0; i < 6; i++) {
    const r = mockRes();
    await handler({ ...mismaIp, body: { ...baseBody } }, r);
    ultimoStatus = r.statusCode;
}
check('la 6ª es 429', ultimoStatus === 429, `(fue ${ultimoStatus})`);

// ─────────────────────────────────────────────────────────────
console.log('\n9) Método GET -> 405');
res = mockRes();
await handler({ method: 'GET', body: {}, headers: {} }, res);
check('status 405', res.statusCode === 405, `(fue ${res.statusCode})`);

console.log(`\n─────────────\nPASAN: ${pasadas}   FALLAN: ${falladas}\n`);
process.exit(falladas > 0 ? 1 : 0);
