document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('sales-body');
    const respuesta = await api('ventas', 'listar');
    if (!respuesta.ok) {
        showMessage(respuesta.message, false);
        tbody.innerHTML = '';
        return;
    }
    if (respuesta.data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay ventas registradas.</td></tr>';
        return;
    }
    tbody.innerHTML = respuesta.data.map(v => `
        <tr>
            <td>${escapeHtml(v.num_ticket)}</td>
            <td>${escapeHtml(v.fechaCreacion)}</td>
            <td>${escapeHtml(v.totalVenta)}</td>
            <td>${escapeHtml(v.empleadoNombre)}</td>
            <td>${escapeHtml(v.clienteNombre)}</td>
            <td>
                <button type="button" class="btn">Ver Info</button>
            </td>
        </tr>`).join('');
});
