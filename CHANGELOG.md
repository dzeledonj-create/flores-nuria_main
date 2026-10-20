# Changelog

## [H3 · revisión] — 2026-10-20

### Añadido
- Hoja alternativa `public/css/theme-dark.css` (fuente `resources/scss/themes/alt-dark.scss`) enlazada en las 19 vistas con `rel="alternate stylesheet"`.
- Guía de estilo v1.1 en `docs/guia-estilo.html` (estilos en `resources/scss/docs/guia.scss`).
- Práctica CE2B en `docs/practicas/inline-vs-externo.html` (estilos en `resources/scss/docs/practica.scss`).
- Stylelint (`.stylelintrc.json` y `npm run lint:css`).

### Cambiado
- Vistas organizadas en carpetas: `productos/`, `pedidos/`, `pagos/`, `proveedores/`; `partials/` pasa a llamarse `parciales/`.
- Estructura preparada para Laravel: vistas en `resources/views/`, SCSS en `resources/scss/`; lo que carga el navegador (CSS compilado, fuentes, imágenes, datos) en `public/`.
- `index.html` redirige a `resources/views/login.html`.
- El separador de las migas se escribe escapado (`\203A`): el CSS compilado es ASCII y Sass ya no le añade BOM.

### Eliminado
- `resources/js/menu.js`: JavaScript del proyecto PHP antiguo, sin uso en las vistas (el H3 es solo HTML y CSS).

### Corregido
- `font-weight` duplicado: el mixin `type()` acepta el peso como segundo parámetro.
- Selectores duplicados al usar `type-responsive()` y al sobrescribir `:focus-visible`: nuevo parámetro `focus-ring($offset)`.
- Bloque `.sidebar` repetido en `_sidebar.scss`.
- Botón en estado «cargando»: se quita `opacity`, que bajaba el contraste a 4,06:1.

## [H3] Frontend estático rediseñado — 2026-10

### Añadido
- Estilos en Sass organizados por módulos (`@use`/`@forward`) a partir del Design System: tokens, funciones, mixins y un parcial por componente.
- Tema oscuro con las mismas claves de tokens; se activa con la preferencia del sistema (`prefers-color-scheme`).
- Layout responsive: menú lateral desplegable en móvil (`:target`), colapsado en tablet y expandido en escritorio; tablas apiladas en móvil.
- Componentes nuevos: grupo de botones, interruptor, select con flecha por tokens, lista de casillas, pop-up con `:target`, menú de usuario con `<details>`, errores de formulario con `:user-invalid`, gráficos SVG con tokens, estado vacío, enlace «Saltar al contenido».
- `public/data/tickets.json` para el botón «Descargar tickets».
- Inter autoalojada (woff2), iconos Lucide en SVG, `README.md` y este `CHANGELOG.md`.

### Cambiado
- Las 19 vistas reescritas con HTML semántico: `nav`, `header`, `main`, `footer`, `section` con encabezado, `h1` único, `label for`, `th scope`, `time`, `caption`.
- Barra lateral y superior unificadas (plantillas en `app/views/partials/`).
- Colores sueltos sustituidos por tokens (también en los gráficos SVG).

### Eliminado
- `public/css/styles.css` (CSS antiguo con 72 colores distintos y 44 clases de utilidad).
- 3 estilos en línea, botones dentro de enlaces y atributos `fill` en los gráficos.
- Imágenes sin uso (`eliminar.jpg`) y logos pesados (`logo.png` 30 KB → `logo.webp` 6 KB).
