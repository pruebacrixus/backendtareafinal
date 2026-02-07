const request = require('supertest');
const app = require('../src/server');

describe('Pruebas de Favoritos - /api/favorites', () => {
  
  let authToken;
  let testPostId;
  const testEmail = `testfav${Date.now()}@example.com`;

  beforeAll(async () => {
    // Registrar usuario
    const usuario = {
      email: testEmail,
      password: 'password123',
      nombre: 'Usuario Test Favoritos'
    };

    const responseUser = await request(app)
      .post('/api/auth/register')
      .send(usuario);

    authToken = responseUser.body.data.token;

    // Crear una publicación de prueba
    const publicacion = {
      titulo: 'Publicación para Favoritos',
      descripcion: 'Test de favoritos',
      precio: 10000,
      categoria: 'Otros',
      estado: 'nuevo'
    };

    const responsePost = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .send(publicacion);

    testPostId = responsePost.body.data.id;
  });

  // TEST: Agregar a favoritos
  describe('POST /api/favorites', () => {
    
    test('Debe agregar publicación a favoritos (código 201)', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ post_id: testPostId });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    test('Debe fallar al agregar favorito duplicado (código 409)', async () => {
      const response = await request(app)
        .post('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ post_id: testPostId });

      expect(response.status).toBe(409);
    });
  });

  // TEST: Obtener favoritos
  describe('GET /api/favorites', () => {
    
    test('Debe retornar lista de favoritos (código 200)', async () => {
      const response = await request(app)
        .get('/api/favorites')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.favorites)).toBe(true);
    });
  });

  // TEST: Eliminar de favoritos
  describe('DELETE /api/favorites/:post_id', () => {
    
    test('Debe eliminar de favoritos (código 200)', async () => {
      const response = await request(app)
        .delete(`/api/favorites/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
