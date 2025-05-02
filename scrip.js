const SHEET_URL = "https://script.google.com/macros/s/AKfycbzCIkzImT5Lq886ByRq_Wj8oJzSs5N2j49cN4-bQp4/dev?action=leerInventario"; // Reemplaza con tu Web App URL

// Cargar inventario
async function cargarInventario() {
  const res = await fetch(`${SHEET_URL}?action=leerInventario`);
  const data = await res.json();

  const tbody = document.getElementById("inventory-table");
  tbody.innerHTML = "";

  data.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

document.getElementById("entrada-form").addEventListener("submit", async e => {
  e.preventDefault();
  const num = document.getElementById("numeroProductoEntrada").value;
  const cant = document.getElementById("cantidadEntrada").value;

  await fetch(`${SHEET_URL}?action=agregarEntrada&numero=${num}&cantidad=${cant}`);
  cargarInventario();
});

document.getElementById("salida-form").addEventListener("submit", async e => {
  e.preventDefault();
  const num = document.getElementById("numeroProductoSalida").value;
  const cant = document.getElementById("cantidadSalida").value;

  await fetch(`${SHEET_URL}?action=agregarSalida&numero=${num}&cantidad=${cant}`);
  cargarInventario();
});

window.onload = cargarInventario;
