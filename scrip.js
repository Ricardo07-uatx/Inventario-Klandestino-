// Configuración global
const API_URL = "https://script.google.com/macros/s/AKfycbzGPGQEczWDH1zlNrkVK8LGPc_hkA3GJJqWOnWWbYnBjWVEkRDgUy7W65gY1mrbDmM/exec";
let productosData = [];

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarInventario();
    configurarEventos();
});

function configurarEventos() {
    // Autocompletado al ingresar número de producto
    document.getElementById('productNumber').addEventListener('input', function() {
        const numero = parseInt(this.value);
        const producto = productosData.find(item => item.id === numero);
        const nombreField = document.getElementById('productName');
        
        if (producto) {
            nombreField.value = producto.nombre;
            this.classList.remove('is-invalid');
            document.getElementById('productSearchFeedback').innerHTML = '<i class="bi bi-check-circle text-success"></i>';
        } else {
            nombreField.value = numero ? "Producto no encontrado" : "";
            if (numero) this.classList.add('is-invalid');
            document.getElementById('productSearchFeedback').innerHTML = numero ? '<i class="bi bi-exclamation-circle text-danger"></i>' : '';
        }
    });

    // Validación de formulario
    document.getElementById('inventoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        registrarMovimiento();
    });
}

// Cargar datos del inventario
async function cargarInventario() {
    try {
        mostrarLoader();
        
        const url = new URL(API_URL);
        url.searchParams.append('action', 'getInventory');
        
        const response = await fetch(url.toString(), {
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status !== "success") {
            throw new Error(result.message || "Error en los datos recibidos");
        }

        productosData = result.data;
        renderizarInventario(result.data);
        actualizarContadores();
        
    } catch (error) {
        console.error("Error al cargar inventario:", error);
        mostrarError(error.message);
        mostrarAlerta(`Error al cargar inventario: ${error.message}`, "danger");
    }
}

// Mostrar datos en la tabla
function renderizarInventario(data) {
    const tbody = document.getElementById('inventoryTable');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    No hay productos registrados
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = data.map(item => `
        <tr class="${item.inventario < 3 ? 'table-warning' : ''}">
            <td>${item.id}</td>
            <td>${item.nombre || '-'}</td>
            <td>${item.tipo || '-'}</td>
            <td>${item.entradas || 0}</td>
            <td>${item.salidas || 0}</td>
            <td><strong>${item.inventario || 0}</strong></td>
        </tr>
    `).join('');
}

// Registrar movimiento
async function registrarMovimiento() {
    const tipo = document.getElementById('movementType').value;
    const numero = document.getElementById('productNumber').value;
    const cantidad = document.getElementById('quantity').value;
    const btn = document.getElementById('registerBtn');
    
    // Validación
    if (!numero || !cantidad || isNaN(numero) {
        mostrarAlerta("Por favor ingrese un número de producto y cantidad válidos", "warning");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Procesando...
    `;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'registerMovement',
                numero: numero,
                tipo: tipo,
                cantidad: cantidad
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.status !== "success") {
            throw new Error(result.message || "Error al registrar movimiento");
        }

        mostrarAlerta(result.message, "success");
        document.getElementById('quantity').value = "";
        await cargarInventario();
        
    } catch (error) {
        console.error("Error al registrar movimiento:", error);
        mostrarAlerta(error.message, "danger");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-save"></i> Registrar`;
    }
}

// Funciones auxiliares
function mostrarLoader() {
    document.getElementById('inventoryTable').innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-2">Cargando inventario...</p>
            </td>
        </tr>
    `;
}

function mostrarError(mensaje) {
    document.getElementById('inventoryTable').innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-danger py-4">
                <i class="bi bi-exclamation-triangle-fill"></i> ${mensaje}
            </td>
        </tr>
    `;
}

function mostrarAlerta(mensaje, tipo) {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alerta.style.zIndex = "1000";
    alerta.innerHTML = `
        <i class="bi ${tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2"></i>
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 5000);
}

function actualizarContadores() {
    if (!productosData || productosData.length === 0) return;
    
    const total = productosData.length;
    const bajoStock = productosData.filter(item => (item.inventario || 0) < 3).length;
    
    document.getElementById('totalItems').textContent = total;
    document.getElementById('lowStockItems').textContent = bajoStock;
}
