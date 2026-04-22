const db = require("../config/db");

const Servicios = {

    obtenerTodos: async () => {

        const [rows] = await db.query("SELECT * FROM Servicios");
        return rows;

    },

    obtenerPorId: async (id) => {

        const [rows] = await db.query(
            "SELECT * FROM Servicios WHERE IDServicio = ?",
            [id]
        );

        return rows[0];

    },

    crear: async (servicio) => {

        const {
            NombreServicio,
            Descripcion,
            Duracion,
            CantidadMaximaPersonas,
            Costo,
            Estado
        } = servicio;

        const sql = `
            INSERT INTO Servicios
            (NombreServicio, Descripcion, Duracion, CantidadMaximaPersonas, Costo, Estado)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            NombreServicio,
            Descripcion,
            Duracion,
            CantidadMaximaPersonas,
            Costo,
            Estado
        ]);

        return result;

    },

    actualizar: async (id, servicio) => {

        const {
            NombreServicio,
            Descripcion,
            Duracion,
            CantidadMaximaPersonas,
            Costo,
            Estado
        } = servicio;

        const sql = `
            UPDATE Servicios
            SET NombreServicio=?, Descripcion=?, Duracion=?, CantidadMaximaPersonas=?, Costo=?, Estado=?
            WHERE IDServicio=?
        `;

        const [result] = await db.query(sql, [
            NombreServicio,
            Descripcion,
            Duracion,
            CantidadMaximaPersonas,
            Costo,
            Estado,
            id
        ]);

        return result;

    },

    eliminar: async (id) => {

        const [result] = await db.query(
            "DELETE FROM Servicios WHERE IDServicio=?",
            [id]
        );

        return result;

    },

    toggleEstado: async (id, estado) => {

        const [result] = await db.query(
            "UPDATE Servicios SET Estado=? WHERE IDServicio=?",
            [estado, id]
        );

        return result;

    }

};

module.exports = Servicios;