/**
 * Rutas para el módulo de Habitaciones
 */

const express = require('express');
const router = express.Router();

// Importar controlador de habitaciones
const habitacionesController = require('../controllers/habitaciones.controller');

// Rutas CRUD para habitaciones
// GET /api/habitaciones - Listar todas las habitaciones
router.get('/', habitacionesController.list);

// GET /api/habitaciones/:id - Obtener una habitación por ID
router.get('/:id', habitacionesController.getById);

// POST /api/habitaciones - Crear una nueva habitación
router.post('/', habitacionesController.create);

// PUT /api/habitaciones/:id - Actualizar una habitación
router.put('/:id', habitacionesController.update);

// DELETE /api/habitaciones/:id - Eliminar una habitación
router.delete('/:id', habitacionesController.remove);

module.exports = router;
