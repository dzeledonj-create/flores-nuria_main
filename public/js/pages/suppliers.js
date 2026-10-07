/**
 * Vista de proveedores: listado, búsqueda, edición y borrado.
 */
let proveedores = [];
let busqueda = '';

async function cargarProveedores() {
    const respuesta = await api('proveedores', 'listar', { params: { search: busqueda } });
    if (!respuesta.ok) {
        showMessage(respuesta.message, false);
        return;
    }
    proveedores = respuesta.data;
    renderProveedores();
}

function renderProveedores() {
    const tbody = document.getElementById('suppliers-body');
    if (proveedores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay proveedores registrados.</td></tr>';
        return;
    }
    tbody.innerHTML = proveedores.map(p => `
        <tr>
            <td>${escapeHtml(p.nombre)}</td>
            <td>${escapeHtml(p.direccion)}</td>
            <td>${escapeHtml(p.telefono)}</td>
            <td>${escapeHtml(p.correo)}</td>
            <td class="actions">
                <button type="button" class="btn-edit" data-edit="${escapeHtml(p.idProveedor)}">✎</button>
                <button type="button" class="btn-delete" data-delete="${escapeHtml(p.idProveedor)}">🗑</button>
            </td>
        </tr>`).join('');
}

function editarProveedor(id) {
    const p = proveedores.find(prov => String(prov.idProveedor) === String(id));
    if (!p) return;
    const form = document.getElementById('form-edit-supplier');
    show(document.getElementById('edit-title'));
    show(form);

    document.getElementById('edit-id').value = p.idProveedor;
    document.getElementById('edit-nombre').value = p.nombre ?? '';
    document.getElementById('edit-direccion').value = p.direccion ?? '';
    document.getElementById('edit-telefono').value = p.telefono ?? '';
    document.getElementById('edit-correo').value = p.correo ?? '';

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cerrarEdicion() {
    hide(document.getElementById('edit-title'));
    hide(document.getElementById('form-edit-supplier'));
}

async function eliminarProveedor(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este proveedor? Esta acción no se puede deshacer.')) return;
    const respuesta = await api('proveedores', 'eliminar', { body: { idProveedor: id } });
    showMessage(respuesta.message, respuesta.ok);
    if (respuesta.ok) cargarProveedores();
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProveedores();

    document.getElementById('search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        busqueda = e.target.search.value.trim();
        cargarProveedores();
    });

    document.getElementById('show-all').addEventListener('click', () => {
        busqueda = '';
        document.getElementById('search-form').reset();
        cargarProveedores();
    });

    document.getElementById('suppliers-body').addEventListener('click', (e) => {
        const editar = e.target.closest('[data-edit]');
        const borrar = e.target.closest('[data-delete]');
        if (editar) editarProveedor(editar.dataset.edit);
        if (borrar) eliminarProveedor(borrar.dataset.delete);
    });

    document.getElementById('form-edit-supplier').addEventListener('submit', async (e) => {
        e.preventDefault();
        const respuesta = await api('proveedores', 'actualizar', { body: e.target });
        showMessage(respuesta.message, respuesta.ok);
        if (respuesta.ok) {
            cerrarEdicion();
            cargarProveedores();
        }
    });

    document.querySelector('[data-close-edit]').addEventListener('click', cerrarEdicion);
});
