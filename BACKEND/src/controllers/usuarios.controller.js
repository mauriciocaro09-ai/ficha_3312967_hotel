const usuarioService = require("../services/usuarios.services");
const {
  validateCreateUsuario,
  validateUpdateUsuario,
  validateEmailUnique,
} = require("../validators/usuarioValidators");
const CustomError = require("../errors/customError");

/**
 * Lista todos los usuarios con paginación
 */
const list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const usuarios = await usuarioService.listUsuarios(page, limit);
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al listar usuarios" });
  }
};

/**
 * Obtiene un usuario por ID
 */
const getById = async (req, res) => {
  try {
    const usuarios = await usuarioService.getUsuarioById(req.params.id);
    if (!usuarios) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

/**
 * Crea un nuevo usuario
 */
const create = async (req, res) => {
  try {
    console.log("Request body received:", req.body);
    validateCreateUsuario(req.body);
    
    // Verificar email único
    const allUsuarios = await usuarioService.listUsuarios(1, 10000); // Obtener todos
    validateEmailUnique(req.body.Email, null, allUsuarios.data);
    
    await usuarioService.createUsuario(req.body);
    res.status(201).json({ message: "Usuario creado con éxito" });
  } catch (error) {
    console.error("Error in create:", error);
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Error al crear el usuario" });
  }
};

/**
 * Actualiza un usuario existente
 */
const update = async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.id);
    
    // Proteger super usuario (IDUsuario = 1)
    if (usuarioId === 1) {
      return res.status(403).json({ error: "No se puede editar al Super Usuario" });
    }
    
    validateUpdateUsuario(req.body);
    
    // Si se proporciona email, verificar que sea único (excluir el usuario actual)
    if (req.body.Email) {
      const allUsuarios = await usuarioService.listUsuarios(1, 10000);
      validateEmailUnique(req.body.Email, usuarioId, allUsuarios.data);
    }
    
    await usuarioService.updateUsuario(usuarioId, req.body);
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

/**
 * Elimina un usuario (hard delete)
 */
const remove = async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.id);
    
    // Proteger super usuario (IDUsuario = 1)
    if (usuarioId === 1) {
      return res.status(403).json({ error: "No se puede eliminar al Super Usuario" });
    }
    
    await usuarioService.deleteUsuario(usuarioId);
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};

/**
 * Alterna el estado activo/inactivo de un usuario
 */
const toggleStatus = async (req, res) => {
  try {
    const usuarioId = parseInt(req.params.id);
    const { isActive } = req.body;
    
    // Proteger super usuario (IDUsuario = 1)
    if (usuarioId === 1) {
      return res.status(403).json({ error: "No se puede cambiar el estado del Super Usuario" });
    }
    
    if (isActive === undefined || typeof isActive !== "boolean") {
      throw new CustomError(400, "El campo 'isActive' debe ser un booleano");
    }
    
    await usuarioService.toggleUsuarioStatus(req.params.id, isActive);
    res.json({ 
      message: `Usuario ${isActive ? "activado" : "desactivado"} correctamente` 
    });
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("Error en toggleStatus (usuarios):", error.message || error);
    res.status(500).json({ error: "Error al cambiar el estado del usuario", details: error.message });
  }
};

/**
 * Busca usuarios por nombre o email
 */
const search = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!q || q.trim() === "") {
      throw new CustomError(400, "El término de búsqueda no puede estar vacío");
    }
    
    const resultado = await usuarioService.searchUsuarios(q, page, limit);
    res.json(resultado);
  } catch (error) {
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: "Error al buscar usuarios" });
  }
};

module.exports = { list, getById, create, update, remove, toggleStatus, search };