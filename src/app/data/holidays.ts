export interface Holiday {
  id?: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: 'feriado' | 'vacaciones' | 'suspension'; // Tipo de día sin actividad
  description?: string;
  isRecurring?: boolean; // Si se repite cada año
}

export const defaultHolidays: Holiday[] = [
  // Feriados nacionales de Chile (2026)
  {
    date: '2026-01-01',
    name: 'Año Nuevo',
    type: 'feriado',
    description: 'Año Nuevo',
    isRecurring: true
  },
  {
    date: '2026-04-03',
    name: 'Viernes Santo',
    type: 'feriado',
    description: 'Semana Santa',
    isRecurring: false
  },
  {
    date: '2026-04-04',
    name: 'Sábado Santo',
    type: 'feriado',
    description: 'Semana Santa',
    isRecurring: false
  },
  {
    date: '2026-05-01',
    name: 'Día del Trabajo',
    type: 'feriado',
    description: 'Día del Trabajador',
    isRecurring: true
  },
  {
    date: '2026-05-21',
    name: 'Día de las Glorias Navales',
    type: 'feriado',
    description: 'Día de las Glorias Navales',
    isRecurring: true
  },
  {
    date: '2026-06-29',
    name: 'San Pedro y San Pablo',
    type: 'feriado',
    description: 'Feriado religioso',
    isRecurring: false
  },
  {
    date: '2026-07-16',
    name: 'Día de la Virgen del Carmen',
    type: 'feriado',
    description: 'Feriado religioso',
    isRecurring: true
  },
  {
    date: '2026-09-18',
    name: 'Fiestas Patrias',
    type: 'feriado',
    description: 'Día de la Independencia',
    isRecurring: true
  },
  {
    date: '2026-09-19',
    name: 'Fiestas Patrias',
    type: 'feriado',
    description: 'Día de las Glorias del Ejército',
    isRecurring: true
  },
  {
    date: '2026-10-12',
    name: 'Día del Descubrimiento',
    type: 'feriado',
    description: 'Encuentro de Dos Mundos',
    isRecurring: false
  },
  {
    date: '2026-12-25',
    name: 'Navidad',
    type: 'feriado',
    description: 'Navidad',
    isRecurring: true
  },
  
  // Vacaciones y suspensiones (específicas para la temporada)
  {
    date: '2026-01-02',
    name: 'Vacaciones de Verano',
    type: 'vacaciones',
    description: 'Período de descanso post-año nuevo',
    isRecurring: false
  },
  {
    date: '2026-02-14',
    name: 'Receso de Verano',
    type: 'vacaciones',
    description: 'Semana de descanso antes del inicio de la temporada',
    isRecurring: false
  },
  {
    date: '2026-02-21',
    name: 'Receso de Verano',
    type: 'vacaciones',
    description: 'Semana de descanso antes del inicio de la temporada',
    isRecurring: false
  }
];
