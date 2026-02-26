import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const mockProperty = {
  id: '1272-733',
  titulo: 'Apartamento En Arriendo - Vereda San Jose, Sabaneta',
  tipo: 'Apartamento',
  operacion: 'Arriendo',
  precio: 1800000,
  ubicacion: 'Vereda San Jose, Sabaneta',
  departamento: 'Antioquia',
  codigo: '1272-733',
  area: 60,
  areaLote: 60,
  alcobas: 3,
  banos: 2,
  parqueadero: 1,
  estrato: 2,
  edad: '2 años',
  descripcion: 'HERMOSO APARTAMENTO PARA ESTRENAR EN LOMA SAN JOSE sala-comedor, 3 alcobas, 2 closet, 2 baños, cocina integral, balcon, zona de ropas, red de gas, calentador, parqueadero privado y cuarto util. Transporte integrado del metro pasa en frente de la unidad. Zonas comunes en construccion. Mas informacion con el asesor: YONATAN ARISTIZABAL YEPES 3045335855',
  caracteristicas: [
    'Cocina Americana',
    'Closet',
    'Barra Americana',
    'Salon Comunal',
    'Gas Natural',
    'Baño Social',
    'Cocina Abierta',
    'Gimnasio',
    'Vigilancia 24 Horas',
    'Calentador A Gas',
    'Baño Privado',
    'Cancha De Futbol'
  ],
  imagenes: [
    'https://lh3.googleusercontent.com/f2bHRFnEREwBtjR7WQ9P1k8qGVKxM67HlKdOLNf2QXeCmhAF_Hf34b-0poKJIansVYvGKBM-sU-IbZtwmDnnOaDBIdsDl_lVY5oT_yNXtjSvtw=s1200',
    'https://lh3.googleusercontent.com/moAWYHQGvecjrUfWEyBpQ46L4uzdi0cGUXqbshATEV9vhalN1u61AgJ7nDGeq4nXwjU439IwA90FFyodhL2ShNGyFykzyEW_h6M_i2iR1EKARQ=s1200',
    'https://lh3.googleusercontent.com/ZuH7tBAnYkLitQg1NPCzjGn4YxUhn89JZXZFdC9PI1s2vkykDxM3_a-TwTAIg3_hCxLSgF11G_bq61UVFXu1yBXNfPSMw7SE7l6umJKxgi2t=s1200',
    'https://lh3.googleusercontent.com/IVI4TvRUee1fXcBnoFfWPRCD0ItkUfz0LmV90H8iVDQP5v3GuBX-4IGWxF2m8E0YLhaQqxZujWr9L54toHwQGvwUNnDrkJ3Dpl3p-yhhEBhl=s1200',
    'https://lh3.googleusercontent.com/e-wmrFhbReSF_ZRQf0KSxXxsz_8o-5zm4AzoCMTfh6KDM11TtYvIRi344cJHQvVkfnF65N-KZ18qY31IYGMS6rHiWh0rtyNw3HJm7mzrgntP=s1200',
    'https://lh3.googleusercontent.com/-GnD5eiMJRG_Lor2hakv2aP27SL2fdFdML9lQj-uvKoVkA-wXSKuJ4EdOG86-L7dzwco2WrFdeb5I41zQDR_Pu0smFqIj5B7gMuH8gG7uFA=s1200',
    'https://lh3.googleusercontent.com/KVdACYcPwKRf23E8d7-gEet_tlBNcL5iTeSKlUzshHqReUzgOqcPXHbVutiOg4JMYdkAufN-mx9MoMrjBW3-5ZHQba-3NKQzg1OmtqTQXoRX=s1200',
    'https://lh3.googleusercontent.com/WemdHnb-ZFUB5NO-u7fAsb4VEG7VHTpw85gF587ExZqgf4c1In0qHF_DS1j7RwSn1K_1O0EwOV5ZTA-vB9epPWMllXQ6Yq9ZlRsG4BnZw2g=s1200'
  ],
  agente: {
    nombre: 'Yonatan De Jesus Aristizabal Yepes',
    telefono: '3045335855',
    email: 'asesorescalainmobiliaria12@gmail.com'
  },
  coordenadas: {
    lat: 6.13596,
    lng: -75.6186
  }
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imagenActual, setImagenActual] = useState(0);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const property = mockProperty;

  // Auto carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setImagenActual((prev) => (prev + 1) % property.imagenes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [property.imagenes.length]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const displayedFeatures = showAllFeatures ? property.caracteristicas : property.caracteristicas.slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-escala-accent transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Volver a propiedades
          </button>
        </div>

        {/* Image Gallery - Full Width Carousel */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
          <div className="relative h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl group">
            {property.imagenes.map((img, index) => (
              <img 
                key={index}
                src={img} 
                alt={`${property.titulo} - Imagen ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  imagenActual === index ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            
            {/* Overlay with operation badge */}
            <div className="absolute top-4 left-4">
              <span className="px-4 py-2 bg-escala-accent text-white text-sm font-bold rounded-full uppercase tracking-wider shadow-lg">
                {property.operacion}
              </span>
            </div>

            {/* Navigation arrows */}
            <button 
              onClick={() => setImagenActual((imagenActual - 1 + property.imagenes.length) % property.imagenes.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <svg className="w-6 h-6 text-escala-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => setImagenActual((imagenActual + 1) % property.imagenes.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <svg className="w-6 h-6 text-escala-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {property.imagenes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setImagenActual(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    imagenActual === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>

            {/* Image counter */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
              {imagenActual + 1} / {property.imagenes.length}
            </div>
          </div>
        </div>

        {/* Property Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title and Location */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-heading font-bold text-escala-dark mb-2">
                      {property.titulo}
                    </h1>
                    <p className="text-gray-500 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {property.ubicacion}, {property.departamento}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-heading font-black text-escala-accent">
                      {formatPrice(property.precio)}
                    </p>
                    <p className="text-sm text-gray-400 font-medium">COP / mes</p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mx-auto mb-2">
                      <svg className="w-5 h-5 text-escala-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <p className="text-xl font-bold text-escala-dark">{property.alcobas}</p>
                    <p className="text-xs text-gray-400 font-medium uppercase">Alcobas</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mx-auto mb-2">
                      <svg className="w-5 h-5 text-escala-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <p className="text-xl font-bold text-escala-dark">{property.banos}</p>
                    <p className="text-xs text-gray-400 font-medium uppercase">Baños</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mx-auto mb-2">
                      <svg className="w-5 h-5 text-escala-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </div>
                    <p className="text-xl font-bold text-escala-dark">{property.area}m²</p>
                    <p className="text-xs text-gray-400 font-medium uppercase">Área</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mx-auto mb-2">
                      <svg className="w-5 h-5 text-escala-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                    </div>
                    <p className="text-xl font-bold text-escala-dark">{property.parqueadero}</p>
                    <p className="text-xs text-gray-400 font-medium uppercase">Parqueadero</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-heading font-bold text-escala-dark mb-4">Descripción</h2>
                <p className="text-gray-600 leading-relaxed">{property.descripcion}</p>
              </div>

              {/* Features */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-heading font-bold text-escala-dark mb-4">Características del inmueble</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {displayedFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                      <div className="w-2 h-2 bg-escala-accent rounded-full"></div>
                      <span className="text-sm font-medium text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                {property.caracteristicas.length > 8 && (
                  <button 
                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                    className="mt-4 text-escala-accent font-semibold hover:underline"
                  >
                    {showAllFeatures ? 'Mostrar menos' : `Ver todas las características (${property.caracteristicas.length})`}
                  </button>
                )}
              </div>

{/* Location */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-4">Ubicación</h2>
                <div className="h-80 rounded-xl overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${property.coordenadas.lat},${property.coordenadas.lng}&z=15&output=embed`}
                    title="Ubicación de la propiedad"
                  ></iframe>
                </div>
                <div className="flex gap-3 mt-4">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${property.coordenadas.lat},${property.coordenadas.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
                    </svg>
                    Cómo llegar (Maps)
                  </a>
                  <a 
                    href={`https://waze.com/ul?ll=${property.coordenadas.lat},${property.coordenadas.lng}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-semibold transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.727 2.675a.939.939 0 00-.588.25l-4.453 3.034a.936.936 0 00-.468.788v7.069c0 .515.418.933.933.933h2.806c.515 0 .933-.418.933-.933V6.747c0-.282-.12-.546-.316-.727l-2.388-2.386a.939.939 0 00-.449-.334zm-3.366 4.637c-.769.769-2.035.769-2.804 0a2.002 2.002 0 010-2.828c.769-.769 2.035-.769 2.804 0a2.002 2.002 0 010 2.828z"/>
                    </svg>
                    Waze
                  </a>
                </div>
              </div>
            </div>

            {/* Sidebar - Agent Card */}
            <div className="space-y-6">
              {/* Agent Contact */}
              <div className="bg-white rounded-2xl p-6 shadow-xl sticky top-24">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-escala-accent to-orange-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {property.agente.nombre.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="font-bold text-escala-dark">{property.agente.nombre}</h3>
                  <p className="text-sm text-gray-500">Asesor Inmobiliario</p>
                </div>

                <div className="space-y-3">
                  <a 
                    href={`https://wa.me/+57${property.agente.telefono}?text=Buen dia, estoy interesado en el inmueble ${property.titulo} código: ${property.codigo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BD5A] text-white py-3 px-4 rounded-xl font-bold transition-colors shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                  
                  <a 
                    href={`tel:+57${property.agente.telefono}`}
                    className="flex items-center justify-center gap-2 w-full bg-escala-dark hover:bg-slate-800 text-white py-3 px-4 rounded-xl font-bold transition-colors shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Llamar
                  </a>

                  <button className="flex items-center justify-center gap-2 w-full border-2 border-escala-accent text-escala-accent hover:bg-escala-accent hover:text-white py-3 px-4 rounded-xl font-bold transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Enviar correo
                  </button>
                </div>

                {/* Código */}
                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-400">Código propiedad</p>
                  <p className="text-xl font-bold text-escala-dark">{property.codigo}</p>
                </div>

                {/* Share */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-400 mb-3">Compartir en:</p>
                  <div className="flex justify-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                    <button className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyDetail;
