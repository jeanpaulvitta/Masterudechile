import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Activity,
  TrendingUp,
  Filter,
  BarChart3,
  CheckCircle2,
  Users,
  Zap,
  Edit,
  Trash2
} from "lucide-react";
import type { Swimmer } from "../data/swimmers";
import * as api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { SwimmerStatsDialog } from "./SwimmerStatsDialog";
import { AttendanceAnalytics } from "./AttendanceAnalytics";

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

interface AttendanceManagerProps {
  swimmers: Swimmer[];
  sessions: Array<{
    id: string;
    week: number;
    date: string;
    mesociclo: string;
    distance: number;
    type: "workout" | "challenge";
  }>;
}

export function AttendanceManager({ swimmers, sessions }: AttendanceManagerProps) {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [filterSchedule, setFilterSchedule] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedSwimmer, setSelectedSwimmer] = useState<Swimmer | null>(null);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});

  // Determinar si el usuario puede registrar asistencia
  const canRegisterAttendance = user?.role === 'admin' || user?.role === 'coach';

  // Cargar registros de asistencia al montar
  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const records = await api.fetchAttendance();
      // Mapear los registros de la API al formato del componente
      // Filtrar registros que no tengan los campos requeridos
      const mappedRecords: AttendanceRecord[] = records
        .filter(record => record && record.id && record.swimmerId && record.sessionId)
        .map(record => ({
          id: record.id,
          sessionId: record.sessionId,
          sessionDate: record.date,
          sessionType: "workout" as const, // Por defecto, se puede mejorar
          swimmerId: record.swimmerId,
          status: record.status === "present" ? "presente" : record.status === "absent" ? "ausente" : "justificado",
          notes: record.notes,
          timestamp: Date.now()
        }));
      setAttendanceRecords(mappedRecords);
      console.log("✅ Asistencias cargadas desde Supabase:", mappedRecords);
    } catch (error) {
      console.error("❌ Error cargando asistencias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwimmerClick = (swimmer: Swimmer) => {
    setSelectedSwimmer(swimmer);
    setStatsDialogOpen(true);
  };

  // Nueva función para registro rápido
  const handleQuickAttendance = async (swimmerId: string, status: "presente" | "ausente" | "justificado") => {
    if (!selectedSession) return;
    await handleAttendanceChange(swimmerId, status);
  };

  // Nueva función para eliminar registro de asistencia
  const handleDeleteAttendance = async (recordId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este registro de asistencia?")) {
      return;
    }

    try {
      console.log("🗑️ Attempting to delete attendance record with ID:", recordId);
      console.log("📋 Current attendance records:", attendanceRecords.map(r => ({ id: r.id, swimmer: r.swimmerId })));
      
      await api.deleteAttendanceRecord(recordId);
      setAttendanceRecords(attendanceRecords.filter(r => r.id !== recordId));
      console.log("✅ Registro de asistencia eliminado");
    } catch (error: any) {
      console.error("❌ Error eliminando registro:", error);
      // Solo mostrar alerta si no es un error de "no encontrado"
      if (!error.message?.includes("not found") && !error.message?.includes("already deleted")) {
        alert("Error al eliminar el registro de asistencia.");
      } else {
        // Si el registro no se encontró, eliminarlo del estado local de todos modos
        setAttendanceRecords(attendanceRecords.filter(r => r.id !== recordId));
        console.log("✅ Registro eliminado del estado local");
      }
    }
  };

  const handleAttendanceChange = async (
    swimmerId: string,
    status: "presente" | "ausente" | "justificado",
    notes?: string
  ) => {
    if (!selectedSession) return;

    const session = sessions.find(s => s.id === selectedSession);
    if (!session) return;

    const existingIndex = attendanceRecords.findIndex(
      r => r.sessionId === selectedSession && r.swimmerId === swimmerId
    );

    try {
      // Convertir status al formato de la API
      const apiStatus = status === "presente" ? "present" : status === "ausente" ? "absent" : "late";
      
      const swimmer = swimmers.find(s => s.id === swimmerId);
      const schedule = swimmer?.schedule || "7am";

      const recordData = {
        swimmerId,
        sessionId: selectedSession,
        date: session.date,
        schedule,
        status: apiStatus,
        distanceCompleted: status === "presente" ? session.distance : 0,
        notes
      };

      let updatedRecord: any;

      if (existingIndex >= 0) {
        // Intentar actualizar registro existente
        const existingRecord = attendanceRecords[existingIndex];
        try {
          updatedRecord = await api.updateAttendanceRecord(existingRecord.id, recordData);
          
          const newRecords = [...attendanceRecords];
          newRecords[existingIndex] = {
            ...existingRecord,
            status,
            notes,
            timestamp: Date.now()
          };
          setAttendanceRecords(newRecords);
          console.log('✅ Registro de asistencia actualizado');
        } catch (updateError: any) {
          // Si el update falla porque el registro no existe, crear uno nuevo
          if (updateError.message?.includes('not found') || updateError.message?.includes('Attendance record not found')) {
            console.log('⚠️ Registro no encontrado, creando uno nuevo...');
            updatedRecord = await api.addAttendanceRecord(recordData);
            
            const newRecords = [...attendanceRecords];
            newRecords[existingIndex] = {
              id: updatedRecord.id,
              sessionId: selectedSession,
              sessionDate: session.date,
              sessionType: session.type,
              swimmerId,
              status,
              notes,
              timestamp: Date.now()
            };
            setAttendanceRecords(newRecords);
            console.log('✅ Nuevo registro de asistencia creado');
          } else {
            throw updateError;
          }
        }
      } else {
        // Crear nuevo registro
        const apiRecord = await api.addAttendanceRecord(recordData);

        const newRecord: AttendanceRecord = {
          id: apiRecord.id,
          sessionId: selectedSession,
          sessionDate: session.date,
          sessionType: session.type,
          swimmerId,
          status,
          notes,
          timestamp: Date.now()
        };

        setAttendanceRecords([...attendanceRecords, newRecord]);
        console.log('✅ Nuevo registro de asistencia creado');
      }
    } catch (error) {
      console.error("❌ Error guardando asistencia:", error);
      alert("Error al guardar la asistencia. Por favor, intenta nuevamente.");
    }
  };

  const getAttendanceForSession = (sessionId: string, swimmerId: string) => {
    return attendanceRecords.find(
      r => r.sessionId === sessionId && r.swimmerId === swimmerId
    );
  };

  const calculateStats = (swimmerId: string) => {
    const records = attendanceRecords.filter(r => r.swimmerId === swimmerId);
    const presente = records.filter(r => r.status === "presente").length;
    const ausente = records.filter(r => r.status === "ausente").length;
    const justificado = records.filter(r => r.status === "justificado").length;
    const total = records.length;

    return {
      presente,
      ausente,
      justificado,
      total,
      percentage: total > 0 ? Math.round((presente / total) * 100) : 0
    };
  };

  const filteredSwimmers = swimmers.filter(s => {
    if (filterSchedule !== "all" && s.schedule !== filterSchedule) return false;
    return true;
  });

  const selectedSessionData = sessions.find(s => s.id === selectedSession);

  // Mostrar mensaje si no hay nadadores
  if (swimmers.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="pt-12 pb-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No hay nadadores registrados
          </h3>
          <p className="text-gray-600">
            Necesitas agregar nadadores antes de registrar asistencias.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con Estadísticas Generales */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-green-600" />
            <div>
              <CardTitle className="text-2xl">Control de Asistencias</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {canRegisterAttendance 
                  ? "Registro completo de asistencias e inasistencias por sesión"
                  : "Consulta tus estadísticas de asistencia"}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {canRegisterAttendance ? (
        <Tabs defaultValue="registro">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="registro" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden sm:inline">Registrar Asistencia</span>
              <span className="sm:hidden">Registro</span>
            </TabsTrigger>
            <TabsTrigger value="estadisticas" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Estadísticas</span>
              <span className="sm:hidden">Estadísticas</span>
            </TabsTrigger>
            <TabsTrigger value="analisis" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Análisis</span>
              <span className="sm:hidden">Análisis</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB: Registro Unificado */}
          <TabsContent value="registro" className="space-y-6">
            {/* Selector de Sesión */}
            <Card>
              <CardHeader>
                <CardTitle>Seleccionar Sesión</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Sesión de Entrenamiento</Label>
                    <Select value={selectedSession} onValueChange={setSelectedSession}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una sesión..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {sessions.map((session) => (
                          <SelectItem key={session.id} value={session.id}>
                            {session.type === "workout" ? "🏊" : "🏆"} Semana {session.week} - {session.date} - {session.mesociclo} ({session.distance}m)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Filtrar por Horario</Label>
                    <Select value={filterSchedule} onValueChange={setFilterSchedule}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los horarios</SelectItem>
                        <SelectItem value="7am">Grupo 7:00 AM</SelectItem>
                        <SelectItem value="8am">Grupo 8:00 AM</SelectItem>
                        <SelectItem value="9pm">Grupo 9:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedSessionData && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold mb-2">Sesión Seleccionada:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Tipo:</span>
                        <p className="font-semibold">
                          {selectedSessionData.type === "workout" ? "Entrenamiento Regular" : "Desafío Sábado"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Fecha:</span>
                        <p className="font-semibold">{selectedSessionData.date}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Mesociclo:</span>
                        <p className="font-semibold">{selectedSessionData.mesociclo}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Distancia:</span>
                        <p className="font-semibold">{selectedSessionData.distance}m</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de Nadadores para Registrar */}
            {selectedSession && (
              <Card>
                <CardHeader>
                  <CardTitle>Registrar Asistencia de Nadadores</CardTitle>
                  <p className="text-sm text-gray-600">
                    Grupo: {filterSchedule === "all" ? "Todos" : filterSchedule.toUpperCase()} ({filteredSwimmers.length} nadadores)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredSwimmers.map((swimmer) => (
                      <SwimmerAttendanceRow
                        key={swimmer.id}
                        swimmer={swimmer}
                        existingRecord={getAttendanceForSession(selectedSession, swimmer.id)}
                        onSave={(status, notes) => 
                          handleAttendanceChange(swimmer.id, status, notes)
                        }
                        onSwimmerClick={handleSwimmerClick}
                        onQuickAttendance={handleQuickAttendance}
                        onDeleteAttendance={handleDeleteAttendance}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {!selectedSession && (
              <Card className="bg-gray-50">
                <CardContent className="pt-6 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Selecciona una sesión para comenzar a registrar asistencias</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* TAB: Estadísticas */}
          <TabsContent value="estadisticas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nadadores del Equipo</CardTitle>
                <p className="text-sm text-gray-600">
                  Haz clic en un nombre para ver sus estadísticas detalladas
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {swimmers.map((swimmer) => (
                    <button
                      key={swimmer.id}
                      onClick={() => handleSwimmerClick(swimmer)}
                      className="p-4 text-left border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <p className="font-semibold text-lg hover:text-blue-600">{swimmer.name}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{swimmer.schedule}</Badge>
                        <Badge variant="secondary" className="text-xs">{swimmer.category}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Análisis Avanzado */}
          <TabsContent value="analisis" className="space-y-6">
            <AttendanceAnalytics
              attendanceRecords={attendanceRecords}
              sessions={sessions}
              swimmers={swimmers}
            />
          </TabsContent>
        </Tabs>
      ) : (
        // Vista solo de estadísticas para nadadores
        <Card>
          <CardHeader>
            <CardTitle>Nadadores del Equipo</CardTitle>
            <p className="text-sm text-gray-600">
              Haz clic en un nombre para ver sus estadísticas detalladas
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {swimmers.map((swimmer) => (
                <button
                  key={swimmer.id}
                  onClick={() => handleSwimmerClick(swimmer)}
                  className="p-4 text-left border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <p className="font-semibold text-lg hover:text-blue-600">{swimmer.name}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{swimmer.schedule}</Badge>
                    <Badge variant="secondary" className="text-xs">{swimmer.category}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Diálogo de Estadísticas del Nadador */}
      <SwimmerStatsDialog
        swimmer={selectedSwimmer}
        open={statsDialogOpen}
        onOpenChange={setStatsDialogOpen}
        attendanceRecords={attendanceRecords}
        sessions={sessions}
      />
    </div>
  );
}

// Componente para cada fila de nadador
interface SwimmerAttendanceRowProps {
  swimmer: Swimmer;
  existingRecord?: AttendanceRecord;
  onSave: (status: "presente" | "ausente" | "justificado", notes?: string) => void;
  onSwimmerClick: (swimmer: Swimmer) => void;
  onQuickAttendance: (swimmerId: string, status: "presente" | "ausente" | "justificado") => void;
  onDeleteAttendance: (recordId: string) => void;
}

function SwimmerAttendanceRow({ swimmer, existingRecord, onSave, onSwimmerClick, onQuickAttendance, onDeleteAttendance }: SwimmerAttendanceRowProps) {
  const [status, setStatus] = useState<"presente" | "ausente" | "justificado">(
    existingRecord?.status || "presente"
  );
  const [notes, setNotes] = useState<string>(existingRecord?.notes || "");
  const [isSaved, setIsSaved] = useState(!!existingRecord);

  const handleSave = () => {
    onSave(status, notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className={`p-4 border rounded-lg ${existingRecord ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Nadador Info */}
        <div className="md:col-span-3">
          <button
            onClick={() => onSwimmerClick(swimmer)}
            className="text-left hover:underline hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            <p className="font-semibold">{swimmer.name}</p>
          </button>
          <div className="flex gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{swimmer.schedule}</Badge>
            <Badge variant="secondary" className="text-xs">{swimmer.category}</Badge>
          </div>
        </div>

        {/* Estado */}
        <div className="md:col-span-3">
          <Label className="text-xs">Estado</Label>
          <Select value={status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="presente">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Presente
                </div>
              </SelectItem>
              <SelectItem value="ausente">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Ausente
                </div>
              </SelectItem>
              <SelectItem value="justificado">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  Justificado
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notas */}
        <div className="md:col-span-3">
          <Label className="text-xs">Notas (opcional)</Label>
          <Input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observaciones..."
            className="mt-1"
          />
        </div>

        {/* Botón Guardar */}
        <div className="md:col-span-1">
          <Button 
            onClick={handleSave}
            size="sm"
            className={`w-full ${isSaved ? 'bg-green-600' : ''}`}
          >
            {isSaved ? "✓ Guardado" : "Guardar"}
          </Button>
        </div>

        {/* Botón Eliminar */}
        {existingRecord && (
          <div className="md:col-span-1">
            <Button 
              onClick={() => onDeleteAttendance(existingRecord.id)}
              size="sm"
              className="w-full bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}