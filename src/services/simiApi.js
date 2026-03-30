// Mapea un inmueble de SIMI al formato interno de la app
function mapPropiedad(item) {
  const fotos = item.fotos || item.imagenes || [];
  return {
    id: item.codigo_inmueble || item.codigo || item.id,
    tipo: item.tipo_inmueble || item.tipo || '',
    operacion: item.tipo_operacion || item.gestion || item.operacion || '',
    precio: parseFloat(item.valor_venta || item.valor_arriendo || item.precio || 0),
    ubicacion: [item.barrio, item.ciudad].filter(Boolean).join(', ') || item.ubicacion || '',
    area: parseFloat(item.area_construida || item.area || 0),
    habitaciones: parseInt(item.alcobas || item.habitaciones || 0),
    banos: parseInt(item.banos || 0),
    parqueadero: parseInt(item.garajes || item.parqueadero || 0),
    imagen: fotos[0]?.url || fotos[0] || item.imagen || '',
    imagenes: fotos.map(f => f?.url || f).filter(Boolean),
    descripcion: item.descripcion || '',
    estrato: item.estrato,
    edad: item.edad,
    departamento: item.departamento || 'Antioquia',
    codigo: item.codigo_inmueble || item.codigo || item.id,
    caracteristicas: item.caracteristicas || item.detalles || [],
    agente: item.asesor
      ? {
          nombre: item.asesor.nombre || item.asesor.name || '',
          telefono: item.asesor.telefono || item.asesor.celular || '',
          email: item.asesor.email || '',
        }
      : null,
    coordenadas: item.latitud && item.longitud
      ? { lat: parseFloat(item.latitud), lng: parseFloat(item.longitud) }
      : null,
  };
}

async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status} en ${url}`);
  return res.json();
}

export async function getPropiedades(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.operacion && filtros.operacion !== 'todos') params.set('operacion', filtros.operacion);
  if (filtros.tipo && filtros.tipo !== 'todos') params.set('tipo', filtros.tipo);
  if (filtros.ciudad && filtros.ciudad !== 'todos') params.set('ciudad', filtros.ciudad);
  if (filtros.habitaciones && filtros.habitaciones !== 'todos') params.set('habitaciones', filtros.habitaciones);
  if (filtros.limite) params.set('limite', filtros.limite);
  if (filtros.pagina) params.set('pagina', filtros.pagina);
  if (filtros.sede) params.set('sede', filtros.sede);

  const data = await apiFetch(`/api/propiedades?${params}`);
  return {
    propiedades: (data.propiedades || []).map(mapPropiedad),
    total: data.total || 0,
  };
}

export async function getPropiedad(id) {
  const data = await apiFetch(`/api/propiedad/${id}`);
  return mapPropiedad(data.propiedad);
}

export async function getDestacados() {
  const data = await apiFetch('/api/destacados');
  return (data.destacados || []).map(mapPropiedad);
}
