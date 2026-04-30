/**
 * Funciones globales para modales de usuario
 * Versión con diseño moderno y profesional
 */

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    const toastContainer = document.getElementById('toast-container') || (() => {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(container);
        return container;
    })();
    
    toast.style.cssText = `
        padding: 12px 16px; border-radius: 8px; color: white; font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease-out;
        ${type === 'success' ? 'background-color: #16a34a;' : ''}
        ${type === 'error' ? 'background-color: #dc2626;' : ''}
        ${type === 'warning' ? 'background-color: #ea580c;' : ''}
        ${type === 'info' ? 'background-color: #2563eb;' : ''}
    `;
    
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

let currentMode = 'create';
let currentUsuarioId = null;

async function openUsuarioForm(mode = 'create', usuarioData = null, token, onSave) {
    if (mode === 'edit' && (usuarioData?.IDUsuario === 1 || usuarioData?.id === 1)) {
        showToast('❌ No se puede editar al Super Usuario', 'error');
        return;
    }
    
    currentMode = mode;
    currentUsuarioId = usuarioData?.IDUsuario || usuarioData?.id || null;

    const modal = document.createElement('div');
    modal.id = 'usuarioFormModal';
    // El overlay es fijo y centrado — NO scrollea él mismo
    modal.style.cssText = `
        position: fixed; inset: 0; background-color: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999; padding: 16px; box-sizing: border-box;
    `;

    const inputStyle = `
        width: 100%; box-sizing: border-box; padding: 8px 12px;
        border: 2px solid #e2e8f0; border-radius: 8px; font-size: 13px;
        color: #1e293b; background-color: #f8fafc; outline: none; transition: border-color 0.2s;
    `;

    const sectionTitleStyle = `
        font-size: 11px; font-weight: 700; color: #ffffff; text-transform: uppercase;
        letter-spacing: 0.5px; margin: 16px 0 10px 0;
        border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;
    `;

    modal.innerHTML = `
        <div id="usuarioFormInner" style="
            background-color: #ffffff; border-radius: 14px;
            width: 100%; max-width: 580px;
            max-height: calc(100vh - 32px);
            display: flex; flex-direction: column;
            box-shadow: 0 20px 60px rgba(0,0,0,0.25);
            animation: modalFadeUp 0.3s ease-out;
            overflow: hidden;
        ">
            <!-- Cabecera fija -->
            <div style="padding: 20px 24px 12px 24px; border-bottom: 1px solid #f1f5f9; flex-shrink: 0;">
                <h2 style="font-size: 20px; font-weight: 700; color: #1e293b; margin: 0;">
                    ${mode === 'create' ? '➕ Crear Usuario' : '✏️ Editar Usuario'}
                </h2>
            </div>

            <!-- Cuerpo con scroll -->
            <div style="overflow-y: auto; flex: 1; padding: 0 24px;">
                <form id="usuarioForm">

                    <div style="${sectionTitleStyle}">📋 Identificación</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; color:#ffffff; margin-bottom:4px;">Tipo Documento *</label>
                            <select name="TipoDocumento" required style="${inputStyle}">
                                <option value="">Selecciona...</option>
                                <option value="CC">Cédula de Ciudadanía</option>
                                <option value="CE">Cédula de Extranjería</option>
                                <option value="PA">Pasaporte</option>
                                <option value="NIT">NIT</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; color:#ffffff; margin-bottom:4px;">Número Documento *</label>
                            <input type="text" name="NumeroDocumento" required placeholder="1234567890" style="${inputStyle}">
                        </div>
                    </div>

                    <div style="${sectionTitleStyle}">📱 Información Personal</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; color:#ffffff; margin-bottom:4px;">Nombre *</label>
                            <input type="text" name="Nombre" required placeholder="Ej: Juan" style="${inputStyle}">
                        </div>
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; color:#ffffff; margin-bottom:4px;">Apellido *</label>
                            <input type="text" name="Apellido" required placeholder="Ej: Pérez" style="${inputStyle}">
                        </div>
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; color:#ffffff; margin-bottom:4px;">Teléfono</label>
                            <input type="tel" name="Telefono" placeholder="3001234567" style="${inputStyle}">
                        </div>
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; color:#ffffff; margin-bottom:4px;">País</label>
                            <input type="text" name="Pais" placeholder="Colombia" style="${inputStyle}">
                        </div>
                        <div style="grid-column: span 2;">
                            <label style="display:block; font-size:12px; font-weight:600; color:#ffffff; margin-bottom:4px;">Dirección</label>
                            <input type="text" name="Direccion" placeholder="Calle 123 #45-67" style="${inputStyle}">
                        </div>
                    </div>

                    <div style="${sectionTitleStyle}">🔐 Acceso y Seguridad</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div style="grid-column: ${mode === 'create' ? 'auto' : 'span 2'};">
                            <label style="display:block; font-size:12px; font-weight:600; color:#ffffff; margin-bottom:4px;">Email (Usuario) *</label>
                            <input type="email" name="Email" required placeholder="correo@ejemplo.com" style="${inputStyle}">
                        </div>
                        ${mode === 'create' ? `
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; color:#ffffff; margin-bottom:4px;">Contraseña *</label>
                            <input type="password" name="Contrasena" required placeholder="Mínimo 6 caracteres" style="${inputStyle}">
                        </div>
                        ` : ''}
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; color:#ffffff; margin-bottom:4px;">Rol Asignado *</label>
                            <select name="IDRol" id="rolesSelect" required style="${inputStyle}">
                                <option value="">Cargando roles...</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:12px; font-weight:600; color:#ffffff; margin-bottom:4px;">Estado de Cuenta</label>
                            <div style="display:flex; align-items:center; gap:10px; padding: 6px 0;">
                                <input type="checkbox" name="IsActive" id="isActiveCheck"
                                    style="width:18px; height:18px; cursor:pointer; accent-color:#16a34a;"
                                    ${mode === 'create' ? 'checked' : ''}>
                                <span id="isActiveLabel" style="font-size:13px; font-weight:700; color:#16a34a;">Activo</span>
                            </div>
                        </div>
                    </div>

                    <!-- Espacio inferior para que los botones no tapen el último campo -->
                    <div style="height: 16px;"></div>

                </form>
            </div>

            <!-- Botones fijos al pie -->
            <div style="
                padding: 14px 24px; border-top: 1px solid #f1f5f9;
                display: flex; gap: 10px; justify-content: flex-end;
                flex-shrink: 0; background: #ffffff;
            ">
                <button type="button" id="cancelBtnUser" style="
    padding: 10px 20px; border-radius: 10px; background-color: #f1f5f9;
    color: #475569; font-weight: 600; font-size: 13px; border: 1.5px solid #cbd5e1; cursor: pointer;
">Cancelar</button>
                <button type="submit" form="usuarioForm" style="
                    padding: 10px 26px; border-radius: 10px; background-color: #f97316;
                    color: #ffffff; font-weight: 700; font-size: 13px; border: none; cursor: pointer;
                    box-shadow: 0 4px 12px rgba(249,115,22,0.25);
                ">
                    ${mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Lógica visual del estado activo/inactivo
    const check = modal.querySelector('#isActiveCheck');
    const label = modal.querySelector('#isActiveLabel');
    check.addEventListener('change', () => {
        label.textContent = check.checked ? 'Activo' : 'Inactivo';
        label.style.color = check.checked ? '#16a34a' : '#dc2626';
    });

    // Cargar roles PRIMERO, luego pre-rellenar
    const rolesSelect = modal.querySelector('#rolesSelect');

    try {
        const apiUrl = window.API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/roles?page=1&limit=100`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        rolesSelect.innerHTML = '<option value="">Selecciona un rol</option>';
        const rolesList = Array.isArray(result) ? result : (result.data || []);
        rolesList.forEach(rol => {
            const option = document.createElement('option');
            option.value = rol.IDRol;
            option.textContent = rol.Nombre;
            rolesSelect.appendChild(option);
        });
    } catch (e) {
        console.error('Error cargando roles:', e);
        rolesSelect.innerHTML = '<option value="">Error al cargar roles</option>';
    }

    // Pre-rellenar datos DESPUÉS de que los roles ya están en el select
    if (mode === 'edit' && usuarioData) {
        const form = modal.querySelector('#usuarioForm');

        Object.keys(usuarioData).forEach(key => {
            const input = form.elements[key];
            if (!input) return;

            if (input.type === 'checkbox') {
                input.checked = usuarioData[key] == 1;
                if (key === 'IsActive') {
                    label.textContent = input.checked ? 'Activo' : 'Inactivo';
                    label.style.color = input.checked ? '#16a34a' : '#dc2626';
                }
            } else {
                input.value = usuarioData[key] ?? '';
            }
        });
    }

    // Eventos
    modal.querySelector('#cancelBtnUser').onclick = closeUsuarioForm;
    modal.querySelector('#usuarioForm').onsubmit = async (e) => {
        e.preventDefault();
        await saveUsuario(token, onSave);
    };

    // Cerrar con Escape
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeUsuarioForm();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

async function saveUsuario(token, onSave) {
    try {
        const form = document.getElementById('usuarioForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const isActiveCheckbox = document.getElementById('isActiveCheck');
        data.IsActive = isActiveCheckbox.checked ? 1 : 0;

        if (data.IDRol) data.IDRol = Number(data.IDRol);

        const apiUrl = window.API_URL || 'http://localhost:3000/api';
        const method = currentMode === 'create' ? 'POST' : 'PUT';
        const url = currentMode === 'create'
            ? `${apiUrl}/usuarios`
            : `${apiUrl}/usuarios/${currentUsuarioId}`;

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || 'Error en la operación');

        showToast(
            `✅ Usuario ${currentMode === 'create' ? 'creado' : 'actualizado'} exitosamente`,
            'success'
        );
        closeUsuarioForm();
        if (onSave) onSave();

    } catch (error) {
        showToast(`❌ ${error.message}`, 'error');
    }
}

function closeUsuarioForm() {
    const modal = document.getElementById('usuarioFormModal');
    if (modal) {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.2s';
        setTimeout(() => modal.remove(), 200);
    }
}