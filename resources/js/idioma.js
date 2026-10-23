// =========================================================================
// SELECTOR DE IDIOMA · Español (original) · English · Français
// -------------------------------------------------------------------------
// Cómo funciona:
//  1. El HTML está escrito en español.
//  2. Las traducciones están en public/lang/en.json y public/lang/fr.json:
//     { "texto en español": "texto traducido" }
//  3. Al cambiar de idioma se recorren los textos de la página y se cambian
//     por su traducción. Para volver a español se usa el texto guardado.
//  4. El idioma elegido se guarda en localStorage para las demás páginas.
//
// Hay TRES diseños (variantes). Al final del archivo se elige uno
// dejando su línea sin comentar.
//
// Necesita XAMPP o Live Server (fetch no lee archivos .json con doble clic).
// =========================================================================

const IDIOMAS = { es: 'Español', en: 'English', fr: 'Français' };

// Carpeta public/lang/ calculada desde la ruta de este script
const RUTA_LANG = document.currentScript.src.replace('resources/js/idioma.js', 'public/lang/');

// Atributos que también se traducen (además del texto visible)
const ATRIBUTOS = ['placeholder', 'aria-label', 'title', 'alt', 'data-label'];

let traducciones = {};          // diccionario del idioma actual
const textoOriginal = new Map(); // cada trozo de texto → su texto en español
const tituloOriginal = document.title;

// Devuelve la traducción de un texto en español (o el mismo texto si no hay)
function t(textoEspanol) {
  return traducciones[textoEspanol] || textoEspanol;
}

// ---------- Cambiar el idioma de toda la página ----------
async function cambiarIdioma(codigo) {
  // 1. Cargar el diccionario (el español no lo necesita)
  if (codigo === 'es') {
    traducciones = {};
  } else {
    const respuesta = await fetch(RUTA_LANG + codigo + '.json');
    traducciones = await respuesta.json();
  }

  // 2. Traducir los textos de la página
  const recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (recorrido.nextNode()) {
    const nodo = recorrido.currentNode;
    if (!textoOriginal.has(nodo)) textoOriginal.set(nodo, nodo.nodeValue);
    const original = textoOriginal.get(nodo);
    const limpio = original.trim();
    if (limpio) nodo.nodeValue = original.replace(limpio, t(limpio));
  }

  // 3. Traducir los atributos (el español se guarda en data-es-…)
  document.querySelectorAll('[' + ATRIBUTOS.join('],[') + ']').forEach((el) => {
    ATRIBUTOS.forEach((atributo) => {
      if (!el.hasAttribute(atributo)) return;
      const copia = 'data-es-' + atributo;
      if (!el.hasAttribute(copia)) el.setAttribute(copia, el.getAttribute(atributo));
      el.setAttribute(atributo, t(el.getAttribute(copia)));
    });
  });

  // 4. Título de la pestaña, idioma del documento y botones activos
  document.title = t(tituloOriginal);
  document.documentElement.lang = codigo;
  document.querySelectorAll('[data-idioma]').forEach((boton) => {
    boton.setAttribute('aria-pressed', boton.dataset.idioma === codigo);
  });
  document.querySelectorAll('.idioma-actual').forEach((span) => {
    span.textContent = codigo.toUpperCase();
  });

  // 5. Recordar la elección
  try { localStorage.setItem('idioma', codigo); } catch (e) { /* modo privado */ }
}

// Crea los tres botones de idioma (los usan las tres variantes)
function botonesIdioma(clase) {
  return Object.entries(IDIOMAS).map(([codigo, nombre]) =>
    `<button class="${clase}" type="button" data-idioma="${codigo}" lang="${codigo}">${nombre}</button>`
  ).join('');
}

// Sitio para un botón en la barra superior (en el login no hay barra)
function ponerEnBarra(elemento) {
  const menuUsuario = document.querySelector('.topbar .user-menu');
  if (menuUsuario) menuUsuario.before(elemento);
  else { elemento.classList.add('idioma-flotante'); document.body.prepend(elemento); }
}

