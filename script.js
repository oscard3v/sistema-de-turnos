
const users = {
    'admin@admin.com': { password: '123456', role: 'admin' },
    'profesional1@profesional.com': { password: '123456', role: 'profesional' },
    'profesional2@profesional.com': { password: '123456', role: 'profesional' },
    'usuario@usuario.com': { password: '123456', role: 'usuario' }
};

function validarLogin(email, password) {
    if (users[email] && users[email].password === password) {
        localStorage.setItem('currentUserRole', users[email].role);
        localStorage.setItem('currentUser', email);
        if (users[email].role === 'profesional') {
            // Store professional id for filtering turnos
            if (email === 'profesional1@profesional.com') {
                localStorage.setItem('profesionalId', '1');
            } else if (email === 'profesional2@profesional.com') {
                localStorage.setItem('profesionalId', '2');
            }
        }
        return true;
    }
    return false;
}

// Datos de ejemplo (simulando una base de datos)
let servicios = [
    { id: 1, nombre: 'Consulta General', duracion: 30 },
    { id: 2, nombre: 'Tratamiento Específico', duracion: 45 },
    { id: 3, nombre: 'Evaluación Completa', duracion: 60 }
];

let profesionales = [
    { id: 1, nombre: 'Dr. Juan Pérez' },
    { id: 2, nombre: 'Dra. María González' },
    { id: 3, nombre: 'Dr. Carlos Rodríguez' },
    { id: 4, nombre: 'Dra. Ana Martínez' }
];

let turnos = [
    {
        id: 1,
        fecha: '2024-01-20',
        hora: '09:00',
        profesionalId: 1,
        servicioId: 1,
        estado: 'pendiente',
        cliente: 'Pablo Gómez'
    }
];

function verificarAutenticacion() {
    const currentPage = window.location.pathname;
    const currentUserRole = localStorage.getItem('currentUserRole');

    if (currentPage.includes('admin.html')) {
        if (currentUserRole !== 'admin') {
            window.location.href = 'index.html';
            return false;
        }
    } else if (currentPage.includes('profesional.html')) {
        if (currentUserRole !== 'profesional') {
            window.location.href = 'index.html';
            return false;
        }
        const nombreProfesional = localStorage.getItem('currentUser');
        if (nombreProfesional) {
            const nombreElem = document.getElementById('nombreProfesional');
            if (nombreElem) {
                nombreElem.textContent = nombreProfesional;
            }
        }
        cargarTurnosProfesional();
    }
    return true;
}

// Funciones de gestión de servicios
function agregarServicio(event) {
    event.preventDefault();
    const nombre = document.getElementById('nombreServicio').value;
    const duracion = parseInt(document.getElementById('duracionServicio').value);

    if (!nombre || !duracion) {
        showErrorToast('Por favor completa todos los campos');
        return;
    }

    const nuevoServicio = {
        id: servicios.length + 1,
        nombre,
        duracion
    };

    servicios.push(nuevoServicio);
    document.getElementById('servicioForm').reset();
    actualizarTablaServicios();
    showSuccessToast('Servicio agregado correctamente');
}

function eliminarServicio(id) {
    servicios = servicios.filter(s => s.id !== id);
    actualizarTablaServicios();
    showSuccessToast('Servicio eliminado correctamente');
}

// Funciones de gestión de turnos
function actualizarEstadoTurno(turnoId, nuevoEstado) {
    const turno = turnos.find(t => t.id === turnoId);
    if (turno) {
        turno.estado = nuevoEstado;
        actualizarTablaTurnos();
        showSuccessToast(`Turno marcado como ${nuevoEstado}`);
    }
}

