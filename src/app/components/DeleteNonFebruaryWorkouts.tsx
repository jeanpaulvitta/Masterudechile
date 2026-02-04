import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { categorizeWorkouts } from '../utils/deleteNonFebruaryWorkouts';
import type { Workout } from '../data/workouts';

interface DeleteNonFebruaryWorkoutsProps {
  workouts: Workout[];
  onDeleteWorkout: (id: string) => Promise<void>;
}

export function DeleteNonFebruaryWorkouts({ workouts, onDeleteWorkout }: DeleteNonFebruaryWorkoutsProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{ success: number; errors: number }>({ success: 0, errors: 0 });

  const categories = categorizeWorkouts(workouts);

  const handleDeleteNonFebruary = async () => {
    const confirmMsg = [
      `⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE`,
      '',
      `📊 Entrenamientos a ELIMINAR: ${categories.nonFebruary}`,
      `✅ Entrenamientos a MANTENER (Febrero): ${categories.february}`,
      '',
      `Se eliminarán todos los entrenamientos EXCEPTO los de febrero (semanas -4 a -1).`,
      '',
      '¿Estás COMPLETAMENTE seguro de continuar?'
    ].join('\n');

    if (!confirm(confirmMsg)) {
      return;
    }

    // Segunda confirmación para seguridad
    if (!confirm('⚠️ ÚLTIMA CONFIRMACIÓN: ¿Eliminar todos los entrenamientos excepto febrero?')) {
      return;
    }

    setLoading(true);
    setStatus('loading');
    setProgress({ current: 0, total: categories.nonFebruary });
    setResults({ success: 0, errors: 0 });

    let successCount = 0;
    let errorCount = 0;

    console.log(`🗑️ Iniciando eliminación de ${categories.nonFebruary} entrenamientos...`);

    for (let i = 0; i < categories.nonFebruaryList.length; i++) {
      const workout = categories.nonFebruaryList[i];
      
      if (!workout.id) {
        console.warn(`⚠️ Entrenamiento sin ID, saltando:`, workout);
        errorCount++;
        setResults({ success: successCount, errors: errorCount });
        setProgress({ current: i + 1, total: categories.nonFebruary });
        continue;
      }

      try {
        await onDeleteWorkout(workout.id);
        successCount++;
        console.log(`✅ Eliminado [${i + 1}/${categories.nonFebruary}]: Semana ${workout.week} - ${workout.date}`);
        setResults({ success: successCount, errors: errorCount });
      } catch (error) {
        console.error(`❌ Error eliminando [${i + 1}/${categories.nonFebruary}]: Semana ${workout.week}`, error);
        errorCount++;
        setResults({ success: successCount, errors: errorCount });
      }
      
      setProgress({ current: i + 1, total: categories.nonFebruary });
      
      // Pequeña pausa para no saturar el servidor
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    setLoading(false);
    setStatus(errorCount === 0 ? 'success' : 'error');
    
    console.log(`🏁 Eliminación completada: ${successCount} exitosos, ${errorCount} errores`);
  };

  return (
    <Card className="border-red-300 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-5 h-5" />
          Eliminar Entrenamientos (Mantener solo Febrero)
        </CardTitle>
        <CardDescription className="text-red-700">
          ⚠️ <strong>ACCIÓN IRREVERSIBLE:</strong> Eliminará todos los entrenamientos excepto los de febrero
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-4 rounded-lg border border-red-200 space-y-3">
          <p className="text-sm font-medium text-gray-900">
            📊 Resumen de Entrenamientos:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-900">{categories.total}</div>
            </div>
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <div className="text-green-700">✅ Mantener (Febrero)</div>
              <div className="text-2xl font-bold text-green-800">{categories.february}</div>
              <div className="text-xs text-green-600 mt-1">Semanas -4 a -1</div>
            </div>
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <div className="text-red-700">🗑️ Eliminar</div>
              <div className="text-2xl font-bold text-red-800">{categories.nonFebruary}</div>
              <div className="text-xs text-red-600 mt-1">Todas las demás semanas</div>
            </div>
          </div>
        </div>

        {status === 'idle' && (
          <>
            {categories.nonFebruary === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">
                  ✅ Solo existen entrenamientos de febrero
                </p>
                <p className="text-green-600 text-sm mt-1">
                  No hay entrenamientos para eliminar
                </p>
              </div>
            ) : (
              <Button
                onClick={handleDeleteNonFebruary}
                disabled={loading}
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar {categories.nonFebruary} Entrenamientos (Mantener solo Febrero)
              </Button>
            )}
          </>
        )}

        {status === 'loading' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Eliminando entrenamientos...</span>
              <span className="font-medium text-red-600">
                {progress.current} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-red-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>✅ Eliminados: {results.success}</span>
              {results.errors > 0 && <span className="text-red-600">❌ Errores: {results.errors}</span>}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-800 font-medium">
              <CheckCircle className="w-5 h-5" />
              ¡Eliminación completada exitosamente!
            </div>
            <p className="text-sm text-green-700">
              Se eliminaron {results.success} entrenamientos correctamente.
            </p>
            <p className="text-sm text-green-600">
              ✅ Se mantuvieron {categories.february} entrenamientos de febrero.
            </p>
            <Button
              onClick={() => {
                setStatus('idle');
                setProgress({ current: 0, total: 0 });
                setResults({ success: 0, errors: 0 });
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Listo
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-yellow-800 font-medium">
              <AlertTriangle className="w-5 h-5" />
              Eliminación completada con advertencias
            </div>
            <p className="text-sm text-yellow-700">
              • Eliminados: {results.success}<br />
              • Errores: {results.errors}
            </p>
            <p className="text-xs text-yellow-600">
              Revisa la consola para más detalles sobre los errores.
            </p>
            <Button
              onClick={() => {
                setStatus('idle');
                setProgress({ current: 0, total: 0 });
                setResults({ success: 0, errors: 0 });
              }}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Cerrar
            </Button>
          </div>
        )}

        {/* Vista previa de entrenamientos a eliminar */}
        {categories.nonFebruary > 0 && (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-gray-700 hover:text-red-600">
              Ver lista de entrenamientos a eliminar ({categories.nonFebruary})
            </summary>
            <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
              {categories.nonFebruaryList.map((workout, index) => (
                <div
                  key={workout.id || index}
                  className="bg-red-50 p-2 rounded border border-red-200 text-xs"
                >
                  <div className="font-medium text-red-900">
                    🗑️ Semana {workout.week} - {workout.date} ({workout.day})
                  </div>
                  <div className="text-red-600 mt-1">
                    {workout.mesociclo} | {workout.distance}m | {workout.intensity}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Vista previa de entrenamientos a mantener */}
        {categories.february > 0 && (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-gray-700 hover:text-green-600">
              Ver entrenamientos de febrero a MANTENER ({categories.february})
            </summary>
            <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
              {categories.februaryList.map((workout, index) => (
                <div
                  key={workout.id || index}
                  className="bg-green-50 p-2 rounded border border-green-200 text-xs"
                >
                  <div className="font-medium text-green-900">
                    ✅ Semana {workout.week} - {workout.date} ({workout.day})
                  </div>
                  <div className="text-green-600 mt-1">
                    {workout.mesociclo} | {workout.distance}m | {workout.intensity}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
