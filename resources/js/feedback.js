// =========================================================================
// CONFIRMACIÓN DESPUÉS DE GUARDAR O ELIMINAR · H9 CE6C (cambio U3)
// -------------------------------------------------------------------------
// Problema detectado: al pulsar «Guardar producto» o «Eliminar» la aplicación
// volvía al listado sin decir nada; no se sabía si la acción había funcionado
// y en la prueba se repetía el envío. Los formularios envían por GET al
// listado, así que leemos la URL y mostramos un aviso de éxito.
// role="status" hace que el lector de pantalla lo anuncie sin mover el foco.
// En el Reto 2 el mensaje lo pondrá el servidor (mensaje flash de Laravel).
// =========================================================================
(() => {
  const datos = new URLSearchParams(location.search);
  if (!datos.toString() || datos.has('q') || datos.has('familia')) return; // búsquedas: sin aviso

  let texto = 'Los cambios se han guardado.';
  if (datos.has('eliminado')) texto = 'Registro eliminado.';
  else if (datos.get('nombre')) texto = `«${datos.get('nombre')}» se ha guardado correctamente.`;
  else if (datos.has('id_proveedor')) texto = 'Pedido guardado correctamente.';
  else if (datos.has('pedido')) texto = `Estado del pedido actualizado a «${datos.get('estado')}».`;

  const aviso = document.createElement('div');
  aviso.className = 'alert alert--success feedback';
  aviso.setAttribute('role', 'status');
  aviso.innerHTML = '<svg class="alert__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 6 9 17l-5-5"/></svg><p class="alert__body"></p>';
  aviso.querySelector('.alert__body').textContent = texto; // textContent: el nombre no se interpreta como HTML

  const cabecera = document.querySelector('.page-header');
  if (cabecera) cabecera.after(aviso);
  history.replaceState(null, '', location.pathname); // al recargar no se repite el aviso
})();
