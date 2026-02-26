import React from 'react';
import BentoCard from '../ui/BentoCard';

const Testimonials = () => {
    const endorsements = [
        {
            text: "El proceso de arrendamiento de mi apartamento en Sabaneta fue impecable. Filtraron muy bien a los posibles inquilinos.",
            author: "María Fernández",
            role: "Propietaria",
            avatar: "https://i.pravatar.cc/150?img=47"
        },
        {
            text: "Encontré un penthouse en Laureles que no estaba en ningún otro portal. La asesoría de inversión fue clave para decidirme.",
            author: "Carlos Restrepo",
            role: "Inversionista",
            avatar: "https://i.pravatar.cc/150?img=11"
        },
        {
            text: "La administración de mis propiedades es 100% transparente. Recibo mis reportes a tiempo y no me preocupo por el mantenimiento.",
            author: "Diego Jaramillo",
            role: "Cliente VIP",
            avatar: "https://i.pravatar.cc/150?img=33"
        }
    ];

    return (
        <section className="w-full py-24 px-6 relative z-10 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-escala-dark mb-4 tracking-tight">
                        Confianza que genera <span className="text-escala-accent">Valor</span>
                    </h2>
                    <p className="text-gray-600 font-medium max-w-2xl mx-auto">
                        Más que transacciones, construimos relaciones a largo plazo con nuestros propietarios e inversionistas garantizando seguridad y rentabilidad.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {endorsements.map((item, index) => (
                        <BentoCard key={index} className="flex flex-col justify-between h-full hover:-translate-y-2 transition-transform duration-500 bg-slate-50 border border-gray-100 shadow-md">
                            <div>
                                {/* Rating Stars */}
                                <div className="flex gap-1 mb-6 text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-6 h-6 fill-current drop-shadow-sm" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-gray-700 text-lg mb-8 font-medium italic leading-relaxed">"{item.text}"</p>
                            </div>

                            <div className="flex items-center gap-4 mt-auto">
                                <img src={item.avatar} alt={item.author} className="w-14 h-14 rounded-full border-2 border-white shadow-sm" />
                                <div>
                                    <h4 className="text-escala-dark font-bold text-lg">{item.author}</h4>
                                    <p className="text-escala-accent text-sm font-semibold uppercase tracking-wide">{item.role}</p>
                                </div>
                            </div>
                        </BentoCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
