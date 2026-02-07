const express = require('express');
const router = express.Router();
const { getAllFavorites, addFavorite, removeFavorite } = require('../controllers/favorites.controller');
const { authenticateToken } = require('../middleware/auth');
router.get('/', authenticateToken, getAllFavorites);
router.post('/', authenticateToken, addFavorite);
router.delete('/:post_id', authenticateToken, removeFavorite);
module.exports = router;
