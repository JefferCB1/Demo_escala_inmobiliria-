import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { propiedades as allPropiedades } from '../../data/properties';
import { formatPrice } from '../../utils/formatters';

// Show only the first 5 on the home page marquee
const propiedades = allPropiedades.slice(0, 5);

const PropertyCard = ({ propiedad }) => (
  <div className="flex-shrink-0 w-64 sm:w-72 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:-translate-y-1 flex flex-col">
    <Link to={`/propiedad/${propiedad.id}`} className="block group flex-1">
      <div className="relative h-40 overflow-hidden">
        <img
          src={propiedad.imagen}
          alt={`${propiedad.tipo} en ${propiedad.ubicacion}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
            Arriendo
          </span>
        </div>
      </div>

      <div className="p-3">
        <span className="text-lg font-heading font-bold text-gray-900 block group-hover:text-orange-500 transition-colors">
          {formatPrice(propiedad.precio)}
        </span>
        <p className="text-gray-500 text-sm mb-2">{propiedad.ubicacion}</p>
        
        <div className="flex items-center gap-3 text-gray-400 text-xs mb-3">
          <span>{propiedad.area}m²</span>
          <span>•</span>
          <span>{propiedad.habitaciones} Habs</span>
        </div>
      </div>
    </Link>

    <div className="px-3 pb-3 mt-auto">
      <a
        href={`https://wa.me/${propiedad.whatsapp}?text=Buen día, me interesa ${propiedad.tipo} en ${propiedad.ubicacion} código ${propiedad.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg font-bold text-center text-sm transition-colors"
      >
        Contactar
      </a>
    </div>
  </div>
);

const PropertyGrid = () => {
  // Duplicate cards for seamless infinite loop
  const allCards = [...propiedades, ...propiedades];
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="relative w-full py-12 px-4 sm:px-6 z-10 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-gray-900 mb-3">
            Nuestras <span className="text-orange-500">Propiedades</span>
          </h2>
          <p className="text-gray-600 font-medium max-w-xl mx-auto">
            Explora nuestra colección de propiedades en Medellín, Sabaneta, Itaguí, Envigado y más.
          </p>
        </div>

        {/* Auto-scrolling Marquee */}
        <div 
          className="relative overflow-visible"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onTouchCancel={() => setIsPaused(false)}
        >
          <div 
            className="flex gap-4 animate-marquee py-2"
            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
          >
            {allCards.map((propiedad, index) => (
              <PropertyCard key={`${propiedad.id}-${index}`} propiedad={propiedad} />
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link 
            to="/propiedades"
            className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 transition-colors"
          >
            Ver todos los apartamentos
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PropertyGrid;

