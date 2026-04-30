const rolesService = require("../services/roles.services");
const {
  validateRoleNotProtected,
  validateRoleNotProtectedToggle,
  validateCreateRol,
  validateUpdateRol,
  validateRolNameUnique,
} = require("../validators/rolValidators");
const CustomError = require("../errors/customError");

/**
 * Lista todos los roles activos con paginación
 */
const list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const roles = await rolesService.listRoles(page, limit);
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: "Error al listar roles" });
  }
};

/**
 * Obtiene un rol por ID
 */
const getById = async (req, res) => {
  try {
    const rol = await rolesService.getRolById(req.params.id);
    if (!rol) {
      return res.status(404).json({ error: "Rol no encontrado" });
    }
    res.json(rol);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener rol" });
  }
};

/**
 * Crea un nuevo rol
 */
const create = async (req, res) => {
  try {
    validateCreateRol(req.body);
    
    // Verificar nombre único
    const allRoles = await rolesService.listRoles(1, 10000);
    validateRolNameUnique(req.body.NombreRol, null, allRoles.data);
    
    await rolesService.createRol(req.body);
    res.status(201).json({ message: "Rol creado exitosamente" });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Error al crear rol" });
  }
};

/**
 * Actualiza un rol existente
 */
const update = async (req, res) => {
  try {
    validateUpdateRol(req.body);
    
    // Si se proporciona nombre, verificar que sea único (excluir el rol actual)
    if (req.body.NombreRol) {
      const allRoles = await rolesService.listRoles(1, 10000);
      validateRolNameUnique(req.body.NombreRol, parseInt(req.params.id), allRoles.data);
    }
    
    await rolesService.updateRol(req.params.id, req.body);
    res.json({ message: "Rol actualizado exitosamente" });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Error al actualizar rol" });
  }
};

/**
 * Elimina un rol (soft delete - marca como inactivo)
 */
const remove = async (req, res) => {
  try {
    // Validar que no sea un rol protegido
    validateRoleNotProtected(req.params.id);
    
    const result = await rolesService.deleteRol(req.params.id);
    console.log("Rol eliminado (inactivado):", req.params.id, result);
    res.json({ message: "Rol eliminado exitosamente" });
  } catch (error) {
    console.error("Error en remove (roles):", error.message || error);
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Error al eliminar rol", details: error.message });
  }
};

/**
 * Alterna el estado activo/inactivo de un rol
 */
const toggleStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    if (isActive === undefined || typeof isActive !== "boolean") {
      throw new CustomError(400, "El campo 'isActive' debe ser un booleano");
    }
    
    // Si es para desactivar, validar que no sea protegido
    if (!isActive) {
      validateRoleNotProtectedToggle(req.params.id);
    }
    
    await rolesService.toggleRolStatus(req.params.id, isActive);
    res.json({ 
      message: `Rol ${isActive ? "activado" : "desactivado"} correctamente` 
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("Error en toggleStatus (roles):", error.message || error);
    res.status(500).json({ error: "Error al cambiar el estado del rol", details: error.message });
  }
};

/**
 * Busca roles por nombre
 */
const search = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!q || q.trim() === "") {
      throw new CustomError(400, "El término de búsqueda no puede estar vacío");
    }
    
    const resultado = await rolesService.searchRoles(q, page, limit);
    res.json(resultado);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Error al buscar roles" });
  }
};

module.exports = { list, getById, create, update, remove, toggleStatus, search };