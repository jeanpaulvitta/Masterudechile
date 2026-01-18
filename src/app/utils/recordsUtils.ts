import type { Swimmer, PersonalBest } from "../data/swimmers";
import { calculateAge, calculateMasterCategory } from "./swimmerUtils";

// Convertir tiempo MM:SS.SS a segundos para comparación
export const timeToSeconds = (time: string): number => {
  const parts = time.split(":");
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return parseFloat(time);
};

// Verificar si una marca es récord del equipo
export const isTeamRecord = (
  swimmer: Swimmer,
  personalBest: PersonalBest,
  allSwimmers: Swimmer[]
): boolean => {
  if (!swimmer.gender || swimmer.gender === "Otro") return false;

  const age = calculateAge(swimmer.dateOfBirth);
  const category = calculateMasterCategory(age);

  // Encontrar todas las marcas de la misma categoría, género, distancia y estilo
  let bestTime = Infinity;
  
  allSwimmers.forEach((s) => {
    if (!s.gender || s.gender === "Otro" || s.gender !== swimmer.gender) return;
    
    const sAge = calculateAge(s.dateOfBirth);
    const sCategory = calculateMasterCategory(sAge);
    
    if (sCategory !== category) return;
    
    s.personalBests?.forEach((pb) => {
      if (
        pb.distance === personalBest.distance &&
        pb.style === personalBest.style
      ) {
        const pbSeconds = timeToSeconds(pb.time);
        if (pbSeconds < bestTime) {
          bestTime = pbSeconds;
        }
      }
    });
  });

  // Esta marca es récord si es igual al mejor tiempo encontrado
  return timeToSeconds(personalBest.time) === bestTime;
};

// Obtener el récord del equipo para una distancia/estilo/género/categoría específica
export const getTeamRecord = (
  distance: number,
  style: string,
  gender: "Masculino" | "Femenino",
  category: string,
  allSwimmers: Swimmer[]
): { swimmer: Swimmer; record: PersonalBest } | null => {
  let bestRecord: { swimmer: Swimmer; record: PersonalBest } | null = null;
  let bestTime = Infinity;

  allSwimmers.forEach((swimmer) => {
    if (!swimmer.gender || swimmer.gender === "Otro" || swimmer.gender !== gender) return;

    const age = calculateAge(swimmer.dateOfBirth);
    const swimmerCategory = calculateMasterCategory(age);

    if (swimmerCategory !== category) return;

    swimmer.personalBests?.forEach((pb) => {
      if (pb.distance === distance && pb.style === style) {
        const pbSeconds = timeToSeconds(pb.time);
        if (pbSeconds < bestTime) {
          bestTime = pbSeconds;
          bestRecord = { swimmer, record: pb };
        }
      }
    });
  });

  return bestRecord;
};
