import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logo source - La imagen de Figma que subiste
const logoSource = path.join(__dirname, '../src/imports/logo-master-uch.png');
const outputDir = path.join(__dirname, '../public/icons');

// Tamaños de íconos PWA necesarios
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log('🎨 Generador de Íconos PWA - Master UCH\n');
  
  // Verificar que existe el directorio de salida
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Verificar que existe la imagen fuente
  if (!fs.existsSync(logoSource)) {
    console.error(`❌ Error: No se encontró la imagen fuente en ${logoSource}`);
    console.log('\n💡 Asegúrate de que la imagen del logo existe en /src/imports/logo-master-uch.png');
    process.exit(1);
  }

  try {
    console.log('📂 Leyendo imagen del logo...');
    const image = sharp(logoSource);
    const metadata = await image.metadata();
    console.log(`✅ Logo cargado: ${metadata.width}x${metadata.height}px\n`);

    console.log('🔨 Generando íconos PNG en todos los tamaños...\n');

    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await image
        .clone()
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 51, b: 102, alpha: 1 } // Azul UCH #003366
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generado: icon-${size}x${size}.png`);
    }

    console.log('\n🎉 ¡Todos los íconos han sido generados exitosamente!\n');
    console.log('📁 Los archivos se guardaron en: /public/icons/\n');
    console.log('📋 Archivos generados:');
    sizes.forEach(size => {
      console.log(`   - icon-${size}x${size}.png`);
    });
    
    console.log('\n🚀 Próximos pasos:');
    console.log('   1. Revisa los íconos en /public/icons/');
    console.log('   2. Haz commit de los cambios');
    console.log('   3. Push a tu repositorio');
    console.log('   4. Vercel desplegará automáticamente');
    console.log('   5. ¡Tu PWA estará lista para instalarse! 🎊\n');

  } catch (error) {
    console.error('\n❌ Error al generar los íconos:', error);
    process.exit(1);
  }
}

generateIcons();
