// Mapea un inmueble de SIMI al formato interno de la app
// Campos reales de SIMI: Codigo_Inmueble, Tipo_Inmueble, Gestion, Canon,
// AreaConstruida, Alcobas, Banios, Garajes, Barrio, Ciudad
function mapPropiedad(item) {
  const fotos = item.Fotos || item.fotos || item.imagenes || [];
  const precio = parseFloat(
    String(item.Canon || item.ValorVenta || item.valor_venta || item.precio || 0)
      .replace(/[^0-9.]/g, '')
  );

  return {
    id: item.Codigo_Inmueble || item.codigo_inmueble || item.codigo || item.id,
    tipo: item.Tipo_Inmueble || item.tipo_inmueble || item.tipo || '',
    operacion: item.Gestion || item.gestion || item.tipo_operacion || item.operacion || '',
    precio,
    ubicacion: [item.Barrio || item.barrio, item.Ciudad || item.ciudad].filter(Boolean).join(', ') || item.ubicacion || '',
    area: parseFloat(item.AreaConstruida || item.area_construida || item.area || 0),
    habitaciones: parseInt(item.Alcobas || item.alcobas || item.habitaciones || 0),
    banos: parseInt(item.Banios || item.banos || 0),
    parqueadero: parseInt(item.Garajes || item.garajes || item.parqueadero || 0),
    imagen: fotos[0]?.url || fotos[0] || item.imagen || '',
    imagenes: fotos.map(f => f?.url || f).filter(Boolean),
    descripcion: item.Descripcion || item.descripcion || '',
    estrato: item.Estrato || item.estrato,
    departamento: item.Departamento || item.departamento || 'Antioquia',
    codigo: item.Codigo_Inmueble || item.codigo_inmueble || item.codigo || item.id,
    caracteristicas: item.Caracteristicas || item.caracteristicas || [],
    agente: item.Asesor || item.asesor
      ? {
          nombre: (item.Asesor || item.asesor)?.Nombre || (item.Asesor || item.asesor)?.nombre || '',
          telefono: (item.Asesor || item.asesor)?.Celular || (item.Asesor || item.asesor)?.telefono || '',
          email: (item.Asesor || item.asesor)?.Email || (item.Asesor || item.asesor)?.email || '',
        }
      : null,
    coordenadas: item.Latitud && item.Longitud
      ? { lat: parseFloat(item.Latitud), lng: parseFloat(item.Longitud) }
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
  if (filtros.operacion) params.set('operacion', filtros.operacion);
  if (filtros.tipo) params.set('tipo', filtros.tipo);
  if (filtros.ciudad) params.set('ciudad', filtros.ciudad);
  if (filtros.habitaciones) params.set('habitaciones', filtros.habitaciones);
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
