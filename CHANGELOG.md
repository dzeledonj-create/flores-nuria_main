# Changelog

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
