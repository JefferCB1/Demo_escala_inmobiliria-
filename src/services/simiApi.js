// Campos reales confirmados de SIMI API:
// Codigo_Inmueble, Tipo_Inmueble, Canon, Venta, Alcobas, banios, garaje,
// Estrato, Barrio, Ciudad, Departamento, descripcionlarga, AreaConstruida,
// foto1 (URL directa), latitud, longitud (minúsculas), Gestion, IdInmobiliaria
function mapPropiedad(item) {
  const precioRaw = item.Canon || item.Venta || item.ValorVenta || '0';
  const precio = parseFloat(String(precioRaw).replace(/[^0-9.]/g, '')) || 0;

  // foto1 es la imagen principal; puede haber foto2, foto3...
  const imagenes = [item.foto1, item.foto2, item.foto3, item.foto4, item.foto5]
    .filter(Boolean);

  return {
    id: item.Codigo_Inmueble,
    tipo: item.Tipo_Inmueble || '',
    operacion: item.Gestion || (precio > 0 ? 'Arriendo' : 'Venta'),
    precio,
    ubicacion: [item.Barrio, item.Ciudad].filter(Boolean).join(', '),
    area: parseFloat(item.AreaConstruida || item.AreaLote || 0),
    habitaciones: parseInt(item.Alcobas || 0),
    banos: parseInt(item.banios || 0),
    parqueadero: parseInt(item.garaje || 0),
    imagen: imagenes[0] || '',
    imagenes,
    descripcion: item.descripcionlarga || '',
    estrato: item.Estrato || '',
    departamento: item.Departamento || 'Antioquia',
    ciudad: item.Ciudad || '',
    barrio: item.Barrio || '',
    zona: item.Zona || '',
    codigo: item.Codigo_Inmueble,
    administracion: parseFloat(String(item.Administracion || '0').replace(/[^0-9.]/g, '')),
    logo: item.logo || '',
    coordenadas: item.latitud && item.longitud
      ? { lat: parseFloat(item.latitud), lng: parseFloat(item.longitud) }
      : null,
  };
}

async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status}`);
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
