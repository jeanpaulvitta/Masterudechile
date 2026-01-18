import type { Swimmer, AttendanceRecord, Competition } from "../data/swimmers";
import { ACHIEVEMENTS, type Achievement } from "../data/achievements";
import { isTeamRecord } from "./recordsUtils";
import { calculateAge } from "./swimmerUtils";

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string; // fecha en formato ISO
  progress: number; // progreso actual hacia el logro
}

// Calcular todos los logros desbloqueados de un nadador
export const calculateUnlockedAchievements = (
  swimmer: Swimmer,
  attendanceRecords: AttendanceRecord[],
  competitions: Competition[],
  allSwimmers: Swimmer[]
): UnlockedAchievement[] => {
  const unlocked: UnlockedAchievement[] = [];
  const now = new Date().toISOString();

  // Filtrar asistencias del nadador
  const swimmerAttendance = attendanceRecords.filter(
    (record) => record.swimmerId === swimmer.id && record.attended
  );

  // ===== ASISTENCIA =====
  const totalAttendance = swimmerAttendance.length;
  ACHIEVEMENTS.filter((a) => a.category === "asistencia").forEach((achievement) => {
    if (totalAttendance >= achievement.requirement) {
      unlocked.push({
        achievementId: achievement.id,
        unlockedAt: now,
        progress: totalAttendance,
      });
    }
  });

  // ===== RACHA =====
  // Contar entrenamientos en el último mes
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const recentAttendance = swimmerAttendance.filter(
    (record) => new Date(record.date) >= oneMonthAgo
  ).length;

  if (recentAttendance >= 10) {
    unlocked.push({
      achievementId: "streak_10",
      unlockedAt: now,
      progress: recentAttendance,
    });
  }
  if (recentAttendance >= 5) {
    unlocked.push({
      achievementId: "streak_5",
      unlockedAt: now,
      progress: recentAttendance,
    });
  }
  if (recentAttendance >= 3) {
    unlocked.push({
      achievementId: "streak_3",
      unlockedAt: now,
      progress: recentAttendance,
    });
  }

  // ===== RÉCORDS =====
  const teamRecordsCount =
    swimmer.personalBests?.filter((pb) =>
      isTeamRecord(swimmer, pb, allSwimmers)
    ).length || 0;

  ACHIEVEMENTS.filter((a) => a.category === "records").forEach((achievement) => {
    if (teamRecordsCount >= achievement.requirement) {
      unlocked.push({
        achievementId: achievement.id,
        unlockedAt: now,
        progress: teamRecordsCount,
      });
    }
  });

  // ===== COMPETENCIAS =====
  // Contar competencias donde el nadador participó
  const competitionsCount = competitions.filter((comp) =>
    comp.participants?.includes(swimmer.id)
  ).length;

  ACHIEVEMENTS.filter((a) => a.category === "competencias").forEach((achievement) => {
    if (competitionsCount >= achievement.requirement) {
      unlocked.push({
        achievementId: achievement.id,
        unlockedAt: now,
        progress: competitionsCount,
      });
    }
  });

  // ===== MEJORAS =====
  const uniqueImprovements = new Set<string>();
  swimmer.personalBestsHistory?.forEach((pb) => {
    if (pb.isPersonalBest) {
      uniqueImprovements.add(`${pb.distance}-${pb.style}`);
    }
  });
  const improvementsCount = uniqueImprovements.size;

  ACHIEVEMENTS.filter((a) => a.category === "mejoras").forEach((achievement) => {
    if (improvementsCount >= achievement.requirement) {
      unlocked.push({
        achievementId: achievement.id,
        unlockedAt: now,
        progress: improvementsCount,
      });
    }
  });

  // ===== VOLUMEN =====
  const totalVolume = swimmerAttendance.reduce(
    (sum, record) => sum + record.volumeCompleted,
    0
  );

  ACHIEVEMENTS.filter((a) => a.category === "volumen").forEach((achievement) => {
    if (totalVolume >= achievement.requirement) {
      unlocked.push({
        achievementId: achievement.id,
        unlockedAt: now,
        progress: totalVolume,
      });
    }
  });

  // ===== ESPECIALES =====
  // Primer día
  if (totalAttendance >= 1) {
    unlocked.push({
      achievementId: "special_first_day",
      unlockedAt: now,
      progress: 1,
    });
  }

  // Ficha completa
  if (
    swimmer.profileImage &&
    swimmer.personalBests &&
    swimmer.personalBests.length > 0
  ) {
    unlocked.push({
      achievementId: "special_complete_profile",
      unlockedAt: now,
      progress: 1,
    });
  }

  // Aniversario (1 año)
  const joinDate = new Date(swimmer.joinDate);
  const today = new Date();
  const daysSinceJoining = Math.floor(
    (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceJoining >= 365) {
    unlocked.push({
      achievementId: "special_1_year",
      unlockedAt: now,
      progress: daysSinceJoining,
    });
  }

  // Nadador completo (4 estilos)
  const uniqueStyles = new Set(
    swimmer.personalBests?.map((pb) => pb.style) || []
  );
  if (uniqueStyles.size >= 4) {
    unlocked.push({
      achievementId: "special_all_styles",
      unlockedAt: now,
      progress: uniqueStyles.size,
    });
  }

  return unlocked;
};

// Obtener progreso hacia un logro específico
export const getAchievementProgress = (
  achievement: Achievement,
  swimmer: Swimmer,
  attendanceRecords: AttendanceRecord[],
  competitions: Competition[],
  allSwimmers: Swimmer[]
): { current: number; required: number; percentage: number } => {
  let current = 0;

  const swimmerAttendance = attendanceRecords.filter(
    (record) => record.swimmerId === swimmer.id && record.attended
  );

  switch (achievement.category) {
    case "asistencia":
      current = swimmerAttendance.length;
      break;
    case "racha": {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      current = swimmerAttendance.filter(
        (record) => new Date(record.date) >= oneMonthAgo
      ).length;
      break;
    }
    case "records":
      current =
        swimmer.personalBests?.filter((pb) =>
          isTeamRecord(swimmer, pb, allSwimmers)
        ).length || 0;
      break;
    case "competencias":
      current = competitions.filter((comp) =>
        comp.participants?.includes(swimmer.id)
      ).length;
      break;
    case "mejoras": {
      const uniqueImprovements = new Set<string>();
      swimmer.personalBestsHistory?.forEach((pb) => {
        if (pb.isPersonalBest) {
          uniqueImprovements.add(`${pb.distance}-${pb.style}`);
        }
      });
      current = uniqueImprovements.size;
      break;
    }
    case "volumen":
      current = swimmerAttendance.reduce(
        (sum, record) => sum + record.volumeCompleted,
        0
      );
      break;
    case "especiales":
      if (achievement.id === "special_first_day") {
        current = swimmerAttendance.length > 0 ? 1 : 0;
      } else if (achievement.id === "special_complete_profile") {
        current =
          swimmer.profileImage &&
          swimmer.personalBests &&
          swimmer.personalBests.length > 0
            ? 1
            : 0;
      } else if (achievement.id === "special_1_year") {
        const joinDate = new Date(swimmer.joinDate);
        const today = new Date();
        current = Math.floor(
          (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      } else if (achievement.id === "special_all_styles") {
        const uniqueStyles = new Set(
          swimmer.personalBests?.map((pb) => pb.style) || []
        );
        current = uniqueStyles.size;
      }
      break;
  }

  const percentage = Math.min((current / achievement.requirement) * 100, 100);

  return {
    current,
    required: achievement.requirement,
    percentage,
  };
};

// Obtener logros recientes (últimos 7 días)
export const getRecentAchievements = (
  unlockedAchievements: UnlockedAchievement[],
  daysBack: number = 7
): UnlockedAchievement[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  return unlockedAchievements.filter(
    (ua) => new Date(ua.unlockedAt) >= cutoffDate
  );
};
