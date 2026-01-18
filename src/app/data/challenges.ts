export interface Challenge {
  id?: string;
  week: number;
  date: string;
  day: string;
  mesociclo: string;
  distance: number;
  duration: number;
  challengeName: string;
  description: string;
  rules: string[];
  prizes: string;
  intensity: string;
  deleted?: boolean;
  deletedAt?: string;
}

export const challenges: Challenge[] = [
  // MESOCICLO BASE - Desafíos de resistencia y técnica
  {
    week: 1,
    date: "7 de marzo",
    day: "Sábado",
    mesociclo: "Base",
    distance: 2000,
    duration: 60,
    challengeName: "Desafío de los 4 Estilos",
    description: "Competencia por equipos nadando los 4 estilos olímpicos",
    rules: [
      "Equipos de 4 personas",
      "Cada nadador nada un estilo diferente (mariposa, espalda, pecho, libre)",
      "Serie: 4 x 400m (100m cada estilo por persona)",
      "Calentamiento: 300m libre + 100m técnica de cada estilo"
    ],
    prizes: "El equipo ganador elige la música del próximo entrenamiento",
    intensity: "Media"
  },
  {
    week: 2,
    date: "14 de marzo",
    day: "Sábado",
    mesociclo: "Base",
    distance: 2200,
    duration: 60,
    challengeName: "Maratón de Resistencia",
    description: "¿Quién puede mantener el ritmo más consistente en 1500m?",
    rules: [
      "Cada nadador nada 1500m continuos",
      "Se cronometra cada 100m",
      "Gana quien tenga la menor variación de tiempos entre sus 100m",
      "Calentamiento: 500m variado + 200m drills"
    ],
    prizes: "Reconocimiento como 'Máquina de Consistencia' de la semana",
    intensity: "Media"
  },
  {
    week: 3,
    date: "21 de marzo",
    day: "Sábado",
    mesociclo: "Base",
    distance: 2300,
    duration: 60,
    challengeName: "Batalla de Relevos",
    description: "Relevos por equipos con diferentes distancias",
    rules: [
      "Equipos de 3 personas",
      "Cada nadador: 200m + 150m + 100m + 50m",
      "Tiempo acumulado del equipo",
      "Calentamiento: 500m libre + 200m técnica"
    ],
    prizes: "Equipo ganador recibe una sesión de recuperación especial",
    intensity: "Alta"
  },
  {
    week: 4,
    date: "28 de marzo",
    day: "Sábado",
    mesociclo: "Base",
    distance: 2400,
    duration: 60,
    challengeName: "Desafío Técnico Master",
    description: "Competencia de precisión técnica con jueces",
    rules: [
      "3 rondas: Técnica de crol, virajes, y salidas",
      "Cada nadador hace 4 x 100m siendo evaluado",
      "Puntuación técnica (1-10) + tiempo combinados",
      "Calentamiento: 600m variado + 200m drills técnicos"
    ],
    prizes: "Título de 'Nadador Técnico del Mes'",
    intensity: "Media"
  },
  {
    week: 5,
    date: "4 de abril",
    day: "Sábado",
    mesociclo: "Base",
    distance: 2500,
    duration: 60,
    challengeName: "La Gran Pirámide",
    description: "Sube y baja la pirámide de distancias lo más rápido posible",
    rules: [
      "Secuencia: 50-100-150-200-250-200-150-100-50m",
      "Descanso: 20s entre cada serie",
      "Se cronometra el tiempo total",
      "Calentamiento: 600m libre + 200m técnica"
    ],
    prizes: "El más rápido recibe el título 'Faraón de la Piscina'",
    intensity: "Alta"
  },

  // MESOCICLO DESARROLLO - Desafíos de velocidad e intensidad
  {
    week: 6,
    date: "11 de abril",
    day: "Sábado",
    mesociclo: "Desarrollo",
    distance: 2400,
    duration: 60,
    challengeName: "Sprint Masters Championship",
    description: "Competencia de velocidad pura en múltiples distancias",
    rules: [
      "Eliminatorias: 4 x 50m sprint (clasifican los 4 mejores)",
      "Semifinales: 2 x 100m sprint (clasifican los 2 mejores)",
      "Final: 1 x 200m sprint",
      "Calentamiento: 600m variado + 300m activación"
    ],
    prizes: "Medalla de oro, plata y bronce + título 'Velocista Master'",
    intensity: "Muy alta"
  },
  {
    week: 7,
    date: "18 de abril",
    day: "Sábado",
    mesociclo: "Desarrollo",
    distance: 2500,
    duration: 60,
    challengeName: "Desafío de los 1000m",
    description: "Competencia individual de 1000m contra el cronómetro",
    rules: [
      "Cada nadador realiza 1000m tiempo",
      "Categorías por edad y género",
      "Se registra marca personal",
      "Calentamiento: 700m progresivo + 200m activación"
    ],
    prizes: "Record del club para cada categoría",
    intensity: "Muy alta"
  },
  {
    week: 8,
    date: "25 de abril",
    day: "Sábado",
    mesociclo: "Desarrollo",
    distance: 2600,
    duration: 60,
    challengeName: "Triatlón Acuático",
    description: "Combinación de velocidad, resistencia y técnica",
    rules: [
      "Etapa 1: 8 x 50m sprint (máxima velocidad)",
      "Etapa 2: 1 x 800m ritmo constante",
      "Etapa 3: 4 x 100m técnica evaluada",
      "Calentamiento: 600m variado + 200m drills"
    ],
    prizes: "Trofeo 'Atleta Completo Master'",
    intensity: "Muy alta"
  },
  {
    week: 9,
    date: "2 de mayo",
    day: "Sábado",
    mesociclo: "Desarrollo",
    distance: 2500,
    duration: 60,
    challengeName: "Batalla por Parejas",
    description: "Competencia por duplas con estrategia",
    rules: [
      "Parejas: cada uno nada 600m divididos como quieran",
      "Deben alternarse (ejemplo: 200-200-200 o 300-100-200)",
      "Se suma el tiempo total de la pareja",
      "Calentamiento: 700m libre + 200m coordinación"
    ],
    prizes: "Pareja ganadora elige el próximo desafío",
    intensity: "Alta"
  },
  {
    week: 10,
    date: "9 de mayo",
    day: "Sábado",
    mesociclo: "Desarrollo",
    distance: 2400,
    duration: 60,
    challengeName: "Desafío Progresivo Extremo",
    description: "Cada serie debe ser más rápida que la anterior",
    rules: [
      "10 x 150m - cada uno más rápido que el anterior",
      "Si fallas en ir más rápido, penalización de 10 flexiones",
      "Descanso: 30s entre series",
      "Calentamiento: 600m variado + 300m activación"
    ],
    prizes: "Quien complete las 10 series recibe el título 'Imparable'",
    intensity: "Muy alta"
  },

  // MESOCICLO PRE-COMPETITIVO - Desafíos de simulación de competencia
  {
    week: 11,
    date: "16 de mayo",
    day: "Sábado",
    mesociclo: "Pre-competitivo",
    distance: 2500,
    duration: 60,
    challengeName: "Simulacro de Campeonato",
    description: "Simulación completa de día de competencia",
    rules: [
      "Formato oficial: eliminatorias, semifinales, finales",
      "Pruebas: 100m, 200m, 400m libre",
      "Con sistema de puntuación oficial",
      "Calentamiento: 800m como día de competencia"
    ],
    prizes: "Puntos para ranking interno del equipo",
    intensity: "Muy alta"
  },
  {
    week: 12,
    date: "23 de mayo",
    day: "Sábado",
    mesociclo: "Pre-competitivo",
    distance: 2400,
    duration: 60,
    challengeName: "Desafío de Marcas Personales",
    description: "Intentar batir tu mejor marca en tu distancia favorita",
    rules: [
      "Cada nadador elige: 50m, 100m, 200m o 400m",
      "3 intentos para batir su marca personal",
      "Se registran todas las marcas",
      "Calentamiento: 800m personalizado"
    ],
    prizes: "Reconocimiento especial para cada nueva marca personal",
    intensity: "Muy alta"
  },
  {
    week: 13,
    date: "30 de mayo",
    day: "Sábado",
    mesociclo: "Pre-competitivo",
    distance: 2300,
    duration: 60,
    challengeName: "Copa Mixta por Equipos",
    description: "Equipos mixtos compitiendo en relevos variados",
    rules: [
      "Equipos de 4 (mixtos)",
      "Relevos: 4x100m libre, 4x50m estilos, 4x75m libre",
      "Sistema de puntos acumulados",
      "Calentamiento: 600m variado + 300m activación"
    ],
    prizes: "Copa del campeón + foto grupal del equipo ganador",
    intensity: "Muy alta"
  },
  {
    week: 14,
    date: "6 de junio",
    day: "Sábado",
    mesociclo: "Pre-competitivo",
    distance: 2400,
    duration: 60,
    challengeName: "Maratón de Intervalos",
    description: "Resistencia mental y física al máximo",
    rules: [
      "20 x 100m saliendo cada 1:30",
      "Objetivo: mantener tiempo constante en todos",
      "Máxima variación permitida: 3 segundos",
      "Calentamiento: 600m progresivo + 200m técnica"
    ],
    prizes: "Título 'Guerrero de la Resistencia'",
    intensity: "Muy alta"
  },
  {
    week: 15,
    date: "13 de junio",
    day: "Sábado",
    mesociclo: "Pre-competitivo",
    distance: 2200,
    duration: 60,
    challengeName: "Desafío Final Pre-Competencia",
    description: "Última prueba antes del periodo competitivo",
    rules: [
      "Medley individual: 200m (50m de cada estilo)",
      "400m libre tiempo",
      "4 x 50m sprint máximo",
      "Calentamiento: 600m completo + 200m activación"
    ],
    prizes: "Evaluación final y reconocimientos pre-campeonato",
    intensity: "Muy alta"
  },

  // MESOCICLO COMPETITIVO - Desafíos de afinamiento y motivación
  {
    week: 16,
    date: "20 de junio",
    day: "Sábado",
    mesociclo: "Competitivo",
    distance: 2000,
    duration: 60,
    challengeName: "Desafío de Velocidad Pura",
    description: "Sprints cortos con máxima potencia",
    rules: [
      "16 x 50m sprint máximo",
      "Descanso completo entre series (1 min)",
      "Se registra el tiempo de cada uno",
      "Calentamiento: 600m suave + 400m activación progresiva"
    ],
    prizes: "Reconocimiento al sprint más rápido del día",
    intensity: "Muy alta"
  },
  {
    week: 17,
    date: "27 de junio",
    day: "Sábado",
    mesociclo: "Competitivo",
    distance: 1800,
    duration: 60,
    challengeName: "Ensayo General",
    description: "Simulación exacta de las pruebas del campeonato",
    rules: [
      "Cada nadador nada sus pruebas del campeonato",
      "Con descansos reales entre pruebas",
      "Cronometraje oficial",
      "Calentamiento: personalizado según pruebas"
    ],
    prizes: "Feedback técnico individual y estrategia final",
    intensity: "Alta"
  },
  {
    week: 18,
    date: "4 de julio",
    day: "Sábado",
    mesociclo: "Competitivo",
    distance: 1600,
    duration: 60,
    challengeName: "Desafío de Confianza",
    description: "Nados cortos de calidad y técnica perfecta",
    rules: [
      "12 x 100m a ritmo de competencia",
      "Enfoque 100% en técnica perfecta",
      "Descanso generoso (45s)",
      "Calentamiento: 500m muy suave + 300m técnica"
    ],
    prizes: "Certificado de preparación óptima",
    intensity: "Media"
  },
  {
    week: 19,
    date: "11 de julio",
    day: "Sábado",
    mesociclo: "Competitivo",
    distance: 1400,
    duration: 60,
    challengeName: "Activación Pre-Campeonato",
    description: "Sesión ligera de activación y velocidad",
    rules: [
      "8 x 50m builds (progresivos)",
      "4 x 100m ritmo cómodo",
      "6 x 25m sprint suave",
      "Calentamiento: 500m muy suave + 200m drills"
    ],
    prizes: "Palabras de motivación y última charla técnica",
    intensity: "Baja"
  },
  {
    week: 20,
    date: "18 de julio",
    day: "Sábado",
    mesociclo: "Competitivo",
    distance: 1200,
    duration: 60,
    challengeName: "Última Activación",
    description: "Sesión final antes del campeonato nacional",
    rules: [
      "6 x 50m técnica perfecta",
      "4 x 25m activación rápida",
      "200m suave de recuperación",
      "Calentamiento: 400m muy suave"
    ],
    prizes: "¡Listos para el Campeonato Nacional!",
    intensity: "Baja"
  }
];