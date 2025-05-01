// Configuración - Reemplaza con tu URL de despliegue
const API_URL = "https://script.google.com/macros/s/AKfycbzMI_W9Za39R61cDxd5x0adVHRH3GGfxGDr5-iUL5wGTKCzfzwvVkChmE2yBcSex_hs/exec";

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadInventory();
  
  document.getElementById('registerBtn').addEventListener('click', registerMovement);
});

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}?action=getInventory`);
    const data = await response.json();
    
    const select = document.getElementById('productSelect');
    select.innerHTML = data.slice(1) // Saltar encabezados
      .filter(row => row[0] && row[1]) // Filtrar filas vacías
      .map(row => `<option value="${row[1]}">${row[1]} (Stock: ${row[2]})</option>`)
      .join('');
  } catch (error) {
    console.error("Error cargando productos:", error);
    alert("Error al cargar los productos");
  }
}

async function loadInventory() {
  try {
    const response = await fetch(`${API_URL}?action=getInventory`);
    const data = await response.json();
    
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = data.slice(1) // Saltar encabezados
      .filter(row => row[0] && row[1]) // Filtrar filas vacías
      .map(row => `
        <tr>
          <td>${row[0] || ''}</td>
          <td>${row[1] || ''}</td>
          <td class="${row[2] < 2 ? 'text-danger fw-bold' : ''}">${row[2] || 0}</td>
          <td>${row[3] || 0}</td>
          <td>${row[4] || 0}</td>
        </tr>
      `).join('');
  } catch (error) {
    console.error("Error cargando inventario:", error);
    alert("Error al cargar el inventario");
  }
}

async function registerMovement() {
  const tipo = document.getElementById('movementType').value;
  const producto = document.getElementById('productSelect').value;
  const cantidad = document.getElementById('quantity').value;
  
  if (!producto || !cantidad || cantidad <= 0) {
    alert("Por favor complete todos los campos correctamente");
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append('action', 'registerMovement');
    params.append('tipo', tipo);
    params.append('producto', producto);
    params.append('cantidad', cantidad);
    
    const response = await fetch(`${API_URL}?${params.toString()}`);
    const result = await response.json();
    
    if (result.success) {
      alert("Movimiento registrado con éxito!");
      document.getElementById('quantity').value = "";
      loadInventory();
      loadProducts(); // Actualizar lista de productos
    } else {
      throw new Error(result.error || "Error desconocido");
    }
  } catch (error) {
    console.error("Error:", error);
    alert(`Error al registrar movimiento: ${error.message}`);
  }
}
