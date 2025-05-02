document.addEventListener('DOMContentLoaded', function() {
    // Configuración
    const API_URL = "https://script.google.com/macros/s/AKfycbwZ53CGqUC_vUGg2QGcOOekHRG4WQV_4_AzriqFgy-vf7QKo5qN9s1tYFhxDwlqr3w8/exec";
    let inventoryData = [];
    
    // Elementos del DOM
    const elements = {
        productNumber: document.getElementById('productNumber'),
        productName: document.getElementById('productName'),
        movementType: document.getElementById('movementType'),
        quantity: document.getElementById('quantity'),
        registerBtn: document.getElementById('registerBtn'),
        inventoryTable: document.getElementById('inventoryTable'),
        totalItems: document.getElementById('totalItems'),
        lowStockItems: document.getElementById('lowStockItems')
    };

    // Inicialización
    init();

    function init() {
        setupEventListeners();
        loadInventory();
    }

    function setupEventListeners() {
        elements.productNumber.addEventListener('input', handleProductSearch);
        elements.registerBtn.addEventListener('click', registerMovement);
    }

    async function loadInventory() {
        try {
            showLoadingState();
            
            const response = await fetchWithRetry(`${API_URL}?action=getInventory&cache=${Date.now()}`);
            
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status !== "success") {
                throw new Error(result.message || "Formato de datos inválido");
            }
            
            inventoryData = result.data || [];
            renderInventory();
            updateCounters();
            
        } catch (error) {
            console.error("Error al cargar inventario:", error);
            showErrorState(error.message);
            showAlert(`Error: ${error.message}`, 'danger');
        }
    }

    async function fetchWithRetry(url, options = {}, retries = 3) {
        try {
            const response = await fetch(url, options);
            
            // Verificar si la respuesta es una redirección no deseada
            if (response.url.includes('googleusercontent.com')) {
                throw new Error('Redirección no autorizada');
            }
            
            return response;
        } catch (error) {
            if (retries <= 0) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchWithRetry(url, options, retries - 1);
        }
    }

    function handleProductSearch() {
        const productId = parseInt(elements.productNumber.value);
        const product = inventoryData.find(item => item.id === productId);
        
        elements.productName.value = product ? product.nombre : "Producto no encontrado";
    }

    async function registerMovement() {
        const movementData = {
            numero: elements.productNumber.value,
            tipo: elements.movementType.value,
            cantidad: elements.quantity.value
        };
        
        if (!movementData.numero || !movementData.cantidad) {
            showAlert("Complete todos los campos", "warning");
            return;
        }
        
        try {
            setRegisterButtonState(true);
            
            const response = await fetchWithRetry(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'registerMovement',
                    ...movementData
                })
            });
            
            const result = await response.json();
            
            if (result.status !== "success") {
                throw new Error(result.message || "Error al registrar");
            }
            
            showAlert("Movimiento registrado exitosamente", "success");
            elements.quantity.value = "";
            await loadInventory();
            
        } catch (error) {
            console.error("Error al registrar:", error);
            showAlert(error.message, "danger");
        } finally {
            setRegisterButtonState(false);
        }
    }

    function renderInventory() {
        if (!inventoryData.length) {
            elements.inventoryTable.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        No hay productos en el inventario
                    </td>
                </tr>
            `;
            return;
        }
        
        elements.inventoryTable.innerHTML = inventoryData.map(item => `
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

    function updateCounters() {
        elements.totalItems.textContent = inventoryData.length;
        elements.lowStockItems.textContent = inventoryData.filter(item => item.inventario < 3).length;
    }

    function showLoadingState() {
        elements.inventoryTable.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="spinner-border text-primary"></div>
                    <p class="mt-2">Cargando inventario...</p>
                </td>
            </tr>
        `;
    }

    function showErrorState(message) {
        elements.inventoryTable.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-triangle"></i> ${message}
                </td>
            </tr>
        `;
    }

    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alert.style.zIndex = "1000";
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 5000);
    }

    function setRegisterButtonState(isLoading) {
        elements.registerBtn.disabled = isLoading;
        elements.registerBtn.innerHTML = isLoading
            ? '<span class="spinner-border spinner-border-sm"></span> Procesando...'
            : '<i class="bi bi-save"></i> Registrar';
    }
});
