import React from 'react';
import LogoLoop from '../ui/LogoLoop';

const logos = [
  { src: '/Logos/cien-cuadras.png', alt: 'Cien Cuadras', href: '#' },
  { src: '/Logos/espaciourbano.png', alt: 'Espacio Urbano', href: '#' },
  { src: '/Logos/FianzaCredito.png', alt: 'Fianza Credito', href: '#' },
  { src: '/Logos/finca_raiz.png', alt: 'Finca Raiz', href: '#' },
  { src: '/Logos/libertador.jpg', alt: 'Libertador', href: '#' },
  { src: '/Logos/lonja-medellin.png', alt: 'Lonja Medellin', href: '#' },
  { src: '/Logos/metrocuadrado.png', alt: 'Metro Cuadrado', href: '#' },
  { src: '/Logos/simi.png', alt: 'Simi', href: '#' },
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
      
      <div style={{ height: '100px', position: 'relative', overflow: 'hidden' }}>
        <LogoLoop
          logos={logos}
          speed={80}
          direction="left"
          logoHeight={70}
          gap={80}
          pauseOnHover={true}
          ariaLabel="Portales inmobiliarios aliados"
        />
      </div>
    </div>
  );
};

export default LogoStrip;
