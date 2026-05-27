import React, { useEffect, useRef, useState } from 'react';

const TIPOS = ['Petición', 'Queja', 'Reclamo', 'Sugerencia', 'Felicitación'];
const TIPOS_DOC = ['CC', 'CE', 'NIT', 'Pasaporte'];
const RELACIONES = ['Propietario', 'Arrendatario', 'Aspirante', 'Otro'];

function generateRadicado() {
    const d = new Date();
    const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const rand = Math.floor(Math.random() * 9000) + 1000;
    return `PQRS-${date}-${rand}`;
}

const PQRSModal = ({ isOpen, onClose, sede }) => {
    const isEmerald = sede === 'medellin';
    const sedeNombre = isEmerald ? 'Medellín' : 'Sabaneta';

    const theme = isEmerald ? {
        header: 'from-emerald-700 to-teal-800',
        btn: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
        accent: 'text-emerald-700',
        border: 'border-emerald-500',
        focus: 'focus:border-emerald-500 focus:ring-emerald-500',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        radioActive: 'border-emerald-600 bg-emerald-50 text-emerald-700',
        check: 'accent-emerald-600',
        successBg: 'bg-emerald-50 border-emerald-200',
        successText: 'text-emerald-800',
        successIcon: 'text-emerald-600',
    } : {
        header: 'from-orange-700 to-red-800',
        btn: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
        accent: 'text-orange-700',
        border: 'border-orange-500',
        focus: 'focus:border-orange-500 focus:ring-orange-500',
        badge: 'bg-orange-100 text-orange-800 border-orange-200',
        radioActive: 'border-orange-600 bg-orange-50 text-orange-700',
        check: 'accent-orange-600',
        successBg: 'bg-orange-50 border-orange-200',
        successText: 'text-orange-800',
        successIcon: 'text-orange-600',
    };

    const initialForm = {
        tipo: '', nombre: '', tipoDoc: 'CC', numDoc: '', email: '',
        telefono: '', sede, relacion: '', asunto: '', descripcion: '', autorizo: false,
    };

    const [form, setForm] = useState(initialForm);
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [radicado, setRadicado] = useState('');
    const modalRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const prev = document.activeElement;
        triggerRef.current = prev;

        const timer = setTimeout(() => {
            const first = modalRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            first?.focus();
        }, 50);

        const handleKey = (e) => {
            if (e.key === 'Escape') { onClose(); return; }
            if (e.key !== 'Tab' || !modalRef.current) return;
            const focusable = Array.from(modalRef.current.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            ));
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
            }
        };

        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';

        return () => {
            clearTimeout(timer);
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
            triggerRef.current?.focus();
        };
    }, [isOpen, onClose]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleClose = () => {
        setStatus('idle');
        setErrorMsg('');
        setForm(initialForm);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');
        const rad = generateRadicado();
        try {
            const res = await fetch('/api/pqrs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, radicado: rad }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al procesar la solicitud');
            setRadicado(rad);
            setStatus('success');
        } catch (err) {
            setErrorMsg(err.message);
            setStatus('error');
        }
    };

    if (!isOpen) return null;

    const inputClass = `w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition ${theme.focus} focus:outline-none focus:ring-2 focus:ring-opacity-30`;
    const labelClass = 'block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5';

    return (
        <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
            aria-modal="true"
            role="dialog"
            aria-labelledby="pqrs-modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                aria-hidden="true"
                onClick={handleClose}
            />

            {/* Panel */}
            <div
                ref={modalRef}
                className="relative z-10 w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[96dvh] sm:max-h-[90vh]"
            >
                {/* Header */}
                <div className={`bg-gradient-to-r ${theme.header} px-6 py-5 rounded-t-2xl flex-shrink-0`}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest border ${theme.badge} mb-2`}>
                                Sede {sedeNombre}
                            </span>
                            <h2 id="pqrs-modal-title" className="text-white font-heading font-extrabold text-xl leading-tight">
                                Radicar PQRS
                            </h2>
                            <p className="text-white/75 text-xs mt-1">Peticiones, Quejas, Reclamos, Sugerencias y Felicitaciones</p>
                        </div>
                        <button
                            onClick={handleClose}
                            aria-label="Cerrar formulario PQRS"
                            className="text-white/70 hover:text-white transition-colors mt-0.5 flex-shrink-0 rounded-full p-1 hover:bg-white/10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {status === 'success' ? (
                        <div className="p-8 flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-full ${theme.successBg} border ${theme.successBg} flex items-center justify-center mb-4`}>
                                <svg className={`w-8 h-8 ${theme.successIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-heading font-extrabold text-gray-900 mb-2">¡PQRS radicada exitosamente!</h3>
                            <p className="text-gray-600 text-sm mb-5 max-w-sm">
                                Tu solicitud fue recibida y un correo de notificación fue enviado al equipo de Escala Inmobiliaria.
                            </p>
                            <div className={`w-full max-w-xs rounded-xl border ${theme.successBg} p-4 mb-6`}>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Número de radicado</p>
                                <p className={`font-heading font-extrabold text-lg ${theme.successText} font-mono`}>{radicado}</p>
                                <p className="text-xs text-gray-500 mt-1">Guarda este número para hacer seguimiento</p>
                            </div>
                            <p className="text-xs text-gray-400 max-w-sm">
                                Según la Ley 1755 de 2015, recibirás respuesta en un plazo máximo de <strong>15 días hábiles</strong>.
                            </p>
                            <button
                                onClick={handleClose}
                                className={`mt-6 px-6 py-2.5 rounded-full text-white font-bold text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.btn}`}
                            >
                                Cerrar
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
                            {/* Tipo de solicitud */}
                            <fieldset>
                                <legend className={labelClass}>Tipo de solicitud <span className="text-red-500">*</span></legend>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    {TIPOS.map(t => (
                                        <label
                                            key={t}
                                            className={`flex items-center justify-center text-center px-2 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition ${form.tipo === t ? theme.radioActive + ' border-2' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="tipo"
                                                value={t}
                                                checked={form.tipo === t}
                                                onChange={handleChange}
                                                required
                                                className="sr-only"
                                            />
                                            {t}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            {/* Nombre */}
                            <div>
                                <label htmlFor="pqrs-nombre" className={labelClass}>Nombre completo <span className="text-red-500">*</span></label>
                                <input
                                    id="pqrs-nombre" type="text" name="nombre" value={form.nombre}
                                    onChange={handleChange} required minLength={3}
                                    placeholder="Tu nombre completo"
                                    className={inputClass}
                                />
                            </div>

                            {/* Identificación */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label htmlFor="pqrs-tipoDoc" className={labelClass}>Tipo doc.</label>
                                    <select id="pqrs-tipoDoc" name="tipoDoc" value={form.tipoDoc} onChange={handleChange} className={inputClass}>
                                        {TIPOS_DOC.map(d => <option key={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label htmlFor="pqrs-numDoc" className={labelClass}>Número de documento <span className="text-red-500">*</span></label>
                                    <input
                                        id="pqrs-numDoc" type="text" name="numDoc" value={form.numDoc}
                                        onChange={handleChange} required
                                        placeholder="1234567890"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Email y Teléfono */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="pqrs-email" className={labelClass}>Correo electrónico <span className="text-red-500">*</span></label>
                                    <input
                                        id="pqrs-email" type="email" name="email" value={form.email}
                                        onChange={handleChange} required
                                        placeholder="tu@correo.com"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="pqrs-telefono" className={labelClass}>Teléfono <span className="text-red-500">*</span></label>
                                    <input
                                        id="pqrs-telefono" type="tel" name="telefono" value={form.telefono}
                                        onChange={handleChange} required
                                        placeholder="300 000 0000"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            {/* Relación */}
                            <div>
                                <label htmlFor="pqrs-relacion" className={labelClass}>Relación con Escala</label>
                                <select id="pqrs-relacion" name="relacion" value={form.relacion} onChange={handleChange} className={inputClass}>
                                    <option value="">Selecciona una opción</option>
                                    {RELACIONES.map(r => <option key={r}>{r}</option>)}
                                </select>
                            </div>

                            {/* Asunto */}
                            <div>
                                <label htmlFor="pqrs-asunto" className={labelClass}>Asunto <span className="text-red-500">*</span></label>
                                <input
                                    id="pqrs-asunto" type="text" name="asunto" value={form.asunto}
                                    onChange={handleChange} required minLength={5}
                                    placeholder="Resumen breve de tu solicitud"
                                    className={inputClass}
                                />
                            </div>

                            {/* Descripción */}
                            <div>
                                <label htmlFor="pqrs-descripcion" className={labelClass}>
                                    Descripción <span className="text-red-500">*</span>
                                    <span className={`normal-case font-normal ml-2 ${form.descripcion.length < 20 ? 'text-gray-400' : theme.accent}`}>
                                        ({form.descripcion.length} / mín. 20 caracteres)
                                    </span>
                                </label>
                                <textarea
                                    id="pqrs-descripcion" name="descripcion" value={form.descripcion}
                                    onChange={handleChange} required minLength={20}
                                    rows={4}
                                    placeholder="Describe tu solicitud en detalle..."
                                    className={`${inputClass} resize-none`}
                                />
                            </div>

                            {/* Autorización */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox" name="autorizo" checked={form.autorizo}
                                    onChange={handleChange} required
                                    className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded ${theme.check}`}
                                />
                                <span className="text-xs text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors">
                                    Autorizo el tratamiento de mis datos personales conforme a la{' '}
                                    <span className={`font-semibold ${theme.accent}`}>política de privacidad</span>{' '}
                                    de Escala Inmobiliaria. <span className="text-red-500">*</span>
                                </span>
                            </label>

                            {/* Error */}
                            {status === 'error' && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-red-700 text-xs">{errorMsg}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex items-center justify-between gap-3 pt-1">
                                <button
                                    type="button" onClick={handleClose}
                                    className="px-5 py-2.5 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-bold text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${theme.btn}`}
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            Radicar solicitud
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PQRSModal;
