import type { Workout } from "../data/workouts";
import * as api from "../services/api";

export async function cleanFebruaryWorkouts(
  currentWorkouts: Workout[],
  setWorkouts: (workouts: Workout[]) => void
) {
  try {
    // Fechas INCORRECTAS que debemos eliminar (las que estaban antes de la corrección)
    const incorrectDates = [
      "3 de febrero", "5 de febrero", "7 de febrero",
      "10 de febrero", "12 de febrero", "14 de febrero",
      "17 de febrero", "19 de febrero", "21 de febrero",
      "24 de febrero", "26 de febrero", "28 de febrero"
    ];
    
    // Encontrar entrenamientos de febrero con fechas incorrectas
    const workoutsToDelete = currentWorkouts.filter(w => 
      w.week >= -4 && w.week <= -1 && incorrectDates.includes(w.date)
    );
    
    console.log(`🗑️ Entrenamientos con fechas incorrectas: ${workoutsToDelete.length}`);
    console.log('📋 Detalles:', workoutsToDelete.map(w => ({
      id: w.id,
      week: w.week,
      date: w.date,
      day: w.day
    })));
    
    if (workoutsToDelete.length === 0) {
      alert('✅ No hay entrenamientos con fechas incorrectas para eliminar.');
      return;
    }
    
    const confirmMsg = [
      `Se eliminarán ${workoutsToDelete.length} entrenamientos con fechas incorrectas:`,
      '',
      ...workoutsToDelete.map(w => `• ${w.date} (${w.day}) - Semana ${w.week}`),
      '',
      '¿Continuar?'
    ].join('\n');
    
    if (!confirm(confirmMsg)) {
      return;
    }
    
    // Eliminar los entrenamientos
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (const workout of workoutsToDelete) {
      if (!workout.id) {
        console.warn('⚠️ Entrenamiento sin ID:', workout);
        continue;
      }
      
      try {
        await api.deleteWorkout(workout.id);
        successCount++;
        console.log(`✅ Eliminado: ${workout.date} (${workout.day})`);
      } catch (error) {
        console.error(`❌ Error eliminando: ${workout.date}`, error);
        errors.push(`${workout.date}: ${error}`);
        errorCount++;
      }
    }
    
    // Recargar entrenamientos
    const updatedWorkouts = await api.fetchWorkouts();
    setWorkouts(updatedWorkouts);
    
    const message = [
      '✅ LIMPIEZA DE FEBRERO COMPLETADA:',
      '',
      `🗑️ Encontrados: ${workoutsToDelete.length}`,
      `✅ Eliminados: ${successCount}`,
      `❌ Errores: ${errorCount}`,
      '',
      errors.length > 0 ? `Errores: ${errors.join(', ')}` : '',
      '✨ Ahora puedes sincronizar los entrenamientos con fechas correctas.'
    ].filter(line => line !== '').join('\n');
    
    alert(message);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Error desconocido";
    alert(`Error al limpiar febrero: ${errorMsg}`);
    console.error("❌ Error:", err);
  }
}
