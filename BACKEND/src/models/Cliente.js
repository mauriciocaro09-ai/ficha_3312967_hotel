const db = require("../database/connection");

// Cliente Model - Define la estructura de la tabla cliente

const ClienteModel = {
    // Obtener todos los clientes
    findAll: async () => {
        const [rows] = await db.query("SELECT * FROM cliente");
        return rows;
    },

    // Obtener cliente por NroDocumento
    findById: async (nroDocumento) => {
        const [rows] = await db.query("SELECT * FROM cliente WHERE NroDocumento = ?", [nroDocumento]);
        return rows[0];
    },

    // Crear nuevo cliente
    create: async (clienteData) => {
        const { NroDocumento, Nombre, Apellido, Direccion, Email, Telefono, Estado, IDRol } = clienteData;
        const [result] = await db.query(
            "INSERT INTO cliente (NroDocumento, Nombre, Apellido, Direccion, Email, Telefono, Estado, IDRol) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [NroDocumento, Nombre, Apellido, Direccion, Email, Telefono, Estado || 1, IDRol || 1]
        );
        return result;
    },

    // Actualizar cliente
    update: async (nroDocumento, clienteData) => {
        const { Nombre, Apellido, Direccion, Email, Telefono, Estado, IDRol } = clienteData;
        const [result] = await db.query(
            "UPDATE cliente SET Nombre = ?, Apellido = ?, Direccion = ?, Email = ?, Telefono = ?, Estado = ?, IDRol = ? WHERE NroDocumento = ?",
            [Nombre, Apellido, Direccion, Email, Telefono, Estado, IDRol, nroDocumento]
        );
        return result;
    },

    // Eliminar cliente
    delete: async (nroDocumento) => {
        const [result] = await db.query("DELETE FROM cliente WHERE NroDocumento = ?", [nroDocumento]);
        return result;
    }
};

module.exports = ClienteModel;
