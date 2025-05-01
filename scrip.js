const API_URL = "https://script.google.com/macros/s/AKfycbx7LQNrFK2FXy-G_XduARwJE4msE_KD9JTd5WyVPhVgZmwdGXPxmUSvLxNCJodWdC8x/exec";
let productosData = [];

// Cargar inventario al iniciar
document.addEventListener('DOMContentLoaded', () => {
  cargarInventario();
  document.getElementById('productNumber').addEventListener('input', actualizarNombreProducto);
});

async function cargarInventario() {
  try {
    mostrarLoader();
    
    const response = await fetch(`${API_URL}?action=getInventory`);
    
    if (!response.ok) throw new Error(`Error ${response.status}`);
    
    const { status, data, message } = await response.json();
    
    if (status !== "success") throw new Error(message || "Error al cargar inventario");
    if (!data || data.length === 0) throw new Error("Inventario vacío");
    
    productosData = data;
    renderizarInventario(data);
    
  } catch (error) {
    console.error("Error:", error);
    mostrarError(error.message.includes("404") ? 
      "Error 404: Verifica la URL del script" : error.message);
  }
}

function renderizarInventario(data) {
  const tbody = document.getElementById('inventoryTable');
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
  
  if (!numero) {
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
    mostrarAlerta("Complete todos los campos", "danger");
    return;
  }

  const btn = document.getElementById('registerBtn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Procesando...`;
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ numero, tipo, cantidad })
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);
    
    const { status, message } = await response.json();
    if (status !== "success") throw new Error(message);
    
    mostrarAlerta(message, "success");
    document.getElementById('quantity').value = "";
    await cargarInventario();
    
  } catch (error) {
    mostrarAlerta(error.message, "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Registrar";
  }
}

function mostrarLoader() {
  document.getElementById('inventoryTable').innerHTML = `
    <tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr>
  `;
}

function mostrarError(mensaje) {
  document.getElementById('inventoryTable').innerHTML = `
    <tr><td colspan="6" class="text-center text-danger py-4">${mensaje}</td></tr>
  `;
}

function mostrarAlerta(mensaje, tipo) {
  const alerta = document.createElement('div');
  alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
  alerta.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alerta);
  setTimeout(() => alerta.remove(), 5000);
}
