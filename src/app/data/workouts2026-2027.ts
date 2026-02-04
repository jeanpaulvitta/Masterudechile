import type { Workout } from './workouts';

/**
 * Planificación completa de temporada 2026-2027
 * Macrociclo: Marzo 2026 - Enero 2027 (44 semanas)
 * Formato: 3 entrenamientos semanales (Lunes, Miércoles, Viernes)
 * Periodización ondulante con 7 bloques
 */

// Definición de bloques de entrenamiento
export const trainingBlocks = [
  {
    id: 1,
    name: 'Base técnica + aeróbica',
    color: 'blue',
    startDate: '2 de marzo',
    endDate: '10 de abril',
    weeks: 6,
    weekNumbers: [1, 2, 3, 4, 5, 6],
    objective: 'Eficiencia técnica + capacidad aeróbica',
    technicalFocus: 'Subacuáticos + alineación corporal',
  },
  {
    id: 2,
    name: 'Intensificación + velocidad',
    color: 'red',
    startDate: '13 de abril',
    endDate: '29 de mayo',
    weeks: 7,
    weekNumbers: [7, 8, 9, 10, 11, 12, 13],
    objective: 'Primer peak → Copa Ñuñoa + Santiago Deporte',
    technicalFocus: 'Frecuencia de brazada + salida de virajes',
  },
  {
    id: 3,
    name: 'Potencia + competencia',
    color: 'purple',
    startDate: '1 de junio',
    endDate: '10 de julio',
    weeks: 6,
    weekNumbers: [14, 15, 16, 17, 18, 19],
    objective: 'Peak → Nacional Invierno',
    technicalFocus: 'Potencia de patada',
  },
  {
    id: 4,
    name: 'Reacumulación + técnica',
    color: 'green',
    startDate: '13 de julio',
    endDate: '14 de agosto',
    weeks: 5,
    weekNumbers: [20, 21, 22, 23, 24],
    objective: 'Rebase técnico',
    technicalFocus: 'Eficiencia energética',
  },
  {
    id: 5,
    name: 'Intensificación 2',
    color: 'red',
    startDate: '17 de agosto',
    endDate: '9 de octubre',
    weeks: 8,
    weekNumbers: [25, 26, 27, 28, 29, 30, 31, 32],
    objective: 'Peak múltiple: LQBLO + Aguas Abiertas + Panamericano',
    technicalFocus: 'Velocidad específica de prueba',
  },
  {
    id: 6,
    name: 'Mantenimiento competitivo',
    color: 'yellow',
    startDate: '12 de octubre',
    endDate: '20 de noviembre',
    weeks: 6,
    weekNumbers: [33, 34, 35, 36, 37, 38],
    objective: 'Peak: Arica + Recoleta',
    technicalFocus: 'Calidad técnica bajo fatiga',
  },
  {
    id: 7,
    name: 'Taper final',
    color: 'blue',
    startDate: '23 de noviembre',
    endDate: '2 de enero 2027',
    weeks: 6,
    weekNumbers: [39, 40, 41, 42, 43, 44],
    objective: 'Peak final: Nacional Master',
    technicalFocus: 'Precisión y ritmo de competencia',
  },
];

// Feriados sin entrenamiento
export const holidays2026 = [
  { date: '2026-04-03', name: 'Viernes Santo', day: 'Viernes' },
  { date: '2026-05-01', name: 'Día del Trabajador', day: 'Viernes' },
  { date: '2026-06-29', name: 'San Pedro y San Pablo', day: 'Lunes' },
  { date: '2026-09-18', name: 'Fiestas Patrias', day: 'Viernes' },
  { date: '2026-09-19', name: 'Día de las Glorias del Ejército', day: 'Sábado' },
  { date: '2026-10-12', name: 'Día de la Raza', day: 'Lunes' },
  { date: '2026-12-08', name: 'Inmaculada Concepción', day: 'Martes' },
];

// Función para verificar si una fecha es feriado
function isHoliday(date: string): boolean {
  return holidays2026.some(h => h.date === date);
}

