const db = require("../database/connection");

// Get all rooms / list
const list = async (req, res) => {
    try {
        const [habitaciones] = await db.query("SELECT * FROM habitacion")
        res.json(habitaciones)
    } catch (error) {
        res.status(500).json({ error: "Error al obtener las habitaciones" })
    }
}

// Get room by ID
const getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query("SELECT * FROM habitacion WHERE IDHabitacion = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Habitación no encontrada" });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener la habitación" });
    }
};

// CREATE habitacion POST
const create = async (req, res) => { 
    const {  NombreHabitacion, ImagenHabitacion, Descripcion, Costo, Estado } = req.body;
    
    // Validar campos requeridos
    if (!NombreHabitacion || !Costo) {
        return res.status(400).json({ error: "Nombre y costo son requeridos" });
    }
    
    try {
        await db.query(
            "INSERT INTO habitacion (NombreHabitacion, ImagenHabitacion, Descripcion, Costo, Estado) VALUES (?, ?, ?, ?, ?)",
            [NombreHabitacion, ImagenHabitacion, Descripcion, Costo, Estado]
        )
        res.status(201).json({ message: "Habitación creada exitosamente"});
    } catch (error) {
        res.status(500).json({ error: "Error al crear la habitación" });
    }
}

// UPDATE habitacion PUT
const update = async (req, res) => {
    const { id } = req.params;
    const { NombreHabitacion, ImagenHabitacion, Descripcion, Costo, Estado } = req.body; 
    
    // Validar campos requeridos
    if (!NombreHabitacion || !Costo) {
        return res.status(400).json({ error: "Nombre y costo son requeridos" });
    }
    
    try {
        const [existing] = await db.query("SELECT * FROM habitacion WHERE IDHabitacion = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: "Habitación no encontrada" });
        }

        await db.query(
            "UPDATE habitacion SET NombreHabitacion = ?, ImagenHabitacion = ?, Descripcion = ?, Costo = ?, Estado = ? WHERE IDHabitacion = ?",
            [NombreHabitacion, ImagenHabitacion, Descripcion, Costo, Estado, id]
        );
        res.json({ message: "Habitación actualizada exitosamente" })
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar la habitación" })
    }
}   

// DELETE habitacion
const remove = async (req, res) => {
    const { id } = req.params;
    try {
        const [existing] = await db.query("SELECT * FROM habitacion WHERE IDHabitacion = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: "Habitación no encontrada" });
        }

        await db.query("DELETE FROM habitacion WHERE IDHabitacion = ?", [id])
        res.json({ message: "Habitación eliminada exitosamente" })
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la habitación" })
    }
}

module.exports = {
    list,
    getById,
    create,
    update,
    remove
}
