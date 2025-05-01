// Configuración - Reemplaza con tu URL de Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbxQdviQi__Xf8ItkN7AyoJjBBUJqBMnWRod0c3U7Ssca2OC5zJzZDQkrdOXlRzr_AxW/exec";

// Cargar productos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarInventario();
});

// Función para cargar el inventario desde Google Sheets
async function cargarInventario() {
  try {
    const response = await fetch(`${API_URL}?action=getInventory`);
    const data = await response.json();
    
    // Filtrar filas vacías y omitir encabezados (primera fila)
    const productos = data.slice(1).filter(row => row[0] && row[1]);
    
    // Generar HTML para la tabla
    const tbody = document.querySelector('#tabla-inventario tbody');
    tbody.innerHTML = productos.map(producto => `
      <tr>
        <td>${producto[0] || '-'}</td> <!-- ID -->
        <td>${producto[1] || '-'}</td> <!-- Nombre -->
        <td class="${producto[2] < 5 ? 'stock-bajo' : ''}">${producto[2] || 0}</td> <!-- Stock -->
        <td>${producto[3] || 0}</td> <!-- Entradas -->
        <td>${producto[4] || 0}</td> <!-- Salidas -->
      </tr>
    `).join('');
    
  } catch (error) {
    console.error("Error cargando inventario:", error);
    document.querySelector('#tabla-inventario tbody').innerHTML = `
      <tr>
        <td colspan="5" class="error">Error al cargar los datos. Recarga la página.</td>
      </tr>
    `;
  }
}

// Función para registrar movimientos (entradas/salidas)
async function registrarMovimiento(tipo, productoId, cantidad) {
  try {
    const params = new URLSearchParams();
    params.append('action', 'registerMovement');
    params.append('tipo', tipo);
    params.append('producto', productoId);
    params.append('cantidad', cantidad);
    
    const response = await fetch(`${API_URL}?${params.toString()}`);
    const result = await response.json();
    
    if (result.success) {
      cargarInventario(); // Actualizar tabla después de registrar
      return true;
    } else {
      throw new Error(result.error || "Error desconocido");
    }
  } catch (error) {
    console.error("Error registrando movimiento:", error);
    alert(`Error: ${error.message}`);
    return false;
  }
}
