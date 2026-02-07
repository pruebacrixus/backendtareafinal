const Joi = require('joi');

/**
 * Validación de registro de usuario
 */
const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email debe ser válido',
      'any.required': 'Email es obligatorio'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'Contraseña es obligatoria'
    }),
    nombre: Joi.string().min(2).max(255).required().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'any.required': 'Nombre es obligatorio'
    }),
    telefono: Joi.string().optional().allow('', null)
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details[0].message
      }
    });
  }
  
  next();
};

/**
 * Validación de login
 */
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details[0].message
      }
    });
  }
  
  next();
};

/**
 * Validación de creación de publicación
 */
const validateCreatePost = (req, res, next) => {
  const schema = Joi.object({
    titulo: Joi.string().min(5).max(255).required().messages({
      'string.min': 'El título debe tener al menos 5 caracteres',
      'any.required': 'Título es obligatorio'
    }),
    descripcion: Joi.string().min(20).required().messages({
      'string.min': 'La descripción debe tener al menos 20 caracteres',
      'any.required': 'Descripción es obligatoria'
    }),
    precio: Joi.number().positive().required().messages({
      'number.positive': 'El precio debe ser mayor a 0',
      'any.required': 'Precio es obligatorio'
    }),
    categoria: Joi.string().required().messages({
      'any.required': 'Categoría es obligatoria'
    }),
    estado: Joi.string().valid('nuevo', 'usado').required().messages({
      'any.only': 'Estado debe ser "nuevo" o "usado"',
      'any.required': 'Estado es obligatorio'
    }),
    ubicacion: Joi.string().optional().allow('', null)
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details[0].message
      }
    });
  }
  
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateCreatePost
};
