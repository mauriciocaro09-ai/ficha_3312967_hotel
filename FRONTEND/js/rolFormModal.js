/**
 * Funciones globales para modales de roles
 * Versión sin módulos para uso directo en HTML
 */

// Función para mostrar toasts
function showToastRol(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const toastContainer = document.getElementById('toast-container-rol') || (() => {
        const container = document.createElement('div');
        container.id = 'toast-container-rol';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(container);
        return container;
    })();

    toast.style.cssText = `
        padding: 12px 16px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        ${type === 'success' ? 'background-color: #16a34a;' : ''}
        ${type === 'error' ? 'background-color: #dc2626;' : ''}
        ${type === 'warning' ? 'background-color: #ea580c;' : ''}
        ${type === 'info' ? 'background-color: #2563eb;' : ''}
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Permisos disponibles
const PERMISOS_DISPONIBLES = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'usuarios', label: 'Usuarios', icon: '👥' },
    { id: 'roles', label: 'Roles', icon: '🔐' },
    { id: 'habitaciones', label: 'Habitaciones', icon: '🏠' },
    { id: 'servicios', label: 'Servicios', icon: '🛎️' },
    { id: 'reservas', label: 'Reservas', icon: '📅' },
];

// Variables globales
let currentModeRol = 'create';
let currentRolId = null;

/**
 * Abre el modal de formulario de rol
 */
async function openRolForm(mode = 'create', rolData = null, token, isProtected = false, onSave) {
    currentModeRol = mode;

    // Si rolData es un ID (string/number), intentamos obtener los datos completos
    // Pero si ya recibimos el objeto desde roles.js, lo usamos directamente.
    // Ajuste de ID dinámico:
    currentRolId = rolData?.IDRol || rolData?.id || (typeof rolData === 'string' ? rolData : null);

    // Si solo tenemos el ID, necesitamos pedir los datos al servidor antes de abrir
    if (mode === 'edit' && currentRolId && (!rolData || typeof rolData !== 'object')) {
        try {
            const apiUrl = window.API_URL || 'http://localhost:3000/api';
            const res = await fetch(`${apiUrl}/roles/${currentRolId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            console.log('API Response:', json); // Log the entire API response
            rolData = json.data || json;
        } catch (e) {
            showToastRol("Error al cargar datos del rol", "error");
            return;
        }
    }

    const modal = document.createElement('div');
    modal.id = 'rolFormModal';
    modal.style.cssText = `
        position: fixed; inset: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999; overflow-y: auto;
    `;

    const permisosHTML = PERMISOS_DISPONIBLES.map(permiso => `
        <label class="permiso-label" style="
            display: flex; align-items: center; gap: 10px;
            padding: 12px 14px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            background-color: #f8fafc;
            transition: border-color 0.2s;
        ">
            <input type="checkbox" name="permisos" value="${permiso.id}" class="permiso-checkbox" style="width:18px;height:18px;cursor:pointer;">
            <span style="font-size:20px;">${permiso.icon}</span>
            <span style="color:#334155;font-weight:500;font-size:14px;">${permiso.label}</span>
        </label>
    `).join('');

    const warningHTML = isProtected && mode === 'edit' ? `
        <div style="
            background-color: #fefce8;
            border-left: 4px solid #eab308;
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 20px;
        ">
            <p style="color:#854d0e;font-weight:500;margin:0;font-size:14px;">⚠️ Este es un rol protegido y no puede ser eliminado ni desactivado.</p>
        </div>
    ` : '';

    const estadoControlHTML = !isProtected || mode === 'create' ? `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
            <div>
                <p style="font-size:13px;font-weight:600;color:#ffffff;margin:0 0 8px 0;">Estado</p>
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="checkbox" id="estadoCheck" style="width:18px;height:18px;cursor:pointer;accent-color:#16a34a;">
                    <span id="estadoLabel" style="font-size:14px;font-weight:500;color:#16a34a;">✓ Activo</span>
                </div>
            </div>
            <div>
                <p style="font-size:13px;font-weight:600;color:#ffffff;margin:0 0 8px 0;">Control Total</p>
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="checkbox" id="controlTotalCheck" style="width:18px;height:18px;cursor:pointer;accent-color:#ea580c;">
                    <span style="font-size:14px;font-weight:500;color:#94a3b8;">Marcar todos</span>
                </div>
            </div>
        </div>
    ` : `<input type="hidden" id="estadoCheck" value="on">`;

    modal.innerHTML = `
        <div id="rolFormInner" style="
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            padding: 28px;
            width: 100%;
            max-width: 580px;
            margin: 32px 16px;
        ">
            <h2 style="font-size:22px;font-weight:700;color:#1e293b;margin:0 0 24px 0;">
                ${mode === 'create' ? '➕ Crear Rol' : '✏️ Editar Rol'}
            </h2>

            ${warningHTML}

            <form id="rolForm">
                <div style="margin-bottom:20px;">
                    <label style="display:block;font-size:13px;font-weight:600;color:#ffffff;margin-bottom:8px;">
                        📋 Nombre del Rol <span style="color:#ef4444;">*</span>
                    </label>
                    <input type="text" name="Nombre" required
                        placeholder="Gestor de Reservas"
                        ${isProtected && mode === 'edit' ? 'disabled' : ''}
                        style="
                            width: 100%; box-sizing: border-box;
                            padding: 10px 14px;
                            border: 2px solid #e2e8f0;
                            border-radius: 8px;
                            font-size: 14px;
                            color: #1e293b;
                            background-color: #f8fafc;
                            outline: none;
                            transition: border-color 0.2s;
                        "
                    >
                </div>

                ${estadoControlHTML}

                <div style="margin-bottom:24px;">
                    <p style="font-size:13px;font-weight:600;color:#ffffff;margin:0 0 4px 0;">🔒 Permisos del Rol</p>
                    <p style="font-size:12px;color:#94a3b8;margin:0 0 12px 0;">Selecciona qué secciones del sistema podrá ver este rol</p>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        ${permisosHTML}
                    </div>
                </div>

                <div style="display:flex;gap:12px;justify-content:flex-end;">
                    <button type="button" id="cancelBtnRol" style="
                        padding: 10px 22px;
                        border-radius: 8px;
                        background-color: #e2e8f0;
                        color: #475569;
                        font-weight: 600;
                        font-size: 14px;
                        border: none;
                        cursor: pointer;
                    ">Cancelar</button>
                    <button type="submit"
                        ${isProtected && mode === 'edit' ? 'disabled' : ''}
                        style="
                            padding: 10px 28px;
                            border-radius: 8px;
                            background-color: #f97316;
                            color: #ffffff;
                            font-weight: 600;
                            font-size: 14px;
                            border: none;
                            cursor: pointer;
                        ">
                        ${mode === 'create' ? '➕ Crear' : '💾 Guardar'}
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // --- LÓGICA DE LLENADO DE DATOS (CORREGIDA) ---
    if (mode === 'edit' && rolData) {
        const nombreInput = modal.querySelector('input[name="Nombre"]');
        const estadoCheck = modal.querySelector('#estadoCheck');

        // Mapeo flexible de nombres de propiedad
            const nombreValor = rolData.NombreRol || rolData.nombre || rolData.Nombre || "";
            const estadoValor = rolData.IsActive !== undefined ? rolData.IsActive : (rolData.Estado === 1 || rolData.estado === "Activo");

            if (nombreInput) nombreInput.value = nombreValor;
            if (estadoCheck) estadoCheck.checked = estadoValor === 1 || estadoValor === true;

        // Llenado de permisos
        // Try to find permissions using common variations and handle different formats
        let permisosData = rolData.Permisos || rolData.permisos || rolData.permissions || rolData.IDsPermisos;

        if (permisosData) {
            let intermediatePermisos = null;
            try {
                // First parse: The API returns a string that is JSON-escaped
                if (typeof permisosData === 'string') {
                    intermediatePermisos = JSON.parse(permisosData);
                } else {
                    // If it's not a string, assume it's already an array or object
                    intermediatePermisos = permisosData;
                }
            } catch (e) {
                console.error("Error during first JSON parse of permisosData:", e);
                intermediatePermisos = []; // Fallback
            }

            let permisosArray = [];
            try {
                // Second parse: If the result of the first parse is a string, parse it again
                if (typeof intermediatePermisos === 'string') {
                    permisosArray = JSON.parse(intermediatePermisos);
                } else {
                    // If it's already an array (or something else we can treat as one)
                    permisosArray = intermediatePermisos;
                }
            } catch (e) {
                console.error("Error during second JSON parse of intermediatePermisos:", e);
                // If the second parse fails, check if it's an array of objects with an 'id' property
                if (Array.isArray(intermediatePermisos) && intermediatePermisos.every(p => typeof p === 'object' && p.id)) {
                    permisosArray = intermediatePermisos.map(p => p.id);
                } else {
                    console.error("Permisos data is not in a recognized array or JSON string format after double parsing.");
                    permisosArray = []; // Reset to empty if format is unknown
                }
            }

            // Ensure permisosArray is actually an array before proceeding
            if (!Array.isArray(permisosArray)) {
                console.error("permisosArray is not an array after processing:", permisosArray);
                permisosArray = []; // Ensure it's an array
            }

            modal.querySelectorAll('.permiso-checkbox').forEach(checkbox => {
                if (permisosArray.includes(checkbox.value)) {
                    checkbox.checked = true;
                    // Ajustar estilo visual del label si estaba marcado
                    checkbox.parentElement.style.borderColor = '#6366f1';
                }
            });
        }
    } else if (mode === 'create') {
        const estadoCheck = modal.querySelector('#estadoCheck');
        if (estadoCheck) estadoCheck.checked = true;
    }

    // Hover en tarjetas de permisos
    modal.querySelectorAll('.permiso-label').forEach(label => {
        label.addEventListener('mouseenter', () => label.style.borderColor = '#6366f1');
        label.addEventListener('mouseleave', () => {
            const cb = label.querySelector('input[type="checkbox"]');
            label.style.borderColor = cb.checked ? '#6366f1' : '#e2e8f0';
        });
    });

    // Label dinámico de Estado
    const estadoCheck = modal.querySelector('#estadoCheck');
    if (estadoCheck && estadoCheck.type !== 'hidden') {
        const updateEstadoLabel = () => {
            const label = modal.querySelector('#estadoLabel');
            if (!label) return;
            if (estadoCheck.checked) {
                label.textContent = '✓ Activo';
                label.style.color = '#16a34a';
            } else {
                label.textContent = '✗ Inactivo';
                label.style.color = '#ef4444';
            }
        };
        estadoCheck.addEventListener('change', updateEstadoLabel);
        updateEstadoLabel();
    }

    // Control Total
    const controlTotalCheck = modal.querySelector('#controlTotalCheck');
    const permisoCheckboxes = modal.querySelectorAll('.permiso-checkbox');

    if (controlTotalCheck) {
        // Inicializar Control Total basado en los permisos cargados
        controlTotalCheck.checked = Array.from(permisoCheckboxes).every(c => c.checked);

        controlTotalCheck.addEventListener('change', () => {
            permisoCheckboxes.forEach(cb => {
                cb.checked = controlTotalCheck.checked;
                cb.parentElement.style.borderColor = cb.checked ? '#6366f1' : '#e2e8f0';
            });
        });

        permisoCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                controlTotalCheck.checked = Array.from(permisoCheckboxes).every(c => c.checked);
                cb.parentElement.style.borderColor = cb.checked ? '#6366f1' : '#e2e8f0';
            });
        });
    }

    // Cancelar y submit
    modal.querySelector('#cancelBtnRol').addEventListener('click', closeRolForm);
    modal.querySelector('#rolForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveRol(token, onSave);
    });

    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            document.removeEventListener('keydown', handleEscape);
            closeRolForm();
        }
    };
    document.addEventListener('keydown', handleEscape);
}

/**
 * Guarda el rol (create o update)
 */
async function saveRol(token, onSave) {
    try {
        const form = document.getElementById('rolForm');
        const nombre = form.elements['Nombre'].value;
        const estadoCheck = form.querySelector('#estadoCheck');
        const permisoCheckboxes = form.querySelectorAll('.permiso-checkbox:checked');

        if (!nombre || nombre.trim() === '') {
            showToastRol('⚠️ El nombre del rol es requerido', 'info');
            return;
        }

        const permisos = Array.from(permisoCheckboxes).map(cb => cb.value);

        // Enviamos los datos con los nombres de campo que espera tu API
        const data = {
            NombreRol: nombre,
            IsActive: (estadoCheck.type === 'hidden') ? 1 : (estadoCheck.checked ? 1 : 0),
            Permisos: JSON.stringify(permisos), // Lo enviamos como string JSON por seguridad
        };

        const apiUrl = window.API_URL || 'http://localhost:3000/api';

        const url = currentModeRol === 'create' ? `${apiUrl}/roles` : `${apiUrl}/roles/${currentRolId}`;
        const method = currentModeRol === 'create' ? 'POST' : 'PUT';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Error al ${currentModeRol === 'create' ? 'crear' : 'actualizar'} rol`);
        }

        showToastRol(`✅ Rol ${currentModeRol === 'create' ? 'creado' : 'actualizado'} exitosamente`, 'success');
        closeRolForm();
        if (onSave) onSave();
    } catch (error) {
        showToastRol(`❌ ${error.message}`, 'error');
    }
}

/**
 * Cierra el modal
 */
function closeRolForm() {
    const modal = document.getElementById('rolFormModal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => modal.remove(), 300);
    }
}