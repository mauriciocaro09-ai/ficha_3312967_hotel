/**
 * Rutas para el módulo de Servicios
 */

const express = require('express');
const router = express.Router();

// Importar controlador de servicios
const serviciosController = require('../controllers/servicios.controller');

// Rutas CRUD para servicios
// GET /api/servicios - Listar todos los servicios
router.get('/', serviciosController.list);

// GET /api/servicios/:id - Obtener un servicio por ID
router.get('/:id', serviciosController.getById);

// POST /api/servicios - Crear un nuevo servicio
router.post('/', serviciosController.create);

// PUT /api/servicios/:id - Actualizar un servicio
router.put('/:id', serviciosController.update);

// DELETE /api/servicios/:id - Eliminar un servicio
router.delete('/:id', serviciosController.remove);

module.exports = router;
