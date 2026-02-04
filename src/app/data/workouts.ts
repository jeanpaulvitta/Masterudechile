export interface Workout {
  id?: string;
  week: number;
  date: string;
  day: string;
  schedule?: "AM" | "PM"; // Horario del entrenamiento (mañana o tarde)
  mesociclo: string;
  distance: number;
  duration: number;
  warmup: string;
  mainSet: string[];
  cooldown: string;
  intensity: string;
  isChallenge?: boolean;
  challengeName?: string;
  deleted?: boolean;
  deletedAt?: string;
}

// Importar entrenamientos de la temporada 2026-2027
import { workouts2026_2027 } from './workouts2026-2027';

// Exportar los entrenamientos generados automáticamente
export const workouts: Workout[] = workouts2026_2027 as Workout[];
