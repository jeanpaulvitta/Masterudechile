import type { Swimmer, SwimmerGoal, PersonalBest, PersonalBestHistory } from "../data/swimmers";

// Convertir tiempo MM:SS.SS a segundos
export function timeToSeconds(time: string): number {
  const parts = time.split(":");
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return parseFloat(time);
}

// Convertir segundos a formato MM:SS.SS
export function secondsToTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  return `${minutes}:${secs.padStart(5, "0")}`;
}

// Obtener la marca personal actual para una distancia/estilo específico
export function getCurrentPersonalBest(
  swimmer: Swimmer,
  distance: number,
  style: string
): PersonalBest | null {
  if (!swimmer.personalBests || !Array.isArray(swimmer.personalBests)) return null;
  
  return (
    swimmer.personalBests.find(
      (pb) => pb.distance === distance && pb.style === style
    ) || null
  );
}

// Calcular el progreso hacia una meta
export interface GoalProgress {
  goal: SwimmerGoal;
  currentTime: number | null; // en segundos
  targetTime: number; // en segundos
  improvement: number; // segundos que necesita mejorar (positivo = falta mejorar, negativo = ya superó)
  improvementPercentage: number; // % de mejora necesaria
  progressPercentage: number; // % de progreso hacia la meta (0-100)
  status: "achieved" | "on-track" | "needs-improvement" | "no-baseline";
  daysRemaining: number;
  projectedDate: string | null; // Fecha proyectada para alcanzar la meta
  averageImprovementNeeded: number; // Mejora promedio por semana necesaria (en segundos)
}

