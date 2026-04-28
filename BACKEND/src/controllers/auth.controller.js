const db = require("../config/db");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {

    try {

        const { Email, Contrasena } = req.body;

        const [usuarios] = await db.query(
            "SELECT * FROM Usuarios WHERE Email = ?",
            [Email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                error: "Usuario no encontrado"
            });
        }

        const usuario = usuarios[0];

        // Comparación directa (sin bcrypt)
        if (usuario.Contrasena !== Contrasena) {
            return res.status(401).json({
                error: "Contraseña incorrecta"
            });
        }

        const token = jwt.sign(
            {
                id: usuario.IDUsuario,
                rol: usuario.IDRol
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            mensaje: "Login exitoso",
            token,
            usuario: {
                id: usuario.IDUsuario,
                nombre: usuario.NombreUsuario,
                rol: usuario.IDRol
            }
        });

    } catch (error) {

        res.status(500).json({
            error: "Error en login",
            detalle: error.message
        });

    }

};