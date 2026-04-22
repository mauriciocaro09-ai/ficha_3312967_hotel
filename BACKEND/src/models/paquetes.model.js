const db = require("../config/db");

const Paquetes = {

obtenerTodos: async () => {

    const [rows] = await db.query(`
        SELECT
            p.IDPaquete,
            p.NombrePaquete,
            p.Descripcion,
            p.Precio,
            p.Estado,
            p.IDCliente,
            p.ImagenURL,

            h.IDHabitacion,
            h.NombreHabitacion,

            s.IDServicio,
            s.NombreServicio,

            c.Nombre as NombreCliente,
            c.Apellido as ApellidoCliente

        FROM Paquetes p
        INNER JOIN Habitacion h
            ON p.IDHabitacion = h.IDHabitacion

        INNER JOIN Servicios s
            ON p.IDServicio = s.IDServicio

        LEFT JOIN Clientes c
            ON p.IDCliente = c.IDCliente
    `);

    return rows;

},

    obtenerPorId: async (id) => {

        const [rows] = await db.query(
            "SELECT * FROM Paquetes WHERE IDPaquete = ?",
            [id]
        );

        return rows[0];

    },

    crear: async (paquete) => {

        const {
            NombrePaquete,
            Descripcion,
            IDHabitacion,
            IDServicio,
            Precio,
            Estado,
            IDCliente,
            ImagenURL = null
        } = paquete;

        const sql = `
            INSERT INTO Paquetes
            (NombrePaquete, Descripcion, IDHabitacion, IDServicio, Precio, Estado, IDCliente, ImagenURL)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            NombrePaquete,
            Descripcion,
            IDHabitacion,
            IDServicio,
            Precio,
            Estado,
            IDCliente,
            ImagenURL
        ]);

        return result;

    },

    actualizar: async (id, paquete) => {

        const {
            NombrePaquete,
            Descripcion,
            IDHabitacion,
            IDServicio,
            Precio,
            Estado,
            IDCliente,
            ImagenURL = null
        } = paquete;

        const sql = `
            UPDATE Paquetes
            SET NombrePaquete=?, Descripcion=?, IDHabitacion=?, IDServicio=?, Precio=?, Estado=?, IDCliente=?, ImagenURL=?
            WHERE IDPaquete=?
        `;

        const [result] = await db.query(sql, [
            NombrePaquete,
            Descripcion,
            IDHabitacion,
            IDServicio,
            Precio,
            Estado,
            IDCliente,
            ImagenURL,
            id
        ]);

        return result;

    },

    eliminar: async (id) => {

        const [result] = await db.query(
            "DELETE FROM Paquetes WHERE IDPaquete=?",
            [id]
        );

        return result;

    }

};

module.exports = Paquetes;