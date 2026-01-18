import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import type { Workout } from '../data/workouts';
import type { Challenge } from '../data/challenges';
import * as trashApi from '../services/trash';

export function TrashManager() {
  const [open, setOpen] = useState(false);
  const [deletedWorkouts, setDeletedWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadDeletedItems();
    }
  }, [open]);

  const loadDeletedItems = async () => {
    try {
      setLoading(true);
      const workouts = await trashApi.fetchDeletedWorkouts();
      setDeletedWorkouts(workouts);
    } catch (error) {
      console.error('Error loading trash:', error);
      alert('Error al cargar elementos eliminados');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string, type: 'workout' | 'challenge') => {
    if (!confirm('¿Restaurar este elemento?')) return;

    try {
      await trashApi.restoreWorkout(id);
      alert('✅ Elemento restaurado exitosamente');
      loadDeletedItems(); // Reload
    } catch (error) {
      console.error('Error restoring item:', error);
      alert('Error al restaurar elemento');
    }
  };

  const handlePermanentDelete = async (id: string, type: 'workout' | 'challenge') => {
    if (!confirm('⚠️ ¿Eliminar permanentemente? Esta acción NO se puede deshacer.')) return;

    try {
      await trashApi.permanentlyDeleteWorkout(id);
      alert('✅ Elemento eliminado permanentemente');
      loadDeletedItems(); // Reload
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      alert('Error al eliminar permanentemente');
    }
  };

  const formatDeletedDate = (deletedAt?: string) => {
    if (!deletedAt) return 'Fecha desconocida';
    return new Date(deletedAt).toLocaleString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalItems = deletedWorkouts.length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4 mr-2" />
          Papelera de Reciclaje
          {totalItems > 0 && (
            <Badge variant="outline" className="ml-2 text-red-600 border-red-300">
              {totalItems}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            Papelera de Reciclaje
            <Badge variant="outline" className="text-gray-600 ml-2">
              {totalItems} elemento{totalItems !== 1 ? 's' : ''}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Aquí puedes restaurar o eliminar permanentemente los elementos que has eliminado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Cargando elementos eliminados...
            </div>
          ) : totalItems === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">La papelera está vacía</p>
              <p className="text-gray-400 text-sm mt-2">
                Los entrenamientos eliminados aparecerán aquí
              </p>
            </div>
          ) : (
            <>
              {/* Advertencia */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-orange-900 mb-1">
                    Elementos en papelera
                  </p>
                  <p className="text-orange-700">
                    Puedes restaurar estos elementos o eliminarlos permanentemente.
                    La eliminación permanente no se puede deshacer.
                  </p>
                </div>
              </div>

              {/* Lista de entrenamientos eliminados */}
              <div className="space-y-3">
                {deletedWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          Semana {workout.week} - {workout.day}
                        </h4>
                        <Badge variant="outline" className="text-blue-600 border-blue-300">
                          {workout.distance}m
                        </Badge>
                        <Badge className="bg-red-100 text-red-800 border border-red-300">
                          Eliminado
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📅 {workout.date} • Mesociclo: {workout.mesociclo}</p>
                        <p className="text-xs text-gray-500">
                          Eliminado: {formatDeletedDate(workout.deletedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                        onClick={() => handleRestore(workout.id!, 'workout')}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restaurar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500 text-red-700 hover:bg-red-50"
                        onClick={() => handlePermanentDelete(workout.id!, 'workout')}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}