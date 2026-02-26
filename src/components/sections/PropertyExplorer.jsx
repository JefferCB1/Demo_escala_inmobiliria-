import React from 'react';
import BentoCard from '../ui/BentoCard';

const sedes = [
  {
    id: 'medellin',
    nombre: 'Sede Medellín',
    direccion: 'Calle 35 No 81 09 interior 201, Laureles',
    telefono: '3009122101',
    lineas: {
      solicitudes: '3207686365',
      reparaciones: '3008913228',
      servicios: '3244358376',
      facturacion: '3004155950'
    },
    imagen: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop',
    color: 'from-emerald-600 to-teal-800'
  },
  {
    id: 'sabaneta',
    nombre: 'Sede Sabaneta',
    direccion: 'Carrera 45 # 72 sur - 07, Sector Parque',
    telefono: '3009122101',
    lineas: {
      cartera: '3045335318',
      reparaciones: '3008913228',
      servicios: '3005759048'
    },
    imagen: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop',
    color: 'from-orange-500 to-red-700'
  }
];

const PropertyExplorer = () => {
    return (
        <section className="relative w-full pt-24 pb-8 px-6 z-10 overflow-hidden">
            {/* Background similar to Hero */}
            <div className="absolute inset-0 z-0 bg-slate-100">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-30"
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-aerial-panorama-of-a-city-4328-large.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-slate-50"></div>
            </div>
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-heading font-extrabold text-escala-dark mb-4 tracking-tight">
                            Nuestras <span className="text-escala-accent">Sedes</span>
                        </h2>
                        <p className="text-gray-600 font-medium max-w-lg">
                            Visítanos en cualquiera de nuestras ubicaciones. Te esperamos para atenderte personalmente.
                        </p>
                    </div>
                </div>

                {/* Sedes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sedes.map((sede) => (
                        <BentoCard key={sede.id} className="relative group overflow-hidden p-0 border-0 shadow-xl">
                            <img
                                src={sede.imagen}
                                alt={sede.nombre}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-br ${sede.color} opacity-90`}></div>
                            
                            <div className="relative z-10 p-8 h-full flex flex-col justify-between min-h-[380px]">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-3xl font-heading font-black text-white mb-2">{sede.nombre}</h3>
                                    <p className="text-white/80 font-medium flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        {sede.direccion}
                                    </p>
                                </div>

                                <div className="space-y-3 mt-6">
                                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Líneas de Atención</p>
                                        <a href={`tel:${sede.telefono}`} className="block text-white font-semibold hover:text-orange-200 transition-colors">
                                            📞 {sede.telefono}
                                        </a>
                                    </div>

                                    <div className="flex gap-2">
                                        <a 
                                            href={`https://simidocs.siminmobiliarias.com/base/simired/simidocsapi1.0/index.php?inmo=${sede.id === 'medellin' ? '1145' : '1272'}&tipo=1`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-white text-gray-900 py-3 px-4 rounded-xl font-bold text-center hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            Propietarios
                                        </a>
                                        <a 
                                            href={`https://simidocs.siminmobiliarias.com/base/simired/simidocsapi1.0/index.php?inmo=${sede.id === 'medellin' ? '1145' : '1272'}&tipo=2`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-white text-gray-900 py-3 px-4 rounded-xl font-bold text-center hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            Arrendatarios
                                        </a>
                                    </div>

                                    <a 
                                        href={`https://pagos.palomma.com/${sede.id === 'medellin' ? 'escalainmobiliariamedellin' : 'escalainmobiliariasabaneta'}/auth/login`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full bg-escala-accent hover:bg-orange-600 text-white py-3 px-4 rounded-xl font-bold text-center transition-colors"
                                    >
                                        Realizar Pagos →
                                    </a>
                                </div>
                            </div>
                        </BentoCard>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PropertyExplorer;
