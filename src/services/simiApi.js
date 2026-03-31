// SIMI tiene dos formatos según el endpoint:
// - Lista (/filtroInmueble): Tipo_Inmueble, Canon, Alcobas, banios, Barrio, Ciudad, Gestion, foto1
// - Detalle (/inmueble):     tpinmu, ValorCanon, alcobas, banos, NombreB, nciudad, NombresGestion, fotos[{foto,posi}]
function mapPropiedad(item) {
  // Precio: lista usa "2,800,000" con comas; detalle usa "2800000" sin comas
  const precioRaw = item.ValorCanon || item.Canon || item.ValorVenta || item.Venta || '0';
  const precio = parseFloat(String(precioRaw).replace(/[^0-9.]/g, '')) || 0;

  // Fotos: detalle usa fotos[{foto, posi}]; lista usa foto1/foto2...
  const fotosArray = Array.isArray(item.fotos) && item.fotos.length > 0
    ? item.fotos.map(f => f?.foto || f?.url || f).filter(Boolean)
    : [];
  const fotosIndividuales = [item.foto1, item.foto2, item.foto3, item.foto4, item.foto5].filter(Boolean);
  const imagenes = fotosArray.length > 0 ? fotosArray : fotosIndividuales;

  // Asesor: detalle devuelve array; tomamos el primero
  const asesorRaw = Array.isArray(item.asesor) ? item.asesor[0] : item.asesor;
  const agente = asesorRaw
    ? {
        nombre: asesorRaw.ntercero || asesorRaw.Nombre || '',
        telefono: asesorRaw.celular || asesorRaw.fijo || '',
        email: asesorRaw.correo || asesorRaw.Email || '',
        foto: asesorRaw.FotoAsesor || '',
      }
    : null;

  // Características: detalle tiene tres arrays separados
  const caracteristicas = [
    ...(item.caracteristicasInternas || []),
    ...(item.caracteristicasExternas || []),
    ...(item.caracteristicasAlrededores || []),
  ].map(c => c?.Descripcion?.trim()).filter(Boolean);

  const ciudad = item.nciudad || item.ciudad || item.Ciudad || '';
  const barrio = item.NombreB || item.barrio || item.Barrio || '';

  return {
    id: item.Codigo_Inmueble || item.idInm,
    tipo: item.tpinmu || item.Tipo_Inmueble || '',
    operacion: item.NombresGestion || item.oper || item.Gestion || (precio > 0 ? 'Arriendo' : 'Venta'),
    precio,
    ubicacion: [barrio, ciudad].filter(Boolean).join(', '),
    area: parseFloat(item.AreaConstruida || item.AreaLote || 0),
    habitaciones: parseInt(item.alcobas || item.Alcobas || 0),
    banos: parseInt(item.banos || item.banios || 0),
    parqueadero: parseInt(item.garaje || item.Garajes || 0),
    imagen: imagenes[0] || '',
    imagenes,
    descripcion: item.descripcionlarga || item.descrip || '',
    direccion: (item.Direccion || '').trim(),
    estrato: item.Estrato || '',
    departamento: item.ndepto || item.depto || item.Departamento || 'Antioquia',
    ciudad,
    barrio,
    zona: item.NombreZ || item.zona || item.Zona || '',
    codigo: item.Codigo_Inmueble || item.idInm,
    administracion: parseFloat(String(item.Administracion || '0').replace(/[^0-9.]/g, '')),
    logo: item.inmobiliaria?.logo || item.logo || '',
    agente,
    caracteristicas,
    portales: item.portales?.data || [],
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
