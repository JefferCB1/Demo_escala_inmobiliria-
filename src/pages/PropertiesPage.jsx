import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const propiedades = [
  {
    id: '1272-341',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 2700000,
    ubicacion: 'Prados De Sabaneta, Sabaneta',
    area: 70,
    habitaciones: 3,
    banos: 2,
    parqueadero: 1,
    imagen: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop',
    whatsapp: '573045335855'
  },
  {
    id: '1272-733',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 1800000,
    ubicacion: 'Vereda San Jose, Sabaneta',
    area: 60,
    habitaciones: 3,
    banos: 2,
    parqueadero: 1,
    imagen: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
    whatsapp: '573045335855'
  },
  {
    id: '1272-1053',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 2000000,
    ubicacion: 'La Aldea, La Estrella',
    area: 60,
    habitaciones: 3,
    banos: 2,
    parqueadero: 1,
    imagen: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop',
    whatsapp: '573006175341'
  },
  {
    id: '1272-1898',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 1900000,
    ubicacion: 'Ditaires, Itaguí',
    area: 56,
    habitaciones: 3,
    banos: 2,
    parqueadero: 1,
    imagen: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=2070&auto=format&fit=crop',
    whatsapp: '573045335855'
  },
  {
    id: '1272-398',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 1500000,
    ubicacion: 'Vereda San Jose, Sabaneta',
    area: 63,
    habitaciones: 2,
    banos: 2,
    parqueadero: 1,
    imagen: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=2070&auto=format&fit=crop',
    whatsapp: '573243233394'
  },
  {
    id: '1272-1051',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 1850000,
    ubicacion: 'Villas Del Carmen, Sabaneta',
    area: 60,
    habitaciones: 2,
    banos: 2,
    parqueadero: 0,
    imagen: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
    whatsapp: '573045335855'
  },
  {
    id: '1272-1048',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 3000000,
    ubicacion: 'Las Flores, Envigado',
    area: 70,
    habitaciones: 2,
    banos: 2,
    parqueadero: 1,
    imagen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    whatsapp: '573006175341'
  },
  {
    id: '1272-396',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 2000000,
    ubicacion: 'El Carmelo, Sabaneta',
    area: 65,
    habitaciones: 3,
    banos: 2,
    parqueadero: 1,
    imagen: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=1984&auto=format&fit=crop',
    whatsapp: '573045335855'
  },
  {
    id: '1272-470',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 2800000,
    ubicacion: 'Los Alcazares, Sabaneta',
    area: 78,
    habitaciones: 2,
    banos: 2,
    parqueadero: 1,
    imagen: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop',
    whatsapp: '573045335855'
  },
  {
    id: '1272-395',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 2000000,
    ubicacion: 'Las Lomitas, Sabaneta',
    area: 65,
    habitaciones: 3,
    banos: 2,
    parqueadero: 1,
    imagen: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=80&w=2070&auto=format&fit=crop',
    whatsapp: '573045335855'
  },
  {
    id: '1272-727',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 3200000,
    ubicacion: 'Suramérica, Itaguí',
    area: 90,
    habitaciones: 3,
    banos: 2,
    parqueadero: 1,
    imagen: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop',
    whatsapp: '573243233394'
  },
  {
    id: '1272-394',
    tipo: 'Apartaestudio',
    operacion: 'Arriendo',
    precio: 2300000,
    ubicacion: 'Los Alcazares, Sabaneta',
    area: 60,
    habitaciones: 1,
    banos: 2,
    parqueadero: 1,
    imagen: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop',
    whatsapp: '573045335855'
  },
  {
    id: '1272-469',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 2400000,
    ubicacion: 'Suramérica, Itaguí',
    area: 80,
    habitaciones: 3,
    banos: 2,
    parqueadero: 1,
    imagen: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070&auto=format&fit=crop',
    whatsapp: '573045335855'
  },
  {
    id: '1272-468',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 2850000,
    ubicacion: 'Los Alcazares, Sabaneta',
    area: 85,
    habitaciones: 2,
    banos: 2,
    parqueadero: 2,
    imagen: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=2070&auto=format&fit=crop',
    whatsapp: '573045335855'
  },
  {
    id: '1272-391',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 2200000,
    ubicacion: 'Las Lomitas, Sabaneta',
    area: 63,
    habitaciones: 2,
    banos: 2,
    parqueadero: 1,
    imagen: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2070&auto=format&fit=crop',
    whatsapp: '573243233394'
  },
  {
    id: '1272-725',
    tipo: 'Apartamento',
    operacion: 'Arriendo',
    precio: 1450000,
    ubicacion: 'Loma San Jose, Sabaneta',
    area: 63,
    habitaciones: 2,
    banos: 2,
    parqueadero: 1,
    imagen: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    whatsapp: '573243233394'
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

const PropertiesPage = () => {
  const navigate = useNavigate();
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterOperacion, setFilterOperacion] = useState('todos');
  const [filterUbicacion, setFilterUbicacion] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProperties = propiedades.filter(prop => {
    const matchesTipo = filterTipo === 'todos' || prop.tipo.toLowerCase().includes(filterTipo.toLowerCase());
    const matchesOperacion = filterOperacion === 'todos' || prop.operacion.toLowerCase() === filterOperacion.toLowerCase();
    const matchesUbicacion = filterUbicacion === 'todos' || prop.ubicacion.toLowerCase().includes(filterUbicacion.toLowerCase());
    const matchesSearch = searchTerm === '' || 
      prop.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.id.includes(searchTerm);
    return matchesTipo && matchesOperacion && matchesUbicacion && matchesSearch;
  });

  const ubicaciones = [...new Set(propiedades.map(p => p.ubicacion.split(', ')[1] || p.ubicacion.split(', ')[0]))];

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section - matching main page aesthetic */}
      <div className="relative pt-28 pb-16 px-4 overflow-hidden bg-slate-50">
        {/* Background Video with Soft Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-100">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-100"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-aerial-panorama-of-a-city-4328-large.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-slate-50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="inline-block px-4 py-1.5 bg-orange-100 text-escala-accent rounded-full text-sm font-bold mb-6 border border-orange-200 uppercase tracking-widest shadow-sm">
            Portafolio Exclusivo
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-escala-dark mb-4">
            Nuestras <span className="text-escala-accent">Propiedades</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl font-medium">
            Explora nuestra colección de propiedades en Medellín, Sabaneta, Itaguí, Envigado y más.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="shadow-md border-b border-gray-100 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Smart Search Bar Style */}
          <div className="bg-white rounded-full p-2 pl-6 pr-2 flex flex-col md:flex-row items-center shadow-xl relative overflow-visible border border-gray-100 gap-2">
            {/* Search Input */}
            <div className="flex-1 flex py-2 w-full min-w-[200px]">
              <svg className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por ubicación, tipo o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-escala-dark placeholder-gray-400 outline-none font-medium"
              />
            </div>

            {/* Filter Buttons Group */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Tipo */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-escala-accent hover:bg-orange-50 transition-all duration-200 text-sm font-medium text-gray-600">
                  <span>{filterTipo === 'todos' ? 'Tipo' : filterTipo}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button onClick={() => setFilterTipo('todos')} className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors ${filterTipo === 'todos' ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}>Todos los Tipos</button>
                  <button onClick={() => setFilterTipo('apartamento')} className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors ${filterTipo === 'apartamento' ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}>Apartamento</button>
                  <button onClick={() => setFilterTipo('apartaestudio')} className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors ${filterTipo === 'apartaestudio' ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}>Apartaestudio</button>
                  <button onClick={() => setFilterTipo('casa')} className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors ${filterTipo === 'casa' ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}>Casa</button>
                </div>
              </div>

              {/* Operación */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-escala-accent hover:bg-orange-50 transition-all duration-200 text-sm font-medium text-gray-600">
                  <span>{filterOperacion === 'todos' ? 'Operación' : filterOperacion}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button onClick={() => setFilterOperacion('todos')} className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors ${filterOperacion === 'todos' ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}>Todas las Operaciones</button>
                  <button onClick={() => setFilterOperacion('arriendo')} className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors ${filterOperacion === 'arriendo' ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}>Arriendo</button>
                  <button onClick={() => setFilterOperacion('venta')} className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors ${filterOperacion === 'venta' ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}>Venta</button>
                </div>
              </div>

              {/* Ubicación */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:border-escala-accent hover:bg-orange-50 transition-all duration-200 text-sm font-medium text-gray-600">
                  <span>{filterUbicacion === 'todos' ? 'Ubicación' : filterUbicacion}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 max-h-64 overflow-y-auto opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button onClick={() => setFilterUbicacion('todos')} className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors ${filterUbicacion === 'todos' ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}>Todas las Ubicaciones</button>
                  {ubicaciones.map(ubicacion => (
                    <button key={ubicacion} onClick={() => setFilterUbicacion(ubicacion)} className={`w-full text-left px-4 py-2.5 hover:bg-orange-50 transition-colors ${filterUbicacion === ubicacion ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}>{ubicacion}</button>
                  ))}
                </div>
              </div>

              {/* Search Button */}
              <button className="bg-escala-accent hover:bg-[#e66000] text-white px-6 py-2.5 rounded-full font-bold transition-all duration-300 shadow-[0_4px_15px_rgba(255,107,0,0.4)] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Buscar</span>
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-500 mt-3 text-center md:text-left">
            {filteredProperties.length} propiedades encontradas
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((propiedad) => (
              <div 
                key={propiedad.id} 
                onClick={() => navigate(`/propiedad/${propiedad.id}`)}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1 cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={propiedad.imagen}
                    alt={`${propiedad.tipo} en ${propiedad.ubicacion}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-escala-accent text-white text-xs font-bold rounded-full uppercase tracking-wider">
                      {propiedad.operacion}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-escala-dark/80 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                      {propiedad.tipo}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded">
                      Código: {propiedad.id}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-heading font-bold text-escala-dark line-clamp-1">
                      {propiedad.tipo}
                    </h3>
                    <span className="text-lg font-heading font-black text-escala-accent">
                      {formatPrice(propiedad.precio)}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-1">{propiedad.ubicacion}</span>
                  </p>

                  {/* Features */}
                  <div className="flex items-center gap-3 text-gray-400 text-xs mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      {propiedad.area}m²
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {propiedad.habitaciones} Habs
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                      {propiedad.banos} Baños
                    </span>
                  </div>

                  {/* WhatsApp Button */}
                  <a
                    href={`https://wa.me/${propiedad.whatsapp}?text=Buen día, me interesa ${propiedad.tipo} en ${propiedad.ubicacion} código ${propiedad.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-escala-accent hover:bg-orange-600 text-white py-2.5 px-4 rounded-xl font-bold text-center transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Contactar
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-heading font-bold text-gray-700 mb-2">No se encontraron propiedades</h3>
            <p className="text-gray-500">Intenta con otros filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;
