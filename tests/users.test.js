const request = require('supertest');
const app = require('../src/server');

describe('Pruebas de Usuarios - /api/users', () => {
  
  let authToken;
  const testEmail = `testuser${Date.now()}@example.com`;

  beforeAll(async () => {
    const usuario = {
      email: testEmail,
      password: 'password123',
      nombre: 'Usuario Test Profile'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(usuario);

    authToken = response.body.data.token;
  });

  // TEST: Obtener perfil de usuario (ruta protegida)
  describe('GET /api/users/profile', () => {
    
    test('Debe retornar perfil con autenticación (código 200)', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('nombre');
      expect(response.body.data).toHaveProperty('estadisticas');
    });

    test('Debe fallar sin autenticación (código 401)', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // TEST: Actualizar perfil
  describe('PUT /api/users/profile', () => {
    
    test('Debe actualizar perfil correctamente (código 200)', async () => {
      const datosActualizados = {
        nombre: 'Nombre Actualizado Test',
        telefono: '+56987654321'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(datosActualizados);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nombre).toBe(datosActualizados.nombre);
    });
  });
});
