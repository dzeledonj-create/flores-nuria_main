/**
 * Vista de productos: listado, búsqueda, filtro por categoría, edición y borrado.
 */
let productos = [];
let filtros = {};

async function cargarProductos() {
    const respuesta = await api('productos', 'listar', { params: filtros });
    if (!respuesta.ok) {
        showMessage(respuesta.message, false);
        return;
    }
    productos = respuesta.data;
    renderProductos();
}

async function cargarCategorias() {
    const respuesta = await api('productos', 'categorias');
    if (respuesta.ok) {
        const select = document.getElementById('category-select');
        fillSelect(select, respuesta.data.map(c => ({ value: c, text: c })), 'Seleccione categoria...');
    }
}

// Etiqueta de la oferta del producto (si tiene una activa y no caducada)
function ofertaHtml(producto) {
    const oferta = producto.ofertas[0];
    if (oferta && oferta.activa && (!oferta.fechaFin || oferta.fechaFin >= today())) {
        return `<span class="pill green px-3-py-1 rounded-sm text-sm fw-bold">Oferta: -${escapeHtml(oferta.descuento)}%</span>`;
    }
    return 'Sin oferta activa';
}

function renderProductos() {
    const tbody = document.getElementById('products-body');
    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay productos registrados.</td></tr>';
        return;
    }
    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>${escapeHtml(p.nombre)}</td>
            <td>${ofertaHtml(p)}</td>
            <td>${formatNumber(p.precio)} €</td>
            <td>${formatNumber(p.iva)} %</td>
            <td>${formatNumber(p.precioConIva)} €</td>
            <td>${escapeHtml(p.stock)}</td>
            <td>${p.stock > 0 ? 'Disponible' : 'Agotado'}</td>
            <td class="actions">
                <button type="button" class="btn-edit" data-edit="${escapeHtml(p.idProducto)}">✎</button>
                <button type="button" class="btn-delete" data-delete="${escapeHtml(p.idProducto)}">🗑</button>
            </td>
        </tr>`).join('');
}

function editarProducto(id) {
    const p = productos.find(prod => String(prod.idProducto) === String(id));
    if (!p) return;
    const form = document.getElementById('form-edit-product');
    show(document.getElementById('edit-title'));
    show(form);

    form.reset();
    document.getElementById('edit-id').value = p.idProducto;
    document.getElementById('edit-nombre').value = p.nombre;
    document.getElementById('edit-precio').value = p.precio;
    document.getElementById('edit-iva').value = p.iva;
    document.getElementById('edit-stock').value = p.stock;

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cerrarEdicion() {
    hide(document.getElementById('edit-title'));
    hide(document.getElementById('form-edit-product'));
}

async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) return;
    const respuesta = await api('productos', 'eliminar', { body: { idProducto: id } });
    showMessage(respuesta.message, respuesta.ok);
    if (respuesta.ok) cargarProductos();
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarCategorias();

    document.getElementById('search-form').addEventListener('submit', (e) => {
        e.preventDefault();
        filtros = { search: e.target.search.value.trim() };
        cargarProductos();
    });

    document.getElementById('category-form').addEventListener('submit', (e) => {
        e.preventDefault();
        filtros = { category: e.target.category.value };
        cargarProductos();
    });

    document.getElementById('show-all').addEventListener('click', () => {
        filtros = {};
        document.getElementById('search-form').reset();
        document.getElementById('category-form').reset();
        cargarProductos();
    });

    // Botones de editar / borrar de cada fila
    document.getElementById('products-body').addEventListener('click', (e) => {
        const editar = e.target.closest('[data-edit]');
        const borrar = e.target.closest('[data-delete]');
        if (editar) editarProducto(editar.dataset.edit);
        if (borrar) eliminarProducto(borrar.dataset.delete);
    });

    document.getElementById('form-edit-product').addEventListener('submit', async (e) => {
        e.preventDefault();
        const respuesta = await api('productos', 'actualizar', { body: e.target });
        showMessage(respuesta.message, respuesta.ok);
        if (respuesta.ok) {
            cerrarEdicion();
            cargarProductos();
        }
    });

    document.querySelector('[data-close-edit]').addEventListener('click', cerrarEdicion);
});
