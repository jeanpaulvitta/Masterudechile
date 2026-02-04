// Script para verificar entrenamientos de agosto 2026

// Simular la generación de fechas
const baseDate = new Date(2026, 2, 2); // 2 marzo 2026

console.log('=== VERIFICACIÓN ENTRENAMIENTOS AGOSTO 2026 ===\n');

// Calcular qué semanas caen en agosto 2026
for (let week = 1; week <= 44; week++) {
  const daysOffset = (week - 1) * 7;
  
  // LUNES
  const mondayDate = new Date(2026, 2, 2);
  mondayDate.setDate(mondayDate.getDate() + daysOffset);
  
  // MIÉRCOLES
  const wednesdayDate = new Date(2026, 2, 2);
  wednesdayDate.setDate(wednesdayDate.getDate() + daysOffset + 2);
  
  // VIERNES
  const fridayDate = new Date(2026, 2, 2);
  fridayDate.setDate(fridayDate.getDate() + daysOffset + 4);
  
  // Verificar si alguna fecha cae en agosto 2026
  const isAugust = (date) => date.getFullYear() === 2026 && date.getMonth() === 7; // mes 7 = agosto
  
  if (isAugust(mondayDate) || isAugust(wednesdayDate) || isAugust(fridayDate)) {
    console.log(`Semana ${week}:`);
    
    if (isAugust(mondayDate)) {
      console.log(`  Lunes: ${mondayDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}`);
    }
    if (isAugust(wednesdayDate)) {
      console.log(`  Miércoles: ${wednesdayDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}`);
    }
    if (isAugust(fridayDate)) {
      console.log(`  Viernes: ${fridayDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}`);
    }
    console.log('');
  }
}

console.log('\n=== FIN VERIFICACIÓN ===');
