// Configuración para el entorno de testing
process.env.NODE_ENV = 'test';
process.env.PORT = 3001;
process.env.JWT_SECRET = 'test_secret_key_for_testing_only';

// Configuración de base de datos para tests
// IMPORTANTE: Usar una base de datos diferente para tests
process.env.DB_NAME = 'marketplace_test';
process.env.DB_USER = 'postgres';
process.env.DB_HOST = 'localhost';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_PORT = 5432;

module.exports = {
  testTimeout: 10000 // 10 segundos de timeout para cada test
};
