// Cargar variables de entorno desde .env
require('dotenv').config();

const mysql = require('mysql2'); // importamos el modulo mysql2

// Obtenemos las variables de entorno con valores por defecto para desarrollo
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospedaje'
};

// creamos la conexion a la base de datos
const connection = mysql.createConnection(dbConfig);

// exportamos la conexion a la base de datos
module.exports = connection.promise(); 