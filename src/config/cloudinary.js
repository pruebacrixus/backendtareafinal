const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verificar configuración (opcional)
if (process.env.CLOUDINARY_CLOUD_NAME) {
  console.log('✅ Cloudinary configurado correctamente');
} else {
  console.log('⚠️  Cloudinary no configurado - las imágenes no se subirán a la nube');
}

module.exports = cloudinary;
