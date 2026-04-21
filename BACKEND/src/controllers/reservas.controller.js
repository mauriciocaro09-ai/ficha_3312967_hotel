/**
 * Controlador de Reservas
 */

const reservaModel = require('../models/reserva');

const REQUIRED_FIELDS = [
    'NroDocumentoCliente',
    'FechaInicio',
    'FechaFinalizacion',
    'Sub_Total',
    'Descuento',
    'IVA',
    'Monto_Total',
    'MetodoPago',
    'IdEstadoReserva',
    'id_usuario'
];

const parsePositiveId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

const normalizeReservationData = (data = {}) => ({
    NroDocumentoCliente: data.NroDocumentoCliente ?? data.NroDocumento ?? data.documentoCliente ?? '',
    FechaInicio: data.FechaInicio ?? data.FechaEntrada ?? '',
    FechaFinalizacion: data.FechaFinalizacion ?? data.FechaSalida ?? '',
    Sub_Total: data.Sub_Total ?? data.SubTotal ?? data.CostoTotal ?? 0,
    Descuento: data.Descuento ?? 0,
    IVA: data.IVA ?? 0,
    Monto_Total: data.Monto_Total ?? data.MontoTotal ?? data.CostoTotal ?? 0,
    MetodoPago: data.MetodoPago ?? data.IdMetodoPago ?? data.metodoPago ?? null,
    IdEstadoReserva: data.IdEstadoReserva ?? data.IdEstado ?? data.estadoId ?? 1,
    id_usuario: data.id_usuario ?? data.UsuarioIdusuario ?? data.UsuarioId ?? data.usuarioId ?? null
});

const getMissingFields = (data) => {
    return REQUIRED_FIELDS.filter((field) => data[field] === undefined || data[field] === null || data[field] === '');
};

const isValidDate = (value) => {
    const parsed = new Date(value);
    return !Number.isNaN(parsed.getTime());
};

const normalizeReservaServicioData = (data = {}) => ({
    IDServicio: data.IDServicio ?? data.idServicio ?? data.servicioId ?? null,
    Cantidad: data.Cantidad ?? data.cantidad ?? 1,
    Precio: data.Precio ?? data.precio ?? null,
    Estado: data.Estado ?? 1
});

const validateReservaServicioPayload = (data) => {
    if (!Number.isInteger(Number(data.IDServicio)) || Number(data.IDServicio) <= 0) {
        return { valid: false, message: 'IDServicio debe ser un número entero positivo' };
    }

    if (!Number.isInteger(Number(data.Cantidad)) || Number(data.Cantidad) <= 0) {
        return { valid: false, message: 'Cantidad debe ser un número entero positivo' };
    }

    if (data.Precio !== null && data.Precio !== undefined && Number(data.Precio) < 0) {
        return { valid: false, message: 'Precio no puede ser negativo' };
    }

    return { valid: true };
};

const validateReservationPayload = (data) => {
    const missingFields = getMissingFields(data || {});

    if (missingFields.length > 0) {
        return {
            valid: false,
            message: `Faltan campos obligatorios: ${missingFields.join(', ')}`
        };
    }

    if (!isValidDate(data.FechaInicio) || !isValidDate(data.FechaFinalizacion)) {
        return {
            valid: false,
            message: 'Las fechas de inicio y finalización deben ser válidas'
        };
    }

    if (new Date(data.FechaInicio) > new Date(data.FechaFinalizacion)) {
        return {
            valid: false,
            message: 'La FechaInicio no puede ser mayor que la FechaFinalizacion'
        };
    }

    return { valid: true };
};

// Listar todas las reservas
const list = async (req, res) => {
    try {
        const reservas = await reservaModel.list();
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las reservas" });
    }
};

// Obtener reservas por documento de cliente
const getByCliente = async (req, res) => {
    const nroDocumento = req.params.nroDocumento || req.query.nroDocumento || req.query.documento;

    if (!nroDocumento) {
        return res.status(400).json({ error: 'Número de documento requerido' });
    }

    try {
        const reservas = await reservaModel.getByCliente(nroDocumento);
        res.json(reservas);
    } catch (error) {
        console.error('Error al obtener reservas por cliente:', error);
        res.status(500).json({ error: 'Error al obtener las reservas del cliente' });
    }
};

// Obtener estados de reserva desde la tabla maestra
const getEstadosReserva = async (req, res) => {
    try {
        const estados = await reservaModel.getEstadosReserva();
        res.json(estados);
    } catch (error) {
        console.error('Error al obtener estados de reserva:', error);
        res.status(500).json({ error: 'Error al obtener los estados de reserva' });
    }
};

// Obtener reserva por ID
const getById = async (req, res) => {
    const id = parsePositiveId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: 'ID de reserva inválido' });
    }

    try {
        const reserva = await reservaModel.getById(id);
        if (!reserva) {
            return res.status(404).json({ error: "Reserva no encontrada" });
        }
        res.json(reserva);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la reserva" });
    }
};

// Crear reserva
const create = async (req, res) => {
    try {
        const payload = normalizeReservationData(req.body);
        const validation = validateReservationPayload(payload);

        if (!validation.valid) {
            return res.status(400).json({ error: validation.message });
        }

        const nuevaReserva = await reservaModel.create(payload);

        if (!nuevaReserva || !nuevaReserva.insertId) {
            return res.status(500).json({ error: 'No se pudo crear la reserva' });
        }

        res.status(201).json({ 
            message: "Reserva creada exitosamente",
            IDReserva: nuevaReserva.insertId
        });
    } catch (error) {
        console.error("Error al crear reserva:", error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ error: 'Alguno de los valores relacionados no existe en la base de datos' });
        }

        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Actualizar reserva
