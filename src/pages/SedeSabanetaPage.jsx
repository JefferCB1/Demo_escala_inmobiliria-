import React, { useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import BentoCard from '../components/ui/BentoCard';

gsap.registerPlugin(ScrollTrigger);

const lineasAtencion = [
    { label: 'Línea Cartera', numero: '3045335318', icono: 'receipt' },
    { label: 'Línea Reparaciones', numero: '3008913228', icono: 'wrench' },
    { label: 'Línea Servicios Públicos', numero: '3005759048', icono: 'building' },
];

const IconMap = ({ type }) => {
    const icons = {
        receipt: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
        ),
        wrench: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
        building: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
    };
    return icons[type] || icons.building;
};

const SedeSabanetaPage = () => {
    const mainRef = useRef(null);
    const heroRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo('.sede-hero-text',
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.9, stagger: 0.15, ease: 'power3.out' }
            );
        }, heroRef);
        return () => ctx.revert();
    }, []);

    useGSAP(() => {
        const sections = document.querySelectorAll('.sede-section');
        sections.forEach((section) => {
            gsap.fromTo(section,
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                    scrollTrigger: { trigger: section, start: 'top 85%', end: 'top 45%', scrub: 0.8 },
                }
            );
        });
    }, { scope: mainRef });

    return (
        <main ref={mainRef} className="flex-1 relative z-10 w-full" role="main">
            <Helmet>
                <title>Sede Sabaneta - Escala Inmobiliaria | Propietarios y Arrendatarios</title>
                <meta name="description" content="Sede Sabaneta de Escala Inmobiliaria. Carrera 45 # 72 sur - 07, cerca al Parque de Sabaneta. Líneas de atención para propietarios y arrendatarios, pagos en línea y más." />
                <link rel="canonical" href="https://escalainmobiliaria.com.co/sede-sabaneta/" />
                <meta property="og:title" content="Sede Sabaneta - Escala Inmobiliaria" />
                <meta property="og:description" content="Sede Sabaneta de Escala Inmobiliaria en el sector del Parque de Sabaneta. Atención especializada." />
                <meta property="og:url" content="https://escalainmobiliaria.com.co/sede-sabaneta/" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://escalainmobiliaria.com.co/wp-content/uploads/WhatsApp-Image-2024-10-03-at-12.34.34-PM.png" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Sede Sabaneta - Escala Inmobiliaria" />
                <meta name="twitter:image" content="https://escalainmobiliaria.com.co/wp-content/uploads/WhatsApp-Image-2024-10-03-at-12.34.34-PM.png" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "RealEstateAgent",
                    "name": "Escala Inmobiliaria - Sede Sabaneta",
                    "description": "Sede Sabaneta de Escala Inmobiliaria, expertos en arrendamiento y administración de propiedades en Sabaneta.",
                    "url": "https://escalainmobiliaria.com.co/sede-sabaneta/",
                    "telephone": "+573009122101",
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Carrera 45 # 72 sur - 07 interior 302",
                        "addressLocality": "Sabaneta",
                        "addressRegion": "Antioquia",
                        "addressCountry": "CO",
                        "neighborhood": "Sector Parque de Sabaneta"
                    },
                    "areaServed": "Sabaneta",
                    "breadcrumb": {
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "Inicio", "item": "https://escalainmobiliaria.com.co/" },
                            { "@type": "ListItem", "position": 2, "name": "Sede Sabaneta", "item": "https://escalainmobiliaria.com.co/sede-sabaneta/" }
                        ]
                    }
                })}</script>
            </Helmet>

            <a href="#sede-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-escala-accent focus:text-white focus:rounded-lg">
                Saltar al contenido principal
            </a>

            {/* Hero */}
            <section ref={heroRef} aria-label="Sede Sabaneta de Escala Inmobiliaria" className="relative w-full min-h-[60vh] flex items-center justify-center pt-28 sm:pt-32 pb-16 px-4 sm:px-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1577908955054-05db44e8c56c?q=80&w=2074&auto=format&fit=crop"
                        alt="Sede Sabaneta Escala Inmobiliaria"
                        className="w-full h-full object-cover"
                        width="1920"
                        height="1080"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-sky-800/85 to-indigo-900/90"></div>
                </div>

                <div className="relative z-10 max-w-4xl w-full flex flex-col items-center text-center">
                    <div className="sede-hero-text inline-block px-4 py-1.5 bg-white/15 text-white rounded-full text-xs sm:text-sm font-bold mb-6 border border-white/25 uppercase tracking-widest backdrop-blur-sm">
                        Conoce tu sede
                    </div>
                    <h1 className="sede-hero-text font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                        Sede <span className="text-sky-300">Sabaneta</span>
                    </h1>
                    <p className="sede-hero-text text-base sm:text-lg md:text-xl text-white/80 font-medium max-w-2xl px-4 sm:px-0">
                        Carrera 45 # 72 sur - 07 interior 302, sector Parque de Sabaneta. Estamos listos para ayudarte con tus gestiones inmobiliarias en el sur del Valle de Aburrá.
                    </p>
                    <div className="sede-hero-text flex flex-col sm:flex-row gap-3 mt-8">
                        <a
                            href="tel:+573009122101"
                            aria-label="Llamar a la sede Sabaneta al 3009122101"
                            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-indigo-800 rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Llamar: 300 912 2101
                        </a>
                        <a
                            href="https://api.whatsapp.com/send?phone=573009122101&text=Hola,%20necesito%20información%20sobre%20la%20sede%20Sabaneta"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Contactar sede Sabaneta por WhatsApp"
                            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-[#25D366] text-white rounded-full font-bold text-sm sm:text-base shadow-lg hover:bg-[#20bd5a] hover:-translate-y-0.5 transition-all"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            WhatsApp
                        </a>
391:                     </div>
392:                 </div>
393:             </section>
394: 
395:             <article id="sede-content">
396:                 {/* Portal Rápido - 3 cards */}
397:                 <section className="sede-section opacity-0 translate-y-8 w-full py-16 sm:py-20 px-4 sm:px-6 bg-white" aria-labelledby="portales-heading">
398:                     <div className="max-w-5xl mx-auto">
399:                         <h2 id="portales-heading" className="sr-only">Portales de acceso rápido</h2>
400:                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
401:                             {/* Arrendatarios */}
402:                             <a
403:                                 href="https://simidocs.siminmobiliarias.com/base/simired/simidocsapi1.0/index.php?inmo=1272&tipo=2"
404:                                 target="_blank"
405:                                 rel="noopener noreferrer"
406:                                 aria-label="Portal de arrendatarios sede Sabaneta"
407:                                 className="group"
408:                             >
409:                                 <BentoCard className="text-center hover:-translate-y-2 transition-all duration-500 bg-slate-50 border-gray-100 shadow-md group-hover:shadow-xl group-hover:border-sky-200">
410:                                     <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
411:                                         <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
412:                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
413:                                         </svg>
414:                                     </div>
415:                                     <h3 className="text-lg font-heading font-bold text-escala-dark mb-2">Arrendatarios</h3>
416:                                     <p className="text-gray-500 text-sm font-medium">Portal de documentos sede Sabaneta</p>
417:                                 </BentoCard>
418:                             </a>
419: 
420:                             {/* Propietarios */}
421:                             <a
422:                                 href="https://simidocs.siminmobiliarias.com/base/simired/simidocsapi1.0/index.php?inmo=1272&tipo=1"
423:                                 target="_blank"
424:                                 rel="noopener noreferrer"
425:                                 aria-label="Portal de propietarios sede Sabaneta"
426:                                 className="group"
427:                             >
428:                                 <BentoCard className="text-center hover:-translate-y-2 transition-all duration-500 bg-slate-50 border-gray-100 shadow-md group-hover:shadow-xl group-hover:border-indigo-200">
429:                                     <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
430:                                         <svg className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
431:                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
432:                                         </svg>
433:                                     </div>
434:                                     <h3 className="text-lg font-heading font-bold text-escala-dark mb-2">Propietarios</h3>
435:                                     <p className="text-gray-500 text-sm font-medium">Consulta reportes y estado de inmuebles</p>
436:                                 </BentoCard>
437:                             </a>
438: 
439:                             {/* Pagos */}
440:                             <a
441:                                 href="https://pagos.palomma.com/escalainmobiliariasabaneta"
442:                                 target="_blank"
443:                                 rel="noopener noreferrer"
444:                                 aria-label="Plataforma de pagos en línea sede Sabaneta"
445:                                 className="group"
446:                             >
447:                                 <BentoCard className="text-center hover:-translate-y-2 transition-all duration-500 bg-slate-50 border-gray-100 shadow-md group-hover:shadow-xl group-hover:border-sky-200">
448:                                     <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
449:                                         <svg className="w-7 h-7 sm:w-8 sm:h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
450:                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
451:                                         </svg>
452:                                     </div>
453:                                     <h3 className="text-lg font-heading font-bold text-escala-dark mb-2">Pagos en Línea</h3>
454:                                     <p className="text-gray-500 text-sm font-medium">Bóton de pago PSE oficial de Palomma</p>
455:                                 </BentoCard>
456:                             </a>
457:                         </div>
458:                     </div>
459:                 </section>
460: 
461:                 {/* Líneas de Atención Propietarios */}
462:                 <section className="sede-section opacity-0 translate-y-8 w-full py-16 sm:py-20 px-4 sm:px-6 bg-slate-50" aria-labelledby="lineas-heading">
463:                     <div className="max-w-5xl mx-auto">
464:                         <div className="text-center mb-12">
465:                             <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold mb-4 border border-indigo-200 uppercase tracking-widest">
466:                                 Propietarios
467:                             </div>
468:                             <h2 id="lineas-heading" className="text-3xl md:text-4xl font-heading font-extrabold text-escala-dark mb-4 tracking-tight">
469:                                 Líneas de <span className="text-indigo-600">Atención</span>
470:                             </h2>
471:                             <p className="text-gray-600 font-medium max-w-xl mx-auto">
472:                                 Comunícate directamente con el área en la sede Sabaneta para apoyarte en cualquier gestión.
473:                             </p>
474:                         </div>
475: 
476:                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 justify-center">
477:                             {lineasAtencion.map((linea, index) => (
478:                                 <a
479:                                     key={index}
480:                                     href={`tel:+57${linea.numero}`}
481:                                     aria-label={`Llamar a ${linea.label}: ${linea.numero}`}
482:                                     className="group"
483:                                 >
484:                                     <BentoCard className="flex flex-col items-center gap-4 text-center hover:-translate-y-1 transition-all duration-300 bg-white border-gray-100 shadow-sm group-hover:shadow-lg group-hover:border-indigo-200 h-full">
485:                                         <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center flex-shrink-0 text-indigo-600 group-hover:scale-110 transition-transform">
486:                                             <IconMap type={linea.icono} />
487:                                         </div>
488:                                         <div className="min-w-0">
489:                                             <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{linea.label}</p>
490:                                             <p className="text-xl font-heading font-bold text-escala-dark group-hover:text-indigo-600 transition-colors">{linea.numero.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}</p>
491:                                         </div>
492:                                     </BentoCard>
493:                                 </a>
494:                             ))}
495:                         </div>
496: 
497:                         {/* Línea general arrendatarios */}
498:                         <div className="mt-12">
499:                             <div className="text-center mb-6">
500:                                 <div className="inline-block px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold border border-sky-200 uppercase tracking-widest">
501:                                     Atención al Cliente
502:                                 </div>
503:                             </div>
504:                             <a href="tel:+573009122101" aria-label="Línea de atención al cliente para arrendatarios: 3009122101" className="group block">
505:                                 <BentoCard className="flex items-center gap-4 max-w-md mx-auto hover:-translate-y-1 transition-all duration-300 bg-white border-gray-100 shadow-sm group-hover:shadow-lg group-hover:border-sky-200">
506:                                     <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl flex items-center justify-center flex-shrink-0 text-sky-600 group-hover:scale-110 transition-transform">
507:                                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
508:                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
509:                                         </svg>
510:                                     </div>
511:                                     <div className="min-w-0 flex-1">
512:                                         <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Whatsapp Sede</p>
513:                                         <p className="text-xl font-heading font-bold text-escala-dark group-hover:text-sky-600 transition-colors">300 912 2101</p>
514:                                     </div>
515:                                 </BentoCard>
516:                             </a>
517:                         </div>
518:                     </div>
519:                 </section>
520: 
521:                 {/* Ubicación */}
522:                 <section className="sede-section opacity-0 translate-y-8 w-full py-16 sm:py-20 px-4 sm:px-6 bg-white" aria-labelledby="ubicacion-heading">
523:                     <div className="max-w-5xl mx-auto">
524:                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
525:                             <div>
526:                                 <div className="inline-block px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-xs font-bold mb-4 border border-sky-200 uppercase tracking-widest">
527:                                     Ubicación
528:                                 </div>
529:                                 <h2 id="ubicacion-heading" className="text-3xl md:text-4xl font-heading font-extrabold text-escala-dark mb-6 tracking-tight">
530:                                     Visítanos cerca al <span className="text-sky-600">Parque</span>
531:                                 </h2>
532:                                 <div className="space-y-4">
533:                                     <div className="flex items-start gap-3">
534:                                         <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
535:                                             <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
536:                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
537:                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
538:                                             </svg>
539:                                         </div>
540:                                         <div>
541:                                             <p className="font-bold text-escala-dark text-lg">Dirección Oficial</p>
542:                                             <p className="text-gray-600 font-medium">Carrera 45 # 72 sur - 07 interior 302, Sector Parque de Sabaneta, Antioquia.</p>
543:                                         </div>
544:                                     </div>
545:                                     <div className="flex items-start gap-3">
546:                                         <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
547:                                             <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
548:                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
549:                                             </svg>
550:                                         </div>
551:                                         <div>
552:                                             <p className="font-bold text-escala-dark text-lg">WhatsApp Atn. Cliente</p>
553:                                             <a href="https://api.whatsapp.com/send?phone=573009122101" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold text-lg hover:text-indigo-500 transition-colors">300 912 2101</a>
554:                                         </div>
555:                                     </div>
556:                                 </div>
557:                             </div>
558: 
559:                             <div className="relative">
560:                                 <BentoCard className="relative overflow-hidden p-0 border-0 shadow-2xl">
561:                                     <iframe
562:                                         src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15867.733566160163!2d-75.62562479526715!3d6.1396264999999915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4683bc4cd0ca6d%3A0xe7f9a15c3ec0b968!2sParque%20de%20Sabaneta!5e0!3m2!1ses!2sco!4v1715000000000!5m2!1ses!2sco"
563:                                         width="100%"
564:                                         height="350"
565:                                         style={{ border: 0 }}
566:                                         allowFullScreen=""
567:                                         loading="lazy"
568:                                         referrerPolicy="no-referrer-when-downgrade"
569:                                         title="Ubicación de Escala Inmobiliaria Sede Sabaneta en Google Maps"
570:                                         className="w-full h-[280px] sm:h-[350px]"
571:                                     ></iframe>
572:                                 </BentoCard>
573:                             </div>
574:                         </div>
575:                     </div>
576:                 </section>
577: 
578:                 {/* CTA */}
579:                 <section className="sede-section opacity-0 translate-y-8 w-full py-16 sm:py-20 px-4 sm:px-6 bg-slate-50" aria-label="Agendar asesoría en sede Sabaneta">
580:                     <div className="max-w-4xl mx-auto text-center">
581:                         <BentoCard className="relative overflow-hidden bg-gradient-to-br from-indigo-700 to-sky-900 border-0 p-6 sm:p-10 md:p-16">
582:                             <div className="absolute inset-0 opacity-10"
583:                                 style={{
584:                                     backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)'
585:                                 }}
586:                             ></div>
587:                             <div className="relative z-10">
588:                                 <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-white mb-4 tracking-tight">
589:                                     Agenda tu visita en{' '}
590:                                     <span className="text-sky-300">nuestra sede</span>
591:                                 </h2>
592:                                 <p className="text-indigo-100/80 font-medium max-w-xl mx-auto mb-8">
593:                                     Nuestro gran equipo en Sabaneta está preparado para apoyarte y garantizar juntos la mejor administración de tus propiedades.
594:                                 </p>
595:                                 <a
596:                                     href="https://api.whatsapp.com/send?phone=573009122101&text=Hola,%20quiero%20agendar%20una%20visita%20en%20la%20sede%20Sabaneta"
597:                                     target="_blank"
598:                                     rel="noopener noreferrer"
599:                                     aria-label="Agendar visita en sede Sabaneta por WhatsApp"
600:                                     className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-indigo-800 rounded-full hover:bg-indigo-50 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm sm:text-base shadow-md"
601:                                 >
602:                                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
603:                                         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
604:                                     </svg>
605:                                     Escribir en WhatsApp
606:                                 </a>
607:                             </div>
608:                         </BentoCard>
609:                     </div>
610:                 </section>
611:             </article>
612:         </main>
613:     );
614: };
615: 
616: export default SedeSabanetaPage;
617: 
