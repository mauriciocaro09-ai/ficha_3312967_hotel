document.addEventListener("DOMContentLoaded", async () => {
  const session = window.getStoredSession ? window.getStoredSession() : verificarSesion();

  if (!session) {
    window.location.href = "../login.html";
    return;
  }

  await window.loadSidebarComponent("sidebar-placeholder");
  await window.filterSidebarByPermissions();

  const searchInput = document.getElementById("busqueda-usuarios");
  const searchButton = document.getElementById("id-btn-buscar");
  const resetButton = document.getElementById("btn-limpiar");
  const createButton = document.getElementById("btn-crear-usuario");
  const tbody = document.getElementById("usuarios-tbody");

  let currentQuery = "";
  let listaRoles = []; // Variable global para guardar los roles de la DB

  // 1. Nueva función para obtener los roles desde el backend
  const fetchRoles = async () => {
    try {
      const response = await window.apiRequest("/roles");
      // Validamos si la respuesta es el array directamente o viene dentro de .data
      const data = response.data || response;

      if (Array.isArray(data)) {
        listaRoles = data;
      } else {
        console.error("La API de roles no devolvió un array:", data);
        listaRoles = [];
      }
    } catch (error) {
      console.error("Error cargando roles:", error);
      listaRoles = [];
    }
  };

  // ID del SuperAdministrador que no puede ser modificado
  const SUPER_ADMIN_ID = 1;

  const isSuperAdmin = (item) => {
    return Number(item.IDUsuario) === SUPER_ADMIN_ID;
  };

  const renderRows = (items) => {
    if (!tbody) return;

    if (!items || items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-slate-500">No hay usuarios para mostrar</td></tr>';
      return;
    }

    tbody.innerHTML = items
      .map((item) => {
        const isActive = Number(item.IsActive) === 1;
        const nombreMostrar = item.Nombre || item.NombreUsuario || "Sin Nombre";
        const emailMostrar = item.Email || "Sin Email";
        const idRolActual = item.IDRol || item.id_rol;
        const isProtected = isSuperAdmin(item);

        // Generar opciones con validación para evitar el "undefined"
        const opcionesRoles =
          listaRoles.length > 0
            ? listaRoles
                .map((rol) => {
                  const nombreDelRol = rol.NombreRol || rol.nombre || rol.Nombre || "Rol Desconocido";
                  const idDelRol = rol.IDRol || rol.id || rol.ID;
                  return `<option value="${idDelRol}" ${idRolActual == idDelRol ? "selected" : ""}>${nombreDelRol}</option>`;
                })
                .join("")
            : `<option value="">Cargando roles...</option>`;

        // Badge de SuperAdministrador
        const superAdminBadge = isProtected
          ? `<span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200" title="Este usuario es el SuperAdministrador del sistema">
               <i class="fa-solid fa-crown mr-1"></i>SuperAdmin
             </span>`
          : '';

        return `
            <tr class="hover:bg-slate-50 transition-colors ${isProtected ? 'bg-amber-50/30' : ''}">
                <td class="p-4">
                    <div class="font-bold text-slate-800 flex items-center flex-wrap gap-1">
                      ${nombreMostrar}${superAdminBadge}
                    </div>
                    <div class="text-xs text-slate-500">${emailMostrar}</div>
                </td>
                <td class="p-4 text-center">
                    <select class="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-hospedaje-green outline-none text-slate-700 ${isProtected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
                            data-action="change-role" data-id="${item.IDUsuario}" ${isProtected ? 'disabled' : ''}>
                        ${opcionesRoles}
                    </select>
                </td>
                <td class="p-4 text-center">
                    <label class="switch">
                        <input type="checkbox" ${isActive ? "checked" : ""} data-action="toggle" data-id="${item.IDUsuario}" ${isProtected ? 'disabled' : ''}>
                        <span class="slider ${isProtected ? 'opacity-50 cursor-not-allowed' : ''}"></span>
                    </label>
                </td>
                <td class="p-4">
                    <div class="flex justify-center gap-2">
                        <button class="p-2 bg-blue-50 text-blue-600 rounded-lg ${isProtected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-100'} transition-colors shadow-sm"
                                data-action="edit" data-id="${item.IDUsuario}" title="${isProtected ? 'No editable - SuperAdministrador' : 'Editar'}" ${isProtected ? 'disabled' : ''}>
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                        <button class="p-2 bg-red-50 text-red-600 rounded-lg ${isProtected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-100'} transition-colors shadow-sm"
                                data-action="delete" data-id="${item.IDUsuario}" title="${isProtected ? 'No eliminable - SuperAdministrador' : 'Eliminar'}" ${isProtected ? 'disabled' : ''}>
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
      })
      .join("");
  };

  const loadUsuarios = async () => {
    if (!tbody) return;
    const infoPaginacion = document.getElementById("usuarios-info"); // Asegúrate que este ID exista en tu HTML

    tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-slate-500 italic">Cargando usuarios...</td></tr>';

    try {
      const endpoint = currentQuery.trim() ? `/usuarios/search?q=${encodeURIComponent(currentQuery.trim())}&page=1&limit=20` : "/usuarios?page=1&limit=20";

      const response = await window.apiRequest(endpoint);
      const data = response.data || response;

      renderRows(data);

      // --- ACTUALIZACIÓN DEL CONTADOR ---
      if (infoPaginacion) {
        const total = data.length;
        infoPaginacion.textContent = `Mostrando 1 a ${total} de ${total} usuarios`;
      }
      // ----------------------------------
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-red-500">Error: ${error.message}</td></tr>`;
    }
  };

  tbody?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action], input[data-action]");
    if (!button) return;

    // Validar que no esté deshabilitado
    if (button.disabled) {
      event.preventDefault();
      return;
    }

    const { action, id } = button.dataset;

    // Bloquear acciones sobre el SuperAdministrador
    if (Number(id) === SUPER_ADMIN_ID) {
      alert("El SuperAdministrador no puede ser modificado.");
      event.preventDefault();
      return;
    }

    try {
      if (action === "delete") {
        if (!confirm("¿Eliminar este usuario?")) return;
        await window.apiRequest(`/usuarios/${id}`, { method: "DELETE" });
        await loadUsuarios();
      }

      if (action === "toggle") {
        const newState = button.checked;
        await window.apiRequest(`/usuarios/${id}/status`, {
          method: "PATCH",
          body: { isActive: newState },
        });
      }

      if (action === "edit") {
        const session = window.getStoredSession();
        const usuarioData = await window.apiRequest(`/usuarios/${id}`);
        await openUsuarioForm("edit", usuarioData, session.token, loadUsuarios);
      }
    } catch (error) {
      alert(error.message || "No se pudo completar la acción");
      await loadUsuarios();
    }
  });

  // Busca el manejador del 'change' en el select y cámbialo por este:
  tbody?.addEventListener("change", async (event) => {
    const select = event.target.closest('select[data-action="change-role"]');
    if (!select) return;

    // Validar que no esté deshabilitado
    if (select.disabled) {
      event.preventDefault();
      return;
    }

    const { id } = select.dataset;

    // Bloquear cambio de rol para el SuperAdministrador
    if (Number(id) === SUPER_ADMIN_ID) {
      alert("El rol del SuperAdministrador no puede ser modificado.");
      await loadUsuarios(); // Recargar para revertir el cambio visual
      return;
    }

    const newRoleId = select.value;

    try {
      await window.apiRequest(`/usuarios/${id}`, {
        method: "PUT",
        body: { IDRol: newRoleId },
      });
      console.log("Rol actualizado con éxito");
    } catch (error) {
      alert("La ruta de la API es incorrecta o el servidor no permite este cambio.");
      await loadUsuarios();
    }
  });

  searchButton?.addEventListener("click", () => {
    currentQuery = searchInput?.value || "";
    loadUsuarios();
  });

  searchInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      currentQuery = searchInput.value || "";
      loadUsuarios();
    }
  });

  resetButton?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    currentQuery = "";
    loadUsuarios();
  });

  createButton?.addEventListener("click", async () => {
    const session = getStoredSession();
    if (session && session.token) {
      await openUsuarioForm("create", null, session.token, loadUsuarios);
    } else {
      alert("Sesión expirada. Por favor, inicia sesión nuevamente.");
      window.location.href = "../login.html";
    }
  });

  // 4. Ejecución inicial: primero roles, luego usuarios
  await fetchRoles();
  await loadUsuarios();
});
