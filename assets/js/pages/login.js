document.addEventListener('DOMContentLoaded', async () => {
    // Si ya hay sesión iniciada, vamos directamente al panel
    const sesion = await api('auth', 'session');
    if (sesion.ok && sesion.data?.autenticado) {
        window.location.href = 'dashboard.html';
        return;
    }

    const form = document.getElementById('login-form');
    const error = document.getElementById('login-error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const boton = form.querySelector('button[type="submit"]');
        boton.disabled = true;

        const respuesta = await api('auth', 'login', { body: form });
        if (respuesta.ok) {
            window.location.href = 'dashboard.html';
            return;
        }
        error.textContent = respuesta.message;
        error.style.display = 'block';
        boton.disabled = false;
    });
});
