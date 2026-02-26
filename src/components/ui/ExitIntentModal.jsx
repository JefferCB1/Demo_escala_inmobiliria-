import React, { useState, useEffect } from 'react';

export const ExitIntentModal = () => {
    const [show, setShow] = useState(false);
    const [hasShown, setHasShown] = useState(false);

    useEffect(() => {
        const mouseEvent = e => {
            const shouldShowExitIntent =
                !hasShown &&
                e.clientY <= 0 &&
                e.movementY < 0;

            if (shouldShowExitIntent) {
                setShow(true);
                setHasShown(true);
            }
        };

        document.addEventListener('mouseleave', mouseEvent);
        return () => document.removeEventListener('mouseleave', mouseEvent);
    }, [hasShown]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
            <div className="bg-white border-4 border-escala-accent/20 rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-[slideUp_0.3s_ease-out]">
                <button
                    onClick={() => setShow(false)}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 transition-colors bg-gray-100 rounded-full p-1"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div className="text-center mb-6">
                    <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 animate-pulse">¡Oportunidad Única!</span>
                    <h3 className="text-3xl font-heading font-extrabold text-escala-dark mb-2 leading-tight">
                        ¿Te vas tan <span className="text-escala-accent">Pronto?</span>
                    </h3>
                    <p className="text-gray-600 font-medium leading-relaxed">Las mejores propiedades off-market se venden en días. Déjanos tus datos y te enviaremos opciones VIP antes de que se publiquen.</p>
                </div>

                <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setShow(false); }}>
                    <input
                        type="text"
                        placeholder="Tu Nombre"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3.5 text-escala-dark placeholder-gray-400 outline-none focus:border-escala-accent focus:ring-2 focus:ring-escala-accent/20 transition-all font-medium"
                    />
                    <input
                        type="tel"
                        placeholder="WhatsApp (ej. +57 300...)"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3.5 text-escala-dark placeholder-gray-400 outline-none focus:border-escala-accent focus:ring-2 focus:ring-escala-accent/20 transition-all font-medium"
                    />
                    <button type="submit" className="w-full bg-escala-accent text-white font-bold py-4 rounded-xl hover:bg-[#e66000] hover:shadow-lg hover:-translate-y-0.5 transition-all mt-2 text-lg shadow-md">
                        Recibir Opciones VIP
                    </button>
                </form>
                <p className="text-center text-xs text-gray-400 font-medium mt-5 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    Tus datos están %100 seguros. Cero spam.
                </p>
            </div>
        </div>
    );
};
