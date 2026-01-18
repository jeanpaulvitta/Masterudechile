import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  TrendingUp,
  BarChart3
} from "lucide-react";
import type { Swimmer } from "../data/swimmers";

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  sessionDate: string;
  sessionType: "workout" | "challenge";
  swimmerId: string;
  status: "presente" | "ausente" | "justificado";
  notes?: string;
  timestamp: number;
}

interface SwimmerStatsDialogProps {
  swimmer: Swimmer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendanceRecords: AttendanceRecord[];
  sessions: Array<{
    id: string;
    week: number;
    date: string;
    mesociclo: string;
    distance: number;
    type: "workout" | "challenge";
  }>;
}

export function SwimmerStatsDialog({
  swimmer,
  open,
  onOpenChange,
  attendanceRecords,
  sessions
}: SwimmerStatsDialogProps) {
  if (!swimmer) return null;

  // Filtrar registros del nadador
  const swimmerRecords = attendanceRecords.filter(r => r.swimmerId === swimmer.id);
  
  // Calcular estadísticas
  const presente = swimmerRecords.filter(r => r.status === "presente").length;
  const ausente = swimmerRecords.filter(r => r.status === "ausente").length;
  const justificado = swimmerRecords.filter(r => r.status === "justificado").length;
  const total = swimmerRecords.length;
  const percentage = total > 0 ? Math.round((presente / total) * 100) : 0;

  // Ordenar registros por fecha (más recientes primero)
  const sortedRecords = [...swimmerRecords].sort((a, b) => b.timestamp - a.timestamp);

  // Obtener información de la sesión
  const getSessionInfo = (sessionId: string) => {
    return sessions.find(s => s.id === sessionId);
  };

  // Calcular distancia total completada
  const totalDistance = swimmerRecords
    .filter(r => r.status === "presente")
    .reduce((acc, record) => {
      const session = getSessionInfo(record.sessionId);
      return acc + (session?.distance || 0);
    }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Estadísticas de {swimmer.name}</DialogTitle>
          <DialogDescription>
            Historial completo de asistencia y rendimiento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Información del Nadador */}
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="text-lg">Información del Nadador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-semibold">{swimmer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categoría</p>
                  <Badge variant="secondary">{swimmer.category}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Horario</p>
                  <Badge variant="outline">{swimmer.schedule}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Género</p>
                  <p className="font-semibold">{swimmer.gender || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estadísticas de Rendimiento - PRIMERO */}
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Distancia Total</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {(totalDistance / 1000).toFixed(1)}
                    </p>
                    <p className="text-xs font-semibold text-blue-500">kilómetros</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {totalDistance.toLocaleString()} metros
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">Promedio</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {presente > 0 ? Math.round(totalDistance / presente) : 0}
                    </p>
                    <p className="text-xs font-semibold text-purple-500">metros/sesión</p>
                    <p className="text-xs text-gray-500 mt-1">
                      en {presente} asistencias
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sesiones Completadas</span>
                    <span className="text-lg font-bold text-blue-600">{presente} / {total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas de Asistencia - SEGUNDO */}
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Asistencia
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Presente</p>
                    <p className="text-2xl font-bold text-green-600">{presente}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <XCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Ausente</p>
                    <p className="text-2xl font-bold text-red-600">{ausente}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <AlertCircle className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Justif.</p>
                    <p className="text-2xl font-bold text-yellow-600">{justificado}</p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Porcentaje de Asistencia</span>
                    <span className="text-3xl font-bold text-green-600">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {total} sesiones totales registradas
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historial de Asistencias */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                Historial de Asistencias
              </CardTitle>
              <p className="text-sm text-gray-600">
                Últimas {Math.min(sortedRecords.length, 20)} sesiones registradas
              </p>
            </CardHeader>
            <CardContent>
              {sortedRecords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay registros de asistencia para este nadador</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {sortedRecords.slice(0, 20).map((record) => {
                    const session = getSessionInfo(record.sessionId);
                    return (
                      <div
                        key={record.id}
                        className={`p-3 rounded-lg border ${
                          record.status === "presente"
                            ? "bg-green-50 border-green-200"
                            : record.status === "ausente"
                            ? "bg-red-50 border-red-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {record.status === "presente" && (
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              )}
                              {record.status === "ausente" && (
                                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                              )}
                              {record.status === "justificado" && (
                                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                              )}
                              <span className="font-semibold text-sm capitalize">
                                {record.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {record.sessionDate}
                              {session && (
                                <span className="ml-2 text-xs">
                                  {session.type === "workout" ? "🏊" : "🏆"} Semana {session.week} - {session.mesociclo}
                                </span>
                              )}
                            </p>
                            {record.notes && (
                              <p className="text-xs text-gray-500 mt-1 italic">
                                "{record.notes}"
                              </p>
                            )}
                          </div>
                          {session && record.status === "presente" && (
                            <Badge variant="secondary" className="flex-shrink-0">
                              {session.distance}m
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}