const db = require("../database/connection");

// Get all services / list
const list = async (req, res) => {
    try {
        const [servicios] = await db.query("SELECT * FROM servicio")
        res.json(servicios)
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los servicios" })
    }
}

// Get service by ID
const getById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query("SELECT * FROM servicio WHERE IDServicio = ?", [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Servicio no encontrado" });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el servicio" });
    }
};

// CREATE servicio POST
const create = async (req, res) => { 
    const { NombreServicio, Descripcion, Duracion, CantidadMaximaPersonas, Costo, Estado } = req.body;
    try {
        await db.query(
            "INSERT INTO servicio (NombreServicio, Descripcion, Duracion, CantidadMaximaPersonas, Costo, Estado) VALUES (?, ?, ?, ?, ?, ?)",
            [NombreServicio, Descripcion, Duracion, CantidadMaximaPersonas, Costo, Estado]
        )
        res.status(201).json({ message: "Servicio creado exitosamente"});
    } catch (error) {
        res.status(500).json({ error: "Error al crear el servicio" });
    }
}

// UPDATE servicio PUT
const update = async (req, res) => {
    const { id } = req.params;
    const { NombreServicio, Descripcion, Duracion, CantidadMaximaPersonas, Costo, Estado } = req.body; 
    try {
        await db.query(
            "UPDATE servicio SET NombreServicio = ?, Descripcion = ?, Duracion = ?, CantidadMaximaPersonas = ?, Costo = ?, Estado = ? WHERE IDServicio = ?",
            [NombreServicio, Descripcion, Duracion, CantidadMaximaPersonas, Costo, Estado, id]
        )
        res.json({ message: "Servicio actualizado exitosamente" })
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el servicio" })
    }
}   

// DELETE servicio
const remove = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM servicio WHERE IDServicio = ?", [id])
        res.json({ message: "Servicio eliminado exitosamente" })
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el servicio" })
    }
}

module.exports = {
    list,
    getById,
    create,
    update,
    remove
}
