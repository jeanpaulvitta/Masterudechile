import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Plus, Edit, Trash2, Dumbbell, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Waves } from "lucide-react";
import type { Workout } from "../data/workouts";
import { useAuth } from "../contexts/AuthContext";

interface WorkoutManagerProps {
  workouts: Workout[];
  onAddWorkout: (workout: Omit<Workout, "id">) => void;
  onEditWorkout: (id: string, workout: Omit<Workout, "id">) => void;
  onDeleteWorkout: (id: string) => void;
  onSyncFromLocal?: () => Promise<void>;
}

interface CalendarDay {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  workouts: Workout[];
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DAY_NAMES_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function WorkoutManager({ workouts, onAddWorkout, onEditWorkout, onDeleteWorkout, onSyncFromLocal }: WorkoutManagerProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "coach";
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [multiDayMode, setMultiDayMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [multiScheduleMode, setMultiScheduleMode] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState<("AM" | "PM")[]>([]);
  const [formData, setFormData] = useState<Omit<Workout, "id">>({
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

  const availableDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const availableSchedules: ("AM" | "PM")[] = ["AM", "PM"];

  // Helper para parsear fechas en formato "3 de febrero"
  const parseWorkoutDate = (dateText: string, year: number = 2026): Date | null => {
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
        return new Date(year, month, day);
      }
    }
    
    return null;
  };

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    // Generar 6 semanas
    for (let i = 0; i < 42; i++) {
      const dateString = currentDate.toISOString().split("T")[0];
      const isToday =
        currentDate.getDate() === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

      // Filtrar entrenamientos para este día
      const dayWorkouts = workouts.filter((workout) => {
        // Primero verificar que el día de la semana coincida
        const workoutDay = DAY_NAMES_FULL[currentDate.getDay()];
        if (workout.day !== workoutDay) return false;
        
        // Intentar parsear la fecha del entrenamiento
        const workoutParsedDate = parseWorkoutDate(workout.date, currentYear);
        
        if (workoutParsedDate) {
          // Comparar fechas usando objetos Date
          return workoutParsedDate.getDate() === currentDate.getDate() &&
                 workoutParsedDate.getMonth() === currentDate.getMonth() &&
                 workoutParsedDate.getFullYear() === currentDate.getFullYear();
        }
        
        // Fallback al método anterior si no se pudo parsear
        const workoutDate = currentDate.getDate();
        const workoutMonth = MONTHS[currentDate.getMonth()].toLowerCase();
        return workout.date.toLowerCase().includes(workoutDate.toString()) &&
               workout.date.toLowerCase().includes(workoutMonth);
      });

      days.push({
        date: new Date(currentDate),
        dateString,
        isCurrentMonth: currentDate.getMonth() === currentMonth,
        isToday,
        workouts: dayWorkouts,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [currentMonth, currentYear, workouts, today]);

  const toggleDaySelection = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const toggleScheduleSelection = (schedule: "AM" | "PM") => {
    setSelectedSchedules(prev => 
      prev.includes(schedule) 
        ? prev.filter(s => s !== schedule)
        : [...prev, schedule]
    );
  };

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    
    setSelectedDay(day);
    
    // Pre-rellenar el formulario con el día seleccionado
    const dayName = DAY_NAMES_FULL[day.date.getDay()];
    const monthName = MONTHS[day.date.getMonth()].toLowerCase();
    const dateString = `${day.date.getDate()} de ${monthName}`;
    
    setFormData({
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
    setDialogOpen(true);
  };

  const handleWorkoutClick = (workout: Workout, e: React.MouseEvent) => {
    e.stopPropagation();
    handleEdit(workout);
  };

  const handleSubmit = () => {
    if (editingWorkout && editingWorkout.id) {
      onEditWorkout(editingWorkout.id, formData);
    } else {
      const daysToUse = multiDayMode && selectedDays.length > 0 ? selectedDays : [formData.day];
      const schedulesToUse = multiScheduleMode && selectedSchedules.length > 0 ? selectedSchedules : [formData.schedule || "AM"];
      
      daysToUse.forEach(day => {
        schedulesToUse.forEach(schedule => {
          onAddWorkout({
            ...formData,
            day: day,
            schedule: schedule
          });
        });
      });
    }
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
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
    setEditingWorkout(null);
    setMultiDayMode(false);
    setSelectedDays([]);
    setMultiScheduleMode(false);
    setSelectedSchedules([]);
    setSelectedDay(null);
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setFormData({
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

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de que deseas eliminar este entrenamiento?")) {
      onDeleteWorkout(id);
    }
  };

  const updateMainSet = (index: number, value: string) => {
    const newMainSet = [...formData.mainSet];
    newMainSet[index] = value;
    setFormData({ ...formData, mainSet: newMainSet });
  };

  const addMainSetItem = () => {
    setFormData({ ...formData, mainSet: [...formData.mainSet, ""] });
  };

  const removeMainSetItem = (index: number) => {
    const newMainSet = formData.mainSet.filter((_, i) => i !== index);
    setFormData({ ...formData, mainSet: newMainSet });
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
            <Dumbbell className="w-5 h-5 text-blue-600" />
            <CardTitle>Gestionar Entrenamientos</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Navegación del calendario */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={previousMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {MONTHS[currentMonth]} {currentYear}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-600 mb-4 text-center">
          Total de entrenamientos: <span className="font-semibold text-blue-600">{workouts.length}</span>
          <br />
          <span className="text-xs">Haz clic en un día para agregar un entrenamiento</span>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const hasWorkouts = day.workouts.length > 0;

            return (
              <div
                key={index}
                onClick={() => day.isCurrentMonth && handleDayClick(day)}
                className={`
                  min-h-[80px] p-1 rounded-lg border transition-all text-left
                  ${day.isCurrentMonth ? "bg-white hover:bg-blue-50 hover:border-blue-400 cursor-pointer" : "bg-gray-50 opacity-40 cursor-default"}
                  ${day.isToday ? "border-2 border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}
                  ${hasWorkouts ? "border-blue-300" : ""}
                `}
              >
                <div className="flex flex-col h-full">
                  {/* Número del día */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold ${
                        day.isToday
                          ? "text-blue-600"
                          : day.isCurrentMonth
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                    {hasWorkouts && (
                      <span className="text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                        {day.workouts.length}
                      </span>
                    )}
                  </div>

                  {/* Lista de entrenamientos */}
                  <div className="flex flex-col gap-0.5 flex-1">
                    {day.workouts.slice(0, 2).map((workout) => (
                      <div
                        key={workout.id}
                        onClick={(e) => handleWorkoutClick(workout, e)}
                        className="group relative flex items-center gap-1 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded px-1 py-0.5 transition-colors cursor-pointer"
                      >
                        <Waves className="w-2 h-2 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-blue-900 font-medium truncate">
                            {workout.schedule === "AM" ? "🌅" : "🌆"} S{workout.week}
                          </p>
                        </div>
                        <button
                          onClick={(e) => workout.id && handleDelete(workout.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    ))}
                    {day.workouts.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{day.workouts.length - 2} más
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diálogo para agregar/editar */}
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWorkout ? "Editar Entrenamiento" : `Nuevo Entrenamiento - ${selectedDay?.date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}`}
              </DialogTitle>
              <DialogDescription>
                {editingWorkout ? "Modifica los detalles del entrenamiento existente." : "Añade un nuevo entrenamiento a tu plan."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Semana</Label>
                  <Input
                    type="number"
                    min="-10"
                    max="20"
                    value={formData.week}
                    onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500">
                    Semanas negativas son para mantenimiento pre-temporada
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    placeholder="Ej: 2 de marzo"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Día</Label>
                  <Select value={formData.day} onValueChange={(value) => setFormData({ ...formData, day: value })}>
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
                  <Label>Horario</Label>
                  <Select value={formData.schedule} onValueChange={(value) => setFormData({ ...formData, schedule: value as "AM" | "PM" })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">🌅 Mañana (AM)</SelectItem>
                      <SelectItem value="PM">🌆 Tarde (PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mesociclo</Label>
                <Select value={formData.mesociclo} onValueChange={(value) => setFormData({ ...formData, mesociclo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="Base">Base</SelectItem>
                    <SelectItem value="Desarrollo">Desarrollo</SelectItem>
                    <SelectItem value="Pre-competitivo">Pre-competitivo</SelectItem>
                    <SelectItem value="Competitivo">Competitivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Distancia (m)</Label>
                  <Input
                    type="number"
                    min="1000"
                    step="100"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duración (min)</Label>
                  <Input
                    type="number"
                    min="30"
                    step="5"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Intensidad</Label>
                  <Select value={formData.intensity} onValueChange={(value) => setFormData({ ...formData, intensity: value })}>
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
                <Label>Calentamiento</Label>
                <Input
                  placeholder="Ej: 300m estilo libre suave + 200m técnica"
                  value={formData.warmup}
                  onChange={(e) => setFormData({ ...formData, warmup: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Series Principales</Label>
                {formData.mainSet.map((item, index) => (
                  <div key={`mainset-${index}`} className="flex gap-2">
                    <Input
                      placeholder="Ej: 4 x 100m estilo libre (descanso 20s)"
                      value={item}
                      onChange={(e) => updateMainSet(index, e.target.value)}
                    />
                    {formData.mainSet.length > 1 && (
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
                  value={formData.cooldown}
                  onChange={(e) => setFormData({ ...formData, cooldown: e.target.value })}
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
                          setSelectedDays([formData.day]);
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

              {/* Modo Multi-Horario */}
              {!editingWorkout && (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id="multi-schedule-mode"
                      checked={multiScheduleMode}
                      onCheckedChange={(checked) => {
                        setMultiScheduleMode(checked as boolean);
                        if (checked) {
                          setSelectedSchedules([formData.schedule || "AM"]);
                        }
                      }}
                    />
                    <Label 
                      htmlFor="multi-schedule-mode" 
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <CalendarIcon className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">Crear para múltiples horarios</span>
                    </Label>
                  </div>
                  
                  {multiScheduleMode && (
                    <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-700 mb-2">
                        Selecciona los horarios para los cuales crear este entrenamiento:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableSchedules.map(schedule => (
                          <Button
                            key={schedule}
                            type="button"
                            size="sm"
                            variant={selectedSchedules.includes(schedule) ? "default" : "outline"}
                            onClick={() => toggleScheduleSelection(schedule)}
                            className={selectedSchedules.includes(schedule) ? 'bg-blue-600 hover:bg-blue-700' : ''}
                          >
                            {schedule}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        {selectedSchedules.length > 0 
                          ? `Se crearán ${selectedSchedules.length} entrenamiento(s): ${selectedSchedules.join(', ')}`
                          : 'Selecciona al menos un horario'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingWorkout ? "Guardar Cambios" : "Crear Entrenamiento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}