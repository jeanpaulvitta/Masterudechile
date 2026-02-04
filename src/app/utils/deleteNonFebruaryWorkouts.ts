import type { Workout } from '../data/workouts';

/**
 * Identifica todos los entrenamientos que NO son de febrero
 * Los entrenamientos de febrero tienen semanas -4, -3, -2, -1
 */
export function identifyNonFebruaryWorkouts(workouts: Workout[]): Workout[] {
  return workouts.filter(workout => {
    // Mantener solo los de febrero (semanas -4 a -1)
    const isFebruary = workout.week >= -4 && workout.week <= -1;
    return !isFebruary; // Retornar los que NO son de febrero
  });
}

/**
 * Cuenta los entrenamientos por categoría
 */
export function categorizeWorkouts(workouts: Workout[]) {
  const february = workouts.filter(w => w.week >= -4 && w.week <= -1);
  const nonFebruary = workouts.filter(w => w.week < -4 || w.week > -1);
  
  return {
    total: workouts.length,
    february: february.length,
    nonFebruary: nonFebruary.length,
    februaryList: february,
    nonFebruaryList: nonFebruary
  };
}
