import React, { useRef, useState, useEffect } from 'react';

const reviews = [
    { src: '/images/C1.jpeg', alt: 'Reseña de Yeison Mejía en Google: 5 estrellas, experiencia muy buena con la inmobiliaria, son serios y responden por el inmueble.' },
    { src: '/images/C2.jpeg', alt: 'Reseña de Jorge Leyva en Google: 5 estrellas, cuando hubo un inconveniente respondieron sin problema, buscaron solución hasta dejarlo todo arreglado.' },
    { src: '/images/C3.jpeg', alt: 'Reseña de Oscar Sánchez en Google: 5 estrellas, atención cercana, rápida y clara, no marean ni esconden cosas.' },
    { src: '/images/C4.jpeg', alt: 'Reseña de Edna Amaya en Google: 5 estrellas, experiencia muy buena desde el principio, hablaron claro y ayudaron, sin tantos requisitos.' },
    { src: '/images/C5.jpeg', alt: 'Reseña de Eliana Marcela Montoya en Google: 5 estrellas, administran su propiedad hace 3 años, profesionalismo, compromiso y buen servicio.' },
];

const Testimonials = () => {
    const scrollerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollState = () => {
        const el = scrollerRef.current;
        if (!el) return;
        const cardWidth = el.firstElementChild?.getBoundingClientRect().width || 1;
        const gap = parseInt(getComputedStyle(el).columnGap || '24', 10);
        const idx = Math.round(el.scrollLeft / (cardWidth + gap));
        setActiveIndex(Math.min(reviews.length - 1, Math.max(0, idx)));
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        updateScrollState();
        el.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);
        return () => {
            el.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, []);

    const scrollByCards = (dir) => {
        const el = scrollerRef.current;
        if (!el) return;
        const cardWidth = el.firstElementChild?.getBoundingClientRect().width || el.clientWidth;
        const gap = parseInt(getComputedStyle(el).columnGap || '24', 10);
        el.scrollBy({ left: dir * (cardWidth + gap), behavior: 'smooth' });
    };

    const scrollToIndex = (i) => {
        const el = scrollerRef.current;
        if (!el) return;
        const cardWidth = el.firstElementChild?.getBoundingClientRect().width || el.clientWidth;
        const gap = parseInt(getComputedStyle(el).columnGap || '24', 10);
        el.scrollTo({ left: i * (cardWidth + gap), behavior: 'smooth' });
    };

    return (
        <section className="w-full py-20 sm:py-24 px-4 sm:px-6 relative z-10 bg-white" aria-labelledby="testimonials-heading">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10 sm:mb-12">
                    {/* Google Reviews badge */}
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm mb-6">
                        {/* Google G logo */}
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
                        </svg>
                        <span className="text-sm font-bold text-gray-700">Google Reviews</span>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-extrabold text-gray-800">5.0</span>
                            <div className="flex gap-0.5 text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    </div>

                    <h2 id="testimonials-heading" className="text-3xl md:text-5xl font-heading font-extrabold text-escala-dark mb-4 tracking-tight">
                        Lo que dicen <span className="text-escala-accent">nuestros clientes</span>
                    </h2>
                    <p className="text-gray-600 font-medium max-w-2xl mx-auto">
                        Opiniones reales publicadas en Google por propietarios y arrendatarios que confían en nosotros.
                    </p>
                </div>

                {/* Carousel */}
                <div className="relative">
                    {/* Botones de navegación - solo desktop */}
                    <button
                        type="button"
                        onClick={() => scrollByCards(-1)}
                        disabled={!canScrollLeft}
                        aria-label="Reseña anterior"
                        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg hover:shadow-xl items-center justify-center transition-all hover:-translate-x-5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-x-[-1rem] disabled:hover:shadow-lg"
                    >
                        <svg className="w-5 h-5 text-escala-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollByCards(1)}
                        disabled={!canScrollRight}
                        aria-label="Siguiente reseña"
                        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full bg-white border border-gray-200 shadow-lg hover:shadow-xl items-center justify-center transition-all hover:translate-x-5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-x-4 disabled:hover:shadow-lg"
                    >
                        <svg className="w-5 h-5 text-escala-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Track scroll-snap */}
                    <ul
                        ref={scrollerRef}
                        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-2"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        role="list"
                    >
                        {reviews.map((review, i) => (
                            <li
                                key={review.src}
                                className="snap-center flex-shrink-0 w-[88%] sm:w-[70%] md:w-[calc((100%-3rem)/2)] lg:w-[calc((100%-3rem)/2)]"
                            >
                                <figure className="relative h-full bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                                    {/* Esquina superior - badge de verificado */}
                                    <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 border border-blue-100">
                                        <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">Verificada</span>
                                    </div>

                                    <img
                                        src={review.src}
                                        alt={review.alt}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-auto block"
                                        width="844"
                                        height="240"
                                    />
                                </figure>
                            </li>
                        ))}
                    </ul>

                    {/* Indicadores de página */}
                    <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Reseñas disponibles">
                        {reviews.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                role="tab"
                                aria-selected={activeIndex === i}
                                aria-label={`Ver reseña ${i + 1} de ${reviews.length}`}
                                onClick={() => scrollToIndex(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-8 bg-escala-accent' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
