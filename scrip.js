// Configuración - Reemplaza con tu URL de Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbxQdviQi__Xf8ItkN7AyoJjBBUJqBMnWRod0c3U7Ssca2OC5zJzZDQkrdOXlRzr_AxW/exec";

document.addEventListener('DOMContentLoaded', cargarInventario);

async function cargarInventario() {
  try {
    const response = await fetch(`${API_URL}?action=getInventory`);
    const data = await response.json();
    
    // Adaptación para tu estructura de columnas
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = data.slice(4) // Saltar filas de encabezado
      .filter(row => row[1]) // Filtrar filas vacías (columna B)
      .map(row => `
        <tr>
          <td>${row[1]}</td> <!-- Columna B: ID -->
          <td>${row[2]}</td> <!-- Columna C: Nombre -->
          <td>${row[3]}</td> <!-- Columna D: Tipo -->
          <td>${row[4] || 0}</td> <!-- Columna E: Entradas -->
          <td>${row[5] || 0}</td> <!-- Columna F: Salidas -->
          <td class="${row[6] < 3 ? 'low-stock' : ''}">${row[6] || 0}</td> <!-- Columna G: Stock -->
        </tr>
      `).join('');
      
  } catch (error) {
    console.error("Error:", error);
    document.querySelector('#inventoryTable tbody').innerHTML = `
      <tr><td colspan="6">Error al cargar inventario</td></tr>
    `;
  }
}

async function registrarMovimiento(tipo, productoId, cantidad) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        action: 'registerMovement',
        tipo: tipo,
        id: productoId, // Usamos columna B (ID numérico)
        cantidad: cantidad
      })
    });
    
    const result = await response.json();
    if (result.success) {
      cargarInventario();
      return true;
    }
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}
