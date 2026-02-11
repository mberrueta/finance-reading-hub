# Finance Reading Hub

Sitio estático (SPA) para leer y estudiar libros de finanzas de forma estructurada.

## Características

- **Estático y rápido**: HTML + CSS + JavaScript puro, sin backend
- **Carga dinámica**: Lee automáticamente archivos YAML desde `data/`
- **Navegación fluida**: Hash routing para experiencia SPA
- **GitHub Pages ready**: Compatible con hosting estático

## Estructura del proyecto

```
finance-reading-hub/
├── index.html          # HTML principal con estilos
├── app.js              # Lógica SPA (routing, rendering, YAML loading)
├── data/
│   ├── manifest.json   # Lista de archivos YAML (opcional)
│   └── *.yml           # Contenido de libros
└── images/             # Imágenes de portadas y capítulos (opcional)
```

## Formato de contenido YAML

Cada libro es un archivo `.yml` en `data/` con esta estructura:

```yaml
id: book-slug
title: Título del Libro
author: Nombre del Autor
cover: images/book/cover.jpg
audiobook:
  url: https://link-audiolibro
  duration: "5h 48m"
chapters:
  - id: 1
    title: Título del Capítulo
    core: Idea central del capítulo
    bullets:
      - Punto clave 1
      - Punto clave 2
      - Punto clave 3
    expand: |
      Texto adicional opcional con más detalles
    summary: |
      Resumen adicional del capítulo (opcional)
    audio:
      start: "00:03:10"
      duration: "12m"
    image: images/book/cap01.jpg
```

## Agregar un nuevo libro

### Opción 1: Usar manifest.json (recomendado)

1. Crea tu archivo YAML en `data/nuevo-libro.yml`
2. Agrega el nombre del archivo a `data/manifest.json`:

```json
{
  "files": [
    "psychology-of-money.yml",
    "nuevo-libro.yml"
  ]
}
```

### Opción 2: Lista hardcodeada

Si no usas manifest, edita `app.js` en la función `loadAllBooks()`:

```javascript
const bookFiles = [
  'psychology-of-money.yml',
  'nuevo-libro.yml'  // Agregar aquí
];
```

## Rutas del SPA

- `#` → Home (lista de libros)
- `#book/:bookId` → Vista de libro (lista de capítulos)
- `#book/:bookId/chapter/:chapterId` → Vista de capítulo con navegación

## Desarrollo local

Sirve el sitio con cualquier servidor HTTP estático:

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js
npx serve

# Opción 3: PHP
php -S localhost:8000
```

Luego abre `http://localhost:8000`

## Despliegue en GitHub Pages

1. Push a tu repositorio
2. Ve a Settings → Pages
3. Selecciona branch (main) y carpeta (root)
4. GitHub Pages publicará automáticamente

## Arquitectura del código

### `app.js` - Módulos principales

- **AppState**: Estado global (libros cargados, vista actual)
- **YAMLLoader**: Carga y parsea archivos YAML desde `data/`
- **Router**: Hash-based routing (`#book/id`, `#book/id/chapter/1`)
- **Views**: Funciones de renderizado (Home, Book, Chapter)
- **App**: Controlador principal que coordina todo

### Flujo de navegación

1. Usuario carga el sitio → `App.init()`
2. Se cargan todos los YAMLs → `YAMLLoader.loadAllBooks()`
3. Router parsea el hash → `Router.parseHash()`
4. Se renderiza la vista correspondiente → `Views.render*()`
5. Clicks en links actualizan el hash → `Router` dispara re-render

## Personalización

### Colores y estilos

Edita las variables CSS en `index.html`:

```css
:root {
  --bg: #0b0d10;
  --panel: #111318;
  --accent: #3b82f6;
  /* ... más variables */
}
```

### Agregar nuevas funcionalidades

- **Búsqueda**: Implementar filtro en vista Home
- **Progreso de lectura**: Usar localStorage para trackear capítulos leídos
- **Notas**: Sistema de anotaciones guardadas localmente
- **Modo oscuro/claro**: Toggle de tema con localStorage

## Licencia

Proyecto personal. Úsalo como quieras.
