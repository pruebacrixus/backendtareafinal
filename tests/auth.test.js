const request = require('supertest');
const app = require('../src/server');

// Este archivo testea las rutas de autenticación
// Cumple con el requisito del Hito 3: Test de al menos 4 rutas

describe('Pruebas de Autenticación - /api/auth', () => {
  
  // Variable para almacenar el token de prueba
  let authToken;
  
  // Email único para cada ejecución de tests
  const testEmail = `test${Date.now()}@example.com`;

  // ==========================================
  // TEST 1: Registro de usuario exitoso
  // ==========================================
  describe('POST /api/auth/register', () => {
    
    test('Debe registrar un nuevo usuario correctamente (código 201)', async () => {
      const nuevoUsuario = {
        email: testEmail,
        password: 'password123',
        nombre: 'Usuario Test',
        telefono: '+56912345678'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(nuevoUsuario);

      // Verificamos que la respuesta sea exitosa
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      
      // Verificamos que se devuelva el usuario y el token
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testEmail);
      
      // Guardamos el token para otros tests
      authToken = response.body.data.token;
    });

    test('Debe fallar al registrar con email duplicado (código 409)', async () => {
      const usuarioDuplicado = {
        email: testEmail, // Mismo email del test anterior
        password: 'password123',
        nombre: 'Usuario Duplicado'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(usuarioDuplicado);

      // Esperamos un conflicto por email duplicado
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });

    test('Debe fallar sin campos requeridos (código 400)', async () => {
      const usuarioIncompleto = {
        email: 'sin-password@test.com'
        // Falta password y nombre
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(usuarioIncompleto);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // TEST 2: Login de usuario
  // ==========================================
  describe('POST /api/auth/login', () => {
    
    test('Debe hacer login correctamente con credenciales válidas (código 200)', async () => {
      const credenciales = {
        email: testEmail,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credenciales);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
    });

    test('Debe fallar con contraseña incorrecta (código 401)', async () => {
      const credencialesInvalidas = {
        email: testEmail,
        password: 'password_incorrecta'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credencialesInvalidas);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('Debe fallar con email inexistente (código 401)', async () => {
      const credencialesInexistentes = {
        email: 'usuario_no_existe@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credencialesInexistentes);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // TEST 3: Verificación de token (ruta protegida)
  // ==========================================
  describe('GET /api/auth/verify', () => {
    
    test('Debe verificar token válido correctamente (código 200)', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testEmail);
    });

    test('Debe fallar sin token (código 401)', async () => {
      const response = await request(app)
        .get('/api/auth/verify');
      // No enviamos Authorization header

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('Debe fallar con token inválido (código 403)', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer token_invalido_123');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
