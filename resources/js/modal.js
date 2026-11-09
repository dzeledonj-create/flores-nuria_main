// =========================================================================
// POP-UP DE CONFIRMACIÓN (mejora progresiva) · H8 CE5D-A5 / H9 CE6D-P3
// -------------------------------------------------------------------------
// El pop-up sigue abriéndose y cerrándose solo con CSS (:target). Sin este
// archivo funciona igual; con él se arreglan tres barreras de teclado:
//   1. Al abrirse, el foco entra en el pop-up (botón «Cancelar»).
//   2. Mientras está abierto, el resto de la página queda inerte: con Tab
//      no se puede salir del pop-up ni pulsar nada que hay detrás.
//   3. Escape lo cierra y el foco vuelve al botón que lo abrió.
// =========================================================================
(() => {
  // Todo lo que hay detrás del pop-up: enlace «Saltar al contenido», menú y contenido
  const fondo = [...document.body.children].filter((el) => !el.classList.contains('modal-target') && el.tagName !== 'SCRIPT');
  let disparador = null; // enlace «Eliminar …» que abrió el pop-up

  // Guardamos qué enlace abre el pop-up para devolverle el foco al cerrar
  document.addEventListener('click', (e) => {
    const enlace = e.target.closest('a[href^="#"]');
    if (!enlace) return;
    const destino = document.getElementById(enlace.getAttribute('href').slice(1));
    if (destino && destino.classList.contains('modal-target')) disparador = enlace;
  });

  // Cerrar = ir a #main, como hace el enlace «Cancelar» sin JavaScript (así :target se actualiza),
  // pero sin perder la posición de la página.
  function cerrar() {
    const y = window.scrollY;
    location.hash = 'main';
    window.scrollTo(0, y);
  }

  function actualizar() {
    const abierto = location.hash ? document.querySelector(`.modal-target${location.hash}`) : null;
    fondo.forEach((el) => { el.inert = Boolean(abierto); });
    if (abierto) {
      abierto.querySelector('.modal').setAttribute('aria-modal', 'true');
      (abierto.querySelector('.btn--secondary') || abierto.querySelector('a, button')).focus();
    } else if (disparador) {
      disparador.focus({ preventScroll: true });
      disparador = null;
    }
  }

  // «Cancelar» apunta a #main: lo convertimos en un cierre que no salta al contenido
  document.querySelectorAll('.modal-target .btn--secondary[href="#main"]').forEach((cancelar) => {
    cancelar.addEventListener('click', (e) => { e.preventDefault(); cerrar(); });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && location.hash && document.querySelector(`.modal-target${location.hash}`)) cerrar();
  });

  window.addEventListener('hashchange', actualizar);
  actualizar(); // por si se entra con la URL …#confirm-delete
})();
