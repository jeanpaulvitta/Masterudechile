import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Textarea } from "./ui/textarea";
import { Plus, Edit, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Waves, Trophy } from "lucide-react";
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
  const [viewDetailsDay, setViewDetailsDay] = useState<CalendarDay | null>(null);
  
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
    if (!text || text.trim() === '') return 0;

    let total = 0;
    let processedText = text.toLowerCase();

    // 1. Procesar series anidadas primero: 2x(4x100m)
    const nestedPattern = /(\d+)\s*[x*×]\s*\(([^)]+)\)/gi;
    processedText = processedText.replace(nestedPattern, (match, reps, innerContent) => {
      const outerReps = parseInt(reps);
      const innerDistance = calculateDistanceFromText(innerContent);
      total += outerReps * innerDistance;
      return ' '; // Reemplazar con espacio para no volver a procesar
    });

    // 2. Procesar kilómetros: 1.5km, 2km, 1,5km
    const kmPattern = /(\d+)[.,]?(\d*)\s*k(?:m|ilómetros?)?(?!\d)/gi;
    processedText = processedText.replace(kmPattern, (match, num1, num2) => {
      const km = parseFloat((num1 + (num2 ? '.' + num2 : '')).replace(',', '.'));
      total += km * 1000;
      return ' '; // Reemplazar con espacio
    });

    // 3. Procesar formato con multiplicador: 4x100m, 4 x 100m, 4*100, 8x50
    const multiplierPattern = /(\d+)\s*[x*×]\s*(\d+)(?:\s*m(?:etros?)?)?/gi;
    processedText = processedText.replace(multiplierPattern, (match, reps, dist) => {
      const repetitions = parseInt(reps);
      const distance = parseInt(dist);
      total += repetitions * distance;
      return ' '; // Reemplazar con espacio
    });

    // 4. Procesar metros simples: 300m, 200 metros, 1500m, 1.500m (solo los que quedaron)
    const metersPattern = /(\d{1,3}(?:[.,]\d{3})*|\d+)\s*m(?:etros?)?/gi;
    processedText = processedText.replace(metersPattern, (match, num) => {
      // Remover separadores de miles (puntos o comas)
      const cleanNumber = num.replace(/[.,]/g, '');
      total += parseInt(cleanNumber);
      return ' '; // Reemplazar con espacio
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
      {/* Calendario */}
      <Card className={viewDetailsDay ? "lg:col-span-2" : "lg:col-span-3"}>
        <CardHeader className="px-2 sm:px-6 py-2 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <CardTitle className="text-base sm:text-xl">Gestionar Calendario</CardTitle>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {onCleanDuplicates && (
              <Button
                size="sm"
                variant="outline"
                onClick={onCleanDuplicates}
                className="text-red-600 border-red-600 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-4 h-7 sm:h-9"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Limpiar Duplicados (1 por día)</span>
                <span className="sm:hidden">Limpiar</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-1.5 sm:px-6 py-2 sm:py-4">
        {/* Navegación del calendario */}
        <div className="mb-2 sm:mb-4">
          <div className="flex items-center justify-between mb-1.5 sm:mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="hover:bg-blue-50 hover:border-blue-300 h-7 sm:h-9 px-1.5 sm:px-3"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <div className="text-center">
              <h3 className="text-sm sm:text-xl font-bold text-gray-900">
                {MONTHS[currentMonth]} {currentYear}
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="hover:bg-blue-50 hover:border-blue-300 h-7 sm:h-9 px-1.5 sm:px-3"
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>

          {/* Info */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-50 via-purple-50 to-orange-50 rounded-lg p-1.5 sm:p-3 border border-gray-200">
              <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-md px-1.5 sm:px-3 py-0.5 sm:py-1.5 shadow-sm">
                <Waves className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                <span className="text-[10px] sm:text-sm font-semibold text-gray-700">
                  <span className="text-blue-600">{workouts.length}</span>
                  <span className="hidden sm:inline ml-1">Entrenamientos</span>
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-md px-1.5 sm:px-3 py-0.5 sm:py-1.5 shadow-sm">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
                <span className="text-[10px] sm:text-sm font-semibold text-gray-700">
                  <span className="text-orange-600">{challenges.length}</span>
                  <span className="hidden sm:inline ml-1">Desafíos</span>
                </span>
              </div>
            </div>
            <p className="text-center text-[9px] sm:text-xs text-gray-500">
              💡 Haz clic en un día para ver los detalles del entrenamiento
            </p>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-[2px] sm:gap-1 mb-0.5 sm:mb-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-[8px] sm:text-xs font-bold text-gray-700 py-0.5 sm:py-2 bg-gradient-to-b from-gray-100 to-gray-50 rounded-sm border border-gray-200"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-[2px] sm:gap-1">
          {calendarDays.map((day, index) => {
            const hasEvents = day.workouts.length > 0 || day.challenges.length > 0;
            const totalEvents = day.workouts.length + day.challenges.length;

            return (
              <div
                key={index}
                onClick={() => hasEvents && setViewDetailsDay(day)}
                className={`
                  group/day min-h-[65px] sm:min-h-[110px] p-0.5 sm:p-1.5 rounded-sm sm:rounded-lg border transition-all text-left relative
                  ${day.isCurrentMonth ? "bg-white hover:bg-gray-50/50" : "bg-gray-50 opacity-40"}
                  ${day.isToday ? "border-2 border-blue-500 ring-1 sm:ring-2 ring-blue-200 shadow-md" : "border-gray-200"}
                  ${hasEvents ? "border-blue-300 bg-blue-50/30 cursor-pointer" : "hover:border-gray-300"}
                  ${viewDetailsDay?.dateString === day.dateString ? "ring-2 ring-blue-400 bg-blue-100/50" : ""}
                `}
              >
                <div className="flex flex-col h-full">
                  {/* Indicador de eventos en la parte superior */}
                  {hasEvents && (
                    <div className="absolute top-0 left-0 right-0 flex gap-0.5 px-0.5 pt-0.5">
                      {day.workouts.length > 0 && (
                        <div className="h-0.5 sm:h-1 bg-blue-500 rounded-full flex-1"></div>
                      )}
                      {day.challenges.length > 0 && (
                        <div className="h-0.5 sm:h-1 bg-orange-500 rounded-full flex-1"></div>
                      )}
                    </div>
                  )}

                  {/* Número del día */}
                  <div className="flex items-center justify-between mb-0.5 mt-1">
                    <span
                      className={`text-[10px] sm:text-sm font-bold ${
                        day.isToday
                          ? "text-blue-600 bg-blue-100 px-1 sm:px-2 py-0.5 rounded-full"
                          : day.isCurrentMonth
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                    {hasEvents && totalEvents > 1 && (
                      <span className="text-[7px] sm:text-[10px] font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-3.5 h-3.5 sm:w-5 sm:h-5 flex items-center justify-center shadow-sm">
                        {totalEvents}
                      </span>
                    )}
                  </div>

                  {/* Lista de eventos */}
                  <div className="flex flex-col gap-0.5 sm:gap-1 flex-1">
                    {/* Entrenamientos - mostrar 1 en móvil, 2 en desktop */}
                    {day.workouts.slice(0, window.innerWidth < 640 ? 1 : 2).map((workout) => {
                      const block = getBlockForWeek(workout.week);
                      const colors = block ? getBlockColors(block.color) : { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' };

                      // Tooltip detallado
                      const tooltipText = `${workout.mesociclo} • ${workout.distance}m • ${workout.duration}min • ${workout.intensity}`;

                      return (
                        <div
                          key={workout.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWorkoutClick(workout, e);
                          }}
                          className={`group relative ${colors.bg} hover:opacity-90 border ${colors.border} rounded-sm sm:rounded-md px-1 sm:px-2 py-0.5 sm:py-1 transition-all cursor-pointer shadow-sm hover:shadow`}
                          title={tooltipText}
                        >
                          <div className="flex items-center justify-between gap-0.5 sm:gap-1">
                            <div className="flex items-center gap-0.5 sm:gap-1 flex-1 min-w-0">
                              <Waves className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" style={{ color: block ? `var(--color-${block.color}-600)` : '#2563eb' }} />
                              <span className={`text-[8px] sm:text-[11px] font-bold ${colors.text} truncate`}>
                                {workout.distance}m
                              </span>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={(e) => workout.id && handleDeleteWorkout(workout.id, e)}
                                className="opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0"
                              >
                                <Trash2 className="w-2 h-2 sm:w-3 sm:h-3 text-red-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Desafíos */}
                    {day.challenges.slice(0, 1).map((challenge) => {
                      // Tooltip detallado para desafíos
                      const tooltipText = `${challenge.challengeName}\n${challenge.distance}m • ${challenge.duration}min`;

                      return (
                        <div
                          key={challenge.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleChallengeClick(challenge, e);
                          }}
                          className="group relative bg-gradient-to-r from-orange-100 to-amber-100 hover:opacity-90 border border-orange-300 rounded-sm sm:rounded-md px-1 sm:px-2 py-0.5 sm:py-1 transition-all cursor-pointer shadow-sm hover:shadow"
                          title={tooltipText}
                        >
                          <div className="flex items-center justify-between gap-0.5 sm:gap-1">
                            <div className="flex items-center gap-0.5 sm:gap-1 flex-1 min-w-0">
                              <Trophy className="w-2 h-2 sm:w-3 sm:h-3 text-orange-600 flex-shrink-0" />
                              <span className="text-[8px] sm:text-[11px] font-bold text-orange-900 truncate">
                                {challenge.challengeName}
                              </span>
                            </div>
                            {isAdmin && (
                              <button
                                onClick={(e) => challenge.id && handleDeleteChallenge(challenge.id, e)}
                                className="opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0"
                              >
                                <Trash2 className="w-2 h-2 sm:w-3 sm:h-3 text-red-600" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {totalEvents > (window.innerWidth < 640 ? 1 : 3) && (
                      <div className="text-[7px] sm:text-[10px] text-gray-600 font-medium text-center py-0.5 bg-gray-100 rounded-sm border border-gray-300">
                        +{totalEvents - (window.innerWidth < 640 ? 1 : 3)}
                      </div>
                    )}
                  </div>

                  {/* Botones para agregar - siempre visible en móvil, hover en desktop */}
                  {day.isCurrentMonth && isAdmin && !hasEvents && (
                    <div className="flex gap-0.5 mt-auto pt-0.5 sm:opacity-0 sm:group-hover/day:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDayClick(day, "workout")}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-sm p-0.5 transition-all text-[8px] font-medium flex items-center justify-center"
                        title="Agregar entrenamiento"
                      >
                        <Waves className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={() => handleDayClick(day, "challenge")}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white rounded-sm p-0.5 transition-all text-[8px] font-medium flex items-center justify-center"
                        title="Agregar desafío"
                      >
                        <Trophy className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Leyenda de Bloques de Periodización */}
        <div className="mt-2 sm:mt-4 p-1.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-[9px] sm:text-xs font-semibold text-gray-700 mb-1 sm:mb-2">🗓️ Periodización (7 Bloques - 44 Semanas)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1 sm:gap-2">
            {trainingBlocks.map((block) => {
              const colors = getBlockColors(block.color);
              return (
                <div key={block.id} className={`${colors.bg} ${colors.border} border rounded p-1 sm:p-2`}>
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <span className={`text-[9px] sm:text-xs font-bold ${colors.text}`}>
                      B{block.id}
                    </span>
                    <span className="text-[8px] sm:text-[10px] text-gray-600">
                      {block.weeks}s
                    </span>
                  </div>
                  <p className="text-[8px] sm:text-[10px] font-medium text-gray-800 mb-0.5 sm:mb-1 line-clamp-2">
                    {block.name}
                  </p>
                  <p className="text-[7px] sm:text-[9px] text-gray-600">
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
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
              <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Semana</Label>
                    <Input
                      type="number"
                      min="-10"
                      max="20"
                      value={workoutFormData.week}
                      onChange={(e) => setWorkoutFormData({ ...workoutFormData, week: parseInt(e.target.value) })}
                      className="text-sm"
                    />
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Semanas negativas son para mantenimiento pre-temporada
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Fecha</Label>
                    <Input
                      placeholder="Ej: 2 de marzo"
                      value={workoutFormData.date}
                      onChange={(e) => setWorkoutFormData({ ...workoutFormData, date: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Día de la Semana</Label>
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
                  <Label className="text-sm">Bloque de Periodización</Label>
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
                  <Label className="text-sm">Intensidad</Label>
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
                <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 shadow-sm">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                    <span className="text-base sm:text-lg">🧮</span>
                    Distancia Total - Cálculo Automático
                  </h4>

                  {/* Desglose por sección */}
                  <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
                    <div className="bg-white rounded-md p-2 sm:p-3 border border-gray-300 flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Calentamiento</span>
                      <span className="text-sm sm:text-lg font-bold text-orange-600">{warmupDistance}m</span>
                    </div>
                    <div className="bg-white rounded-md p-2 sm:p-3 border border-gray-300 flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Serie Principal</span>
                      <span className="text-sm sm:text-lg font-bold text-purple-600">{mainSetDistance}m</span>
                    </div>
                    <div className="bg-white rounded-md p-2 sm:p-3 border border-gray-300 flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Enfriamiento</span>
                      <span className="text-sm sm:text-lg font-bold text-cyan-600">{cooldownDistance}m</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="bg-white rounded-md p-3 sm:p-4 border-2 border-blue-400 shadow-md">
                    <Label className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 block">Distancia Total</Label>
                    <div className="text-2xl sm:text-4xl font-bold text-blue-600">
                      {calculatedDistance}m
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-600 bg-white p-1.5 sm:p-2 rounded border border-gray-200">
                    <strong>💡 Tip:</strong> Formatos soportados: "300m", "4x100m", "8*50", "1.5km", "2x(4x100m)", "200 metros"
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Calentamiento</Label>
                  <Input
                    placeholder="Ej: 300m libre suave + 200m técnica, 500 metros combinado"
                    value={workoutFormData.warmup}
                    onChange={(e) => setWorkoutFormData({ ...workoutFormData, warmup: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Series Principales</Label>
                  {workoutFormData.mainSet.map((item, index) => (
                    <div key={`mainset-${index}`} className="flex gap-1.5 sm:gap-2">
                      <Input
                        placeholder="Ej: 4x100m libre, 8*50 técnica, 2x(4x100m)"
                        value={item}
                        onChange={(e) => updateMainSet(index, e.target.value)}
                        className="text-sm"
                      />
                      {workoutFormData.mainSet.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMainSetItem(index)}
                          className="flex-shrink-0 px-2 sm:px-3"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addMainSetItem} className="w-full sm:w-auto">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Agregar Serie</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Enfriamiento</Label>
                  <Input
                    placeholder="Ej: 200m libre suave, 150 metros relajado"
                    value={workoutFormData.cooldown}
                    onChange={(e) => setWorkoutFormData({ ...workoutFormData, cooldown: e.target.value })}
                    className="text-sm"
                  />
                </div>

                {/* Modo Multi-Día */}
                {!editingWorkout && (
                  <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
                    <div className="flex items-center space-x-2 mb-2 sm:mb-3">
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
                        className="flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                      >
                        <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        <span className="font-semibold text-xs sm:text-sm">Crear para múltiples días</span>
                      </Label>
                    </div>

                    {multiDayMode && (
                      <div className="space-y-2 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs sm:text-sm text-gray-700 mb-2">
                          Selecciona los días para los cuales crear este entrenamiento:
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {availableDays.map(day => (
                            <Button
                              key={day}
                              type="button"
                              size="sm"
                              variant={selectedDays.includes(day) ? "default" : "outline"}
                              onClick={() => toggleDaySelection(day)}
                              className={`text-xs sm:text-sm px-2 sm:px-3 py-1 ${selectedDays.includes(day) ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
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
              <div className="grid gap-3 sm:gap-4 py-2 sm:py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Semana</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={challengeFormData.week}
                      onChange={(e) => setChallengeFormData({ ...challengeFormData, week: parseInt(e.target.value) })}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Fecha</Label>
                    <Input
                      placeholder="Ej: 7 de marzo"
                      value={challengeFormData.date}
                      onChange={(e) => setChallengeFormData({ ...challengeFormData, date: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Día</Label>
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
                    <Label className="text-sm">Mesociclo</Label>
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
                  <Label className="text-sm">Nombre del Desafío</Label>
                  <Input
                    placeholder="Ej: Desafío de los 4 Estilos"
                    value={challengeFormData.challengeName}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, challengeName: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Descripción</Label>
                  <Textarea
                    placeholder="Descripción del desafío..."
                    value={challengeFormData.description}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, description: e.target.value })}
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Distancia (m)</Label>
                    <Input
                      type="number"
                      min="1000"
                      step="100"
                      value={challengeFormData.distance}
                      onChange={(e) => setChallengeFormData({ ...challengeFormData, distance: parseInt(e.target.value) })}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Duración (min)</Label>
                    <Input
                      type="number"
                      min="30"
                      step="5"
                      value={challengeFormData.duration}
                      onChange={(e) => setChallengeFormData({ ...challengeFormData, duration: parseInt(e.target.value) })}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Intensidad</Label>
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
                  <Label className="text-sm">Reglas</Label>
                  {challengeFormData.rules.map((rule, index) => (
                    <div key={`rule-${index}`} className="flex gap-1.5 sm:gap-2">
                      <Input
                        placeholder="Regla del desafío..."
                        value={rule}
                        onChange={(e) => updateRule(index, e.target.value)}
                        className="text-sm"
                      />
                      {challengeFormData.rules.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRule(index)}
                          className="flex-shrink-0 px-2 sm:px-3"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addRule} className="w-full sm:w-auto">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Agregar Regla</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Premios</Label>
                  <Input
                    placeholder="Ej: El equipo ganador elige la música del próximo entrenamiento"
                    value={challengeFormData.prizes}
                    onChange={(e) => setChallengeFormData({ ...challengeFormData, prizes: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className={`w-full sm:w-auto ${eventType === "workout" ? "" : "bg-orange-600 hover:bg-orange-700"}`}
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

      {/* Panel de detalles del día seleccionado */}
      {viewDetailsDay && (
        <Card className="lg:col-span-1 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] flex flex-col">
          <CardHeader className="px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">
                {viewDetailsDay.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewDetailsDay(null)}
                className="h-7 w-7 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 py-3 sm:py-4 space-y-4 overflow-y-auto flex-1">
            {/* Entrenamientos del día */}
            {viewDetailsDay.workouts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Waves className="w-4 h-4 text-blue-600" />
                  Entrenamientos
                </h3>
                {viewDetailsDay.workouts.map((workout) => {
                  const block = getBlockForWeek(workout.week);
                  const colors = block ? getBlockColors(block.color) : { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' };

                  return (
                    <div key={workout.id} className={`${colors.bg} border ${colors.border} rounded-lg p-3 space-y-2`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${colors.bg} ${colors.border} border-2`}></div>
                          <span className={`text-sm font-bold ${colors.text}`}>{workout.mesociclo}</span>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditWorkout(workout);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Distancia:</span>
                          <span className={`font-bold ${colors.text}`}>{workout.distance}m</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Duración:</span>
                          <span className="font-semibold text-gray-700">{workout.duration} min</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Intensidad:</span>
                          <span className="font-semibold text-gray-700">{workout.intensity}</span>
                        </div>
                      </div>

                      {workout.warmup && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs font-semibold text-orange-600 mb-1">Calentamiento</p>
                          <p className="text-xs text-gray-700">{workout.warmup}</p>
                        </div>
                      )}

                      {workout.mainSet && workout.mainSet.length > 0 && workout.mainSet[0] && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs font-semibold text-purple-600 mb-1">Serie Principal</p>
                          <div className="space-y-1">
                            {workout.mainSet.map((set, idx) => (
                              <p key={idx} className="text-xs text-gray-700">• {set}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {workout.cooldown && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs font-semibold text-cyan-600 mb-1">Enfriamiento</p>
                          <p className="text-xs text-gray-700">{workout.cooldown}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Desafíos del día */}
            {viewDetailsDay.challenges.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-orange-600" />
                  Desafíos
                </h3>
                {viewDetailsDay.challenges.map((challenge) => (
                  <div key={challenge.id} className="bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-300 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-orange-900">{challenge.challengeName}</span>
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditChallenge(challenge);
                          }}
                          className="text-orange-600 hover:text-orange-800 text-xs"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-700">{challenge.description}</p>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Distancia:</span>
                        <span className="font-bold text-orange-900">{challenge.distance}m</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Duración:</span>
                        <span className="font-semibold text-gray-700">{challenge.duration} min</span>
                      </div>
                    </div>

                    {challenge.rules && challenge.rules.length > 0 && challenge.rules[0] && (
                      <div className="pt-2 border-t border-orange-200">
                        <p className="text-xs font-semibold text-orange-800 mb-1">Reglas</p>
                        <div className="space-y-1">
                          {challenge.rules.map((rule, idx) => (
                            <p key={idx} className="text-xs text-gray-700">• {rule}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {challenge.prizes && (
                      <div className="pt-2 border-t border-orange-200">
                        <p className="text-xs font-semibold text-orange-800 mb-1">Premios</p>
                        <p className="text-xs text-gray-700">{challenge.prizes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {viewDetailsDay.workouts.length === 0 && viewDetailsDay.challenges.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No hay entrenamientos ni desafíos para este día</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}