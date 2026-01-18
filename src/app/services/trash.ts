import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { Workout } from '../data/workouts';
import type { Challenge } from '../data/challenges';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-000a47d9`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

// ==================== WORKOUTS TRASH API ====================

export async function fetchDeletedWorkouts(): Promise<Workout[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/workouts/trash`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch deleted workouts: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Deleted workouts fetched:', data.workouts);
    return data.workouts;
  } catch (error) {
    console.error('❌ Error fetching deleted workouts:', error);
    throw error;
  }
}

export async function restoreWorkout(id: string): Promise<Workout> {
  try {
    const response = await fetch(`${API_BASE_URL}/workouts/${id}/restore`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to restore workout: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Workout restored:', data.workout);
    return data.workout;
  } catch (error) {
    console.error('❌ Error restoring workout:', error);
    throw error;
  }
}

export async function permanentlyDeleteWorkout(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/workouts/${id}/permanent`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to permanently delete workout: ${error.error || response.statusText}`);
    }
    console.log('✅ Workout permanently deleted:', id);
  } catch (error) {
    console.error('❌ Error permanently deleting workout:', error);
    throw error;
  }
}
