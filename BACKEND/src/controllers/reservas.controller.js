const ReservasService = require("../services/reservas.service");

const crear = async (req, res) => {
  try {
    const result = await ReservasService.create(req.body);
    return res.status(201).json({ mensaje: "Reserva creada", reservaId: result.insertId });
  } catch (error) {
    console.error("RESERVAS ERROR:", error);
    return res.status(500).json({ error: "Error creando la reserva", detalle: error.message });
  }
};

const obtener = async (req, res) => {
  try {
    const reservas = await ReservasService.obtener();
    return res.status(200).json(reservas);
  } catch (error) {
    console.error("RESERVAS ERROR:", error);
    return res.status(500).json({ error: "Error obteniendo reservas", detalle: error.message });
  }
};

const cancelar = async (req, res) => {
  try {
    const id = req.params.id; // ✅ viene de /:id/cancelar
    const ok = await ReservasService.cancelar(id);

    if (!ok) return res.status(404).json({ error: "Reserva no encontrada" });
    return res.status(200).json({ mensaje: "Reserva cancelada" });
  } catch (error) {
    console.error("RESERVAS ERROR:", error);
    return res.status(500).json({ error: "Error al cancelar", detalle: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const id = req.params.id;
    const ok = await ReservasService.actualizar(id, req.body);
    if (!ok) return res.status(404).json({ error: "Reserva no encontrada" });
    return res.status(200).json({ mensaje: "Reserva actualizada" });
  } catch (error) {
    console.error("RESERVAS ERROR:", error);
    return res.status(500).json({ error: "Error al actualizar", detalle: error.message });
  }
};

module.exports = { crear, obtener, cancelar, actualizar };
