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

// 60 Entrenamientos regulares (Lunes, Miércoles, Viernes) - 3 por semana x 20 semanas
export const workouts: Workout[] = [
  // MESOCICLO 1: BASE (2 marzo - 6 abril) - 5 semanas
  // Semana 1
  {
    week: 1,
    date: "2 de marzo",
    day: "Lunes",
    mesociclo: "Base",
    distance: 1500,
    duration: 60,
    warmup: "300m estilo libre suave + 200m técnica",
    mainSet: [
      "4 x 100m estilo libre (descanso 20s)",
      "4 x 75m con pull buoy (descanso 15s)",
      "4 x 50m patada (descanso 15s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Baja"
  },
  {
    week: 1,
    date: "4 de marzo",
    day: "Miércoles",
    mesociclo: "Base",
    distance: 1600,
    duration: 60,
    warmup: "400m variado (100m cada estilo)",
    mainSet: [
      "8 x 100m estilo libre ritmo moderado (descanso 20s)",
      "4 x 50m técnica de brazada (descanso 15s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Media"
  },
  {
    week: 1,
    date: "6 de marzo",
    day: "Viernes",
    mesociclo: "Base",
    distance: 1700,
    duration: 60,
    warmup: "300m estilo libre + 100m drills",
    mainSet: [
      "5 x 200m (descanso 30s) ritmo progresivo",
      "4 x 50m sprint (descanso 30s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Media"
  },

  // Semana 2
  {
    week: 2,
    date: "9 de marzo",
    day: "Lunes",
    mesociclo: "Base",
    distance: 1800,
    duration: 60,
    warmup: "400m combinado + 100m patada",
    mainSet: [
      "6 x 150m estilo libre (descanso 25s)",
      "6 x 50m técnica (descanso 15s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Media"
  },
  {
    week: 2,
    date: "11 de marzo",
    day: "Miércoles",
    mesociclo: "Base",
    distance: 1900,
    duration: 60,
    warmup: "500m estilo libre progresivo",
    mainSet: [
      "3 x 300m (descanso 40s) ritmo constante",
      "6 x 75m con pull buoy (descanso 20s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Media"
  },
  {
    week: 2,
    date: "13 de marzo",
    day: "Viernes",
    mesociclo: "Base",
    distance: 2000,
    duration: 60,
    warmup: "400m variado + 100m drills",
    mainSet: [
      "8 x 150m (descanso 25s) ritmo moderado",
      "4 x 50m sprint (descanso 30s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Media"
  },

  // Semana 3
  {
    week: 3,
    date: "16 de marzo",
    day: "Lunes",
    mesociclo: "Base",
    distance: 2100,
    duration: 60,
    warmup: "500m combinado + 100m patada",
    mainSet: [
      "4 x 250m (descanso 35s) ritmo constante",
      "8 x 50m técnica brazada (descanso 15s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Media"
  },
  {
    week: 3,
    date: "18 de marzo",
    day: "Miércoles",
    mesociclo: "Base",
    distance: 2200,
    duration: 60,
    warmup: "600m estilo libre + 100m drills",
    mainSet: [
      "10 x 125m (descanso 20s) ritmo progresivo",
      "6 x 50m con palas (descanso 20s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Media"
  },
  {
    week: 3,
    date: "20 de marzo",
    day: "Viernes",
    mesociclo: "Base",
    distance: 2300,
    duration: 60,
    warmup: "500m variado + 200m técnica",
    mainSet: [
      "5 x 300m (descanso 40s) ritmo constante",
      "4 x 50m sprint (descanso 30s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Alta"
  },

  // Semana 4
  {
    week: 4,
    date: "23 de marzo",
    day: "Lunes",
    mesociclo: "Base",
    distance: 2200,
    duration: 60,
    warmup: "600m estilo libre progresivo",
    mainSet: [
      "6 x 200m (descanso 30s) ritmo moderado",
      "8 x 75m con pull buoy (descanso 20s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Media"
  },
  {
    week: 4,
    date: "25 de marzo",
    day: "Miércoles",
    mesociclo: "Base",
    distance: 2300,
    duration: 60,
    warmup: "500m combinado + 200m drills",
    mainSet: [
      "4 x 350m (descanso 45s) ritmo constante",
      "6 x 50m sprint (descanso 30s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Alta"
  },
  {
    week: 4,
    date: "27 de marzo",
    day: "Viernes",
    mesociclo: "Base",
    distance: 2400,
    duration: 60,
    warmup: "600m variado + 200m técnica",
    mainSet: [
      "8 x 200m (descanso 30s) ritmo progresivo",
      "4 x 50m con palas (descanso 20s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Alta"
  },

  // Semana 5
  {
    week: 5,
    date: "30 de marzo",
    day: "Lunes",
    mesociclo: "Base",
    distance: 2400,
    duration: 60,
    warmup: "600m estilo libre + 100m patada",
    mainSet: [
      "3 x 500m (descanso 60s) ritmo constante",
      "6 x 50m técnica (descanso 15s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Alta"
  },
  {
    week: 5,
    date: "1 de abril",
    day: "Miércoles",
    mesociclo: "Base",
    distance: 2500,
    duration: 60,
    warmup: "700m combinado + 100m drills",
    mainSet: [
      "10 x 150m (descanso 25s) ritmo moderado",
      "8 x 50m sprint (descanso 30s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Alta"
  },
  {
    week: 5,
    date: "3 de abril",
    day: "Viernes",
    mesociclo: "Base",
    distance: 2500,
    duration: 60,
    warmup: "600m variado + 200m técnica",
    mainSet: [
      "5 x 400m (descanso 50s) ritmo constante",
      "4 x 50m con palas (descanso 20s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Alta"
  },

  // MESOCICLO 2: DESARROLLO (7 abril - 11 mayo) - 5 semanas
  // Semana 6
  {
    week: 6,
    date: "6 de abril",
    day: "Lunes",
    mesociclo: "Desarrollo",
    distance: 2300,
    duration: 60,
    warmup: "500m estilo libre + 200m drills",
    mainSet: [
      "4 x 300m (descanso 35s) ritmo fuerte",
      "8 x 75m con pull buoy (descanso 15s)",
      "4 x 50m sprint máximo (descanso 40s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Alta"
  },
  {
    week: 6,
    date: "8 de abril",
    day: "Miércoles",
    mesociclo: "Desarrollo",
    distance: 2400,
    duration: 60,
    warmup: "600m combinado + 100m patada",
    mainSet: [
      "6 x 250m (descanso 30s) ritmo progresivo",
      "6 x 50m técnica brazada (descanso 15s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Alta"
  },
  {
    week: 6,
    date: "10 de abril",
    day: "Viernes",
    mesociclo: "Desarrollo",
    distance: 2500,
    duration: 60,
    warmup: "700m estilo libre progresivo",
    mainSet: [
      "8 x 200m (descanso 25s) ritmo fuerte",
      "8 x 50m sprint (descanso 30s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },

  // Semana 7
  {
    week: 7,
    date: "13 de abril",
    day: "Lunes",
    mesociclo: "Desarrollo",
    distance: 2400,
    duration: 60,
    warmup: "600m variado + 200m técnica",
    mainSet: [
      "3 x 400m (descanso 45s) ritmo constante fuerte",
      "10 x 75m con palas (descanso 20s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Alta"
  },
  {
    week: 7,
    date: "15 de abril",
    day: "Miércoles",
    mesociclo: "Desarrollo",
    distance: 2500,
    duration: 60,
    warmup: "700m estilo libre + 100m drills",
    mainSet: [
      "5 x 300m (descanso 35s) ritmo progresivo",
      "10 x 50m sprint (descanso 35s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Muy alta"
  },
  {
    week: 7,
    date: "17 de abril",
    day: "Viernes",
    mesociclo: "Desarrollo",
    distance: 2400,
    duration: 60,
    warmup: "600m combinado + 100m patada",
    mainSet: [
      "12 x 150m (descanso 20s) ritmo fuerte",
      "4 x 50m técnica (descanso 15s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Alta"
  },

  // Semana 8
  {
    week: 8,
    date: "20 de abril",
    day: "Lunes",
    mesociclo: "Desarrollo",
    distance: 2500,
    duration: 60,
    warmup: "700m estilo libre progresivo",
    mainSet: [
      "2 x 600m (descanso 60s) ritmo constante",
      "8 x 75m con pull buoy (descanso 15s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Alta"
  },
  {
    week: 8,
    date: "22 de abril",
    day: "Miércoles",
    mesociclo: "Desarrollo",
    distance: 2500,
    duration: 60,
    warmup: "600m variado + 200m drills",
    mainSet: [
      "10 x 175m (descanso 25s) ritmo fuerte",
      "6 x 50m sprint (descanso 35s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },
  {
    week: 8,
    date: "24 de abril",
    day: "Viernes",
    mesociclo: "Desarrollo",
    distance: 2400,
    duration: 60,
    warmup: "700m estilo libre + 100m técnica",
    mainSet: [
      "4 x 350m (descanso 40s) ritmo progresivo",
      "8 x 50m con palas (descanso 20s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Alta"
  },

  // Semana 9
  {
    week: 9,
    date: "27 de abril",
    day: "Lunes",
    mesociclo: "Desarrollo",
    distance: 2500,
    duration: 60,
    warmup: "600m combinado + 200m patada",
    mainSet: [
      "6 x 300m (descanso 35s) ritmo fuerte",
      "6 x 50m sprint máximo (descanso 40s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Muy alta"
  },
  {
    week: 9,
    date: "29 de abril",
    day: "Miércoles",
    mesociclo: "Desarrollo",
    distance: 2400,
    duration: 60,
    warmup: "700m estilo libre progresivo",
    mainSet: [
      "8 x 225m (descanso 30s) ritmo constante fuerte",
      "4 x 50m técnica (descanso 15s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Alta"
  },
  {
    week: 9,
    date: "1 de mayo",
    day: "Viernes",
    mesociclo: "Desarrollo",
    distance: 2500,
    duration: 60,
    warmup: "600m variado + 200m drills",
    mainSet: [
      "4 x 400m (descanso 50s) ritmo progresivo fuerte",
      "8 x 50m sprint (descanso 35s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },

  // Semana 10
  {
    week: 10,
    date: "4 de mayo",
    day: "Lunes",
    mesociclo: "Desarrollo",
    distance: 2500,
    duration: 60,
    warmup: "700m estilo libre + 100m técnica",
    mainSet: [
      "5 x 350m (descanso 40s) ritmo fuerte",
      "10 x 50m con palas (descanso 20s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Alta"
  },
  {
    week: 10,
    date: "6 de mayo",
    day: "Miércoles",
    mesociclo: "Desarrollo",
    distance: 2500,
    duration: 60,
    warmup: "600m combinado + 200m patada",
    mainSet: [
      "1 x 800m ritmo constante (descanso 90s)",
      "4 x 200m ritmo fuerte (descanso 30s)",
      "8 x 75m sprint (descanso 30s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },
  {
    week: 10,
    date: "8 de mayo",
    day: "Viernes",
    mesociclo: "Desarrollo",
    distance: 2500,
    duration: 60,
    warmup: "700m estilo libre progresivo",
    mainSet: [
      "10 x 200m (descanso 25s) ritmo fuerte progresivo",
      "4 x 50m técnica (descanso 15s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },

  // MESOCICLO 3: PRE-COMPETITIVO (12 mayo - 15 junio) - 5 semanas
  // Semana 11
  {
    week: 11,
    date: "11 de mayo",
    day: "Lunes",
    mesociclo: "Pre-competitivo",
    distance: 2400,
    duration: 60,
    warmup: "600m estilo libre + 200m drills",
    mainSet: [
      "6 x 250m (descanso 25s) ritmo de competencia",
      "8 x 50m sprint máximo (descanso 45s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },
  {
    week: 11,
    date: "13 de mayo",
    day: "Miércoles",
    mesociclo: "Pre-competitivo",
    distance: 2500,
    duration: 60,
    warmup: "700m combinado + 100m patada",
    mainSet: [
      "4 x 400m (descanso 40s) ritmo de competencia",
      "6 x 75m con palas (descanso 20s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Muy alta"
  },
  {
    week: 11,
    date: "15 de mayo",
    day: "Viernes",
    mesociclo: "Pre-competitivo",
    distance: 2300,
    duration: 60,
    warmup: "600m estilo libre progresivo",
    mainSet: [
      "8 x 200m (descanso 20s) ritmo fuerte",
      "10 x 50m sprint (descanso 40s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },

  // Semana 12
  {
    week: 12,
    date: "18 de mayo",
    day: "Lunes",
    mesociclo: "Pre-competitivo",
    distance: 2500,
    duration: 60,
    warmup: "700m variado + 200m técnica",
    mainSet: [
      "5 x 350m (descanso 35s) ritmo de competencia",
      "8 x 50m con pull buoy sprint (descanso 40s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Muy alta"
  },
  {
    week: 12,
    date: "20 de mayo",
    day: "Miércoles",
    mesociclo: "Pre-competitivo",
    distance: 2400,
    duration: 60,
    warmup: "600m estilo libre + 200m drills",
    mainSet: [
      "3 x 500m (descanso 50s) ritmo constante fuerte",
      "6 x 75m sprint (descanso 35s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },
  {
    week: 12,
    date: "22 de mayo",
    day: "Viernes",
    mesociclo: "Pre-competitivo",
    distance: 2500,
    duration: 60,
    warmup: "700m combinado + 100m patada",
    mainSet: [
      "10 x 175m (descanso 20s) ritmo progresivo fuerte",
      "8 x 50m sprint máximo (descanso 45s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },

  // Semana 13
  {
    week: 13,
    date: "25 de mayo",
    day: "Lunes",
    mesociclo: "Pre-competitivo",
    distance: 2400,
    duration: 60,
    warmup: "600m estilo libre progresivo",
    mainSet: [
      "2 x 600m (descanso 60s) ritmo de competencia",
      "10 x 75m con palas (descanso 20s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Muy alta"
  },
  {
    week: 13,
    date: "27 de mayo",
    day: "Miércoles",
    mesociclo: "Pre-competitivo",
    distance: 2500,
    duration: 60,
    warmup: "700m variado + 200m drills",
    mainSet: [
      "6 x 300m (descanso 30s) ritmo fuerte progresivo",
      "6 x 50m sprint (descanso 40s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },
  {
    week: 13,
    date: "29 de mayo",
    day: "Viernes",
    mesociclo: "Pre-competitivo",
    distance: 2300,
    duration: 60,
    warmup: "600m estilo libre + 100m técnica",
    mainSet: [
      "12 x 150m (descanso 15s) ritmo de competencia",
      "4 x 50m con pull buoy sprint (descanso 40s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },

  // Semana 14
  {
    week: 14,
    date: "1 de junio",
    day: "Lunes",
    mesociclo: "Pre-competitivo",
    distance: 2500,
    duration: 60,
    warmup: "700m combinado + 200m patada",
    mainSet: [
      "8 x 225m (descanso 25s) ritmo fuerte",
      "8 x 50m sprint máximo (descanso 45s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Muy alta"
  },
  {
    week: 14,
    date: "3 de junio",
    day: "Miércoles",
    mesociclo: "Pre-competitivo",
    distance: 2400,
    duration: 60,
    warmup: "600m estilo libre progresivo",
    mainSet: [
      "1 x 1000m ritmo constante (descanso 120s)",
      "4 x 150m ritmo fuerte (descanso 25s)",
      "6 x 75m sprint (descanso 30s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },
  {
    week: 14,
    date: "5 de junio",
    day: "Viernes",
    mesociclo: "Pre-competitivo",
    distance: 2500,
    duration: 60,
    warmup: "700m variado + 200m drills",
    mainSet: [
      "5 x 400m (descanso 40s) ritmo de competencia",
      "4 x 50m técnica (descanso 15s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },

  // Semana 15
  {
    week: 15,
    date: "8 de junio",
    day: "Lunes",
    mesociclo: "Pre-competitivo",
    distance: 2400,
    duration: 60,
    warmup: "600m estilo libre + 200m técnica",
    mainSet: [
      "4 x 350m (descanso 35s) ritmo de competencia",
      "10 x 50m sprint (descanso 40s)"
    ],
    cooldown: "200m espalda suave",
    intensity: "Muy alta"
  },
  {
    week: 15,
    date: "10 de junio",
    day: "Miércoles",
    mesociclo: "Pre-competitivo",
    distance: 2500,
    duration: 60,
    warmup: "700m combinado + 100m patada",
    mainSet: [
      "10 x 200m (descanso 20s) ritmo fuerte progresivo",
      "6 x 50m con palas sprint (descanso 40s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },
  {
    week: 15,
    date: "12 de junio",
    day: "Viernes",
    mesociclo: "Pre-competitivo",
    distance: 2300,
    duration: 60,
    warmup: "600m estilo libre progresivo",
    mainSet: [
      "6 x 275m (descanso 30s) ritmo de competencia",
      "8 x 50m sprint máximo (descanso 45s)"
    ],
    cooldown: "200m estilo libre suave",
    intensity: "Muy alta"
  },

  // MESOCICLO 4: COMPETITIVO (16 junio - 20 julio) - 5 semanas
  // Semana 16
  {
    week: 16,
    date: "15 de junio",
    day: "Lunes",
    mesociclo: "Competitivo",
    distance: 2200,
    duration: 60,
    warmup: "600m estilo libre suave + 200m drills",
    mainSet: [
      "4 x 300m (descanso 35s) ritmo de competencia",
      "8 x 50m sprint máximo (descanso 50s)"
    ],
    cooldown: "200m estilo libre muy suave",
    intensity: "Muy alta"
  },
  {
    week: 16,
    date: "17 de junio",
    day: "Miércoles",
    mesociclo: "Competitivo",
    distance: 2000,
    duration: 60,
    warmup: "500m variado + 200m técnica",
    mainSet: [
      "6 x 200m (descanso 25s) ritmo de competencia",
      "6 x 50m sprint (descanso 45s)"
    ],
    cooldown: "200m espalda muy suave",
    intensity: "Muy alta"
  },
  {
    week: 16,
    date: "19 de junio",
    day: "Viernes",
    mesociclo: "Competitivo",
    distance: 1800,
    duration: 60,
    warmup: "500m estilo libre suave + 100m drills",
    mainSet: [
      "8 x 150m (descanso 20s) ritmo fuerte",
      "4 x 50m técnica velocidad (descanso 40s)"
    ],
    cooldown: "200m estilo libre muy suave",
    intensity: "Alta"
  },

  // Semana 17
  {
    week: 17,
    date: "22 de junio",
    day: "Lunes",
    mesociclo: "Competitivo",
    distance: 2100,
    duration: 60,
    warmup: "600m combinado + 100m patada",
    mainSet: [
      "5 x 250m (descanso 30s) ritmo de competencia",
      "10 x 50m sprint máximo (descanso 50s)"
    ],
    cooldown: "200m estilo libre muy suave",
    intensity: "Muy alta"
  },
  {
    week: 17,
    date: "24 de junio",
    day: "Miércoles",
    mesociclo: "Competitivo",
    distance: 1900,
    duration: 60,
    warmup: "500m estilo libre progresivo",
    mainSet: [
      "3 x 400m (descanso 45s) ritmo constante fuerte",
      "4 x 50m con palas sprint (descanso 45s)"
    ],
    cooldown: "200m espalda muy suave",
    intensity: "Alta"
  },
  {
    week: 17,
    date: "26 de junio",
    day: "Viernes",
    mesociclo: "Competitivo",
    distance: 1700,
    duration: 60,
    warmup: "500m variado + 100m técnica",
    mainSet: [
      "6 x 175m (descanso 25s) ritmo de competencia",
      "6 x 50m sprint (descanso 45s)"
    ],
    cooldown: "200m estilo libre muy suave",
    intensity: "Alta"
  },

  // Semana 18
  {
    week: 18,
    date: "29 de junio",
    day: "Lunes",
    mesociclo: "Competitivo",
    distance: 2000,
    duration: 60,
    warmup: "600m estilo libre suave + 100m drills",
    mainSet: [
      "4 x 350m (descanso 40s) ritmo de competencia",
      "6 x 50m sprint máximo (descanso 50s)"
    ],
    cooldown: "200m estilo libre muy suave",
    intensity: "Muy alta"
  },
  {
    week: 18,
    date: "1 de julio",
    day: "Miércoles",
    mesociclo: "Competitivo",
    distance: 1800,
    duration: 60,
    warmup: "500m combinado + 100m patada",
    mainSet: [
      "8 x 175m (descanso 20s) ritmo fuerte",
      "4 x 50m técnica velocidad (descanso 40s)"
    ],
    cooldown: "200m espalda muy suave",
    intensity: "Alta"
  },
  {
    week: 18,
    date: "3 de julio",
    day: "Viernes",
    mesociclo: "Competitivo",
    distance: 1600,
    duration: 60,
    warmup: "400m estilo libre suave + 200m drills",
    mainSet: [
      "10 x 100m (descanso 15s) ritmo de competencia",
      "4 x 50m sprint (descanso 45s)"
    ],
    cooldown: "200m estilo libre muy suave",
    intensity: "Media"
  },

  // Semana 19 - Puesta a punto
  {
    week: 19,
    date: "6 de julio",
    day: "Lunes",
    mesociclo: "Competitivo",
    distance: 1800,
    duration: 60,
    warmup: "500m variado + 200m técnica",
    mainSet: [
      "6 x 150m (descanso 20s) ritmo moderado",
      "8 x 50m sprint (descanso 50s)"
    ],
    cooldown: "200m estilo libre muy suave",
    intensity: "Media"
  },
  {
    week: 19,
    date: "8 de julio",
    day: "Miércoles",
    mesociclo: "Competitivo",
    distance: 1600,
    duration: 60,
    warmup: "400m estilo libre suave + 100m drills",
    mainSet: [
      "4 x 200m (descanso 30s) ritmo controlado",
      "6 x 50m técnica velocidad (descanso 45s)"
    ],
    cooldown: "200m espalda muy suave",
    intensity: "Media"
  },
  {
    week: 19,
    date: "10 de julio",
    day: "Viernes",
    mesociclo: "Competitivo",
    distance: 1500,
    duration: 60,
    warmup: "400m combinado + 100m patada",
    mainSet: [
      "8 x 100m (descanso 20s) ritmo moderado",
      "4 x 50m sprint suave (descanso 45s)"
    ],
    cooldown: "200m estilo libre muy suave",
    intensity: "Baja"
  },

  // Semana 20 - Semana del campeonato (descanso activo y activación)
  {
    week: 20,
    date: "13 de julio",
    day: "Lunes",
    mesociclo: "Competitivo",
    distance: 1500,
    duration: 60,
    warmup: "500m estilo libre muy suave + 100m drills",
    mainSet: [
      "6 x 100m (descanso 25s) ritmo cómodo",
      "4 x 50m activación (descanso 60s)"
    ],
    cooldown: "200m estilo libre muy suave",
    intensity: "Baja"
  },
  {
    week: 20,
    date: "15 de julio",
    day: "Miércoles",
    mesociclo: "Competitivo",
    distance: 1200,
    duration: 60,
    warmup: "400m variado suave + 100m técnica",
    mainSet: [
      "4 x 150m (descanso 30s) ritmo suave",
      "4 x 50m activación rápida (descanso 60s)"
    ],
    cooldown: "200m espalda muy suave",
    intensity: "Baja"
  },
  {
    week: 20,
    date: "17 de julio",
    day: "Viernes",
    mesociclo: "Competitivo",
    distance: 1000,
    duration: 60,
    warmup: "400m estilo libre muy suave",
    mainSet: [
      "4 x 100m (descanso 40s) ritmo muy cómodo",
      "4 x 25m activación (descanso 60s)"
    ],
    cooldown: "200m estilo libre muy suave",
    intensity: "Baja"
  }
];