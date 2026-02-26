import React, { useState, useEffect } from 'react';

export const StickyBottomBar = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling past the hero section
            if (window.scrollY > window.innerHeight * 0.5) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] transition-all duration-500 animate-[slideUp_0.5s_ease-out]">
            <div className="w-full flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">¿Tienes Dudas?</span>
                    <span className="text-escala-dark font-extrabold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
                        Asesor en línea
                    </span>
                </div>
                <button className="bg-escala-accent hover:bg-[#e66000] text-white px-6 py-3 rounded-xl font-bold shadow-[0_4px_15px_rgba(255,107,0,0.4)] flex items-center gap-2 active:scale-95 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    Contactar
                </button>
            </div>
        </div>
    );
};
