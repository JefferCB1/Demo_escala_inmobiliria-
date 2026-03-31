// SIMI tiene dos formatos según el endpoint:
// - Lista (/filtroInmueble): Tipo_Inmueble, Canon, Alcobas, banios, Barrio, Ciudad, Gestion, foto1
// - Detalle (/inmueble):     tpinmu, ValorCanon, alcobas, banos, NombreB, nciudad, NombresGestion, fotos[]
function mapPropiedad(item) {
  // Precio: lista usa "2,800,000" con comas; detalle usa "2800000" sin comas
  const precioRaw = item.ValorCanon || item.Canon || item.ValorVenta || item.Venta || '0';
  const precio = parseFloat(String(precioRaw).replace(/[^0-9.]/g, '')) || 0;

  // Fotos: lista usa foto1/foto2...; detalle puede usar array fotos[] o foto1
  const fotosArray = Array.isArray(item.fotos) ? item.fotos.map(f => f?.url || f?.Url || f) : [];
  const fotosIndividuales = [item.foto1, item.foto2, item.foto3, item.foto4, item.foto5].filter(Boolean);
  const imagenes = fotosArray.length > 0 ? fotosArray : fotosIndividuales;

  const ciudad = item.nciudad || item.Ciudad || '';
  const barrio = item.NombreB || item.Barrio || '';

  return {
    id: item.Codigo_Inmueble || item.idInm || item.codinm,
    tipo: item.tpinmu || item.Tipo_Inmueble || '',
    operacion: item.NombresGestion || item.Gestion || (precio > 0 ? 'Arriendo' : 'Venta'),
    precio,
    ubicacion: [barrio, ciudad].filter(Boolean).join(', '),
    area: parseFloat(item.AreaConstruida || item.AreaLote || 0),
    habitaciones: parseInt(item.alcobas || item.Alcobas || 0),
    banos: parseInt(item.banos || item.banios || 0),
    parqueadero: parseInt(item.garaje || item.Garajes || 0),
    imagen: imagenes[0] || '',
    imagenes,
    descripcion: item.descripcionlarga || item.descrip || '',
    direccion: item.Direccion || '',
    estrato: item.Estrato || '',
    departamento: item.Departamento || 'Antioquia',
    ciudad,
    barrio,
    zona: item.NombreZ || item.Zona || '',
    codigo: item.Codigo_Inmueble || item.idInm,
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
