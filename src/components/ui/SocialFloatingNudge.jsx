import React, { useEffect, useState } from 'react';

// URLs centralizadas — mismas que en Footer y menú móvil
const SOCIALS = [
    {
        id: 'instagram',
        label: 'Instagram',
        url: 'https://www.instagram.com/escalainmobiliariamedellin/',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
        ),
    },
    {
        id: 'tiktok',
        label: 'TikTok',
        url: 'https://www.tiktok.com/@escala_inmobiliaria',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
            </svg>
        ),
    },
];

// Clave de sessionStorage para recordar si el usuario cerró el nudge.
// Sessionn (no local) → vuelve a aparecer en siguientes visitas, no es invasivo en la actual.
const DISMISS_KEY = 'social-nudge-dismissed';

const SocialFloatingNudge = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Si el usuario ya lo cerró en esta sesión, no volver a mostrarlo.
        if (sessionStorage.getItem(DISMISS_KEY) === '1') return;

        const handleScroll = () => {
            // Aparece después de ~400px de scroll (suficiente para no chocar con el Hero).
            if (window.scrollY > 400) {
                setVisible(true);
            }
        };
        // Chequeo inicial: cubre el caso de refresh con scroll ya hecho.
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleDismiss = () => {
        sessionStorage.setItem(DISMISS_KEY, '1');
        setVisible(false);
    };

    // Solo móvil y tablet (lg:hidden). En desktop ya están las redes en el Footer
    // bien visible y no queremos saturar la UI.
    if (!visible) return null;

    return (
        <div
            className="fixed left-0 top-1/2 -translate-y-1/2 z-40 lg:hidden flex flex-col gap-2 pl-1 sm:pl-2 animate-slideInLeft"
            role="complementary"
            aria-label="Síguenos en redes sociales"
        >
            {/* Badge "Síguenos" — texto pequeño que da contexto al ícono */}
            <div className="absolute -top-7 left-1 px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500 text-[9px] font-bold uppercase tracking-widest shadow-sm whitespace-nowrap">
                Síguenos
            </div>

            {SOCIALS.map((social) => (
                <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visitar ${social.label} de Escala Inmobiliaria`}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-r-xl rounded-l-sm flex items-center justify-center bg-white border border-gray-200 text-gray-500 shadow-md hover:bg-escala-accent hover:border-escala-accent hover:text-white hover:scale-105 focus:bg-escala-accent focus:border-escala-accent focus:text-white focus:outline-none active:bg-escala-accent active:border-escala-accent active:text-white active:scale-95 transition-all duration-300"
                >
                    {social.icon}
                </a>
            ))}

            {/* Botón cerrar minúsculo — opt-out fácil para que no se sienta forzado */}
            <button
                type="button"
                onClick={handleDismiss}
                aria-label="Ocultar accesos a redes sociales"
                className="self-end mr-0 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 hover:scale-110 transition-all"
            >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default SocialFloatingNudge;
