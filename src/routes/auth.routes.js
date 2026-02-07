const express = require('express');
const router = express.Router();
const { register, login, verifyToken } = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middleware/validateData');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/verify', authenticateToken, verifyToken);

module.exports = router;
