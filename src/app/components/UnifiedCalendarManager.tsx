import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { Plus, Edit, Trash2, Dumbbell, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Waves, Trophy, RefreshCw } from "lucide-react";
import type { Workout } from "../data/workouts";
import type { Challenge } from "../data/challenges";
import { useAuth } from "../contexts/AuthContext";
import { trainingBlocks } from "../data/workouts2026-2027";

interface UnifiedCalendarManagerProps {
  workouts: Workout[];
  challenges: Challenge[];
  onAddWorkout: (workout: Omit<Workout, "id">) => void;
  onEditWorkout: (id: string, workout: Omit<Workout, "id">) => void;
  onDeleteWorkout: (id: string) => void;
  onAddChallenge: (challenge: Omit<Challenge, "id">) => void;
  onEditChallenge: (id: string, challenge: Omit<Challenge, "id">) => void;
  onDeleteChallenge: (id: string) => void;
  onSyncFromLocal?: () => void;
  onForceSyncFromLocal?: () => void;
  onCleanDuplicates?: () => void;
}

interface CalendarDay {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  workouts: Workout[];
  challenges: Challenge[];
}

type EventType = "workout" | "challenge";

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const DAY_NAMES_FULL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export function UnifiedCalendarManager({
  workouts,
  challenges,
  onAddWorkout,
  onEditWorkout,
  onDeleteWorkout,
  onAddChallenge,
  onEditChallenge,
  onDeleteChallenge,
  onSyncFromLocal,
  onForceSyncFromLocal,
  onCleanDuplicates
}: UnifiedCalendarManagerProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "coach";
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventType, setEventType] = useState<EventType>("workout");
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  
  // Estados para entrenamientos
  const [multiDayMode, setMultiDayMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [workoutFormData, setWorkoutFormData] = useState<Omit<Workout, "id">>({
    week: 1,
    date: "",
    day: "Lunes",
    schedule: "AM",
    mesociclo: "Base",
    distance: 1500,
    duration: 60,
    warmup: "",
    mainSet: [""],
    cooldown: "",
    intensity: "Media",
  });

  // Función auxiliar para calcular distancia de un texto
  const calculateDistanceFromText = (text: string): number => {
    let total = 0;
    const patterns = [
      /(\d+)\s*x\s*(\d+)\s*m/gi,  // 4x100m, 4 x 100m
      /(\d+)\s*m/gi,               // 300m, 200m
    ];

    patterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[2]) {
          // Formato NxDm (ej: 4x100m)
          const reps = parseInt(match[1]);
          const distance = parseInt(match[2]);
          total += reps * distance;
        } else if (match[1]) {
          // Formato Dm (ej: 300m)
          total += parseInt(match[1]);
        }
      }
    });

    return total;
  };

  // Calcular distancias por sección
  const warmupDistance = useMemo(() => {
    return calculateDistanceFromText(workoutFormData.warmup);
  }, [workoutFormData.warmup]);

  const mainSetDistance = useMemo(() => {
    return workoutFormData.mainSet.reduce((total, text) => {
      return total + calculateDistanceFromText(text);
    }, 0);
  }, [workoutFormData.mainSet]);

  const cooldownDistance = useMemo(() => {
    return calculateDistanceFromText(workoutFormData.cooldown);
  }, [workoutFormData.cooldown]);

  // Calcular distancia total
  const calculatedDistance = useMemo(() => {
    return warmupDistance + mainSetDistance + cooldownDistance;
  }, [warmupDistance, mainSetDistance, cooldownDistance]);

  // Estados para desafíos
  const [challengeFormData, setChallengeFormData] = useState<Omit<Challenge, "id">>({
    week: 1,
    date: "",
    day: "Sábado",
    mesociclo: "Base",
    distance: 2000,
    duration: 60,
    challengeName: "",
    description: "",
    rules: [""],
    prizes: "",
    intensity: "Media",
  });

  const availableDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  // Helper para parsear fechas en formato "3 de febrero"
  const parseWorkoutDate = (dateText: string, viewingYear: number): Date | null => {
    const monthMap: { [key: string]: number } = {
      'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
      'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
      'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
    };

    const regex = /(\d+)\s+de\s+(\w+)/i;
    const match = dateText.match(regex);
    
    if (match) {
      const day = parseInt(match[1]);
      const monthName = match[2].toLowerCase();
      const month = monthMap[monthName];
      
      if (month !== undefined && day >= 1 && day <= 31) {
        // Determinar el año correcto basándose en el mes
        // La temporada va de marzo 2026 a enero 2027
        let year: number;
        
        // Marzo (2) a Diciembre (11) → 2026
        if (month >= 2 && month <= 11) {
          year = 2026;
        }
        // Enero (0) o Febrero (1) → 2027
        else {
          year = 2027;
        }
        
        return new Date(year, month, day);
      }
    }
    
    return null;
  };

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    console.log('🗓️ UnifiedCalendarManager - Generando calendario');
    console.log('  📅 Mes actual:', MONTHS[currentMonth], currentYear);
    console.log('  📊 Total workouts disponibles:', workouts.length);
    console.log('  📋 Sample workouts:', workouts.slice(0, 5).map(w => ({ 
      week: w.week, 
      date: w.date, 
      day: w.day,
      schedule: w.schedule 
    })));
    
    // Debug específico para agosto 2026
    if (currentMonth === 7 && currentYear === 2026) {
      const agostoWorkouts = workouts.filter(w => {
        const parsed = parseWorkoutDate(w.date, currentYear);
        return parsed && parsed.getMonth() === 7 && parsed.getFullYear() === 2026;
      });
      console.log('  🔍 AGOSTO 2026 - Entrenamientos encontrados:', agostoWorkouts.length);
      console.log('  🔍 AGOSTO 2026 - Ejemplos:', agostoWorkouts.slice(0, 3).map(w => ({
        date: w.date,
        day: w.day,
        schedule: w.schedule,
        week: w.week
      })));
    }
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDayOfMonth);
    
    // Ajustar para que la semana empiece en lunes (1) en lugar de domingo (0)
    // getDay() retorna: 0=Domingo, 1=Lunes, 2=Martes, ..., 6=Sábado
    const firstDayWeekday = startDate.getDay();
    const daysToSubtract = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1; // Si es domingo, retroceder 6 días; si no, retroceder (día - 1)
    startDate.setDate(startDate.getDate() - daysToSubtract);

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateString = currentDate.toISOString().split("T")[0];
      const isToday =
        currentDate.getDate() === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

      // Mapear día de la semana: JS usa 0=Domingo, pero queremos 0=Lunes
      const jsDayIndex = currentDate.getDay(); // 0=Dom, 1=Lun, 2=Mar, ..., 6=Sáb
      const adjustedDayIndex = jsDayIndex === 0 ? 6 : jsDayIndex - 1; // 0=Lun, 1=Mar, ..., 6=Dom
      const workoutDay = DAY_NAMES_FULL[adjustedDayIndex];
      
      const workoutDate = currentDate.getDate();
      const workoutMonth = MONTHS[currentDate.getMonth()].toLowerCase();

      // Filtrar entrenamientos para este día usando parsing de fechas mejorado
      const dayWorkouts = workouts.filter((workout) => {
        // Primero verificar que el día de la semana coincida
        if (workout.day !== workoutDay) return false;
        
        // Intentar parsear la fecha del entrenamiento
        const workoutParsedDate = parseWorkoutDate(workout.date, currentYear);
        
        if (workoutParsedDate) {
          // DEBUG: Log para ver qué está pasando
          const isMatch = workoutParsedDate.getDate() === currentDate.getDate() &&
                 workoutParsedDate.getMonth() === currentDate.getMonth() &&
                 workoutParsedDate.getFullYear() === currentDate.getFullYear();
          
          if (currentMonth === 1 && currentYear === 2026) { // Febrero 2026
            console.log('  🔍 Comparando workout:', {
              workoutDate: workout.date,
              workoutDay: workout.day,
              parsedDate: workoutParsedDate.toISOString().split('T')[0],
              currentDate: currentDate.toISOString().split('T')[0],
              match: isMatch
            });
          }
          
          // Comparar fechas usando objetos Date
          return isMatch;
        }
        
        // Fallback al método anterior si no se pudo parsear
        return workout.date.toLowerCase().includes(workoutDate.toString()) &&
               workout.date.toLowerCase().includes(workoutMonth);
      }).sort((a, b) => {
        // Ordenar por horario: AM antes que PM
        if (a.schedule === 'AM' && b.schedule === 'PM') return -1;
        if (a.schedule === 'PM' && b.schedule === 'AM') return 1;
        return 0;
      });

      // Filtrar desafíos para este día usando parsing de fechas mejorado
      const dayChallenges = challenges.filter((challenge) => {
        // Primero verificar que el día de la semana coincida
        if (challenge.day !== workoutDay) return false;
        
        // Intentar parsear la fecha del desafío
        const challengeParsedDate = parseWorkoutDate(challenge.date, currentYear);
        
        if (challengeParsedDate) {
          // Comparar fechas usando objetos Date
          return challengeParsedDate.getDate() === currentDate.getDate() &&
                 challengeParsedDate.getMonth() === currentDate.getMonth() &&
                 challengeParsedDate.getFullYear() === currentDate.getFullYear();
        }
        
        // Fallback al método anterior si no se pudo parsear
        return challenge.date.toLowerCase().includes(workoutDate.toString()) &&
               challenge.date.toLowerCase().includes(workoutMonth);
      });

      days.push({
        date: new Date(currentDate),
        dateString,
        isCurrentMonth: currentDate.getMonth() === currentMonth,
        isToday,
        workouts: dayWorkouts,
        challenges: dayChallenges,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [currentMonth, currentYear, workouts, challenges, today]);

  const toggleDaySelection = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  // Función para obtener el bloque de entrenamiento según la semana
  const getBlockForWeek = (week: number) => {
    return trainingBlocks.find(block => block.weekNumbers.includes(week));
  };

  // Función para obtener colores según el bloque
  const getBlockColors = (blockColor: string) => {
    const colorMap: { [key: string]: { bg: string; border: string; text: string } } = {
      blue: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-700' },
      red: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700' },
      purple: { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
      green: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700' },
      yellow: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700' },
    };
    return colorMap[blockColor] || { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-700' };
  };

  const handleDayClick = (day: CalendarDay, type: EventType) => {
    if (!day.isCurrentMonth) return;
    
    setSelectedDay(day);
    setEventType(type);
    
    // Mapear día de la semana correctamente: JS usa 0=Domingo, pero queremos 0=Lunes
    const jsDayIndex = day.date.getDay(); // 0=Dom, 1=Lun, 2=Mar, ..., 6=Sáb
    const adjustedDayIndex = jsDayIndex === 0 ? 6 : jsDayIndex - 1; // 0=Lun, 1=Mar, ..., 6=Dom
    const dayName = DAY_NAMES_FULL[adjustedDayIndex];
    
    const monthName = MONTHS[day.date.getMonth()].toLowerCase();
    const dateString = `${day.date.getDate()} de ${monthName}`;
    
    if (type === "workout") {
      setWorkoutFormData({
        week: 1,
        date: dateString,
        day: dayName,
        schedule: "AM",
        mesociclo: "Base",
        distance: 1500,
        duration: 60,
        warmup: "",
        mainSet: [""],
        cooldown: "",
        intensity: "Media",
      });
      setEditingWorkout(null);
    } else {
      setChallengeFormData({
        week: 1,
        date: dateString,
        day: dayName,
        mesociclo: "Base",
        distance: 2000,
        duration: 60,
        challengeName: "",
        description: "",
        rules: [""],
        prizes: "",
        intensity: "Media",
      });
      setEditingChallenge(null);
    }
    
    setDialogOpen(true);
  };

  const handleWorkoutClick = (workout: Workout, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorkout(workout);
    setEventType("workout");
    setWorkoutFormData({
      week: workout.week,
      date: workout.date,
      day: workout.day,
      schedule: workout.schedule || "AM",
      mesociclo: workout.mesociclo,
      distance: workout.distance,
      duration: workout.duration,
      warmup: workout.warmup,
      mainSet: workout.mainSet,
      cooldown: workout.cooldown,
      intensity: workout.intensity,
    });
    setDialogOpen(true);
  };

  const handleChallengeClick = (challenge: Challenge, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChallenge(challenge);
    setEventType("challenge");
    setChallengeFormData({
      week: challenge.week,
      date: challenge.date,
      day: challenge.day,
      mesociclo: challenge.mesociclo,
      distance: challenge.distance,
      duration: challenge.duration,
      challengeName: challenge.challengeName,
      description: challenge.description,
      rules: challenge.rules,
      prizes: challenge.prizes,
      intensity: challenge.intensity,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (eventType === "workout") {
      // Usar distancia calculada automáticamente
      const workoutData = {
        ...workoutFormData,
        distance: calculatedDistance,
        duration: 60, // Duración por defecto
        schedule: "AM" // Valor por defecto, ya no es relevante
      };

      if (editingWorkout && editingWorkout.id) {
        onEditWorkout(editingWorkout.id, workoutData);
      } else {
        const daysToUse = multiDayMode && selectedDays.length > 0 ? selectedDays : [workoutFormData.day];

        daysToUse.forEach(day => {
          onAddWorkout({
            ...workoutData,
            day: day
          });
        });
      }
    } else {
      if (editingChallenge && editingChallenge.id) {
        onEditChallenge(editingChallenge.id, challengeFormData);
      } else {
        onAddChallenge(challengeFormData);
      }
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setWorkoutFormData({
      week: 1,
      date: "",
      day: "Lunes",
      schedule: "AM",
      mesociclo: "Base",
      distance: 1500,
      duration: 60,
      warmup: "",
      mainSet: [""],
      cooldown: "",
      intensity: "Media",
    });
    setChallengeFormData({
      week: 1,
      date: "",
      day: "Sábado",
      mesociclo: "Base",
      distance: 2000,
      duration: 60,
      challengeName: "",
      description: "",
      rules: [""],
      prizes: "",
      intensity: "Media",
    });
    setEditingWorkout(null);
    setEditingChallenge(null);
    setMultiDayMode(false);
    setSelectedDays([]);
    setSelectedDay(null);
  };

  const handleDeleteWorkout = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de que deseas eliminar este entrenamiento?")) {
      onDeleteWorkout(id);
    }
  };

  const handleDeleteChallenge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de que deseas eliminar este desafío?")) {
      onDeleteChallenge(id);
    }
  };

  const updateMainSet = (index: number, value: string) => {
    const newMainSet = [...workoutFormData.mainSet];
    newMainSet[index] = value;
    setWorkoutFormData({ ...workoutFormData, mainSet: newMainSet });
  };

  const addMainSetItem = () => {
    setWorkoutFormData({ ...workoutFormData, mainSet: [...workoutFormData.mainSet, ""] });
  };

  const removeMainSetItem = (index: number) => {
    const newMainSet = workoutFormData.mainSet.filter((_, i) => i !== index);
    setWorkoutFormData({ ...workoutFormData, mainSet: newMainSet });
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...challengeFormData.rules];
    newRules[index] = value;
    setChallengeFormData({ ...challengeFormData, rules: newRules });
  };

  const addRule = () => {
    setChallengeFormData({ ...challengeFormData, rules: [...challengeFormData.rules, ""] });
  };

  const removeRule = (index: number) => {
    const newRules = challengeFormData.rules.filter((_, i) => i !== index);
    setChallengeFormData({ ...challengeFormData, rules: newRules });
  };

  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <CardTitle>Gestionar Calendario</CardTitle>
          </div>
          <div className="flex gap-2">
            {onCleanDuplicates && (
              <Button
                size="sm"
                variant="outline"
                onClick={onCleanDuplicates}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpiar Duplicados (1 por día)
              </Button>
            )}
            {onSyncFromLocal && (
              <Button
                size="sm"
                variant="outline"
                onClick={onSyncFromLocal}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sincronizar Todo
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Navegación del calendario */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">
                {MONTHS[currentMonth]} {currentYear}
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="hover:bg-blue-50 hover:border-blue-300"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Info */}
          <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-50 via-purple-50 to-orange-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-center gap-2 bg-white rounded-md px-3 py-1.5 shadow-sm">
              <Waves className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">
                <span className="text-blue-600">{workouts.length}</span> Entrenamientos
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-md px-3 py-1.5 shadow-sm">
              <Trophy className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-gray-700">
                <span className="text-orange-600">{challenges.length}</span> Desafíos
              </span>
            </div>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-gray-700 py-2 bg-gradient-to-b from-gray-100 to-gray-50 rounded-md border border-gray-200"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const hasEvents = day.workouts.length > 0 || day.challenges.length > 0;
            const totalEvents = day.workouts.length + day.challenges.length;

            return (
              <div
                key={index}
                className={`
                  group/day min-h-[110px] p-1.5 rounded-lg border transition-all text-left relative
                  ${day.isCurrentMonth ? "bg-white hover:bg-gray-50/50" : "bg-gray-50 opacity-40"}
                  ${day.isToday ? "border-2 border-blue-500 ring-2 ring-blue-200 shadow-md" : "border-gray-200"}
                  ${hasEvents ? "border-blue-300 bg-blue-50/30" : "hover:border-gray-300"}
                `}
              >
                <div className="flex flex-col h-full">
                  {/* Número del día */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-sm font-bold ${
                        day.isToday
                          ? "text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full"
                          : day.isCurrentMonth
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                    {hasEvents && (
                      <span className="text-[10px] font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                        {totalEvents}
                      </span>
                    )}
                  </div>

                  {/* Lista de eventos */}
                  <div className="flex flex-col gap-1 flex-1">
                    {/* Entrenamientos */}
                    {day.workouts.slice(0, 2).map((workout) => {
                      const block = getBlockForWeek(workout.week);
                      const colors = block ? getBlockColors(block.color) : { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' };

                      // Tooltip detallado
                      const tooltipText = `Semana ${workout.week}\n${workout.mesociclo} • ${workout.distance}m • ${workout.duration}min`;

                      return (
                        <div
                          key={workout.id}
                          onClick={(e) => handleWorkoutClick(workout, e)}
                          className={`group relative ${colors.bg} hover:opacity-90 border ${colors.border} rounded-md px-1.5 py-1 transition-all cursor-pointer shadow-sm hover:shadow`}
                          title={tooltipText}
                        >
                          <div className="flex items-start justify-between gap-1 mb-0.5">
                            <span className={`text-[10px] font-bold ${colors.text} leading-none`}>
                              Semana {workout.week}
                            </span>
                            <button
                              onClick={(e) => workout.id && handleDeleteWorkout(workout.id, e)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              <Waves className="w-3 h-3" style={{ color: block ? `var(--color-${block.color}-600)` : '#2563eb' }} />
                              <span className={`text-[10px] font-semibold ${colors.text}`}>
                                {workout.distance}m
                              </span>
                            </div>
                            <span className={`text-[9px] font-medium ${colors.text} uppercase`}>
                              {workout.mesociclo.slice(0, 4)}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Desafíos */}
                    {day.challenges.slice(0, 1).map((challenge) => {
                      // Tooltip detallado para desafíos
                      const tooltipText = `Desafío • Semana ${challenge.week}\n${challenge.challengeName}\n${challenge.distance}m • ${challenge.duration}min`;

                      return (
                        <div
                          key={challenge.id}
                          onClick={(e) => handleChallengeClick(challenge, e)}
                          className="group relative bg-gradient-to-r from-orange-100 to-amber-100 hover:opacity-90 border border-orange-300 rounded-md px-1.5 py-1 transition-all cursor-pointer shadow-sm hover:shadow"
                          title={tooltipText}
                        >
                          <div className="flex items-start justify-between gap-1 mb-0.5">
                            <div className="flex items-center gap-1">
                              <Trophy className="w-3 h-3 text-orange-600 flex-shrink-0" />
                              <span className="text-[10px] font-bold text-orange-900 leading-none">
                                Semana {challenge.week}
                              </span>
                            </div>
                            <button
                              onClick={(e) => challenge.id && handleDeleteChallenge(challenge.id, e)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-semibold text-orange-900 truncate flex-1">
                              🏆 {challenge.challengeName}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {totalEvents > 3 && (
                      <div className="text-[10px] text-gray-600 font-medium text-center py-0.5 bg-gray-100 rounded border border-gray-300">
                        +{totalEvents - 3} más
                      </div>
                    )}
                  </div>

                  {/* Botones para agregar */}
                  {day.isCurrentMonth && isAdmin && (
                    <div className="flex gap-1 mt-auto pt-1 opacity-0 group-hover/day:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDayClick(day, "workout")}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md p-1 transition-all shadow-sm hover:shadow text-[10px] font-medium flex items-center justify-center gap-1"
                        title="Agregar entrenamiento"
                      >
                        <Waves className="w-3 h-3" />
                        <span className="hidden sm:inline">+</span>
                      </button>
                      <button
                        onClick={() => handleDayClick(day, "challenge")}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-md p-1 transition-all shadow-sm hover:shadow text-[10px] font-medium flex items-center justify-center gap-1"
                        title="Agregar desafío"
                      >
                        <Trophy className="w-3 h-3" />
                        <span className="hidden sm:inline">+</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Leyenda de Bloques de Periodización */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">🗓️ Periodización (7 Bloques - 44 Semanas)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {trainingBlocks.map((block) => {
              const colors = getBlockColors(block.color);
              return (
                <div key={block.id} className={`${colors.bg} ${colors.border} border rounded p-2`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${colors.text}`}>
                      Bloque {block.id}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {block.weeks}sem
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-gray-800 mb-1 line-clamp-2">
                    {block.name}
                  </p>
                  <p className="text-[9px] text-gray-600">
                    S{block.weekNumbers[0]}-{block.weekNumbers[block.weekNumbers.length - 1]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diálogo unificado */}
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {eventType === "workout" 
                  ? (editingWorkout ? "Editar Entrenamiento" : `Nuevo Entrenamiento - ${selectedDay?.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}`)
                  : (editingChallenge ? "Editar Desafío" : `Nuevo Desafío - ${selectedDay?.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}`)}
              </DialogTitle>
              <DialogDescription>
                {eventType === "workout"
                  ? (editingWorkout ? "Modifica los detalles del entrenamiento existente." : "Añade un nuevo entrenamiento a tu plan.")
                  : (editingChallenge ? "Modifica los detalles del desafío." : "Añade un nuevo desafío.")}
              </DialogDescription>
            </DialogHeader>

            {eventType === "workout" ? (
              // Formulario de Entrenamiento
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Semana</Label>
                    <Input
                      type="number"
                      min="-10"
                      max="20"
                      value={workoutFormData.week}
                      onChange={(e) => setWorkoutFormData({ ...workoutFormData, week: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-gray-500">
                      Semanas negativas son para mantenimiento pre-temporada
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                      placeholder="Ej: 2 de marzo"
                      value={workoutFormData.date}
                      onChange={(e) => setWorkoutFormData({ ...workoutFormData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Día de la Semana</Label>
                  <Select value={workoutFormData.day} onValueChange={(value) => setWorkoutFormData({ ...workoutFormData, day: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lunes">Lunes</SelectItem>
                      <SelectItem value="Martes">Martes</SelectItem>
                      <SelectItem value="Miércoles">Miércoles</SelectItem>
                      <SelectItem value="Jueves">Jueves</SelectItem>
                      <SelectItem value="Viernes">Viernes</SelectItem>
                      <SelectItem value="Sábado">Sábado</SelectItem>
                      <SelectItem value="Domingo">Domingo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Bloque de Periodización</Label>
                  <Select value={workoutFormData.mesociclo} onValueChange={(value) => setWorkoutFormData({ ...workoutFormData, mesociclo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un bloque" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainingBlocks.map((block) => {
                        const colors = getBlockColors(block.color);
                        return (
                          <SelectItem key={block.id} value={`Bloque ${block.id}`}>
                            <div className="flex items-center gap-2">
                              <span className={`inline-block w-3 h-3 rounded ${colors.bg} ${colors.border} border`}></span>
                              <span className="font-medium">Bloque {block.id}:</span>
                              <span className="text-sm">{block.name}</span>
                              <span className="text-xs text-gray-500">({block.weekNumbers[0]}-{block.weekNumbers[block.weekNumbers.length - 1]})</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    El bloque se asigna automáticamente según el número de semana
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Intensidad</Label>
                  <Select value={workoutFormData.intensity} onValueChange={(value) => setWorkoutFormData({ ...workoutFormData, intensity: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baja">Baja</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Muy alta">Muy Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Distancia calculada automáticamente */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="text-lg">🧮</span>
                    Distancia Total - Cálculo Automático
                  </h4>

                  {/* Desglose por sección */}
                  <div className="space-y-2 mb-3">
                    <div className="bg-white rounded-md p-3 border border-gray-300 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Calentamiento</span>
                      <span className="text-lg font-bold text-orange-600">{warmupDistance}m</span>
                    </div>
                    <div className="bg-white rounded-md p-3 border border-gray-300 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Serie Principal</span>
                      <span className="text-lg font-bold text-purple-600">{mainSetDistance}m</span>
                    </div>
                    <div className="bg-white rounded-md p-3 border border-gray-300 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Enfriamiento</span>
                      <span className="text-lg font-bold text-cyan-600">{cooldownDistance}m</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-white rounded-md p-4 border-2 border-blue-400 shadow-md">
                    <Label className="text-sm text-gray-600 mb-2 block">Distancia Total</Label>
                    <div className="text-4xl font-bold text-blue-600">
                      {calculatedDistance}m
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                    <strong>💡 Tip:</strong> Escribe las distancias en formato "300m", "4x100m", "8 x 50m" para cálculo automático
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Calentamiento</Label>
                  <Input
                    placeholder="Ej: 300m estilo libre suave + 200m técnica"
                    value={workoutFormData.warmup}
                    onChange={(e) => setWorkoutFormData({ ...workoutFormData, warmup: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Series Principales</Label>
                  {workoutFormData.mainSet.map((item, index) => (
                    <div key={`mainset-${index}`} className="flex gap-2">
                      <Input
                        placeholder="Ej: 4 x 100m estilo libre (descanso 20s)"
                        value={item}
                        onChange={(e) => updateMainSet(index, e.target.value)}
                      />
                      {workoutFormData.mainSet.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMainSetItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addMainSetItem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Serie
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Enfriamiento</Label>
                  <Input
                    placeholder="Ej: 200m estilo libre suave"
                    value={workoutFormData.cooldown}
                    onChange={(e) => setWorkoutFormData({ ...workoutFormData, cooldown: e.target.value })}
                  />
                </div>

                {/* Modo Multi-Día */}
                {!editingWorkout && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Checkbox
                        id="multi-day-mode"
                        checked={multiDayMode}
                        onCheckedChange={(checked) => {
                          setMultiDayMode(checked as boolean);
                          if (checked) {
                            setSelectedDays([workoutFormData.day]);
                          }
                        }}
                      />
                      <Label 
                        htmlFor="multi-day-mode" 
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold">Crear para múltiples días</span>
                      </Label>
                    </div>
                    
                    {multiDayMode && (
                      <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-700 mb-2">
                          Selecciona los días para los cuales crear este entrenamiento:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {availableDays.map(day => (
                            <Button
                              key={day}
                              type="button"
                              size="sm"
                              variant={selectedDays.includes(day) ? "default" : "outline"}
                              onClick={() => toggleDaySelection(day)}
                              className={selectedDays.includes(day) ? 'bg-blue-600 hover:bg-blue-700' : ''}
                            >
                              {day}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          {selectedDays.length > 0 
                            ? `Se crearán ${selectedDays.length} entrenamiento(s): ${selectedDays.join(', ')}`
                            : 'Selecciona al menos un día'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Formulario de Desafío
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Semana</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={challengeFormData.week}
                      onChange={(e) => setChallengeFormData({ ...challengeFormData, week: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input
                      placeholder="Ej: 7 de marzo"
                      value={challengeFormData.date}
                      onChange={(e) => setChallengeFormData({ ...challengeFormData, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Día</Label>
                    <Select value={challengeFormData.day} onValueChange={(value) => setChallengeFormData({ ...challengeFormData, day: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lunes">Lunes</SelectItem>
                        <SelectItem value="Martes">Martes</SelectItem>
                        <SelectItem value="Miércoles">Miércoles</SelectItem>
                        <SelectItem value="Jueves">Jueves</SelectItem>
                        <SelectItem value="Viernes">Viernes</SelectItem>
                        <SelectItem value="Sábado">Sábado</SelectItem>
                        <SelectItem value="Domingo">Domingo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mesociclo</Label>
                    <Select value={challengeFormData.mesociclo} onValueChange={(value) => setChallengeFormData({ ...challengeFormData, mesociclo: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Base">Base</SelectItem>
                        <SelectItem value="Desarrollo">Desarrollo</SelectItem>
                        <SelectItem value="Pre-competitivo">Pre-competitivo</SelectItem>
                        <SelectItem value="Competitivo">Competitivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nombre del Desafío</Label>
                  <Input
                    placeholder="Ej: Desafío de los 4 Estilos"
                    value={challengeFormData.challengeName}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, challengeName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    placeholder="Descripción del desafío..."
                    value={challengeFormData.description}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Distancia (m)</Label>
                    <Input
                      type="number"
                      min="1000"
                      step="100"
                      value={challengeFormData.distance}
                      onChange={(e) => setChallengeFormData({ ...challengeFormData, distance: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duración (min)</Label>
                    <Input
                      type="number"
                      min="30"
                      step="5"
                      value={challengeFormData.duration}
                      onChange={(e) => setChallengeFormData({ ...challengeFormData, duration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Intensidad</Label>
                    <Select value={challengeFormData.intensity} onValueChange={(value) => setChallengeFormData({ ...challengeFormData, intensity: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baja">Baja</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Muy alta">Muy alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reglas</Label>
                  {challengeFormData.rules.map((rule, index) => (
                    <div key={`rule-${index}`} className="flex gap-2">
                      <Input
                        placeholder="Regla del desafío..."
                        value={rule}
                        onChange={(e) => updateRule(index, e.target.value)}
                      />
                      {challengeFormData.rules.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRule(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addRule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Regla
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Premios</Label>
                  <Input
                    placeholder="Ej: El equipo ganador elige la música del próximo entrenamiento"
                    value={challengeFormData.prizes}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, prizes: e.target.value })}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                className={eventType === "workout" ? "" : "bg-orange-600 hover:bg-orange-700"}
              >
                {eventType === "workout" 
                  ? (editingWorkout ? "Guardar Cambios" : "Crear Entrenamiento")
                  : (editingChallenge ? "Guardar Cambios" : "Crear Desafío")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}