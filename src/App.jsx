import React, { useRef, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}
import { HelmetProvider, Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import PropertyGrid from './components/sections/PropertyGrid';
import PropertyExplorer from './components/sections/PropertyExplorer';
import Testimonials from './components/sections/Testimonials';
import GlobalLayout from './components/layout/GlobalLayout';
import PortalLinks from './components/ui/PortalLinks';
import { StickyBottomBar } from './components/ui/StickyBottomBar';
import { ExitIntentModal } from './components/ui/ExitIntentModal';
// Chatbot deshabilitado por solicitud. Para reactivar: descomenta el import y el <FloatingChatbot /> abajo.
// import FloatingChatbot from './components/ui/FloatingChatbot';
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const NosotrosPage = lazy(() => import('./pages/NosotrosPage'));
const SedeMedellinPage = lazy(() => import('./pages/SedeMedellinPage'));
const SedeSabanetaPage = lazy(() => import('./pages/SedeSabanetaPage'));

gsap.registerPlugin(ScrollTrigger);

function HomePage() {
    const mainRef = useRef(null);

    useGSAP(() => {
        // En móvil saltamos animaciones GSAP/ScrollTrigger:
        // - El bounce nativo de iOS pelea con ScrollTrigger.
        // - Compositing 3D consume batería innecesaria.
        // - La animación es decorativa, sin valor funcional crítico.
        const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
        if (!isDesktop) return;

        const sections = mainRef.current.querySelectorAll('.page-section');

        sections.forEach((section, i) => {
            if (i === 0) return;

            gsap.fromTo(section,
                { y: 30, force3D: true },
                {
                    y: 0,
                    force3D: true,
                    duration: 0.7,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 88%",
                        end: "top 55%",
                        scrub: false,
                        once: true,
                    },
                }
            );
        });

        // Refresca tras layout shifts (fonts, imágenes, etc.)
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);
        return () => clearTimeout(timer);
    }, { scope: mainRef });

    return (
        <>
            <Helmet>
                <title>Escala Inmobiliaria - Propiedades en Medellín y Sabaneta | Compra, Venta y Arriendo</title>
                <meta name="description" content="Escala Inmobiliaria: expertos en bienes raíces en Medellín y Sabaneta. Encuentra casas, apartamentos y proyectos nuevos. Asesoramiento VIP 24/7." />
                <link rel="canonical" href="https://escalainmobiliaria.com.co/" />
                <meta property="og:title" content="Escala Inmobiliaria - Propiedades en Medellín y Sabaneta" />
                <meta property="og:description" content="Expertos en bienes raíces en Medellín y Sabaneta. Encuentra casas, apartamentos y proyectos nuevos con asesoramiento VIP 24/7." />
                <meta property="og:url" content="https://escalainmobiliaria.com.co/" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://escalainmobiliaria.com.co/og-image.jpg" />
            </Helmet>
            <main ref={mainRef} className="flex-1 relative z-10 w-full md:mb-0">
                <div className="page-section"><Hero /></div>
                <div className="page-section"><PropertyGrid /></div>
                <div className="page-section"><PropertyExplorer /></div>
                <div className="page-section"><PortalLinks /></div>
                <div className="page-section"><Testimonials /></div>
            </main>
        </>
    );
}

function App() {
    return (
        <HelmetProvider>
        <Router>
            <GlobalLayout>
                <ScrollToTop />
                <Navbar />
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-escala-accent border-t-transparent rounded-full animate-spin" /></div>}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/nosotros" element={<NosotrosPage />} />
                    <Route path="/sede-medellin" element={<SedeMedellinPage />} />
                    <Route path="/sede-sabaneta" element={<SedeSabanetaPage />} />
                    <Route path="/propiedades" element={<PropertiesPage />} />
                    <Route path="/propiedad/:id" element={<PropertyDetail />} />
                </Routes>
                </Suspense>
                <Footer />
                <StickyBottomBar />
                {/* <FloatingChatbot /> */}
                <ExitIntentModal />
            </GlobalLayout>
        </Router>
        </HelmetProvider>
    );
}

export default App;
