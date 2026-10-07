/**
 * Exporta todas las ventas a storage/json/tickets.json y muestra el resultado.
 */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('export-tickets').addEventListener('click', async (e) => {
        e.target.disabled = true;
        const respuesta = await api('ventas', 'exportar', { body: {} });
        e.target.disabled = false;
        showMessage(respuesta.message, respuesta.ok);
        if (!respuesta.ok) return;

        document.getElementById('tickets-body').innerHTML = respuesta.data.map(t => `
            <tr>
                <td>Nº ${escapeHtml(t.num_ticket)}</td>
                <td>${escapeHtml(t.empleado)}</td>
                <td>${escapeHtml(t.cliente)}</td>
                <td>${escapeHtml(t.fechaCreacion)}</td>
                <td>${escapeHtml(t.totalVenta)}€</td>
            </tr>`).join('');
        show(document.getElementById('tickets-wrap'));
    });
});
