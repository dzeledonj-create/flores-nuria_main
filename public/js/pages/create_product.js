document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('form-create-product').addEventListener('submit', async (e) => {
        e.preventDefault();
        const respuesta = await api('productos', 'crear', { body: e.target });
        if (respuesta.ok) {
            setFlash(respuesta.message);
            window.location.href = 'products.html';
            return;
        }
        showMessage(respuesta.message, false);
    });
});
