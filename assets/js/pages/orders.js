/**
 * Vista de pedidos: listado, búsqueda, cambio rápido de estado, detalle, edición y borrado.
 */
let pedidos = [];
let busqueda = '';

const CLASES_ESTADO = {
    recibido: 'text-success',
    cancelado: 'text-danger',
    pendiente: 'text-warning',
};

async function cargarPedidos() {
    const respuesta = await api('pedidos', 'listar', { params: { search: busqueda } });
    if (!respuesta.ok) {
        showMessage(respuesta.message, false);
        return;
    }
    pedidos = respuesta.data;
    renderPedidos();
}

function estadoHtml(estado) {
    const clase = CLASES_ESTADO[String(estado ?? '').toLowerCase()];
    return clase ? `<span class="${clase} fw-bold">${escapeHtml(estado)}</span>` : escapeHtml(estado);
}

function renderPedidos() {
    const tbody = document.getElementById('orders-body');
    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay pedidos registrados.</td></tr>';
        return;
    }
    tbody.innerHTML = pedidos.map(p => {
        const id = escapeHtml(p.idPedido);
        return `
        <tr>
            <td>${id}</td>
            <td>${escapeHtml(p.idProveedor)}</td>
            <td>${escapeHtml(p.fecha)}</td>
            <td>${estadoHtml(p.estado)}</td>
            <td>${p.productos.length} tipos</td>
            <td class="d-flex gap-1">
                <button type="button" class="btn secondary btn-sm" data-status="Pendiente" data-id="${id}">Pendiente</button>
                <button type="button" class="btn btn-sm btn-success" data-status="Recibido" data-id="${id}">Recibido</button>
                <button type="button" class="btn btn-sm btn-danger" data-status="Cancelado" data-id="${id}">Cancelado</button>
            </td>
            <td class="actions">
                <button type="button" class="btn-view" data-view="${id}">👁</button>
                <button type="button" class="btn-edit" data-edit="${id}">✎</button>
                <button type="button" class="btn-delete" data-delete="${id}">🗑</button>
            </td>
        </tr>`;
    }).join('');
}

function buscarPedido(id) {
    return pedidos.find(p => String(p.idPedido) === String(id));
}

function verPedido(id) {
    const pedido = buscarPedido(id);
    if (!pedido) return;
    cerrarEdicion();

    const panel = document.getElementById('view-panel');
    show(document.getElementById('view-title'));
    show(panel);
    document.getElementById('view-id').textContent = pedido.idPedido;

    const lista = document.getElementById('view-items-list');
    if (pedido.productos.length === 0) {
        lista.innerHTML = '<li class="order-item text-muted">No hay productos en este pedido.</li>';
    } else {
        lista.innerHTML = pedido.productos
            .map(i => `<li class="order-item"><strong>${escapeHtml(i.cantidad)}x</strong> ${escapeHtml(i.nombre)}</li>`)
            .join('');
    }
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cerrarDetalle() {
    hide(document.getElementById('view-title'));
    hide(document.getElementById('view-panel'));
}

function editarPedido(id) {
    const pedido = buscarPedido(id);
    if (!pedido) return;
    cerrarDetalle();

    const form = document.getElementById('form-edit-order');
    show(document.getElementById('edit-title'));
    show(form);

    document.getElementById('edit-id').value = pedido.idPedido;
    document.getElementById('edit-proveedor').value = pedido.idProveedor ?? '';
    document.getElementById('edit-fecha').value = pedido.fecha ?? '';

    const select = document.getElementById('edit-estado');
    const opcion = Array.from(select.options).find(o => o.value.toLowerCase() === String(pedido.estado ?? '').toLowerCase());
    if (opcion) select.value = opcion.value;

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cerrarEdicion() {
    hide(document.getElementById('edit-title'));
    hide(document.getElementById('form-edit-order'));
}

async function cambiarEstado(id, estado) {
    const respuesta = await api('pedidos', 'cambiarEstado', { body: { idPedido: id, estado } });
    showMessage(respuesta.message, respuesta.ok);
    if (respuesta.ok) cargarPedidos();
}

async function eliminarPedido(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este pedido? Se borrarán todos los productos asociados. Esta acción no se puede deshacer.')) return;
    const respuesta = await api('pedidos', 'eliminar', { body: { idPedido: id } });
    showMessage(respuesta.message, respuesta.ok);
    if (respuesta.ok) cargarPedidos();
}

document.addEventListener('DOMContentLoaded', () => {
    cargarPedidos();

    document.getElementById('search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        busqueda = e.target.search.value.trim();
        cargarPedidos();
    });

    document.getElementById('show-all').addEventListener('click', () => {
        busqueda = '';
        document.getElementById('search-form').reset();
        cargarPedidos();
    });

    document.getElementById('orders-body').addEventListener('click', (e) => {
        const estado = e.target.closest('[data-status]');
        const ver = e.target.closest('[data-view]');
        const editar = e.target.closest('[data-edit]');
        const borrar = e.target.closest('[data-delete]');
        if (estado) cambiarEstado(estado.dataset.id, estado.dataset.status);
        if (ver) verPedido(ver.dataset.view);
        if (editar) editarPedido(editar.dataset.edit);
        if (borrar) eliminarPedido(borrar.dataset.delete);
    });

    document.getElementById('form-edit-order').addEventListener('submit', async (e) => {
        e.preventDefault();
        const respuesta = await api('pedidos', 'actualizar', { body: e.target });
        showMessage(respuesta.message, respuesta.ok);
        if (respuesta.ok) {
            cerrarEdicion();
            cargarPedidos();
        }
    });

    document.querySelector('[data-close-edit]').addEventListener('click', cerrarEdicion);
    document.getElementById('close-view').addEventListener('click', cerrarDetalle);
});
