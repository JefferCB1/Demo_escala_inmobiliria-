import React from 'react';

const sedes = [
  {
    id: 'medellin',
    nombre: 'Sede Medellín',
    direccion: 'Calle 35 No 81 09 interior 201, Laureles',
    telefono: '3009122101',
    lineas: {
      general: '3009122101',
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
    direccion: 'Carrera 45 # 72 sur - 07 interior 302, Sector Parque',
    telefono: '3009122101',
    lineas: {
      general: '3009122101',
      cartera: '3045335318',
      reparaciones: '3008913228',
      servicios: '3005759048'
    },
    imagen: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop',
    color: 'from-orange-500 to-red-700'
  }
];

const SedeCard = ({ sede }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500">
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        <img 
          src={sede.imagen} 
          alt={sede.nombre}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${sede.color} opacity-90`}></div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 p-6 sm:p-8 h-full flex flex-col justify-between min-h-[400px] text-center sm:text-left">
        {/* Header */}
        <div>
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-wider">
              {sede.nombre.includes('Medellín') ? 'Zona Norte' : 'Zona Sur'}
            </span>
          </div>
          
          <h3 className="text-2xl sm:text-3xl font-heading font-black text-white mb-2">{sede.nombre}</h3>
          <p className="text-white/80 font-medium flex items-center justify-center sm:justify-start gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {sede.direccion}
          </p>
        </div>

        {/* Información de contacto */}
        <div className="space-y-3 mt-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Líneas de Atención</p>
            <div className="space-y-1">
              <a href={`tel:${sede.lineas.general}`} className="block text-white font-semibold hover:text-escala-accent transition-colors">
                📞 {sede.lineas.general}
              </a>
            </div>
          </div>

          <div className="flex gap-2">
            <a 
              href={`https://simidocs.siminmobiliarias.com/base/simired/simidocsapi1.0/index.php?inmo=${sede.id === 'medellin' ? '1145' : '1272'}&tipo=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-white text-gray-900 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-sm sm:text-base text-center hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Propietarios
            </a>
            <a 
              href={`https://simidocs.siminmobiliarias.com/base/simired/simidocsapi1.0/index.php?inmo=${sede.id === 'medellin' ? '1145' : '1272'}&tipo=2`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-white text-gray-900 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-sm sm:text-base text-center hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
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
    </div>
  );
};

const Sedes = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-escala-dark mb-4">
            Nuestras <span className="text-escala-accent">Sedes</span>
          </h2>
          <p className="text-gray-600 font-medium max-w-2xl mx-auto">
            Visítanos en cualquiera de nuestras ubicaciones. Te esperamos para atenderte personalmente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {sedes.map((sede) => (
            <SedeCard key={sede.id} sede={sede} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sedes;
