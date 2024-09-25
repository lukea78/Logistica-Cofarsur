// Parte 1: Configuración Inicial y Funciones Generales
let chartType = 'bar'; // Tipo de gráfico por defecto
let workbook; // Almacenar el workbook globalmente
let charts = {}; // Almacenar las instancias de gráficos
let datosGlobales = {
    labels: {}, // Almacenar las etiquetas globales
    unidadesRecibidas: [],
    unidadesGuardadas: [],
    unidadesRepuestas: [],
    unidadesPreparadas: [],
    creditosOperativos: [],
    incidenciaCreditos: [],
    porcentajeReclamos: [],
    montoRotura: [],
    montoVencido: [],
    productividad: [],
    costosLogisticos: [],
    kilometrosTotales: [],
    unidadesCentroDistribucion: [] // Agregar datos para gráfico apilado
}; // Almacenar los datos globalmente para los mosaicos

// Cargar el archivo Excel
document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        workbook = XLSX.read(data, {type: 'array'}); // Leer el workbook

        // Generar todos los gráficos
        generarTodosLosGraficos();
        generarMosaicos(); // Generar los mosaicos
    };

    reader.readAsArrayBuffer(file);
});

// Cambiar el tipo de gráfico
document.getElementById('chart-type').addEventListener('change', function(event) {
    chartType = event.target.value;
    generarTodosLosGraficos();
});

// Función para generar todos los gráficos
function generarTodosLosGraficos() {
    procesarVolumenOperacion(workbook.Sheets['Volumen de operacion']);
    procesarServicio(workbook.Sheets['Servicio']);
    procesarAdministracionStock(workbook.Sheets['Administracion de stock']);
    procesarRRHH(workbook.Sheets['RRHH']);
    procesarCostosLogisticos(workbook.Sheets['Costos Logisticos']);
    procesarKilometros(workbook.Sheets['Km']); // Llamar a la nueva función para Kilómetros Totales
}

// Destruir gráfico existente antes de crear uno nuevo
function destruirGrafico(idCanvas) {
    if (charts[idCanvas]) {
        charts[idCanvas].destroy(); // Destruir el gráfico existente si está presente
    }
}

// Función para generar colores dinámicamente
function generarColores() {
    return {
        backgroundColor: [
            'rgba(0, 79, 114, 0.2)',  // Azul del logo
            'rgba(225, 0, 115, 0.2)', // Rosa del logo
            'rgba(0, 79, 114, 0.4)',
            'rgba(225, 0, 115, 0.4)',
            'rgba(0, 79, 114, 0.6)',
            'rgba(225, 0, 115, 0.6)'
        ],
        borderColor: [
            'rgba(0, 79, 114, 1)',    // Azul del logo
            'rgba(225, 0, 115, 1)',   // Rosa del logo
            'rgba(0, 79, 114, 1)',
            'rgba(225, 0, 115, 1)',
            'rgba(0, 79, 114, 1)',
            'rgba(225, 0, 115, 1)'
        ]
    };
}

// Función general para generar gráficos con leyenda
function generarGrafico(idCanvas, titulo, labels, data, colors) {
    destruirGrafico(idCanvas);

    const ctx = document.getElementById(idCanvas).getContext('2d');
    charts[idCanvas] = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: titulo,
                data: data.map(d => (['incidenciaCreditos', 'porcentajeReclamos', 'costosLogisticos'].includes(idCanvas) ? (d * 100).toFixed(2) : d)), // Format data accordingly
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            // Display $ for amounts and % for percentages
                            if (['montoRotura', 'montoVencido'].includes(idCanvas)) {
                                return '$' + value;
                            } else if (['incidenciaCreditos', 'porcentajeReclamos', 'costosLogisticos'].includes(idCanvas)) {
                                return value + '%';
                            }
                            return value;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 16 // Ajustar tamaño de la leyenda
                        }
                    }
                }
            }
        }
    });
}
// Parte 2: Función General para Crear Gráficos y Procesar "Volumen de Operación"

