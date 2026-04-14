import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import type { Swimmer, Competition, SwimmerCompetition } from '../data/swimmers';
import type { Workout } from '../data/workouts';
import type { Challenge } from '../data/challenges';
import type { Holiday } from '../data/holidays';
import type { TestControl, TestResult } from '../data/testControl';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-000a47d9`;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

// Helper function to add timeout to fetch requests
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - server did not respond in time');
    }
    throw error;
  }
}

// ==================== SWIMMERS API ====================

export async function fetchSwimmers(): Promise<Swimmer[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/swimmers`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch swimmers: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Swimmers fetched from server:', data.swimmers);
    return data.swimmers;
  } catch (error) {
    console.error('❌ Error fetching swimmers:', error);
    throw error;
  }
}

export async function addSwimmer(swimmer: Omit<Swimmer, 'id'>): Promise<Swimmer> {
  try {
    const response = await fetch(`${API_BASE_URL}/swimmers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(swimmer),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to add swimmer: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Swimmer added:', data.swimmer);
    return data.swimmer;
  } catch (error) {
    console.error('❌ Error adding swimmer:', error);
    throw error;
  }
}

export async function updateSwimmer(id: string, swimmer: Omit<Swimmer, 'id'>): Promise<Swimmer> {
  try {
    console.log(`🌐 API: Enviando actualización de nadador ${id}`, {
      hasPersonalBests: !!swimmer.personalBests,
      personalBestsCount: swimmer.personalBests?.length || 0,
      hasPersonalBestsHistory: !!swimmer.personalBestsHistory,
      historyCount: swimmer.personalBestsHistory?.length || 0
    });
    
    const response = await fetch(`${API_BASE_URL}/swimmers/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(swimmer),
    });
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API: Error response:', error);
      throw new Error(`Failed to update swimmer: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ API: Swimmer updated:', {
      id: data.swimmer.id,
      name: data.swimmer.name,
      hasPersonalBests: !!data.swimmer.personalBests,
      personalBestsCount: data.swimmer.personalBests?.length || 0,
      hasPersonalBestsHistory: !!data.swimmer.personalBestsHistory,
      historyCount: data.swimmer.personalBestsHistory?.length || 0
    });
    return data.swimmer;
  } catch (error) {
    console.error('❌ API: Error updating swimmer:', error);
    throw error;
  }
}

export async function deleteSwimmer(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/swimmers/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete swimmer: ${error.error || response.statusText}`);
    }
    console.log('✅ Swimmer deleted:', id);
  } catch (error) {
    console.error('❌ Error deleting swimmer:', error);
    throw error;
  }
}

// ==================== ATTENDANCE API ====================

export interface AttendanceRecord {
  id: string;
  swimmerId: string;
  sessionId: string;
  date: string;
  schedule: string;
  status: 'present' | 'absent' | 'late';
  distanceCompleted: number;
  borgScale?: number;
  notes?: string;
}

interface FetchAttendanceParams {
  swimmerId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export async function fetchAttendance(params?: FetchAttendanceParams): Promise<AttendanceRecord[]> {
  try {
    // Construir query params
    const url = new URL(`${API_BASE_URL}/attendance`);
    if (params?.swimmerId) url.searchParams.append('swimmerId', params.swimmerId);
    if (params?.startDate) url.searchParams.append('startDate', params.startDate);
    if (params?.endDate) url.searchParams.append('endDate', params.endDate);
    if (params?.limit) url.searchParams.append('limit', params.limit.toString());

    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch attendance: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Attendance fetched from server:', data.attendance?.length || 0);
    return data.attendance;
  } catch (error) {
    console.error('❌ Error fetching attendance:', error);
    throw error;
  }
}

export async function addAttendanceRecord(record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers,
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to add attendance: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Attendance record added:', data.record);
    return data.record;
  } catch (error) {
    console.error('❌ Error adding attendance:', error);
    throw error;
  }
}

export async function updateAttendanceRecord(id: string, record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update attendance: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Attendance record updated:', data.record);
    return data.record;
  } catch (error) {
    console.error('❌ Error updating attendance:', error);
    throw error;
  }
}

export async function deleteAttendanceRecord(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete attendance: ${error.error || response.statusText}`);
    }
    console.log('✅ Attendance record deleted:', id);
  } catch (error) {
    console.error('❌ Error deleting attendance:', error);
    throw error;
  }
}

// ==================== COMPETITIONS API ====================

export async function fetchCompetitions(): Promise<Competition[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/competitions`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch competitions: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Competitions fetched from server:', data.competitions);
    return data.competitions;
  } catch (error) {
    console.error('❌ Error fetching competitions:', error);
    throw error;
  }
}

