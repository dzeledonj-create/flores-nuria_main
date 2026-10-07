/**
 * Vista de registro de pagos: carga productos y clientes y envía el pago.
 */
async function cargarSelectores() {
    const [productos, clientes] = await Promise.all([
        api('productos', 'listar'),
        api('clientes', 'listar'),
    ]);

    if (productos.ok) {
        fillSelect(
            document.getElementById('select-prod'),
            productos.data.map(p => ({ value: p.idProducto, text: `${p.nombre} - ${p.stock}` })),
            '-- Seleccionar Producto --'
        );
    }
    if (clientes.ok) {
        fillSelect(
            document.getElementById('select-client'),
            clientes.data.map(c => ({ value: c.idCliente, text: `${c.nombre} - ${c.correo ?? ''}` })),
            '-- Seleccionar Cliente --'
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fecha-pago').value = today();
    cargarSelectores();

    document.getElementById('search-prod').addEventListener('keyup', (e) => {
        filterOptions(e.target, document.getElementById('select-prod'));
    });
    document.getElementById('search-client').addEventListener('keyup', (e) => {
        filterOptions(e.target, document.getElementById('select-client'));
    });

    document.getElementById('form-create-payment').addEventListener('submit', async (e) => {
        e.preventDefault();
        const respuesta = await api('ventas', 'registrarPago', { body: e.target });
        if (respuesta.ok) {
            setFlash(respuesta.message);
            window.location.href = 'payments.html';
            return;
        }
        showMessage(respuesta.message, false);
    });
});