// Procesar "Volumen de operación"
function procesarVolumenOperacion(sheet) {
    const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
    const labels = data.slice(1).map(row => row[0]); // Obtener etiquetas (meses)

    let unidadesRecibidas = data.slice(1).map(row => row[1]);
    let unidadesGuardadas = data.slice(1).map(row => row[2]);
    let unidadesRepuestas = data.slice(1).map(row => row[3]);
    let unidadesPreparadas = data.slice(1).map(row => row[4]);

    const colors = generarColores();
    generarGrafico('unidadesRecibidas', 'Unidades Recibidas', labels, unidadesRecibidas, colors);
    generarGrafico('unidadesGuardadas', 'Unidades Guardadas', labels, unidadesGuardadas, colors);
    generarGrafico('unidadesRepuestas', 'Unidades Repuestas', labels, unidadesRepuestas, colors);
    generarGrafico('unidadesPreparadas', 'Unidades Preparadas', labels, unidadesPreparadas, colors);

    // Guardar datos globales para mosaicos
    datosGlobales.labels.volumenOperacion = labels; // Guardar etiquetas para Volumen de Operación
    datosGlobales.unidadesRecibidas = unidadesRecibidas;
    datosGlobales.unidadesGuardadas = unidadesGuardadas;
    datosGlobales.unidadesRepuestas = unidadesRepuestas;
    datosGlobales.unidadesPreparadas = unidadesPreparadas;
}

// Parte 3: Procesar "Servicio" y "Administración de Stock"

// Procesar "Servicio"
function procesarServicio(sheet) {
    const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
    const labels = data.slice(1).map(row => row[0]);

    let creditosOperativos = data.slice(1).map(row => row[1]);
    let incidenciaCreditos = data.slice(1).map(row => row[2]);
    let porcentajeReclamos = data.slice(1).map(row => row[8]);

    const colors = generarColores();
    generarGrafico('creditosOperativos', 'Créditos Operativos', labels, creditosOperativos, colors);
    generarGrafico('incidenciaCreditos', 'Incidencia de Créditos (%)', labels, incidenciaCreditos, colors);
    generarGrafico('porcentajeReclamos', 'Porcentaje de Reclamos (%)', labels, porcentajeReclamos, colors);

    // Guardar datos globales para mosaicos
    datosGlobales.labels.servicio = labels; // Guardar etiquetas para Servicio
    datosGlobales.creditosOperativos = creditosOperativos;
    datosGlobales.incidenciaCreditos = incidenciaCreditos;
    datosGlobales.porcentajeReclamos = porcentajeReclamos;
}
// Parte 4: Procesar "Administración de stock"

// Procesar "Administración de stock"
function procesarAdministracionStock(sheet) {
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const labels = data.slice(1).map(row => row[0]); // Obtener etiquetas

    let montoRotura = data.slice(1).map(row => row[1]);
    let montoVencido = data.slice(1).map(row => row[5]);
    let unidadesSucursales = data.slice(1).map(row => row[6]); // Unidades vencidas de sucursales (Columna G)
    let unidadesCentroDistribucion = data.slice(1).map(row => row[8]); // Unidades rotas de centro de distribución (Columna I)

    const colors = generarColores();

    // Gráficos individuales
    generarGrafico('montoRotura', 'Monto de Rotura ($)', labels, montoRotura, colors);
    generarGrafico('montoVencido', 'Monto Vencido ($)', labels, montoVencido, colors);

    // Gráfico apilado para Unidades Vencidas/Rotas de Sucursales y Centro de Distribución
    destruirGrafico('unidadesVencidas');
    const ctx = document.getElementById('unidadesVencidas').getContext('2d');
    charts['unidadesVencidas'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Unidades Vencidas (Sucursales)',
                    data: unidadesSucursales,
                    backgroundColor: 'rgba(0, 79, 114, 0.6)',
                    borderColor: 'rgba(0, 79, 114, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Unidades Rotas (Centro Distribución)',
                    data: unidadesCentroDistribucion,
                    backgroundColor: 'rgba(225, 0, 115, 0.6)',
                    borderColor: 'rgba(225, 0, 115, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: true // Activar la opción apilada
                },
                x: {
                    stacked: true // Activar la opción apilada
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 16 // Ajustar tamaño de la leyenda
                        }
                    }
                }
            }
        }
    });

    // Guardar datos globales para mosaicos
    datosGlobales.labels.administracionStock = labels; // Guardar etiquetas para Administración de Stock
    datosGlobales.montoRotura = montoRotura;
    datosGlobales.montoVencido = montoVencido;
    datosGlobales.unidadesVencidas = unidadesSucursales;
    datosGlobales.unidadesCentroDistribucion = unidadesCentroDistribucion; // Agregar datos para el gráfico apilado
}
// Parte 4: Procesar "RRHH" y "Costos Logísticos"

