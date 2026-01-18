import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Trophy, Calendar, MapPin, Waves, Plus, Check, Award, TrendingUp, Clock } from "lucide-react";
import type { Competition, SwimmerCompetition, Swimmer } from "../data/swimmers";

interface CompetitionResultsProps {
  swimmer: Swimmer;
  competitions: Competition[];
  swimmerCompetitions: SwimmerCompetition[];
  onUpdateResults: (
    competitionId: string,
    events: { event: string; time?: string; position?: number; points?: number }[]
  ) => Promise<void>;
}

// Función auxiliar para convertir tiempo MM:SS.SS a segundos
function timeToSeconds(time: string): number {
  const parts = time.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return parseFloat(time);
}

// Función para extraer distancia y estilo del nombre del evento
function parseEvent(eventName: string): { distance: number; style: string } | null {
  // Ejemplos: "50m Libre", "100m Espalda", "200m Combinado"
  const match = eventName.match(/(\d+)m?\s+(.+)/i);
  if (match) {
    const distance = parseInt(match[1]);
    const style = match[2].trim();
    
    // Normalizar estilos
    const styleMap: Record<string, string> = {
      'Libre': 'Libre',
      'Espalda': 'Espalda',
      'Pecho': 'Pecho',
      'Mariposa': 'Mariposa',
      'Combinado': 'Combinado',
      'IM': 'Combinado',
      'Medley': 'Combinado'
    };
    
    const normalizedStyle = styleMap[style] || style;
    
    return { distance, style: normalizedStyle };
  }
  return null;
}

