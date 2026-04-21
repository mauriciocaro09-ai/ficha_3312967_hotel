const db = require("../config/db");

const Habitaciones = {

    obtenerTodas: async () => {

        const [rows] = await db.query("SELECT * FROM Habitacion");
        return rows;

    },

    obtenerPorId: async (id) => {

        const [rows] = await db.query(
            "SELECT * FROM Habitacion WHERE IDHabitacion = ?",
            [id]
        );

        return rows[0];

    },

    crear: async (habitacion) => {

        const { NombreHabitacion, Descripcion, Costo, Estado } = habitacion;

        const sql = `
            INSERT INTO Habitacion 
            (NombreHabitacion, Descripcion, Costo, Estado)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            NombreHabitacion,
            Descripcion,
            Costo,
            Estado
        ]);

        return result;

    },

    actualizar: async (id, habitacion) => {

        const { NombreHabitacion, Descripcion, Costo, Estado } = habitacion;

        const sql = `
            UPDATE Habitacion
            SET NombreHabitacion=?, Descripcion=?, Costo=?, Estado=?
            WHERE IDHabitacion=?
        `;

        const [result] = await db.query(sql, [
            NombreHabitacion,
            Descripcion,
            Costo,
            Estado,
            id
        ]);

        return result;

    },

    eliminar: async (id) => {

        const [result] = await db.query(
            "DELETE FROM Habitacion WHERE IDHabitacion=?",
            [id]
        );

        return result;

    }

};

module.exports = Habitaciones;