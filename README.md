# Escala Inmobiliaria

Sitio web moderno de bienes raíces para Escala Inmobiliaria, expertos en propiedades en Medellín y Sabaneta, Colombia.

## 🚀 Características

- **Diseño moderno** con glassmorphism y animaciones fluidas
- **Totalmente responsive** para móviles, tablets y escritorio
- **Búsqueda inteligente** de propiedades por tipo, gestión, ciudad y barrio
- **Catálogo de propiedades** con tarjetas interactivas
- **Efectos GSAP** para animaciones suaves
- **Integración con WhatsApp** para contacto directo
- **SEO optimizado** con meta tags y schema markup

## 🛠️ Tech Stack

- **React 19** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **GSAP** - Animaciones
- **React Router** - Navegación
- **Lucide React** - Iconos

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/JefferCB1/Demo_escala_inmobiliria-.git

# Entrar al directorio
cd Demo_escala_inmobiliria-

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 🏗️ Build para Producción

```bash
npm run build
```

El build se generará en la carpeta `dist/`

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── layout/          # Navbar, Footer, GlobalLayout
│   ├── sections/         # Hero, PropertyGrid, LogoStrip, etc.
│   └── ui/              # SmartSearch, StickyBottomBar, etc.
├── pages/               # PropertiesPage, PropertyDetail
├── styles/              # global.css, output.css
├── App.jsx              # Componente principal
└── main.jsx             # Entry point
```

## 🔧 Configuración

### Tailwind CSS
El archivo `tailwind.config.js` contiene:
- Colores personalizados de marca
- Fuentes: Inter (sans) y Outfit (headings)
- Animaciones personalizadas

### Variables de Entorno
Crear `.env` si es necesario:
```env
VITE_API_URL=tu_url_api
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **XL**: > 1280px

## 📬 Contacto

- **WhatsApp**: 300 912 2101
- **Email**: info@escalainmobiliaria.com.co
- **Medellín**: Calle 35 No 81 09 interior 201, Laureles
- **Sabaneta**: Carrera 45 # 72 sur - 07 interior 302

## 📄 Licencia

Copyright © 2024 Escala Inmobiliaria. Todos los derechos reservados. TAE SAS.

---

Desarrollado con ❤️ para el mercado inmobiliario colombiano