// Procesar "RRHH"
function procesarRRHH(sheet) {
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const labels = data.slice(1).map(row => row[0]);

    let horasTrabajadas = data.slice(1).map(row => row[1]);
    let ausentismoNoProgramado = data.slice(1).map(row => row[5]); // Utilizar valores de la columna F (ausentismo no programado)
    let unidadesProducidas = data.slice(1).map(row => row[7]);
    let productividad = data.slice(1).map(row => row[8]);

    const colors = generarColores();
    generarGrafico('horasTrabajadas', 'Horas Trabajadas', labels, horasTrabajadas, colors);

    // Cambiar título a "AUSENTISMO NO PROGRAMADO" y usar datos de columna F
    generarGrafico('ausentismo', 'Ausentismo No Programado', labels, ausentismoNoProgramado, colors);

    generarGrafico('unidadesProducidas', 'Unidades Producidas', labels, unidadesProducidas, colors);
    generarGrafico('productividad', 'Productividad', labels, productividad, colors);

    // Guardar datos globales para mosaicos
    datosGlobales.labels.rrhh = labels; // Guardar etiquetas para RRHH
    datosGlobales.horasTrabajadas = horasTrabajadas;
    datosGlobales.ausentismo = ausentismoNoProgramado; // Actualizar datos globales con los nuevos valores
    datosGlobales.unidadesProducidas = unidadesProducidas;
    datosGlobales.productividad = productividad;
}

// Procesar "Costos Logísticos"
function procesarCostosLogisticos(sheet) {
    const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
    const labels = data.slice(1).map(row => row[0]);

    let costosLogisticos = data.slice(1).map(row => row[4]);
    let ventasMes = data.slice(1).map(row => row[2]);
    let pagosTransportes = data.slice(1).map(row => row[3]);

    const colors = generarColores();
    generarGrafico('costosLogisticos', 'Costos Logísticos (%)', labels, costosLogisticos, colors);
    generarGrafico('ventasMes', 'Ventas Mes ($)', labels, ventasMes, colors);
    generarGrafico('pagosTransportes', 'Pagos a Transportes ($)', labels, pagosTransportes, colors);

    // Guardar datos globales para mosaicos
    datosGlobales.labels.costosLogisticos = labels; // Guardar etiquetas para Costos Logísticos
    datosGlobales.costosLogisticos = costosLogisticos;
    datosGlobales.ventasMes = ventasMes;
    datosGlobales.pagosTransportes = pagosTransportes;
}
// Parte 5: Procesar "Kilómetros Totales" y Generar Mosaicos

// Procesar "Kilómetros Totales"
function procesarKilometros(sheet) {
    const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
    const labels = data.slice(1).map(row => row[0]); // Meses en la columna A
    const kilometros = data.slice(1).map(row => row[1]); // Km totales en la columna B

    const colors = generarColores(); // Generar colores para la gráfica
    generarGrafico('kilometrosTotales', 'Kilómetros Totales', labels, kilometros, colors);

    // Guardar datos globales para mosaicos
    datosGlobales.labels.kilometrosTotales = labels; // Guardar etiquetas para Kilómetros Totales
    datosGlobales.kilometrosTotales = kilometros;
}

