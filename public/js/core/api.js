/**
 * Conexión entre las vistas HTML y el backend PHP.
 * Todas las peticiones pasan por api/index.php?controller=xxx&action=yyy
 * y el backend responde siempre { ok, message, data }.
 */
const API_URL = '../../api/index.php';

/**
 * Llama a una acción de un controlador PHP.
 * @param {string} controller nombre del controlador (productos, pedidos...)
 * @param {string} action método del controlador (listar, crear...)
 * @param {object} [opciones]
 * @param {object} [opciones.params] parámetros GET (filtros, búsquedas)
 * @param {FormData|HTMLFormElement|object} [opciones.body] datos a enviar por POST
 * @returns {Promise<{ok: boolean, message: string, data: any}>}
 */
async function api(controller, action, { params = {}, body = null } = {}) {
    const url = new URL(API_URL, window.location.href);
    url.searchParams.set('controller', controller);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== '') {
            url.searchParams.set(clave, valor);
        }
    });

    const opciones = { credentials: 'same-origin', headers: { Accept: 'application/json' } };
    if (body) {
        opciones.method = 'POST';
        opciones.body = toFormData(body);
    }

    let respuesta;
    try {
        respuesta = await fetch(url, opciones);
    } catch (e) {
        return { ok: false, message: 'No se pudo conectar con el servidor.', data: null };
    }

    // Sesión caducada o no iniciada: volvemos al login
    if (respuesta.status === 401 && !window.location.pathname.endsWith('login.html')) {
        window.location.href = 'login.html';
        return new Promise(() => {});
    }

    try {
        return await respuesta.json();
    } catch (e) {
        return { ok: false, message: 'Respuesta inválida del servidor.', data: null };
    }
}

/**
 * Convierte un formulario u objeto plano en FormData (los arrays se envían como clave[])
 */
function toFormData(datos) {
    if (datos instanceof FormData) return datos;
    if (datos instanceof HTMLFormElement) return new FormData(datos);
    const formData = new FormData();
    Object.entries(datos).forEach(([clave, valor]) => {
        if (Array.isArray(valor)) {
            valor.forEach(v => formData.append(clave + '[]', v));
        } else if (valor !== undefined && valor !== null) {
            formData.append(clave, valor);
        }
    });
    return formData;
}
