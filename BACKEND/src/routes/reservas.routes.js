/**
 * Rutas para el módulo de Reservas
 */

const express = require('express');
const router = express.Router();

// Importar controlador de reservas
const reservasController = require('../controllers/reservas.controller');

// Rutas CRUD para reservas
// GET /api/reservas - Listar todas las reservas
router.get('/', reservasController.list);

// GET /api/reservas/cliente/:nroDocumento - Obtener reservas por cliente
router.get('/cliente/:nroDocumento', reservasController.getByCliente);

// GET /api/reservas/estados - Obtener estados de reserva
router.get('/estados', reservasController.getEstadosReserva);

// GET /api/reservas/:id - Obtener una reserva por ID
router.get('/:id', reservasController.getById);

// GET /api/reservas/:id/servicios - Listar servicios activos de una reserva
router.get('/:id/servicios', reservasController.getServices);

// POST /api/reservas/:id/servicios - Agregar servicio a una reserva
router.post('/:id/servicios', reservasController.addService);

// DELETE /api/reservas/:id/servicios/:idDetalleServicio - Quitar servicio de una reserva
router.delete('/:id/servicios/:idDetalleServicio', reservasController.removeService);

// POST /api/reservas - Crear una nueva reserva
router.post('/', reservasController.create);

// PUT /api/reservas/:id - Actualizar una reserva
router.put('/:id', reservasController.update);

// DELETE /api/reservas/:id - Eliminar una reserva
router.delete('/:id', reservasController.remove);

module.exports = router;
