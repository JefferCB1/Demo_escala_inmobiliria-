import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPropiedades, getCatalogos, getBarrios } from '../services/simiApi';
import { formatPrice } from '../utils/formatters';

// Normaliza opciones: acepta strings ['1','2'] o {value,label} [{value:'1',label:'1 habitación'}]
const normalizeOpts = opts => opts.map(o => (typeof o === 'string' ? { value: o, label: o } : o));

// Campo de texto con el mismo aspecto visual que SelectField. Permite que el
// código del inmueble encaje al lado de los demás filtros sin sobresalir.
const InputField = ({ icon, label, value, onChange, placeholder, onEnter, maxLength = 30 }) => (
  <div className="relative flex-1 min-w-0">
    <label className="flex items-center gap-2 px-4 py-3 cursor-text hover:bg-gray-50 transition-colors rounded-xl text-left">
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-left">{label}</p>
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onEnter) { e.preventDefault(); onEnter(); }
          }}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full text-sm font-semibold text-escala-dark bg-transparent border-0 outline-none p-0 placeholder:text-gray-300 placeholder:font-normal"
        />
      </div>
    </label>
  </div>
);

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

// Mapeo de orden → params SIMI (campo + order)
// El ordenamiento es post-fetch (UI), no parte de la búsqueda diferida.
const SORT_OPTIONS = [
  { value: 'recomendado', label: 'Recomendado', campo: 'fecha', order: 'desc' },
  { value: 'barato', label: 'Más barato', campo: 'precio', order: 'asc' },
  { value: 'caro', label: 'Más caro', campo: 'precio', order: 'desc' },
];

// Estado inicial de filtros vacío - usado tanto en pending como applied
const EMPTY_FILTERS = {
  codigo: '',
  tipoId: '',
  ubicacionId: '',
  barrioId: '',
  habitaciones: 'todos',
};

const PropertiesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resultsRef = useRef(null);

  // --- Estado de filtros: PENDING (UI) vs APPLIED (lo que se manda a la API) ---
  // El usuario manipula los pending; solo al hacer click en "Buscar" se copian
  // a applied y se dispara el fetch. El sortBy queda fuera porque es reordenar
  // resultados ya cargados (post-fetch UI), no una nueva búsqueda.
  const [pendingFilters, setPendingFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState('recomendado');

  const [propiedades, setPropiedades] = useState([]);
  const [catalogos, setCatalogos] = useState({ ciudades: [], tipos: [], gestiones: [] });
  const [barrios, setBarrios] = useState([]);
  const [loadingBarrios, setLoadingBarrios] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pagina, setPagina] = useState(0);
  const [error, setError] = useState(null);
  // hasSearched: solo cuando el usuario hace click en Buscar (o llega con
  // querystring desde el Hero) se dispara el fetch y se muestran resultados.
  // Antes de eso la UI muestra el skeleton "como si estuviera buscando".
  const [hasSearched, setHasSearched] = useState(false);

  // Helper para actualizar un solo filtro del pending
  const setPending = (key, value) => setPendingFilters(prev => ({ ...prev, [key]: value }));

  // Carga catálogos una sola vez (cache CDN 24h)
  useEffect(() => {
    getCatalogos()
      .then(setCatalogos)
      .catch(() => {}); // Si falla, los dropdowns quedan vacíos pero el listado funciona.
  }, []);

  // Cuando llegan los catálogos, mapea querystring (?tipo=apartamento) a IDs
  // y aplica esos filtros de una vez (auto-buscar al entrar con params).
  // Esto permite que SmartSearch del Hero navegue acá y los resultados se
  // muestren sin click adicional. SIN querystring no se hace fetch (la UI
  // queda en "estado buscando" hasta que el usuario use el botón Buscar).
  useEffect(() => {
    if (!catalogos.tipos.length && !catalogos.ciudades.length && !catalogos.gestiones.length) return;
    const tipo = searchParams.get('tipo');
    const ciudad = searchParams.get('ciudad');
    const habitaciones = searchParams.get('habitaciones');
    const hasAnyParam = tipo || ciudad || habitaciones;
    if (!hasAnyParam) return; // sin params, no auto-busca
    const next = { ...EMPTY_FILTERS };
    if (tipo) next.tipoId = findIdByName(catalogos.tipos, tipo);
    if (ciudad) next.ubicacionId = findIdByName(catalogos.ciudades, ciudad);
    if (habitaciones) next.habitaciones = habitaciones;
    setPendingFilters(next);
    setAppliedFilters(next);
    setHasSearched(true);
    // Nota: ?operacion=venta se ignora porque solo manejamos arriendos.
    // El barrio se resuelve en el efecto de barrios cuando estos lleguen.
  }, [searchParams, catalogos]);

  // Al cambiar la ciudad en PENDING, carga barrios para que el dropdown tenga
  // opciones. NO toca el applied (la búsqueda ya está hecha con el barrio viejo
  // hasta que el usuario haga click en Buscar de nuevo).
  useEffect(() => {
    // Resetea solo el barrio pending al cambiar ciudad pending
    setPendingFilters(prev => ({ ...prev, barrioId: '' }));
    if (!pendingFilters.ubicacionId) {
      setBarrios([]);
      return;
    }
    setLoadingBarrios(true);
    getBarrios(pendingFilters.ubicacionId)
      .then(({ barrios }) => {
        const list = barrios || [];
        setBarrios(list);
        // Resolución de ?barrio=nombre en URL al ID (solo si la ciudad
        // pending coincide con la applied que vino de URL)
        const barrioParam = searchParams.get('barrio');
        if (barrioParam && pendingFilters.ubicacionId === appliedFilters.ubicacionId) {
          const id = findIdByName(list, barrioParam);
          if (id) {
            setPendingFilters(prev => ({ ...prev, barrioId: id }));
            setAppliedFilters(prev => ({ ...prev, barrioId: id }));
          }
        }
      })
      .catch(() => setBarrios([]))
      .finally(() => setLoadingBarrios(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFilters.ubicacionId]);

  // ID de "Arriendo" derivado del catálogo gestion (siempre filtramos por arriendo)
  const idArriendo = findIdByName(catalogos.gestiones, 'arriendo');

  // Carga una página. pageToLoad=0 reinicia la lista; >0 hace append.
  // Lee SIEMPRE de appliedFilters (no pending).
  const cargarPropiedades = useCallback(async (pageToLoad = 0) => {
    if (pageToLoad === 0) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }
    try {
      const sortCfg = SORT_OPTIONS.find(o => o.value === sortBy) || SORT_OPTIONS[0];
      const { propiedades: data } = await getPropiedades({
        limite: String(PER_PAGE),
        pagina: String(pageToLoad),
        ciudad: appliedFilters.ubicacionId || undefined,
        barrio: appliedFilters.barrioId || undefined,
        tipoInm: appliedFilters.tipoId || undefined,
        tipOper: idArriendo || undefined, // Siempre arriendo
        campo: sortCfg.campo,
        order: sortCfg.order,
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
  }, [appliedFilters.ubicacionId, appliedFilters.barrioId, appliedFilters.tipoId, sortBy, idArriendo]);

  // Cuando cambia appliedFilters o sortBy (vía cargarPropiedades), recarga
  // desde la página 0. Solo se dispara si el usuario ya buscó al menos una vez.
  useEffect(() => {
    if (!hasSearched) return;
    setPagina(0);
    setHasMore(true);
    cargarPropiedades(0);
  }, [cargarPropiedades, hasSearched]);

  // Acción del botón "Buscar": copia pending → applied (dispara recarga).
  // Si hay código, navega directo al detalle.
  const handleBuscar = () => {
    const codigoLimpio = pendingFilters.codigo.trim();
    if (codigoLimpio) {
      navigate(`/propiedad/${encodeURIComponent(codigoLimpio)}`);
      return;
    }
    setAppliedFilters(pendingFilters);
    setHasSearched(true);
    // Scroll suave a resultados (con timeout para que el render arranque primero)
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleLimpiar = () => {
    setPendingFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setHasSearched(false);
    setPropiedades([]);
  };

  const cargarMas = () => {
    const next = pagina + 1;
    setPagina(next);
    cargarPropiedades(next);
  };

  // Filtro client-side solo para habitaciones (SIMI no soporta "3+" directamente).
  // Usa applied.habitaciones, no pending.
  const propiedadesFiltradas = useMemo(() => {
    if (appliedFilters.habitaciones === 'todos') return propiedades;
    return propiedades.filter(p => {
      const habs = parseInt(p.habitaciones || 0);
      if (appliedFilters.habitaciones === '3+') return habs >= 3;
      return habs === parseInt(appliedFilters.habitaciones);
    });
  }, [propiedades, appliedFilters.habitaciones]);

  // Opciones para los dropdowns (orden estable, filtrado de vacíos)
  const tipoOptions = useMemo(
    () => catalogos.tipos.map(t => ({ value: String(t.id), label: t.nombre })),
    [catalogos.tipos]
  );
  const ciudadOptions = useMemo(
    () => catalogos.ciudades.map(c => ({ value: String(c.id), label: c.nombre })),
    [catalogos.ciudades]
  );
  const barrioOptions = useMemo(
    () => barrios.map(b => ({ value: String(b.id), label: b.nombre })),
    [barrios]
  );

  const hasActiveFilters = pendingFilters.tipoId || pendingFilters.ubicacionId || pendingFilters.barrioId ||
    pendingFilters.habitaciones !== 'todos' || pendingFilters.codigo;

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Propiedades en Arriendo - Escala Inmobiliaria',
    description: 'Catálogo de propiedades en arriendo en Medellín, Sabaneta, Itaguí, Envigado y más municipios del Valle de Aburrá.',
    url: 'https://escalainmobiliaria.com.co/propiedades',
    numberOfItems: propiedades.length,
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Propiedades en Arriendo | Escala Inmobiliaria Medellín y Sabaneta</title>
        <meta name="description" content="Encuentra apartamentos, casas y apartaestudios en arriendo en Medellín, Sabaneta, Itaguí y Envigado. Catálogo actualizado con asesoría personalizada." />
        <link rel="canonical" href="https://escalainmobiliaria.com.co/propiedades" />
        <meta property="og:title" content="Propiedades en Arriendo | Escala Inmobiliaria" />
        <meta property="og:description" content="Explora nuestro portafolio de propiedades en arriendo en el área metropolitana de Medellín." />
        <meta property="og:url" content="https://escalainmobiliaria.com.co/propiedades" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      {/* Hero compacto */}
      <div className="relative pt-28 pb-10 sm:pb-14 px-4 overflow-hidden bg-slate-50">
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

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/85 backdrop-blur-sm border border-orange-100 rounded-full shadow-sm mb-5">
            <span className="w-2 h-2 rounded-full bg-escala-accent animate-pulse" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-700">
              Inmuebles en <span className="text-escala-accent">Arriendo</span>
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold text-escala-dark mb-3">
            Encuentra tu próximo <span className="text-escala-accent">hogar</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            Filtra por tipo, ciudad, barrio o ingresa un código si ya conoces el inmueble.
          </p>
        </div>
      </div>

      {/* Bloque de filtros - prominente, no en sticky para que se sienta como un paso del flujo */}
      <div className="relative -mt-8 sm:-mt-10 px-4 z-20">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 sm:p-6">
          {/* Filtros */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1">
              <SelectField
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                label="Tipo de inmueble"
                value={pendingFilters.tipoId}
                onChange={(v) => setPending('tipoId', v)}
                options={tipoOptions}
                allLabel="Todos los tipos"
              />
              <div className="hidden sm:block w-px h-10 bg-gray-200 self-center flex-shrink-0" />
              <SelectField
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                label="Ciudad / Municipio"
                value={pendingFilters.ubicacionId}
                onChange={(v) => setPending('ubicacionId', v)}
                options={ciudadOptions}
                allLabel="Todas las ciudades"
              />
              {/* Dropdown de Barrio aparece solo cuando hay ciudad seleccionada */}
              {pendingFilters.ubicacionId && (
                <>
                  <div className="hidden sm:block w-px h-10 bg-gray-200 self-center flex-shrink-0" />
                  <SelectField
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>}
                    label="Barrio"
                    value={pendingFilters.barrioId}
                    onChange={(v) => setPending('barrioId', v)}
                    options={barrioOptions}
                    allLabel={loadingBarrios ? 'Cargando barrios...' : (barrioOptions.length === 0 ? 'Sin barrios disponibles' : 'Todos los barrios')}
                  />
                </>
              )}
              <div className="hidden sm:block w-px h-10 bg-gray-200 self-center flex-shrink-0" />
              <SelectField
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                label="Habitaciones"
                value={pendingFilters.habitaciones === 'todos' ? '' : pendingFilters.habitaciones}
                onChange={(v) => setPending('habitaciones', v || 'todos')}
                options={['1', '2', '3+']}
                allLabel="Cualquier cantidad"
              />
              <div className="hidden sm:block w-px h-10 bg-gray-200 self-center flex-shrink-0" />
              <InputField
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>}
                label="Código"
                value={pendingFilters.codigo}
                onChange={(v) => setPending('codigo', v)}
                placeholder="Opcional"
                onEnter={handleBuscar}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
            <button
              type="button"
              onClick={handleBuscar}
              className="w-full sm:flex-1 bg-escala-accent hover:bg-[#e66000] text-white px-8 py-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 shadow-[0_4px_15px_rgba(255,107,0,0.4)] hover:shadow-[0_6px_20px_rgba(255,107,0,0.5)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleLimpiar}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 border-2 border-gray-100 hover:border-red-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div ref={resultsRef} className="max-w-7xl mx-auto px-4 pt-12 sm:pt-16 pb-8">
        {/* Contador + ordenamiento */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <p className="text-sm text-gray-500 font-medium order-2 sm:order-1">
            {!hasSearched ? (
              'Aplica filtros y haz click en buscar'
            ) : loading ? (
              'Buscando propiedades...'
            ) : (
              <>
                <span className="text-escala-dark font-bold">{propiedadesFiltradas.length}</span>{' '}
                {propiedadesFiltradas.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
              </>
            )}
          </p>

          {/* Selector de orden — pills sutiles */}
          <div className="order-1 sm:order-2 flex items-center gap-1.5 bg-gray-100 rounded-full p-1 self-start sm:self-auto">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSortBy(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  sortBy === opt.value
                    ? 'bg-white text-escala-dark shadow-sm'
                    : 'text-gray-500 hover:text-escala-dark'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {(!hasSearched || loading) ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="relative bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 animate-[slideUp_0.6s_ease-out_both]"
                  style={{ animationDelay: `${i * 80}ms` }}
                  aria-hidden="true"
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-100 overflow-hidden">
                    <div className="absolute top-3 left-3 h-6 w-20 rounded-full bg-gray-300/70" />
                    <div className="absolute top-3 right-3 h-6 w-16 rounded-full bg-gray-300/70" />
                    <div className="absolute bottom-3 left-3 h-5 w-24 rounded bg-gray-300/70" />
                  </div>

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
                onClick={() => cargarPropiedades(0)}
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
                    onClick={(e) => e.stopPropagation()}
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