export async function addCompetition(competition: Omit<Competition, 'id'>): Promise<Competition> {
  try {
    const response = await fetch(`${API_BASE_URL}/competitions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(competition),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to add competition: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Competition added:', data.competition);
    return data.competition;
  } catch (error) {
    console.error('❌ Error adding competition:', error);
    throw error;
  }
}

export async function updateCompetition(id: string, competition: Omit<Competition, 'id'>): Promise<Competition> {
  try {
    const response = await fetch(`${API_BASE_URL}/competitions/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(competition),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update competition: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Competition updated:', data.competition);
    return data.competition;
  } catch (error) {
    console.error('❌ Error updating competition:', error);
    throw error;
  }
}

export async function deleteCompetition(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/competitions/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete competition: ${error.error || response.statusText}`);
    }
    console.log('✅ Competition deleted:', id);
  } catch (error) {
    console.error('❌ Error deleting competition:', error);
    throw error;
  }
}

// ==================== SWIMMER COMPETITIONS API ====================

export async function fetchSwimmerCompetitions(): Promise<SwimmerCompetition[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/swimmer-competitions`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch swimmer competitions: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Swimmer competitions fetched from server:', data.participations);
    return data.participations;
  } catch (error) {
    console.error('❌ Error fetching swimmer competitions:', error);
    throw error;
  }
}

export async function addSwimmerCompetition(participation: Omit<SwimmerCompetition, 'id'>): Promise<SwimmerCompetition> {
  try {
    const response = await fetch(`${API_BASE_URL}/swimmer-competitions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(participation),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to add swimmer competition: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Swimmer competition added:', data.participation);
    return data.participation;
  } catch (error) {
    console.error('❌ Error adding swimmer competition:', error);
    throw error;
  }
}

export async function updateSwimmerCompetition(id: string, participation: Omit<SwimmerCompetition, 'id'>): Promise<SwimmerCompetition> {
  try {
    const response = await fetch(`${API_BASE_URL}/swimmer-competitions/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(participation),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update swimmer competition: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Swimmer competition updated:', data.participation);
    return data.participation;
  } catch (error) {
    console.error('❌ Error updating swimmer competition:', error);
    throw error;
  }
}

export async function deleteSwimmerCompetition(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/swimmer-competitions/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete swimmer competition: ${error.error || response.statusText}`);
    }
    console.log('✅ Swimmer competition deleted:', id);
  } catch (error) {
    console.error('❌ Error deleting swimmer competition:', error);
    throw error;
  }
}

// ==================== COMPETITION RESULTS API ====================

export async function updateCompetitionResults(
  swimmerId: string,
  competitionId: string,
  events: { event: string; time?: string; position?: number; points?: number }[]
): Promise<{ participation: SwimmerCompetition; swimmer: Swimmer }> {
  try {
    const response = await fetch(`${API_BASE_URL}/competition-results`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ swimmerId, competitionId, events }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update competition results: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Competition results updated:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating competition results:', error);
    throw error;
  }
}

// ==================== WORKOUTS API ====================

interface FetchWorkoutsParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export async function fetchWorkouts(params?: FetchWorkoutsParams): Promise<Workout[]> {
  try {
    // Construir query params para filtrar en el cliente
    // NOTA: El servidor actual no soporta filtros, pero los agregamos aquí
    // para reducir el procesamiento del cliente con caché de React Query
    const url = new URL(`${API_BASE_URL}/workouts`);
    if (params?.startDate) url.searchParams.append('startDate', params.startDate);
    if (params?.endDate) url.searchParams.append('endDate', params.endDate);
    if (params?.limit) url.searchParams.append('limit', params.limit.toString());

    const response = await fetch(url.toString(), { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch workouts: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Workouts fetched from server:', data.workouts?.length || 0);
    return data.workouts;
  } catch (error) {
    console.error('❌ Error fetching workouts:', error);
    throw error;
  }
}

export async function addWorkout(workout: Omit<Workout, 'id'>): Promise<Workout> {
  try {
    const response = await fetch(`${API_BASE_URL}/workouts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(workout),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to add workout: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Workout added:', data.workout);
    return data.workout;
  } catch (error) {
    console.error('❌ Error adding workout:', error);
    throw error;
  }
}

