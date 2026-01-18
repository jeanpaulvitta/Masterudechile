const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'data', 'workouts.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Dividir en líneas
const lines = content.split('\n');
let currentWeek = 0;
let modified = false;

// Procesar cada línea
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detectar comentario de semana
  const weekMatch = line.match(/\/\/\s*Semana\s+(\d+)/);
  if (weekMatch) {
    currentWeek = parseInt(weekMatch[1]);
    console.log(`Detectada semana ${currentWeek} en línea ${i + 1}`);
    continue;
  }
  
  // Detectar inicio de objeto de entrenamiento (línea que contiene solo "{")
  if (line.trim() === '{' && currentWeek > 0) {
    // Verificar si las siguientes líneas ya tienen "week:"
    let hasWeek = false;
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      if (lines[j].includes('week:')) {
        hasWeek = true;
        break;
      }
      if (lines[j].includes('date:')) {
        // Si encontramos date antes de week, significa que no tiene week
        break;
      }
    }
    
    // Si no tiene week, agregarlo
    if (!hasWeek) {
      // Buscar la siguiente línea que contiene "date:" y agregar "week:" antes
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].includes('date:')) {
          const indent = lines[j].match(/^\s*/)[0];
          lines.splice(j, 0, `${indent}week: ${currentWeek},`);
          modified = true;
          console.log(`Agregado week: ${currentWeek} en línea ${j + 1}`);
          break;
        }
      }
    }
  }
}

if (modified) {
  // Escribir el archivo modificado
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log('\n✅ Archivo actualizado exitosamente');
} else {
  console.log('\n✅ No se necesitaron modificaciones');
}
