const API_URL = "https://script.google.com/macros/s/AKfycbwZ53CGqUC_vUGg2QGcOOekHRG4WQV_4_AzriqFgy-vf7QKo5qN9s1tYFhxDwlqr3w8/exec";
let productosData = [];

document.addEventListener('DOMContentLoaded', () => {
  cargarInventario();
  document.getElementById('productNumber').addEventListener('input', actualizarNombreProducto);
  document.getElementById('registerBtn').addEventListener('click', registrarMovimiento);
});

async function cargarInventario() {
  try {
    mostrarLoader();
    
    const response = await fetch(`${API_URL}?action=getInventory`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.status !== "success") {
      throw new Error(result.message || "Error al cargar inventario");
    }
    
    productosData = result.data;
    renderizarInventario(result.data);
    actualizarContadores();
    
  } catch (error) {
    console.error("Error:", error);
    mostrarError(error.message.includes("404") ? 
      "Error 404: Verifica la URL del script" : error.message);
    mostrarAlerta(`Error al cargar inventario: ${error.message}`, "danger");
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
      <td>${item[1]}</td>
      <td class="product-type">${item[2]}</td>
      <td>${item[3]}</td>
      <td>${item[4]}</td>
      <td><strong>${item[5]}</strong></td>
    </tr>
  `).join('');
}

function actualizarNombreProducto() {
  const input = document.getElementById('productNumber');
  const nombreField = document.getElementById('productName');
  const numero = parseInt(input.value);
  
  if (!numero) {
    nombreField.value = "";
    return;
  }
  
  const producto = productosData.find(item => item[0] == numero);
  nombreField.value = producto ? producto[1] : "Producto no encontrado";
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
      throw new Error(result.message);
    }

    mostrarAlerta(result.message, "success");
    document.getElementById('quantity').value = "";
    await cargarInventario();
    
  } catch (error) {
    mostrarAlerta(error.message, "danger");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `Registrar`;
  }
}

// Funciones auxiliares (mostrarLoader, mostrarError, mostrarAlerta, actualizarContadores)
// ... (igual que en el código anterior)
