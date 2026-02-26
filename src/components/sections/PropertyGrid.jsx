import React from 'react';
import { Link } from 'react-router-dom';

const propiedades = [
  {
    id: '1272-341',
    tipo: 'Apartamento',
    precio: 2700000,
    ubicacion: 'Prados De Sabaneta',
    area: 70,
    habitaciones: 3,
    imagen: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=400&auto=format&fit=crop',
    whatsapp: '573045335855'
  },
  {
    id: '1272-733',
    tipo: 'Apartamento',
    precio: 1800000,
    ubicacion: 'Vereda San Jose',
    area: 60,
    habitaciones: 3,
    imagen: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=400&auto=format&fit=crop',
    whatsapp: '573045335855'
  },
  {
    id: '1272-1053',
    tipo: 'Apartamento',
    precio: 2000000,
    ubicacion: 'La Aldea',
    area: 60,
    habitaciones: 3,
    imagen: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=400&auto=format&fit=crop',
    whatsapp: '573006175341'
  },
  {
    id: '1272-470',
    tipo: 'Apartamento',
    precio: 2800000,
    ubicacion: 'Los Alcazares',
    area: 78,
    habitaciones: 2,
    imagen: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=400&auto=format&fit=crop',
    whatsapp: '573045335855'
  },
  {
    id: '1272-1048',
    tipo: 'Apartamento',
    precio: 3000000,
    ubicacion: 'Las Flores',
    area: 70,
    habitaciones: 2,
    imagen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop',
    whatsapp: '573006175341'
  }
];

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

const PropertyCard = ({ propiedad }) => (
  <div className="flex-shrink-0 w-64 sm:w-72 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:-translate-y-1">
    <div className="relative h-40">
      <img
        src={propiedad.imagen}
        alt={`${propiedad.tipo} en ${propiedad.ubicacion}`}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-2 left-2">
        <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
          Arriendo
        </span>
      </div>
    </div>

    <div className="p-3">
      <span className="text-lg font-heading font-bold text-gray-900 block">
        {formatPrice(propiedad.precio)}
      </span>
      <p className="text-gray-500 text-sm mb-2">{propiedad.ubicacion}</p>
      
      <div className="flex items-center gap-3 text-gray-400 text-xs mb-3">
        <span>{propiedad.area}m²</span>
        <span>•</span>
        <span>{propiedad.habitaciones} Habs</span>
      </div>

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
        <div className="relative">
          <div className="flex gap-4 animate-marquee py-2">
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