export async function updateWorkout(id: string, workout: Omit<Workout, 'id'>): Promise<Workout> {
  try {
    const response = await fetch(`${API_BASE_URL}/workouts/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(workout),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update workout: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Workout updated:', data.workout);
    return data.workout;
  } catch (error) {
    console.error('❌ Error updating workout:', error);
    throw error;
  }
}

export async function deleteWorkout(id: string): Promise<void> {
  try {
    console.log(`🗑️ Client: Attempting to delete workout ${id}...`);
    
    // Use longer timeout for delete operations (30 seconds)
    const response = await fetchWithTimeout(`${API_BASE_URL}/workouts/${id}`, {
      method: 'DELETE',
      headers,
    }, 30000);
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { error: errorText };
      }
      
      console.error(`❌ Client: Server returned error ${response.status}:`, errorJson);
      throw new Error(`Failed to delete workout: ${errorJson.error || response.statusText}`);
    }
    
    console.log('✅ Client: Workout deleted successfully:', id);
  } catch (error) {
    // Enhanced error logging
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        console.error('❌ Client: Timeout deleting workout - server took too long to respond');
        throw new Error('La operación tardó demasiado. Por favor, intenta de nuevo.');
      } else if (error.message.includes('Failed to fetch')) {
        console.error('❌ Client: Network error - could not reach server');
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }
    }
    
    console.error('❌ Client: Error deleting workout:', error);
    throw error;
  }
}

export async function clearAllWorkouts(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/workouts/clear-all`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to clear all workouts: ${error.error || response.statusText}`);
    }
    console.log('✅ All workouts cleared from database');
  } catch (error) {
    console.error('❌ Error clearing all workouts:', error);
    throw error;
  }
}

// ==================== CHALLENGES API ====================

export async function fetchChallenges(): Promise<Challenge[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges`, { 
      headers,
      signal: AbortSignal.timeout(15000) // Timeout de 15 segundos
    });
    
    if (!response.ok) {
      console.warn(`⚠️ Challenges endpoint returned ${response.status}, returning empty array`);
      return [];
    }
    
    const data = await response.json();
    const challenges = Array.isArray(data.challenges) ? data.challenges : [];
    console.log('✅ Challenges fetched from server:', challenges.length);
    return challenges;
  } catch (error) {
    // No lanzar error, solo advertir y devolver array vacío
    console.warn('⚠️ Could not fetch challenges (returning empty array):', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

export async function addChallenge(challenge: Omit<Challenge, 'id'>): Promise<Challenge> {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges`, {
      method: 'POST',
      headers,
      body: JSON.stringify(challenge),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to add challenge: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Challenge added:', data.challenge);
    return data.challenge;
  } catch (error) {
    console.error('❌ Error adding challenge:', error);
    throw error;
  }
}

export async function updateChallenge(id: string, challenge: Omit<Challenge, 'id'>): Promise<Challenge> {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(challenge),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update challenge: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Challenge updated:', data.challenge);
    return data.challenge;
  } catch (error) {
    console.error('❌ Error updating challenge:', error);
    throw error;
  }
}

export async function deleteChallenge(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete challenge: ${error.error || response.statusText}`);
    }
    console.log('✅ Challenge deleted:', id);
  } catch (error) {
    console.error('❌ Error deleting challenge:', error);
    throw error;
  }
}

// ==================== HOLIDAYS API ====================

export async function fetchHolidays(): Promise<Holiday[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/holidays`, { 
      headers,
      signal: AbortSignal.timeout(15000) // Timeout de 15 segundos
    });
    
    if (!response.ok) {
      console.warn(`⚠️ Holidays endpoint returned ${response.status}, returning empty array`);
      return [];
    }
    
    const data = await response.json();
    const holidays = Array.isArray(data.holidays) ? data.holidays : [];
    console.log('✅ Holidays fetched from server:', holidays.length);
    return holidays;
  } catch (error) {
    // No lanzar error, solo advertir y devolver array vacío
    console.warn('⚠️ Could not fetch holidays (returning empty array):', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

export async function addHoliday(holiday: Omit<Holiday, 'id'>): Promise<Holiday> {
  try {
    const response = await fetch(`${API_BASE_URL}/holidays`, {
      method: 'POST',
      headers,
      body: JSON.stringify(holiday),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to add holiday: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Holiday added:', data.holiday);
    return data.holiday;
  } catch (error) {
    console.error('❌ Error adding holiday:', error);
    throw error;
  }
}

export async function updateHoliday(id: string, holiday: Omit<Holiday, 'id'>): Promise<Holiday> {
  try {
    const response = await fetch(`${API_BASE_URL}/holidays/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(holiday),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update holiday: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Holiday updated:', data.holiday);
    return data.holiday;
  } catch (error) {
    console.error('❌ Error updating holiday:', error);
    throw error;
  }
}

export async function deleteHoliday(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/holidays/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete holiday: ${error.error || response.statusText}`);
    }
    console.log('✅ Holiday deleted:', id);
  } catch (error) {
    console.error('❌ Error deleting holiday:', error);
    throw error;
  }
}

// ==================== TEST CONTROL API ====================

export async function fetchTestControls(): Promise<TestControl[]> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/test-controls`, { headers }, 15000);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Test controls fetch error:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Test controls fetched:', data.testControls?.length || 0);
    return data.testControls || [];
  } catch (error) {
    console.error('❌ Error fetching test controls:', error);
    // En lugar de lanzar el error, retornar array vacío para no bloquear la carga
    return [];
  }
}

