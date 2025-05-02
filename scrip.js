// Configuración
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzdCOjuSpp4ZszyhD1kdwovuaVqdn7CVoC4_ZPz9gfhGwaowoXs_b2DDHb1r_3Wqn1k/exec";
let inventoryData = [];

// Elementos del DOM
const elements = {
    tableBody: document.querySelector('#inventory-table tbody'),
    refreshBtn: document.getElementById('refresh-btn'),
    loading: document.getElementById('loading'),
    error: document.getElementById('error-message')
};

// Cargar inventario al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    
    // Configurar actualización automática cada 30 segundos
    setInterval(loadInventory, 30000);
});

// Botón de actualización
elements.refreshBtn.addEventListener('click', loadInventory);

// Cargar datos del inventario
async function loadInventory() {
    try {
        showLoading();
        
        const response = await fetch(`${APPS_SCRIPT_URL}?action=getInventory`);
        if (!response.ok) throw new Error('Error al cargar inventario');
        
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Error en los datos');
        
        inventoryData = data.inventory;
        renderInventory();
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Mostrar datos en la tabla
function renderInventory() {
    elements.tableBody.innerHTML = '';
    
    inventoryData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.numero}</td>
            <td>${item.tipo}</td>
            <td>${item.entradas}</td>
            <td>${item.salidas}</td>
            <td class="${item.inventario <= 3 ? 'low-stock' : ''}">${item.inventario}</td>
            <td>
                <button class="edit-btn" data-numero="${item.numero}">Editar</button>
            </td>
        `;
        elements.tableBody.appendChild(row);
    });
    
    // Configurar eventos de los botones de edición
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const numero = btn.getAttribute('data-numero');
            editProduct(numero);
        });
    });
}

// Editar producto
function editProduct(numero) {
    const product = inventoryData.find(item => item.numero == numero);
    if (!product) return;
    
    const newEntradas = prompt('Nuevo valor para Entradas:', product.entradas);
    if (newEntradas === null) return;
    
    const newSalidas = prompt('Nuevo valor para Salidas:', product.salidas);
    if (newSalidas === null) return;
    
    const newInventario = prompt('Nuevo valor para Inventario:', product.inventario);
    if (newInventario === null) return;
    
    updateProduct(numero, {
        entradas: parseInt(newEntradas) || 0,
        salidas: parseInt(newSalidas) || 0,
        inventario: parseInt(newInventario) || 0,
        tipo: product.tipo
    });
}

// Actualizar producto en Google Sheets
async function updateProduct(numero, data) {
    try {
        showLoading();
        
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: "updateInventory",
                numero: numero,
                ...data
            })
        });
        
        const result = await response.json();
        if (!result.success) throw new Error(result.message || 'Error al actualizar');
        
        // Recargar inventario después de actualizar
        await loadInventory();
        showMessage('Inventario actualizado correctamente', 'success');
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Funciones auxiliares de UI
function showLoading() {
    elements.loading.style.display = 'block';
}

function hideLoading() {
    elements.loading.style.display = 'none';
}

function showError(message) {
    elements.error.textContent = message;
    elements.error.style.display = 'block';
    elements.error.className = 'error-message error';
    setTimeout(() => elements.error.style.display = 'none', 5000);
}

function showMessage(message, type) {
    elements.error.textContent = message;
    elements.error.style.display = 'block';
    elements.error.className = `error-message ${type}`;
    setTimeout(() => elements.error.style.display = 'none', 5000);
}
