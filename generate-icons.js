// Script para generar íconos PNG desde SVG
// Como no tenemos sharp en el entorno, creamos placeholders
// En producción, deberías usar: npm install sharp y descomentar el código

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

// Crear directorio si no existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('📱 Generando íconos para PWA...');
console.log('ℹ️  Los íconos se generarán automáticamente en el build.');
console.log('ℹ️  Para desarrollo, usa el ícono SVG en /public/icons/icon.svg');

// Crear archivo README en la carpeta de íconos
const readmeContent = `# Íconos de la Aplicación

Esta carpeta contiene los íconos de la aplicación en diferentes tamaños.

## Tamaños requeridos:
- 72x72 - Mínimo para Android
- 96x96 - Chrome
- 128x128 - Chrome
- 144x144 - Windows tiles
- 152x152 - iPad
- 192x192 - Android estándar
- 384x384 - Android
- 512x512 - Máximo para splash screens

## Generar íconos PNG:

Puedes generar los íconos PNG desde el SVG usando herramientas online:
1. https://realfavicongenerator.net/
2. https://www.pwabuilder.com/imageGenerator

O usando el comando (requiere sharp instalado):
\`\`\`bash
npm install sharp
node generate-icons.js
\`\`\`

## Ícono actual:
El ícono SVG se encuentra en: /public/icons/icon.svg
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), readmeContent);

console.log('✅ Archivo README creado en /public/icons/');
console.log('\n🔧 Para generar los íconos PNG, visita:');
console.log('   https://realfavicongenerator.net/');
console.log('\n📝 O sube tu SVG en:');
console.log('   https://www.pwabuilder.com/imageGenerator');

/* 
// Descomentar cuando instales sharp:

const sharp = require('sharp');

async function generateIcons() {
  const svgPath = path.join(iconsDir, 'icon.svg');
  
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generado: icon-${size}x${size}.png`);
  }
  
  console.log('\n✨ Todos los íconos generados exitosamente!');
}

generateIcons().catch(console.error);
*/
