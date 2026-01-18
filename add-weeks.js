// Script temporal para agregar propiedad week a workouts
const fs = require('fs');

const filePath = './src/app/data/workouts.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Agregar week: 3 a semana 3
for (let week = 3; week <= 20; week++) {
  const searchPattern = new RegExp(`(//\\s*Semana\\s*${week}[^\\n]*\\n\\s*{\\n)(\\s*)`, 'g');
  content = content.replace(searchPattern, `$1$2week: ${week},\n$2`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Week property added to all workouts!');
