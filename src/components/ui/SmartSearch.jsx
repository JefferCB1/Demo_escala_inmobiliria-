import React from 'react';

export const SmartSearch = () => {
    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 sm:px-0">
            {/* Commercial Bright Search Bar */}
            <div className="w-full bg-white rounded-3xl sm:rounded-full p-3 sm:p-2.5 flex flex-col sm:flex-row items-center shadow-2xl relative overflow-hidden border border-gray-100">
                <div className="flex-1 flex px-3 sm:px-6 py-2 w-full">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Ej: Proyecto Nuevo en Sabaneta..."
                        className="w-full bg-transparent text-escala-dark placeholder-gray-400 outline-none text-sm sm:text-lg font-medium"
                    />
                </div>
                <button className="w-full sm:w-auto bg-escala-accent hover:bg-[#e66000] text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 rounded-2xl sm:rounded-full font-bold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-[0_4px_15px_rgba(255,107,0,0.4)] mt-1 sm:mt-0">
                    Buscar
                </button>
            </div>
        </div>
    );
};
