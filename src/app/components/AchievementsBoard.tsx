import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Trophy, Award, Lock, Sparkles, Target } from "lucide-react";
import type { Swimmer, AttendanceRecord, Competition } from "../data/swimmers";
import { ACHIEVEMENTS, getCategoryName, getRarityColor, getRarityName, type AchievementCategory } from "../data/achievements";
import { calculateUnlockedAchievements, getAchievementProgress, type UnlockedAchievement } from "../utils/achievementsUtils";

interface AchievementsBoardProps {
  swimmers: Swimmer[];
  attendanceRecords: AttendanceRecord[];
  competitions: Competition[];
  selectedSwimmerId?: string; // Si se proporciona, mostrar solo logros de ese nadador
}

export function AchievementsBoard({
  swimmers,
  attendanceRecords,
  competitions,
  selectedSwimmerId,
}: AchievementsBoardProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | "all">("all");
  const [viewMode, setViewMode] = useState<"unlocked" | "all">("all");

  // Calcular logros desbloqueados para el nadador seleccionado (o todos)
  const swimmerAchievements = useMemo(() => {
    if (selectedSwimmerId) {
      const swimmer = swimmers.find((s) => s.id === selectedSwimmerId);
      if (!swimmer) return [];
      return calculateUnlockedAchievements(swimmer, attendanceRecords, competitions, swimmers);
    }
    return [];
  }, [selectedSwimmerId, swimmers, attendanceRecords, competitions]);

  const unlockedIds = new Set(swimmerAchievements.map((ua) => ua.achievementId));

  // Filtrar logros por categoría
  const filteredAchievements = ACHIEVEMENTS.filter(
    (achievement) =>
      selectedCategory === "all" || achievement.category === selectedCategory
  );

  // Filtrar por modo de vista (todos o solo desbloqueados)
  const displayedAchievements = filteredAchievements.filter(
    (achievement) =>
      viewMode === "all" || unlockedIds.has(achievement.id)
  );

  // Estadísticas generales
  const stats = useMemo(() => {
    const totalAchievements = ACHIEVEMENTS.length;
    const unlockedCount = swimmerAchievements.length;
    const percentage = (unlockedCount / totalAchievements) * 100;

    const byRarity = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };

    swimmerAchievements.forEach((ua) => {
      const achievement = ACHIEVEMENTS.find((a) => a.id === ua.achievementId);
      if (achievement) {
        byRarity[achievement.rarity]++;
      }
    });

    return {
      total: totalAchievements,
      unlocked: unlockedCount,
      percentage: Math.round(percentage),
      byRarity,
    };
  }, [swimmerAchievements]);

  // Categorías únicas
  const categories: AchievementCategory[] = [
    "asistencia",
    "racha",
    "records",
    "competencias",
    "mejoras",
    "volumen",
    "especiales",
  ];

  const getCategoryIcon = (category: AchievementCategory) => {
    const icons: Record<AchievementCategory, string> = {
      asistencia: "💪",
      racha: "🔥",
      records: "🏆",
      competencias: "🎯",
      mejoras: "📈",
      volumen: "🌊",
      especiales: "⭐",
    };
    return icons[category];
  };

  const renderAchievementCard = (achievement: typeof ACHIEVEMENTS[0]) => {
    const isUnlocked = unlockedIds.has(achievement.id);
    const swimmer = swimmers.find((s) => s.id === selectedSwimmerId);

    const progress = swimmer
      ? getAchievementProgress(achievement, swimmer, attendanceRecords, competitions, swimmers)
      : { current: 0, required: achievement.requirement, percentage: 0 };

    return (
      <Card
        key={achievement.id}
        className={`relative overflow-hidden transition-all hover:shadow-lg ${
          isUnlocked ? getRarityColor(achievement.rarity) : "opacity-60 grayscale"
        }`}
      >
        {/* Efecto de brillo para logros legendarios */}
        {isUnlocked && achievement.rarity === "legendary" && (
          <div className="absolute top-0 right-0 p-2">
            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
          </div>
        )}

        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icono del logro */}
            <div
              className={`text-4xl p-2 rounded-lg ${
                isUnlocked ? achievement.color : "bg-gray-200"
              } flex items-center justify-center`}
            >
              {isUnlocked ? achievement.icon : "🔒"}
            </div>

            {/* Información del logro */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold">
                  {isUnlocked ? achievement.name : "???"}
                </h3>
                <Badge
                  variant={isUnlocked ? "default" : "outline"}
                  className="text-xs"
                >
                  {getRarityName(achievement.rarity)}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {isUnlocked ? achievement.description : "Logro bloqueado"}
              </p>

              {/* Barra de progreso */}
              {!isUnlocked && swimmer && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progreso</span>
                    <span>
                      {progress.current} / {progress.required}
                    </span>
                  </div>
                  <Progress value={progress.percentage} className="h-2" />
                </div>
              )}

              {/* Badge de desbloqueado */}
              {isUnlocked && (
                <div className="flex items-center gap-1 text-xs text-green-600 font-semibold mt-2">
                  <Trophy className="w-3 h-3" />
                  <span>¡Desbloqueado!</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Sistema de Logros</h2>
        <p className="text-gray-600">
          Desbloquea medallas y reconocimientos por tus logros en el equipo
        </p>
      </div>

      {/* Estadísticas generales */}
      {selectedSwimmerId && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{stats.unlocked}</p>
              <p className="text-sm text-gray-600">Desbloqueados</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{stats.percentage}%</p>
              <p className="text-sm text-gray-600">Completado</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{stats.byRarity.legendary}</p>
              <p className="text-sm text-gray-600">Legendarios</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-pink-500" />
              <p className="text-2xl font-bold">{stats.byRarity.epic}</p>
              <p className="text-sm text-gray-600">Épicos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <div className="space-y-4">
        {/* Filtro por categoría */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Categoría:
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === "all"
                  ? "bg-blue-500 text-white shadow-lg scale-105"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  selectedCategory === category
                    ? "bg-blue-500 text-white shadow-lg scale-105"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <span>{getCategoryIcon(category)}</span>
                <span>{getCategoryName(category)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por estado */}
        {selectedSwimmerId && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Mostrar:
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("all")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === "all"
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Todos los logros
              </button>
              <button
                onClick={() => setViewMode("unlocked")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === "unlocked"
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Solo desbloqueados
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de logros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedAchievements.map((achievement) =>
          renderAchievementCard(achievement)
        )}
      </div>

      {displayedAchievements.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Lock className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No hay logros en esta categoría</p>
        </div>
      )}
    </div>
  );
}
