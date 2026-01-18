import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Waves,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Activity,
  Target,
} from "lucide-react";
import type { Swimmer, Competition, SwimmerCompetition } from "../data/swimmers";
import type { AttendanceRecord } from "./AttendanceManager";
import type { Holiday } from "../data/holidays";

interface Session {
  id: string;
  week: number;
  date: string;
  mesociclo: string;
  distance: number;
  type: "workout" | "challenge";
  description?: string;
}

interface IntegratedCalendarProps {
  sessions: Session[];
  competitions: Competition[];
  swimmers: Swimmer[];
  swimmerCompetitions: SwimmerCompetition[];
  attendanceRecords: AttendanceRecord[];
  currentUser?: Swimmer | null;
  holidays?: Holiday[];
}

interface CalendarDay {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  sessions: Session[];
  competitions: Competition[];
  hasAttendance?: boolean;
  holiday?: Holiday;
}

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function IntegratedCalendar({
  sessions,
  competitions,
  swimmers,
  swimmerCompetitions,
  attendanceRecords,
  currentUser,
  holidays = [],
}: IntegratedCalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "workouts" | "competitions">("all");

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Inicio de la semana

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    // Generar 6 semanas (42 días)
    for (let i = 0; i < 42; i++) {
      const dateString = currentDate.toISOString().split("T")[0];
      const isCurrentMonth =
        currentDate.getMonth() === currentMonth &&
        currentDate.getFullYear() === currentYear;
      const isToday =
        currentDate.toDateString() === today.toDateString();

      // Buscar sesiones en este día
      const daySessions = sessions.filter((s) => s.date === dateString);

      // Buscar competencias en este día
      const dayCompetitions = competitions.filter((c) => {
        const startDate = new Date(c.startDate);
        const endDate = new Date(c.endDate);
        const checkDate = new Date(dateString);
        return checkDate >= startDate && checkDate <= endDate;
      });

      // Verificar asistencia del usuario actual
      const hasAttendance = currentUser
        ? daySessions.some((session) =>
            attendanceRecords.some(
              (record) =>
                record.swimmerId === currentUser.id &&
                record.sessionId === session.id &&
                record.status === "presente"
            )
          )
        : undefined;

      // Buscar feriado en este día
      const dayHoliday = holidays.find((h) => h.date === dateString);

      days.push({
        date: new Date(currentDate),
        dateString,
        isCurrentMonth,
        isToday,
        sessions: daySessions,
        competitions: dayCompetitions,
        hasAttendance,
        holiday: dayHoliday,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }, [currentMonth, currentYear, sessions, competitions, attendanceRecords, currentUser, holidays]);

  // Filtrar días según el modo de vista
  const filteredCalendarDays = useMemo(() => {
    if (viewMode === "all") return calendarDays;
    
    return calendarDays.map((day) => {
      if (viewMode === "workouts") {
        return { ...day, competitions: [] };
      } else {
        return { ...day, sessions: [] };
      }
    });
  }, [calendarDays, viewMode]);

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const handleDayClick = (day: CalendarDay) => {
    // Abrir el diálogo si hay sesiones, competencias O feriados
    if (day.sessions.length > 0 || day.competitions.length > 0 || day.holiday) {
      setSelectedDay(day);
      setDialogOpen(true);
    }
  };

  const getSwimmerCompetitionInfo = (competitionId: string) => {
    if (!currentUser) return null;
    return swimmerCompetitions.find(
      (sc) => sc.swimmerId === currentUser.id && sc.competitionId === competitionId
    );
  };

  // Estadísticas del mes
  const monthStats = useMemo(() => {
    const monthDays = calendarDays.filter((d) => d.isCurrentMonth);
    const totalWorkouts = monthDays.reduce((sum, d) => sum + d.sessions.filter(s => s.type === "workout").length, 0);
    const totalChallenges = monthDays.reduce((sum, d) => sum + d.sessions.filter(s => s.type === "challenge").length, 0);
    const totalCompetitions = monthDays.reduce((sum, d) => sum + d.competitions.length, 0);
    const totalDistance = monthDays.reduce(
      (sum, d) => sum + d.sessions.reduce((s, session) => s + session.distance, 0),
      0
    );

    return {
      totalWorkouts,
      totalChallenges,
      totalCompetitions,
      totalDistance,
      totalSessions: totalWorkouts + totalChallenges,
    };
  }, [calendarDays]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2">Calendario Integrado</h2>
          <p className="text-gray-600">
            Entrenamientos y competencias en una vista mensual
          </p>
        </div>

        {/* Filtros de vista */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("all")}
          >
            Todo
          </Button>
          <Button
            variant={viewMode === "workouts" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("workouts")}
            className="gap-1"
          >
            <Waves className="w-4 h-4" />
            Entrenamientos
          </Button>
          <Button
            variant={viewMode === "competitions" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("competitions")}
            className="gap-1"
          >
            <Trophy className="w-4 h-4" />
            Competencias
          </Button>
        </div>
      </div>

      {/* Estadísticas del mes */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Waves className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{monthStats.totalWorkouts}</p>
            <p className="text-sm text-gray-600">Entrenamientos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{monthStats.totalChallenges}</p>
            <p className="text-sm text-gray-600">Desafíos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{monthStats.totalCompetitions}</p>
            <p className="text-sm text-gray-600">Competencias</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{monthStats.totalSessions}</p>
            <p className="text-sm text-gray-600">Sesiones Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Waves className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">
              {(monthStats.totalDistance / 1000).toFixed(1)}km
            </p>
            <p className="text-sm text-gray-600">Distancia Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendario */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {MONTHS[currentMonth]} {currentYear}
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
          {/* Leyenda */}
          <div className="flex flex-wrap gap-4 mb-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Entrenamiento Regular</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm">Desafío Sábado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span className="text-sm">Competencia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-300 rounded border-2 border-red-400"></div>
              <span className="text-sm">Feriado / Vacaciones</span>
            </div>
            {currentUser && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm">Asististe</span>
              </div>
            )}
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {filteredCalendarDays.map((day, index) => {
              const hasWorkout = day.sessions.some((s) => s.type === "workout");
              const hasChallenge = day.sessions.some((s) => s.type === "challenge");
              const hasCompetition = day.competitions.length > 0;
              const hasHoliday = !!day.holiday;
              const hasAnyEvent = hasWorkout || hasChallenge || hasCompetition;

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  disabled={!hasAnyEvent && !hasHoliday}
                  className={`
                    min-h-[80px] md:min-h-[100px] p-2 rounded-lg border-2 transition-all
                    ${hasHoliday ? "bg-red-50" : (day.isCurrentMonth ? "bg-white" : "bg-gray-50")}
                    ${day.isToday ? "border-blue-500 ring-2 ring-blue-200" : (hasHoliday ? "border-red-300" : "border-gray-200")}
                    ${
                      hasAnyEvent || hasHoliday
                        ? "hover:border-blue-400 hover:shadow-md cursor-pointer"
                        : "cursor-default"
                    }
                    ${!day.isCurrentMonth && "opacity-40"}
                  `}
                >
                  <div className="flex flex-col h-full">
                    {/* Fecha */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-semibold ${
                          day.isToday
                            ? "text-blue-600"
                            : day.isCurrentMonth
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {day.date.getDate()}
                      </span>
                      {day.hasAttendance && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </div>

                    {/* Indicadores de eventos */}
                    <div className="flex flex-col gap-1 flex-1">
                      {hasHoliday && (
                        <div className="flex items-center gap-1 bg-red-100 border border-red-300 rounded px-1 py-0.5">
                          <CalendarIcon className="w-3 h-3 text-red-600" />
                          <span className="text-xs text-red-700 font-medium truncate">
                            {day.holiday?.type === 'feriado' ? '🇨🇱' : day.holiday?.type === 'vacaciones' ? '🏖️' : '⚠️'}
                          </span>
                        </div>
                      )}
                      {hasWorkout && (
                        <div className="flex items-center gap-1 bg-blue-100 border border-blue-300 rounded px-1 py-0.5">
                          <Waves className="w-3 h-3 text-blue-600" />
                          <span className="text-xs text-blue-700 font-medium truncate">
                            {day.sessions.filter((s) => s.type === "workout").length}
                          </span>
                        </div>
                      )}
                      {hasChallenge && (
                        <div className="flex items-center gap-1 bg-orange-100 border border-orange-300 rounded px-1 py-0.5">
                          <Target className="w-3 h-3 text-orange-600" />
                          <span className="text-xs text-orange-700 font-medium truncate">
                            Desafío
                          </span>
                        </div>
                      )}
                      {hasCompetition && (
                        <div className="flex items-center gap-1 bg-yellow-100 border border-yellow-400 rounded px-1 py-0.5">
                          <Trophy className="w-3 h-3 text-yellow-600" />
                          <span className="text-xs text-yellow-700 font-medium truncate">
                            {day.competitions.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo de detalles del día */}
      {selectedDay && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                {selectedDay.date.toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </DialogTitle>
              <DialogDescription>
                Detalles de entrenamientos y competencias
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Día feriado */}
              {selectedDay.holiday && (
                <Card className="border-2 border-red-300 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-lg text-red-900 mb-1">
                          {selectedDay.holiday.name}
                        </h3>
                        <div className="space-y-1">
                          <Badge variant="outline" className="border-red-400 text-red-700">
                            {selectedDay.holiday.type === 'feriado' ? '🇨🇱 Feriado' : 
                             selectedDay.holiday.type === 'vacaciones' ? '🏖️ Vacaciones' : 
                             '⚠️ Suspensión'}
                          </Badge>
                          {selectedDay.holiday.description && (
                            <p className="text-sm text-red-700 mt-2">
                              {selectedDay.holiday.description}
                            </p>
                          )}
                          {selectedDay.holiday.isRecurring && (
                            <p className="text-xs text-red-600 mt-1">
                              🔄 Se repite cada año
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-red-800 mt-3">
                          ⚠️ No hay actividades programadas este día
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sesiones de entrenamiento */}
              {selectedDay.sessions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Waves className="w-5 h-5 text-blue-600" />
                    Sesiones de Entrenamiento ({selectedDay.sessions.length})
                  </h3>
                  {selectedDay.sessions.map((session) => (
                    <Card
                      key={session.id}
                      className={`border-2 ${
                        session.type === "workout"
                          ? "border-blue-200 bg-blue-50"
                          : "border-orange-200 bg-orange-50"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {session.type === "workout" ? (
                              <Waves className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Target className="w-5 h-5 text-orange-600" />
                            )}
                            <h4 className="font-bold">
                              {session.type === "workout"
                                ? "Entrenamiento Regular"
                                : "Desafío Sábado"}
                            </h4>
                          </div>
                          <Badge
                            variant={
                              session.type === "workout" ? "default" : "secondary"
                            }
                          >
                            {session.mesociclo}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Semana</p>
                            <p className="font-semibold">Semana {session.week}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Distancia</p>
                            <p className="font-semibold">{session.distance}m</p>
                          </div>
                        </div>

                        {session.description && (
                          <p className="text-sm text-gray-700 mt-3 p-3 bg-white rounded border">
                            {session.description}
                          </p>
                        )}

                        {/* Indicador de asistencia */}
                        {currentUser && (
                          <div className="mt-3 pt-3 border-t">
                            {attendanceRecords.some(
                              (r) =>
                                r.swimmerId === currentUser.id &&
                                r.sessionId === session.id &&
                                r.status === "presente"
                            ) ? (
                              <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-sm font-semibold">
                                  ✓ Asististe a esta sesión
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-500">
                                <XCircle className="w-4 h-4" />
                                <span className="text-sm">No registrada</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Competencias */}
              {selectedDay.competitions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Competencias ({selectedDay.competitions.length})
                  </h3>
                  {selectedDay.competitions.map((competition) => {
                    const swimmerInfo = getSwimmerCompetitionInfo(competition.id);
                    return (
                      <Card
                        key={competition.id}
                        className="border-2 border-yellow-200 bg-yellow-50"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Trophy className="w-5 h-5 text-yellow-600" />
                              <h4 className="font-bold text-lg">
                                {competition.name}
                              </h4>
                            </div>
                            <Badge className="bg-yellow-600">
                              {competition.type}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4 text-gray-600" />
                              <div>
                                <p className="text-gray-600">Fechas</p>
                                <p className="font-semibold">
                                  {new Date(
                                    competition.startDate
                                  ).toLocaleDateString("es-CL", {
                                    day: "numeric",
                                    month: "short",
                                  })}{" "}
                                  -{" "}
                                  {new Date(competition.endDate).toLocaleDateString(
                                    "es-CL",
                                    { day: "numeric", month: "short" }
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-600" />
                              <div>
                                <p className="text-gray-600">Horario</p>
                                <p className="font-semibold">
                                  {competition.schedule}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-600" />
                              <div>
                                <p className="text-gray-600">Lugar</p>
                                <p className="font-semibold">
                                  {competition.location}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-gray-600" />
                              <div>
                                <p className="text-gray-600">Inscripción</p>
                                <p className="font-semibold">{competition.cost}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Waves className="w-4 h-4 text-gray-600" />
                              <div>
                                <p className="text-gray-600">Piscina</p>
                                <p className="font-semibold">
                                  {competition.poolType}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-600" />
                              <div>
                                <p className="text-gray-600">Semana</p>
                                <p className="font-semibold">
                                  Semana {competition.week}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Descripción */}
                          {competition.description && (
                            <p className="text-sm text-gray-700 mb-3 p-3 bg-white rounded border">
                              {competition.description}
                            </p>
                          )}

                          {/* Pruebas */}
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-2">
                              Pruebas disponibles:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {competition.events.map((event, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {event}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Estado de participación */}
                          {currentUser && (
                            <div className="pt-3 border-t">
                              {swimmerInfo?.participates ? (
                                <div className="flex items-center gap-2 text-green-700">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="text-sm font-semibold">
                                    ✓ Participarás en esta competencia
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-gray-500">
                                  <XCircle className="w-4 h-4" />
                                  <span className="text-sm">
                                    No registrada tu participación
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}