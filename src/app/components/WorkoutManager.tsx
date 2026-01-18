import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Plus, Edit, Trash2, Dumbbell, Calendar } from "lucide-react";
import type { Workout } from "../data/workouts";
import { useAuth } from "../contexts/AuthContext";

interface WorkoutManagerProps {
  workouts: Workout[];
  onAddWorkout: (workout: Omit<Workout, "id">) => void;
  onEditWorkout: (id: string, workout: Omit<Workout, "id">) => void;
  onDeleteWorkout: (id: string) => void;
}

export function WorkoutManager({ workouts, onAddWorkout, onEditWorkout, onDeleteWorkout }: WorkoutManagerProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "coach";
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [multiDayMode, setMultiDayMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(["Lunes"]);
  const [multiScheduleMode, setMultiScheduleMode] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState<("AM" | "PM")[]>(["AM"]);
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

  const handleSubmit = () => {
    if (editingWorkout && editingWorkout.id) {
      onEditWorkout(editingWorkout.id, formData);
    } else {
      // Determinar qué días y horarios usar
      const daysToUse = multiDayMode && selectedDays.length > 0 ? selectedDays : [formData.day];
      const schedulesToUse = multiScheduleMode && selectedSchedules.length > 0 ? selectedSchedules : [formData.schedule || "AM"];
      
      // Crear un entrenamiento para cada combinación de día y horario
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
    setSelectedDays(["Lunes"]);
    setMultiScheduleMode(false);
    setSelectedSchedules(["AM"]);
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

  const handleDelete = (id: string) => {
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
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 px-2">
                <Plus className="w-3 h-3 mr-1" />
                Agregar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingWorkout ? "Editar Entrenamiento" : "Nuevo Entrenamiento"}
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
                      min="1"
                      max="20"
                      value={formData.week}
                      onChange={(e) => setFormData({ ...formData, week: parseInt(e.target.value) })}
                    />
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

                {/* Modo Multi-Día - Solo visible cuando NO estamos editando */}
                {!editingWorkout && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Checkbox
                        id="multi-day-mode"
                        checked={multiDayMode}
                        onCheckedChange={(checked) => {
                          setMultiDayMode(checked as boolean);
                          if (checked) {
                            setSelectedDays([formData.day]); // Incluir el día actual como seleccionado
                          }
                        }}
                      />
                      <Label 
                        htmlFor="multi-day-mode" 
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-blue-600" />
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

                {/* Modo Multi-Horario - Solo visible cuando NO estamos editando */}
                {!editingWorkout && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Checkbox
                        id="multi-schedule-mode"
                        checked={multiScheduleMode}
                        onCheckedChange={(checked) => {
                          setMultiScheduleMode(checked as boolean);
                          if (checked) {
                            setSelectedSchedules([formData.schedule || "AM"]); // Incluir el horario actual como seleccionado
                          }
                        }}
                      />
                      <Label 
                        htmlFor="multi-schedule-mode" 
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-blue-600" />
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
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-sm text-gray-600 mb-4">
          Total de entrenamientos: <span className="font-semibold text-blue-600">{workouts.length}</span>
        </div>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="font-semibold">
                  Semana {workout.week} - {workout.day} ({workout.date})
                  {workout.schedule && (
                    <span className="ml-2 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                      {workout.schedule === "AM" ? "🌅 AM" : "🌆 PM"}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {workout.mesociclo} • {workout.distance}m • {workout.intensity}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(workout)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => workout.id && handleDelete(workout.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}