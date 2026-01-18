import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { User, Mail, Calendar, Trash2, Crown } from "lucide-react";
import { SwimmerCompetitionsDialog } from "./SwimmerCompetitionsDialog";
import { EditSwimmerDialog } from "./EditSwimmerDialog";
import { PersonalBestsDialog } from "./PersonalBestsDialog";
import { PerformanceDialog } from "./PerformanceDialog";
import { ProgressionDialog } from "./ProgressionDialog";
import type { Swimmer, AttendanceRecord, SwimmerCompetition, Competition, PersonalBest, PersonalBestHistory } from "../data/swimmers";
import { calculateAge, calculateMasterCategory } from "../utils/swimmerUtils";
import { isTeamRecord } from "../utils/recordsUtils";

interface SwimmerCardProps {
  swimmer: Swimmer;
  attendanceRecords: AttendanceRecord[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string, updatedSwimmer: Omit<Swimmer, "id">) => void;
  onSavePersonalBests?: (swimmerId: string, personalBests: PersonalBest[], history: PersonalBestHistory[]) => void;
  swimmerCompetitions: SwimmerCompetition[];
  competitions: Competition[];
  allSwimmers?: Swimmer[]; // Para verificar récords del equipo
}

export function SwimmerCard({ swimmer, attendanceRecords, onDelete, onEdit, onSavePersonalBests, swimmerCompetitions, competitions, allSwimmers = [] }: SwimmerCardProps) {
  // Calcular edad y categoría
  const age = calculateAge(swimmer.dateOfBirth);
  const category = calculateMasterCategory(age);

  // Contar récords del equipo que tiene este nadador
  const personalBestsArray = Array.isArray(swimmer.personalBests) 
    ? swimmer.personalBests 
    : [];
  const teamRecordsCount = personalBestsArray.filter(pb => 
    isTeamRecord(swimmer, pb, allSwimmers)
  ).length || 0;

  const getScheduleColor = (schedule: string) => {
    if (schedule === "7am") return "bg-orange-100 text-orange-800";
    if (schedule === "8am") return "bg-blue-100 text-blue-800";
    if (schedule === "9pm") return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{swimmer.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <Mail className="w-3 h-3" />
                <span>{swimmer.email}</span>
              </div>
            </div>
          </div>
          <Badge className={getScheduleColor(swimmer.schedule)}>
            {swimmer.schedule.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">RUT:</span>
            <p className="font-semibold">{swimmer.rut || "No registrado"}</p>
          </div>
          <div>
            <span className="text-gray-600">Género:</span>
            <p className="font-semibold">{swimmer.gender || "No registrado"}</p>
          </div>
          <div>
            <span className="text-gray-600">Edad:</span>
            <p className="font-semibold">{age} años</p>
          </div>
          <div>
            <span className="text-gray-600">Categoría:</span>
            <p className="font-semibold text-sm">{category}</p>
          </div>
        </div>

        {/* Fecha de ingreso */}
        <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
          <Calendar className="w-3 h-3" />
          <span>Ingreso: {swimmer.joinDate}</span>
        </div>

        {/* Indicador de Récords del Equipo */}
        {teamRecordsCount > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-800">
                  {teamRecordsCount} Récord{teamRecordsCount > 1 ? 's' : ''} del Equipo
                </p>
                <p className="text-xs text-yellow-700">
                  Este nadador ostenta {teamRecordsCount} marca{teamRecordsCount > 1 ? 's' : ''} récord en su categoría
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botón de Competencias */}
        <SwimmerCompetitionsDialog
          swimmerId={swimmer.id}
          swimmerName={swimmer.name}
          swimmerCompetitions={swimmerCompetitions}
          competitions={competitions}
        />

        {/* Botón de Mejores Tiempos */}
        <PersonalBestsDialog
          swimmerId={swimmer.id}
          swimmerName={swimmer.name}
          swimmer={swimmer}
          allSwimmers={allSwimmers}
          personalBests={swimmer.personalBests}
          onSavePersonalBests={onSavePersonalBests}
        />

        {/* Botón de Ritmos de Entrenamiento */}
        <PerformanceDialog
          swimmer={swimmer}
          personalBests={swimmer.personalBests}
        />

        {/* Botón de Progresión */}
        <ProgressionDialog
          swimmer={swimmer}
        />

        {/* Botón de editar */}
        {onEdit && (
          <EditSwimmerDialog
            swimmer={swimmer}
            onEditSwimmer={onEdit}
          />
        )}

        {/* Botón de eliminar */}
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            className="w-full gap-2"
            onClick={() => onDelete(swimmer.id)}
          >
            <Trash2 className="w-4 h-4" />
            Eliminar Nadador
          </Button>
        )}
      </CardContent>
    </Card>
  );
}