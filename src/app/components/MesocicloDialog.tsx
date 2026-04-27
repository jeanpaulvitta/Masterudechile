import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Target, TrendingUp, CalendarDays, Trophy, ChevronRight } from "lucide-react";
import { WorkoutCard } from "./WorkoutCard";
import { ChallengeCard } from "./ChallengeCard";

type SessionType = {
  type: 'workout' | 'challenge';
  mesociclo: string;
  week: number;
  sessionNumber: number;
  date: string;
  day: string;
  distance: number;
  warmUp?: string;
  mainSet?: string;
  coolDown?: string;
  challengeType?: string;
  description?: string;
  focus?: string;
  estimatedTime?: number;
  schedule?: 'AM' | 'PM';
};

interface MesocicloDialogProps {
  mesociclo: {
    name: string;
    weeks: number;
    description: string;
    objective?: string;
    startDate?: string;
    endDate?: string;
    icon: typeof Target;
    color: string;
    bgColor?: string;
    borderColor?: string;
  };
  sessions: SessionType[];
}

export function MesocicloDialog({ mesociclo, sessions }: MesocicloDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const Icon = mesociclo.icon;

  // Mapeo de bloques a rangos de semanas
  const blockRanges = [
    { name: "Base técnica + aeróbica", weekStart: 1, weekEnd: 6 },           // Bloque 1
    { name: "Intensificación + velocidad", weekStart: 7, weekEnd: 13 },      // Bloque 2
    { name: "Potencia + competencia", weekStart: 14, weekEnd: 19 },          // Bloque 3
    { name: "Reacumulación + técnica", weekStart: 20, weekEnd: 24 },         // Bloque 4
    { name: "Intensificación 2", weekStart: 25, weekEnd: 32 },               // Bloque 5
    { name: "Mantenimiento competitivo", weekStart: 33, weekEnd: 38 },       // Bloque 6
    { name: "Taper final", weekStart: 39, weekEnd: 44 },                     // Bloque 7
  ];

  // Encontrar el rango de semanas para este mesociclo
  const currentBlock = blockRanges.find(block => block.name === mesociclo.name);
  
  // Filtrar sesiones por mesociclo (buscar por nombre exacto O por rango de semanas)
  const mesocicloSessions = sessions.filter(s => {
    // Método 1: Por nombre exacto (para entrenamientos antiguos)
    if (s.mesociclo === mesociclo.name) return true;
    
    // Método 2: Por rango de semanas (para entrenamientos nuevos con "Bloque X")
    if (currentBlock && s.week >= currentBlock.weekStart && s.week <= currentBlock.weekEnd) {
      return true;
    }
    
    // Método 3: Buscar si el mesociclo contiene "Bloque X" donde X corresponde al índice
    const blockMatch = s.mesociclo?.match(/Bloque (\d+)/);
    if (blockMatch && currentBlock) {
      const blockNumber = parseInt(blockMatch[1]);
      const blockIndex = blockRanges.findIndex(b => b.name === mesociclo.name);
      if (blockNumber === blockIndex + 1) return true;
    }
    
    return false;
  });
  
  // Agrupar por fecha
  const sessionsByDate: { [key: string]: SessionType[] } = {};
  mesocicloSessions.forEach((session) => {
    const dateKey = session.date; // Usar la fecha como clave
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = [];
    }
    sessionsByDate[dateKey].push(session);
  });

  // Ordenar las sesiones dentro de cada fecha por horario
  Object.keys(sessionsByDate).forEach((dateKey) => {
    sessionsByDate[dateKey].sort((a, b) => {
      // Ordenar por horario (AM antes que PM)
      const scheduleA = (a as any).schedule || 'AM';
      const scheduleB = (b as any).schedule || 'AM';
      if (scheduleA === 'AM' && scheduleB === 'PM') return -1;
      if (scheduleA === 'PM' && scheduleB === 'AM') return 1;
      return 0;
    });
  });

  // Obtener fechas ordenadas
  const sortedDates = Object.keys(sessionsByDate).sort((a, b) => {
    // Parsear fechas en formato "3 de marzo"
    const parseDate = (dateStr: string) => {
      const monthMap: { [key: string]: number } = {
        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
        'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
        'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
      };

      const regex = /(\d+)\s+de\s+(\w+)/i;
      const match = dateStr.match(regex);

      if (match) {
        const day = parseInt(match[1]);
        const monthName = match[2].toLowerCase();
        const month = monthMap[monthName];

        // La temporada va de marzo 2026 a enero 2027
        const year = (month >= 2 && month <= 11) ? 2026 : 2027;
        return new Date(year, month, day);
      }

      return new Date(0);
    };

    return parseDate(a).getTime() - parseDate(b).getTime();
  });

  // Establecer la primera fecha como seleccionada si no hay ninguna
  if (!selectedDate && sortedDates.length > 0) {
    setSelectedDate(sortedDates[0]);
  }

  // Calcular estadísticas
  const totalWorkouts = mesocicloSessions.filter(s => s.type === 'workout').length;
  const totalChallenges = mesocicloSessions.filter(s => s.type === 'challenge').length;
  const totalDistance = mesocicloSessions.reduce((sum, s) => sum + s.distance, 0);
  const totalSessions = totalWorkouts + totalChallenges;
  const avgDistance = totalSessions > 0 ? Math.round(totalDistance / totalSessions) : 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <Card className={`hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] ${mesociclo.bgColor || 'bg-white'} ${mesociclo.borderColor ? `border-2 ${mesociclo.borderColor}` : ''}`}>
            <CardContent className="pt-4 sm:pt-6 pb-3 sm:pb-4">
              <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className={`p-1.5 sm:p-2 rounded-lg ${mesociclo.bgColor || 'bg-gray-50'} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${mesociclo.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-lg mb-0.5 sm:mb-1 truncate">{mesociclo.name}</h3>
                  <p className="text-xs text-gray-600 mb-1 sm:mb-2 line-clamp-2">
                    {mesociclo.description}
                  </p>
                </div>
              </div>
              
              {/* Información adicional */}
              <div className="space-y-1.5 sm:space-y-2 border-t pt-2 sm:pt-3">
                {mesociclo.objective && (
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    <span className="text-xs font-medium text-gray-500 flex-shrink-0">Foco técnico:</span>
                    <span className="text-xs text-gray-700 italic line-clamp-2">{mesociclo.objective}</span>
                  </div>
                )}
                
                {mesociclo.startDate && mesociclo.endDate && (
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-500">Fechas:</span>
                    <span className="text-xs text-gray-700">{mesociclo.startDate} - {mesociclo.endDate}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between gap-2 pt-1 sm:pt-2">
                  <Badge variant="outline" className={`${mesociclo.color} text-xs`}>
                    {mesociclo.weeks} semanas
                  </Badge>
                  <div className="flex items-center gap-1 text-gray-400">
                    <span className="text-xs hidden sm:inline">Ver detalles</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <div className={`p-2 sm:p-3 rounded-lg ${mesociclo.bgColor || 'bg-gray-50'} flex-shrink-0`}>
              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${mesociclo.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl sm:text-2xl font-bold truncate">{mesociclo.name}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">
                {mesociclo.description}
              </DialogDescription>
            </div>
          </div>
          
          {/* Información del bloque */}
          <div className={`${mesociclo.bgColor} border ${mesociclo.borderColor} rounded-lg p-3 sm:p-4 space-y-1.5 sm:space-y-2`}>
            {mesociclo.objective && (
              <div className="flex items-start gap-2">
                <span className="text-sm font-semibold text-gray-700">🎯 Foco técnico:</span>
                <span className="text-sm text-gray-600 italic">{mesociclo.objective}</span>
              </div>
            )}
            
            {mesociclo.startDate && mesociclo.endDate && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">📅 Periodo:</span>
                <span className="text-sm text-gray-600">{mesociclo.startDate} - {mesociclo.endDate}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">⏱️ Duración:</span>
              <span className="text-sm text-gray-600">{mesociclo.weeks} semanas</span>
            </div>
          </div>
        </DialogHeader>

        {/* Estadísticas del mesociclo */}
        <Card className={`${mesociclo.bgColor} border ${mesociclo.borderColor}`}>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">📊 Estadísticas del Bloque</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs text-gray-600">Entrenamientos</p>
                <p className="text-2xl font-bold text-gray-900">{totalWorkouts}</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs text-gray-600">Desafíos</p>
                <p className="text-2xl font-bold text-gray-900">{totalChallenges}</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs text-gray-600">Distancia Total</p>
                <p className="text-2xl font-bold text-gray-900">{(totalDistance / 1000).toFixed(1)} km</p>
              </div>
              <div className="bg-white/80 rounded-lg p-3">
                <p className="text-xs text-gray-600">Promedio/Sesión</p>
                <p className="text-2xl font-bold text-gray-900">{avgDistance}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selector de fechas y vista de entrenamientos */}
        <div className="mt-6 space-y-4">
          {/* Selector de fechas */}
          <div className={`border-2 rounded-lg p-3 sm:p-4 ${mesociclo.bgColor} ${mesociclo.borderColor}`}>
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className={`w-4 h-4 sm:w-5 sm:h-5 ${mesociclo.color}`} />
              <h3 className="text-sm sm:text-base font-bold text-gray-800">Selecciona una fecha</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {sortedDates.map((date) => {
                  const dateSessions = sessionsByDate[date];
                  const hasWorkouts = dateSessions.some(s => s.type === 'workout');
                  const hasChallenges = dateSessions.some(s => s.type === 'challenge');
                  const isSelected = selectedDate === date;
                  const totalSessions = dateSessions.length;

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        relative p-2 sm:p-3 rounded-lg border-2 transition-all text-left
                        ${isSelected
                          ? `${mesociclo.borderColor} bg-white shadow-lg ring-2 ${mesociclo.borderColor}`
                          : 'border-gray-200 bg-white/60 hover:bg-white hover:border-gray-300 hover:shadow-md'}
                      `}
                    >
                      {isSelected && (
                        <div className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full ${mesociclo.bgColor} ${mesociclo.borderColor} border-2 flex items-center justify-center`}>
                          <span className="text-[10px]">✓</span>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">{date}</p>
                        <p className="text-[10px] sm:text-xs text-gray-600">{dateSessions[0]?.day}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {hasWorkouts && (
                            <div className="flex items-center gap-0.5">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-[9px] sm:text-[10px] text-blue-600 font-medium">
                                {dateSessions.filter(s => s.type === 'workout').length}
                              </span>
                            </div>
                          )}
                          {hasChallenges && (
                            <div className="flex items-center gap-0.5">
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full"></div>
                              <span className="text-[9px] sm:text-[10px] text-orange-600 font-medium">
                                {dateSessions.filter(s => s.type === 'challenge').length}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Entrenamientos de la fecha seleccionada */}
          {selectedDate && sessionsByDate[selectedDate] && (
            <div className="space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-gray-900">
                Entrenamientos del {selectedDate}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sessionsByDate[selectedDate].map((session, index) => (
                  <div key={`${selectedDate}-${index}`}>
                    {session.type === 'workout' ? (
                      <WorkoutCard {...session} />
                    ) : (
                      <ChallengeCard {...session} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje si no hay fecha seleccionada */}
          {!selectedDate && sortedDates.length === 0 && (
            <p className="text-center text-gray-500 py-8">No hay entrenamientos en este bloque</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}