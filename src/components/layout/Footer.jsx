import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full relative z-10 pt-20 pb-10 border-t border-gray-200 bg-white mt-20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
                <div className="flex flex-col gap-6 col-span-1 md:col-span-1">
                    <img src="/Logo_inmboliaria.png" alt="Escala Inmobiliaria Logo" className="h-[60px] w-auto self-start" />
                    <p className="text-gray-500 text-sm font-medium leading-relaxed">
                        Redefiniendo el estándar inmobiliario. La Ciudad de las Oportunidades al alcance de tu mano.
                    </p>
                    <div className="flex gap-4 mt-2">
                        {/* Social Icons */}
                        <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-escala-accent hover:border-escala-accent hover:text-white transition-all shadow-sm hover:shadow-md">
                            <span className="sr-only">Instagram</span>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                        </a>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="text-escala-dark font-extrabold tracking-wider text-sm uppercase mb-2">Colecciones</h4>
                    <a href="#" className="text-gray-500 font-medium hover:text-escala-accent hover:translate-x-1 transition-all text-sm">Proyectos Nuevos</a>
                    <a href="#" className="text-gray-500 font-medium hover:text-escala-accent hover:translate-x-1 transition-all text-sm">Casas de Lujo</a>
                    <a href="#" className="text-gray-500 font-medium hover:text-escala-accent hover:translate-x-1 transition-all text-sm">Apartamentos Penthouses</a>
                    <a href="#" className="text-gray-500 font-medium hover:text-escala-accent hover:translate-x-1 transition-all text-sm">Oficinas Corporativas</a>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="text-escala-dark font-extrabold tracking-wider text-sm uppercase mb-2">Sedes Privadas</h4>
                    <div className="text-sm bg-slate-50 p-4 rounded-xl border border-gray-100">
                        <strong className="text-escala-dark font-bold block mb-1">Medellín:</strong>
                        <p className="text-gray-600 font-medium">Calle 35 No 81 09 ext 201,<br />Laureles</p>
                    </div>
                    <div className="text-sm bg-slate-50 p-4 rounded-xl border border-gray-100 mt-2">
                        <strong className="text-escala-dark font-bold block mb-1">Sabaneta:</strong>
                        <p className="text-gray-600 font-medium">Carrera 45 # 72 sur - 07 ext 302,<br />Sector Parque</p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h4 className="text-escala-dark font-extrabold tracking-wider text-sm uppercase mb-2">Oportunidades VIP</h4>
                    <p className="text-gray-500 font-medium text-sm mb-2">Recibe propiedades Off-Market directo en tu correo antes de que se publiquen.</p>
                    <div className="flex bg-slate-50 border border-gray-200 rounded-full p-1 focus-within:border-escala-accent focus-within:ring-2 focus-within:ring-escala-accent/20 transition-all shadow-sm">
                        <input type="email" placeholder="Tu correo electrónico" className="bg-transparent border-none outline-none text-escala-dark font-medium px-4 text-sm w-full placeholder-gray-400" />
                        <button className="bg-escala-dark text-white hover:bg-escala-accent rounded-full p-2.5 transition-colors shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-400">
                <p>&copy; {new Date().getFullYear()} Escala Inmobiliaria. Todos los derechos reservados. TAE SAS.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-escala-accent transition-colors">Términos de Servicio</a>
                    <a href="#" className="hover:text-escala-accent transition-colors">Políticas de Privacidad</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
