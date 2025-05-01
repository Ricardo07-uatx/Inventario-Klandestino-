const API_URL = "https://script.google.com/macros/s/AKfycbxeifFvvXvdFMx8yRne1hAciNIA4R83sxy_56aPQsx-YFDZr46Ksz3LHWVXq5aKzfbN/exec";
let productosData = [];

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarInventario();
    configurarEventos();
});

function configurarEventos() {
    document.getElementById('productNumber').addEventListener('input', actualizarNombreProducto);
    document.getElementById('registerBtn').addEventListener('click', registrarMovimiento);
}

async function cargarInventario() {
    try {
        mostrarLoader();
        
        const response = await fetch(`${API_URL}?action=getInventory`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo conectar con el servidor`);
        }
        
        const result = await response.json();
        
        if (result.status !== "success") {
            throw new Error(result.message || "Error en los datos recibidos");
        }
        
        if (!result.data || result.data.length === 0) {
            throw new Error("El inventario está vacío");
        }
        
        productosData = result.data;
        renderizarInventario(result.data);
        actualizarContadores();
        
    } catch (error) {
        console.error("Error al cargar inventario:", error);
        mostrarError(error.message);
        mostrarAlerta(`Error: ${error.message}`, "danger");
    }
}

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
        <tr class="${item[5] < 3 ? 'low-stock' : ''}">
            <td>${item[0]}</td>
            <td>${item[1] || '-'}</td>
            <td class="product-type">${item[2] || '-'}</td>
            <td>${item[3] || 0}</td>
            <td>${item[4] || 0}</td>
            <td><strong>${item[5] || 0}</strong></td>
        </tr>
    `).join('');
}

function actualizarNombreProducto() {
    const input = document.getElementById('productNumber');
    const nombreField = document.getElementById('productName');
    const feedback = document.getElementById('productSearchFeedback');
    const numero = parseInt(input.value);
    
    if (!numero || isNaN(numero)) {
        nombreField.value = "";
        input.classList.remove('product-not-found', 'searching');
        feedback.innerHTML = "";
        return;
    }
    
    input.classList.add('searching');
    
    setTimeout(() => {
        const producto = productosData.find(item => item[0] == numero);
        input.classList.remove('searching');
        
        if (producto) {
            nombreField.value = producto[1];
            input.classList.remove('product-not-found');
            feedback.innerHTML = `<span class="text-success">✓</span>`;
        } else {
            nombreField.value = "Producto no encontrado";
            input.classList.add('product-not-found');
            feedback.innerHTML = `<span class="text-danger">✗</span>`;
        }
    }, 300);
}

async function registrarMovimiento() {
    const tipo = document.getElementById('movementType').value;
    const numero = document.getElementById('productNumber').value;
    const cantidad = document.getElementById('quantity').value;
    
    if (!numero || !cantidad) {
        mostrarAlerta("Complete todos los campos", "warning");
        return;
    }

    const btn = document.getElementById('registerBtn');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Procesando...`;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'registerMovement',
                numero: numero,
                tipo: tipo,
                cantidad: cantidad
            })
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);
        
        const result = await response.json();
        
        if (result.status !== "success") {
            throw new Error(result.message || "Error al registrar movimiento");
        }

        mostrarAlerta(result.message, "success");
        document.getElementById('quantity').value = "";
        await cargarInventario();
        
    } catch (error) {
        console.error("Error al registrar:", error);
        mostrarAlerta(error.message, "danger");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-check-circle me-1"></i> Registrar`;
    }
}

function mostrarLoader() {
    document.getElementById('inventoryTable').innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                <div class="spinner-border text-primary"></div>
                <p class="mt-2">Cargando inventario...</p>
            </td>
        </tr>
    `;
}

function mostrarError(mensaje) {
    document.getElementById('inventoryTable').innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-danger py-4">
                ${mensaje}
            </td>
        </tr>
    `;
}

function mostrarAlerta(mensaje, tipo) {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alerta.style.zIndex = "1000";
    alerta.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 5000);
}

function actualizarContadores() {
    if (!productosData || productosData.length === 0) return;
    
    const total = productosData.length;
    const bajoStock = productosData.filter(item => (item[5] || 0) < 3).length;
    
    document.getElementById('totalItems').textContent = total;
    document.getElementById('lowStockItems').textContent = bajoStock;
}
