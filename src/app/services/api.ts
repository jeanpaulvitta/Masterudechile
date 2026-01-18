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
    const response = await fetch(`${API_BASE_URL}/swimmers/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(swimmer),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to update swimmer: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Swimmer updated:', data.swimmer);
    return data.swimmer;
  } catch (error) {
    console.error('❌ Error updating swimmer:', error);
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

export async function fetchAttendance(): Promise<AttendanceRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/attendance`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch attendance: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Attendance fetched from server:', data.attendance);
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

export async function fetchWorkouts(): Promise<Workout[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/workouts`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch workouts: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Workouts fetched from server:', data.workouts);
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
    const response = await fetch(`${API_BASE_URL}/workouts/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete workout: ${error.error || response.statusText}`);
    }
    console.log('✅ Workout deleted:', id);
  } catch (error) {
    console.error('❌ Error deleting workout:', error);
    throw error;
  }
}

// ==================== CHALLENGES API ====================

export async function fetchChallenges(): Promise<Challenge[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/challenges`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch challenges: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Challenges fetched from server:', data.challenges);
    return data.challenges;
  } catch (error) {
    console.error('❌ Error fetching challenges:', error);
    throw error;
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
    const response = await fetch(`${API_BASE_URL}/holidays`, { headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch holidays: ${error.error || response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Holidays fetched from server:', data.holidays);
    return data.holidays;
  } catch (error) {
    console.error('❌ Error fetching holidays:', error);
    throw error;
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/test-results`, { headers }, 15000);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Test results fetch error:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ Test results fetched:', data.testResults?.length || 0);
    return data.testResults || [];
  } catch (error) {
    console.error('❌ Error fetching test results:', error);
    // En lugar de lanzar el error, retornar array vacío para no bloquear la carga
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