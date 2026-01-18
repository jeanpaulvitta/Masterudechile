import type { Swimmer } from "../data/swimmers";

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  sessionDate: string;
  sessionType: "workout" | "challenge";
  swimmerId: string;
  status: "presente" | "ausente" | "justificado";
  notes?: string;
  timestamp: number;
}

// Estadísticas de asistencia por nadador
export interface SwimmerAttendanceStats {
  swimmerId: string;
  swimmerName: string;
  totalSessions: number;
  attended: number;
  absent: number;
  justified: number;
  attendanceRate: number; // porcentaje
  currentStreak: number; // racha actual de asistencias consecutivas
  longestStreak: number; // racha más larga de asistencias
  lastAttendance: string | null; // fecha de última asistencia
  averageSessionsPerWeek: number;
  trend: "improving" | "stable" | "declining"; // tendencia de asistencia
}

// Calcular estadísticas de asistencia para un nadador
export function calculateSwimmerAttendanceStats(
  swimmer: Swimmer,
  attendanceRecords: AttendanceRecord[],
  totalSessions: number
): SwimmerAttendanceStats {
  const swimmerRecords = attendanceRecords
    .filter((r) => r.swimmerId === swimmer.id)
    .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());

  const attended = swimmerRecords.filter((r) => r.status === "presente").length;
  const absent = swimmerRecords.filter((r) => r.status === "ausente").length;
  const justified = swimmerRecords.filter((r) => r.status === "justificado").length;
  const attendanceRate = totalSessions > 0 ? (attended / totalSessions) * 100 : 0;

  // Calcular racha actual
  let currentStreak = 0;
  const sortedRecords = [...swimmerRecords].reverse(); // más recientes primero
  for (const record of sortedRecords) {
    if (record.status === "presente") {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calcular racha más larga
  let longestStreak = 0;
  let tempStreak = 0;
  for (const record of swimmerRecords) {
    if (record.status === "presente") {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Última asistencia
  const lastAttendanceRecord = swimmerRecords
    .filter((r) => r.status === "presente")
    .pop();
  const lastAttendance = lastAttendanceRecord ? lastAttendanceRecord.sessionDate : null;

  // Promedio de sesiones por semana
  if (swimmerRecords.length === 0) {
    return {
      swimmerId: swimmer.id,
      swimmerName: swimmer.name,
      totalSessions,
      attended,
      absent,
      justified,
      attendanceRate,
      currentStreak,
      longestStreak,
      lastAttendance,
      averageSessionsPerWeek: 0,
      trend: "stable",
    };
  }

  const firstDate = new Date(swimmerRecords[0].sessionDate);
  const lastDate = new Date(swimmerRecords[swimmerRecords.length - 1].sessionDate);
  const weeksDiff = Math.max(
    1,
    (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  const averageSessionsPerWeek = attended / weeksDiff;

  // Calcular tendencia (comparar últimas 4 semanas con las 4 anteriores)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  const eightWeeksAgo = new Date();
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

  const recentAttendance = swimmerRecords.filter(
    (r) =>
      r.status === "presente" &&
      new Date(r.sessionDate) >= fourWeeksAgo
  ).length;

  const previousAttendance = swimmerRecords.filter(
    (r) =>
      r.status === "presente" &&
      new Date(r.sessionDate) >= eightWeeksAgo &&
      new Date(r.sessionDate) < fourWeeksAgo
  ).length;

  let trend: SwimmerAttendanceStats["trend"] = "stable";
  if (recentAttendance > previousAttendance * 1.2) {
    trend = "improving";
  } else if (recentAttendance < previousAttendance * 0.8) {
    trend = "declining";
  }

  return {
    swimmerId: swimmer.id,
    swimmerName: swimmer.name,
    totalSessions,
    attended,
    absent,
    justified,
    attendanceRate,
    currentStreak,
    longestStreak,
    lastAttendance,
    averageSessionsPerWeek,
    trend,
  };
}

// Calcular estadísticas para todos los nadadores
export function calculateAllSwimmersAttendanceStats(
  swimmers: Swimmer[],
  attendanceRecords: AttendanceRecord[],
  totalSessions: number
): SwimmerAttendanceStats[] {
  return swimmers.map((swimmer) =>
    calculateSwimmerAttendanceStats(swimmer, attendanceRecords, totalSessions)
  );
}

// Estadísticas globales del equipo
export interface TeamAttendanceStats {
  totalSwimmers: number;
  averageAttendanceRate: number;
  totalSessionsHeld: number;
  totalAttendances: number;
  bestAttendanceRate: { swimmer: string; rate: number } | null;
  worstAttendanceRate: { swimmer: string; rate: number } | null;
  swimmersAbove80Percent: number;
  swimmersBelow50Percent: number;
  averageSessionsPerWeek: number;
}

export function calculateTeamAttendanceStats(
  swimmers: Swimmer[],
  attendanceRecords: AttendanceRecord[],
  totalSessions: number
): TeamAttendanceStats {
  const swimmerStats = calculateAllSwimmersAttendanceStats(
    swimmers,
    attendanceRecords,
    totalSessions
  );

  if (swimmerStats.length === 0) {
    return {
      totalSwimmers: 0,
      averageAttendanceRate: 0,
      totalSessionsHeld: totalSessions,
      totalAttendances: 0,
      bestAttendanceRate: null,
      worstAttendanceRate: null,
      swimmersAbove80Percent: 0,
      swimmersBelow50Percent: 0,
      averageSessionsPerWeek: 0,
    };
  }

  const averageAttendanceRate =
    swimmerStats.reduce((sum, s) => sum + s.attendanceRate, 0) / swimmerStats.length;

  const totalAttendances = swimmerStats.reduce((sum, s) => sum + s.attended, 0);

  const sortedByRate = [...swimmerStats].sort(
    (a, b) => b.attendanceRate - a.attendanceRate
  );
  const bestAttendanceRate =
    sortedByRate.length > 0
      ? { swimmer: sortedByRate[0].swimmerName, rate: sortedByRate[0].attendanceRate }
      : null;
  const worstAttendanceRate =
    sortedByRate.length > 0
      ? {
          swimmer: sortedByRate[sortedByRate.length - 1].swimmerName,
          rate: sortedByRate[sortedByRate.length - 1].attendanceRate,
        }
      : null;

  const swimmersAbove80Percent = swimmerStats.filter(
    (s) => s.attendanceRate >= 80
  ).length;
  const swimmersBelow50Percent = swimmerStats.filter(
    (s) => s.attendanceRate < 50
  ).length;

  const averageSessionsPerWeek =
    swimmerStats.reduce((sum, s) => sum + s.averageSessionsPerWeek, 0) /
    swimmerStats.length;

  return {
    totalSwimmers: swimmers.length,
    averageAttendanceRate,
    totalSessionsHeld: totalSessions,
    totalAttendances,
    bestAttendanceRate,
    worstAttendanceRate,
    swimmersAbove80Percent,
    swimmersBelow50Percent,
    averageSessionsPerWeek,
  };
}

// Asistencia por horario
export interface ScheduleAttendanceStats {
  schedule: string;
  totalSwimmers: number;
  averageAttendanceRate: number;
  totalAttendances: number;
}

export function calculateScheduleAttendanceStats(
  swimmers: Swimmer[],
  attendanceRecords: AttendanceRecord[]
): ScheduleAttendanceStats[] {
  const schedules = ["7am", "8am", "9pm"] as const;

  return schedules.map((schedule) => {
    const scheduleSwimmers = swimmers.filter((s) => s.schedule === schedule);
    const scheduleRecords = attendanceRecords.filter((r) =>
      scheduleSwimmers.some((s) => s.id === r.swimmerId)
    );

    const totalAttendances = scheduleRecords.filter(
      (r) => r.status === "presente"
    ).length;
    const totalPossible = scheduleSwimmers.length * 60; // asumiendo 60 sesiones
    const averageAttendanceRate =
      totalPossible > 0 ? (totalAttendances / totalPossible) * 100 : 0;

    return {
      schedule,
      totalSwimmers: scheduleSwimmers.length,
      averageAttendanceRate,
      totalAttendances,
    };
  });
}

// Asistencia por semana (para gráficos de tendencia)
export interface WeeklyAttendance {
  week: number;
  date: string;
  totalAttendances: number;
  averageAttendanceRate: number;
  totalSwimmers: number;
}

export function calculateWeeklyAttendance(
  swimmers: Swimmer[],
  attendanceRecords: AttendanceRecord[],
  sessions: Array<{ week: number; date: string }>
): WeeklyAttendance[] {
  // Agrupar sesiones por semana
  const weekGroups = sessions.reduce((acc, session) => {
    if (!acc[session.week]) {
      acc[session.week] = [];
    }
    acc[session.week].push(session);
    return acc;
  }, {} as Record<number, typeof sessions>);

  return Object.entries(weekGroups)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([week, weekSessions]) => {
      const weekRecords = attendanceRecords.filter((r) =>
        weekSessions.some((s) => s.date === r.sessionDate)
      );

      const totalAttendances = weekRecords.filter(
        (r) => r.status === "presente"
      ).length;
      const totalPossible = swimmers.length * weekSessions.length;
      const averageAttendanceRate =
        totalPossible > 0 ? (totalAttendances / totalPossible) * 100 : 0;

      return {
        week: parseInt(week),
        date: weekSessions[0].date,
        totalAttendances,
        averageAttendanceRate,
        totalSwimmers: swimmers.length,
      };
    });
}

// Identificar nadadores con baja asistencia (alertas)
export interface AttendanceAlert {
  swimmer: Swimmer;
  severity: "high" | "medium" | "low";
  reason: string;
  recommendation: string;
}

export function generateAttendanceAlerts(
  swimmers: Swimmer[],
  attendanceRecords: AttendanceRecord[],
  totalSessions: number
): AttendanceAlert[] {
  const alerts: AttendanceAlert[] = [];
  const swimmerStats = calculateAllSwimmersAttendanceStats(
    swimmers,
    attendanceRecords,
    totalSessions
  );

  swimmerStats.forEach((stats) => {
    const swimmer = swimmers.find((s) => s.id === stats.swimmerId);
    if (!swimmer) return;

    // Alerta por tasa de asistencia muy baja
    if (stats.attendanceRate < 40) {
      alerts.push({
        swimmer,
        severity: "high",
        reason: `Asistencia muy baja: ${stats.attendanceRate.toFixed(1)}%`,
        recommendation:
          "Se recomienda contactar al nadador para entender las razones y buscar soluciones.",
      });
    } else if (stats.attendanceRate < 60) {
      alerts.push({
        swimmer,
        severity: "medium",
        reason: `Asistencia baja: ${stats.attendanceRate.toFixed(1)}%`,
        recommendation:
          "Considerar una conversación para mejorar la consistencia en los entrenamientos.",
      });
    }

    // Alerta por tendencia decreciente
    if (stats.trend === "declining" && stats.attendanceRate < 70) {
      alerts.push({
        swimmer,
        severity: "medium",
        reason: "Tendencia decreciente en asistencia",
        recommendation:
          "La asistencia ha disminuido en las últimas semanas. Verificar si hay algún impedimento.",
      });
    }

    // Alerta por inactividad prolongada
    if (stats.lastAttendance) {
      const daysSinceLastAttendance = Math.floor(
        (new Date().getTime() - new Date(stats.lastAttendance).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastAttendance > 14) {
        alerts.push({
          swimmer,
          severity: "high",
          reason: `Sin asistir por ${daysSinceLastAttendance} días`,
          recommendation:
            "Contactar urgentemente para verificar el estado del nadador.",
        });
      }
    }
  });

  // Ordenar por severidad
  return alerts.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

// Correlación entre asistencia y mejora de marcas
export interface AttendancePerformanceCorrelation {
  swimmerId: string;
  swimmerName: string;
  attendanceRate: number;
  personalBestsCount: number;
  improvementsCount: number;
  correlation: "positive" | "neutral" | "negative";
  insights: string;
}

export function analyzeAttendancePerformanceCorrelation(
  swimmers: Swimmer[],
  attendanceRecords: AttendanceRecord[],
  totalSessions: number
): AttendancePerformanceCorrelation[] {
  const swimmerStats = calculateAllSwimmersAttendanceStats(
    swimmers,
    attendanceRecords,
    totalSessions
  );

  return swimmerStats.map((stats) => {
    const swimmer = swimmers.find((s) => s.id === stats.swimmerId);
    if (!swimmer) {
      return {
        swimmerId: stats.swimmerId,
        swimmerName: stats.swimmerName,
        attendanceRate: stats.attendanceRate,
        personalBestsCount: 0,
        improvementsCount: 0,
        correlation: "neutral" as const,
        insights: "Sin datos de rendimiento",
      };
    }

    const personalBestsCount = swimmer.personalBests?.length || 0;
    const improvementsCount =
      swimmer.personalBestsHistory?.filter((pb) => pb.isPersonalBest).length || 0;

    let correlation: "positive" | "neutral" | "negative" = "neutral";
    let insights = "";

    if (stats.attendanceRate >= 80 && improvementsCount >= 3) {
      correlation = "positive";
      insights = "Alta asistencia correlaciona con mejoras consistentes";
    } else if (stats.attendanceRate >= 70 && improvementsCount >= 2) {
      correlation = "positive";
      insights = "Buena asistencia muestra progreso en marcas";
    } else if (stats.attendanceRate < 50 && improvementsCount < 2) {
      correlation = "negative";
      insights = "Baja asistencia limita el progreso en marcas";
    } else {
      insights = "Correlación no concluyente - se necesitan más datos";
    }

    return {
      swimmerId: swimmer.id,
      swimmerName: swimmer.name,
      attendanceRate: stats.attendanceRate,
      personalBestsCount,
      improvementsCount,
      correlation,
      insights,
    };
  });
}
