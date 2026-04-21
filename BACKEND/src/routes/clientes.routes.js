const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clientes.controller");

// Rutas para clientes
router.get("/", clienteController.list);
router.get("/:id", clienteController.getById);
router.post("/", clienteController.create);
router.put("/:id", clienteController.update);
router.delete("/:id", clienteController.remove);

module.exports = router;
