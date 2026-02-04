import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Loader2, Trash2, RefreshCw, AlertTriangle, CheckCircle2, FileSearch } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

interface Workout {
  id: number;
  week: number;
  day: string;
  date: string;
  mesociclo: string;
  distance: number;
  warm_up?: string;
  main_set?: string;
  cool_down?: string;
  created_at?: string;
}

interface DuplicateGroup {
  week: number;
  day: string;
  date: string;
  count: number;
  workouts: Workout[];
  toKeep: Workout | null;
  toDelete: Workout[];
}

export function AdvancedDuplicateCleaner() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [totalDuplicates, setTotalDuplicates] = useState(0);
  const [cleanupResult, setCleanupResult] = useState<{ success: number; failed: number } | null>(null);

  // Analizar duplicados
  const analyzeDuplicates = async () => {
    setAnalyzing(true);
    setCleanupResult(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-000a47d9/workouts`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar entrenamientos");
      }

      const data = await response.json();
      const workouts: Workout[] = data.workouts || data; // Soportar ambos formatos

      // Agrupar por semana + día + fecha
      const groupMap = new Map<string, Workout[]>();

      workouts.forEach((workout) => {
        const key = `${workout.week}-${workout.day}-${workout.date}`;
        if (!groupMap.has(key)) {
          groupMap.set(key, []);
        }
        groupMap.get(key)!.push(workout);
      });

      // Identificar grupos con duplicados
      const duplicateGroups: DuplicateGroup[] = [];
      let totalDuplicateCount = 0;

      groupMap.forEach((workoutGroup, key) => {
        if (workoutGroup.length > 1) {
          // Ordenar por ID (más reciente = ID más alto)
          workoutGroup.sort((a, b) => b.id - a.id);

          const toKeep = workoutGroup[0]; // El más reciente
          const toDelete = workoutGroup.slice(1); // Los demás

          duplicateGroups.push({
            week: workoutGroup[0].week,
            day: workoutGroup[0].day,
            date: workoutGroup[0].date,
            count: workoutGroup.length,
            workouts: workoutGroup,
            toKeep,
            toDelete,
          });

          totalDuplicateCount += toDelete.length;
        }
      });

      // Ordenar por semana y día
      duplicateGroups.sort((a, b) => {
        if (a.week !== b.week) return a.week - b.week;
        
        const dayOrder: { [key: string]: number } = {
          'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4,
          'Viernes': 5, 'Sábado': 6, 'Domingo': 7
        };
        
        return (dayOrder[a.day] || 0) - (dayOrder[b.day] || 0);
      });

      setDuplicates(duplicateGroups);
      setTotalDuplicates(totalDuplicateCount);

    } catch (error) {
      console.error("Error al analizar duplicados:", error);
      alert("Error al analizar duplicados. Revisa la consola.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Limpiar duplicados automáticamente
  const cleanupDuplicates = async () => {
    if (duplicates.length === 0) {
      alert("No hay duplicados para limpiar.");
      return;
    }

    const confirmed = confirm(
      `¿Estás seguro de eliminar ${totalDuplicates} entrenamientos duplicados?\n\n` +
      `Se mantendrá solo el entrenamiento más reciente de cada grupo.\n\n` +
      `Esta acción NO se puede deshacer.`
    );

    if (!confirmed) return;

    setLoading(true);
    let successCount = 0;
    let failedCount = 0;

    try {
      // Recopilar todos los IDs a eliminar
      const idsToDelete: number[] = [];
      duplicates.forEach((group) => {
        group.toDelete.forEach((workout) => {
          idsToDelete.push(workout.id);
        });
      });

      console.log(`🗑️ Eliminando ${idsToDelete.length} entrenamientos duplicados...`);

      // Eliminar en lotes de 50
      const batchSize = 50;
      for (let i = 0; i < idsToDelete.length; i += batchSize) {
        const batch = idsToDelete.slice(i, i + batchSize);

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-000a47d9/workouts/bulk-delete`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ ids: batch }),
          }
        );

        if (response.ok) {
          successCount += batch.length;
        } else {
          failedCount += batch.length;
          console.error(`Error al eliminar lote de ${batch.length} entrenamientos`);
        }
      }

      setCleanupResult({ success: successCount, failed: failedCount });

      // Re-analizar después de limpiar
      if (successCount > 0) {
        setTimeout(() => {
          analyzeDuplicates();
        }, 1000);
      }

    } catch (error) {
      console.error("Error durante la limpieza:", error);
      alert("Error durante la limpieza. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  // Analizar al montar el componente
  useEffect(() => {
    analyzeDuplicates();
  }, []);

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-purple-900 flex items-center gap-2">
              <FileSearch className="w-6 h-6" />
              🧹 Limpiador Avanzado de Duplicados
            </CardTitle>
            <CardDescription className="text-purple-700">
              Análisis completo y limpieza automática de entrenamientos duplicados
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeDuplicates}
            disabled={analyzing || loading}
            className="border-purple-300"
          >
            {analyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span className="ml-2">Refrescar</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Resultado de limpieza */}
        {cleanupResult && (
          <Alert className={cleanupResult.failed === 0 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
            <CheckCircle2 className={`w-4 h-4 ${cleanupResult.failed === 0 ? "text-green-600" : "text-yellow-600"}`} />
            <AlertDescription className={cleanupResult.failed === 0 ? "text-green-900" : "text-yellow-900"}>
              ✅ <strong>Limpieza completada:</strong> {cleanupResult.success} duplicados eliminados
              {cleanupResult.failed > 0 && ` | ${cleanupResult.failed} fallaron`}
            </AlertDescription>
          </Alert>
        )}

        {/* Resumen */}
        {analyzing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-purple-700">Analizando entrenamientos...</span>
          </div>
        ) : duplicates.length === 0 ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-900">
              ✨ <strong>¡Perfecto!</strong> No se encontraron entrenamientos duplicados en la base de datos.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-purple-100 rounded-lg p-4">
                <p className="text-sm text-purple-700">Grupos Duplicados</p>
                <p className="text-2xl font-bold text-purple-900">{duplicates.length}</p>
              </div>
              <div className="bg-red-100 rounded-lg p-4">
                <p className="text-sm text-red-700">Total a Eliminar</p>
                <p className="text-2xl font-bold text-red-900">{totalDuplicates}</p>
              </div>
              <div className="bg-green-100 rounded-lg p-4">
                <p className="text-sm text-green-700">Se Mantendrán</p>
                <p className="text-2xl font-bold text-green-900">{duplicates.length}</p>
              </div>
            </div>

            {/* Botón de limpieza */}
            <Button
              onClick={cleanupDuplicates}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Eliminando duplicados...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar {totalDuplicates} Duplicados Automáticamente
                </>
              )}
            </Button>

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <AlertDescription className="text-yellow-900 text-sm">
                <strong>Nota:</strong> Se mantendrá el entrenamiento más reciente (ID más alto) de cada grupo y se eliminarán los demás.
              </AlertDescription>
            </Alert>

            {/* Lista detallada de duplicados */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              <h3 className="font-semibold text-purple-900 sticky top-0 bg-white py-2">
                📋 Detalle de Duplicados Encontrados ({duplicates.length})
              </h3>
              
              {duplicates.map((group, index) => (
                <div key={index} className="border border-purple-200 rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-100 text-purple-900">
                        Semana {group.week}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-100 text-blue-900">
                        {group.day}
                      </Badge>
                      <span className="text-sm text-gray-600">{group.date}</span>
                    </div>
                    <Badge variant="destructive" className="bg-red-100 text-red-900">
                      {group.count} duplicados
                    </Badge>
                  </div>

                  {/* Mostrar el que se va a mantener */}
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-900">Se mantendrá:</span>
                    </div>
                    <div className="ml-6 text-sm text-gray-700 bg-green-50 p-2 rounded border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs text-gray-500">ID: {group.toKeep?.id}</span>
                          <span className="mx-2">•</span>
                          <span>{group.toKeep?.mesociclo}</span>
                          <span className="mx-2">•</span>
                          <span>{group.toKeep?.distance}m</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mostrar los que se van a eliminar */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-900">Se eliminarán ({group.toDelete.length}):</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      {group.toDelete.map((workout) => (
                        <div key={workout.id} className="text-sm text-gray-700 bg-red-50 p-2 rounded border border-red-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-mono text-xs text-gray-500">ID: {workout.id}</span>
                              <span className="mx-2">•</span>
                              <span>{workout.mesociclo}</span>
                              <span className="mx-2">•</span>
                              <span>{workout.distance}m</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}