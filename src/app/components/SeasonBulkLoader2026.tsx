import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Upload, CheckCircle, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { workouts2026_2027, trainingBlocks, holidays2026 } from '../data/workouts2026-2027';
import type { Workout } from '../data/workouts';

interface SeasonBulkLoader2026Props {
  existingWorkouts: Workout[];
  onAddWorkout: (workout: Omit<Workout, 'id'>) => Promise<void>;
}

export function SeasonBulkLoader2026({ existingWorkouts, onAddWorkout }: SeasonBulkLoader2026Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{ success: number; errors: number; skipped: number }>({
    success: 0,
    errors: 0,
    skipped: 0,
  });

  // Calcular estadísticas
  const totalWorkouts = workouts2026_2027.length;
  const totalDistance = workouts2026_2027.reduce((sum, w) => sum + w.distance, 0);
  const avgDistance = Math.round(totalDistance / totalWorkouts);
  
  // Contar entrenamientos por bloque
  const workoutsByBlock = trainingBlocks.map(block => ({
    ...block,
    count: workouts2026_2027.filter(w => w.mesociclo === block.name).length,
  }));

  // Verificar cuántos ya existen
  const existingCount = workouts2026_2027.filter(newWorkout => 
    existingWorkouts.some(existing => 
      existing.week === newWorkout.week && 
      existing.day === newWorkout.day
    )
  ).length;

  const newWorkoutsCount = totalWorkouts - existingCount;

  const handleBulkLoad = async () => {
    if (newWorkoutsCount === 0) {
      alert('✅ Todos los entrenamientos de la temporada 2026-2027 ya están cargados.');
      return;
    }

    const confirmMsg = [
      '📅 CARGA MASIVA DE TEMPORADA 2026-2027',
      '',
      `🏊 Total entrenamientos: ${totalWorkouts}`,
      `✅ Ya existentes: ${existingCount}`,
      `➕ Nuevos a agregar: ${newWorkoutsCount}`,
      '',
      `📏 Distancia total: ${(totalDistance / 1000).toFixed(1)} km`,
      `📊 Promedio por sesión: ${avgDistance}m`,
      '',
      '📆 Estructura:',
      ...workoutsByBlock.map(b => `  • ${b.name}: ${b.count} entrenamientos (${b.weeks} semanas)`),
      '',
      `🚫 Feriados excluidos: ${holidays2026.length}`,
      '',
      '¿Deseas continuar con la carga?'
    ].join('\n');

    if (!confirm(confirmMsg)) {
      return;
    }

    setLoading(true);
    setStatus('loading');
    setProgress({ current: 0, total: newWorkoutsCount });
    setResults({ success: 0, errors: 0, skipped: 0 });

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    console.log(`🏊 Iniciando carga de ${newWorkoutsCount} entrenamientos de temporada 2026-2027...`);

    for (let i = 0; i < workouts2026_2027.length; i++) {
      const workout = workouts2026_2027[i];

      // Verificar si ya existe
      const exists = existingWorkouts.some(
        existing => existing.week === workout.week && existing.day === workout.day
      );

      if (exists) {
        skippedCount++;
        console.log(`⏭️ Saltando [${i + 1}/${totalWorkouts}]: Semana ${workout.week} - ${workout.day} (ya existe)`);
        setResults({ success: successCount, errors: errorCount, skipped: skippedCount });
        continue;
      }

      try {
        await onAddWorkout(workout);
        successCount++;
        console.log(
          `✅ Agregado [${successCount}/${newWorkoutsCount}]: Semana ${workout.week} - ${workout.day} (${workout.date}) - ${workout.mesociclo}`
        );
        setResults({ success: successCount, errors: errorCount, skipped: skippedCount });
        setProgress({ current: successCount, total: newWorkoutsCount });
      } catch (error) {
        console.error(`❌ Error agregando Semana ${workout.week} - ${workout.day}:`, error);
        const errorMsg = `Semana ${workout.week} - ${workout.day}: ${error}`;
        errors.push(errorMsg);
        errorCount++;
        setResults({ success: successCount, errors: errorCount, skipped: skippedCount });
      }

      // Pausa cada 10 para no saturar el servidor
      if (successCount % 10 === 0 && successCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    setLoading(false);
    setStatus(errorCount === 0 ? 'success' : 'error');

    const summary = [
      '🏁 CARGA COMPLETADA',
      '',
      `✅ Agregados exitosamente: ${successCount}`,
      `⏭️ Saltados (ya existían): ${skippedCount}`,
      `❌ Errores: ${errorCount}`,
      '',
      `📊 Total en BD: ${existingWorkouts.length + successCount}`,
    ];

    if (errors.length > 0) {
      summary.push('', '❌ Errores:', ...errors.slice(0, 5));
      if (errors.length > 5) {
        summary.push(`... y ${errors.length - 5} errores más`);
      }
    }

    console.log(summary.join('\n'));
  };

  return (
    <Card className="border-blue-300 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Calendar className="w-5 h-5" />
          Cargar Temporada Completa 2026-2027
        </CardTitle>
        <CardDescription className="text-blue-700">
          📅 Macrociclo: Marzo 2026 - Enero 2027 | 44 semanas | Periodización ondulante
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estadísticas de la temporada */}
        <div className="bg-white p-4 rounded-lg border border-blue-200 space-y-3">
          <p className="text-sm font-medium text-gray-900">
            📊 Resumen de Temporada:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-blue-700 text-xs">Total entrenamientos</div>
              <div className="text-2xl font-bold text-blue-900">{totalWorkouts}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-green-700 text-xs">Ya cargados</div>
              <div className="text-2xl font-bold text-green-900">{existingCount}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-purple-700 text-xs">Nuevos</div>
              <div className="text-2xl font-bold text-purple-900">{newWorkoutsCount}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <div className="text-orange-700 text-xs">Distancia total</div>
              <div className="text-xl font-bold text-orange-900">{(totalDistance / 1000).toFixed(1)} km</div>
            </div>
          </div>
        </div>

        {/* Bloques de entrenamiento */}
        <div className="bg-white p-4 rounded-lg border border-blue-200 space-y-2">
          <p className="text-sm font-medium text-gray-900 mb-3">
            🎯 7 Bloques de Entrenamiento:
          </p>
          <div className="space-y-2">
            {workoutsByBlock.map((block, idx) => (
              <div key={block.id} className="flex items-start gap-2 text-xs">
                <span className="font-bold text-gray-500 min-w-[20px]">{idx + 1}.</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {block.name} ({block.weeks} semanas, {block.count} entrenamientos)
                  </div>
                  <div className="text-gray-600 mt-0.5">
                    {block.objective}
                  </div>
                  <div className="text-blue-600 mt-0.5 italic">
                    Foco técnico: {block.technicalFocus}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intensidades por sesión */}
        <div className="bg-white p-4 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-gray-900 mb-2">
            🎯 Patrón Semanal (Ondulante):
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-600">Lunes:</span>
              <span className="text-gray-700">Técnica + Moderada (2500m)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-green-600">Miércoles:</span>
              <span className="text-gray-700">Mediana (2000m)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-red-600">Viernes:</span>
              <span className="text-gray-700">Alta intensidad (1700m)</span>
            </div>
          </div>
        </div>

        {/* Feriados */}
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-xs font-medium text-yellow-900 mb-2">
            🚫 Feriados sin entrenamiento: {holidays2026.length}
          </p>
          <div className="text-xs text-yellow-700 space-y-0.5">
            {holidays2026.map(h => (
              <div key={h.date}>
                • {h.name} - {h.day} {new Date(h.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </div>
            ))}
          </div>
        </div>

        {status === 'idle' && (
          <>
            {newWorkoutsCount === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">
                  ✅ Temporada 2026-2027 ya está cargada
                </p>
                <p className="text-green-600 text-sm mt-1">
                  Todos los {totalWorkouts} entrenamientos están en la base de datos
                </p>
              </div>
            ) : (
              <Button
                onClick={handleBulkLoad}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Upload className="w-4 h-4 mr-2" />
                Cargar {newWorkoutsCount} Entrenamientos de Temporada 2026-2027
              </Button>
            )}
          </>
        )}

        {status === 'loading' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Cargando entrenamientos...</span>
              <span className="font-medium text-blue-600">
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>✅ Agregados: {results.success}</span>
              <span>⏭️ Saltados: {results.skipped}</span>
              {results.errors > 0 && <span className="text-red-600">❌ Errores: {results.errors}</span>}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-800 font-medium">
              <CheckCircle className="w-5 h-5" />
              ¡Temporada 2026-2027 cargada exitosamente!
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>✅ Agregados: {results.success} entrenamientos</p>
              <p>⏭️ Saltados: {results.skipped} (ya existían)</p>
              <p>📊 Total en BD: {existingWorkouts.length + results.success}</p>
            </div>
            <Button
              onClick={() => {
                setStatus('idle');
                setProgress({ current: 0, total: 0 });
                setResults({ success: 0, errors: 0, skipped: 0 });
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Cerrar
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-yellow-800 font-medium">
              <AlertTriangle className="w-5 h-5" />
              Carga completada con advertencias
            </div>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>✅ Agregados: {results.success}</p>
              <p>⏭️ Saltados: {results.skipped}</p>
              <p>❌ Errores: {results.errors}</p>
            </div>
            <p className="text-xs text-yellow-600">
              Revisa la consola para más detalles sobre los errores.
            </p>
            <Button
              onClick={() => {
                setStatus('idle');
                setProgress({ current: 0, total: 0 });
                setResults({ success: 0, errors: 0, skipped: 0 });
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Cerrar
            </Button>
          </div>
        )}

        {/* Preview de algunos entrenamientos */}
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-gray-700 hover:text-blue-600">
            Ver preview de entrenamientos ({totalWorkouts} total)
          </summary>
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {workouts2026_2027.slice(0, 10).map((workout, index) => (
              <div
                key={index}
                className="bg-blue-50 p-2 rounded border border-blue-200 text-xs"
              >
                <div className="font-medium text-blue-900">
                  Semana {workout.week} - {workout.day} {workout.date}
                </div>
                <div className="text-blue-700 mt-1">
                  {workout.mesociclo} | {workout.distance}m | {workout.intensity}
                </div>
                <div className="text-gray-600 mt-1 text-xs">
                  {workout.mainSet[0]}
                </div>
              </div>
            ))}
            {totalWorkouts > 10 && (
              <div className="text-center text-xs text-gray-500 py-2">
                ... y {totalWorkouts - 10} entrenamientos más
              </div>
            )}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
