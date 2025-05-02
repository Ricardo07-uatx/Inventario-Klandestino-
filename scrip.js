<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventario Klandestino | Sistema de Gestión</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="estilo.css">
</head>
<body>
    <div class="dashboard">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="logo">
                <i class="fas fa-boxes"></i>
                <span>Klandestino</span>
            </div>
            <nav>
                <ul>
                    <li class="active"><a href="#"><i class="fas fa-home"></i> Inicio</a></li>
                    <li><a href="#"><i class="fas fa-box-open"></i> Inventario</a></li>
                    <li><a href="#"><i class="fas fa-exchange-alt"></i> Movimientos</a></li>
                    <li><a href="#"><i class="fas fa-chart-bar"></i> Reportes</a></li>
                    <li><a href="#"><i class="fas fa-cog"></i> Configuración</a></li>
                </ul>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="header">
                <h1><i class="fas fa-clipboard-list"></i> Panel de Inventario</h1>
                <div class="user-info">
                    <span>Ricardo</span>
                    <div class="avatar">R</div>
                </div>
            </header>

            <div class="content">
                <!-- Cards Resumen -->
                <div class="summary-cards">
                    <div class="card">
                        <div class="card-icon blue">
                            <i class="fas fa-boxes"></i>
                        </div>
                        <div class="card-info">
                            <h3>Total Productos</h3>
                            <span id="total-productos">0</span>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-icon green">
                            <i class="fas fa-arrow-down"></i>
                        </div>
                        <div class="card-info">
                            <h3>Entradas</h3>
                            <span id="total-entradas">0</span>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-icon orange">
                            <i class="fas fa-arrow-up"></i>
                        </div>
                        <div class="card-info">
                            <h3>Salidas</h3>
                            <span id="total-salidas">0</span>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-icon red">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="card-info">
                            <h3>Stock Bajo</h3>
                            <span id="stock-bajo">0</span>
                        </div>
                    </div>
                </div>

                <!-- Sección de Movimientos -->
                <div class="movimiento-section">
                    <div class="section-header">
                        <h2><i class="fas fa-exchange-alt"></i> Registrar Movimiento</h2>
                    </div>
                    <form id="movimiento-form" class="modern-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="tipo-movimiento"><i class="fas fa-tag"></i> Tipo de Movimiento</label>
                                <select id="tipo-movimiento" required>
                                    <option value="">Seleccionar...</option>
                                    <option value="entrada">Entrada</option>
                                    <option value="salida">Salida</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="producto-id"><i class="fas fa-box"></i> Producto</label>
                                <select id="producto-id" required>
                                    <option value="">Cargando productos...</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="cantidad"><i class="fas fa-hashtag"></i> Cantidad</label>
                                <input type="number" id="cantidad" min="1" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="notas"><i class="fas fa-sticky-note"></i> Notas</label>
                                <input type="text" id="notas" placeholder="Opcional">
                            </div>
                        </div>
                        
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i> Registrar Movimiento
                        </button>
                    </form>
                </div>

                <!-- Tabla de Inventario -->
                <div class="inventario-section">
                    <div class="section-header">
                        <h2><i class="fas fa-boxes"></i> Inventario Actual</h2>
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="buscar-producto" placeholder="Buscar producto...">
                        </div>
                    </div>
                    
                    <div id="loading" class="loading">
                        <div class="spinner"></div>
                        <span>Cargando inventario...</span>
                    </div>
                    
                    <div id="error-message" class="error-message"></div>
                    
                    <div class="table-container">
                        <table id="inventario-table">
                            <thead>
                                <tr>
                                    <th>ID <i class="fas fa-sort"></i></th>
                                    <th>Producto <i class="fas fa-sort"></i></th>
                                    <th>Tipo <i class="fas fa-sort"></i></th>
                                    <th>Entradas <i class="fas fa-sort"></i></th>
                                    <th>Salidas <i class="fas fa-sort"></i></th>
                                    <th>Stock <i class="fas fa-sort"></i></th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                    
                    <div class="table-footer">
                        <div class="pagination">
                            <button class="btn-pagination" disabled><i class="fas fa-chevron-left"></i></button>
                            <span>Página 1 de 1</span>
                            <button class="btn-pagination" disabled><i class="fas fa-chevron-right"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="script.js"></script>
</body>
</html>
