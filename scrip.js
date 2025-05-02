// Configuración
const APPS_SCRIPT_URL = "Thttps://script.google.com/macros/s/AKfycbz7ehDrXlxRUJN2n4wGMGkMFMUz0nnzS4rtxAcR1nx19_mdojqLeY1pjKvxLj_QbA4y/exec?action=getInventory";

// Elementos del DOM
const elements = {
    formulario: document.getElementById('movimiento-form'),
    selectProductos: document.getElementById('producto-id'),
    tablaInventario: document.querySelector('#inventario-table tbody'),
    loadingElement: document.getElementById('loading'),
    errorElement: document.getElementById('error-message'),
    totalProductos: document.getElementById('total-productos'),
    totalEntradas: document.getElementById('total-entradas'),
    totalSalidas: document.getElementById('total-salidas'),
    stockBajo: document.getElementById('stock-bajo')
};

// Cargar inventario al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const inventario = await cargarInventario();
        actualizarSelectProductos(inventario);
        actualizarTablaInventario(inventario);
        actualizarResumen(inventario);
        elements.loadingElement.style.display = 'none';
    } catch (error) {
        mostrarError('Error al cargar inventario: ' + error.message);
    }
});

// Manejar envío del formulario
elements.formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const movimiento = {
        tipo: document.getElementById('tipo-movimiento').value,
        productoId: document.getElementById('producto-id').value,
        cantidad: document.getElementById('cantidad').value
    };

    try {
        const resultado = await registrarMovimiento(movimiento);
        if (resultado.success) {
            // Recargar inventario
            const inventario = await cargarInventario();
            actualizarTablaInventario(inventario);
            actualizarResumen(inventario);
            elements.formulario.reset();
        } else {
            mostrarError(resultado.message);
        }
    } catch (error) {
        mostrarError('Error al registrar movimiento: ' + error.message);
    }
});

// Funciones para interactuar con Apps Script
async function cargarInventario() {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getInventory`);
    if (!response.ok) throw new Error('Error en la respuesta del servidor');
    return await response.json();
}

async function registrarMovimiento(movimiento) {
    const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: "registerMovement",
            data: movimiento
        })
    });
    return await response.json();
}

// Funciones para actualizar la interfaz
function actualizarTablaInventario(data) {
    if (!data.success || !data.data) {
        throw new Error(data.message || 'Datos de inventario no válidos');
    }

    elements.tablaInventario.innerHTML = '';
    
    data.data.forEach(item => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${item.id}</td>
            <td>${item.nombre}</td>
            <td>${item.tipo || 'N/A'}</td>
            <td>${item.entradas || 0}</td>
            <td>${item.salidas || 0}</td>
            <td class="${item.inventario <= 0 ? 'stock-bajo' : ''}">${item.inventario || 0}</td>
        `;
        elements.tablaInventario.appendChild(fila);
    });
}

function actualizarSelectProductos(data) {
    elements.selectProductos.innerHTML = '';
    
    const optionDefault = document.createElement('option');
    optionDefault.value = '';
    optionDefault.textContent = 'Seleccionar producto...';
    elements.selectProductos.appendChild(optionDefault);
    
    data.data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.id} - ${item.nombre} (${item.inventario} disponibles)`;
        elements.selectProductos.appendChild(option);
    });
}

function actualizarResumen(data) {
    if (!data.success || !data.data) return;
    
    elements.totalProductos.textContent = data.data.length;
    
    const totalEntradas = data.data.reduce((sum, item) => sum + (item.entradas || 0), 0);
    elements.totalEntradas.textContent = totalEntradas;
    
    const totalSalidas = data.data.reduce((sum, item) => sum + (item.salidas || 0), 0);
    elements.totalSalidas.textContent = totalSalidas;
    
    const stockBajo = data.data.filter(item => (item.inventario || 0) <= 3).length;
    elements.stockBajo.textContent = stockBajo;
}

function mostrarError(mensaje) {
    elements.errorElement.textContent = mensaje;
    elements.errorElement.style.display = 'block';
    setTimeout(() => elements.errorElement.style.display = 'none', 5000);
}
