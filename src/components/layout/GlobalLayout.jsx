import React, { useEffect, useRef } from 'react';

const GlobalLayout = ({ children }) => {
    const highlightRef = useRef(null);

    useEffect(() => {
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
            {/* Subtle light mesh background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.4] z-0"
                style={{
                    backgroundImage: `radial-gradient(#e2e8f0 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* Pointer-trailing soft highlight — DOM-only update, no React re-render */}
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

            {/* Static bright ambient lights */}
            <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none z-0"></div>
            <div className="fixed bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none z-0"></div>

            {/* Page Content */}
            <div className="relative z-10 w-full flex flex-col min-h-screen">
                {children}
            </div>
        </div>
    );
};

export default GlobalLayout;
