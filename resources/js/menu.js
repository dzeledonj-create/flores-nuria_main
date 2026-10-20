document.addEventListener('DOMContentLoaded', () => {
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
});

// --- Funciones globales para vistas y formularios ---

function closeEditForm() {
    const title = document.getElementById('edit-title');
    if (title) title.style.display = 'none';
    
    ['form-edit-product', 'form-edit-supplier', 'form-edit-order'].forEach(id => {
        const form = document.getElementById(id);
        if (form) form.style.display = 'none';
    });
}

function closeViewPanel() {
    const title = document.getElementById('view-title');
    const panel = document.getElementById('view-panel');
    if (title) title.style.display = 'none';
    if (panel) panel.style.display = 'none';
}

// --- Productos ---
function editProduct(id, nombre, precio, iva, stock) {
    document.getElementById('edit-title').style.display = 'block';
    const form = document.getElementById('form-edit-product');
    form.style.display = 'block';
    
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nombre').value = nombre;
    document.getElementById('edit-precio').value = precio;
    document.getElementById('edit-iva').value = iva;
    document.getElementById('edit-stock').value = stock;
    
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteProduct(id) {
    if (confirm("¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.")) {
        document.getElementById('delete-id').value = id;
        document.getElementById('form-delete-product').submit();
    }
}

// --- Proveedores ---
function editSupplier(id, nombre, direccion, telefono, correo) {
    document.getElementById('edit-title').style.display = 'block';
    const form = document.getElementById('form-edit-supplier');
    form.style.display = 'block';
    
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nombre').value = nombre;
    document.getElementById('edit-direccion').value = direccion;
    document.getElementById('edit-telefono').value = telefono;
    document.getElementById('edit-correo').value = correo;
    
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function filterSelect(type) {
    const searchValue = document.getElementById('search-filter-' + type).value.toLowerCase();
    const selectElement = document.getElementById('select-filter-' + type);
    const options = selectElement.options;

    for (let i = 0; i < options.length; i++) {
        const text = options[i].text.toLowerCase();

        // Si es la opción por defecto ("-- Seleccionar --"), la dejamos siempre visible
        if (options[i].value === "") {
            options[i].style.display = "";
            continue;
        }

        // Usamos hidden en lugar de style display para mejor compatibilidad
        if (text.includes(searchValue)) {
            options[i].style.display = ""; // Por si acaso para navegadores viejos
        } else {
            options[i].style.display = "none";
        }
    }
}
function deleteSupplier(id) {
    if (confirm("¿Estás seguro de que quieres eliminar este proveedor? Esta acción no se puede deshacer.")) {
        document.getElementById('delete-id').value = id;
        document.getElementById('form-delete-supplier').submit();
    }
}

// --- Pedidos ---
function changeStatus(id, estado) {
    document.getElementById('status-id').value = id;
    document.getElementById('status-val').value = estado;
    document.getElementById('form-status-order').submit();
}

function viewOrder(id, items) {
    document.getElementById('view-title').style.display = 'block';
    const panel = document.getElementById('view-panel');
    panel.style.display = 'block';
    document.getElementById('view-id').innerText = id;
    
    closeEditForm();
    
    const list = document.getElementById('view-items-list');
    list.innerHTML = '';
    
    if (items.length === 0) {
        list.innerHTML = '<li class="order-item text-muted">No hay productos en este pedido.</li>';
    } else {
        items.forEach(i => {
            const li = document.createElement('li');
            li.className = 'order-item';
            li.innerHTML = '<strong>' + i.cantidad + 'x</strong> ' + i.nombre;
            list.appendChild(li);
        });
    }
    
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function editOrder(id, proveedor, fecha, estado) {
    document.getElementById('edit-title').style.display = 'block';
    const form = document.getElementById('form-edit-order');
    form.style.display = 'block';
    
    closeViewPanel();
    
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-proveedor').value = proveedor;
    document.getElementById('edit-fecha').value = fecha;
    
    const sel = document.getElementById('edit-estado');
    for(let i=0; i<sel.options.length; i++){
        if(sel.options[i].value.toLowerCase() === estado.toLowerCase()){
            sel.selectedIndex = i;
            break;
        }
    }
    
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteOrder(id) {
    if (confirm("¿Estás seguro de que quieres eliminar este pedido? Se borrarán todos los productos asociados. Esta acción no se puede deshacer.")) {
        document.getElementById('delete-id').value = id;
        document.getElementById('form-delete-order').submit();
    }
}

// --- Creación de Pedidos ---
function addProductoRow() {
    const container = document.getElementById('productos-container');
    const firstRow = container.querySelector('.producto-row');
    if (firstRow) {
        const newRow = firstRow.cloneNode(true);
        newRow.querySelector('select').selectedIndex = 0;
        newRow.querySelector('input').value = '';
        container.appendChild(newRow);
    }
}

// --- Ofertas ---
function filterProducts(type) {
    let search = document.getElementById('search-' + type + '-prod').value.toLowerCase();
    let select = document.getElementById('select-' + type + '-prod');
    for (let i = 0; i < select.options.length; i++) {
        let txt = select.options[i].text.toLowerCase();
        select.options[i].style.display = txt.includes(search) ? '' : 'none';
    }
}

function addProductToOffer(type, idProd = null, nameProd = null) {
    let id, name;
    if (idProd && nameProd) {
        id = idProd;
        name = nameProd;
    } else {
        const select = document.getElementById('select-' + type + '-prod');
        if (select.selectedIndex === -1) return;
        const option = select.options[select.selectedIndex];
        id = option.value;
        name = option.text;
    }
    
    if (!id) return;

    const container = document.getElementById('container-' + type + '-prod');
    
    // Evitar duplicados
    if (container.querySelector(`input[value="${id}"]`)) return;

    const emptyMsg = document.getElementById('empty-' + type + '-prod');
    if (emptyMsg) emptyMsg.style.display = 'none';

    const div = document.createElement('div');
    div.className = 'offer-product-item';
    
    div.innerHTML = `
        <span class="text-md">${name}</span>
        <input type="hidden" name="productos[]" value="${id}">
        <button type="button" class="btn secondary btn-sm btn-close-sm" onclick="this.parentElement.remove(); checkEmptyOfferProducts('${type}')">X</button>
    `;
    container.appendChild(div);
}

function addAllProductsToOffer(type) {
    const select = document.getElementById('select-' + type + '-prod');
    if (!select) return;
    
    for (let i = 0; i < select.options.length; i++) {
        const option = select.options[i];
        const id = option.value;
        const name = option.text;
        if (id) {
            addProductToOffer(type, id, name);
        }
    }
}

function checkEmptyOfferProducts(type) {
    const container = document.getElementById('container-' + type + '-prod');
    const inputs = container.querySelectorAll('input[name="productos[]"]');
    const emptyMsg = document.getElementById('empty-' + type + '-prod');
    if (inputs.length === 0 && emptyMsg) {
        emptyMsg.style.display = 'block';
    }
}

function editOffer(id, nombre, descuento, productosIds, fechaFin, activa) {
    document.getElementById('form-create-offer').style.display = 'none';
    const form = document.getElementById('form-edit-offer');
    form.style.display = 'block';
    if (document.getElementById('edit-title')) {
        document.getElementById('edit-title').style.display = 'block';
    }
    
    document.getElementById('edit-id-oferta').value = id;
    document.getElementById('edit-nombre-oferta').value = nombre;
    document.getElementById('edit-descuento-oferta').value = descuento;
    
    const container = document.getElementById('container-edit-prod');
    container.innerHTML = '<p id="empty-edit-prod" class="text-muted text-md m-0">Añade productos usando el botón +</p>';
    
    let idsStr = Array.isArray(productosIds) ? productosIds.map(String) : [String(productosIds)];
    if(typeof productosIds === 'string' && productosIds.includes(',')) idsStr = productosIds.split(',');
    
    const select = document.getElementById('select-edit-prod');
    idsStr.forEach(idProd => {
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value === idProd) {
                addProductToOffer('edit', select.options[i].value, select.options[i].text);
                break;
            }
        }
    });
    
    document.getElementById('edit-fechafin-oferta').value = fechaFin;
    if (document.getElementById('edit-activa-oferta')) {
        document.getElementById('edit-activa-oferta').value = activa ? "1" : "0";
    }
    
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleOfferStatus(id) {
    document.getElementById('toggle-id-oferta').value = id;
    document.getElementById('form-toggle-offer').submit();
}

function deleteOffer(id) {
    if (confirm("¿Estás seguro de que quieres eliminar esta oferta?")) {
        document.getElementById('delete-id-oferta').value = id;
        document.getElementById('form-delete-offer').submit();
    }
}
