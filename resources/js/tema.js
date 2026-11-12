// =========================================================================
// MODO OSCURO · botón en la barra superior
// -------------------------------------------------------------------------
// Cómo funciona:
//  1. Pone data-theme="dark" o "light" en <html>; el CSS (themes/_dark.scss)
//     ya sabe cambiar los colores con ese atributo.
//  2. La elección se guarda en localStorage para las demás páginas.
//  3. Si el usuario nunca ha elegido, se respeta el modo del sistema.
//
// Se enlaza en el <head> (sin defer) para aplicar el tema ANTES de pintar
// la página y evitar el parpadeo claro → oscuro.
// =========================================================================

// 1. Aplicar el tema guardado cuanto antes
let temaGuardado = null;
try { temaGuardado = localStorage.getItem('tema'); } catch (e) { /* modo privado */ }
if (temaGuardado) document.documentElement.dataset.theme = temaGuardado;

// ¿Está ahora en oscuro? (elección guardada o, si no hay, el sistema)
function esOscuro() {
  const tema = document.documentElement.dataset.theme;
  if (tema) return tema === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// 2. Crear el botón cuando la página ya está cargada
document.addEventListener('DOMContentLoaded', () => {
  const menuUsuario = document.querySelector('.topbar .user-menu');
  if (!menuUsuario) return; // en el login no hay barra superior

  const boton = document.createElement('button');
  boton.className = 'btn btn--ghost btn--icon';
  boton.type = 'button';
  boton.innerHTML = '<span class="tema-icono" aria-hidden="true"></span><span class="visually-hidden">Modo oscuro</span>';

  function actualizarBoton() {
    const oscuro = esOscuro();
    boton.setAttribute('aria-pressed', oscuro);
    boton.querySelector('.tema-icono').textContent = oscuro ? '☀️' : '🌙';
  }

  // 3. Al pulsar: cambiar al tema contrario y guardarlo
  boton.addEventListener('click', () => {
    const nuevo = esOscuro() ? 'light' : 'dark';
    document.documentElement.dataset.theme = nuevo;
    try { localStorage.setItem('tema', nuevo); } catch (e) { /* modo privado */ }
    actualizarBoton();
  });

  actualizarBoton();
  menuUsuario.before(boton);
});
