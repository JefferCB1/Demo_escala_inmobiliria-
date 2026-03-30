import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPropiedades } from '../services/simiApi';
import { formatPrice } from '../utils/formatters';

const SelectField = ({ icon, label, value, onChange, options, allLabel }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 transition-colors rounded-xl"
      >
        <span className="text-gray-400 flex-shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
          <p className="text-sm font-semibold text-escala-dark truncate">{value || allLabel}</p>
        </div>
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[200]">
          <button type="button" onMouseDown={() => { onChange(''); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors ${!value ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}>
            {allLabel}
          </button>
          {options.map(opt => (
            <button key={opt} type="button" onMouseDown={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors ${value === opt ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}>
              {opt}
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
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const cargarPropiedades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { propiedades: data } = await getPropiedades({
        operacion: filterOperacion !== 'todos' ? filterOperacion : undefined,
        tipo: filterTipo !== 'todos' ? filterTipo : undefined,
        ciudad: filterUbicacion !== 'todos' ? filterUbicacion : undefined,
        habitaciones: filterHabitaciones !== 'todos' ? filterHabitaciones : undefined,
        limite: '50',
      });
      setPropiedades(data);
    } catch {
      setError('No se pudieron cargar las propiedades. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [filterOperacion, filterTipo, filterUbicacion, filterHabitaciones]);

  useEffect(() => {
    cargarPropiedades();
  }, [cargarPropiedades]);

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

      {/* Filters — mismo diseño que SmartSearch */}
      <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col items-center">

          {/* Tabs Arriendo / Venta — sliding pill */}
          <div className="relative flex bg-white rounded-full p-1 shadow-md border border-gray-100 mb-4">
            <span
              aria-hidden="true"
              className="absolute inset-y-1 rounded-full"
              style={{
                width: 'calc(50% - 4px)',
                left: '4px',
                background: 'linear-gradient(135deg, #FF6B00, #e66000)',
                boxShadow: '0 4px 14px rgba(255,107,0,0.35)',
                transform: filterOperacion === 'venta' ? 'translateX(100%)' : 'translateX(0)',
                transition: 'transform 0.35s cubic-bezier(0.34, 1.45, 0.64, 1)',
              }}
            />
            {[{ key: 'arriendo', label: 'Arriendo' }, { key: 'venta', label: 'Venta' }].map(op => (
              <button
                key={op.key}
                type="button"
                onClick={() => setFilterOperacion(op.key)}
                className="relative z-10 flex-1 px-6 py-2 rounded-full text-sm font-bold"
                style={{
                  color: filterOperacion === op.key ? '#fff' : '#6b7280',
                  transition: 'color 0.25s ease',
                }}
              >
                {op.label}
              </button>
            ))}
          </div>

          {/* Card de filtros */}
          <div className="w-full bg-white rounded-3xl p-2 shadow-2xl border border-gray-100">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1">
              <SelectField
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                label="Tipo de inmueble"
                value={filterTipo === 'todos' ? '' : filterTipo}
                onChange={(v) => setFilterTipo(v || 'todos')}
                options={['Apartamento', 'Apartaestudio', 'Casa', 'Casa Campestre', 'Oficina']}
                allLabel="Todos los tipos"
              />
              <div className="hidden sm:block w-px h-10 bg-gray-200 self-center flex-shrink-0" />
              <SelectField
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                label="Ciudad / Municipio"
                value={filterUbicacion === 'todos' ? '' : filterUbicacion}
                onChange={(v) => setFilterUbicacion(v || 'todos')}
                options={['Medellín', 'Sabaneta', 'Itaguí', 'Envigado', 'La Estrella', 'Caldas']}
                allLabel="Todas las ciudades"
              />
              <div className="hidden sm:block w-px h-10 bg-gray-200 self-center flex-shrink-0" />
              <SelectField
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                label="Habitaciones"
                value={filterHabitaciones === 'todos' ? '' : filterHabitaciones}
                onChange={(v) => setFilterHabitaciones(v || 'todos')}
                options={['1', '2', '3+']}
                allLabel="Cualquier cantidad"
              />
              {/* Botón limpiar — solo si hay filtros activos */}
              {(filterTipo !== 'todos' || filterUbicacion !== 'todos' || filterHabitaciones !== 'todos') && (
                <button
                  onClick={() => { setFilterTipo('todos'); setFilterUbicacion('todos'); setFilterHabitaciones('todos'); }}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3 self-start font-medium">
            {loading ? 'Buscando propiedades...' : `${propiedades.length} ${propiedades.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}`}
          </p>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-500 font-medium mb-4">{error}</p>
            <button onClick={cargarPropiedades} className="px-6 py-2 bg-escala-accent text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">
              Reintentar
            </button>
          </div>
        ) : propiedades.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {propiedades.map((propiedad) => (
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
        )
        }
      </div>
    </div>
  );
};

export default PropertiesPage;
