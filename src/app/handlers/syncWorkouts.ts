import type { Workout } from "../data/workouts";
import * as api from "../services/api";

export async function syncWorkoutsFromLocal(
  currentWorkouts: Workout[],
  setWorkouts: (workouts: Workout[]) => void,
  forceUpdate: boolean = false
) {
  try {
    // Importar los entrenamientos del archivo local
    const { workouts: localWorkouts } = await import("../data/workouts");
    
    console.log(`🔄 Iniciando sincronización incremental de ${localWorkouts.length} entrenamientos desde archivo local...`);
    console.log(`📊 Entrenamientos actuales en BD: ${currentWorkouts.length}`);
    console.log(`🔧 Modo forzar actualización: ${forceUpdate ? 'SÍ' : 'NO'}`);
    
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
    
    // NUEVA LÓGICA: Si forceUpdate es true, eliminar todos y recrear
    if (forceUpdate) {
      const confirmDelete = confirm(
        `⚠️ ADVERTENCIA: Esto eliminará TODOS los ${currentWorkouts.length} entrenamientos existentes y los recreará desde el archivo local.\n\n` +
        `¿Estás seguro?\n\n` +
        `NOTA: Esto NO afectará las asistencias registradas.`
      );
      
      if (!confirmDelete) {
        console.log('❌ Usuario canceló la sincronización forzada');
        return;
      }
      
      // Función helper para delay
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      console.log('🗑️ Eliminando todos los entrenamientos existentes...');
      let deletedCount = 0;
      let deleteErrors = 0;
      
      // Eliminar en lotes pequeños con delay para evitar rate limiting
      const BATCH_SIZE = 5;
      const DELAY_BETWEEN_BATCHES = 500; // 500ms entre lotes
      
      for (let i = 0; i < currentWorkouts.length; i += BATCH_SIZE) {
        const batch = currentWorkouts.slice(i, i + BATCH_SIZE);
        
        await Promise.all(
          batch.map(async (workout) => {
            if (workout.id) {
              try {
                await api.deleteWorkout(workout.id);
                deletedCount++;
              } catch (error) {
                console.error(`❌ Error eliminando entrenamiento ${workout.id}:`, error);
                deleteErrors++;
              }
            }
          })
        );
        
        // Mostrar progreso
        if ((i + BATCH_SIZE) % 20 === 0 || i + BATCH_SIZE >= currentWorkouts.length) {
          console.log(`🗑️ Progreso eliminación: ${deletedCount}/${currentWorkouts.length}`);
        }
        
        // Delay entre lotes
        if (i + BATCH_SIZE < currentWorkouts.length) {
          await delay(DELAY_BETWEEN_BATCHES);
        }
      }
      
      console.log(`✅ Eliminados: ${deletedCount} entrenamientos (${deleteErrors} errores)`);
      console.log('⏳ Esperando 2 segundos antes de agregar nuevos entrenamientos...');
      await delay(2000); // Esperar 2 segundos antes de empezar a agregar
      
      // Ahora agregar todos desde el archivo local
      console.log('📤 Agregando todos los entrenamientos desde archivo local...');
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      
      // Agregar en lotes pequeños con delay
      for (let i = 0; i < localWorkouts.length; i += BATCH_SIZE) {
        const batch = localWorkouts.slice(i, i + BATCH_SIZE);
        
        await Promise.all(
          batch.map(async (workout) => {
            try {
              await api.addWorkout(workout);
              successCount++;
            } catch (error) {
              console.error(`❌ Error agregando entrenamiento semana ${workout.week}:`, error);
              errors.push(`Semana ${workout.week} - ${workout.date}: ${error}`);
              errorCount++;
            }
          })
        );
        
        // Mostrar progreso
        if ((i + BATCH_SIZE) % 20 === 0 || i + BATCH_SIZE >= localWorkouts.length) {
          console.log(`📊 Progreso: ${successCount}/${localWorkouts.length} agregados`);
        }
        
        // Delay entre lotes
        if (i + BATCH_SIZE < localWorkouts.length) {
          await delay(DELAY_BETWEEN_BATCHES);
        }
      }
      
      console.log('⏳ Esperando 1 segundo antes de recargar...');
      await delay(1000);
      
      // Recargar entrenamientos
      const updatedWorkouts = await api.fetchWorkouts();
      setWorkouts(updatedWorkouts);
      
      const message = [
        '✅ SINCRONIZACIÓN FORZADA COMPLETA:',
        '',
        `🗑️ Eliminados: ${deletedCount}/${currentWorkouts.length}`,
        `📤 Agregados: ${successCount}/${localWorkouts.length}`,
        `❌ Errores eliminación: ${deleteErrors}`,
        `❌ Errores agregado: ${errorCount}`,
        `📈 Total en BD ahora: ${updatedWorkouts.length}`,
        '',
        errors.length > 0 ? `❌ Primeros errores: ${errors.slice(0, 3).join(', ')}` : '',
        `🎯 Estado: ${successCount === localWorkouts.length ? '¡Perfecto!' : 'Revisar errores'}`
      ].filter(line => line !== '').join('\n');
      
      alert(message);
      console.log(`✅ Sincronización forzada completada: ${successCount} agregados, ${errorCount} errores`);
      return;
    }
    
    // LÓGICA ORIGINAL: Sincronización incremental
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