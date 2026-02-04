import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { AlertTriangle, Trash2, Calendar, MapPin, CheckSquare, Square } from 'lucide-react';
import * as api from '../services/api';

interface Workout {
  id: string;
  week: number;
  day: string;
  date: string;
  mesociclo?: string;
  distance: number;
  warmUp?: string;
  mainSet?: string;
  coolDown?: string;
}

export function DuplicateWorkoutsFinder() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [duplicates, setDuplicates] = useState<{ [key: string]: Workout[] }>({});
  const [wrongDayWorkouts, setWrongDayWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  
  // Estados para selección múltiple
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<string>>(new Set());
  const [selectedWrongDays, setSelectedWrongDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      const data = await api.fetchWorkouts();
      setWorkouts(data);
      findDuplicates(data);
      findWrongDayWorkouts(data);
    } catch (error) {
      console.error('Error cargando entrenamientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const findDuplicates = (workoutList: Workout[]) => {
    const grouped: { [key: string]: Workout[] } = {};
    
    workoutList.forEach(workout => {
      // Crear una clave única basada en semana + día
      const key = `S${workout.week}-${workout.day}`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(workout);
    });

    // Filtrar solo los que tienen duplicados
    const duplicatesFound: { [key: string]: Workout[] } = {};
    Object.entries(grouped).forEach(([key, workouts]) => {
      if (workouts.length > 1) {
        duplicatesFound[key] = workouts;
      }
    });

    setDuplicates(duplicatesFound);
  };

  const findWrongDayWorkouts = (workoutList: Workout[]) => {
    // Solo permitir Lunes, Miércoles, Viernes
    const validDays = ['Lunes', 'Miércoles', 'Viernes'];
    
    const wrongDays = workoutList.filter(workout => {
      return !validDays.includes(workout.day);
    });
    
    setWrongDayWorkouts(wrongDays);
  };

  const handleDelete = async (workoutId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este entrenamiento?')) {
      return;
    }

    try {
      setDeleting(workoutId);
      await api.deleteWorkout(workoutId);
      
      // Recargar entrenamientos
      await loadWorkouts();
      
      alert('✅ Entrenamiento eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando entrenamiento:', error);
      alert('❌ Error al eliminar el entrenamiento');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteSelected = async (type: 'duplicates' | 'wrongDays') => {
    const selected = type === 'duplicates' ? selectedDuplicates : selectedWrongDays;
    const count = selected.size;
    
    if (count === 0) {
      alert('⚠️ No hay entrenamientos seleccionados');
      return;
    }
    
    if (!confirm(`¿Estás seguro de eliminar ${count} entrenamiento(s) seleccionado(s)?`)) {
      return;
    }

    try {
      setDeletingAll(true);
      
      // Eliminar en lotes de 5 para evitar sobrecargar el servidor
      const idsArray = Array.from(selected);
      const BATCH_SIZE = 5;
      
      for (let i = 0; i < idsArray.length; i += BATCH_SIZE) {
        const batch = idsArray.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(id => api.deleteWorkout(id)));
        
        // Pequeño delay entre lotes
        if (i + BATCH_SIZE < idsArray.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Limpiar selección y recargar
      if (type === 'duplicates') {
        setSelectedDuplicates(new Set());
      } else {
        setSelectedWrongDays(new Set());
      }
      
      await loadWorkouts();
      
      alert(`✅ ${count} entrenamiento(s) eliminado(s) correctamente`);
    } catch (error) {
      console.error('Error eliminando entrenamientos:', error);
      alert('❌ Error al eliminar algunos entrenamientos');
    } finally {
      setDeletingAll(false);
    }
  };

  const toggleSelectDuplicate = (id: string) => {
    const newSelected = new Set(selectedDuplicates);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDuplicates(newSelected);
  };

  const toggleSelectWrongDay = (id: string) => {
    const newSelected = new Set(selectedWrongDays);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedWrongDays(newSelected);
  };

  const toggleSelectAllDuplicates = () => {
    const allDuplicateIds = Object.values(duplicates).flat().map(w => w.id);
    if (selectedDuplicates.size === allDuplicateIds.length) {
      setSelectedDuplicates(new Set());
    } else {
      setSelectedDuplicates(new Set(allDuplicateIds));
    }
  };

  const toggleSelectAllWrongDays = () => {
    const allWrongDayIds = wrongDayWorkouts.map(w => w.id);
    if (selectedWrongDays.size === allWrongDayIds.length) {
      setSelectedWrongDays(new Set());
    } else {
      setSelectedWrongDays(new Set(allWrongDayIds));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Cargando entrenamientos...</p>
        </CardContent>
      </Card>
    );
  }

  const duplicateCount = Object.keys(duplicates).length;
  const totalDuplicatedWorkouts = Object.values(duplicates).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="w-5 h-5" />
          Detector de Entrenamientos Duplicados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen */}
        <div className="bg-white rounded-lg p-4 border border-orange-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Total Entrenamientos</p>
              <p className="text-2xl font-bold text-gray-900">{workouts.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sesiones Duplicadas</p>
              <p className="text-2xl font-bold text-orange-600">{duplicateCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Entrenamientos Extras</p>
              <p className="text-2xl font-bold text-red-600">{totalDuplicatedWorkouts - duplicateCount}</p>
            </div>
          </div>
        </div>

        {/* Mensaje */}
        {duplicateCount === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800 font-semibold">✅ No hay entrenamientos duplicados</p>
            <p className="text-sm text-green-600 mt-1">Todos los entrenamientos están bien organizados</p>
          </div>
        ) : (
          <>
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
              <p className="text-orange-900 font-semibold">
                ⚠️ Se encontraron {duplicateCount} sesiones con entrenamientos duplicados
              </p>
              <p className="text-sm text-orange-700 mt-1">
                Revisa cada uno y elimina los que no necesites. Mantén solo el más reciente o completo.
              </p>
            </div>

            {/* Barra de herramientas de selección múltiple */}
            <div className="bg-white border border-orange-300 rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleSelectAllDuplicates}
                  className="flex items-center gap-2"
                >
                  {selectedDuplicates.size === totalDuplicatedWorkouts ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  {selectedDuplicates.size === totalDuplicatedWorkouts ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                </Button>
                
                {selectedDuplicates.size > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {selectedDuplicates.size} seleccionado(s)
                  </Badge>
                )}
              </div>

              {selectedDuplicates.size > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteSelected('duplicates')}
                  disabled={deletingAll}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingAll ? 'Eliminando...' : `Eliminar ${selectedDuplicates.size} seleccionado(s)`}
                </Button>
              )}
            </div>

            {/* Lista de duplicados */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {Object.entries(duplicates)
                .sort(([keyA], [keyB]) => {
                  const weekA = parseInt(keyA.split('-')[0].replace('S', ''));
                  const weekB = parseInt(keyB.split('-')[0].replace('S', ''));
                  return weekA - weekB;
                })
                .map(([key, workoutList]) => {
                  const [weekStr, day] = key.split('-');
                  const week = weekStr.replace('S', '');

                  return (
                    <Card key={key} className="border-red-200 bg-white">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-red-600" />
                            <h4 className="font-bold text-red-900">
                              Semana {week} - {day}
                            </h4>
                          </div>
                          <Badge variant="destructive">{workoutList.length} entrenamientos</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {workoutList.map((workout, index) => (
                          <div
                            key={workout.id}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2"
                          >
                            {/* Header */}
                            <div className="flex items-start gap-3">
                              {/* Checkbox de selección */}
                              <div className="pt-1">
                                <Checkbox
                                  checked={selectedDuplicates.has(workout.id)}
                                  onCheckedChange={() => toggleSelectDuplicate(workout.id)}
                                  className="cursor-pointer"
                                />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    #{index + 1}
                                  </Badge>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {workout.date}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <MapPin className="w-3 h-3" />
                                  {workout.mesociclo || 'Sin mesociclo'}
                                </div>
                              </div>
                              
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(workout.id)}
                                disabled={deleting === workout.id}
                                className="h-8"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                {deleting === workout.id ? 'Eliminando...' : 'Eliminar'}
                              </Button>
                            </div>

                            {/* Detalles */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500">Distancia:</span>
                                <span className="ml-1 font-medium">{workout.distance}m</span>
                              </div>
                              <div>
                                <span className="text-gray-500">ID:</span>
                                <span className="ml-1 font-mono text-[10px]">
                                  {workout.id.substring(0, 8)}...
                                </span>
                              </div>
                            </div>

                            {/* Preview del contenido */}
                            <div className="bg-white rounded border border-gray-200 p-2 text-xs">
                              <p className="text-gray-600 font-medium mb-1">Calentamiento:</p>
                              <p className="text-gray-700 line-clamp-2">
                                {workout.warmUp || 'No especificado'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            {/* Botón de eliminar todos */}
            <div className="pt-4 border-t">
              <Button
                onClick={async () => {
                  const allDuplicateIds = Object.values(duplicates).flat().map(w => w.id);
                  if (!confirm(`¿Estás seguro de eliminar TODOS los ${allDuplicateIds.length} entrenamientos duplicados?`)) {
                    return;
                  }
                  try {
                    setDeletingAll(true);
                    
                    // Eliminar en lotes
                    const BATCH_SIZE = 5;
                    for (let i = 0; i < allDuplicateIds.length; i += BATCH_SIZE) {
                      const batch = allDuplicateIds.slice(i, i + BATCH_SIZE);
                      await Promise.all(batch.map(id => api.deleteWorkout(id)));
                      
                      if (i + BATCH_SIZE < allDuplicateIds.length) {
                        await new Promise(resolve => setTimeout(resolve, 300));
                      }
                    }
                    
                    setSelectedDuplicates(new Set());
                    await loadWorkouts();
                    alert('✅ Todos los entrenamientos duplicados han sido eliminados');
                  } catch (error) {
                    console.error('Error:', error);
                    alert('❌ Error al eliminar entrenamientos duplicados');
                  } finally {
                    setDeletingAll(false);
                  }
                }}
                variant="destructive"
                className="w-full"
                disabled={deletingAll}
              >
                {deletingAll ? 'Eliminando...' : 'Eliminar Todos los Duplicados'}
              </Button>
            </div>
          </>
        )}

        {/* Sección de entrenamientos en días incorrectos */}
        {wrongDayWorkouts.length > 0 && (
          <div className="space-y-4 mt-6 pt-6 border-t-2 border-red-300">
            <div className="bg-red-100 border border-red-300 rounded-lg p-4">
              <p className="text-red-900 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                ❌ Se encontraron {wrongDayWorkouts.length} entrenamientos en días INCORRECTOS
              </p>
              <p className="text-sm text-red-700 mt-1">
                Solo se permiten entrenamientos en: <strong>Lunes, Miércoles y Viernes</strong>
              </p>
              <p className="text-xs text-red-600 mt-2">
                Encontrados: {[...new Set(wrongDayWorkouts.map(w => w.day))].join(', ')}
              </p>
            </div>

            {/* Barra de herramientas de selección múltiple */}
            <div className="bg-white border border-red-300 rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleSelectAllWrongDays}
                  className="flex items-center gap-2"
                >
                  {selectedWrongDays.size === wrongDayWorkouts.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  {selectedWrongDays.size === wrongDayWorkouts.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                </Button>
                
                {selectedWrongDays.size > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {selectedWrongDays.size} seleccionado(s)
                  </Badge>
                )}
              </div>

              {selectedWrongDays.size > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteSelected('wrongDays')}
                  disabled={deletingAll}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {deletingAll ? 'Eliminando...' : `Eliminar ${selectedWrongDays.size} seleccionado(s)`}
                </Button>
              )}
            </div>

            <div className="grid gap-3 max-h-[400px] overflow-y-auto">
              {wrongDayWorkouts
                .sort((a, b) => a.week - b.week)
                .map((workout) => (
                  <Card key={workout.id} className="border-red-300 bg-red-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {/* Checkbox de selección */}
                        <div className="pt-1">
                          <Checkbox
                            checked={selectedWrongDays.has(workout.id)}
                            onCheckedChange={() => toggleSelectWrongDay(workout.id)}
                            className="cursor-pointer"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive" className="font-bold">
                              ❌ {workout.day}
                            </Badge>
                            <span className="text-sm font-semibold text-gray-900">
                              Semana {workout.week}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-gray-700">
                            <p>📅 Fecha: <strong>{workout.date}</strong></p>
                            <p>📍 Mesociclo: {workout.mesociclo || 'Sin mesociclo'}</p>
                            <p>📏 Distancia: {workout.distance}m</p>
                            <p className="text-[10px] text-gray-500 font-mono">
                              ID: {workout.id.substring(0, 12)}...
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(workout.id)}
                          disabled={deleting === workout.id}
                          className="h-8"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          {deleting === workout.id ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Botón para eliminar todos los días incorrectos */}
            <Button
              onClick={async () => {
                if (!confirm(`¿Estás seguro de eliminar TODOS los ${wrongDayWorkouts.length} entrenamientos en días incorrectos?`)) {
                  return;
                }
                try {
                  setDeletingAll(true);
                  await Promise.all(wrongDayWorkouts.map(w => api.deleteWorkout(w.id)));
                  await loadWorkouts();
                  alert('✅ Todos los entrenamientos en días incorrectos han sido eliminados');
                } catch (error) {
                  console.error('Error:', error);
                  alert('❌ Error al eliminar entrenamientos');
                } finally {
                  setDeletingAll(false);
                }
              }}
              variant="destructive"
              className="w-full"
              disabled={deletingAll}
            >
              {deletingAll ? 'Eliminando...' : `🗑️ Eliminar TODOS los ${wrongDayWorkouts.length} entrenamientos en días incorrectos`}
            </Button>
          </div>
        )}

        {/* Botón de refrescar */}
        <div className="pt-4 border-t">
          <Button onClick={loadWorkouts} variant="outline" className="w-full">
            🔄 Refrescar Lista
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}