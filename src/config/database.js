const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'marketplace_db',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  max: 20, // Máximo de conexiones
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Probar conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error al conectar a PostgreSQL:', err.stack);
    process.exit(1);
  } else {
    console.log('✅ Conexión exitosa a PostgreSQL');
    console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
    release();
  }
});

// Manejar errores de conexión
pool.on('error', (err, client) => {
  console.error('❌ Error inesperado en el cliente de PostgreSQL:', err);
});

module.exports = pool;