export async function addTestControl(testControl: Omit<TestControl, 'id'>): Promise<TestControl> {
  try {
    const response = await fetch(`${API_BASE_URL}/test-controls`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testControl),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to add test control: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Test control added:', data.testControl);
    return data.testControl;
  } catch (error) {
    console.error('❌ Error adding test control:', error);
    throw error;
  }
}

export async function updateTestControl(id: string, testControl: Omit<TestControl, 'id'>): Promise<TestControl> {
  try {
    const response = await fetch(`${API_BASE_URL}/test-controls/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(testControl),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update test control: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Test control updated:', data.testControl);
    return data.testControl;
  } catch (error) {
    console.error('❌ Error updating test control:', error);
    throw error;
  }
}

export async function deleteTestControl(id: string): Promise<void> {
  try {
    // Use a longer timeout for delete operations (30 seconds)
    const response = await fetchWithTimeout(`${API_BASE_URL}/test-controls/${id}`, {
      method: 'DELETE',
      headers,
    }, 30000);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || response.statusText);
    }
    console.log('✅ Test control deleted:', id);
  } catch (error) {
    // Lanzar el error silenciosamente sin ningún log para 404
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (!errorMsg.toLowerCase().includes('not found') && !errorMsg.toLowerCase().includes('404')) {
      console.error('❌ Error deleting test control:', error);
    }
    throw error;
  }
}

// ==================== TEST RESULTS API ====================

export async function fetchTestResults(): Promise<TestResult[]> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/test-results`, { headers }, 20000); // Aumentar timeout a 20s
    if (!response.ok) {
      const errorText = await response.text();
      console.warn('⚠️ Test results fetch error (returning empty array):', errorText);
      return []; // Return empty instead of throwing
    }
    const data = await response.json();
    console.log('✅ Test results fetched:', data.testResults?.length || 0);
    return data.testResults || [];
  } catch (error) {
    // Silently handle timeout errors - just log warning and return empty array
    if (error instanceof Error && error.message.includes('timeout')) {
      console.warn('⚠️ Test results fetch timeout - returning empty array (this is normal on first load)');
    } else {
      console.warn('⚠️ Error fetching test results - returning empty array:', error);
    }
    // Return empty array to not block app loading
    return [];
  }
}

export async function addTestResult(testResult: Omit<TestResult, 'id'>): Promise<TestResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/test-results`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testResult),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to add test result: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Test result added:', data.testResult);
    return data.testResult;
  } catch (error) {
    console.error('❌ Error adding test result:', error);
    throw error;
  }
}

export async function updateTestResult(id: string, testResult: Omit<TestResult, 'id'>): Promise<TestResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/test-results/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(testResult),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update test result: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Test result updated:', data.testResult);
    return data.testResult;
  } catch (error) {
    console.error('❌ Error updating test result:', error);
    throw error;
  }
}

export async function deleteTestResult(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/test-results/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete test result: ${error.error || response.statusText}`);
    }
    console.log('✅ Test result deleted:', id);
  } catch (error) {
    console.error('❌ Error deleting test result:', error);
    throw error;
  }
}

// ==================== PASSWORD REQUESTS API ====================

export interface PasswordRequest {
  id: string;
  name: string;
  email: string;
  role: 'swimmer' | 'coach';
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  generatedPassword?: string;
}

export async function fetchPasswordRequests(): Promise<PasswordRequest[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/password-requests`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch password requests: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Password requests fetched from server:', data.requests);
    return data.requests;
  } catch (error) {
    console.error('❌ Error fetching password requests:', error);
    throw error;
  }
}

export async function addPasswordRequest(request: Omit<PasswordRequest, 'id'>): Promise<PasswordRequest> {
  try {
    const response = await fetch(`${API_BASE_URL}/password-requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to add password request: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Password request added:', data.request);
    return data.request;
  } catch (error) {
    console.error('❌ Error adding password request:', error);
    throw error;
  }
}

export async function updatePasswordRequest(id: string, request: Partial<PasswordRequest>): Promise<PasswordRequest> {
  try {
    const response = await fetch(`${API_BASE_URL}/password-requests/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update password request: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Password request updated:', data.request);
    return data.request;
  } catch (error) {
    console.error('❌ Error updating password request:', error);
    throw error;
  }
}

export async function deletePasswordRequest(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/password-requests/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete password request: ${error.error || response.statusText}`);
    }
    console.log('✅ Password request deleted:', id);
  } catch (error) {
    console.error('❌ Error deleting password request:', error);
    throw error;
  }
}