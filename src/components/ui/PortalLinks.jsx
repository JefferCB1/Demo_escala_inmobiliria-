import React, { useState } from 'react';
import { KeyRound, Users } from 'lucide-react';

const portals = [
  {
    id: 'propietarios',
    label: 'Propietarios',
    icon: <KeyRound className="w-10 h-10 text-escala-dark group-hover:text-escala-accent transition-colors duration-300" strokeWidth={1.5} />,
    sedes: [
      { label: 'Sede Medellín', url: 'https://simidocs.siminmobiliarias.com/base/simired/simidocsapi1.0/index.php?inmo=1145&tipo=1' },
      { label: 'Sede Sabaneta', url: 'https://simidocs.siminmobiliarias.com/base/simired/simidocsapi1.0/index.php?inmo=1272&tipo=1' },
    ],
  },
  {
    id: 'arrendatarios',
    label: 'Arrendatarios',
    icon: <Users className="w-10 h-10 text-escala-dark group-hover:text-escala-accent transition-colors duration-300" strokeWidth={1.5} />,
    sedes: [
      { label: 'Sede Medellín', url: 'https://simidocs.siminmobiliarias.com/base/simired/simidocsapi1.0/index.php?inmo=1145&tipo=2' },
      { label: 'Sede Sabaneta', url: 'https://simidocs.siminmobiliarias.com/base/simired/simidocsapi1.0/index.php?inmo=1272&tipo=2' },
    ],
  },
  {
    id: 'pagos',
    label: 'Pagos en Línea',
    icon: (
      <div className="flex items-center gap-1">
        <div className="grid grid-cols-3 gap-[2px]">
          {[...Array(9)].map((_, i) => (
            <div key={i} className={`w-1 h-1 rounded-full ${i % 2 === 0 ? 'bg-yellow-400' : 'bg-escala-accent'}`}></div>
          ))}
        </div>
        <span className="font-heading font-black text-xl italic text-[#003876]">pse</span>
      </div>
    ),
    sedes: [
      { label: 'Sede Medellín', url: 'https://pagos.palomma.com/escalainmobiliariamedellin/auth/login' },
      { label: 'Sede Sabaneta', url: 'https://pagos.palomma.com/escalainmobiliariasabaneta/auth/login' },
    ],
  },
];

const PortalLinks = () => {
  const [open, setOpen] = useState(null);

  const toggle = (id) => setOpen(open === id ? null : id);

  return (
    <section className="w-full pt-4 pb-16 relative z-10 overflow-hidden">
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

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
          {portals.map((portal) => (
            <div key={portal.id} className="relative flex flex-col items-center">
              <div
                className="flex flex-col items-center justify-center p-6 group cursor-pointer"
                onClick={() => toggle(portal.id)}
              >
                <div className="relative mb-4 w-24 h-24 flex items-center justify-center rounded-full border-2 border-gray-200 bg-white transition-all duration-300 group-hover:border-escala-accent group-hover:shadow-[0_0_20px_rgba(255,102,0,0.3)] group-hover:-translate-y-2">
                  <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-escala-accent/30 scale-90 group-hover:scale-110 transition-transform duration-500"></div>
                  {portal.icon}
                  {portal.id === 'pagos' && (
                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-escala-accent rounded-full border-2 border-white flex items-center justify-center z-10 animate-bounce">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-escala-accent font-bold text-lg">{portal.label}</span>
              </div>

              {/* Dropdown sede selector */}
              {open === portal.id && (
                <div className="absolute top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 w-48">
                  {portal.sedes.map((sede) => (
                    <a
                      key={sede.label}
                      href={sede.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-escala-accent hover:text-white transition-colors"
                      onClick={() => setOpen(null)}
                    >
                      {sede.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortalLinks;
