import React, { useEffect, useRef, useState } from 'react';

const GlobalLayout = ({ children }) => {
    const highlightRef = useRef(null);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        // Solo en desktop activamos los efectos visuales pesados:
        // - 3 elementos fixed con blur 100-120px (compositing pesado)
        // - mousemove listener que actualiza transform de un blur grande
        // En móvil estos no aportan valor y matan el frame-rate del scroll.
        const desktop = window.matchMedia('(min-width: 768px)').matches;
        setIsDesktop(desktop);

        if (!desktop) return;

        const el = highlightRef.current;
        if (!el) return;
        const handleMouseMove = (e) => {
            const offset = window.innerWidth * 0.15;
            el.style.transform = `translate(${e.clientX - offset}px, ${e.clientY - offset}px)`;
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="relative min-h-screen w-full bg-slate-50 overflow-x-hidden font-sans text-escala-dark">
            {/* Subtle light mesh background — barato, va siempre */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.4] z-0"
                style={{
                    backgroundImage: `radial-gradient(#e2e8f0 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* Efectos blur fijos — SOLO desktop. En móvil iOS Safari pelea con el scroll. */}
            {isDesktop && (
                <>
                    <div
                        ref={highlightRef}
                        className="pointer-events-none fixed z-0 rounded-full blur-[100px]"
                        style={{
                            width: '30vw',
                            height: '30vw',
                            background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, rgba(255,107,0,0) 70%)',
                            willChange: 'transform',
                            transition: 'transform 0.7s ease-out',
                        }}
                    />
                    <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
                    <div className="fixed bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none z-0"></div>
                </>
            )}

            {/* Page Content */}
            <div className="relative z-10 w-full flex flex-col min-h-screen">
                {children}
            </div>
        </div>
    );
};

export default GlobalLayout;
