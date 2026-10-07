document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('form-create-supplier').addEventListener('submit', async (e) => {
        e.preventDefault();
        const respuesta = await api('proveedores', 'crear', { body: e.target });
        if (respuesta.ok) {
            setFlash(respuesta.message);
            window.location.href = 'suppliers.html';
            return;
        }
        showMessage(respuesta.message, false);
    });
});