// Generar Mosaicos
function generarMosaicos() {
    const mesFiltro = document.getElementById('filtro-mes').value.trim().toLowerCase(); // Obtener el valor del filtro

    // Variables para almacenar los totales filtrados
    let totalRecibidas = 0, totalGuardadas = 0, totalRepuestas = 0, totalPreparadas = 0;
    let totalCreditos = 0, totalIncidencia = 0, totalReclamos = 0;
    let totalRotura = 0, totalVencido = 0;
    let totalProductividad = 0, totalCostos = 0, totalKm = 0;

    // Calcular valores basados en el mes de filtro
    datosGlobales.unidadesRecibidas.forEach((val, index) => {
        const mes = datosGlobales.labels.volumenOperacion[index].toLowerCase();
        if (mes.includes(mesFiltro)) {
            totalRecibidas += val;
            totalGuardadas += datosGlobales.unidadesGuardadas[index];
            totalRepuestas += datosGlobales.unidadesRepuestas[index];
            totalPreparadas += datosGlobales.unidadesPreparadas[index];
            totalCreditos += datosGlobales.creditosOperativos[index];
            totalIncidencia += datosGlobales.incidenciaCreditos[index];
            totalReclamos += datosGlobales.porcentajeReclamos[index];
            totalRotura += datosGlobales.montoRotura[index];
            totalVencido += datosGlobales.montoVencido[index];
            totalProductividad += datosGlobales.productividad[index];
            totalCostos += datosGlobales.costosLogisticos[index];
            totalKm += datosGlobales.kilometrosTotales[index];
        }
    });

    // Actualizar los valores en los mosaicos
    document.getElementById('valor-unidadesRecibidas').textContent = totalRecibidas;
    document.getElementById('valor-unidadesGuardadas').textContent = totalGuardadas;
    document.getElementById('valor-unidadesRepuestas').textContent = totalRepuestas;
    document.getElementById('valor-unidadesPreparadas').textContent = totalPreparadas;
    document.getElementById('valor-creditosOperativos').textContent = totalCreditos;

    // Convertir a porcentaje
    document.getElementById('valor-incidenciaCreditos').textContent = (totalIncidencia * 100).toFixed(2) + '%';
    document.getElementById('valor-porcentajeReclamos').textContent = (totalReclamos * 100).toFixed(2) + '%';
    document.getElementById('valor-costosLogisticos').textContent = (totalCostos * 100).toFixed(2) + '%';

    // Mostrar valores en dólares
    document.getElementById('valor-montoRotura').textContent = `$${totalRotura.toFixed(2)}`;
    document.getElementById('valor-montoVencido').textContent = `$${totalVencido.toFixed(2)}`;
    document.getElementById('valor-productividad').textContent = totalProductividad;
    document.getElementById('valor-kilometrosTotales').textContent = totalKm;
}

// Filtrar mosaicos al ingresar un valor en el filtro de mes
function filtrarMosaicos() {
    generarMosaicos(); // Regenerar los mosaicos con el nuevo filtro
}
// Parte 6: Ajustar Funcionalidad de Gráficos y Eventos

// Función para cambiar el tipo de gráfico
document.getElementById('chart-type').addEventListener('change', function(event) {
    chartType = event.target.value;
    generarTodosLosGraficos();
});

// Función para cargar y procesar el archivo Excel
document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        workbook = XLSX.read(data, {type: 'array'}); // Leer el archivo Excel en el workbook

        // Llamar a las funciones para generar gráficos y mosaicos
        generarTodosLosGraficos();
        generarMosaicos();
    };

    reader.readAsArrayBuffer(file);
});

// Destruir gráfico existente antes de crear uno nuevo
function destruirGrafico(idCanvas) {
    if (charts[idCanvas]) {
        charts[idCanvas].destroy(); // Destruir el gráfico existente si está presente
    }
}

