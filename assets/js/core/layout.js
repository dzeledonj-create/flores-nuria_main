/**
 * Estructura común de las páginas del panel:
 *  - comprueba la sesión con el backend
 *  - carga los parciales sidebar.html y header.html
 *  - marca la página activa, rellena las migas de pan y los datos del empleado
 *  - menú lateral (móvil) y desplegable de usuario
 */
const PAGE_LABELS = {
    dashboard: 'Dashboard',
    products: 'Productos',
    employees: 'Empleados',
    reports: 'Informes',
    payments: 'Cobros/Pagos',
    schedule: 'Agenda',
    customers: 'Clientes',
    suppliers: 'Proveedores',
    invoices: 'Facturas emitidas',
    deliveries: 'Albaranes emitidos',
    budgets: 'Presupuestos emitidos',
    create_product: 'Crear Producto',
    create_supplier: 'Crear Proveedor',
    create_order: 'Realizar Pedido',
    create_payment: 'Registrar Venta',
    create_tiket: 'Exportar Tickets',
    offers: 'Ofertas',
    orders: 'Pedidos emitidos',
};

// Página actual a partir del nombre del fichero (products.html -> products)
function currentPage() {
    const fichero = window.location.pathname.split('/').pop() || 'dashboard.html';
    return fichero.replace('.html', '') || 'dashboard';
}

async function loadPartial(nombre) {
    const slot = document.querySelector(`[data-include="${nombre}"]`);
    if (!slot) return;
    const respuesta = await fetch(`partials/${nombre}.html`);
    slot.outerHTML = await respuesta.text();
}

function renderBreadcrumbs(pagina) {
    const ol = document.querySelector('.breadcrumbs ol');
    if (!ol) return;
    const items = ['Dashboard'];
    if (pagina !== 'dashboard') items.push(PAGE_LABELS[pagina] || 'Dashboard');
    ol.innerHTML = items.map(i => `<li>${escapeHtml(i)}</li>`).join('');
}

function markActiveLink(pagina) {
    document.querySelectorAll('.sidebar [data-page]').forEach(li => {
        li.classList.toggle('active', li.dataset.page === pagina);
    });
}

function renderUser(empleado) {
    const nombre = empleado?.nombre || 'Usuario';
    document.getElementById('userMenuBtn').textContent = nombre.charAt(0).toUpperCase() || 'U';
    document.getElementById('userName').textContent = nombre;
    document.getElementById('userRole').textContent = empleado?.puesto || 'Personal';
}

function initMenus() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });

        // Cerrar el sidebar al hacer clic fuera de él (solo en pantallas móviles <= 900px)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 900) {
                if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuToggle) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }

    // --- Menú desplegable de usuario (Dropdown) ---
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!userDropdown.contains(e.target) && e.target !== userMenuBtn) {
                userDropdown.classList.remove('active');
            }
        });
    }

    const logout = document.getElementById('logoutLink');
    if (logout) {
        logout.addEventListener('click', async (e) => {
            e.preventDefault();
            await api('auth', 'logout', { body: {} });
            window.location.href = 'login.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const pagina = currentPage();

    const [sesion] = await Promise.all([
        api('auth', 'session'),
        loadPartial('sidebar'),
        loadPartial('header'),
    ]);

    if (!sesion.ok || !sesion.data?.autenticado) {
        window.location.href = 'login.html';
        return;
    }

    markActiveLink(pagina);
    renderBreadcrumbs(pagina);
    renderUser(sesion.data.empleado);
    initMenus();
    showFlash();
});
