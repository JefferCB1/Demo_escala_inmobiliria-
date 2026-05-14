import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Google Analytics 4 integration.
 * Se activa solo si VITE_GA4_ID está definido en el entorno (ej. G-XXXXXXXXXX).
 * Inyecta el script de gtag de forma async y dispara page_view en cada cambio de ruta.
 *
 * Para activar:
 *   1. Crear propiedad en https://analytics.google.com/
 *   2. Copiar el Measurement ID (formato G-XXXXXXXXXX)
 *   3. En Vercel → Settings → Environment Variables agregar:
 *        VITE_GA4_ID = G-XXXXXXXXXX
 *      (Production + Preview + Development)
 *   4. Redeploy.
 *
 * Para desactivar: borra la variable y redeploy.
 */
const GA_ID = import.meta.env.VITE_GA4_ID;

export default function GoogleAnalytics() {
    const location = useLocation();

    // Inyecta el script una sola vez al montar (si hay ID configurado)
    useEffect(() => {
        if (!GA_ID) return;
        if (window.__ga4Loaded) return;

        // Cargamos en idle para no bloquear initial render
        const inject = () => {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            window.gtag = function () { window.dataLayer.push(arguments); };
            window.gtag('js', new Date());
            window.gtag('config', GA_ID, {
                // Mejor privacidad: no enviar IP completa
                anonymize_ip: true,
                // SPA: desactivamos page_view automático en navegación, lo manejamos manual
                send_page_view: false,
            });
            // Page view inicial
            window.gtag('event', 'page_view', {
                page_path: location.pathname + location.search,
                page_title: document.title,
            });
            window.__ga4Loaded = true;
        };

        const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1000));
        idle(inject);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // En cada cambio de ruta, dispara page_view manual
    useEffect(() => {
        if (!GA_ID || !window.gtag) return;
        window.gtag('event', 'page_view', {
            page_path: location.pathname + location.search,
            page_title: document.title,
        });
    }, [location.pathname, location.search]);

    return null;
}
