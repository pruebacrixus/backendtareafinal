const request = require('supertest');
const app = require('../src/server');

// Tests de las rutas de publicaciones
describe('Pruebas de Publicaciones - /api/posts', () => {
  
  let authToken;
  let testPostId;
  const testEmail = `testposts${Date.now()}@example.com`;

  // Antes de todos los tests, creamos un usuario y obtenemos su token
  beforeAll(async () => {
    const usuario = {
      email: testEmail,
      password: 'password123',
      nombre: 'Usuario Test Posts'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(usuario);

    authToken = response.body.data.token;
  });

  // ==========================================
  // TEST 4: Obtener todas las publicaciones
  // ==========================================
  describe('GET /api/posts', () => {
    
    test('Debe retornar lista de publicaciones (código 200)', async () => {
      const response = await request(app)
        .get('/api/posts');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('posts');
      expect(Array.isArray(response.body.data.posts)).toBe(true);
      
      // Verificamos estructura de paginación
      expect(response.body.data).toHaveProperty('pagination');
    });

    test('Debe retornar publicaciones filtradas por categoría', async () => {
      const response = await request(app)
        .get('/api/posts?categoria=Electrónica');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Debe retornar publicaciones con límite de resultados', async () => {
      const response = await request(app)
        .get('/api/posts?limit=5');

      expect(response.status).toBe(200);
      expect(response.body.data.posts.length).toBeLessThanOrEqual(5);
    });
  });

  // ==========================================
  // TEST 5: Crear publicación (ruta protegida)
  // ==========================================
  describe('POST /api/posts', () => {
    
    test('Debe crear publicación con autenticación (código 201)', async () => {
      const nuevaPublicacion = {
        titulo: 'Laptop de Prueba Test',
        descripcion: 'Esta es una laptop de prueba para el testing automatizado',
        precio: 450000,
        categoria: 'Electrónica',
        estado: 'usado',
        ubicacion: 'Santiago, Chile'
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(nuevaPublicacion);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.titulo).toBe(nuevaPublicacion.titulo);
      
      // Guardamos el ID para tests posteriores
      testPostId = response.body.data.id;
    });

    test('Debe fallar sin autenticación (código 401)', async () => {
      const publicacion = {
        titulo: 'Publicación sin auth',
        descripcion: 'Test',
        precio: 1000,
        categoria: 'Otros',
        estado: 'nuevo'
      };

      const response = await request(app)
        .post('/api/posts')
        .send(publicacion);
      // No enviamos token

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('Debe fallar con datos incompletos (código 400)', async () => {
      const publicacionIncompleta = {
        titulo: 'Solo título'
        // Faltan campos requeridos
      };

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(publicacionIncompleta);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // TEST 6: Obtener publicación por ID
  // ==========================================
  describe('GET /api/posts/:id', () => {
    
    test('Debe retornar publicación específica (código 200)', async () => {
      // Usamos el ID de la publicación creada en el test anterior
      if (!testPostId) {
        // Si no hay ID, saltamos este test
        return;
      }

      const response = await request(app)
        .get(`/api/posts/${testPostId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testPostId);
      expect(response.body.data).toHaveProperty('titulo');
      expect(response.body.data).toHaveProperty('precio');
      expect(response.body.data).toHaveProperty('user');
    });

    test('Debe retornar 404 con ID inexistente', async () => {
      const response = await request(app)
        .get('/api/posts/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // ==========================================
  // TEST 7: Actualizar publicación (ruta protegida)
  // ==========================================
  describe('PUT /api/posts/:id', () => {
    
    test('Debe actualizar publicación propia (código 200)', async () => {
      if (!testPostId) return;

      const datosActualizados = {
        titulo: 'Título Actualizado Test',
        precio: 400000
      };

      const response = await request(app)
        .put(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(datosActualizados);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.titulo).toBe(datosActualizados.titulo);
    });

    test('Debe fallar sin autenticación (código 401)', async () => {
      if (!testPostId) return;

      const response = await request(app)
        .put(`/api/posts/${testPostId}`)
        .send({ titulo: 'Intento sin auth' });

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // TEST 8: Eliminar publicación (ruta protegida)
  // ==========================================
  describe('DELETE /api/posts/:id', () => {
    
    test('Debe eliminar publicación propia (código 200)', async () => {
      if (!testPostId) return;

      const response = await request(app)
        .delete(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Debe retornar 404 al intentar eliminar publicación ya eliminada', async () => {
      if (!testPostId) return;

      const response = await request(app)
        .delete(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
