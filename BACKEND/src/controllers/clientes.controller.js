const db = require("../config/db");

/* ================= LISTAR CLIENTES ================= */

exports.getAll = async (req, res) => {
  try {
    const { documento } = req.query;

    let sql = "SELECT * FROM Clientes";
    let params = [];

    if (documento) {
      sql += " WHERE NroDocumento = ?";
      params = [documento];
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo clientes", detalle: error.message });
  }
};

/* ================= BUSCAR CLIENTE POR DOCUMENTO ================= */

exports.buscarPorDocumento = async (req, res) => {
  try {
    const { documento } = req.query;

    if (!documento) {
      return res.status(400).json({ error: "Documento requerido" });
    }

    const [rows] = await db.query(
      "SELECT * FROM Clientes WHERE NroDocumento = ?",
      [documento]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error buscando cliente", detalle: error.message });
  }
};

/* ================= OBTENER CLIENTE POR ID ================= */

exports.obtenerPorId = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Clientes WHERE IDCliente = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo cliente", detalle: error.message });
  }
};

/* ================= CREAR CLIENTE ================= */

exports.create = async (req, res) => {
  try {
    const { NroDocumento, Nombre, Apellido, Email, Telefono, Estado, IDRol } = req.body;

    const [result] = await db.query(
      `INSERT INTO Clientes (NroDocumento, Nombre, Apellido, Email, Telefono, Estado, IDRol)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [NroDocumento, Nombre, Apellido, Email, Telefono, Estado, IDRol]
    );

    res.status(201).json({ mensaje: "Cliente creado", data: result });
  } catch (error) {
    res.status(500).json({ error: "Error creando cliente", detalle: error.message });
  }
};

/* ================= EDITAR CLIENTE ================= */

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { NroDocumento, Nombre, Apellido, Email, Telefono, Estado, IDRol } = req.body;

    await db.query(
      `UPDATE Clientes
       SET NroDocumento = ?, Nombre = ?, Apellido = ?, Email = ?, Telefono = ?, Estado = ?, IDRol = ?
       WHERE IDCliente = ?`,
      [NroDocumento, Nombre, Apellido, Email, Telefono, Estado, IDRol, id]
    );

    res.json({ mensaje: "Cliente actualizado" });
  } catch (error) {
    res.status(500).json({ error: "Error actualizando cliente", detalle: error.message });
  }
};

/* ================= ELIMINAR CLIENTE ================= */

exports.remove = async (req, res) => {
  try {
    await db.query("DELETE FROM Clientes WHERE IDCliente = ?", [req.params.id]);
    res.json({ mensaje: "Cliente eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error eliminando cliente", detalle: error.message });
  }
};
