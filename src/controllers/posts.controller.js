const pool = require('../config/database');
const cloudinary = require('../config/cloudinary');

const getAllPosts = async (req, res) => {
  try {
    const { categoria, precio_min, precio_max, page = 1, limit = 12 } = req.query;
    let query = `SELECT p.*, u.nombre as user_nombre, u.avatar_url as user_avatar, 
                 pi.image_url as imagen_principal FROM posts p
                 INNER JOIN users u ON p.user_id = u.id
                 LEFT JOIN post_images pi ON p.id = pi.post_id AND pi.is_principal = true
                 WHERE p.activo = true`;
    const params = [];
    let paramCount = 1;
    
    if (categoria) { query += ` AND p.categoria = $${paramCount}`; params.push(categoria); paramCount++; }
    if (precio_min) { query += ` AND p.precio >= $${paramCount}`; params.push(precio_min); paramCount++; }
    if (precio_max) { query += ` AND p.precio <= $${paramCount}`; params.push(precio_max); paramCount++; }
    
    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, (page - 1) * limit);
    
    const result = await pool.query(query, params);
    const countResult = await pool.query('SELECT COUNT(*) FROM posts WHERE activo = true');
    
    res.json({ success: true, data: { posts: result.rows, pagination: { current_page: parseInt(page), total_pages: Math.ceil(countResult.rows[0].count / limit), total_posts: parseInt(countResult.rows[0].count), posts_per_page: parseInt(limit) }}});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: { code: 'ERROR', message: 'Error al obtener publicaciones' }});
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const postQuery = await pool.query(`SELECT p.*, u.id as user_id, u.nombre as user_nombre, u.telefono as user_telefono, u.avatar_url as user_avatar FROM posts p INNER JOIN users u ON p.user_id = u.id WHERE p.id = $1 AND p.activo = true`, [id]);
    if (postQuery.rows.length === 0) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Publicación no encontrada' }});
    const imagesQuery = await pool.query('SELECT * FROM post_images WHERE post_id = $1 ORDER BY orden', [id]);
    const post = postQuery.rows[0];
    res.json({ success: true, data: { ...post, imagenes: imagesQuery.rows, user: { id: post.user_id, nombre: post.user_nombre, telefono: post.user_telefono, avatar_url: post.user_avatar }}});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'ERROR', message: 'Error al obtener publicación' }});
  }
};

const createPost = async (req, res) => {
  const client = await pool.connect();
  try {
    const { titulo, descripcion, precio, categoria, estado, ubicacion } = req.body;
    await client.query('BEGIN');
    const postResult = await client.query(`INSERT INTO posts (user_id, titulo, descripcion, precio, categoria, estado, ubicacion) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [req.user.id, titulo, descripcion, precio, categoria, estado, ubicacion || null]);
    const post = postResult.rows[0];
    const imagenes = [];
    if (req.files && req.files.imagenes) {
      const files = Array.isArray(req.files.imagenes) ? req.files.imagenes : [req.files.imagenes];
      for (let i = 0; i < files.length; i++) {
        const uploadResult = await cloudinary.uploader.upload(files[i].tempFilePath, { folder: 'marketplace' });
        const imageResult = await client.query(`INSERT INTO post_images (post_id, image_url, is_principal, orden) VALUES ($1, $2, $3, $4) RETURNING *`, [post.id, uploadResult.secure_url, i === 0, i + 1]);
        imagenes.push(imageResult.rows[0]);
      }
    }
    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Publicación creada', data: { ...post, imagenes }});
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: { code: 'ERROR', message: 'Error al crear publicación' }});
  } finally {
    client.release();
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, precio, activo } = req.body;
    const checkOwner = await pool.query('SELECT user_id FROM posts WHERE id = $1', [id]);
    if (checkOwner.rows.length === 0) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Publicación no encontrada' }});
    if (checkOwner.rows[0].user_id !== req.user.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'No tienes permiso' }});
    const result = await pool.query(`UPDATE posts SET titulo = COALESCE($1, titulo), descripcion = COALESCE($2, descripcion), precio = COALESCE($3, precio), activo = COALESCE($4, activo), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *`, [titulo, descripcion, precio, activo, id]);
    res.json({ success: true, message: 'Publicación actualizada', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'ERROR', message: 'Error al actualizar' }});
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const checkOwner = await pool.query('SELECT user_id FROM posts WHERE id = $1', [id]);
    if (checkOwner.rows.length === 0) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Publicación no encontrada' }});
    if (checkOwner.rows[0].user_id !== req.user.id) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'No tienes permiso' }});
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ success: true, message: 'Publicación eliminada' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'ERROR', message: 'Error al eliminar' }});
  }
};

const getMyPosts = async (req, res) => {
  try {
    const result = await pool.query(`SELECT p.*, pi.image_url as imagen_principal FROM posts p LEFT JOIN post_images pi ON p.id = pi.post_id AND pi.is_principal = true WHERE p.user_id = $1 ORDER BY p.created_at DESC`, [req.user.id]);
    res.json({ success: true, data: { posts: result.rows, total: result.rows.length }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'ERROR', message: 'Error' }});
  }
};

module.exports = { getAllPosts, getPostById, createPost, updatePost, deletePost, getMyPosts };
