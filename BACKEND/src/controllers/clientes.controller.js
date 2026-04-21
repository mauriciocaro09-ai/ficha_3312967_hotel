const db = require("../database/connection");

// Regex para validación básica de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Get all clients / list
const list = async (req, res) => {
    try {
        const [clientes] = await db.query("SELECT * FROM cliente");
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los clientes" });
    }
};

// Get client by NroDocumento
const getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query("SELECT * FROM cliente WHERE NroDocumento = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el cliente" });
    }
};

// CREATE cliente POST
const create = async (req, res) => {
    const { 
        NroDocumento,
        Nombre, 
        Apellido,
        Direccion,
        Email, 
        Telefono,
        Estado,
        IDRol
    } = req.body;
    
    if (!NroDocumento || !Nombre || !Email) {
        return res.status(400).json({ error: "NroDocumento, Nombre y Email son requeridos" });
    }

    // Validar formato de email
    if (Email && !emailRegex.test(Email)) {
        return res.status(400).json({ error: "Formato de email inválido" });
    }

    try {
        const [result] = await db.query(
            "INSERT INTO cliente (NroDocumento, Nombre, Apellido, Direccion, Email, Telefono, Estado, IDRol) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [NroDocumento, Nombre, Apellido, Direccion, Email, Telefono, Estado || 1, IDRol || 1]
        );
        
        // Obtener el cliente recién creado
        const [clienteCreado] = await db.query("SELECT * FROM cliente WHERE NroDocumento = ?", [NroDocumento]);
        res.status(201).json(clienteCreado[0]);
    } catch (error) {
        console.error("Error al crear el cliente:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// UPDATE cliente PUT
const update = async (req, res) => {
    const { id } = req.params;
    
    const { 
        Nombre, 
        Apellido,
        Direccion,
        Email, 
        Telefono,
        Estado,
        IDRol
    } = req.body;

    // Validar campos requeridos
    if (!Nombre || !Email) {
        return res.status(400).json({ error: "Nombre y Email son requeridos" });
    }

    // Validar formato de email
    if (Email && !emailRegex.test(Email)) {
        return res.status(400).json({ error: "Formato de email inválido" });
    }

    try {
        const [existing] = await db.query("SELECT * FROM cliente WHERE NroDocumento = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        await db.query(
            "UPDATE cliente SET Nombre = ?, Apellido = ?, Direccion = ?, Email = ?, Telefono = ?, Estado = ?, IDRol = ? WHERE NroDocumento = ?",
            [Nombre, Apellido, Direccion, Email, Telefono, Estado, IDRol, id]
        );
        res.json({ message: "Cliente actualizado exitosamente" });
    } catch (error) {
        console.error("Error al actualizar el cliente:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// DELETE cliente
const remove = async (req, res) => {
    const { id } = req.params;
    try {
        const [existing] = await db.query("SELECT * FROM cliente WHERE NroDocumento = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        await db.query("DELETE FROM cliente WHERE NroDocumento = ?", [id]);
        res.json({ message: "Cliente eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el cliente" });
    }
};

module.exports = {
    list,
    getById,
    create,
    update,
    remove
};
