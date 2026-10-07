/**
 * Vista de ofertas: listado, crear, editar, activar/desactivar y borrar.
 * Los formularios de crear y editar comparten la gestión de productos (type = 'create' | 'edit').
 */
let ofertas = [];
let busqueda = '';

async function cargarOfertas() {
    const respuesta = await api('ofertas', 'listar', { params: { search: busqueda } });
    if (!respuesta.ok) {
        showMessage(respuesta.message, false);
        return;
    }
    ofertas = respuesta.data;
    renderOfertas();
}

async function cargarProductos() {
    const respuesta = await api('productos', 'listar');
    if (!respuesta.ok) return;
    const opciones = respuesta.data.map(p => ({
        value: p.idProducto,
        text: `${p.nombre} (${formatNumber(p.precioConIva)} €)`,
    }));
    fillSelect(document.getElementById('select-create-prod'), opciones);
    fillSelect(document.getElementById('select-edit-prod'), opciones);
}

function estadoHtml(oferta) {
    const caducada = oferta.fechaFin && oferta.fechaFin < today();
    if (!oferta.activa) return '<span class="status-badge status-inactive">Inactiva</span>';
    if (caducada) return '<span class="status-badge status-expired">Caducada</span>';
    return '<span class="status-badge status-active">Activa</span>';
}

function renderOfertas() {
    const tbody = document.getElementById('offers-body');
    if (ofertas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay ofertas registradas.</td></tr>';
        return;
    }
    tbody.innerHTML = ofertas.map(o => {
        const id = escapeHtml(o.idOferta);
        return `
        <tr>
            <td>${escapeHtml(o.nombre)}</td>
            <td>${formatNumber(o.descuento)} %</td>
            <td>${escapeHtml(o.productoNombre)}</td>
            <td>${o.fechaFin ? formatDate(o.fechaFin) : 'Sin límite'}</td>
            <td>
                <div class="d-flex align-center gap-2">
                    <label class="switch">
                        <input type="checkbox" ${o.activa ? 'checked' : ''} data-toggle="${id}">
                        <span class="slider round"></span>
                    </label>
                    ${estadoHtml(o)}
                </div>
            </td>
            <td class="actions">
                <button type="button" class="btn-edit" data-edit="${id}">✎</button>
                <button type="button" class="btn-delete" data-delete="${id}">🗑</button>
            </td>
        </tr>`;
    }).join('');
}

/* ---------- Gestión de productos dentro del formulario ---------- */

function contenedorProductos(type) {
    return document.getElementById(`container-${type}-prod`);
}

function actualizarMensajeVacio(type) {
    const contenedor = contenedorProductos(type);
    const vacio = contenedor.querySelector('.empty-prod');
    const hayProductos = contenedor.querySelector('input[name="productos[]"]') !== null;
    if (vacio) vacio.style.display = hayProductos ? 'none' : 'block';
}

function anadirProducto(type, id, nombre) {
    if (!id) return;
    const contenedor = contenedorProductos(type);
    // Evitar duplicados
    const yaExiste = Array.from(contenedor.querySelectorAll('input[name="productos[]"]')).some(i => i.value === String(id));
    if (yaExiste) return;

    const div = document.createElement('div');
    div.className = 'offer-product-item';
    div.innerHTML = `
        <span class="text-md">${escapeHtml(nombre)}</span>
        <input type="hidden" name="productos[]" value="${escapeHtml(id)}">
        <button type="button" class="btn secondary btn-sm btn-close-sm" data-remove-product>X</button>`;
    contenedor.appendChild(div);
    actualizarMensajeVacio(type);
}

function anadirSeleccionado(type) {
    const select = document.getElementById(`select-${type}-prod`);
    const opcion = select.options[select.selectedIndex];
    if (opcion) anadirProducto(type, opcion.value, opcion.text);
}

function anadirTodos(type) {
    const select = document.getElementById(`select-${type}-prod`);
    Array.from(select.options).forEach(o => anadirProducto(type, o.value, o.text));
}

function vaciarProductos(type) {
    contenedorProductos(type).querySelectorAll('.offer-product-item').forEach(el => el.remove());
    actualizarMensajeVacio(type);
}

/* ---------- Formularios ---------- */

