const authService = require("../services/auth.services");

const login = async (req, res) => {
    const { Email, Contrasena } = req.body;
    try {
        const result = await authService.login(Email, Contrasena);
        
        if (result.error) {
            return res.status(401).json({ message: result.error });
        }

        res.json({ message: "Login exitoso", token: result.token, usuario: result.usuario });
    } catch (error) {
        console.error("Error en login:", error.message);
        console.error("Stack:", error.stack);
        res.status(500).json({ error: "Error en el servidor", details: error.message });
    }
};

module.exports = { login };
