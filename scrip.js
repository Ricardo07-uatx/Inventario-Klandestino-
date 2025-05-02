// config.js - Archivo de configuración
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbzGPGQEczWDH1zlNrkVK8LGPc_hkA3GJJqWOnWWbYnBjWVEkRDgUy7W65gY1mrbDmM/exec",
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

// inventory.js - Lógica principal
class InventoryManager {
  constructor() {
    this.products = [];
    this.initialize();
  }

  async initialize() {
    this.setupEventListeners();
    await this.loadInventory();
  }

  setupEventListeners() {
    document.getElementById('productNumber').addEventListener('input', (e) => {
      this.handleProductSearch(e.target.value);
    });

    document.getElementById('inventoryForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.registerMovement();
    });

    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.loadInventory();
    });
  }

  async fetchInventory() {
    try {
      const url = new URL(CONFIG.API_URL);
      url.searchParams.append('action', 'getInventory');
      url.searchParams.append('cacheBuster', Date.now());

      const response = await this.retryFetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  async retryFetch(url, options, retries = CONFIG.MAX_RETRIES, delay = CONFIG.RETRY_DELAY) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.ok) return response;
        throw new Error(`Attempt ${i + 1} failed`);
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async loadInventory() {
    try {
      this.showLoader();
      
      const result = await this.fetchInventory();
      
      if (result.status !== "success") {
        throw new Error(result.message || "Invalid data format");
      }

      this.products = result.data || [];
      this.renderInventory(this.products);
      this.updateCounters();
      
    } catch (error) {
      console.error('Inventory load error:', error);
      this.showError(error.message);
      this.showAlert(`Error loading inventory: ${error.message}`, 'danger');
    }
  }

  handleProductSearch(productNumber) {
    const num = parseInt(productNumber);
    const productField = document.getElementById('productName');
    const feedbackElement = document.getElementById('productSearchFeedback');
    
    if (!num) {
      productField.value = "";
      feedbackElement.innerHTML = '';
      return;
    }

    const product = this.products.find(item => item.id === num);
    
    if (product) {
      productField.value = product.nombre;
      feedbackElement.innerHTML = '<i class="bi bi-check-circle text-success"></i>';
    } else {
      productField.value = "Product not found";
      feedbackElement.innerHTML = '<i class="bi bi-exclamation-circle text-danger"></i>';
    }
  }

  async registerMovement() {
    const type = document.getElementById('movementType').value;
    const productNumber = document.getElementById('productNumber').value;
    const quantity = document.getElementById('quantity').value;
    const button = document.getElementById('registerBtn');

    if (!productNumber || !quantity) {
      this.showAlert("Please enter product number and quantity", "warning");
      return;
    }

    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processing...';

    try {
      const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'registerMovement',
          numero: productNumber,
          tipo: type,
          cantidad: quantity
        })
      });

      const result = await response.json();
      
      if (result.status !== "success") {
        throw new Error(result.message || "Registration failed");
      }

      this.showAlert(result.message, "success");
      document.getElementById('quantity').value = "";
      await this.loadInventory();
      
    } catch (error) {
      console.error('Registration error:', error);
      this.showAlert(error.message, "danger");
    } finally {
      button.disabled = false;
      button.innerHTML = '<i class="bi bi-save"></i> Register';
    }
  }

  renderInventory(data) {
    const tbody = document.getElementById('inventoryTable');
    
    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4 text-muted">
            No products available
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

  updateCounters() {
    const totalElement = document.getElementById('totalItems');
    const lowStockElement = document.getElementById('lowStockItems');
    
    if (!this.products || this.products.length === 0) {
      totalElement.textContent = '0';
      lowStockElement.textContent = '0';
      return;
    }
    
    totalElement.textContent = this.products.length;
    lowStockElement.textContent = this.products.filter(item => item.inventario < 3).length;
  }

  showLoader() {
    document.getElementById('inventoryTable').innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading inventory...</p>
        </td>
      </tr>
    `;
  }

  showError(message) {
    document.getElementById('inventoryTable').innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-danger py-4">
          <i class="bi bi-exclamation-triangle-fill"></i> ${message}
        </td>
      </tr>
    `;
  }

  showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer') || document.body;
    const alertId = `alert-${Date.now()}`;
    
    const alert = document.createElement('div');
    alert.id = alertId;
    alert.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alert.style.zIndex = "1000";
    alert.innerHTML = `
      <i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
      const alertElement = document.getElementById(alertId);
      if (alertElement) {
        alertElement.remove();
      }
    }, 5000);
  }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const inventoryApp = new InventoryManager();
  window.inventoryApp = inventoryApp; // Para acceso desde consola si es necesario
});
