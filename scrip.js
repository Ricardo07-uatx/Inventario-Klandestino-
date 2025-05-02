// Configuración
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7ehDrXlxRUJN2n4wGMGkMFMUz0nnzS4rtxAcR1nx19_mdojqLeY1pjKvxLj_QbA4y/execaction=getInventory";

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
    stockBajo: document.getElementById('stock-bajo'),
    buscarProducto: document.getElementById('buscar-producto')
};

// Estado de la aplicación
const state = {
    inventario: [],
    productosFiltrados: []
};

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await cargarDatosIniciales();
        setupEventListeners();
    } catch (error) {
        mostrarError('Error al inicializar la aplicación: ' + error.message);
    }
});

// Funciones principales
async function cargarDatosIniciales() {
    mostrarLoading(true);
    
    try {
        const data = await fetchData(`${APPS_SCRIPT_URL}?action=getInventory`);
        
        if (!data.success) {
            throw new Error(data.message || 'Error al cargar inventario');
        }
        
        state.inventario = data.data;
        state.productosFiltrados = [...state.inventario];
        
        actualizarResumen();
        actualizarSelectProductos();
        actualizarTablaInventario();
    } finally {
        mostrarLoading(false);
    }
}

function setupEventListeners() {
    // Formulario de movimientos
    elements.formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        await registrarMovimiento();
    });
    
    // Búsqueda de productos
    elements.buscarProducto.addEventListener('input', (e) => {
        filtrarProductos(e.target.value);
    });
}

async function registrarMovimiento() {
    const formData = {
        tipo: document.getElementById('tipo-movimiento').value,
        productoId: document.getElementById('producto-id').value,
        cantidad: document.getElementById('cantidad').value,
        notas: document.getElementById('notas').value || ''
    };
    
    try {
        mostrarLoading(true);
        const resultado = await fetchData(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: "registerMovement",
                data: formData
            })
        });
        
        if (!resultado.success) {
            throw new Error(resultado.message);
        }
        
        // Recargar datos después de registrar movimiento
        await cargarDatosIniciales();
        elements.formulario.reset();
        
        // Mostrar notificación de éxito
        mostrarNotificacion('Movimiento registrado exitosamente', 'success');
    } catch (error) {
        mostrarError(error.message);
    } finally {
        mostrarLoading(false);
    }
}

// Funciones de ayuda
async function fetchData(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
    }
    return await response.json();
}

function filtrarProductos(termino) {
    if (!termino) {
        state.productosFiltrados = [...state.inventario];
    } else {
        const terminoLower = termino.toLowerCase();
        state.productosFiltrados = state.inventario.filter(producto => 
            producto.nombre.toLowerCase().includes(terminoLower) || 
            producto.id.toString().includes(terminoLower)
        );
    }
    actualizarTablaInventario();
}

// Funciones para actualizar la UI
function actualizarResumen() {
    elements.totalProductos.textContent = state.inventario.length;
    
    const totalEntradas = state.inventario.reduce((sum, item) => sum + (item.entradas || 0), 0);
    elements.totalEntradas.textContent = totalEntradas;
    
    const totalSalidas = state.inventario.reduce((sum, item) => sum + (item.salidas || 0), 0);
    elements.totalSalidas.textContent = totalSalidas;
    
    const stockBajo = state.inventario.filter(item => (item.inventario || 0) <= 3).length;
    elements.stockBajo.textContent = stockBajo;
}

function actualizarSelectProductos() {
    elements.selectProductos.innerHTML = '';
    
    const optionDefault = document.createElement('option');
    optionDefault.value = '';
    optionDefault.textContent = 'Seleccionar producto...';
    elements.selectProductos.appendChild(optionDefault);
    
    state.inventario.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.id} - ${item.nombre} (${item.inventario} disponibles)`;
        option.dataset.stock = item.inventario;
        elements.selectProductos.appendChild(option);
    });
}

function actualizarTablaInventario() {
    elements.tablaInventario.innerHTML = '';
    
    if (state.productosFiltrados.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" class="text-center">No se encontraron productos</td>`;
        elements.tablaInventario.appendChild(row);
        return;
    }
    
    state.productosFiltrados.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td><strong>${item.nombre}</strong></td>
            <td>${item.tipo || 'N/A'}</td>
            <td>${item.entradas || 0}</td>
            <td>${item.salidas || 0}</td>
            <td class="${(item.inventario || 0) <= 0 ? 'stock-cero' : ''}">
                ${item.inventario || 0}
            </td>
            <td>
                <button class="btn-icon" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-icon" title="Historial"><i class="fas fa-history"></i></button>
            </td>
        `;
        elements.tablaInventario.appendChild(row);
    });
}

function mostrarLoading(mostrar) {
    elements.loadingElement.style.display = mostrar ? 'flex' : 'none';
    elements.tablaInventario.style.display = mostrar ? 'none' : '';
}

function mostrarError(mensaje) {
    elements.errorElement.textContent = mensaje;
    elements.errorElement.style.display = 'block';
    setTimeout(() => elements.errorElement.style.display = 'none', 5000);
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.innerHTML = `
        <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notificacion.classList.remove('show');
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}
