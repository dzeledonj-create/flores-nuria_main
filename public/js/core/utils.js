/**
 * Utilidades comunes para las vistas.
 */

// Escapa texto para insertarlo de forma segura dentro de HTML
function escapeHtml(valor) {
    return String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Igual que number_format($n, 2) de PHP: 1,234.56
function formatNumber(valor) {
    return Number(valor || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Fecha de hoy en formato YYYY-MM-DD (para inputs type=date)
function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// YYYY-MM-DD -> DD/MM/YYYY
function formatDate(fecha) {
    if (!fecha) return '';
    const [y, m, d] = String(fecha).substring(0, 10).split('-');
    return `${d}/${m}/${y}`;
}

/**
 * Muestra un mensaje de éxito o error en el contenedor #msg de la página
 */
function showMessage(texto, ok = true) {
    const contenedor = document.getElementById('msg');
    if (!contenedor || !texto) return;
    contenedor.innerHTML = `<div class="${ok ? 'color-green' : 'color-red'} mb-3">${escapeHtml(texto)}</div>`;
    contenedor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Mensaje que sobrevive a un cambio de página (por ejemplo: crear producto -> listado)
 */
function setFlash(texto, ok = true) {
    try {
        sessionStorage.setItem('flash', JSON.stringify({ texto, ok }));
    } catch (e) { /* sin almacenamiento disponible */ }
}

function showFlash() {
    try {
        const flash = JSON.parse(sessionStorage.getItem('flash') || 'null');
        sessionStorage.removeItem('flash');
        if (flash) showMessage(flash.texto, flash.ok);
    } catch (e) { /* sin almacenamiento disponible */ }
}

/**
 * Filtra las opciones de un <select> según el texto de un input
 */
function filterOptions(input, select) {
    const busqueda = input.value.toLowerCase();
    Array.from(select.options).forEach(option => {
        // La opción por defecto ("-- Seleccionar --") siempre visible
        if (option.value === '') {
            option.style.display = '';
            return;
        }
        option.style.display = option.text.toLowerCase().includes(busqueda) ? '' : 'none';
    });
}

// Muestra / oculta elementos
function show(el, display = 'block') {
    if (el) el.style.display = display;
}

function hide(el) {
    if (el) el.style.display = 'none';
}

// Rellena un <select> con opciones { value, text }
function fillSelect(select, opciones, textoDefecto = null) {
    select.innerHTML = (textoDefecto !== null ? `<option value="">${escapeHtml(textoDefecto)}</option>` : '')
        + opciones.map(o => `<option value="${escapeHtml(o.value)}">${escapeHtml(o.text)}</option>`).join('');
}
