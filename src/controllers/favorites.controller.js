const pool = require('../config/database');

const getAllFavorites = async (req, res) => {
  try {
    const result = await pool.query(`SELECT f.id, f.created_at, p.id as post_id, p.titulo, p.precio, p.categoria, 
      u.id as seller_id, u.nombre as seller_nombre, pi.image_url as imagen_principal 
      FROM favorites f INNER JOIN posts p ON f.post_id = p.id INNER JOIN users u ON p.user_id = u.id 
      LEFT JOIN post_images pi ON p.id = pi.post_id AND pi.is_principal = true 
      WHERE f.user_id = $1 ORDER BY f.created_at DESC`, [req.user.id]);
    res.json({ success: true, data: { favorites: result.rows, total: result.rows.length }});
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'ERROR', message: 'Error al obtener favoritos' }});
  }
};

const addFavorite = async (req, res) => {
  try {
    const { post_id } = req.body;
    const postExists = await pool.query('SELECT id FROM posts WHERE id = $1 AND activo = true', [post_id]);
    if (postExists.rows.length === 0) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Publicación no encontrada' }});
    const alreadyFavorite = await pool.query('SELECT id FROM favorites WHERE user_id = $1 AND post_id = $2', [req.user.id, post_id]);
    if (alreadyFavorite.rows.length > 0) return res.status(409).json({ success: false, error: { code: 'ALREADY_FAVORITE', message: 'Ya está en favoritos' }});
    const result = await pool.query('INSERT INTO favorites (user_id, post_id) VALUES ($1, $2) RETURNING *', [req.user.id, post_id]);
    res.status(201).json({ success: true, message: 'Agregado a favoritos', data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'ERROR', message: 'Error' }});
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { post_id } = req.params;
    const result = await pool.query('DELETE FROM favorites WHERE user_id = $1 AND post_id = $2 RETURNING *', [req.user.id, post_id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No está en favoritos' }});
    res.json({ success: true, message: 'Eliminado de favoritos' });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'ERROR', message: 'Error' }});
  }
};

module.exports = { getAllFavorites, addFavorite, removeFavorite };
