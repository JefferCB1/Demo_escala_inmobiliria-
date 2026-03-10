import React from 'react';
import LogoLoop from '../ui/LogoLoop';

// h: altura de display en px — ajustada según ratio real de cada imagen
// cien-cuadras 1827x342 ratio 5.34 → h pequeño para que no sea ribbon
// lonja-medellin 896x311 ratio 2.88 → h medio
// metrocuadrado 320x320 ratio 1.00 → cuadrado, necesita h grande
// resto ~ratio 1.7-1.9 → h estándar
const logos = [
  { src: '/Logos/cien-cuadras.png',    alt: 'Cien Cuadras',    href: '#', h: 50  },
  { src: '/Logos/espaciourbano.png',   alt: 'Espacio Urbano',  href: '#', h: 70  },
  { src: '/Logos/FianzaCredito.png',   alt: 'Fianza Credito',  href: '#', h: 70  },
  { src: '/Logos/finca_raiz.png',      alt: 'Finca Raíz',      href: '#', h: 70  },
  { src: '/Logos/libertador.jpg',      alt: 'Libertador',      href: '#', h: 70  },
  { src: '/Logos/lonja-medellin.png',  alt: 'Lonja Medellín',  href: '#', h: 60  },
  { src: '/Logos/metrocuadrado.png',   alt: 'Metro Cuadrado',  href: '#', h: 100 },
  { src: '/Logos/simi.png',            alt: 'Simi',            href: '#', h: 70  },
  { src: '/Logos/Logo-Fenalco.png',   alt: 'Fenalco Antioquia', href: '#', h: 90  },
];

const LogoStrip = () => {
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-escala-dark">
          Aliados Estratégicos
        </h2>
        <p className="text-gray-600 mt-1 text-sm">
          Trabajamos con los mejores portales inmobiliarios
        </p>
      </div>
      
      <div style={{ height: '110px', position: 'relative', overflow: 'hidden' }}>
        <LogoLoop
          logos={logos}
          speed={80}
          direction="left"
          logoHeight={90}
          gap={60}
          pauseOnHover={true}
          ariaLabel="Portales inmobiliarios aliados"
          renderItem={(item) => (
            <div style={{ width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={item.src}
                alt={item.alt ?? ''}
                loading="lazy"
                draggable={false}
                style={{
                  height: `${item.h}px`,
                  width: 'auto',
                  maxWidth: '190px',
                  objectFit: 'contain',
                  opacity: 0.9,
                }}
              />
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default LogoStrip;