function filtrarTurnos(profesionalId = null) {
    let turnosFiltrados = [...turnos];
    
    const fecha = document.getElementById('filtroFecha')?.value;
    const servicio = document.getElementById('filtroServicio')?.value;
    const estado = document.getElementById('filtroEstado')?.value;

    if (fecha) {
        turnosFiltrados = turnosFiltrados.filter(t => t.fecha === fecha);
    }
    
    if (servicio) {
        turnosFiltrados = turnosFiltrados.filter(t => t.servicioId === parseInt(servicio));
    }
    
    if (estado) {
        turnosFiltrados = turnosFiltrados.filter(t => t.estado === estado);
    }
    
    if (profesionalId) {
        turnosFiltrados = turnosFiltrados.filter(t => t.profesionalId === parseInt(profesionalId));
    }

    return turnosFiltrados;
}

// Funciones de actualización de UI
function actualizarTablaServicios() {
    const tabla = document.getElementById('serviciosTable');
    if (!tabla) return;

    tabla.innerHTML = servicios.map(servicio => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${servicio.nombre}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${servicio.duracion} min</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="eliminarServicio(${servicio.id})" 
                        class="text-red-600 hover:text-red-900">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}

function actualizarTablaTurnos() {
    const tablaProfesional = document.getElementById('turnosProfesionalTable');
    const tablaAdmin = document.getElementById('turnosAdminTable');
    const profesionalId = localStorage.getItem('profesionalId');

    const turnosFiltrados = filtrarTurnos(profesionalId);

    if (tablaProfesional) {
        actualizarTablaTurnosProfesional(turnosFiltrados);
        actualizarEstadisticas(turnosFiltrados);
    }

    if (tablaAdmin) {
        actualizarTablaTurnosAdmin(turnosFiltrados);
    }
}

function actualizarTablaTurnosProfesional(turnosFiltrados) {
    const tabla = document.getElementById('turnosProfesionalTable');
    if (!tabla) return;

    tabla.innerHTML = turnosFiltrados.map(turno => {
        const servicio = servicios.find(s => s.id === turno.servicioId);
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${turno.fecha}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${turno.hora}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${turno.cliente}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${servicio?.nombre || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${turno.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                          turno.estado === 'realizado' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}">
                        ${turno.estado}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    ${turno.estado === 'pendiente' ? `
                        <button onclick="actualizarEstadoTurno(${turno.id}, 'realizado')" 
                                class="text-green-600 hover:text-green-900 mr-2">
                            Realizar
                        </button>
                        <button onclick="actualizarEstadoTurno(${turno.id}, 'cancelado')" 
                                class="text-red-600 hover:text-red-900">
                            Cancelar
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function actualizarTablaTurnosAdmin(turnosFiltrados) {
    const tabla = document.getElementById('turnosAdminTable');
    if (!tabla) return;

    tabla.innerHTML = turnosFiltrados.map(turno => {
        const servicio = servicios.find(s => s.id === turno.servicioId);
        const profesional = profesionales.find(p => p.id === turno.profesionalId);
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${turno.id}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${turno.fecha}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${turno.hora}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${profesional?.nombre || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${servicio?.nombre || ''}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${turno.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                          turno.estado === 'realizado' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}">
                        ${turno.estado}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="eliminarTurno(${turno.id})" 
                            class="text-red-600 hover:text-red-900">
                        Eliminar
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function actualizarEstadisticas(turnosFiltrados) {
    const pendientes = turnosFiltrados.filter(t => t.estado === 'pendiente').length;
    const realizados = turnosFiltrados.filter(t => t.estado === 'realizado').length;
    const cancelados = turnosFiltrados.filter(t => t.estado === 'cancelado').length;

    document.getElementById('turnosPendientes').textContent = pendientes;
    document.getElementById('turnosRealizados').textContent = realizados;
    document.getElementById('turnosCancelados').textContent = cancelados;
}

// Funciones de exportación
function exportarTurnosCSV() {
    const turnosFiltrados = filtrarTurnos();
    const csvContent = generarCSV(turnosFiltrados);
    descargarCSV(csvContent, 'turnos.csv');
    showSuccessToast('Turnos exportados correctamente');
}

function exportarMisTurnosCSV() {
    const profesionalId = localStorage.getItem('profesionalId');
    const turnosFiltrados = filtrarTurnos(parseInt(profesionalId));
    const csvContent = generarCSV(turnosFiltrados);
    descargarCSV(csvContent, 'mis_turnos.csv');
    showSuccessToast('Turnos exportados correctamente');
}

function generarCSV(turnos) {
    const headers = ['ID', 'Fecha', 'Hora', 'Profesional', 'Servicio', 'Cliente', 'Estado'];
    const rows = turnos.map(turno => {
        const profesional = profesionales.find(p => p.id === turno.profesionalId);
        const servicio = servicios.find(s => s.id === turno.servicioId);
        return [
            turno.id,
            turno.fecha,
            turno.hora,
            profesional?.nombre || '',
            servicio?.nombre || '',
            turno.cliente,
            turno.estado
        ];
    });

    return [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
}

function descargarCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function cargarProfesionales() {
    let profesionales = JSON.parse(localStorage.getItem('profesionales')) || [];
    return profesionales;
}

function guardarProfesionales(profesionales) {
    localStorage.setItem('profesionales', JSON.stringify(profesionales));
}

function actualizarTablaProfesionales() {
    const profesionales = cargarProfesionales();
    const tabla = document.getElementById('profesionalesTable');
    if (!tabla) return;

    tabla.innerHTML = profesionales.map((profesional, index) => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${profesional.nombre}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${profesional.servicio}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editarProfesional(${index})" class="text-indigo-600 hover:text-indigo-900 mr-2">Editar</button>
                <button onclick="eliminarProfesional(${index})" class="text-red-600 hover:text-red-900">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function agregarProfesional(event) {
    event.preventDefault();
    const nombreInput = document.getElementById('nombreProfesional');
    const servicioSelect = document.getElementById('servicioProfesional');

    const nombre = nombreInput.value.trim();
    const servicio = servicioSelect.value;

    if (!nombre || !servicio) {
        showErrorToast('Por favor completa todos los campos');
        return;
    }

    let profesionales = cargarProfesionales();

    if (profesionalEditIndex !== null) {
        // Editar profesional existente
        profesionales[profesionalEditIndex] = { nombre, servicio };
        profesionalEditIndex = null;
        document.querySelector('#profesionalForm button[type="submit"]').textContent = 'Agregar Profesional';
    } else {
        // Agregar nuevo profesional
        profesionales.push({ nombre, servicio });
    }

    guardarProfesionales(profesionales);
    actualizarTablaProfesionales();
    nombreInput.value = '';
    servicioSelect.value = '';
    showSuccessToast('Profesional guardado correctamente');
}

let profesionalEditIndex = null;

function editarProfesional(index) {
    let profesionales = cargarProfesionales();
    const profesional = profesionales[index];
    if (!profesional) return;

    document.getElementById('nombreProfesional').value = profesional.nombre;
    document.getElementById('servicioProfesional').value = profesional.servicio;
    profesionalEditIndex = index;
    document.querySelector('#profesionalForm button[type="submit"]').textContent = 'Guardar Cambios';
}

function eliminarProfesional(index) {
    if (!confirm('¿Estás seguro de que deseas eliminar este profesional?')) return;

    let profesionales = cargarProfesionales();
    profesionales.splice(index, 1);
    guardarProfesionales(profesionales);
    actualizarTablaProfesionales();
    showSuccessToast('Profesional eliminado correctamente');
}

function loadServicesDropdown() {
    const enabledServices = JSON.parse(localStorage.getItem('enabledServices')) || {};
    const servicioSelect = document.getElementById('servicioProfesional');
    if (!servicioSelect) return;

    servicioSelect.innerHTML = '<option value="">Selecciona un servicio</option>';
    for (const [serviceName, isEnabled] of Object.entries(enabledServices)) {
        if (isEnabled) {
            const option = document.createElement('option');
            option.value = serviceName;
            option.textContent = serviceName;
            servicioSelect.appendChild(option);
        }
    }
}

// Event Listeners y configuración inicial
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();

    // Configurar event listeners para filtros
    const filtros = ['filtroFecha', 'filtroProfesional', 'filtroServicio', 'filtroEstado'];
    filtros.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('change', actualizarTablaTurnos);
        }
    });

    // Configurar formulario de servicio
    const servicioForm = document.getElementById('servicioForm');
    if (servicioForm) {
        servicioForm.addEventListener('submit', agregarServicio);
    }

    // Configurar formulario de login modal
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (validarLogin(email, password)) {
                const role = localStorage.getItem('currentUserRole');
                if (role === 'admin') {
                    window.location.href = 'admin.html';
                } else if (role === 'profesional') {
                    window.location.href = 'profesional.html';
                } else if (role === 'usuario') {
                    window.location.href = 'index.html';
                }
            } else {
                showErrorToast('Email o contraseña incorrectos');
            }
        });
    }

    // Configurar formulario de profesionales
    const profesionalForm = document.getElementById('profesionalForm');
    if (profesionalForm) {
        profesionalForm.addEventListener('submit', agregarProfesional);
    }

    // Cargar servicios en select de profesionales
    loadServicesDropdown();

    // Actualizar tabla de profesionales
    actualizarTablaProfesionales();

    // Función para cerrar sesión
    function logout() {
        localStorage.removeItem('currentUserRole');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('profesionalId');
        window.location.href = 'index.html';
    }

    // Configurar botones de logout
    const logoutButtons = document.querySelectorAll('#logoutBtn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', logout);
    });

    // Configurar recuperación de contraseña
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    const backToLoginBtn = document.getElementById('backToLoginBtn');
    const loginFields = document.getElementById('loginFields');
    const forgotPasswordFields = document.getElementById('forgotPasswordFields');
    const modalTitle = document.getElementById('modalTitle');
    const sendRecoveryBtn = document.getElementById('sendRecoveryBtn');


    if (forgotPasswordBtn && backToLoginBtn && loginFields && forgotPasswordFields && modalTitle && sendRecoveryBtn) {
        forgotPasswordBtn.addEventListener('click', () => {
            loginFields.classList.add('hidden');
            forgotPasswordFields.classList.remove('hidden');
            modalTitle.textContent = 'Recuperar Contraseña';
        });

        backToLoginBtn.addEventListener('click', () => {
            forgotPasswordFields.classList.add('hidden');
            loginFields.classList.remove('hidden');
            modalTitle.textContent = 'Login';
        });

        sendRecoveryBtn.addEventListener('click', () => {
            const recoveryEmail = document.getElementById('forgotEmail').value.trim();
            if (!recoveryEmail) {
                showErrorToast('Por favor ingresa un email válido');
                return;
            }
            // Simular recuperación de contraseña
            const user = Object.values(users).find(u => u.email === recoveryEmail);
            if (user) {
                showSuccessToast('Se ha enviado un correo de recuperación a ' + recoveryEmail);
            } else {
                showErrorToast('Email no registrado');
            }
        });
    }

    // Configurar formulario de registro usuario común
    const registroForm = document.getElementById('registroForm');
    const registroModal = document.getElementById('registroModal');
    const closeRegistroBtn = document.getElementById('closeRegistroBtn');

    if (registroForm && registroModal && closeRegistroBtn) {
        registroForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const servicio = document.getElementById('servicioRegistro').value;
            const fecha = document.getElementById('fechaRegistro').value;
            const hora = document.getElementById('horaRegistro').value;
            const telefono = document.getElementById('telefonoRegistro').value.trim();
            const email = document.getElementById('emailRegistro').value.trim();
            const password = document.getElementById('passwordRegistro').value.trim();

            if (!servicio || !fecha || !hora || !telefono || !email || !password) {
                showErrorToast('Por favor completa todos los campos');
                return;
            }

            // Simular registro guardando en localStorage o mostrar mensaje
            showSuccessToast('Registro exitoso. Ahora puedes iniciar sesión.');
            registroModal.classList.add('hidden');
        });

        closeRegistroBtn.addEventListener('click', () => {
            registroModal.classList.add('hidden');
        });
    }

    // Actualizar tablas iniciales
    actualizarTablaServicios();
    actualizarTablaTurnos();
});
