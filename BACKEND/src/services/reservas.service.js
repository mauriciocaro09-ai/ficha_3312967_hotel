const db = require("../config/db");
const EmailService = require("./email.service");
const WhatsappService = require("./whatsapp.service");

const ReservasService = {
  // 🔥 CREAR RESERVA
  create: async (reserva) => {
    let {
      IDHabitacion,
      FechaInicio,
      FechaFinalizacion,
      SubTotal,
      Descuento,
      IVA,
      MontoTotal,
      MetodoPago,
      IdEstadoReserva,
      UsuarioIdusuario,
      paquetesIds,
      serviciosIds,
    } = reserva;

    let IDCliente = reserva.IDCliente;
    const documento = reserva.NroDocumento; // ✅ solo para resolver IDCliente, no para guardar en Reserva

    // Resolver IDCliente si viene por documento
    if (!IDCliente && documento) {
      const [clienteRows] = await db.query(
        "SELECT IDCliente FROM Clientes WHERE NroDocumento = ?",
        [documento]
      );
      if (clienteRows.length === 0) {
        throw new Error("Cliente no encontrado con el número de documento proporcionado.");
      }
      IDCliente = clienteRows[0].IDCliente;
    }

    if (!IDCliente) throw new Error("Falta IDCliente para crear la reserva.");
    if (!IDHabitacion) throw new Error("Falta IDHabitacion para crear la reserva.");
    if (!FechaInicio || !FechaFinalizacion) throw new Error("Faltan fechas para crear la reserva.");

    // Defaults
    MetodoPago = MetodoPago ?? 1;
    IdEstadoReserva = IdEstadoReserva ?? 1;
    UsuarioIdusuario = UsuarioIdusuario ?? 1;

    const [result] = await db.query(
      `
      INSERT INTO Reserva (
        IDCliente, IDHabitacion, FechaReserva, FechaInicio, FechaFinalizacion,
        SubTotal, Descuento, IVA, MontoTotal,
        MetodoPago, IdEstadoReserva, UsuarioIdusuario
      )
      VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        IDCliente,
        IDHabitacion,
        FechaInicio,
        FechaFinalizacion,
        SubTotal ?? 0,
        Descuento ?? 0,
        IVA ?? 0,
        MontoTotal ?? 0,
        MetodoPago,
        IdEstadoReserva,
        UsuarioIdusuario,
      ]
    );

    const idReserva = result.insertId;

    // Insert paquetes
    if (Array.isArray(paquetesIds) && paquetesIds.length > 0) {
      for (const paqueteId of paquetesIds) {
        await db.query(
          `INSERT INTO ReservaPaquetes (IDReserva, IDPaquete) VALUES (?, ?)`,
          [idReserva, paqueteId]
        );
      }
    }

    // Insert servicios
    if (Array.isArray(serviciosIds) && serviciosIds.length > 0) {
      for (const servicioId of serviciosIds) {
        await db.query(
          `
          INSERT INTO detallereservaservicio (IDReserva, IDServicio, Cantidad, Precio, Estado)
          SELECT ?, ?, 1, Costo, 1 FROM servicios WHERE IDServicio = ?
          `,
          [idReserva, servicioId, servicioId]
        );
      }
    }

    // Enviar notificaciones (no bloquea si fallan)
    db.query(
      `SELECT c.Nombre, c.Apellido, c.Email, c.Telefono, h.NombreHabitacion
       FROM Clientes c
       JOIN Habitacion h ON h.IDHabitacion = ?
       WHERE c.IDCliente = ?`,
      [IDHabitacion, IDCliente]
    ).then(([rows]) => {
      const cliente = rows[0];
      if (!cliente) return;

      const datosNotificacion = {
        clienteNombre: `${cliente.Nombre} ${cliente.Apellido}`,
        reservaId: idReserva,
        habitacion: cliente.NombreHabitacion,
        fechaInicio: FechaInicio,
        fechaFin: FechaFinalizacion,
        montoTotal: MontoTotal ?? 0,
      };

      if (cliente.Email) {
        EmailService.enviarConfirmacionReserva({ ...datosNotificacion, clienteEmail: cliente.Email });
      }

      if (cliente.Telefono) {
        WhatsappService.enviarConfirmacionReserva({ ...datosNotificacion, clienteTelefono: cliente.Telefono });
      }
    }).catch((err) => console.error("Error consultando datos para notificaciones:", err));

    return { insertId: idReserva };
  },

  // 🔥 OBTENER RESERVAS
  obtener: async () => {
    const [rows] = await db.query(`
      SELECT 
        r.IdReserva AS IDReserva,
        r.FechaReserva,
        r.FechaInicio,
        r.FechaFinalizacion,
        r.SubTotal,
        r.Descuento,
        r.IVA,
        r.MontoTotal,
        r.MetodoPago,
        r.IdEstadoReserva,
        r.UsuarioIdusuario,
        r.IDCliente,
        r.IDHabitacion,
        c.Nombre,
        c.Apellido,
        c.NroDocumento,
        h.NombreHabitacion as NombreHabitacion,
        GROUP_CONCAT(DISTINCT p.NombrePaquete SEPARATOR ', ') AS Paquetes,
        GROUP_CONCAT(DISTINCT p.IDPaquete SEPARATOR ',') AS PaquetesIds,
        GROUP_CONCAT(DISTINCT s.NombreServicio SEPARATOR ', ') AS Servicios,
        GROUP_CONCAT(DISTINCT s.IDServicio SEPARATOR ',') AS ServiciosIds
      FROM Reserva r
      LEFT JOIN Clientes c ON r.IDCliente = c.IDCliente
      LEFT JOIN Habitacion h ON r.IDHabitacion = h.IDHabitacion
      LEFT JOIN ReservaPaquetes rp ON r.IDReserva = rp.IDReserva
      LEFT JOIN paquetes p ON rp.IDPaquete = p.IDPaquete
      LEFT JOIN detallereservaservicio drs ON r.IDReserva = drs.IDReserva
      LEFT JOIN servicios s ON drs.IDServicio = s.IDServicio
      GROUP BY r.IDReserva
      ORDER BY r.IDReserva DESC
    `);
    return rows;
  },

  // 🔥 CANCELAR
  cancelar: async (idReserva) => {
    const [result] = await db.query(
      `UPDATE Reserva SET IdEstadoReserva = 3 WHERE IdReserva = ?`,
      [idReserva]
    );
    return result.affectedRows > 0;
  },

  // 🔥 ACTUALIZAR
  actualizar: async (id, data) => {
    let { IDCliente, NroDocumento } = data;

    // Resolver IDCliente si viene por documento
    if (!IDCliente && NroDocumento) {
      const [clienteRows] = await db.query(
        "SELECT IDCliente FROM Clientes WHERE NroDocumento = ?",
        [NroDocumento]
      );
      if (clienteRows.length === 0) throw new Error("Cliente no encontrado con el documento proporcionado.");
      IDCliente = clienteRows[0].IDCliente;
    }

    const {
      IDHabitacion,
      FechaInicio,
      FechaFinalizacion,
      SubTotal,
      Descuento,
      IVA,
      MontoTotal,
      MetodoPago,
      IdEstadoReserva,
      paquetesIds,
      serviciosIds,
    } = data;

    const [result] = await db.query(
      `
      UPDATE Reserva 
      SET IDCliente = ?, IDHabitacion = ?, FechaInicio = ?, FechaFinalizacion = ?,
          SubTotal = ?, Descuento = ?, IVA = ?, MontoTotal = ?,
          MetodoPago = ?, IdEstadoReserva = ?
      WHERE IdReserva = ?
      `,
      [
        IDCliente,
        IDHabitacion,
        FechaInicio,
        FechaFinalizacion,
        SubTotal ?? 0,
        Descuento ?? 0,
        IVA ?? 0,
        MontoTotal ?? 0,
        MetodoPago ?? 1,
        IdEstadoReserva ?? 1,
        id,
      ]
    );

    if (Array.isArray(paquetesIds)) {
      await db.query("DELETE FROM ReservaPaquetes WHERE IDReserva = ?", [id]);
      for (const paqueteId of paquetesIds) {
        await db.query("INSERT INTO ReservaPaquetes (IDReserva, IDPaquete) VALUES (?, ?)", [
          id,
          paqueteId,
        ]);
      }
    }

    if (Array.isArray(serviciosIds)) {
      await db.query("DELETE FROM detallereservaservicio WHERE IDReserva = ?", [id]);
      for (const servicioId of serviciosIds) {
        await db.query(
          `
          INSERT INTO detallereservaservicio (IDReserva, IDServicio, Cantidad, Precio, Estado)
          SELECT ?, ?, 1, Costo, 1 FROM servicios WHERE IDServicio = ?
          `,
          [id, servicioId, servicioId]
        );
      }
    }

    return result.affectedRows > 0;
  },

  // 🔥 ELIMINAR
  eliminar: async (id) => {
    await db.query(`DELETE FROM detalle_reserva_paquete WHERE IDReserva = ?`, [id]);
    await db.query(`DELETE FROM detallereservapaquetes WHERE IDReserva = ?`, [id]);
    await db.query(`DELETE FROM detallereservaservicio WHERE IDReserva = ?`, [id]);
    await db.query(`DELETE FROM reservapaquetes WHERE IDReserva = ?`, [id]);
    const [result] = await db.query(`DELETE FROM Reserva WHERE IdReserva = ?`, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = ReservasService;