// Función para obtener el bloque de una semana
function getBlock(week: number) {
  return trainingBlocks.find(b => b.weekNumbers.includes(week)) || trainingBlocks[0];
}

// Plantillas de entrenamiento por intensidad
const workoutTemplates = {
  // LUNES - Técnica + Moderada (2500m)
  monday: (week: number, block: typeof trainingBlocks[0]) => ({
    distance: 2500,
    intensity: 'Moderada',
    warmup: `400m libre suave
8 x 25m alternando ejercicios técnicos
${block.technicalFocus}
200m patada suave`,
    mainSet: [
      '6 x 200m libre @ 3:30 (z2)',
      '4 x 100m técnica @ 2:00',
      '300m pull buoy respiración controlada',
    ],
    cooldown: '200m libre suave + estiramientos',
  }),

  // MIÉRCOLES - Mediana (2000m)
  wednesday: (week: number, block: typeof trainingBlocks[0]) => ({
    distance: 2000,
    intensity: 'Mediana',
    warmup: `300m libre progresivo
6 x 50m @ 1:00 (25m ejercicio + 25m libre)
Foco: ${block.technicalFocus}`,
    mainSet: [
      '5 x 200m @ 3:20 (z2-z3)',
      '4 x 50m velocidad @ 1:30 (z4)',
      '200m pull buoy técnica',
    ],
    cooldown: '200m suave alternando estilos',
  }),

  // VIERNES - Alta intensidad (1700m)
  friday: (week: number, block: typeof trainingBlocks[0]) => ({
    distance: 1700,
    intensity: 'Alta',
    warmup: `200m libre activación
8 x 25m progresivos
100m patada fuerte`,
    mainSet: [
      '8 x 100m @ 1:45 (z3-z4)',
      '4 x 50m sprint @ 2:00 (z5)',
      '200m técnica recuperación',
    ],
    cooldown: '100m muy suave',
  }),
};