export function calculateGoalProgress(
  goal: SwimmerGoal,
  swimmer: Swimmer
): GoalProgress {
  const currentPB = getCurrentPersonalBest(swimmer, goal.distance, goal.style);
  const currentTime = currentPB ? timeToSeconds(currentPB.time) : null;
  const targetTime = goal.targetTimeInSeconds;

  // Calcular días restantes
  const today = new Date();
  const targetDate = new Date(goal.targetDate);
  const daysRemaining = Math.max(
    0,
    Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Si no hay marca actual, no podemos calcular progreso
  if (!currentTime) {
    return {
      goal,
      currentTime: null,
      targetTime,
      improvement: 0,
      improvementPercentage: 0,
      progressPercentage: 0,
      status: "no-baseline",
      daysRemaining,
      projectedDate: null,
      averageImprovementNeeded: 0,
    };
  }

  // Calcular mejora necesaria
  const improvement = currentTime - targetTime;
  const improvementPercentage = (improvement / currentTime) * 100;

  // Calcular progreso
  let progressPercentage = 0;
  if (improvement <= 0) {
    // Ya alcanzó o superó la meta
    progressPercentage = 100;
  } else {
    // Calcular progreso basado en la mejora histórica
    const history = swimmer.personalBestsHistory?.filter(
      (h) => h.distance === goal.distance && h.style === goal.style
    );

    if (history && history.length >= 2) {
      // Ordenar por fecha
      const sortedHistory = [...history].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Calcular mejora desde la marca inicial hasta ahora
      const initialTime = sortedHistory[0].timeInSeconds;
      const totalImprovementNeeded = initialTime - targetTime;
      const improvementSoFar = initialTime - currentTime;

      progressPercentage = Math.min(
        100,
        Math.max(0, (improvementSoFar / totalImprovementNeeded) * 100)
      );
    } else {
      // Sin historial, usar una estimación básica
      progressPercentage = Math.max(0, 100 - improvementPercentage);
    }
  }

  // Determinar estado
  let status: GoalProgress["status"] = "needs-improvement";
  if (improvement <= 0) {
    status = "achieved";
  } else if (progressPercentage >= 50) {
    status = "on-track";
  }

  // Proyectar fecha de logro basada en tendencia histórica
  let projectedDate: string | null = null;
  const history = swimmer.personalBestsHistory?.filter(
    (h) => h.distance === goal.distance && h.style === goal.style
  );

  if (history && history.length >= 2 && improvement > 0) {
    const sortedHistory = [...history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calcular tasa de mejora promedio (segundos por día)
    const firstRecord = sortedHistory[0];
    const lastRecord = sortedHistory[sortedHistory.length - 1];
    const timeDiff = lastRecord.timeInSeconds - firstRecord.timeInSeconds;
    const daysDiff =
      (new Date(lastRecord.date).getTime() -
        new Date(firstRecord.date).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysDiff > 0 && timeDiff < 0) {
      // Hay mejora
      const improvementRate = Math.abs(timeDiff) / daysDiff; // segundos por día
      const daysToGoal = improvement / improvementRate;
      const projectedDateObj = new Date();
      projectedDateObj.setDate(projectedDateObj.getDate() + daysToGoal);
      projectedDate = projectedDateObj.toISOString().split("T")[0];
    }
  }

  // Calcular mejora promedio necesaria por semana
  const weeksRemaining = Math.max(1, daysRemaining / 7);
  const averageImprovementNeeded = improvement > 0 ? improvement / weeksRemaining : 0;

  return {
    goal,
    currentTime,
    targetTime,
    improvement,
    improvementPercentage,
    progressPercentage: Math.round(progressPercentage),
    status,
    daysRemaining,
    projectedDate,
    averageImprovementNeeded,
  };
}

// Calcular todas las metas de un nadador
export function calculateAllGoalsProgress(
  swimmer: Swimmer
): GoalProgress[] {
  if (!swimmer.goals || !Array.isArray(swimmer.goals) || swimmer.goals.length === 0) return [];

  return swimmer.goals.map((goal) => calculateGoalProgress(goal, swimmer));
}

// Obtener metas activas (no alcanzadas y no vencidas)
export function getActiveGoals(swimmer: Swimmer): SwimmerGoal[] {
  if (!swimmer.goals || !Array.isArray(swimmer.goals)) return [];

  const today = new Date();
  return swimmer.goals.filter((goal) => {
    const targetDate = new Date(goal.targetDate);
    return !goal.achieved && targetDate >= today;
  });
}

// Obtener metas alcanzadas
export function getAchievedGoals(swimmer: Swimmer): SwimmerGoal[] {
  if (!swimmer.goals || !Array.isArray(swimmer.goals)) return [];
  return swimmer.goals.filter((goal) => goal.achieved);
}

// Obtener metas vencidas (no alcanzadas y fecha pasada)
export function getExpiredGoals(swimmer: Swimmer): SwimmerGoal[] {
  if (!swimmer.goals || !Array.isArray(swimmer.goals)) return [];

  const today = new Date();
  return swimmer.goals.filter((goal) => {
    const targetDate = new Date(goal.targetDate);
    return !goal.achieved && targetDate < today;
  });
}

// Verificar si una meta fue alcanzada y actualizar su estado
export function checkAndUpdateGoalAchievement(
  goal: SwimmerGoal,
  swimmer: Swimmer
): SwimmerGoal {
  if (goal.achieved) return goal; // Ya está marcada como alcanzada

  const currentPB = getCurrentPersonalBest(swimmer, goal.distance, goal.style);
  if (!currentPB) return goal;

  const currentTime = timeToSeconds(currentPB.time);
  const targetTime = goal.targetTimeInSeconds;

  if (currentTime <= targetTime) {
    // ¡Meta alcanzada!
    return {
      ...goal,
      achieved: true,
      achievedAt: currentPB.date,
    };
  }

  return goal;
}

// Actualizar todas las metas de un nadador verificando logros
export function updateGoalsAchievements(swimmer: Swimmer): Swimmer {
  if (!swimmer.goals || !Array.isArray(swimmer.goals) || swimmer.goals.length === 0) return swimmer;

  const updatedGoals = swimmer.goals.map((goal) =>
    checkAndUpdateGoalAchievement(goal, swimmer)
  );

  return {
    ...swimmer,
    goals: updatedGoals,
  };
}

// Obtener sugerencias de metas basadas en marcas actuales
export function suggestGoals(swimmer: Swimmer): {
  distance: number;
  style: string;
  currentTime: string;
  suggestedTarget: string;
  improvementPercentage: number;
}[] {
  if (!swimmer.personalBests || !Array.isArray(swimmer.personalBests) || swimmer.personalBests.length === 0) return [];

  const suggestions = swimmer.personalBests.map((pb) => {
    const currentSeconds = timeToSeconds(pb.time);
    // Sugerir mejora del 3-5% (realista para natación)
    const improvementPercent = 0.04; // 4%
    const targetSeconds = currentSeconds * (1 - improvementPercent);
    const suggestedTarget = secondsToTime(targetSeconds);

    return {
      distance: pb.distance,
      style: pb.style,
      currentTime: pb.time,
      suggestedTarget,
      improvementPercentage: improvementPercent * 100,
    };
  });

  return suggestions;
}