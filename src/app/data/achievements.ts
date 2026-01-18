export type AchievementCategory = 
  | "asistencia" 
  | "racha" 
  | "records" 
  | "competencias" 
  | "mejoras" 
  | "volumen" 
  | "especiales";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string; // emoji o nombre de icono
  color: string; // color del badge
  requirement: number; // valor numérico para desbloquear
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const ACHIEVEMENTS: Achievement[] = [
  // ===== ASISTENCIA =====
  {
    id: "attendance_5",
    name: "Primeros Pasos",
    description: "Asistir a 5 entrenamientos",
    category: "asistencia",
    icon: "🏊",
    color: "bg-blue-400",
    requirement: 5,
    rarity: "common",
  },
  {
    id: "attendance_10",
    name: "Compromiso",
    description: "Asistir a 10 entrenamientos",
    category: "asistencia",
    icon: "💪",
    color: "bg-blue-500",
    requirement: 10,
    rarity: "common",
  },
  {
    id: "attendance_20",
    name: "Dedicado",
    description: "Asistir a 20 entrenamientos",
    category: "asistencia",
    icon: "🔥",
    color: "bg-blue-600",
    requirement: 20,
    rarity: "rare",
  },
  {
    id: "attendance_50",
    name: "Veterano",
    description: "Asistir a 50 entrenamientos",
    category: "asistencia",
    icon: "⭐",
    color: "bg-blue-700",
    requirement: 50,
    rarity: "epic",
  },
  {
    id: "attendance_100",
    name: "Leyenda del Agua",
    description: "Asistir a 100 entrenamientos",
    category: "asistencia",
    icon: "👑",
    color: "bg-blue-900",
    requirement: 100,
    rarity: "legendary",
  },

  // ===== RACHA =====
  {
    id: "streak_3",
    name: "En Forma",
    description: "3 entrenamientos consecutivos (misma semana)",
    category: "racha",
    icon: "📈",
    color: "bg-orange-400",
    requirement: 3,
    rarity: "common",
  },
  {
    id: "streak_5",
    name: "Imparable",
    description: "5 entrenamientos en 2 semanas",
    category: "racha",
    icon: "🚀",
    color: "bg-orange-500",
    requirement: 5,
    rarity: "rare",
  },
  {
    id: "streak_10",
    name: "Máquina",
    description: "10 entrenamientos en 1 mes",
    category: "racha",
    icon: "⚡",
    color: "bg-orange-600",
    requirement: 10,
    rarity: "epic",
  },

  // ===== RÉCORDS =====
  {
    id: "record_1",
    name: "Primera Gloria",
    description: "Conseguir tu primer récord del equipo",
    category: "records",
    icon: "🥇",
    color: "bg-yellow-400",
    requirement: 1,
    rarity: "rare",
  },
  {
    id: "record_3",
    name: "Dominador",
    description: "Conseguir 3 récords del equipo",
    category: "records",
    icon: "🏆",
    color: "bg-yellow-500",
    requirement: 3,
    rarity: "epic",
  },
  {
    id: "record_5",
    name: "Rey del Agua",
    description: "Conseguir 5 récords del equipo",
    category: "records",
    icon: "👑",
    color: "bg-yellow-600",
    requirement: 5,
    rarity: "legendary",
  },

  // ===== COMPETENCIAS =====
  {
    id: "competition_1",
    name: "Debut",
    description: "Participar en tu primera competencia",
    category: "competencias",
    icon: "🎯",
    color: "bg-purple-400",
    requirement: 1,
    rarity: "common",
  },
  {
    id: "competition_3",
    name: "Competidor",
    description: "Participar en 3 competencias",
    category: "competencias",
    icon: "🥋",
    color: "bg-purple-500",
    requirement: 3,
    rarity: "rare",
  },
  {
    id: "competition_5",
    name: "Gladiador",
    description: "Participar en 5 competencias",
    category: "competencias",
    icon: "⚔️",
    color: "bg-purple-600",
    requirement: 5,
    rarity: "epic",
  },
  {
    id: "competition_10",
    name: "Campeón",
    description: "Participar en 10 competencias",
    category: "competencias",
    icon: "🏅",
    color: "bg-purple-700",
    requirement: 10,
    rarity: "legendary",
  },

  // ===== MEJORAS =====
  {
    id: "improvement_3",
    name: "Progreso",
    description: "Mejorar tu marca personal en 3 distancias",
    category: "mejoras",
    icon: "📊",
    color: "bg-green-400",
    requirement: 3,
    rarity: "common",
  },
  {
    id: "improvement_5",
    name: "Evolución",
    description: "Mejorar tu marca personal en 5 distancias",
    category: "mejoras",
    icon: "🌟",
    color: "bg-green-500",
    requirement: 5,
    rarity: "rare",
  },
  {
    id: "improvement_10",
    name: "Perfeccionista",
    description: "Mejorar tu marca personal en 10 distancias diferentes",
    category: "mejoras",
    icon: "💎",
    color: "bg-green-600",
    requirement: 10,
    rarity: "epic",
  },

  // ===== VOLUMEN =====
  {
    id: "volume_50k",
    name: "Maratonista",
    description: "Nadar 50 kilómetros totales",
    category: "volumen",
    icon: "🌊",
    color: "bg-cyan-400",
    requirement: 50000,
    rarity: "rare",
  },
  {
    id: "volume_100k",
    name: "Tiburón",
    description: "Nadar 100 kilómetros totales",
    category: "volumen",
    icon: "🦈",
    color: "bg-cyan-500",
    requirement: 100000,
    rarity: "epic",
  },
  {
    id: "volume_200k",
    name: "Delfín Olímpico",
    description: "Nadar 200 kilómetros totales",
    category: "volumen",
    icon: "🐬",
    color: "bg-cyan-600",
    requirement: 200000,
    rarity: "legendary",
  },

  // ===== ESPECIALES =====
  {
    id: "special_first_day",
    name: "Bienvenido",
    description: "Completar tu primer entrenamiento",
    category: "especiales",
    icon: "🎉",
    color: "bg-pink-400",
    requirement: 1,
    rarity: "common",
  },
  {
    id: "special_complete_profile",
    name: "Ficha Completa",
    description: "Completar tu perfil con foto y marcas personales",
    category: "especiales",
    icon: "✅",
    color: "bg-pink-500",
    requirement: 1,
    rarity: "common",
  },
  {
    id: "special_1_year",
    name: "Aniversario",
    description: "Cumplir 1 año en el equipo",
    category: "especiales",
    icon: "🎂",
    color: "bg-pink-600",
    requirement: 365,
    rarity: "epic",
  },
  {
    id: "special_all_styles",
    name: "Nadador Completo",
    description: "Tener marcas registradas en los 4 estilos",
    category: "especiales",
    icon: "🎨",
    color: "bg-pink-700",
    requirement: 4,
    rarity: "rare",
  },
];

export const getCategoryName = (category: AchievementCategory): string => {
  const names: Record<AchievementCategory, string> = {
    asistencia: "Asistencia",
    racha: "Racha",
    records: "Récords",
    competencias: "Competencias",
    mejoras: "Mejoras",
    volumen: "Volumen",
    especiales: "Especiales",
  };
  return names[category];
};

export const getRarityColor = (rarity: Achievement["rarity"]): string => {
  const colors = {
    common: "border-gray-400 bg-gray-50",
    rare: "border-blue-400 bg-blue-50",
    epic: "border-purple-400 bg-purple-50",
    legendary: "border-yellow-400 bg-yellow-50",
  };
  return colors[rarity];
};

export const getRarityName = (rarity: Achievement["rarity"]): string => {
  const names = {
    common: "Común",
    rare: "Raro",
    epic: "Épico",
    legendary: "Legendario",
  };
  return names[rarity];
};
