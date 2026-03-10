import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { propiedades } from '../data/properties';
import { formatPrice } from '../utils/formatters';

// Dropdown controlado con click — funciona en touch y desktop
const FilterSelect = ({ label, value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const activeLabel = options.find(o => o.value === value)?.label ?? label;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${
          value !== 'todos'
            ? 'border-escala-accent bg-orange-50 text-escala-accent'
            : 'border-gray-200 text-gray-600 bg-white hover:border-escala-accent hover:bg-orange-50'
        }`}
      >
        <span>{activeLabel}</span>
        <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 min-w-[160px] bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onMouseDown={() => { onChange(opt.value); setOpen(false); }}
              onTouchEnd={(e) => { e.preventDefault(); onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-orange-50 ${
                value === opt.value ? 'text-escala-accent font-semibold' : 'text-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PropertiesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterOperacion, setFilterOperacion] = useState('todos');
  const [filterUbicacion, setFilterUbicacion] = useState('todos');
  const [filterHabitaciones, setFilterHabitaciones] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Apply URL params from SmartSearch
  useEffect(() => {
    const operacion = searchParams.get('operacion');
    const tipo = searchParams.get('tipo');
    const ciudad = searchParams.get('ciudad');
    const habitaciones = searchParams.get('habitaciones');
    if (operacion) setFilterOperacion(operacion);
    if (tipo) setFilterTipo(tipo);
    if (ciudad) setFilterUbicacion(ciudad);
    if (habitaciones) setFilterHabitaciones(habitaciones);
  }, [searchParams]);

  const filteredProperties = propiedades.filter(prop => {
    const matchesTipo = filterTipo === 'todos' || prop.tipo.toLowerCase().includes(filterTipo.toLowerCase());
    const matchesOperacion = filterOperacion === 'todos' || prop.operacion.toLowerCase() === filterOperacion.toLowerCase();
    const matchesUbicacion = filterUbicacion === 'todos' || prop.ubicacion.toLowerCase().includes(filterUbicacion.toLowerCase());
    const matchesHabitaciones = filterHabitaciones === 'todos' ||
      (filterHabitaciones === '3+' ? prop.habitaciones >= 3 : prop.habitaciones === parseInt(filterHabitaciones));
    const matchesSearch = searchTerm === '' ||
      prop.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.id.includes(searchTerm);
    return matchesTipo && matchesOperacion && matchesUbicacion && matchesHabitaciones && matchesSearch;
  });

  const ubicaciones = [...new Set(propiedades.map(p => p.ubicacion.split(', ')[1] || p.ubicacion.split(', ')[0]))];

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Propiedades en Arriendo y Venta - Escala Inmobiliaria',
    description: 'Catálogo de propiedades en Medellín, Sabaneta, Itaguí, Envigado y más municipios del Valle de Aburrá.',
    url: 'https://escalainmobiliaria.com.co/propiedades',
    numberOfItems: propiedades.length,
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Propiedades en Arriendo y Venta | Escala Inmobiliaria Medellín</title>
        <meta name="description" content="Encuentra apartamentos, casas y apartaestudios en arriendo y venta en Medellín, Sabaneta, Itaguí y Envigado. Más de 100 propiedades disponibles con asesoría personalizada." />
        <link rel="canonical" href="https://escalainmobiliaria.com.co/propiedades" />
        <meta property="og:title" content="Propiedades en Arriendo y Venta | Escala Inmobiliaria" />
        <meta property="og:description" content="Explora nuestro portafolio de propiedades en el área metropolitana de Medellín." />
        <meta property="og:url" content="https://escalainmobiliaria.com.co/propiedades" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

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
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">

          {/* Search input — full width always */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 mb-3">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por ubicación, tipo o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-escala-dark placeholder-gray-400 outline-none text-sm font-medium"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filters row — scrollable en móvil */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <FilterSelect
              label="Tipo"
              value={filterTipo}
              onChange={setFilterTipo}
              options={[
                { value: 'todos', label: 'Tipo' },
                { value: 'apartamento', label: 'Apartamento' },
                { value: 'apartaestudio', label: 'Apartaestudio' },
                { value: 'casa', label: 'Casa' },
                { value: 'oficina', label: 'Oficina' },
              ]}
            />
            <FilterSelect
              label="Operación"
              value={filterOperacion}
              onChange={setFilterOperacion}
              options={[
                { value: 'todos', label: 'Operación' },
                { value: 'arriendo', label: 'Arriendo' },
                { value: 'venta', label: 'Venta' },
              ]}
            />
            <FilterSelect
              label="Ubicación"
              value={filterUbicacion}
              onChange={setFilterUbicacion}
              options={[
                { value: 'todos', label: 'Ubicación' },
                ...ubicaciones.map(u => ({ value: u, label: u })),
              ]}
            />
            <FilterSelect
              label="Habs"
              value={filterHabitaciones}
              onChange={setFilterHabitaciones}
              options={[
                { value: 'todos', label: 'Habs' },
                { value: '1', label: '1 hab' },
                { value: '2', label: '2 habs' },
                { value: '3+', label: '3+ habs' },
              ]}
            />

            {/* Limpiar filtros — solo si hay alguno activo */}
            {(filterTipo !== 'todos' || filterOperacion !== 'todos' || filterUbicacion !== 'todos' || filterHabitaciones !== 'todos') && (
              <button
                onClick={() => { setFilterTipo('todos'); setFilterOperacion('todos'); setFilterUbicacion('todos'); setFilterHabitaciones('todos'); }}
                className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium text-gray-500 border border-gray-200 hover:border-red-300 hover:text-red-500 transition-all whitespace-nowrap flex-shrink-0"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar
              </button>
            )}
          </div>

          {/* Results count */}
          <p className="text-xs text-gray-400 mt-2 font-medium">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
          </p>
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
                    loading="lazy"
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