// Ajustes de series según bloque
const blockAdjustments = {
  1: { // Base
    monday: {
      mainSet: [
        '6 x 200m libre @ 3:40 (z2) - ritmo sostenido',
        '4 x 100m ejercicios subacuáticos @ 2:10',
        '300m pull buoy enfocado en alineación corporal',
      ]
    },
    wednesday: {
      mainSet: [
        '5 x 200m @ 3:30 (z2) - técnica perfecta',
        '6 x 50m patada @ 1:15 - subacuáticos largos',
        '200m pull buoy bilateral',
      ]
    },
    friday: {
      mainSet: [
        '6 x 100m @ 1:50 (z3) - enfoque técnico',
        '8 x 25m sprint @ 0:40 - salidas perfectas',
        '300m técnica recuperación',
      ]
    }
  },
  2: { // Intensificación
    monday: {
      mainSet: [
        '4 x 300m @ 5:00 (z2-z3) - frecuencia de brazada',
        '6 x 100m @ 1:50 - virajes explosivos',
        '200m pull buoy velocidad',
      ]
    },
    wednesday: {
      mainSet: [
        '3 x 400m @ 6:30 (z3) - ritmo de competencia',
        '4 x 75m velocidad @ 2:00 (25m sprint + 50m activo)',
        '200m técnica',
      ]
    },
    friday: {
      mainSet: [
        '10 x 100m @ 1:40 (z4) - alta intensidad',
        '6 x 50m sprint @ 1:30 - máxima velocidad',
        '100m muy suave',
      ]
    }
  },
  3: { // Potencia
    monday: {
      mainSet: [
        '5 x 250m @ 4:00 (z3) - patada potente',
        '8 x 50m patada vertical @ 1:00',
        '200m pull buoy fuerte',
      ]
    },
    wednesday: {
      mainSet: [
        '4 x 300m @ 5:00 (z3-z4) - potencia sostenida',
        '6 x 50m sprint patada @ 1:15',
        '200m técnica',
      ]
    },
    friday: {
      mainSet: [
        '12 x 75m @ 1:30 (z4) - patada explosiva cada 25m',
        '4 x 50m all-out @ 2:00',
        '150m suave',
      ]
    }
  },
  4: { // Reacumulación
    monday: {
      mainSet: [
        '6 x 200m @ 3:30 (z2) - eficiencia máxima',
        '4 x 100m técnica perfecta @ 2:00',
        '300m pull respiración 3-5-7',
      ]
    },
    wednesday: {
      mainSet: [
        '5 x 200m @ 3:20 (z2) - contar brazadas',
        '6 x 50m @ 1:10 - mínimas brazadas',
        '200m técnica bilateral',
      ]
    },
    friday: {
      mainSet: [
        '8 x 100m @ 1:45 (z3) - economía de movimiento',
        '4 x 50m @ 1:20 - técnica bajo fatiga',
        '200m suave',
      ]
    }
  },
  5: { // Intensificación 2
    monday: {
      mainSet: [
        '4 x 400m @ 6:30 (z3) - ritmo de prueba específico',
        '4 x 100m @ 1:45 - velocidad de competencia',
        '200m recuperación activa',
      ]
    },
    wednesday: {
      mainSet: [
        '6 x 200m @ 3:10 (z3-z4) - simulación de prueba',
        '4 x 75m sprint @ 2:00 - velocidad específica',
        '200m técnica',
      ]
    },
    friday: {
      mainSet: [
        '10 x 100m @ 1:35 (z4-z5) - máxima intensidad',
        '8 x 50m all-out @ 1:30',
        '100m muy suave',
      ]
    }
  },
  6: { // Mantenimiento competitivo
    monday: {
      mainSet: [
        '5 x 300m @ 4:45 (z3) - calidad técnica',
        '6 x 75m @ 1:30 - técnica bajo presión',
        '200m pull buoy controlado',
      ]
    },
    wednesday: {
      mainSet: [
        '4 x 250m @ 4:00 (z3) - mantener forma bajo fatiga',
        '8 x 50m @ 1:00 - calidad en cada repetición',
        '200m técnica perfecta',
      ]
    },
    friday: {
      mainSet: [
        '8 x 100m @ 1:40 (z4) - intensidad controlada',
        '6 x 50m sprint @ 1:30 - técnica impecable',
        '200m suave',
      ]
    }
  },
  7: { // Taper
    monday: {
      mainSet: [
        '4 x 200m @ 3:20 (z2-z3) - precisión técnica',
        '4 x 100m @ 1:50 - ritmo de competencia',
        '200m pull suave',
      ]
    },
    wednesday: {
      mainSet: [
        '3 x 200m @ 3:30 (z2) - calidad sobre cantidad',
        '6 x 50m @ 1:10 - velocidad fresca',
        '200m técnica refinada',
      ]
    },
    friday: {
      mainSet: [
        '6 x 100m @ 1:45 (z3) - sensación de competencia',
        '4 x 50m sprint @ 2:00 - máxima calidad',
        '200m recuperación',
      ]
    }
  }
};

// Generar entrenamientos para toda la temporada
export const workouts2026_2027: Omit<Workout, 'id'>[] = [];

// Fecha base: 2 de marzo de 2026 (Lunes)
const baseDate = new Date(2026, 2, 2); // Año, Mes (0-indexed, 2=marzo), Día

// Función para formatear fecha correctamente en español
function formatDate(date: Date): string {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return `${date.getDate()} de ${months[date.getMonth()]}`;
}