const update = async (req, res) => {
    const id = parsePositiveId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: 'ID de reserva inválido' });
    }

    try {
        const payload = normalizeReservationData(req.body);
        const validation = validateReservationPayload(payload);

        if (!validation.valid) {
            return res.status(400).json({ error: validation.message });
        }

        const result = await reservaModel.update(id, payload);

        if (!result || result.affectedRows === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        res.json({ message: "Reserva actualizada exitosamente" });
    } catch (error) {
        console.error('Error al actualizar reserva:', error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ error: 'Alguno de los valores relacionados no existe en la base de datos' });
        }

        res.status(500).json({ error: "Error al actualizar la reserva" });
    }
};

// Eliminar reserva
const remove = async (req, res) => {
    const id = parsePositiveId(req.params.id);

    if (!id) {
        return res.status(400).json({ error: 'ID de reserva inválido' });
    }

    try {
        const result = await reservaModel.delete(id);

        if (!result || result.affectedRows === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        res.json({ message: "Reserva eliminada exitosamente" });
    } catch (error) {
        console.error("Error al eliminar reserva:", error);
        res.status(500).json({ error: "Error al eliminar la reserva" });
    }
};

const getServices = async (req, res) => {
    const idReserva = parsePositiveId(req.params.id);
    const estadoQuery = req.query.estado;

    if (!idReserva) {
        return res.status(400).json({ error: 'ID de reserva inválido' });
    }

    let estadoFiltro = 1;

    if (estadoQuery !== undefined) {
        if (estadoQuery === 'all') {
            estadoFiltro = null;
        } else if (estadoQuery === '0' || estadoQuery === '1') {
            estadoFiltro = Number(estadoQuery);
        } else {
            return res.status(400).json({ error: 'Parámetro estado inválido. Usa 0, 1 o all' });
        }
    }

    try {
        const servicios = await reservaModel.getServicesByReserva(idReserva, estadoFiltro);
        res.json(servicios);
    } catch (error) {
        console.error('Error al listar servicios de la reserva:', error);

        if (error.code === 'RESERVA_NOT_FOUND') {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        res.status(500).json({ error: 'Error al obtener servicios de la reserva' });
    }
};

const addService = async (req, res) => {
    const idReserva = parsePositiveId(req.params.id);

    if (!idReserva) {
        return res.status(400).json({ error: 'ID de reserva inválido' });
    }

    try {
        const payload = normalizeReservaServicioData(req.body);
        const validation = validateReservaServicioPayload(payload);

        if (!validation.valid) {
            return res.status(400).json({ error: validation.message });
        }

        const result = await reservaModel.addServiceToReserva(idReserva, {
            IDServicio: Number(payload.IDServicio),
            Cantidad: Number(payload.Cantidad),
            Precio: payload.Precio !== null && payload.Precio !== undefined ? Number(payload.Precio) : null,
            Estado: Number(payload.Estado) === 0 ? 0 : 1
        });

        const wasUpdated = result.operation && result.operation.type === 'updated';

        res.status(201).json({
            message: wasUpdated
                ? 'Servicio existente actualizado en la reserva (cantidad acumulada)'
                : 'Servicio agregado a la reserva exitosamente',
            operation: result.operation,
            IDDetalleReservaServicio: result.operation?.id,
            reserva: result.reservaActualizada
        });
    } catch (error) {
        console.error('Error al agregar servicio a la reserva:', error);

        if (error.code === 'RESERVA_NOT_FOUND') {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        if (error.code === 'SERVICIO_NOT_FOUND') {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        if (error.code === 'SERVICIO_INACTIVO') {
            return res.status(400).json({ error: 'El servicio seleccionado no está activo' });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ error: 'Relación inválida entre reserva y servicio' });
        }

        res.status(500).json({ error: 'Error al agregar servicio a la reserva' });
    }
};

const removeService = async (req, res) => {
    const idReserva = parsePositiveId(req.params.id);
    const idDetalleServicio = parsePositiveId(req.params.idDetalleServicio);

    if (!idReserva) {
        return res.status(400).json({ error: 'ID de reserva inválido' });
    }

    if (!idDetalleServicio) {
        return res.status(400).json({ error: 'ID de detalle de servicio inválido' });
    }

    try {
        const result = await reservaModel.removeServiceFromReserva(idReserva, idDetalleServicio);

        res.json({
            message: 'Servicio quitado de la reserva exitosamente',
            IDDetalleReservaServicio: result.detalleDesactivadoId,
            reserva: result.reservaActualizada
        });
    } catch (error) {
        console.error('Error al quitar servicio de la reserva:', error);

        if (error.code === 'RESERVA_NOT_FOUND') {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        if (error.code === 'DETALLE_NOT_FOUND') {
            return res.status(404).json({ error: 'Detalle de servicio no encontrado para esta reserva' });
        }

        if (error.code === 'DETALLE_ALREADY_INACTIVE') {
            return res.status(400).json({ error: 'El detalle de servicio ya está inactivo' });
        }

        res.status(500).json({ error: 'Error al quitar servicio de la reserva' });
    }
};

module.exports = {
    list,
    getByCliente,
    getEstadosReserva,
    getById,
    create,
    update,
    remove,
    getServices,
    addService,
    removeService
};
