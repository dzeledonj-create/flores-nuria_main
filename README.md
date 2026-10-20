# Flores Nuria · Frontend (Reto 1)

Panel de gestión interna de la floristería **Flores Nuria**. Frontend estático: **solo HTML semántico y CSS** (escrito en Sass)
construido a partir del **Design System** del Hito 2. Este repositorio corresponde al **Hito 3 ·
Frontend estático/rediseñado**.

## Cómo verlo

Abre la carpeta con **Live Server** (VS Code) o en XAMPP (`http://localhost/flores-nuria_main/`) y entra en `index.html` (redirige al login).
También funciona abriendo los HTML directamente; Live Server se recomienda porque así se trabaja en el Reto 2.

## Cómo compilar los estilos

Los HTML **solo enlazan** `public/css/main.css` (y la alternativa `theme-dark.css`). El código fuente de los estilos está en `resources/scss/`.

```bash
npm install          # primera vez (instala Dart Sass y Stylelint)
npm run watch:css    # mientras se desarrolla (recompila al guardar)
npm run build:css    # antes de hacer commit / entregar (CSS minificado)
npm run lint:css     # pasa Stylelint sobre el CSS compilado (errores y advertencias)
```

## Estructura (preparada para Laravel)

El navegador solo necesita lo que está en `public/`; `resources/` es el código fuente (como en Laravel).

```
├── index.html                 → redirige a resources/views/login.html
├── public/                    → LO QUE CARGA EL NAVEGADOR
│   ├── css/main.css           → hoja principal compilada (la enlazan todas las vistas)
│   ├── css/theme-dark.css     → hoja ALTERNATIVA: tema oscuro (rel="alternate stylesheet")
│   ├── data/tickets.json      → datos de ejemplo que descarga «Exportar tickets»
│   ├── fonts/                 → Inter 400/500/600 en woff2 (autoalojada)
│   └── img/                   → logo.webp y favicon.png
├── resources/
│   ├── scss/                  → CÓDIGO FUENTE de los estilos (no lo lee el navegador)
│   │   ├── abstracts/         → _tokens, _functions, _mixins (no generan CSS)
│   │   ├── base/              → _root (custom properties + @font-face), _reset, _typography, _utilities
│   │   ├── themes/            → _dark (dentro de main.css) y alt-dark.scss (hoja alternativa)
│   │   ├── layout/            → _app (esqueleto + responsive), _login
│   │   ├── components/        → un parcial por componente del Design System
│   │   ├── docs/              → estilos de la guía y de la práctica (salen a docs/css/)
│   │   └── main.scss          → punto de entrada
│   └── views/                 → vistas HTML
│       ├── login.html, dashboard.html, … → vistas con una sola pantalla
│       ├── productos/ · pedidos/ · pagos/ · proveedores/ → listado + alta de cada sección
│       └── parciales/         → plantillas de referencia: sidebar, topbar y «pantalla de listado»
├── docs/                      → guía de estilo, práctica CE2B y memoria del H3
└── package.json               → comandos de compilación (npm run …)
```

Las vistas enlazan los recursos con rutas relativas (`../../public/…` desde `resources/views/` y
`../../../public/…` desde sus subcarpetas), así funcionan con Live Server o XAMPP. Al pasar a Laravel
serán plantillas Blade y enlazarán con `asset('css/main.css')`, porque allí `public/` es la raíz web.

## Tema oscuro (hoja alternativa)

Cada vista enlaza `public/css/theme-dark.css` como `<link rel="alternate stylesheet" title="Tema oscuro">`.
Se activa de cuatro formas: en Firefox con *Ver → Estilo de página → Tema oscuro*; con el modo oscuro del
sistema (`prefers-color-scheme`); en Chrome DevTools con *Rendering → Emulate prefers-color-scheme: dark*;
o escribiendo `data-theme="dark"` en `<html>`.

## Guía de estilo y práctica

- `docs/guia-estilo.html` — guía de estilo v1.1: tokens, tipografía, componentes con su HTML y cambios respecto al Hito 2.
  Usa el mismo `main.css` que la aplicación.
- `docs/practicas/inline-vs-externo.html` — práctica CE2B: el mismo componente con estilos inline y con clases.
  Es el único archivo del proyecto con atributos `style`.

## Reglas del código

- **Ningún color, tamaño ni espaciado suelto**: todo sale de `resources/scss/abstracts/_tokens.scss`
  (`color()`, `space()`, `radius()`, `shadow()` dan error si la clave no existe).
- **Clases BEM** (`.bloque__elemento--modificador`) generadas desde un parcial por componente.
- **Sin estilos en línea ni `<style>`** en los HTML; los gráficos SVG se colorean con clases.
- **Mobile-first**: móvil < 768 px · tablet 768–1023 px · escritorio ≥ 1024 px (mixins `respond()` y `below()`).
- **Accesibilidad WCAG 2.1 AA**: landmarks, un `h1` por página, etiquetas en todos los campos,
  foco visible común y `aria-current` en la página activa.
- **Interacción solo con HTML y CSS**: menú móvil y pop-ups con `:target`, menú de usuario y detalles con
  `<details>`, errores de formulario con la validación nativa y `:user-invalid`, tema oscuro con `prefers-color-scheme`.

## Componentes y dónde se usan

| Componente | Clases | Pantallas |
|---|---|---|
| Plantilla de listado | `.page-header` `.toolbar` `.table` `.pagination` | Cobros/Pagos, Productos, Ofertas, Pedidos, Proveedores |
| Sidebar + topbar | `.sidebar` `.topbar` `.breadcrumbs` `.user-menu` | Todas las pantallas internas |
| Botón | `.btn--primary/secondary/ghost/destructive/ghost-danger` | Todas |
| Campo de formulario | `.field` `.input` `.form-grid` | Login, formularios de alta y edición |
| Badge | `.badge--success/warning/error/brand` | Productos, Ofertas, Pedidos, Dashboard |
| Tarjeta / KPI | `.card` `.kpi--positive/negative/neutral` | Dashboard, Informes, formularios |
| Pop-up | `.modal-target` + `.modal` | Confirmar al eliminar en los 5 listados |
| Alerta | `.alert--warning/info` | Aviso de stock en Productos, exportación de tickets |

## Validación

- HTML: Nu Html Checker (W3C) · CSS: W3C CSS Validator · Accesibilidad: axe / WAVE / Lighthouse.
- Ver `CHANGELOG.md` para el historial de cambios del H3.
