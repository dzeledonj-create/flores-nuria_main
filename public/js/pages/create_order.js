/**
 * Vista de creación de pedidos: carga proveedores y productos y envía el pedido.
 */
async function cargarSelectores() {
    const [proveedores, productos] = await Promise.all([
        api('proveedores', 'listar'),
        api('productos', 'listar'),
    ]);

    if (proveedores.ok) {
        fillSelect(
            document.getElementById('select-proveedor'),
            proveedores.data.map(p => ({ value: p.idProveedor, text: p.nombre })),
            '-- Seleccionar Proveedor --'
        );
    }
    if (productos.ok) {
        fillSelect(
            document.querySelector('.select-producto'),
            productos.data.map(p => ({ value: p.idProducto, text: `${p.nombre} (Stock: ${p.stock})` })),
            '-- Seleccionar Producto --'
        );
    }
}

function anadirFila() {
    const contenedor = document.getElementById('productos-container');
    const primeraFila = contenedor.querySelector('.producto-row');
    if (!primeraFila) return;
    const nuevaFila = primeraFila.cloneNode(true);
    nuevaFila.querySelector('select').selectedIndex = 0;
    nuevaFila.querySelector('input').value = '';
    contenedor.appendChild(nuevaFila);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fecha-pedido').value = today();
    cargarSelectores();

    document.getElementById('add-row').addEventListener('click', anadirFila);

    document.getElementById('productos-container').addEventListener('click', (e) => {
        const boton = e.target.closest('[data-remove-row]');
        const filas = document.querySelectorAll('#productos-container .producto-row');
        // Siempre dejamos al menos una fila para poder clonarla
        if (boton && filas.length > 1) boton.closest('.producto-row').remove();
    });

    document.getElementById('form-create-order').addEventListener('submit', async (e) => {
        e.preventDefault();
        const respuesta = await api('pedidos', 'crear', { body: e.target });
        if (respuesta.ok) {
            setFlash(respuesta.message);
            window.location.href = 'orders.html';
            return;
        }
        showMessage(respuesta.message, false);
    });
});
