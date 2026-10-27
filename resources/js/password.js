// =========================================================================
// VER LA CONTRASEÑA DEL LOGIN · tres opciones
// -------------------------------------------------------------------------
// Las tres hacen lo mismo por dentro: cambian el input de
//   type="password"  (●●●●●)   a   type="text"  (se ve lo escrito)
// Cambia solo la forma de pedirlo. Al final del archivo se elige una
// dejando su línea sin comentar.
// =========================================================================

const campo = document.querySelector('#password');

// Iconos de Lucide (ojo abierto y ojo tachado)
const OJO = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/></svg>';
const OJO_TACHADO = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c4.76 0 8.48 3.19 9.94 6.65a1 1 0 0 1 0 .7 10.8 10.8 0 0 1-1.6 2.6"/><path d="M6.61 6.61A13.53 13.53 0 0 0 2.06 11.65a1 1 0 0 0 0 .7A10.75 10.75 0 0 0 12 19a10.6 10.6 0 0 0 5.39-1.61"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="m2 2 20 20"/></svg>';

// Muestra u oculta la contraseña
function verContrasena(mostrar) {
  campo.type = mostrar ? 'text' : 'password';
}

// =========================================================================
// OPCIÓN A · El ojo de siempre dentro del campo
// Un clic la muestra y otro clic la oculta.
// =========================================================================
function opcionOjo() {
  // Se mete el input en una caja para colocar el botón encima (a la derecha)
  const caja = document.createElement('div');
  caja.className = 'input-wrap';
  campo.before(caja);
  caja.append(campo);

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'input-wrap__action';
  boton.setAttribute('aria-label', 'Mostrar contraseña');
  boton.setAttribute('aria-pressed', 'false');
  boton.innerHTML = OJO;
  caja.append(boton);

  boton.addEventListener('click', () => {
    const mostrar = campo.type === 'password';
    verContrasena(mostrar);
    boton.setAttribute('aria-pressed', mostrar);
    boton.innerHTML = mostrar ? OJO_TACHADO : OJO;
    campo.focus(); // el cursor vuelve al campo para seguir escribiendo
  });
}

// =========================================================================
// OPCIÓN B · Mantén pulsado para ver
// La contraseña solo se ve MIENTRAS se mantiene pulsado el botón; al soltar
// se tapa sola. Funciona con ratón, con el dedo (móvil) y con teclado
// (mantener Espacio o Intro). Mientras se ve, el campo se marca en color.
// =========================================================================
function opcionMantener() {
  const caja = document.createElement('div');
  caja.className = 'input-wrap password-mantener';
  campo.before(caja);
  caja.append(campo);

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'password-mantener__boton';
  boton.innerHTML = OJO + '<span>Mantén para ver</span>';
  caja.append(boton);

  const mostrar = () => { verContrasena(true); caja.classList.add('is-visible'); };
  const ocultar = () => { verContrasena(false); caja.classList.remove('is-visible'); };

  // Ratón y dedo: pulsar = ver, soltar o salir del botón = ocultar
  boton.addEventListener('pointerdown', (e) => { e.preventDefault(); mostrar(); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => boton.addEventListener(ev, ocultar));
  boton.addEventListener('contextmenu', (e) => e.preventDefault()); // sin menú al mantener en móvil

  // Teclado: mantener Espacio o Intro
  boton.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); mostrar(); }
  });
  boton.addEventListener('keyup', ocultar);
  boton.addEventListener('blur', ocultar);
}

// =========================================================================
// OPCIÓN C · Ver durante 5 segundos y se oculta sola
// Pensada para el ordenador del mostrador: si alguien la deja a la vista,
// se vuelve a tapar sin tener que acordarse. Un anillo con el número
// (5, 4, 3, 2, 1) marca el tiempo que queda.
// =========================================================================
function opcionTemporal() {
  const SEGUNDOS = 5;
  const caja = document.createElement('div');
  caja.className = 'input-wrap password-temporal';
  campo.before(caja);
  caja.append(campo);

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'btn btn--ghost btn--sm password-temporal__boton';
  boton.innerHTML = `
    <span class="password-temporal__anillo" aria-hidden="true">
      <svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15"/></svg>
      <span class="password-temporal__numero">${SEGUNDOS}</span>
    </span>
    <span class="password-temporal__ver">Ver 5 s</span>
    <span class="password-temporal__ocultar" hidden>Ocultar</span>`;
  caja.append(boton);
  const numero = boton.querySelector('.password-temporal__numero');
  const textoVer = boton.querySelector('.password-temporal__ver');
  const textoOcultar = boton.querySelector('.password-temporal__ocultar');
  // Se enseña un texto u otro (no se reescribe, así idioma.js los traduce bien)
  const cambiarTexto = (visible) => { textoVer.hidden = visible; textoOcultar.hidden = !visible; };

  let temporizador = null;
  let cuenta = null;

  const ocultar = () => {
    clearTimeout(temporizador);
    clearInterval(cuenta);
    caja.classList.add('is-tapando'); // las letras se «cierran»…
    setTimeout(() => {                // …y después vuelven los puntos
      verContrasena(false);
      caja.classList.remove('is-visible', 'is-tapando');
      cambiarTexto(false);
    }, 250);
  };

  boton.addEventListener('click', () => {
    if (campo.type === 'text') { ocultar(); return; } // segundo clic: ocultar ya
    verContrasena(true);
    caja.classList.add('is-visible'); // arranca el anillo (CSS)
    cambiarTexto(true);
    let quedan = SEGUNDOS;
    numero.textContent = quedan;
    cuenta = setInterval(() => {
      quedan -= 1;
      if (quedan > 0) numero.textContent = quedan; // 5, 4, 3, 2, 1
    }, 1000);
    temporizador = setTimeout(ocultar, SEGUNDOS * 1000);
    campo.focus();
  });
}

// =========================================================================
// ELIGE UNA OPCIÓN: deja UNA línea sin comentar y comenta las otras dos
// =========================================================================
if (campo) {
  opcionOjo();          // A · Ojo dentro del campo
  // opcionMantener();  // B · Mantén pulsado para ver
  // opcionTemporal();  // C · Ver 5 segundos y se oculta sola
}

// Por seguridad, la contraseña nunca se envía «a la vista»: al enviar el
// formulario se vuelve a tapar (así el navegador no la guarda como texto).
document.querySelector('.login__form')?.addEventListener('submit', () => verContrasena(false));
