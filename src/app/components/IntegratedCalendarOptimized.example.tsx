// EJEMPLO: Cómo migrar IntegratedCalendar para usar hooks optimizados
// Este es un ejemplo de referencia - NO reemplazar el archivo real todavía

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCurrentMonthData, useSwimmers, useCompetitions, useSwimmerCompetitions, useHolidays } from "../hooks/useOptimizedData";
import type { Swimmer } from "../data/swimmers";

interface IntegratedCalendarOptimizedProps {
  currentUser?: Swimmer | null;
}

export function IntegratedCalendarOptimized({ currentUser }: IntegratedCalendarOptimizedProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // 🚀 OPTIMIZACIÓN: Crear fecha base para el mes actual
  const currentMonthDate = useMemo(
    () => new Date(currentYear, currentMonth, 15), // Día 15 para estar en el medio del mes
    [currentYear, currentMonth]
  );

  // 🚀 OPTIMIZACIÓN: Solo traer datos del mes visible
  const { workouts, attendance } = useCurrentMonthData(currentMonthDate);

  // 🚀 OPTIMIZACIÓN: Estos datos son más estables, se cachean por más tiempo
  const { data: swimmers = [] } = useSwimmers();
  const { data: competitions = [] } = useCompetitions();
  const { data: swimmerCompetitions = [] } = useSwimmerCompetitions();
  const { data: holidays = [] } = useHolidays();

  // Estados de carga
  const isLoading = workouts.isLoading || attendance.isLoading;
  const hasError = workouts.error || attendance.error;

  // Convertir workouts a formato de sesiones (igual que antes)
  const sessions = useMemo(() => {
    if (!workouts.data) return [];

    return workouts.data.map((w) => ({
      id: w.id,
      week: w.week,
      date: w.date,
      mesociclo: w.mesociclo,
      distance: w.distance,
      type: "workout" as const,
      description: w.description,
    }));
  }, [workouts.data]);

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    // React Query automáticamente hará refetch con las nuevas fechas
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    // React Query automáticamente hará refetch con las nuevas fechas
  };

  const handleToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando calendario...</p>
        </CardContent>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-red-600">
          <p>Error al cargar datos del calendario</p>
          <Button onClick={() => workouts.refetch()} className="mt-4">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Calendario Optimizado - {currentMonth + 1}/{currentYear}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Hoy
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600 mb-4">
          📊 Datos en caché: {sessions.length} entrenamientos, {attendance.data?.length || 0} asistencias
          {workouts.isFetching && " • Actualizando..."}
        </div>

        {/* Aquí iría el resto del calendario con los datos optimizados */}
        <div className="text-center py-8 text-gray-500">
          <p>Renderizar calendario con sessions, competitions, etc.</p>
          <p className="text-xs mt-2">
            Los datos ahora se cargan solo del mes actual, reduciendo el tráfico en ~90%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * BENEFICIOS DE ESTA MIGRACIÓN:
 *
 * 1. ✅ Solo trae 30 días de datos en vez de 308 días (90% reducción)
 * 2. ✅ Caché automático: segunda carga es instantánea
 * 3. ✅ Al cambiar de mes, solo trae ese mes nuevo
 * 4. ✅ Estados de loading/error manejados automáticamente
 * 5. ✅ Refetch manual con workouts.refetch() si es necesario
 * 6. ✅ Indicador visual de cuando está actualizando (isFetching)
 * 7. ✅ No más useEffect complejos ni manejo manual de estados
 *
 * COMPARACIÓN DE CÓDIGO:
 *
 * ANTES (sin optimización):
 * ```
 * const [workouts, setWorkouts] = useState<Workout[]>([]);
 * const [loading, setLoading] = useState(true);
 * const [error, setError] = useState<string | null>(null);
 *
 * useEffect(() => {
 *   const loadData = async () => {
 *     try {
 *       setLoading(true);
 *       const data = await api.fetchWorkouts(); // Trae TODOS los 308 entrenamientos
 *       setWorkouts(data);
 *     } catch (err) {
 *       setError(err.message);
 *     } finally {
 *       setLoading(false);
 *     }
 *   };
 *   loadData();
 * }, []);
 * ```
 *
 * DESPUÉS (optimizado):
 * ```
 * const { workouts } = useCurrentMonthData(currentMonthDate); // Solo 30 días con caché
 * ```
 *
 * REDUCCIÓN:
 * - 15 líneas → 1 línea
 * - 100% de tráfico → 10% de tráfico
 * - Sin caché → Caché inteligente
 * - Código complejo → Código simple
 */