export function CompetitionResults({
  swimmer,
  competitions,
  swimmerCompetitions,
  onUpdateResults,
}: CompetitionResultsProps) {
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventResults, setEventResults] = useState<Record<string, { time: string; position: string; points: string }>>({});

  // Obtener competencias donde el nadador participa
  const myCompetitions = competitions.filter((comp) => {
    const participation = swimmerCompetitions.find(
      (sc) => sc.competitionId === comp.id && sc.swimmerId === swimmer.id
    );
    return participation?.participates;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getCompetitionTypeColor = (type: Competition["type"]) => {
    switch (type) {
      case "Regional":
        return "bg-blue-100 text-blue-800";
      case "Nacional":
        return "bg-red-100 text-red-800";
      case "Internacional":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleOpenDialog = (competition: Competition) => {
    setSelectedCompetition(competition);
    
    // Cargar resultados existentes si los hay
    const participation = swimmerCompetitions.find(
      (sc) => sc.competitionId === competition.id && sc.swimmerId === swimmer.id
    );
    
    if (participation?.events) {
      const existingResults: Record<string, { time: string; position: string; points: string }> = {};
      participation.events.forEach((evt) => {
        existingResults[evt.event] = {
          time: evt.time || "",
          position: evt.position?.toString() || "",
          points: evt.points?.toString() || "",
        };
      });
      setEventResults(existingResults);
    } else {
      setEventResults({});
    }
    
    setDialogOpen(true);
  };

  const handleSaveResults = async () => {
    if (!selectedCompetition) return;

    // Convertir los resultados al formato correcto
    const events = Object.entries(eventResults)
      .filter(([_, result]) => result.time) // Solo incluir eventos con tiempo registrado
      .map(([event, result]) => ({
        event,
        time: result.time,
        position: result.position ? parseInt(result.position) : undefined,
        points: result.points ? parseInt(result.points) : undefined,
      }));

    try {
      await onUpdateResults(selectedCompetition.id, events);
      setDialogOpen(false);
      setSelectedCompetition(null);
      setEventResults({});
    } catch (error) {
      console.error("Error saving results:", error);
    }
  };

  const handleEventChange = (event: string, field: 'time' | 'position' | 'points', value: string) => {
    setEventResults(prev => ({
      ...prev,
      [event]: {
        ...(prev[event] || { time: '', position: '', points: '' }),
        [field]: value,
      },
    }));
  };

  // Verificar si el resultado es una mejora personal
  const isPersonalBest = (eventName: string, time: string): boolean => {
    if (!time || !swimmer.personalBests) return false;
    
    const parsed = parseEvent(eventName);
    if (!parsed) return false;
    
    const { distance, style } = parsed;
    const currentBest = swimmer.personalBests.find(
      pb => pb.distance === distance && pb.style === style
    );
    
    if (!currentBest) return true; // Es la primera marca
    
    const newTimeSeconds = timeToSeconds(time);
    const currentBestSeconds = timeToSeconds(currentBest.time);
    
    return newTimeSeconds < currentBestSeconds;
  };

  // Ordenar competencias por fecha
  const sortedCompetitions = [...myCompetitions].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-600" />
            Mis Competencias
          </h2>
          <p className="text-gray-600 mt-1">
            Registra tus resultados y mejora tus marcas personales
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Competencias</div>
          <div className="text-2xl font-bold text-yellow-600">{myCompetitions.length}</div>
        </div>
      </div>

      {sortedCompetitions.length === 0 ? (
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
          <CardContent className="pt-12 pb-12 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay competencias programadas
            </h3>
            <p className="text-gray-600">
              Aún no estás registrado en ninguna competencia. Consulta con tu entrenador.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedCompetitions.map((competition) => {
            const participation = swimmerCompetitions.find(
              (sc) => sc.competitionId === competition.id && sc.swimmerId === swimmer.id
            );
            
            const hasResults = participation?.events && participation.events.some(e => e.time);
            const totalEvents = participation?.events?.length || 0;
            const completedEvents = participation?.events?.filter(e => e.time).length || 0;

            return (
              <Card
                key={competition.id}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-6 h-6 text-yellow-600" />
                        <CardTitle>{competition.name}</CardTitle>
                        <Badge className={getCompetitionTypeColor(competition.type)}>
                          {competition.type}
                        </Badge>
                        {hasResults && (
                          <Badge className="bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Resultados Registrados
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{formatDate(competition.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span>{competition.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Waves className="w-4 h-4 text-gray-500" />
                          <span>Piscina {competition.poolType}</span>
                        </div>
                        {totalEvents > 0 && (
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-gray-500" />
                            <span>{completedEvents} de {totalEvents} pruebas completadas</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Dialog open={dialogOpen && selectedCompetition?.id === competition.id} onOpenChange={(open) => {
                      if (!open) {
                        setDialogOpen(false);
                        setSelectedCompetition(null);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant={hasResults ? "outline" : "default"}
                          onClick={() => handleOpenDialog(competition)}
                        >
                          {hasResults ? (
                            <>
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Actualizar
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Registrar Resultados
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-600" />
                            Registrar Resultados - {selectedCompetition?.name}
                          </DialogTitle>
                          <DialogDescription>
                            Ingresa tus tiempos y posiciones. Los tiempos se actualizarán automáticamente en tu ficha personal si son mejoras.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                          {selectedCompetition?.events && selectedCompetition.events.length > 0 ? (
                            selectedCompetition.events.map((event) => {
                              const currentResult = eventResults[event] || { time: '', position: '', points: '' };
                              const isPB = currentResult.time && isPersonalBest(event, currentResult.time);
                              
                              return (
                                <Card key={event} className={isPB ? "border-2 border-green-400 bg-green-50" : ""}>
                                  <CardContent className="pt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-semibold text-lg">{event}</h4>
                                      {isPB && (
                                        <Badge className="bg-green-600 text-white">
                                          <Award className="w-3 h-3 mr-1" />
                                          ¡Mejora Personal!
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-3">
                                      <div className="space-y-2">
                                        <Label htmlFor={`time-${event}`} className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          Tiempo
                                        </Label>
                                        <Input
                                          id={`time-${event}`}
                                          placeholder="MM:SS.SS"
                                          value={currentResult.time}
                                          onChange={(e) => handleEventChange(event, 'time', e.target.value)}
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor={`position-${event}`}>Posición</Label>
                                        <Input
                                          id={`position-${event}`}
                                          type="number"
                                          placeholder="1, 2, 3..."
                                          value={currentResult.position}
                                          onChange={(e) => handleEventChange(event, 'position', e.target.value)}
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label htmlFor={`points-${event}`}>Puntos FINA</Label>
                                        <Input
                                          id={`points-${event}`}
                                          type="number"
                                          placeholder="Opcional"
                                          value={currentResult.points}
                                          onChange={(e) => handleEventChange(event, 'points', e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                              <p>No hay pruebas definidas para esta competencia.</p>
                            </div>
                          )}
                        </div>

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setDialogOpen(false);
                              setSelectedCompetition(null);
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button onClick={handleSaveResults}>
                            <Check className="w-4 h-4 mr-2" />
                            Guardar Resultados
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>

                {hasResults && (
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-700 mb-3">Mis Resultados:</h4>
                      {participation?.events?.filter(e => e.time).map((evt) => (
                        <div
                          key={evt.event}
                          className="flex items-center justify-between bg-white rounded-lg p-3 border"
                        >
                          <div className="flex items-center gap-3">
                            <Award className="w-4 h-4 text-yellow-600" />
                            <span className="font-medium">{evt.event}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="font-semibold text-blue-600">{evt.time}</span>
                            </div>
                            {evt.position && (
                              <Badge variant="outline">
                                {evt.position}° lugar
                              </Badge>
                            )}
                            {evt.points && (
                              <Badge variant="outline">
                                {evt.points} pts
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
