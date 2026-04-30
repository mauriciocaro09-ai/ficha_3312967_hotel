//Importar la libreria express
const express = require('express');
const router = express.Router();  //crear una instancia del router de express
const controller = require('../controllers/roles.controller'); //Importar el controlador de roles
const { verifyToken } = require('../middlewares/auth.middleware'); //verifyToken

//definir las rutas para los roles
router.get('/', controller.list); 
router.get('/search', controller.search); // Búsqueda de roles
router.get('/:id', controller.getById);
router.post('/', verifyToken, controller.create);
router.put('/:id', verifyToken, controller.update);
router.delete('/:id', verifyToken, controller.remove);
router.patch('/:id/status', verifyToken, controller.toggleStatus); // Toggle estado activo/inactivo

//exportar el router
module.exports = router;