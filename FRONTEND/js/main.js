/**
 * Script principal de Hospedaje Digital
 * Lógica compartida entre páginas
 */

window.API_URL = window.API_URL || ((typeof CONFIG !== 'undefined' && CONFIG.API_URL) ? CONFIG.API_URL : 'http://localhost:3000/api');

function getAppBasePath() {
    return window.location.pathname.includes('/pages/') ? '../' : '';
}

function getModuleHref(modulePageName) {
    const isInsidePagesFolder = window.location.pathname.includes('/pages/');
    return isInsidePagesFolder ? modulePageName : `pages/${modulePageName}`;
}

function getStoredSession() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        return null;
    }

    try {
        return {
            token,
            usuario: JSON.parse(user),
        };
    } catch (error) {
        return null;
    }
}

function getRoleName(rolId) {
    const rolesById = {
        1: 'Administrador',
        2: 'Cliente',
        3: 'Gerente',
        4: 'Recepcionista',
    };

    if (rolId === null || rolId === undefined) return 'Desconocido';

    if (typeof rolId === 'object') {
        rolId = rolId.IDRol ?? rolId.rol ?? rolId.id ?? rolId.Nombre;
    }

    const asNumber = Number(rolId);
    if (Number.isFinite(asNumber) && rolesById[asNumber]) {
        return rolesById[asNumber];
    }

    if (typeof rolId === 'string') {
        const trimmed = rolId.trim();
        const normalized = trimmed.toLowerCase();
        const rolesByName = {
            administrador: 'Administrador',
            admin: 'Administrador',
            cliente: 'Cliente',
            usuario: 'Usuario',
            gerente: 'Gerente',
            recepcionista: 'Recepcionista',
        };

        if (rolesByName[normalized]) return rolesByName[normalized];

        if (trimmed && !Number.isFinite(Number(trimmed))) return trimmed;
    }

    return 'Desconocido';
}

async function loadSidebarComponent(containerId = 'sidebar-placeholder') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('Contenedor para sidebar no encontrado:', containerId);
        return null;
    }

    try {
        const basePath = getAppBasePath();
        const sidebarUrl = `${basePath}components/sidebar.html`;
        console.log('Cargando sidebar desde:', sidebarUrl);
        
        const response = await fetch(sidebarUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log('HTML del sidebar obtenido, insertando...');
        
        // Insertar el HTML ANTES del placeholder
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        // Insertar todos los elementos del sidebar antes del placeholder
        while (tempDiv.firstChild) {
            container.parentNode.insertBefore(tempDiv.firstChild, container);
        }
        
        // Remover el placeholder vacío
        container.remove();
        console.log('Placeholder removido');
        
        // Asegurar que el sidebar existe
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) {
            throw new Error('Sidebar element not found after insertion');
        }
        
        console.log('Sidebar encontrado, inicializando controles...');
        
        // Inicializar controles del sidebar
        initSidebarControls();
        
        return sidebar;
    } catch (error) {
        console.error('Error al cargar el sidebar:', error);
        return null;
    }
}

/**
 * Filtra los elementos del sidebar basado en los permisos del usuario
 */
async function filterSidebarByPermissions() {
    try {
        const session = getStoredSession();
        if (!session) return;

        // Obtener el rol del usuario actual
        const user = session.usuario;
        if (!user || !user.IDRol) return;

        // Obtener los permisos del rol
        const apiUrl = window.API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/roles/${user.IDRol}`, {
            headers: { 'Authorization': `Bearer ${session.token}` }
        });

        if (!response.ok) return;

        const rol = await response.json();
        let permisos = [];
        
        // Procesar permisos
        if (rol.Permisos) {
            permisos = typeof rol.Permisos === 'string' ? JSON.parse(rol.Permisos) : rol.Permisos;
        }

        // Si hay permisos definidos, filtrar elementos del sidebar
        if (permisos && Array.isArray(permisos) && permisos.length > 0) {
            const sidebarItems = document.querySelectorAll('.sidebar-item[data-module]');
            sidebarItems.forEach(item => {
                const module = item.getAttribute('data-module');
                if (module && !permisos.includes(module)) {
                    item.style.display = 'none';
                }
            });
        }
        // Si no hay permisos, mostrar todos (compatibilidad hacia atrás)
    } catch (error) {
        console.warn('No se pudo filtrar el sidebar:', error);
        // En caso de error, mostrar todos los elementos
    }
}

function cargarSeccion(seccion, event) {
    if (event) {
        event.preventDefault();
    }

    if (seccion === 'dashboard') {
        window.location.href = getModuleHref('dashboard.html');
        return;
    }

    if (seccion === 'habitaciones' || seccion === 'administrar-habitaciones') {
        window.location.href = getModuleHref('habitaciones.html');
        return;
    }

    if (seccion === 'servicios' || seccion === 'administrar-servicios') {
        window.location.href = getModuleHref('servicios.html');
        return;
    }

    if (seccion === 'usuarios') {
        window.location.href = getModuleHref('usuarios.html');
        return;
    }

    if (seccion === 'roles') {
        window.location.href = getModuleHref('roles.html');
        return;
    }

    if (seccion === 'perfil') {
        window.location.href = getModuleHref('perfil.html');
        return;
    }

    if (seccion === 'reservas') {
        window.location.href = getModuleHref('reservas.html');
        return;
    }
}

async function apiRequest(endpoint, options = {}) {
    const session = getStoredSession();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    if (session?.token) {
        headers.Authorization = `Bearer ${session.token}`;
    }

    const response = await fetch(`${window.API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    let payload = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        payload = await response.json();
    } else {
        payload = await response.text();
    }

    if (!response.ok) {
        const message = payload?.message || payload?.error || payload?.mensaje || 'Error en la solicitud';
        throw new Error(message);
    }

    return payload;
}

// Verificar sesión activa
function verificarSesion() {
    return getStoredSession();
}

// Cerrar sesión
function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        const isInsidePagesFolder = window.location.pathname.includes('/pages/');
        window.location.href = isInsidePagesFolder ? '../login.html' : 'login.html';
    }
}

