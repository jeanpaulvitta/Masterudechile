import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../services/api';
import type { Swimmer, Competition, SwimmerCompetition } from '../data/swimmers';
import type { Workout } from '../data/workouts';
import type { Challenge } from '../data/challenges';
import type { Holiday } from '../data/holidays';
import type { AttendanceRecord } from '../services/api';

// ==================== SWIMMERS ====================

export function useSwimmers() {
  return useQuery({
    queryKey: ['swimmers'],
    queryFn: api.fetchSwimmers,
    staleTime: 1000 * 60 * 10, // 10 minutos - datos relativamente estables
  });
}

export function useAddSwimmer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addSwimmer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swimmers'] });
    },
  });
}

export function useUpdateSwimmer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, swimmer }: { id: string; swimmer: Omit<Swimmer, 'id'> }) =>
      api.updateSwimmer(id, swimmer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swimmers'] });
    },
  });
}

export function useDeleteSwimmer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteSwimmer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swimmers'] });
    },
  });
}

// ==================== WORKOUTS ====================

interface WorkoutsQueryParams {
  startDate?: string;
  endDate?: string;
}

export function useWorkouts(params?: WorkoutsQueryParams) {
  return useQuery({
    // Clave estática: todos los componentes comparten UN solo request y entrada en caché,
    // independientemente del rango de fechas solicitado.
    queryKey: ['workouts'],
    queryFn: api.fetchWorkouts,
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 60,    // 1 hora en memoria
    select: (data: Workout[]) => {
      if (!params?.startDate && !params?.endDate) return data;
      return data.filter((workout) => {
        if (params.startDate && workout.date < params.startDate) return false;
        if (params.endDate && workout.date > params.endDate) return false;
        return true;
      });
    },
  });
}

export function useAddWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, workout }: { id: string; workout: Omit<Workout, 'id'> }) =>
      api.updateWorkout(id, workout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

// ==================== ATTENDANCE ====================

interface AttendanceQueryParams {
  swimmerId?: string;
  startDate?: string;
  endDate?: string;
}

export function useAttendance(params?: AttendanceQueryParams) {
  return useQuery({
    // Clave estática: todos los componentes comparten UN solo request y entrada en caché.
    // La función select filtra en memoria sin generar nuevos requests de red.
    queryKey: ['attendance'],
    queryFn: api.fetchAttendance,
    staleTime: 1000 * 60 * 5,  // 5 minutos
    gcTime: 1000 * 60 * 30,    // 30 minutos en memoria
    select: (data: AttendanceRecord[]) =>
      data.filter((record) => {
        if (params?.swimmerId && record.swimmerId !== params.swimmerId) return false;
        if (params?.startDate && record.date < params.startDate) return false;
        if (params?.endDate && record.date > params.endDate) return false;
        return true;
      }),
  });
}

export function useAddAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.addAttendanceRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

// ==================== COMPETITIONS ====================

export function useCompetitions() {
  return useQuery({
    queryKey: ['competitions'],
    queryFn: api.fetchCompetitions,
    staleTime: 1000 * 60 * 15, // 15 minutos - muy estables
  });
}

export function useSwimmerCompetitions() {
  return useQuery({
    queryKey: ['swimmer-competitions'],
    queryFn: api.fetchSwimmerCompetitions,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

// ==================== CHALLENGES ====================

export function useChallenges() {
  return useQuery({
    queryKey: ['challenges'],
    queryFn: api.fetchChallenges,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

// ==================== HOLIDAYS ====================

export function useHolidays() {
  return useQuery({
    queryKey: ['holidays'],
    queryFn: api.fetchHolidays,
    staleTime: 1000 * 60 * 60, // 1 hora - muy estables (casi nunca cambian)
  });
}

// ==================== HELPER: DATOS DEL MES ACTUAL ====================

/**
 * Hook optimizado que solo trae datos del mes actual
 * Esto reduce DRÁSTICAMENTE el egress ya que solo trae 30 días en vez de 308 días
 */
export function useCurrentMonthData(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Primer día del mes
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  // Último día del mes
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const workouts = useWorkouts({ startDate, endDate });
  const attendance = useAttendance({ startDate, endDate });

  return {
    workouts,
    attendance,
    dateRange: { startDate, endDate },
  };
}

// ==================== HELPER: DATOS CON RANGO FLEXIBLE ====================

/**
 * Hook para obtener datos con un rango de fechas personalizado
 */
export function useDateRangeData(startDate: string, endDate: string, swimmerId?: string) {
  const workouts = useWorkouts({ startDate, endDate });
  const attendance = useAttendance({
    startDate,
    endDate,
    ...(swimmerId && { swimmerId })
  });

  return {
    workouts,
    attendance,
    dateRange: { startDate, endDate },
  };
}
