import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SmartSearch } from '../ui/SmartSearch';
import BlurText from '../ui/BlurText';
import LogoStrip from './LogoStrip';

const MetricCard = ({ children, delay = 0, dark = false }) => {
    const cardRef = useRef(null);

    useEffect(() => {
        const card = cardRef.current;
        
        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Enhanced Deep Tilt
            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;

            // Track cursor position via CSS Variables for gradient glow
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            gsap.to(card, {
                rotationX: rotateX,
                rotationY: rotateY,
                duration: 0.4,
                ease: "power2.out"
            });
        };

        const handleMouseLeave = () => {
            gsap.to(card, {
                rotationX: 0,
                rotationY: 0,
                duration: 0.7,
                ease: "elastic.out(1, 0.5)"
            });
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    useEffect(() => {
        gsap.fromTo(cardRef.current,
            { y: 30, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 0.8, delay, ease: "back.out(1.7)" }
        );
    }, [delay]);

    const baseClasses = dark 
        ? "bg-gradient-to-br from-escala-dark to-slate-900 border-gray-800"
        : "bg-white border-gray-100";

    return (
        <div ref={cardRef} className={`metric-card relative group overflow-hidden rounded-2xl p-4 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${baseClasses}`} style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
            
            {/* Glowing Spotlight Following Cursor */}
            <div 
                className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 will-change-[background]"
                style={{
                    background: `radial-gradient(circle 180px at var(--mouse-x, 50%) var(--mouse-y, 50%), ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255, 102, 0, 0.08)'}, transparent)`
                }}
            />

            {/* Inner Content Popping Out (Parallax) */}
            <div className="relative z-10 flex flex-col items-center" style={{ transform: 'translateZ(40px)' }}>
                {children}
            </div>
        </div>
    );
};

const Hero = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(".hero-text",
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" }
            );
            gsap.fromTo(".hero-search",
                { y: 30, opacity: 0, scale: 0.95 },
                { y: 0, opacity: 1, scale: 1, duration: 1.2, delay: 0.4, ease: "power2.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative w-full min-h-screen flex items-center justify-center pt-20 sm:pt-24 px-4 sm:px-6 overflow-hidden bg-slate-50">
            {/* Bright Background Video with Soft Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-slate-100">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-30"
                >
                    <source src="/inicio-escala.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-slate-50"></div>
            </div>

            <div className="relative z-10 max-w-5xl w-full flex flex-col items-center text-center mt-8 sm:mt-10">
                <div className="hero-text inline-block px-3 sm:px-4 py-1.5 bg-orange-100 text-escala-accent rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6 border border-orange-200 uppercase tracking-widest shadow-sm">
                    Revolucionando el Mercado
                </div>
                <h1 className="hero-text font-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-escala-dark mb-4 sm:mb-6 leading-tight">
                    <span className="flex flex-col items-center">
                        <span>Encuentra tu próximo</span>
                        <span className="text-escala-accent">
                            <BlurText
                                text="Hogar Ideal"
                                delay={100}
                                animateBy="words"
                                direction="top"
                                as="span"
                                className="font-heading"
                            />
                        </span>
                    </span>
                </h1>
                <p className="hero-text text-base sm:text-lg md:text-xl text-gray-600 font-medium max-w-2xl mb-8 sm:mb-12 px-4 sm:px-0">
                    Miles de propiedades exclusivas en Medellín y Sabaneta. Te acompañamos en todo el proceso de compra o arriendo de forma segura y rápida.
                </p>

                {/* Smart Search injected here */}
                <div className="hero-search w-full">
                    <SmartSearch />
                </div>

                {/* Logo Strip - Aliados Estratégicos */}
                <div className="w-full mt-16">
                    <LogoStrip />
                </div>

                {/* High Contrast Trust Metrics */}
                <div className="mt-12 sm:mt-16 lg:mt-20 w-full max-w-4xl px-2 sm:px-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                        {/* Card 1 - Propiedades */}
                        <MetricCard delay={0.6}>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-escala-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <span className="text-3xl sm:text-4xl font-heading font-black text-escala-dark">150+</span>
                            <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mt-1">Propiedades</p>
                        </MetricCard>

                        {/* Card 2 - Asesoría 24/7 */}
                        <MetricCard delay={0.75} dark={true}>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-escala-accent to-orange-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <span className="text-3xl sm:text-4xl font-heading font-black text-white">24/7</span>
                            <p className="text-xs sm:text-sm font-bold text-escala-accent uppercase tracking-wider mt-1">Asesoría VIP</p>
                        </MetricCard>

                        {/* Card 3 - Seguridad */}
                        <MetricCard delay={0.9}>
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <span className="text-3xl sm:text-4xl font-heading font-black text-escala-dark">100%</span>
                            <p className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider mt-1">Seguro</p>
                        </MetricCard>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