// Hacer llamada a la API
async function apiCall(endpoint, method = 'GET', data = null) {
    const sesion = verificarSesion();
    const token = sesion ? sesion.token : null;

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${window.API_URL}${endpoint}`, options);
        
        if (!response.ok) {
            const error = await response.json();
            throw {
                status: response.status,
                message: error.error || error.message || 'Error en la solicitud',
            };
        }

        return await response.json();
    } catch (error) {
        console.error('Error en API:', error);
        throw error;
    }
}

/**
 * Llena la información del usuario en el sidebar
 */
async function fillUserInfoInSidebar() {
    try {
        const session = getStoredSession();
        if (!session || !session.usuario) return;

        const user = session.usuario;
        const emailElement = document.getElementById('sidebar-user-email');
        const roleElement = document.getElementById('sidebar-user-role');

        if (emailElement) {
            emailElement.textContent = user.Email || user.email || '-';
        }

        if (roleElement) {
            // Obtener nombre del rol
            let roleName = 'Rol: ';
            // Usar solo NombreRol si existe y es un nombre (no un número)
            const nombreRol = user.NombreRol;
            if (nombreRol && typeof nombreRol === 'string' && nombreRol.trim() !== '' && !/^\d+$/.test(nombreRol)) {
                roleName += nombreRol;
            } else if (user.IDRol) {
                const mappedRole = getRoleName(user.IDRol);
                if (mappedRole !== 'Desconocido') {
                    roleName += mappedRole;
                } else {
                    // Consultar la API para obtener el nombre real del rol
                    try {
                        const apiUrl = window.API_URL || 'http://localhost:3000/api';
                        const response = await fetch(`${apiUrl}/roles/${user.IDRol}`, {
                            headers: { 'Authorization': `Bearer ${session.token}` }
                        });
                        if (response.ok) {
                            const rolData = await response.json();
                            roleName += rolData.Nombre || `Rol #${user.IDRol}`;
                        } else {
                            roleName += `Rol #${user.IDRol}`;
                        }
                    } catch (apiError) {
                        console.warn('Error al consultar rol:', apiError);
                        roleName += `Rol #${user.IDRol}`;
                    }
                }
            } else {
                roleName += 'Desconocido';
            }
            roleElement.textContent = roleName;
        }
    } catch (error) {
        console.warn('No se pudo llenar la información del usuario:', error);
    }
}

async function initSidebarControls() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebar-toggle');
    const closeBtn = document.getElementById('sidebar-close');
    const overlay = document.getElementById('sidebar-overlay');
    const mainWrapper = document.getElementById('main-wrapper');

    if (!sidebar || !toggle) return;

    if (sidebar.dataset.initialized === 'true') {
        return;
    }

    sidebar.dataset.initialized = 'true';

    // Llenar información del usuario
    await fillUserInfoInSidebar();

    // Filtrar sidebar según permisos del rol
    await filterSidebarByPermissions();

    function openSidebar() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        mainWrapper.classList.add('sidebar-open');
    }

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        mainWrapper.classList.remove('sidebar-open');
    }

    toggle.addEventListener('click', openSidebar);
    closeBtn?.addEventListener('click', closeSidebar);
    overlay?.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}

window.getAppBasePath = getAppBasePath;
window.getStoredSession = getStoredSession;
window.getRoleName = getRoleName;
window.loadSidebarComponent = loadSidebarComponent;
window.filterSidebarByPermissions = filterSidebarByPermissions;
window.fillUserInfoInSidebar = fillUserInfoInSidebar;
window.apiRequest = apiRequest;
window.verificarSesion = verificarSesion;
window.cerrarSesion = cerrarSesion;
window.cargarSeccion = cargarSeccion;
window.initSidebarControls = initSidebarControls;
