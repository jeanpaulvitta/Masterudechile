import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { User, Mail, Calendar, Trash2, Cake, Crown, CreditCard, Users, FileDown } from "lucide-react";
import { SwimmerCompetitionsDialog } from "./SwimmerCompetitionsDialog";
import { EditSwimmerDialog } from "./EditSwimmerDialog";
import { PersonalBestsDialog } from "./PersonalBestsDialog";
import { PerformanceDialog } from "./PerformanceDialog";
import { ProgressionDialog } from "./ProgressionDialog";
import { GoalsDialog } from "./GoalsDialog";
import type { Swimmer, AttendanceRecord, SwimmerCompetition, Competition, PersonalBest, PersonalBestHistory } from "../data/swimmers";
import { calculateAge, calculateMasterCategory } from "../utils/swimmerUtils";
import { isTeamRecord } from "../utils/recordsUtils";
import { generateSwimmerPDF } from "../utils/pdfGenerator";

interface SwimmerDetailsDialogProps {
  swimmer: Swimmer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendanceRecords: AttendanceRecord[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string, updatedSwimmer: Omit<Swimmer, "id">) => void;
  onSavePersonalBests?: (swimmerId: string, personalBests: PersonalBest[], history: PersonalBestHistory[]) => void;
  onUpdateGoals?: (swimmerId: string, goals: import("../data/swimmers").SwimmerGoal[]) => void;
  swimmerCompetitions: SwimmerCompetition[];
  competitions: Competition[];
  allSwimmers?: Swimmer[];
  onToggleCompetitionParticipation?: (swimmerId: string, competitionId: string, participates: boolean) => void;
}

export function SwimmerDetailsDialog({
  swimmer,
  open,
  onOpenChange,
  attendanceRecords,
  onDelete,
  onEdit,
  onSavePersonalBests,
  onUpdateGoals,
  swimmerCompetitions,
  competitions,
  allSwimmers = [],
  onToggleCompetitionParticipation
}: SwimmerDetailsDialogProps) {
  if (!swimmer) return null;

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

  const getGenderColor = (gender: string) => {
    if (gender === "Masculino") return "bg-blue-100 text-blue-800";
    if (gender === "Femenino") return "bg-pink-100 text-pink-800";
    return "bg-gray-100 text-gray-800";
  };

  const handleDelete = () => {
    onOpenChange(false);
    if (onDelete) {
      onDelete(swimmer.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white overflow-hidden">
              {swimmer.profileImage ? (
                <img 
                  src={swimmer.profileImage} 
                  alt={swimmer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>{swimmer.name}</span>
                {teamRecordsCount > 0 && (
                  <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 px-3 py-1 rounded-full border border-amber-300">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-bold">{teamRecordsCount} Récord{teamRecordsCount !== 1 ? 's' : ''} del Equipo</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                <Badge className={getScheduleColor(swimmer.schedule)}>
                  {swimmer.schedule}
                </Badge>
                <Badge className={getGenderColor(swimmer.gender)}>
                  {swimmer.gender}
                </Badge>
                <Badge variant="outline">
                  {category}
                </Badge>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Información detallada del nadador {swimmer.name}, incluyendo datos personales, estadísticas de rendimiento y mejores marcas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Banner de Récords si tiene */}
          {teamRecordsCount > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full p-3 shadow-md">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900">
                    ¡Poseedor de {teamRecordsCount} Récord{teamRecordsCount !== 1 ? 's' : ''} del Equipo!
                  </h4>
                  <p className="text-sm text-amber-700">
                    Este nadador tiene las mejores marcas del equipo en {teamRecordsCount} prueba{teamRecordsCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{swimmer.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Fecha de Ingreso</p>
                <p className="font-medium">{swimmer.joinDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Cake className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                <p className="font-medium">{swimmer.dateOfBirth} ({age} años)</p>
              </div>
            </div>

            {swimmer.rut && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">RUT</p>
                  <p className="font-medium">{swimmer.rut}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Users className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Género</p>
                <p className="font-medium">{swimmer.gender}</p>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            {onSavePersonalBests && (
              <PersonalBestsDialog 
                swimmerId={swimmer.id}
                swimmerName={swimmer.name}
                swimmer={swimmer}
                personalBests={swimmer.personalBests || []}
                onSavePersonalBests={onSavePersonalBests}
                allSwimmers={allSwimmers}
              />
            )}

            <ProgressionDialog
              swimmer={swimmer}
            />

            {onUpdateGoals && (
              <GoalsDialog
                swimmer={swimmer}
                onUpdateGoals={onUpdateGoals}
              />
            )}
            
            <PerformanceDialog
              swimmer={swimmer}
              personalBests={swimmer.personalBests || []}
            />

            <SwimmerCompetitionsDialog
              swimmerId={swimmer.id}
              swimmerName={swimmer.name}
              swimmerCompetitions={swimmerCompetitions}
              competitions={competitions}
              onToggleParticipation={(competitionId, participates) => {
                if (onToggleCompetitionParticipation) {
                  onToggleCompetitionParticipation(swimmer.id, competitionId, participates);
                }
              }}
            />

            {onEdit && (
              <EditSwimmerDialog
                swimmer={swimmer}
                onEdit={onEdit}
              />
            )}

            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => generateSwimmerPDF(swimmer, attendanceRecords, teamRecordsCount)}
            >
              <FileDown className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}