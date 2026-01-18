export interface Swimmer {
  id: string;
  name: string;
  email: string;
  rut?: string; // Formato: 12.345.678-9 - Opcional para compatibilidad con nadadores existentes
  gender?: "Masculino" | "Femenino" | "Otro"; // Opcional para compatibilidad con nadadores existentes
  schedule: "7am" | "8am" | "9pm";
  dateOfBirth: string; // Formato YYYY-MM-DD
  joinDate: string;
  personalBests?: PersonalBest[];
  personalBestsHistory?: PersonalBestHistory[]; // Historial completo de todas las marcas
  profileImage?: string; // URL de la imagen de perfil (base64 o URL)
  goals?: SwimmerGoal[]; // Metas y objetivos del nadador
}

export interface PersonalBest {
  distance: number; // 50, 100, 200, 400, 800, 1500
  style: "Libre" | "Espalda" | "Pecho" | "Mariposa" | "Combinado";
  time: string; // Formato MM:SS.SS
  date: string; // Fecha de la marca
  location?: string; // Opcional: dónde se logró
}

// Historial completo de marcas personales para gráficos de progresión
export interface PersonalBestHistory {
  id: string; // ID único para cada entrada
  distance: number; // 50, 100, 200, 400, 800, 1500
  style: "Libre" | "Espalda" | "Pecho" | "Mariposa" | "Combinado";
  time: string; // Formato MM:SS.SS
  timeInSeconds: number; // Tiempo convertido a segundos para gráficos
  date: string; // Fecha de la marca
  location?: string; // Opcional: dónde se logró
  isPersonalBest?: boolean; // Si esta marca fue récord personal en su momento
}

export interface AttendanceRecord {
  swimmerId: string;
  date: string;
  attended: boolean;
  volumeCompleted: number; // metros completados
  volumeAssigned: number; // metros asignados
  notes?: string;
}

export interface Competition {
  id: string;
  name: string;
  week: number; // Semana del mesociclo donde ocurre la competencia
  startDate: string; // Fecha de inicio (formato YYYY-MM-DD)
  endDate: string; // Fecha de fin (formato YYYY-MM-DD)
  schedule: string; // Horarios (ej: "09:00 - 18:00")
  cost: string; // Valor de inscripción (ej: "$15.000")
  location: string; // Lugar (ej: "Centro Acuático Estadio Nacional")
  poolType: "25m" | "50m"; // Tipo de piscina
  type: "Local" | "Regional" | "Nacional" | "Internacional"; // Tipo de competencia
  events: string[]; // Pruebas disponibles (ej: ["50m Libre", "100m Espalda", "200m Combinado"])
  description?: string; // Descripción adicional opcional
}

export interface SwimmerCompetition {
  id: string;
  swimmerId: string;
  competitionId: string;
  participates: boolean; // Si el nadador participará en esta competencia
  events?: {
    event: string; // Ej: "50m Libre", "100m Pecho"
    time?: string; // Tiempo registrado (opcional hasta después de la competencia)
    position?: number; // Posición en la prueba (opcional)
    points?: number; // Puntos FINA si aplica (opcional)
  }[];
  notes?: string;
}

// Competencias iniciales - se cargarán desde el servidor
export const competitions: Competition[] = [];

// Iniciar con arrays vacíos - los datos se agregan dinámicamente
export const swimmers: Swimmer[] = [];
export const swimmerCompetitions: SwimmerCompetition[] = [];

export interface SwimmerGoal {
  id: string;
  distance: number; // 50, 100, 200, 400, 800, 1500
  style: "Libre" | "Espalda" | "Pecho" | "Mariposa" | "Combinado";
  targetTime: string; // Tiempo objetivo (formato MM:SS.SS)
  targetTimeInSeconds: number; // Tiempo objetivo en segundos
  targetDate: string; // Fecha objetivo (formato YYYY-MM-DD)
  createdAt: string; // Fecha de creación
  achieved: boolean; // Si ya se logró la meta
  achievedAt?: string; // Fecha en que se logró
  notes?: string; // Notas adicionales (ej: "Para el campeonato nacional")
}