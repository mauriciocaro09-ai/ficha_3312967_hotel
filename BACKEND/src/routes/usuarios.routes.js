//Importar la libreria express
const express = require('express');
const router = express.Router();  //crear una instancia del router de express
const controller = require('../controllers/usuarios.controller'); //Importar el controlador de productos
const { verifyToken } = require('../middlewares/auth.middleware'); //verifyToken

//Las rutas ahora son privadas (solo administradores logueados gracias a "verifyToken")
router.get('/', verifyToken, controller.list);
router.get('/search', verifyToken, controller.search); // Búsqueda de usuarios
router.get('/:id', verifyToken, controller.getById);
router.post('/', controller.create); // El registro suele ser público
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.remove);
router.patch('/:id/status', verifyToken, controller.toggleStatus); // Toggle estado activo/inactivo

module.exports = router;