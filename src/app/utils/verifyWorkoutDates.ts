/**
 * Script de verificación de fechas de entrenamientos
 * Verifica que todos los entrenamientos caigan en los días correctos
 */

// Función para verificar si una fecha es el día de la semana esperado
export function verifyWorkoutDates() {
  const results: string[] = [];
  
  // 2 de marzo de 2026 es Lunes (día 1)
  const baseDate = new Date(2026, 2, 2); // marzo = índice 2
  
  results.push('🔍 VERIFICACIÓN DE FECHAS DE TEMPORADA 2026-2027');
  results.push('================================================\n');
  
  // Verificar fecha base
  const baseDayName = baseDate.toLocaleDateString('es-ES', { weekday: 'long' });
  results.push(`📅 Fecha base: 2 de marzo de 2026`);
  results.push(`   Día: ${baseDayName}`);
  results.push(`   Esperado: lunes`);
  results.push(`   ${baseDayName === 'lunes' ? '✅ CORRECTO' : '❌ ERROR'}\n`);
  
  // Verificar primeras 3 semanas
  results.push('📊 VERIFICACIÓN SEMANA POR SEMANA (primeras 3 semanas):\n');
  
  for (let week = 1; week <= 3; week++) {
    const daysOffset = (week - 1) * 7;
    
    results.push(`--- Semana ${week} ---`);
    
    // Lunes
    const monday = new Date(2026, 2, 2);
    monday.setDate(2 + daysOffset);
    const mondayName = monday.toLocaleDateString('es-ES', { weekday: 'long' });
    const mondayDate = monday.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    results.push(`  Lunes: ${mondayDate} → ${mondayName} ${mondayName === 'lunes' ? '✅' : '❌'}`);
    
    // Miércoles
    const wednesday = new Date(2026, 2, 2);
    wednesday.setDate(2 + daysOffset + 2);
    const wednesdayName = wednesday.toLocaleDateString('es-ES', { weekday: 'long' });
    const wednesdayDate = wednesday.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    results.push(`  Miércoles: ${wednesdayDate} → ${wednesdayName} ${wednesdayName === 'miércoles' ? '✅' : '❌'}`);
    
    // Viernes
    const friday = new Date(2026, 2, 2);
    friday.setDate(2 + daysOffset + 4);
    const fridayName = friday.toLocaleDateString('es-ES', { weekday: 'long' });
    const fridayDate = friday.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    results.push(`  Viernes: ${fridayDate} → ${fridayName} ${fridayName === 'viernes' ? '✅' : '❌'}\n`);
  }
  
  // Verificar fechas clave de la temporada
  results.push('🎯 FECHAS CLAVE DE LA TEMPORADA:\n');
  
  const keyDates = [
    { week: 1, day: 'Lunes', expected: '2 de marzo de 2026' },
    { week: 6, day: 'Viernes', expected: 'último entrenamiento del Bloque 1' },
    { week: 7, day: 'Lunes', expected: 'inicio del Bloque 2 (20 de abril aprox)' },
    { week: 44, day: 'Viernes', expected: 'último entrenamiento de la temporada (enero 2027)' },
  ];
  
  keyDates.forEach(({ week, day, expected }) => {
    const daysOffset = (week - 1) * 7;
    const dayOffset = day === 'Lunes' ? 0 : day === 'Miércoles' ? 2 : 4;
    const date = new Date(2026, 2, 2);
    date.setDate(2 + daysOffset + dayOffset);
    const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    results.push(`  Semana ${week} ${day}: ${dateStr} (${expected})`);
  });
  
  results.push('\n✅ Verificación completada');
  
  return results.join('\n');
}

// Ejecutar verificación automáticamente al importar
const verificationResults = verifyWorkoutDates();
console.log(verificationResults);

export default verificationResults;
