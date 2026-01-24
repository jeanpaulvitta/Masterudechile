import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Usar el SVG existente como fuente
const svgSource = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

// Tamaños de íconos PWA necesarios
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log('🎨 Generador Automático de Íconos PWA - Master UCH\n');
  
  // Verificar que existe el directorio de salida
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Verificar que existe el SVG fuente
  if (!fs.existsSync(svgSource)) {
    console.error(`❌ Error: No se encontró el SVG en ${svgSource}`);
    console.log('\n💡 El archivo /public/icons/icon.svg debe existir con el logo oficial.');
    process.exit(1);
  }

  try {
    console.log('📂 Leyendo SVG del logo oficial...');
    const svgBuffer = fs.readFileSync(svgSource);
    console.log(`✅ SVG cargado correctamente\n`);

    console.log('🔨 Generando íconos PNG en todos los tamaños...\n');

    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparente
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generado: icon-${size}x${size}.png`);
    }

    console.log('\n🎉 ¡Todos los íconos PNG han sido generados exitosamente!\n');
    console.log('📁 Ubicación: /public/icons/\n');
    console.log('📋 Archivos creados:');
    sizes.forEach(size => {
      console.log(`   ✓ icon-${size}x${size}.png`);
    });
    
    console.log('\n🔍 Verificación:');
    console.log('   Tamaños críticos para PWA:');
    console.log('   ✓ 192x192 (Android estándar)');
    console.log('   ✓ 512x512 (Splash screens)');
    
    console.log('\n🚀 Próximos pasos:');
    console.log('   1. Revisa los íconos generados en /public/icons/');
    console.log('   2. git add public/icons/*.png');
    console.log('   3. git commit -m "🎨 Agregar íconos PNG PWA con logo oficial Master UCH"');
    console.log('   4. git push');
    console.log('   5. ¡Vercel desplegará automáticamente tu PWA! 🎊\n');
    
    console.log('💡 Tip: Puedes verificar la PWA en:');
    console.log('   Chrome DevTools → Application → Manifest\n');

  } catch (error) {
    console.error('\n❌ Error al generar los íconos:', error.message);
    console.error('\n📝 Detalles del error:', error);
    process.exit(1);
  }
}

generateIcons();
