const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// =============================
// MIDDLEWARES
// =============================
app.use(cors());
app.use(express.json());
app.use("/img", express.static(path.join(__dirname, "public", "img")));

// =============================
// RUTAS
// =============================
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const habitacionesRoutes = require("./routes/habitaciones.routes");
const reservasRoutes = require("./routes/reservas.routes");
const clientesRoutes = require("./routes/clientes.routes");
const paquetesRoutes = require("./routes/paquetes.routes");
const serviciosRoutes = require("./routes/servicios.routes");

const verificarToken = require("./middlewares/auth.middleware");

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", verificarToken, dashboardRoutes);
app.use("/api/reservas", verificarToken, reservasRoutes);
app.use("/api/paquetes", verificarToken, paquetesRoutes);
app.use("/api/habitaciones", habitacionesRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/clientes", clientesRoutes);

// =============================
// HEALTH CHECK
// =============================
app.get("/", (req, res) => {
  res.json({ mensaje: "API Hospedaje Digital funcionando correctamente" });
});

module.exports = app;
