import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Users,
  Target,
  Award,
  Calendar,
  Activity,
  CheckCircle2,
  XCircle,
  Zap,
  BarChart3,
} from "lucide-react";
import type { Swimmer } from "../data/swimmers";
import type { AttendanceRecord } from "../utils/attendanceAnalytics";
import {
  calculateAllSwimmersAttendanceStats,
  calculateTeamAttendanceStats,
  calculateScheduleAttendanceStats,
  calculateWeeklyAttendance,
  generateAttendanceAlerts,
  analyzeAttendancePerformanceCorrelation,
} from "../utils/attendanceAnalytics";

interface AttendanceAnalyticsProps {
  swimmers: Swimmer[];
  attendanceRecords: AttendanceRecord[];
  sessions: Array<{ week: number; date: string }>;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export function AttendanceAnalytics({
  swimmers,
  attendanceRecords,
  sessions,
}: AttendanceAnalyticsProps) {
  const [selectedView, setSelectedView] = useState<"overview" | "swimmers" | "trends" | "alerts">("overview");

  // Calcular todas las estadísticas
  const totalSessions = sessions.length;
  const swimmerStats = useMemo(
    () => calculateAllSwimmersAttendanceStats(swimmers, attendanceRecords, totalSessions),
    [swimmers, attendanceRecords, totalSessions]
  );

  const teamStats = useMemo(
    () => calculateTeamAttendanceStats(swimmers, attendanceRecords, totalSessions),
    [swimmers, attendanceRecords, totalSessions]
  );

  const scheduleStats = useMemo(
    () => calculateScheduleAttendanceStats(swimmers, attendanceRecords),
    [swimmers, attendanceRecords]
  );

  const weeklyAttendance = useMemo(
    () => calculateWeeklyAttendance(swimmers, attendanceRecords, sessions),
    [swimmers, attendanceRecords, sessions]
  );

  const alerts = useMemo(
    () => generateAttendanceAlerts(swimmers, attendanceRecords, totalSessions),
    [swimmers, attendanceRecords, totalSessions]
  );

  const performanceCorrelation = useMemo(
    () => analyzeAttendancePerformanceCorrelation(swimmers, attendanceRecords, totalSessions),
    [swimmers, attendanceRecords, totalSessions]
  );

  // Datos para gráfico de distribución
  const distributionData = [
    {
      name: "90-100%",
      count: swimmerStats.filter((s) => s.attendanceRate >= 90).length,
    },
    {
      name: "80-89%",
      count: swimmerStats.filter(
        (s) => s.attendanceRate >= 80 && s.attendanceRate < 90
      ).length,
    },
    {
      name: "70-79%",
      count: swimmerStats.filter(
        (s) => s.attendanceRate >= 70 && s.attendanceRate < 80
      ).length,
    },
    {
      name: "60-69%",
      count: swimmerStats.filter(
        (s) => s.attendanceRate >= 60 && s.attendanceRate < 70
      ).length,
    },
    {
      name: "< 60%",
      count: swimmerStats.filter((s) => s.attendanceRate < 60).length,
    },
  ];

  // Datos para gráfico de horarios
  const scheduleChartData = scheduleStats.map((stat) => ({
    name: stat.schedule,
    asistencia: stat.averageAttendanceRate.toFixed(1),
    nadadores: stat.totalSwimmers,
  }));

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "declining":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case "improving":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300">
            Mejorando
          </Badge>
        );
      case "declining":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300">
            Declinando
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-300">
            Estable
          </Badge>
        );
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-red-500 bg-red-50";
      case "medium":
        return "border-orange-500 bg-orange-50";
      default:
        return "border-yellow-500 bg-yellow-50";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "medium":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Análisis Avanzado de Asistencia</h2>
        <p className="text-gray-600">
          Estadísticas detalladas, tendencias y alertas del equipo
        </p>
      </div>

      {/* Navegación */}
      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden lg:inline">Resumen</span>
            <span className="lg:hidden hidden sm:inline">Resumen</span>
            <span className="sm:hidden">📊</span>
          </TabsTrigger>
          <TabsTrigger value="swimmers" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden lg:inline">Por Nadador</span>
            <span className="lg:hidden hidden sm:inline">Nadador</span>
            <span className="sm:hidden">👥</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden lg:inline">Tendencias</span>
            <span className="lg:hidden hidden sm:inline">Trends</span>
            <span className="sm:hidden">📈</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden lg:inline">Alertas ({alerts.length})</span>
            <span className="lg:hidden hidden sm:inline">Alertas ({alerts.length})</span>
            <span className="sm:hidden">⚠️ {alerts.length}</span>
          </TabsTrigger>
        </TabsList>

        {/* VISTA 1: RESUMEN GENERAL */}
        <TabsContent value="overview" className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-600">Tasa Promedio</p>
                </div>
                <p className="text-3xl font-bold">
                  {teamStats.averageAttendanceRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-gray-600">Sobre 80%</p>
                </div>
                <p className="text-3xl font-bold">
                  {teamStats.swimmersAbove80Percent}
                </p>
                <p className="text-xs text-gray-500">
                  de {teamStats.totalSwimmers} nadadores
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-gray-600">Bajo 50%</p>
                </div>
                <p className="text-3xl font-bold">
                  {teamStats.swimmersBelow50Percent}
                </p>
                <p className="text-xs text-gray-500">requieren atención</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-gray-600">Prom/Semana</p>
                </div>
                <p className="text-3xl font-bold">
                  {teamStats.averageSessionsPerWeek.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">sesiones</p>
              </CardContent>
            </Card>
          </div>

          {/* Mejor y peor asistencia */}
          {teamStats.bestAttendanceRate && teamStats.worstAttendanceRate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    Mejor Asistencia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-green-900">
                    {teamStats.bestAttendanceRate.swimmer}
                  </p>
                  <p className="text-3xl font-bold text-green-700 mt-2">
                    {teamStats.bestAttendanceRate.rate.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    Requiere Atención
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold text-orange-900">
                    {teamStats.worstAttendanceRate.swimmer}
                  </p>
                  <p className="text-3xl font-bold text-orange-700 mt-2">
                    {teamStats.worstAttendanceRate.rate.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Gráfico de distribución */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Asistencia</CardTitle>
              <CardDescription>
                Cantidad de nadadores por rango de asistencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de horarios */}
          <Card>
            <CardHeader>
              <CardTitle>Asistencia por Horario</CardTitle>
              <CardDescription>
                Comparación de asistencia entre horarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={scheduleChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="asistencia" fill="#8b5cf6" name="% Asistencia" />
                  <Bar dataKey="nadadores" fill="#10b981" name="Nadadores" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VISTA 2: POR NADADOR */}
        <TabsContent value="swimmers" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {swimmerStats
              .sort((a, b) => b.attendanceRate - a.attendanceRate)
              .map((stats) => (
                <Card key={stats.swimmerId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{stats.swimmerName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getTrendIcon(stats.trend)}
                          {getTrendBadge(stats.trend)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">
                          {stats.attendanceRate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600">
                          {stats.attended}/{stats.totalSessions} sesiones
                        </p>
                      </div>
                    </div>

                    <Progress value={stats.attendanceRate} className="h-2 mb-3" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Racha Actual</p>
                        <p className="font-bold text-green-600">
                          🔥 {stats.currentStreak} días
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Racha Máxima</p>
                        <p className="font-bold text-purple-600">
                          ⭐ {stats.longestStreak} días
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ausencias</p>
                        <p className="font-bold text-red-600">❌ {stats.absent}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Justificadas</p>
                        <p className="font-bold text-orange-600">📋 {stats.justified}</p>
                      </div>
                    </div>

                    {stats.lastAttendance && (
                      <p className="text-xs text-gray-500 mt-3">
                        Última asistencia:{" "}
                        {new Date(stats.lastAttendance).toLocaleDateString("es-CL")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* VISTA 3: TENDENCIAS */}
        <TabsContent value="trends" className="space-y-6">
          {/* Gráfico de tendencia semanal */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Asistencia Semanal</CardTitle>
              <CardDescription>
                Evolución de la tasa de asistencia por semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weeklyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    label={{ value: "Semana", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis
                    label={{
                      value: "% Asistencia",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="averageAttendanceRate"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="% Asistencia"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalAttendances"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Total Asistencias"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Correlación asistencia-rendimiento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Correlación: Asistencia vs Rendimiento
              </CardTitle>
              <CardDescription>
                Análisis de cómo la asistencia impacta en las mejoras de marcas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performanceCorrelation
                  .sort((a, b) => b.attendanceRate - a.attendanceRate)
                  .map((corr) => (
                    <div
                      key={corr.swimmerId}
                      className={`p-4 rounded-lg border-2 ${
                        corr.correlation === "positive"
                          ? "border-green-200 bg-green-50"
                          : corr.correlation === "negative"
                          ? "border-red-200 bg-red-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold">{corr.swimmerName}</h4>
                        <Badge
                          className={
                            corr.correlation === "positive"
                              ? "bg-green-600"
                              : corr.correlation === "negative"
                              ? "bg-red-600"
                              : "bg-gray-600"
                          }
                        >
                          {corr.correlation === "positive"
                            ? "✓ Positiva"
                            : corr.correlation === "negative"
                            ? "✗ Negativa"
                            : "○ Neutral"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                        <div>
                          <p className="text-gray-600">Asistencia</p>
                          <p className="font-bold">{corr.attendanceRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Marcas</p>
                          <p className="font-bold">{corr.personalBestsCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Mejoras</p>
                          <p className="font-bold">{corr.improvementsCount}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 italic">{corr.insights}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VISTA 4: ALERTAS */}
        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card className="bg-gradient-to-br from-green-50 to-blue-50">
              <CardContent className="pt-12 pb-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  ¡Todo en orden!
                </h3>
                <p className="text-gray-600">
                  No hay alertas de asistencia en este momento. El equipo mantiene
                  buenos niveles de participación.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, idx) => (
                <Card key={idx} className={`border-2 ${getSeverityColor(alert.severity)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg">{alert.swimmer.name}</h3>
                          <Badge
                            className={
                              alert.severity === "high"
                                ? "bg-red-600"
                                : alert.severity === "medium"
                                ? "bg-orange-600"
                                : "bg-yellow-600"
                            }
                          >
                            {alert.severity === "high"
                              ? "Alta Prioridad"
                              : alert.severity === "medium"
                              ? "Media Prioridad"
                              : "Baja Prioridad"}
                          </Badge>
                        </div>
                        <p className="font-semibold text-gray-800 mb-1">
                          {alert.reason}
                        </p>
                        <p className="text-sm text-gray-700 mb-3">
                          💡 <strong>Recomendación:</strong> {alert.recommendation}
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Ver Perfil
                          </Button>
                          <Button size="sm" variant="outline">
                            Contactar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}