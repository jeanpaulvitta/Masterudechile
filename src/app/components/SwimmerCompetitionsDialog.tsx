import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Trophy, MapPin, Calendar, Check, X } from "lucide-react";
import type { SwimmerCompetition, Competition } from "../data/swimmers";

interface SwimmerCompetitionsDialogProps {
  swimmerId: string;
  swimmerName: string;
  swimmerCompetitions: SwimmerCompetition[];
  competitions: Competition[];
  onToggleParticipation: (competitionId: string, participates: boolean) => void;
}

export function SwimmerCompetitionsDialog({
  swimmerId,
  swimmerName,
  swimmerCompetitions,
  competitions,
  onToggleParticipation,
}: SwimmerCompetitionsDialogProps) {
  const [open, setOpen] = useState(false);

  const getTypeColor = (type: string) => {
    if (type === "Nacional") return "bg-red-100 text-red-800";
    if (type === "Internacional") return "bg-purple-100 text-purple-800";
    return "bg-blue-100 text-blue-800";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const isParticipating = (competitionId: string) => {
    const participation = swimmerCompetitions.find(
      (sc) => sc.swimmerId === swimmerId && sc.competitionId === competitionId
    );
    return participation?.participates || false;
  };

  // Contar competencias en las que participa
  const participatingCount = competitions.filter((comp) =>
    isParticipating(comp.id)
  ).length;

  // Agrupar competencias por semana
  const competitionsByWeek = competitions.reduce((acc, comp) => {
    if (!acc[comp.week]) {
      acc[comp.week] = [];
    }
    acc[comp.week].push(comp);
    return acc;
  }, {} as Record<number, Competition[]>);

  const sortedWeeks = Object.keys(competitionsByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Trophy className="w-4 h-4" />
          Competencias
          {participatingCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {participatingCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Participación en Competencias - {swimmerName}
          </DialogTitle>
          <DialogDescription>
            Marca las competencias en las que {swimmerName} va a participar
          </DialogDescription>
        </DialogHeader>

        {competitions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No hay competencias programadas</p>
            <p className="text-sm mt-2">
              Agrega competencias desde la sección de Entrenamientos
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumen */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Participando en:</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {participatingCount} / {competitions.length}
                    </p>
                    <p className="text-sm text-gray-600">competencias</p>
                  </div>
                  <Trophy className="w-16 h-16 text-blue-600 opacity-20" />
                </div>
              </CardContent>
            </Card>

            {/* Lista de Competencias por Semana */}
            <div className="space-y-6">
              {sortedWeeks.map((weekNum) => (
                <div key={weekNum} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-lg">Semana {weekNum}</h3>
                  </div>

                  <div className="space-y-3 ml-7">
                    {competitionsByWeek[weekNum].map((competition) => {
                      const participating = isParticipating(competition.id);
                      
                      return (
                        <Card
                          key={competition.id}
                          className={`transition-all ${
                            participating
                              ? "border-2 border-green-300 bg-green-50/50"
                              : "border-gray-200"
                          }`}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-4">
                              {/* Checkbox */}
                              <div className="pt-1">
                                <Checkbox
                                  id={`comp-${competition.id}`}
                                  checked={participating}
                                  onCheckedChange={(checked) => {
                                    onToggleParticipation(
                                      competition.id,
                                      checked as boolean
                                    );
                                  }}
                                  className="w-5 h-5"
                                />
                              </div>

                              {/* Información de la Competencia */}
                              <div className="flex-1">
                                <Label
                                  htmlFor={`comp-${competition.id}`}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-bold text-lg">
                                          {competition.name}
                                        </h4>
                                        <Badge className={getTypeColor(competition.type)}>
                                          {competition.type}
                                        </Badge>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4" />
                                          <span>
                                            {formatDate(competition.startDate)}
                                            {competition.endDate &&
                                              competition.endDate !== competition.startDate &&
                                              ` - ${formatDate(competition.endDate)}`}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <MapPin className="w-4 h-4" />
                                          <span>{competition.location}</span>
                                        </div>
                                      </div>

                                      {/* Detalles adicionales */}
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                        {competition.poolType && (
                                          <div>
                                            <span className="font-semibold">Piscina:</span>{" "}
                                            {competition.poolType}
                                          </div>
                                        )}
                                        {competition.cost && (
                                          <div>
                                            <span className="font-semibold">Inscripción:</span>{" "}
                                            {competition.cost}
                                          </div>
                                        )}
                                        {competition.schedule && (
                                          <div>
                                            <span className="font-semibold">Horario:</span>{" "}
                                            {competition.schedule}
                                          </div>
                                        )}
                                      </div>

                                      {/* Pruebas disponibles */}
                                      {competition.events && competition.events.length > 0 && (
                                        <div className="mt-3">
                                          <div className="text-xs font-semibold text-gray-700 mb-1">
                                            Pruebas disponibles:
                                          </div>
                                          <div className="flex flex-wrap gap-1">
                                            {competition.events.slice(0, 5).map((event, idx) => (
                                              <Badge key={idx} variant="outline" className="text-xs">
                                                {event}
                                              </Badge>
                                            ))}
                                            {competition.events.length > 5 && (
                                              <Badge variant="outline" className="text-xs">
                                                +{competition.events.length - 5} más
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Descripción */}
                                      {competition.description && (
                                        <div className="mt-3 text-xs text-gray-600 bg-white/50 rounded p-2">
                                          {competition.description}
                                        </div>
                                      )}
                                    </div>

                                    {/* Indicador visual de participación */}
                                    {participating && (
                                      <div className="flex-shrink-0">
                                        <div className="bg-green-500 text-white rounded-full p-2">
                                          <Check className="w-5 h-5" />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </Label>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-4" />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
