// Cliente del frontend para los endpoints /api/v2/* (backend Wasi).
//
// Expone las mismas funciones que simiApi.js para ser un drop-in replacement:
//   getPropiedades, getCatalogos, getBarrios, getPropiedad, getDestacados
//
// El shape de respuesta YA viene mapeado desde el backend (api/v2/_lib/wasiClient.js#mapWasiPropiedad)
// con los mismos campos que producía simiApi.js, así que la UI no necesita cambios.

async function apiFetch(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return res.json();
}

/**
 * Lista de propiedades con filtros.
 * Acepta los mismos filtros que simiApi.getPropiedades pero los routea al backend v2.
 */
export async function getPropiedades(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.ciudad) params.set('ciudad', filtros.ciudad);
    if (filtros.barrio) params.set('barrio', filtros.barrio);
    if (filtros.tipoInm) params.set('tipoInm', filtros.tipoInm);
    if (filtros.tipOper) params.set('tipOper', filtros.tipOper);
    if (filtros.departamento) params.set('departamento', filtros.departamento);
    if (filtros.campo) params.set('campo', filtros.campo);
    if (filtros.order) params.set('order', filtros.order);
    if (filtros.habitaciones) params.set('habitaciones', filtros.habitaciones);
    if (filtros.limite) params.set('limite', filtros.limite);
    if (filtros.pagina) params.set('pagina', filtros.pagina);
    if (filtros.sede) params.set('sede', filtros.sede);

    const data = await apiFetch(`/api/v2/propiedades?${params}`);
    return {
        propiedades: data.propiedades || [],
        total: data.total || 0,
    };
}

export async function getCatalogos() {
    return apiFetch('/api/v2/catalogos');
}

export async function getBarrios(idCiudad) {
    if (!idCiudad) return { barrios: [] };
    return apiFetch(`/api/v2/barrios?ciudad=${encodeURIComponent(idCiudad)}`);
}

export async function getPropiedad(id) {
    const data = await apiFetch(`/api/v2/propiedad/${id}`);
    return data.propiedad;
}

export async function getDestacados() {
    const data = await apiFetch('/api/v2/destacados');
    return data.destacados || [];
}