function mostrarCrear() {
    cerrarEditar();
    show(document.getElementById('form-create-offer'));
}

function cerrarCrear() {
    const form = document.getElementById('form-create-offer');
    hide(form);
    form.reset();
    vaciarProductos('create');
}

function editarOferta(id) {
    const oferta = ofertas.find(o => String(o.idOferta) === String(id));
    if (!oferta) return;
    hide(document.getElementById('form-create-offer'));

    const form = document.getElementById('form-edit-offer');
    show(form);
    show(document.getElementById('edit-title'));

    document.getElementById('edit-id-oferta').value = oferta.idOferta;
    document.getElementById('edit-nombre-oferta').value = oferta.nombre ?? '';
    document.getElementById('edit-descuento-oferta').value = oferta.descuento;
    document.getElementById('edit-fechafin-oferta').value = oferta.fechaFin ?? '';
    document.getElementById('edit-activa-oferta').value = oferta.activa ? '1' : '0';

    vaciarProductos('edit');
    const select = document.getElementById('select-edit-prod');
    oferta.productosIds.forEach(idProd => {
        const opcion = Array.from(select.options).find(o => o.value === idProd);
        if (opcion) anadirProducto('edit', opcion.value, opcion.text);
    });

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cerrarEditar() {
    hide(document.getElementById('form-edit-offer'));
    hide(document.getElementById('edit-title'));
}

async function cambiarEstado(id) {
    const respuesta = await api('ofertas', 'cambiarEstado', { body: { idOferta: id } });
    showMessage(respuesta.message, respuesta.ok);
    cargarOfertas();
}

async function eliminarOferta(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta oferta?')) return;
    const respuesta = await api('ofertas', 'eliminar', { body: { idOferta: id } });
    showMessage(respuesta.message, respuesta.ok);
    if (respuesta.ok) cargarOfertas();
}

async function guardar(form, accion, alTerminar) {
    const respuesta = await api('ofertas', accion, { body: form });
    showMessage(respuesta.message, respuesta.ok);
    if (respuesta.ok) {
        alTerminar();
        cargarOfertas();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarOfertas();
    cargarProductos();

    document.getElementById('search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        busqueda = e.target.search.value.trim();
        cargarOfertas();
    });

    document.getElementById('show-all').addEventListener('click', () => {
        busqueda = '';
        document.getElementById('search-form').reset();
        cargarOfertas();
    });

    document.getElementById('new-offer').addEventListener('click', mostrarCrear);

    // Eventos comunes de los dos formularios (crear / editar)
    document.querySelectorAll('#form-create-offer, #form-edit-offer').forEach(form => {
        const type = form.dataset.type;

        document.getElementById(`search-${type}-prod`).addEventListener('keyup', (e) => {
            filterOptions(e.target, document.getElementById(`select-${type}-prod`));
        });
        form.querySelector('[data-add-product]').addEventListener('click', () => anadirSeleccionado(type));
        form.querySelector('[data-add-all]').addEventListener('click', () => anadirTodos(type));
        form.querySelector('[data-cancel]').addEventListener('click', type === 'create' ? cerrarCrear : cerrarEditar);

        contenedorProductos(type).addEventListener('click', (e) => {
            const quitar = e.target.closest('[data-remove-product]');
            if (quitar) {
                quitar.closest('.offer-product-item').remove();
                actualizarMensajeVacio(type);
            }
        });
    });

    document.getElementById('form-create-offer').addEventListener('submit', (e) => {
        e.preventDefault();
        guardar(e.target, 'crear', cerrarCrear);
    });

    document.getElementById('form-edit-offer').addEventListener('submit', (e) => {
        e.preventDefault();
        guardar(e.target, 'actualizar', cerrarEditar);
    });

    // Interruptor de estado, editar y borrar de cada fila
    const tbody = document.getElementById('offers-body');
    tbody.addEventListener('change', (e) => {
        const toggle = e.target.closest('[data-toggle]');
        if (toggle) cambiarEstado(toggle.dataset.toggle);
    });
    tbody.addEventListener('click', (e) => {
        const editar = e.target.closest('[data-edit]');
        const borrar = e.target.closest('[data-delete]');
        if (editar) editarOferta(editar.dataset.edit);
        if (borrar) eliminarOferta(borrar.dataset.delete);
    });
});
