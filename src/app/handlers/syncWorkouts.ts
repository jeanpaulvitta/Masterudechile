import type { Workout } from "../data/workouts";
import * as api from "../services/api";

export async function syncWorkoutsFromLocal(
  currentWorkouts: Workout[],
  setWorkouts: (workouts: Workout[]) => void
) {
  try {
    // Importar los entrenamientos del archivo local
    const { workouts: localWorkouts } = await import("../data/workouts");
    
    console.log(`🔄 Iniciando sincronización incremental de ${localWorkouts.length} entrenamientos desde archivo local...`);
    console.log(`📊 Entrenamientos actuales en BD: ${currentWorkouts.length}`);
    
    // Mostrar primeros entrenamientos del archivo para debugging
    console.log('📋 Primeros 3 entrenamientos del archivo local:', 
      localWorkouts.slice(0, 3).map(w => ({
        week: w.week,
        date: w.date,
        day: w.day,
        schedule: w.schedule,
        mesociclo: w.mesociclo
      }))
    );
    
    // Mostrar primeros entrenamientos de BD para debugging
    console.log('📋 Primeros 3 entrenamientos en BD:', 
      currentWorkouts.slice(0, 3).map(w => ({
        week: w.week,
        date: w.date,
        day: w.day,
        schedule: w.schedule,
        mesociclo: w.mesociclo
      }))
    );
    
    // Función para generar clave única
    const getWorkoutKey = (workout: any) => `${workout.date}-${workout.day}-${workout.schedule || 'AM'}-${workout.week}`;
    
    // Filtrar solo entrenamientos nuevos
    const existingKeys = new Set(currentWorkouts.map(w => getWorkoutKey(w)));
    
    console.log('🔑 Primeras 5 claves existentes:', Array.from(existingKeys).slice(0, 5));
    console.log('🔑 Primeras 5 claves del archivo:', localWorkouts.slice(0, 5).map(w => getWorkoutKey(w)));
    
    const newWorkouts = localWorkouts.filter(workout => !existingKeys.has(getWorkoutKey(workout)));
    
    console.log(`✨ Entrenamientos nuevos encontrados: ${newWorkouts.length}`);
    
    if (newWorkouts.length > 0) {
      console.log('📝 Detalles de entrenamientos nuevos:', 
        newWorkouts.slice(0, 5).map(w => ({
          week: w.week,
          date: w.date,
          day: w.day,
          mesociclo: w.mesociclo
        }))
      );
    }
    
    if (newWorkouts.length === 0) {
      alert('✅ No hay entrenamientos nuevos.\n\nTodos ya están en la base de datos.');
      return;
    }
    
    // Subir SOLO los entrenamientos nuevos
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (const newWorkout of newWorkouts) {
      try {
        await api.addWorkout(newWorkout);
        successCount++;
        
        if (successCount % 5 === 0) {
          console.log(`📊 Progreso: ${successCount}/${newWorkouts.length} nuevos agregados`);
        }
      } catch (error) {
        console.error(`❌ Error agregando entrenamiento semana ${newWorkout.week}:`, error);
        errors.push(`Semana ${newWorkout.week} - ${newWorkout.date}: ${error}`);
        errorCount++;
      }
    }
    
    // Recargar entrenamientos
    const updatedWorkouts = await api.fetchWorkouts();
    setWorkouts(updatedWorkouts);
    
    const message = [
      '✅ SINCRONIZACIÓN INCREMENTAL:',
      '',
      `📋 En archivo: ${localWorkouts.length}`,
      `📊 Ya existían: ${currentWorkouts.length}`,
      `✨ Nuevos encontrados: ${newWorkouts.length}`,
      `✅ Agregados exitosamente: ${successCount}`,
      `❌ Errores: ${errorCount}`,
      `📈 Total en BD ahora: ${updatedWorkouts.length}`,
      '',
      errors.length > 0 ? `❌ Errores: ${errors.slice(0, 3).join(', ')}` : '',
      `🎯 Estado: ${successCount === newWorkouts.length ? '¡Perfecto!' : 'Revisar errores'}`
    ].filter(line => line !== '').join('\n');
    
    alert(message);
    console.log(`✅ Sincronización incremental completada: ${successCount} nuevos agregados, ${errorCount} errores`);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Error desconocido";
    alert(`Error al sincronizar entrenamientos: ${errorMsg}`);
    console.error("❌ Error en sincronización:", err);
  }
}