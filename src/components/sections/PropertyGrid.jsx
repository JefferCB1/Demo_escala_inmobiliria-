import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPropiedades } from '../../services/simiApi';
import { formatPrice } from '../../utils/formatters';

const WA_NUMBER = '573009122101';

const PropertyCard = ({ propiedad }) => (
  <div className="flex-shrink-0 w-64 sm:w-72 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:-translate-y-1 flex flex-col">
    <Link to={`/propiedad/${propiedad.id}`} className="block group flex-1">
      <div className="relative h-40 overflow-hidden">
        {propiedad.imagen ? (
          <img
            src={propiedad.imagen}
            alt={`${propiedad.tipo} en ${propiedad.ubicacion}`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full uppercase">
            {propiedad.operacion}
          </span>
        </div>
      </div>

      <div className="p-3">
        <span className="text-lg font-heading font-bold text-gray-900 block group-hover:text-orange-500 transition-colors">
          {formatPrice(propiedad.precio)}
        </span>
        <p className="text-gray-500 text-sm mb-2 line-clamp-1">{propiedad.ubicacion}</p>
        <div className="flex items-center gap-3 text-gray-400 text-xs mb-3">
          {propiedad.area > 0 && <span>{propiedad.area}m²</span>}
          {propiedad.area > 0 && propiedad.habitaciones > 0 && <span>•</span>}
          {propiedad.habitaciones > 0 && <span>{propiedad.habitaciones} Habs</span>}
        </div>
      </div>
    </Link>

    <div className="px-3 pb-3 mt-auto">
      <a
        href={`https://wa.me/${WA_NUMBER}?text=Buen día, me interesa ${propiedad.tipo} en ${propiedad.ubicacion} código ${propiedad.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg font-bold text-center text-sm transition-colors"
      >
        Contactar
      </a>
    </div>
  </div>
);

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-64 sm:w-72 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 animate-pulse">
    <div className="h-40 bg-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-8 bg-gray-200 rounded-lg mt-3" />
    </div>
  </div>
);

const PropertyGrid = () => {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    getPropiedades({ limite: '8' })
      .then(({ propiedades: data }) => setPropiedades(data.slice(0, 8)))
      .catch(() => setPropiedades([]))
      .finally(() => setLoading(false));
  }, []);

  const allCards = propiedades.length > 0
    ? [...propiedades, ...propiedades]
    : Array.from({ length: 8 });

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

        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onTouchCancel={() => setIsPaused(false)}
        >
          <div
            className="flex gap-4 animate-marquee py-2"
            style={{ animationPlayState: isPaused || loading ? 'paused' : 'running' }}
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : allCards.map((propiedad, index) => (
                  <PropertyCard key={`${propiedad.id}-${index}`} propiedad={propiedad} />
                ))
            }
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/propiedades"
            className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 transition-colors"
          >
            Ver todas las propiedades
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
