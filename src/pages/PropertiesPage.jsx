import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPropiedades, getCatalogos } from '../services/simiApi';
import { formatPrice } from '../utils/formatters';

// Normaliza opciones: acepta strings ['1','2'] o {value,label} [{value:'1',label:'1 habitación'}]
const normalizeOpts = opts => opts.map(o => (typeof o === 'string' ? { value: o, label: o } : o));

const SelectField = ({ icon, label, value, onChange, options, allLabel }) => {
  const [open, setOpen] = useState(false);
  const opts = normalizeOpts(options);
  const selected = opts.find(o => String(o.value) === String(value));
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
          <p className="text-sm font-semibold text-escala-dark truncate">{selected ? selected.label : allLabel}</p>
        </div>
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[200] max-h-80 overflow-y-auto">
          <button type="button" onMouseDown={() => { onChange(''); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors ${!value ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}>
            {allLabel}
          </button>
          {opts.map(opt => (
            <button key={opt.value} type="button" onMouseDown={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors ${String(value) === String(opt.value) ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Busca un item del catálogo por nombre (matching parcial, case-insensitive).
const findIdByName = (catalogo, name) => {
  if (!name || !catalogo?.length) return '';
  const target = name.toLowerCase().trim();
  // Match exacto primero, luego parcial
  const exact = catalogo.find(c => c.nombre.toLowerCase() === target);
  if (exact) return String(exact.id);
  const partial = catalogo.find(c => c.nombre.toLowerCase().includes(target));
  return partial ? String(partial.id) : '';
};

const PER_PAGE = 12; // Por sede. Sin filtro de sede → ~24 ítems por página.

const PropertiesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Filtros: ahora almacenamos IDs (string) de SIMI; '' significa "todos"
  const [filterTipoId, setFilterTipoId] = useState('');
  const [filterOperacionId, setFilterOperacionId] = useState('');
  const [filterUbicacionId, setFilterUbicacionId] = useState('');
  const [filterHabitaciones, setFilterHabitaciones] = useState('todos');
  const [propiedades, setPropiedades] = useState([]);
  const [catalogos, setCatalogos] = useState({ ciudades: [], tipos: [], gestiones: [] });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [error, setError] = useState(null);

  // Carga catálogos una sola vez (cache CDN 24h)
  useEffect(() => {
    getCatalogos()
      .then(setCatalogos)
      .catch(() => {}); // Si falla, los dropdowns quedan vacíos pero el listado funciona.
  }, []);

  // Mapea params de URL (nombres) a IDs cuando los catálogos estén disponibles
  useEffect(() => {
    if (!catalogos.tipos.length && !catalogos.ciudades.length && !catalogos.gestiones.length) return;
    const operacion = searchParams.get('operacion');
    const tipo = searchParams.get('tipo');
    const ciudad = searchParams.get('ciudad');
    const habitaciones = searchParams.get('habitaciones');
    if (operacion) setFilterOperacionId(findIdByName(catalogos.gestiones, operacion));
    if (tipo) setFilterTipoId(findIdByName(catalogos.tipos, tipo));
    if (ciudad) setFilterUbicacionId(findIdByName(catalogos.ciudades, ciudad));
    if (habitaciones) setFilterHabitaciones(habitaciones);
  }, [searchParams, catalogos]);

  // Carga una página. pageToLoad=0 reinicia la lista; >0 hace append.
  const cargarPropiedades = useCallback(async (pageToLoad = 0) => {
    if (pageToLoad === 0) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }
    try {
      const { propiedades: data } = await getPropiedades({
        limite: String(PER_PAGE),
        pagina: String(pageToLoad),
        ciudad: filterUbicacionId || undefined,
        tipoInm: filterTipoId || undefined,
        tipOper: filterOperacionId || undefined,
        // habitaciones se mantiene client-side por el caso "3+" (SIMI usa 5+ no 3+)
      });
      setPropiedades(prev => (pageToLoad === 0 ? data : [...prev, ...data]));
      // Cuando una página viene vacía, asumimos que no hay más resultados.
      setHasMore(data.length > 0);
    } catch {
      if (pageToLoad === 0) {
        setError('No se pudieron cargar las propiedades. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filterUbicacionId, filterTipoId, filterOperacionId]);

  // Al cambiar cualquier filtro server-side, reseteamos y pedimos desde la página 0.
  useEffect(() => {
    setPagina(0);
    setHasMore(true);
    cargarPropiedades(0);
  }, [cargarPropiedades]);

  const cargarMas = () => {
    const next = pagina + 1;
    setPagina(next);
    cargarPropiedades(next);
  };

  // Filtro client-side solo para habitaciones (SIMI no soporta "3+" directamente)
  const propiedadesFiltradas = useMemo(() => {
    if (filterHabitaciones === 'todos') return propiedades;
    return propiedades.filter(p => {
      const habs = parseInt(p.habitaciones || 0);
      if (filterHabitaciones === '3+') return habs >= 3;
      return habs === parseInt(filterHabitaciones);
    });
  }, [propiedades, filterHabitaciones]);

  // Opciones para los dropdowns (orden estable, filtrado de vacíos)
  const tipoOptions = useMemo(
    () => catalogos.tipos.map(t => ({ value: String(t.id), label: t.nombre })),
    [catalogos.tipos]
  );
  const ciudadOptions = useMemo(
    () => catalogos.ciudades.map(c => ({ value: String(c.id), label: c.nombre })),
    [catalogos.ciudades]
  );

  // ID de "Arriendo" y "Venta" derivados del catálogo gestion
  const idArriendo = findIdByName(catalogos.gestiones, 'arriendo');
  const idVenta = findIdByName(catalogos.gestiones, 'venta');

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
            preload="none"
            aria-hidden="true"
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
                transform: filterOperacionId === idVenta && idVenta ? 'translateX(100%)' : 'translateX(0)',
                transition: 'transform 0.35s cubic-bezier(0.34, 1.45, 0.64, 1)',
                opacity: filterOperacionId ? 1 : 0,
              }}
            />
            {[
              { id: idArriendo, label: 'Arriendo' },
              { id: idVenta, label: 'Venta' },
            ].map(op => (
              <button
                key={op.label}
                type="button"
                onClick={() => setFilterOperacionId(filterOperacionId === op.id ? '' : op.id)}
                disabled={!op.id}
                className="relative z-10 flex-1 px-6 py-2 rounded-full text-sm font-bold disabled:opacity-40"
                style={{
                  color: filterOperacionId === op.id && op.id ? '#fff' : '#6b7280',
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
                value={filterTipoId}
                onChange={setFilterTipoId}
                options={tipoOptions}
                allLabel="Todos los tipos"
              />
              <div className="hidden sm:block w-px h-10 bg-gray-200 self-center flex-shrink-0" />
              <SelectField
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                label="Ciudad / Municipio"
                value={filterUbicacionId}
                onChange={setFilterUbicacionId}
                options={ciudadOptions}
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
              {(filterTipoId || filterUbicacionId || filterOperacionId || filterHabitaciones !== 'todos') && (
                <button
                  onClick={() => {
                    setFilterTipoId('');
                    setFilterUbicacionId('');
                    setFilterOperacionId('');
                    setFilterHabitaciones('todos');
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3 self-start font-medium">
            {loading ? 'Buscando propiedades...' : `${propiedadesFiltradas.length} ${propiedadesFiltradas.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}`}
          </p>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <>
            {/* Indicador animado superior */}
            <div className="flex items-center justify-center gap-3 mb-8" role="status" aria-live="polite">
              <div className="relative w-6 h-6">
                <div className="absolute inset-0 rounded-full border-2 border-orange-200" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-escala-accent animate-spin" />
              </div>
              <p className="text-sm font-semibold text-gray-600">
                Buscando las mejores propiedades
                <span className="inline-block w-4 text-left">
                  <span className="animate-[pulse_1.4s_ease-in-out_infinite]">.</span>
                  <span className="animate-[pulse_1.4s_ease-in-out_0.2s_infinite]">.</span>
                  <span className="animate-[pulse_1.4s_ease-in-out_0.4s_infinite]">.</span>
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="relative bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-[slideUp_0.6s_ease-out_both]"
                  style={{ animationDelay: `${i * 80}ms` }}
                  aria-hidden="true"
                >
                  {/* Imagen + badges */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-100 overflow-hidden">
                    <div className="absolute top-3 left-3 h-6 w-20 rounded-full bg-gray-300/70" />
                    <div className="absolute top-3 right-3 h-6 w-16 rounded-full bg-gray-300/70" />
                    <div className="absolute bottom-3 left-3 h-5 w-24 rounded bg-gray-300/70" />
                  </div>

                  {/* Contenido */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="h-5 w-1/2 rounded bg-gray-200" />
                      <div className="h-5 w-20 rounded bg-orange-100" />
                    </div>
                    <div className="h-3 w-3/4 rounded bg-gray-200" />
                    <div className="flex items-center gap-3 pt-1">
                      <div className="h-3 w-10 rounded bg-gray-200" />
                      <div className="h-3 w-12 rounded bg-gray-200" />
                      <div className="h-3 w-12 rounded bg-gray-200" />
                    </div>
                    <div className="h-10 rounded-xl bg-gradient-to-r from-orange-100 via-orange-200 to-orange-100" />
                  </div>

                  {/* Overlay shimmer */}
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : error ? (
          <div className="max-w-md mx-auto text-center py-16 px-4 animate-[slideUp_0.5s_ease-out_both]">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <h3 className="text-xl font-heading font-bold text-escala-dark mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-gray-500 text-sm mb-8">
              Intenta de nuevo o contacta a un asesor.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={cargarPropiedades}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-escala-accent text-white rounded-xl font-bold hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reintentar
              </button>
              <a
                href="https://wa.me/573009122101?text=Hola,%20quisiera%20que%20me%20ayuden%20a%20encontrar%20una%20propiedad"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-escala-dark border-2 border-gray-200 rounded-xl font-bold hover:border-escala-accent hover:text-escala-accent transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Asesor
              </a>
            </div>
          </div>
        ) : propiedadesFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {propiedadesFiltradas.map((propiedad) => (
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

        {/* Botón "Ver más" — solo si hay resultados, no estamos cargando inicial y queda más */}
        {!loading && !error && propiedadesFiltradas.length > 0 && hasMore && (
          <div className="mt-12 flex flex-col items-center gap-3">
            <button
              onClick={cargarMas}
              disabled={loadingMore}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-escala-dark border-2 border-gray-200 rounded-2xl font-bold hover:border-escala-accent hover:text-escala-accent hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loadingMore ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-300 border-t-escala-accent rounded-full animate-spin" aria-hidden="true" />
                  Cargando…
                </>
              ) : (
                <>
                  Ver más propiedades
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </>
              )}
            </button>
            <p className="text-xs text-gray-400 font-medium">
              Mostrando {propiedadesFiltradas.length} {propiedadesFiltradas.length === 1 ? 'propiedad' : 'propiedades'}
            </p>
          </div>
        )}

        {/* Mensaje cuando se llegó al final del catálogo */}
        {!loading && !error && propiedadesFiltradas.length > 0 && !hasMore && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400 font-medium">
              Has visto todas las propiedades disponibles ({propiedadesFiltradas.length})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;