// Función general para generar gráficos
function generarGrafico(idCanvas, titulo, labels, data, colors) {
    destruirGrafico(idCanvas);

    const ctx = document.getElementById(idCanvas).getContext('2d');
    charts[idCanvas] = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: titulo,
                data: data.map(d => (['incidenciaCreditos', 'porcentajeReclamos', 'costosLogisticos'].includes(idCanvas) ? (d * 100).toFixed(2) : d)), // Formatear datos según corresponda
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            // Mostrar $ para montos y % para porcentajes
                            if (['montoRotura', 'montoVencido'].includes(idCanvas)) {
                                return '$' + value;
                            } else if (['incidenciaCreditos', 'porcentajeReclamos', 'costosLogisticos'].includes(idCanvas)) {
                                return value + '%';
                            }
                            return value;
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 16 // Tamaño de la leyenda
                        }
                    }
                }
            }
        }
    });
}

// Generar colores dinámicos para gráficos
function generarColores() {
    return {
        backgroundColor: [
            'rgba(0, 79, 114, 0.2)',  // Azul del logo
            'rgba(225, 0, 115, 0.2)', // Rosa del logo
            'rgba(0, 79, 114, 0.4)',
            'rgba(225, 0, 115, 0.4)',
            'rgba(0, 79, 114, 0.6)',
            'rgba(225, 0, 115, 0.6)'
        ],
        borderColor: [
            'rgba(0, 79, 114, 1)',    // Azul del logo
            'rgba(225, 0, 115, 1)',   // Rosa del logo
            'rgba(0, 79, 114, 1)',
            'rgba(225, 0, 115, 1)',
            'rgba(0, 79, 114, 1)',
            'rgba(225, 0, 115, 1)'
        ]
    };
}

// Actualizar gráficos y mosaicos al cambiar el filtro de mes
document.getElementById('filtro-mes').addEventListener('change', function() {
    generarMosaicos();
    generarTodosLosGraficos();
});
// Parte 7: Finalizaciones y Ajustes Finales

// Función para actualizar mosaicos y gráficos basados en el mes seleccionado
function actualizarVista() {
    generarMosaicos(); // Generar los mosaicos con los datos actualizados
    generarTodosLosGraficos(); // Generar todos los gráficos con los datos actualizados
}

// Evento para actualizar la vista cuando se cambia el filtro de mes
document.getElementById('filtro-mes').addEventListener('change', actualizarVista);

// Evento para recargar gráficos y mosaicos al cargar un nuevo archivo Excel
document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        workbook = XLSX.read(data, { type: 'array' }); // Leer el archivo Excel en el workbook

        // Generar gráficos y mosaicos al cargar un nuevo archivo
        actualizarVista();
    };

    reader.readAsArrayBuffer(file);
});

// Llamar a la función para actualizar la vista inicial
document.addEventListener('DOMContentLoaded', actualizarVista); // Actualizar la vista cuando se carga la página

// Destruir gráficos existentes antes de crear uno nuevo
function destruirGrafico(idCanvas) {
    if (charts[idCanvas]) {
        charts[idCanvas].destroy(); // Destruir el gráfico existente si está presente
    }
}

// Función para generar gráficos con leyendas
function generarGrafico(idCanvas, titulo, labels, data, colors) {
    destruirGrafico(idCanvas);

    const ctx = document.getElementById(idCanvas).getContext('2d');
    charts[idCanvas] = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: titulo,
                data: data,
                backgroundColor: colors.backgroundColor,
                borderColor: colors.borderColor,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 16 // Tamaño de la leyenda
                        }
                    }
                }
            }
        }
    });
}

// Función para generar colores dinámicos para los gráficos
function generarColores() {
    return {
        backgroundColor: [
            'rgba(0, 79, 114, 0.2)',  // Azul del logo
            'rgba(225, 0, 115, 0.2)', // Rosa del logo
            'rgba(0, 79, 114, 0.4)',
            'rgba(225, 0, 115, 0.4)',
            'rgba(0, 79, 114, 0.6)',
            'rgba(225, 0, 115, 0.6)'
        ],
        borderColor: [
            'rgba(0, 79, 114, 1)',    // Azul del logo
            'rgba(225, 0, 115, 1)',   // Rosa del logo
            'rgba(0, 79, 114, 1)',
            'rgba(225, 0, 115, 1)',
            'rgba(0, 79, 114, 1)',
            'rgba(225, 0, 115, 1)'
        ]
    };
}
