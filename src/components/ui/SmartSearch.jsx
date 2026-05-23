import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCatalogos, getBarrios } from '../../services/simiApi';

// Listas fallback en caso de que catalogos no haya cargado todavía.
// Se reemplazan con datos reales de SIMI apenas terminan de cargar.
const TIPOS_FALLBACK = ['Apartamento', 'Apartaestudio', 'Casa', 'Casa Campestre', 'Casa Residencial', 'Oficina'];
const CIUDADES_FALLBACK = ['Sabaneta', 'Medellín', 'Itaguí', 'Envigado', 'La Estrella'];
const HABITACIONES = ['1', '2', '3+'];

// Campo de texto con el mismo aspecto que SelectField, pero permite escribir.
// Útil para el código del inmueble: visualmente encaja con el resto de filtros
// y no sobresale como un input de página.
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

    return (
        <div className="relative flex-1 min-w-0">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 transition-colors rounded-xl group"
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
                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[200] max-h-80 overflow-y-auto">
                    <button
                        type="button"
                        onMouseDown={() => { onChange(''); setOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors ${!value ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}
                    >
                        {allLabel}
                    </button>
                    {options.map(opt => (
                        <button
                            key={opt}
                            type="button"
                            onMouseDown={() => { onChange(opt); setOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors ${value === opt ? 'text-escala-accent font-semibold' : 'text-gray-600'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export const SmartSearch = () => {
    const navigate = useNavigate();
    // Operación fija: solo manejamos arriendo. Si en el futuro hay ventas, se
    // puede volver a meter como prop o variante.
    const OPERACION = 'Arriendo';

    const [codigo, setCodigo] = useState('');
    const [tipo, setTipo] = useState('');
    const [ciudad, setCiudad] = useState('');
    const [barrio, setBarrio] = useState('');
    const [habitaciones, setHabitaciones] = useState('');

    const [catalogos, setCatalogos] = useState({ ciudades: [], tipos: [] });
    const [barrios, setBarrios] = useState([]);
    const [loadingBarrios, setLoadingBarrios] = useState(false);

    // Carga catálogos en idle — no bloquea initial render del Hero
    useEffect(() => {
        const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 600));
        const id = idle(() => {
            getCatalogos()
                .then(data => setCatalogos({
                    ciudades: data.ciudades || [],
                    tipos: data.tipos || [],
                }))
                .catch(() => {});
        });
        return () => {
            if (window.cancelIdleCallback) window.cancelIdleCallback(id);
        };
    }, []);

    // Al cambiar la ciudad, resetea barrio y carga barrios de la ciudad nueva
    useEffect(() => {
        setBarrio('');
        if (!ciudad || !catalogos.ciudades.length) {
            setBarrios([]);
            return;
        }
        const ciudadObj = catalogos.ciudades.find(c => c.nombre === ciudad);
        if (!ciudadObj) {
            setBarrios([]);
            return;
        }
        setLoadingBarrios(true);
        getBarrios(ciudadObj.id)
            .then(({ barrios }) => setBarrios(barrios || []))
            .catch(() => setBarrios([]))
            .finally(() => setLoadingBarrios(false));
    }, [ciudad, catalogos.ciudades]);

    // Usamos catalogos reales si están disponibles, fallback hardcoded si no
    const tiposOptions = catalogos.tipos.length > 0
        ? catalogos.tipos.map(t => t.nombre)
        : TIPOS_FALLBACK;
    const ciudadesOptions = catalogos.ciudades.length > 0
        ? catalogos.ciudades.map(c => c.nombre)
        : CIUDADES_FALLBACK;
    const barriosOptions = barrios.map(b => b.nombre);

    const handleSearch = () => {
        // Si el usuario escribió un código, va directo al detalle.
        // Limpiamos espacios y caracteres no permitidos por el backend.
        const codigoLimpio = codigo.trim();
        if (codigoLimpio) {
            navigate(`/propiedad/${encodeURIComponent(codigoLimpio)}`);
            return;
        }

        const params = new URLSearchParams();
        params.set('operacion', OPERACION.toLowerCase());
        if (tipo) params.set('tipo', tipo.toLowerCase());
        if (ciudad) params.set('ciudad', ciudad.toLowerCase());
        if (barrio) params.set('barrio', barrio.toLowerCase());
        if (habitaciones) params.set('habitaciones', habitaciones);
        navigate(`/propiedades?${params.toString()}`);
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center px-4 sm:px-0">
            {/* Badge: indica claramente que el catálogo es solo de arriendos */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/85 backdrop-blur-sm border border-orange-100 rounded-full shadow-sm mb-4">
                <span className="w-2 h-2 rounded-full bg-escala-accent animate-pulse" aria-hidden="true" />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-700">
                    Inmuebles en <span className="text-escala-accent">Arriendo</span>
                </span>
            </div>

            {/* Search Bar */}
            <div className="w-full bg-white rounded-3xl p-2 shadow-2xl border border-gray-100">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1">
                    <SelectField
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        }
                        label="Tipo de inmueble"
                        value={tipo}
                        onChange={setTipo}
                        options={tiposOptions}
                        allLabel="Todos los tipos"
                    />

                    <div className="hidden sm:block w-px h-10 bg-gray-200 self-center flex-shrink-0" />

                    <SelectField
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                        label="Ciudad / Municipio"
                        value={ciudad}
                        onChange={setCiudad}
                        options={ciudadesOptions}
                        allLabel="Todas las ciudades"
                    />

                    {/* Barrio dropdown — solo cuando hay ciudad seleccionada */}
                    {ciudad && (
                        <>
                            <div className="hidden sm:block w-px h-10 bg-gray-200 self-center flex-shrink-0" />
                            <SelectField
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                    </svg>
                                }
                                label="Barrio"
                                value={barrio}
                                onChange={setBarrio}
                                options={barriosOptions}
                                allLabel={loadingBarrios ? 'Cargando barrios...' : (barriosOptions.length === 0 ? 'Sin barrios disponibles' : 'Todos los barrios')}
                            />
                        </>
                    )}

                    <div className="hidden sm:block w-px h-10 bg-gray-200 self-center flex-shrink-0" />

                    <SelectField
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        }
                        label="Habitaciones"
                        value={habitaciones}
                        onChange={setHabitaciones}
                        options={HABITACIONES}
                        allLabel="Cualquier cantidad"
                    />

                    <div className="hidden sm:block w-px h-10 bg-gray-200 self-center flex-shrink-0" />

                    <InputField
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                            </svg>
                        }
                        label="Código"
                        value={codigo}
                        onChange={setCodigo}
                        placeholder="Opcional"
                        onEnter={handleSearch}
                    />

                    <button
                        type="button"
                        onClick={handleSearch}
                        className="w-full sm:w-auto bg-escala-accent hover:bg-[#e66000] text-white px-8 py-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 shadow-[0_4px_15px_rgba(255,107,0,0.4)] hover:shadow-[0_6px_20px_rgba(255,107,0,0.5)] hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 flex-shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Buscar
                    </button>
                </div>
            </div>
        </div>
    );
};
