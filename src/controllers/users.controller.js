const pool = require('../config/database');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userQuery = await pool.query(
      'SELECT id, email, nombre, telefono, avatar_url, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Usuario no encontrado' }
      });
    }

    const statsQuery = await pool.query(
      `SELECT 
        COUNT(DISTINCT CASE WHEN p.activo = true THEN p.id END) as publicaciones_activas,
        COUNT(DISTINCT p.id) as total_publicaciones,
        COUNT(DISTINCT f.id) as favoritos
       FROM users u
       LEFT JOIN posts p ON u.id = p.user_id
       LEFT JOIN favorites f ON u.id = f.user_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
    );

    const user = userQuery.rows[0];
    const stats = statsQuery.rows[0] || { publicaciones_activas: 0, total_publicaciones: 0, favoritos: 0 };

    res.json({
      success: true,
      data: {
        ...user,
        estadisticas: {
          publicaciones_activas: parseInt(stats.publicaciones_activas) || 0,
          total_publicaciones: parseInt(stats.total_publicaciones) || 0,
          favoritos: parseInt(stats.favoritos) || 0
        }
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: { code: 'ERROR', message: 'Error al obtener perfil' }});
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, telefono, avatar_url } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET nombre = COALESCE($1, nombre),
           telefono = COALESCE($2, telefono),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, nombre, telefono, avatar_url`,
      [nombre, telefono, avatar_url, userId]
    );

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: { code: 'ERROR', message: 'Error al actualizar perfil' }});
  }
};

module.exports = { getProfile, updateProfile };