// =========================================================================
// VARIANTE A · Menú desplegable en la barra superior + notificación
// Usa <details>, como el menú de usuario: se abre y cierra sin JavaScript.
// =========================================================================
function varianteDesplegable() {
  const menu = document.createElement('details');
  menu.className = 'user-menu idioma-menu';
  menu.innerHTML = `
    <summary class="btn btn--ghost idioma-menu__boton">🌐 <span class="idioma-actual">ES</span>
      <span class="visually-hidden">Cambiar idioma</span></summary>
    <div class="menu user-menu__panel">${botonesIdioma('menu__item')}</div>`;
  ponerEnBarra(menu);

  menu.querySelectorAll('[data-idioma]').forEach((boton) => {
    boton.addEventListener('click', async () => {
      menu.open = false;
      await cambiarIdioma(boton.dataset.idioma);
      mostrarNotificacion(t('Idioma cambiado.') + ' ' + IDIOMAS[boton.dataset.idioma]);
    });
  });
}

// Notificación flotante que desaparece sola a los 4 segundos
function mostrarNotificacion(texto) {
  const aviso = document.createElement('p');
  aviso.className = 'alert alert--success idioma-notificacion';
  aviso.setAttribute('role', 'status');
  aviso.textContent = '✓ ' + texto;
  document.body.append(aviso);
  setTimeout(() => aviso.remove(), 4000);
}

// =========================================================================
// VARIANTE B · Aviso en banda encima del contenido con botones ES | EN | FR
// Usa el mismo aviso (.alert) que «Revisa el stock».
// =========================================================================
function varianteBanda() {
  const banda = document.createElement('div');
  banda.className = 'alert alert--info idioma-banda';
  banda.innerHTML = `
    <p class="alert__body"><span class="alert__title">Idioma de la página</span>
      Elige en qué idioma quieres ver el panel.</p>
    <div class="idioma-banda__botones">${botonesIdioma('btn btn--sm btn--secondary')}</div>`;
  const contenido = document.querySelector('.app__content') || document.querySelector('.login');
  contenido.prepend(banda);

  banda.querySelectorAll('[data-idioma]').forEach((boton) => {
    boton.addEventListener('click', async () => {
      await cambiarIdioma(boton.dataset.idioma);
      banda.classList.replace('alert--info', 'alert--success'); // el aviso se pone verde
    });
  });
}

// =========================================================================
// VARIANTE C · Ventana emergente (<dialog>) con los tres idiomas
// Usa el mismo estilo que «¿Eliminar producto?» (.modal).
// =========================================================================
function varianteVentana() {
  const boton = document.createElement('button');
  boton.className = 'btn btn--ghost idioma-menu__boton';
  boton.type = 'button';
  boton.innerHTML = '🌐 <span class="idioma-actual">ES</span><span class="visually-hidden">Cambiar idioma</span>';
  ponerEnBarra(boton);

  const ventana = document.createElement('dialog');
  ventana.className = 'modal idioma-ventana';
  ventana.setAttribute('aria-labelledby', 'idioma-titulo');
  // form method="dialog": cada botón cierra la ventana y deja su value en returnValue
  ventana.innerHTML = `
    <form method="dialog">
      <h2 class="modal__title" id="idioma-titulo">Elige el idioma</h2>
      <p class="modal__text">El panel se mostrará en el idioma que elijas. Puedes cambiarlo cuando quieras.</p>
      <div class="idioma-ventana__opciones">
        ${Object.entries(IDIOMAS).map(([codigo, nombre]) =>
          `<button class="btn btn--secondary btn--block" value="${codigo}" data-idioma="${codigo}" lang="${codigo}">${nombre}</button>`).join('')}
      </div>
      <div class="modal__actions"><button class="btn btn--ghost" value="">Cancelar</button></div>
    </form>`;
  document.body.append(ventana);

  boton.addEventListener('click', () => {
    ventana.returnValue = ''; // si se cierra con Escape, no cambia nada
    ventana.showModal();
  });
  ventana.addEventListener('close', () => {
    if (ventana.returnValue) cambiarIdioma(ventana.returnValue);
    boton.focus();
  });
}

// =========================================================================
// ELIGE UNA VARIANTE: deja UNA línea sin comentar y comenta las otras dos
// =========================================================================
varianteDesplegable();   // A · Menú desplegable + notificación
// varianteBanda();      // B · Aviso en banda con botones
// varianteVentana();    // C · Ventana emergente

// Al cargar la página, aplicar el idioma guardado (español si no hay)
let idiomaGuardado = 'es';
try { idiomaGuardado = localStorage.getItem('idioma') || 'es'; } catch (e) { /* modo privado */ }
cambiarIdioma(idiomaGuardado);
