// Renderiza las tres variantes para compararlas; en producción, conserva solo la elegida.
// Estos fragmentos se comparten entre las propuestas para mantener el contenido consistente.
const warningIcon = '<svg class="alert__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>';
const closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m18 6-12 12M6 6l12 12" /></svg>';
const message = '<span class="alert__title">Revisa el stock:</span> Orquídea blanca tiene stock bajo y Maceta de cerámica está agotada.';
const tableLink = '<a class="stock-alerts__link" href="#products-table">Ver productos</a>';
const options = [
  // Aviso permanente: muestra el mensaje completo y enlaza con la tabla de productos.
  `<div class="stock-alerts__option"><p class="stock-alerts__name">Opción 1 · Estática</p><div class="alert alert--warning">${warningIcon}<p class="alert__body">${message}<br>${tableLink}</p></div></div>`,
  // Aviso desplegable: mantiene visible un resumen y revela el mensaje completo al abrirlo.
  `<div class="stock-alerts__option"><p class="stock-alerts__name">Opción 2 · Desplegable</p><details class="stock-alerts__details"><summary class="alert alert--warning">${warningIcon}<span class="alert__body"><span class="alert__title">Aviso de stock</span><span class="stock-alerts__hint"> · Ver detalles</span></span><span class="stock-alerts__chevron" aria-hidden="true">⌄</span></summary><div class="alert alert--warning stock-alerts__message"><p class="alert__body">${message}<br>${tableLink}</p></div></details></div>`,
  // Aviso descartable: permite ocultarlo y restaurarlo sin recargar la página.
  `<div class="stock-alerts__option"><p class="stock-alerts__name">Opción 3 · Cerrable</p><div class="alert alert--warning" data-dismissible>${warningIcon}<p class="alert__body">${message}<br>${tableLink}</p><button class="alert__close" type="button" aria-label="Cerrar alerta">${closeIcon}</button></div><p class="stock-alerts__undo" role="status" hidden>Alerta oculta. <button class="stock-alerts__link" type="button" data-action="undo">Deshacer</button></p></div>`
];

// Los estilos quedan limitados a las clases de este componente.
const styles = document.createElement('style');
styles.textContent = `
  .stock-alerts { display: grid; gap: 14px; margin-bottom: 20px; }
  .stock-alerts__name { margin: 0 0 6px; color: var(--color-text-muted); font-size: .8rem; font-weight: 600; }
  .stock-alerts__details summary { cursor: pointer; list-style: none; }
  .stock-alerts__details summary::-webkit-details-marker { display: none; }
  .stock-alerts__details summary:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }
  .stock-alerts__hint { font-size: .85em; }
  .stock-alerts__chevron { margin-left: auto; transition: transform .2s; }
  .stock-alerts__details[open] .stock-alerts__chevron { transform: rotate(180deg); }
  .stock-alerts__message { margin: 4px 0 0; }
  .stock-alerts__message .alert__body { margin: 0; }
  .stock-alerts__link { display: inline-block; margin-top: 6px; padding: 0; border: 0; background: none; color: inherit; font: inherit; font-weight: 600; text-decoration: underline; text-underline-offset: 2px; cursor: pointer; }
  .stock-alerts__link:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }
  .stock-alerts__undo { margin: 8px 0 0; color: var(--color-text-muted); font-size: .9rem; }
  .stock-alerts__undo[hidden] { display: none; }
  @media (min-width: 900px) { .stock-alerts { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
`;
document.head.append(styles);

// El resto del módulo depende de este contenedor; falla explícitamente si falta en la página.
const container = document.querySelector('#stock-alert-options');
if (!container) throw new Error('No se encontró el contenedor de propuestas de alerta.');
container.className = 'stock-alerts';
container.innerHTML = options.join('');

// Un único listener en el contenedor gestiona los botones de la opción cerrable.
container.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  // Cada acción modifica únicamente la propuesta que contiene el botón pulsado.
  const option = button.closest('.stock-alerts__option');
  const alert = option.querySelector('[data-dismissible]');
  const undo = option.querySelector('.stock-alerts__undo');

  if (button.dataset.action === 'undo') {
    // Al restaurar la alerta, devuelve el foco al botón que permite cerrarla.
    alert.hidden = false;
    undo.hidden = true;
    alert.querySelector('.alert__close').focus();
    return;
  }

  // Al cerrarla, muestra la confirmación con la acción para deshacer.
  alert.hidden = true;
  undo.hidden = false;
  undo.querySelector('button').focus();
});
