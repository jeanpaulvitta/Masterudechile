import type { Workout } from "../data/workouts";
import * as api from "../services/api";

export async function syncFebruaryWorkouts(
  currentWorkouts: Workout[],
  setWorkouts: (workouts: Workout[]) => void
) {
  try {
    // Importar los entrenamientos del archivo local
    const { workouts: localWorkouts } = await import("../data/workouts");
    
    // Filtrar SOLO entrenamientos de febrero (semanas -4, -3, -2, -1)
    const februaryWorkouts = localWorkouts.filter(w => 
      w.week >= -4 && w.week <= -1 && w.mesociclo === "Mantenimiento"
    );
    
    console.log(`📅 Entrenamientos de febrero en archivo: ${februaryWorkouts.length}`);
    console.log('📋 Detalles:', februaryWorkouts.map(w => ({
      week: w.week,
      date: w.date,
      day: w.day
    })));
    
    if (februaryWorkouts.length === 0) {
      alert('❌ No se encontraron entrenamientos de febrero en el archivo local.');
      return;
    }
    
    // Verificar cuáles ya existen
    const existingFebruaryWorkouts = currentWorkouts.filter(w => 
      w.week >= -4 && w.week <= -1
    );
    
    console.log(`📊 Entrenamientos de febrero en BD: ${existingFebruaryWorkouts.length}`);
    
    // Crear un Set de claves para entrenamientos existentes
    const getWorkoutKey = (workout: any) => 
      `${workout.week}-${workout.date}-${workout.schedule || 'AM'}`;
    
    const existingKeys = new Set(existingFebruaryWorkouts.map(w => getWorkoutKey(w)));
    
    // Filtrar solo los que NO existen
    const newFebruaryWorkouts = februaryWorkouts.filter(w => 
      !existingKeys.has(getWorkoutKey(w))
    );
    
    console.log(`✨ Entrenamientos de febrero NUEVOS: ${newFebruaryWorkouts.length}`);
    
    if (newFebruaryWorkouts.length === 0) {
      alert(`✅ TODOS los entrenamientos de febrero ya están en la BD.\n\nTotal en BD: ${existingFebruaryWorkouts.length}\nEsperados: ${februaryWorkouts.length}`);
      return;
    }
    
    const confirmMsg = [
      `Se agregarán ${newFebruaryWorkouts.length} entrenamientos de febrero:`,
      '',
      ...newFebruaryWorkouts.map(w => `• Semana ${w.week}: ${w.date} (${w.day})`),
      '',
      '¿Continuar?'
    ].join('\n');
    
    if (!confirm(confirmMsg)) {
      return;
    }
    
    // Agregar los entrenamientos nuevos
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (const workout of newFebruaryWorkouts) {
      try {
        await api.addWorkout(workout);
        successCount++;
        console.log(`✅ Agregado: Semana ${workout.week} - ${workout.date} (${workout.day})`);
      } catch (error) {
        console.error(`❌ Error agregando: Semana ${workout.week}`, error);
        errors.push(`${workout.date}: ${error}`);
        errorCount++;
      }
    }
    
    // Recargar entrenamientos
    const updatedWorkouts = await api.fetchWorkouts();
    setWorkouts(updatedWorkouts);
    
    const finalFebruaryCount = updatedWorkouts.filter(w => 
      w.week >= -4 && w.week <= -1
    ).length;
    
    const message = [
      '✅ SINCRONIZACIÓN DE FEBRERO COMPLETADA:',
      '',
      `📋 Esperados: ${februaryWorkouts.length}`,
      `📊 Ya existían: ${existingFebruaryWorkouts.length}`,
      `✨ Nuevos agregados: ${successCount}`,
      `❌ Errores: ${errorCount}`,
      `📈 Total febrero en BD: ${finalFebruaryCount}`,
      '',
      errors.length > 0 ? `Errores: ${errors.join(', ')}` : '',
      `🎯 Estado: ${finalFebruaryCount === februaryWorkouts.length ? '¡Perfecto! ✅' : '⚠️ Revisar'}`
    ].filter(line => line !== '').join('\n');
    
    alert(message);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Error desconocido";
    alert(`Error al sincronizar febrero: ${errorMsg}`);
    console.error("❌ Error:", err);
  }
}