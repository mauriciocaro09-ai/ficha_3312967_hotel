/**
 * Archivo principal de configuración de Express
 * Maneja middlewares y rutas
 */

const express = require('express');
const cors = require('cors');
const app = express();

// ============================================
// CONFIGURACIÓN DE CORS MEJORADA
// ============================================

// Constantes para métodos HTTP permitidos (mejora 1: legibilidad)
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

// Constantes para headers permitidos (mejora 1: legibilidad)
const ALLOWED_HEADERS = [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
];

// Lista de orígenes permitidos en producción (mejora 2: seguridad)
// Se carga desde variable de entorno o usa valores por defecto
const getAllowedOrigins = () => {
    const envOrigin = process.env.CORS_ORIGIN;
    
    // Si hay origen en variable de entorno, usarla
    if (envOrigin) {
        return envOrigin.split(',').map(origin => origin.trim());
    }
    
    // Origins por defecto para desarrollo
    return [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
    ];
};

// Función de validación de origen (mejora 3: seguridad + rendimiento)
// Implementa lista blanca para mayor seguridad
const corsOriginValidator = (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // En desarrollo, permitir si no hay origen (peticiones same-origin)
    if (!origin && process.env.NODE_ENV !== 'production') {
        return callback(null, true);
    }
    
    // Verificar si el origen está en la lista blanca
    if (allowedOrigins.includes(origin)) {
        return callback(null, true);
    }
    
    // En desarrollo, permitir cualquier origen
    if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
    }
    
    // En producción, rechazar orígenes no autorizados
    console.warn(`CORS: Origen rechazado: ${origin}`);
    return callback(new Error('Origen no permitido por CORS'), false);
};

// Opciones de CORS optimizadas (mejora 4: manejo de errores y edge cases)
const corsOptions = {
    // Función personalizada para validar origen
    origin: corsOriginValidator,
    
    // Métodos HTTP permitidos
    methods: ALLOWED_METHODS,
    
    // Headers permitidos
    allowedHeaders: ALLOWED_HEADERS,
    
    // Headers expuestos al cliente
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    
    // Permitir credenciales (cookies, headers de autenticación)
    credentials: true,
    
    // Tiempo de cache para preflight requests (mejora 2: rendimiento)
    maxAge: 86400, // 24 horas
    
    // Función para manejar errores de CORS
    optionsSuccessStatus: 200
};

// Aplicar middleware CORS
app.use(cors(corsOptions));

// ============================================
// FIN CONFIGURACIÓN DE CORS
// ============================================

// Middleware para parsear JSON
app.use(express.json());

// Middleware para parsear URL-encoded
app.use(express.urlencoded({ extended: true }));

// Importar rutas
const habitacionesRoutes = require('./routes/habitaciones.routes');
const serviciosRoutes = require('./routes/servicios.routes');
const clienteRoutes = require('./routes/clientes.routes');
const reservasRoutes = require('./routes/reservas.routes');

// Rutas de la API
app.use('/api/habitaciones', habitacionesRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/reservas', reservasRoutes);

// Ruta principal del backend API
app.get('/', (req, res) => {
    res.json({
        message: 'API de HOSPEDAJE_DIGITAL funcionando',
        endpoints: {
            habitaciones: '/api/habitaciones',
            servicios: '/api/servicios',
            clientes: '/api/clientes',
            reservas: '/api/reservas'
        }
    });
});

// Health check básico para monitoreo y smoke tests
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'hospedaje_digital_backend',
        timestamp: new Date().toISOString()
    });
});

// Ruta temporal para ver estructura de tablas
const db = require('./database/connection');
app.get('/api/debug/estructura', async (req, res) => {
    try {
        const [habitaciones] = await db.query('DESCRIBE habitacion');
        const [clientes] = await db.query('DESCRIBE cliente');
        const [reservas] = await db.query('DESCRIBE reserva');
        const [servicios] = await db.query('DESCRIBE servicio');
        res.json({
            habitacion: habitaciones,
            cliente: clientes,
            reserva: reservas,
            servicio: servicios
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
