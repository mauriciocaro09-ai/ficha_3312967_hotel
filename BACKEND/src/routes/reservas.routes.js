const express = require("express");
const router = express.Router();

const reservasController = require("../controllers/reservas.controller");

router.get("/", reservasController.obtener);
router.post("/", reservasController.crear);

// ✅ Ruta que tu frontend está llamando
router.put("/:id/cancelar", reservasController.cancelar);

// (Opcional) por si luego usas editar
router.put("/:id", reservasController.actualizar);

// (Opcional) compatibilidad si quieres borrar con DELETE
router.delete("/:id", reservasController.cancelar);

module.exports = router;