// Función para obtener fecha ISO sin problemas de zona horaria
function getISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Iterar por cada semana (44 semanas)
for (let week = 1; week <= 44; week++) {
  const block = getBlock(week);
  const blockId = block.id;
  
  // Calcular días de la semana
  const daysOffset = (week - 1) * 7;
  
  // LUNES
  const mondayDate = new Date(2026, 2, 2); // 2 marzo 2026 (mes 2 = marzo, 0-indexed)
  mondayDate.setDate(mondayDate.getDate() + daysOffset);
  const mondayISO = getISODate(mondayDate);
  
  if (!isHoliday(mondayISO)) {
    const mondayTemplate = workoutTemplates.monday(week, block);
    const mondayAdjustments = blockAdjustments[blockId as keyof typeof blockAdjustments]?.monday;
    
    workouts2026_2027.push({
      week,
      date: formatDate(mondayDate),
      day: 'Lunes',
      schedule: 'AM',
      mesociclo: block.name,
      distance: mondayTemplate.distance,
      duration: 75,
      intensity: mondayTemplate.intensity,
      warmup: mondayTemplate.warmup,
      mainSet: mondayAdjustments?.mainSet || mondayTemplate.mainSet,
      cooldown: mondayTemplate.cooldown,
    });
  }
  
  // MIÉRCOLES
  const wednesdayDate = new Date(2026, 2, 2); // 2 marzo 2026
  wednesdayDate.setDate(wednesdayDate.getDate() + daysOffset + 2);
  const wednesdayISO = getISODate(wednesdayDate);
  
  if (!isHoliday(wednesdayISO)) {
    const wednesdayTemplate = workoutTemplates.wednesday(week, block);
    const wednesdayAdjustments = blockAdjustments[blockId as keyof typeof blockAdjustments]?.wednesday;
    
    workouts2026_2027.push({
      week,
      date: formatDate(wednesdayDate),
      day: 'Miércoles',
      schedule: 'AM',
      mesociclo: block.name,
      distance: wednesdayTemplate.distance,
      duration: 65,
      intensity: wednesdayTemplate.intensity,
      warmup: wednesdayTemplate.warmup,
      mainSet: wednesdayAdjustments?.mainSet || wednesdayTemplate.mainSet,
      cooldown: wednesdayTemplate.cooldown,
    });
  }
  
  // VIERNES
  const fridayDate = new Date(2026, 2, 2); // 2 marzo 2026
  fridayDate.setDate(fridayDate.getDate() + daysOffset + 4);
  const fridayISO = getISODate(fridayDate);
  
  if (!isHoliday(fridayISO)) {
    const fridayTemplate = workoutTemplates.friday(week, block);
    const fridayAdjustments = blockAdjustments[blockId as keyof typeof blockAdjustments]?.friday;
    
    workouts2026_2027.push({
      week,
      date: formatDate(fridayDate),
      day: 'Viernes',
      schedule: 'AM',
      mesociclo: block.name,
      distance: fridayTemplate.distance,
      duration: 60,
      intensity: fridayTemplate.intensity,
      warmup: fridayTemplate.warmup,
      mainSet: fridayAdjustments?.mainSet || fridayTemplate.mainSet,
      cooldown: fridayTemplate.cooldown,
    });
  }
}

console.log(`📅 Generados ${workouts2026_2027.length} entrenamientos para temporada 2026-2027`);
console.log(`📊 Bloques:`, trainingBlocks.map(b => `${b.name} (${b.weeks} sem)`).join(' → '));
console.log(`🚫 Feriados excluidos: ${holidays2026.length}`);

// 🔍 DEBUG: Verificar entrenamientos de AGOSTO 2026
const agostoEntrenamientos = workouts2026_2027.filter(w => w.date.toLowerCase().includes('agosto'));
console.log(`🔍 AGOSTO 2026 - Entrenamientos generados: ${agostoEntrenamientos.length}`);
if (agostoEntrenamientos.length > 0) {
  console.log(`📋 Ejemplos AGOSTO:`, agostoEntrenamientos.slice(0, 5).map(w => ({
    week: w.week,
    date: w.date,
    day: w.day,
    schedule: w.schedule,
    mesociclo: w.mesociclo
  })));
}
console.log(`📅 Rango de semanas generadas: ${Math.min(...workouts2026_2027.map(w => w.week))} - ${Math.max(...workouts2026_2027.map(w => w.week))}`);