const db = require("../config/db");

const DashboardService = {

    estadisticas: async () => {

        // total reservas
        const [reservas] = await db.query(`
            SELECT COUNT(*) AS totalReservas
            FROM Reserva
        `);

        // ingresos totales
        const [ingresos] = await db.query(`
            SELECT SUM(MontoTotal) AS ingresosTotales
            FROM Reserva
            WHERE IdEstadoReserva = 1
        `);

        // habitaciones más reservadas
        const [habitaciones] = await db.query(`
            SELECT 
                h.NombreHabitacion,
                COUNT(r.IDHabitacion) AS total
            FROM Reserva r
            JOIN Habitacion h 
            ON r.IDHabitacion = h.IDHabitacion
            GROUP BY r.IDHabitacion
            ORDER BY total DESC
            LIMIT 5
        `);

        // servicios más vendidos
        const [servicios] = await db.query(`
            SELECT 
                s.NombreServicio,
                COUNT(d.IDServicio) AS total
            FROM DetalleReservaServicio d
            JOIN Servicios s
            ON d.IDServicio = s.IDServicio
            GROUP BY d.IDServicio
            ORDER BY total DESC
            LIMIT 5
        `);

        return {
            totalReservas: reservas[0].totalReservas,
            ingresosTotales: ingresos[0].ingresosTotales || 0,
            habitacionesMasReservadas: habitaciones,
            serviciosMasVendidos: servicios
        };

    }

};

module.exports = DashboardService;