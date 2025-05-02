// Configuración
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7ehDrXlxRUJN2n4wGMGkMFMUz0nnzS4rtxAcR1nx19_mdojqLeY1pjKvxLj_QbA4y/exec?action=getInventory";

// Elementos del DOM
const formulario = document.getElementById('movimiento-form');
const selectProductos = document.getElementById('producto-id');
const tablaInventario = document.querySelector('#inventario-table tbody');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-message');

// Cargar inventario al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const inventario = await cargarInventario();
        actualizarSelectProductos(inventario);
        actualizarTablaInventario(inventario);
        loadingElement.style.display = 'none';
    } catch (error) {
        mostrarError('Error al cargar inventario: ' + error.message);
    }
});

// Manejar envío del formulario
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const movimiento = {
        tipo: document.getElementById('tipo-movimiento').value,
        productoId: document.getElementById('producto-id').value,
        cantidad: document.getElementById('cantidad').value
    };

    try {
        const resultado = await registrarMovimiento(movimiento);
        if (resultado.success) {
            // Recargar inventario después de registrar movimiento
            const inventario = await cargarInventario();
            actualizarTablaInventario(inventario);
            formulario.reset();
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

    tablaInventario.innerHTML = '';
    document.getElementById('inventario-count').textContent = `(${data.count} productos)`;

    data.data.forEach(item => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${item.id}</td>
            <td>${item.nombre}</td>
            <td>${item.tipo}</td>
            <td>${item.entradas}</td>
            <td>${item.salidas || 0}</td>
            <td class="${item.inventario <= 0 ? 'stock-cero' : ''}">${item.inventario}</td>
        `;
        tablaInventario.appendChild(fila);
    });
}

function actualizarSelectProductos(inventario) {
    selectProductos.innerHTML = '';
    
    const optionDefault = document.createElement('option');
    optionDefault.value = '';
    optionDefault.textContent = 'Seleccionar producto...';
    selectProductos.appendChild(optionDefault);
    
    inventario.data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.id} - ${item.nombre} (Disponibles: ${item.inventario})`;
        selectProductos.appendChild(option);
    });
}

function mostrarError(mensaje) {
    errorElement.textContent = mensaje;
    errorElement.style.display = 'block';
    setTimeout(() => errorElement.style.display = 'none', 5000);
}
